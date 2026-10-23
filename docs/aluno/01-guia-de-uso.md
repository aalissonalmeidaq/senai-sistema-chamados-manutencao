# 01 — Guia de uso da aplicação

Como usar cada tela do sistema. As regras citadas (ex.: `RN-CH-03`) estão na
[Especificação de requisitos](00-especificacao-de-requisitos.md).

## Menu e papéis

Depois de entrar, o cabeçalho mostra o menu, seu nome, seu papel e o botão **Sair**.

| Menu | Solicitante | Técnico | Administrador |
| --- | :---: | :---: | :---: |
| Painel | ✔ | ✔ | ✔ |
| Chamados | ✔ (só os seus) | ✔ (todos) | ✔ (todos) |
| Equipamentos | ✔ (consulta) | ✔ (consulta, cadastro, edição) | ✔ (+ exclusão) |
| Ordens | — | ✔ | ✔ |
| Usuários | — | — | ✔ |

Se você tentar abrir uma tela sem permissão, volta ao painel com o aviso
"Você não tem permissão para acessar aquela página."

## Painel

Mostra totais: equipamentos cadastrados, chamados em andamento, ordens em andamento e em execução;
chamados por status e por prioridade; equipamentos por estado; e os chamados em andamento mais recentes.
Clique em um status para abrir a lista de chamados já filtrada. Para o solicitante, os números
consideram apenas os chamados dele.

## Equipamentos

- **Lista**: busca por código, nome ou localização; filtros por categoria e estado; contador de resultados.
- **Cadastrar** (equipe): código `AAA-0000` (ex.: `INF-0012`), nome, categoria, localização, descrição
  e estado operacional. Campos com `*` são obrigatórios. Código repetido mostra
  "Já existe um equipamento com este código."
- **Detalhes**: dados, chamados do equipamento e **histórico** (cadastro, alterações, mudanças de estado).
  Botões **Abrir chamado** (se não estiver inativo) e **Editar** (equipe).
- **Excluir** (administrador): só para equipamento sem chamados. Para retirar de uso, prefira o estado **Inativo**.

| Estado | Significado |
| --- | --- |
| ● Disponível | Em uso normal. |
| ⚙ Em manutenção | Há ordem de manutenção em execução (muda automaticamente, RN-OM-04). |
| × Inativo | Retirado de uso; não aceita novos chamados. |

## Chamados

### Abrir um chamado

1. **Chamados → Abrir chamado** (ou **Abrir chamado** na página do equipamento).
2. Escolha o equipamento (só aparecem os que não estão inativos).
3. Preencha título, descrição (mínimo de 10 caracteres sem contar espaços), categoria e prioridade sugerida.
4. **Abrir chamado**. Você vai para a página do chamado com a mensagem de sucesso. O código aparece
   como `CH-0015`.

Se algum campo estiver errado, a mensagem "Corrija os campos destacados." aparece e cada campo mostra o
problema. O que você digitou é mantido.

### Lista e filtros

Filtre por **status**, **prioridade**, **equipamento** e **período de abertura** (de/até, datas
inclusivas). **Limpar filtros** volta à lista completa. A lista mostra até 100 chamados (os mais recentes).

### Página do chamado

| Bloco | O que faz | Quem vê |
| --- | --- | --- |
| Detalhes | Equipamento, categoria, solicitante, técnico, datas, descrição. | Todos com acesso ao chamado |
| Mudar status | Lista só as ações possíveis no status atual. Observação obrigatória em alguns casos (RN-CH-03). | Equipe; solicitante quando o chamado está Resolvido |
| Triagem | Prioridade, categoria e técnico responsável. | Equipe, com chamado em andamento |
| Ordens de manutenção | Ordens do chamado e seus status. **Criar ordem de manutenção** quando permitido. | Todos (link para a ordem só para a equipe) |
| Comentários | Lista e envio. Equipe escolhe se o comentário é **interno** (padrão). | Solicitante vê e envia só comentários públicos |
| Histórico | Linha do tempo com data, hora e autor de cada ação. | Solicitante não vê eventos internos |

### Estados do chamado

| Status | Significado | Próximos passos possíveis |
| --- | --- | --- |
| ○ Aberto | Registrado, aguardando a equipe. | Iniciar triagem |
| ◔ Em triagem | Equipe analisando prioridade, categoria e responsável. | Iniciar atendimento; Encerrar sem atendimento* |
| ◑ Em atendimento | Técnico trabalhando no problema. | Colocar em espera*; Marcar como resolvido* |
| ⏸ Aguardando | Parado por dependência (peça, informação, acesso). | Retomar atendimento |
| ✓ Resolvido | Equipe concluiu; aguarda confirmação do solicitante. | Confirmar e encerrar; Reabrir* |
| ■ Encerrado | Finalizado. Não aceita alterações nem comentários. | — |

`*` exige observação. Fluxo típico: **Aberto → Em triagem → (atribuir técnico) → Em atendimento →
(ordem executada e concluída) → Resolvido → Encerrado**.

## Ordens de manutenção (equipe)

### Criar

Na página do chamado (Em triagem, Em atendimento ou Aguardando, sem outra ordem ativa), clique em
**Criar ordem de manutenção**. Informe:

- **Tipo**: Corretiva, Preventiva ou Evolutiva;
- **Responsável** (técnico ou administrador; vem preenchido com o técnico do chamado);
- **Diagnóstico inicial** e **Plano de ação** (opcionais na criação).

A ordem recebe um código `OM-0011` e fica **Planejada**.

### Executar e concluir

1. **Iniciar execução** → status **Em execução**; a data de início é registrada e o equipamento passa
   para **Em manutenção**.
2. Em **Registro da manutenção**, preencha diagnóstico, atividades executadas (inclua o reteste feito) e
   resultado. Clique em **Salvar registro**.
3. **Concluir ordem**. Se faltar algo, a tela avisa o que preencher. Ao concluir, o equipamento volta a
   **Disponível** (se não houver outra ordem em execução nele).
4. Volte ao chamado e **Marcar como resolvido** com a observação da solução.

Para **cancelar** uma ordem, informe o motivo. Ordens concluídas ou canceladas ficam só para consulta.

| Status da ordem | Significado |
| --- | --- |
| ○ Planejada | Criada, ainda não iniciada. |
| ⚙ Em execução | Serviço em andamento. |
| ✓ Concluída | Serviço finalizado com registro completo. |
| × Cancelada | Interrompida com motivo registrado. |

## Usuários (administrador)

Lista todos os perfis com o papel atual. Escolha o novo papel e **Salvar papel**. O sistema impede remover
o último administrador.

## Mensagens que você vai ver

| Situação | Exemplo |
| --- | --- |
| Carregando | "Carregando dados..." |
| Lista vazia | "Nenhum chamado corresponde aos filtros." |
| Erro de validação | "Corrija os campos destacados." + mensagem em cada campo |
| Regra de negócio | "Atribua um técnico antes de iniciar o atendimento." |
| Sucesso | "Chamado aberto com sucesso. Acompanhe o andamento por esta página." |
| Falha de página | "Algo deu errado" com botão **Tentar novamente** |
