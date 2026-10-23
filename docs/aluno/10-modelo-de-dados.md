# 10 — Modelo de dados

O banco é um PostgreSQL gerenciado pelo Supabase. O esquema é criado **somente** pelas migrações em
`supabase/migrations/` (na ordem do nome do arquivo):

| Migração | Conteúdo |
| --- | --- |
| `..._tipos_e_tabelas.sql` | Tipos controlados (listas de valores), tabelas, chaves, restrições e índices. |
| `..._funcoes_e_gatilhos.sql` | Regras de negócio no banco, criação automática de perfil, histórico (auditoria). |
| `..._politicas_rls.sql` | Privilégios e políticas de segurança por linha (RLS). |

## Diagrama entidade-relacionamento

```mermaid
erDiagram
    AUTH_USERS ||--|| PERFIS : "1 usuário = 1 perfil"
    PERFIS ||--o{ CHAMADOS : "abre (solicitante)"
    PERFIS |o--o{ CHAMADOS : "atende (técnico)"
    EQUIPAMENTOS ||--o{ CHAMADOS : "recebe"
    CHAMADOS ||--o{ COMENTARIOS_CHAMADO : "tem"
    PERFIS |o--o{ COMENTARIOS_CHAMADO : "escreve"
    CHAMADOS ||--o{ ORDENS_MANUTENCAO : "gera"
    EQUIPAMENTOS ||--o{ ORDENS_MANUTENCAO : "é mantido por"
    PERFIS ||--o{ ORDENS_MANUTENCAO : "é responsável"
    EQUIPAMENTOS |o--o{ EVENTOS : "histórico"
    CHAMADOS |o--o{ EVENTOS : "histórico"
    ORDENS_MANUTENCAO |o--o{ EVENTOS : "histórico"
    PERFIS |o--o{ EVENTOS : "autor"

    PERFIS {
        uuid id PK "mesmo id do auth.users"
        text nome
        papel_usuario papel "solicitante | tecnico | administrador"
        timestamptz criado_em
        timestamptz atualizado_em
    }
    EQUIPAMENTOS {
        bigint id PK
        text codigo UK "AAA-0000"
        text nome
        categoria_equipamento categoria
        text localizacao
        text descricao
        estado_equipamento estado "disponivel | em_manutencao | inativo"
        uuid criado_por FK
        timestamptz criado_em
        timestamptz atualizado_em
    }
    CHAMADOS {
        bigint id PK "exibido como CH-0001"
        text titulo
        text descricao
        categoria_chamado categoria
        prioridade_chamado prioridade "baixa | media | alta | critica"
        status_chamado status "aberto ... encerrado"
        bigint equipamento_id FK
        uuid solicitante_id FK
        uuid tecnico_id FK "opcional"
        timestamptz criado_em
        timestamptz atualizado_em
        timestamptz resolvido_em
        timestamptz encerrado_em
    }
    COMENTARIOS_CHAMADO {
        bigint id PK
        bigint chamado_id FK
        uuid autor_id FK
        text texto
        boolean interno "true = só equipe"
        timestamptz criado_em
    }
    ORDENS_MANUTENCAO {
        bigint id PK "exibido como OM-0001"
        bigint chamado_id FK
        bigint equipamento_id FK "sempre o do chamado"
        tipo_manutencao tipo "corretiva | preventiva | evolutiva"
        status_ordem status "planejada | em_execucao | concluida | cancelada"
        uuid responsavel_id FK
        text diagnostico
        text plano_acao
        text atividades_executadas
        resultado_ordem resultado "resolvido | parcial | nao_resolvido"
        timestamptz iniciada_em
        timestamptz concluida_em
        timestamptz criado_em
        timestamptz atualizado_em
    }
    EVENTOS {
        bigint id PK
        timestamptz criado_em
        uuid autor_id FK
        text tipo "ex.: chamado_status"
        text descricao
        jsonb dados "de/para, observação..."
        bigint equipamento_id FK
        bigint chamado_id FK
        bigint ordem_id FK
        boolean visivel_solicitante
    }
```

## Em linguagem simples

- **perfis** — cada pessoa cadastrada no Supabase Auth ganha automaticamente um perfil com **nome** e
  **papel** (começa como solicitante). O e-mail e a senha ficam só na área de autenticação (`auth.users`),
  separados dos dados da aplicação.
- **equipamentos** — o que a manutenção atende. O **código** é único. O **estado** diz se está disponível,
  em manutenção ou inativo.
- **chamados** — um pedido de atendimento sobre **um** equipamento, aberto por **um** solicitante e, depois
  da triagem, atendido por **um** técnico. O **status** só muda por transições permitidas.
- **comentarios_chamado** — conversa do chamado. Comentários **internos** só a equipe vê.
- **ordens_manutencao** — o serviço técnico executado para resolver um chamado. Um chamado pode ter várias
  ordens ao longo do tempo, mas **só uma ativa** por vez. Ordem concluída nunca apaga o chamado.
- **eventos** — o **histórico**: cada ação relevante vira uma linha com data, autor e descrição. É gravado
  por gatilhos do banco e ninguém pode alterá-lo pela aplicação.

## Restrições importantes

| Restrição | Onde | Garante |
| --- | --- | --- |
| `equipamentos_codigo_unico` / `equipamentos_codigo_formato` | equipamentos | Código único no formato `AAA-0000`. |
| `chamados_tecnico_obrigatorio` | chamados | Em atendimento, aguardando ou resolvido exige técnico. |
| `chamados_descricao_preenchida` | chamados | Descrição não pode ficar vazia. |
| `ordens_uma_ativa_por_chamado` (índice único parcial) | ordens | No máximo uma ordem planejada/em execução por chamado. |
| `ordens_conclusao_completa` | ordens | Ordem concluída tem diagnóstico, atividades, resultado e datas. |
| Chaves estrangeiras `ON DELETE RESTRICT` | chamados, ordens | Equipamento com chamados não pode ser excluído. |

## Regras no banco (gatilhos e funções)

| Função | Papel |
| --- | --- |
| `criar_perfil_novo_usuario` | Cria o perfil ao cadastrar; papel sempre `solicitante`. |
| `transicao_chamado_permitida` / `transicao_ordem_permitida` | Tabela de transições de status (RN-CH-01, RN-OM-01). |
| `validar_alteracao_chamado` / `validar_alteracao_ordem` | Aplicam as regras de status, campos imutáveis e permissões. |
| `alterar_status_chamado` / `alterar_status_ordem` | Mudança de status com observação (usadas pela aplicação). |
| `definir_papel` | Única forma de mudar papéis (só administrador; protege o último administrador). |
| `registrar_evento_*` | Gravam o histórico automaticamente. |
| `verificar_conexao` | Teste de fumaça (não lê tabelas). |

## Segurança por linha (RLS)

O RLS está **ativo em todas as tabelas**. Mesmo que alguém use a API do Supabase diretamente (sem passar
pelas telas), o banco só devolve e só aceita o que o papel permite:

| Tabela | Ler | Inserir | Alterar | Excluir |
| --- | --- | --- | --- | --- |
| perfis | todos autenticados | — (gatilho) | o próprio nome | — |
| equipamentos | todos autenticados | equipe | equipe | administrador |
| chamados | solicitante: os seus; equipe: todos | em nome próprio | equipe; solicitante só no próprio resolvido | — |
| comentarios_chamado | equipe: todos; solicitante: públicos dos seus | equipe; solicitante: públicos nos seus | — | — |
| ordens_manutencao | equipe; solicitante: as dos seus chamados | equipe | equipe | — |
| eventos | equipe: todos; solicitante: visíveis dos seus | — (gatilhos) | — | — |

"—" significa **negado para todos os usuários da aplicação**. Visitantes sem login não acessam nenhuma tabela.
