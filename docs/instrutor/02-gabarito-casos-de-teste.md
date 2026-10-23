# 02 — Gabarito: dados iniciais, casos de referência e resultados esperados

> **RESERVADO AO INSTRUTOR** — não distribuir aos estudantes.

Resultados esperados para a versão **estável (`main`)**, logo após `npm run db:reset`. Os números foram
conferidos por consulta ao banco na preparação (ver [07 — Registro de validação](07-registro-de-validacao.md)).
Use como referência para corrigir casos de teste e relatórios da SA 1; casos dos estudantes podem ser
diferentes e igualmente corretos.

## 1. Dados iniciais (seed)

### Chamados

| Código | Título | Status | Prioridade | Solicitante | Técnico | Equip. |
| --- | --- | --- | --- | --- | --- | --- |
| CH-0001 | Computador não liga | Encerrado | Alta | Daniela Souza | Bianca Lopes | INF-0001 |
| CH-0002 | Ar-condicionado pingando água | Em atendimento | Alta | Daniela Souza | Bianca Lopes | CLI-0001 |
| CH-0003 | Osciloscópio sem sinal no canal 2 | Em atendimento (reaberto) | Média | Daniela Souza | Caio Ferreira | LAB-0001 |
| CH-0004 | Rede lenta no laboratório 1 | Aberto | Média | Daniela Souza | — | INF-0004 |
| CH-0005 | Projetor com imagem amarelada | Resolvido | Média | Eduardo Lima | Bianca Lopes | INF-0002 |
| CH-0006 | Disjuntor desarmando na sala 12 | Em atendimento | Crítica | Eduardo Lima | Caio Ferreira | ELE-0001 |
| CH-0007 | Nobreak apitando | Encerrado | Média | Eduardo Lima | Caio Ferreira | ELE-0002 |
| CH-0008 | Controle remoto extra para o auditório | Aberto | Baixa | Eduardo Lima | — | CLI-0002 |
| CH-0009 | Cabo HDMI com mau contato | Encerrado | Baixa | Eduardo Lima | Caio Ferreira | INF-0002 |
| CH-0010 | Teclado com teclas falhando | Aberto | Baixa | Eduardo Lima | — | INF-0001 |
| CH-0011 | Impressora atolando papel | Aguardando | Média | Fernanda Rocha | Bianca Lopes | INF-0003 |
| CH-0012 | Ruído anormal no torno | Em triagem | Alta | Fernanda Rocha | — | MEC-0001 |
| CH-0013 | Cadeira com rodízio quebrado | Encerrado (sem atendimento) | Baixa | Fernanda Rocha | — | MOB-0001 |
| CH-0014 | Preventiva semestral da furadeira | Em atendimento | Baixa | Caio Ferreira | Caio Ferreira | MEC-0002 |

### Ordens

| Ordem | Chamado | Tipo | Status | Resultado | Equip. |
| --- | --- | --- | --- | --- | --- |
| OM-0001 | CH-0001 | Corretiva | Concluída | Resolvido | INF-0001 |
| OM-0002 | CH-0005 | Corretiva | Concluída | Resolvido | INF-0002 |
| OM-0003 | CH-0002 | Corretiva | Em execução | — | CLI-0001 |
| OM-0004 | CH-0011 | Corretiva | Planejada | — | INF-0003 |
| OM-0005 | CH-0006 | Corretiva | Planejada | — | ELE-0001 |
| OM-0006 | CH-0007 | Corretiva | Concluída | Resolvido | ELE-0002 |
| OM-0007 | CH-0003 | Corretiva | Concluída | Parcial | LAB-0001 |
| OM-0008 | CH-0009 | Corretiva | Cancelada | — | INF-0002 |
| OM-0009 | CH-0014 | Preventiva | Em execução | — | MEC-0002 |
| OM-0010 | CH-0003 | Corretiva | Planejada | — | LAB-0001 |

Totais: 13 equipamentos (LAB-0002 inativo; CLI-0001 e MEC-0002 em manutenção), 14 chamados
(aberto 3, em triagem 1, em atendimento 4, aguardando 1, resolvido 1, encerrado 4), 10 ordens,
3 comentários (1 interno, em CH-0002), 107 eventos.

## 2. Casos de referência

Pré-condição comum: `npm run db:reset`; senha `Senha@123`. "Técnico" = `tecnico1@example.com`.

### Autenticação e acesso

| ID | Requisito | Passos resumidos | Resultado esperado |
| --- | --- | --- | --- |
| G-01 | RF-02 | Entrar com cada usuário do seed | Painel "Olá, <nome>"; cabeçalho mostra nome e papel. Menus: solicitante (Painel, Chamados, Equipamentos); técnico (+ Ordens); admin (+ Usuários). |
| G-02 | RF-02 | Senha errada | "E-mail ou senha incorretos." |
| G-03 | RN-AC-04 | Sem login, abrir `/chamados` | Redireciona para `/entrar?proximo=%2Fchamados`; após login volta a `/chamados`. |
| G-04 | RF-01 | Cadastro com senhas diferentes | "As senhas não conferem." no campo de confirmação. |
| G-05 | RF-01 | Cadastro com senha de 7 caracteres | "A senha deve ter pelo menos 8 caracteres." |
| G-06 | RF-01, RN-AC-03 | Cadastro válido; tentar entrar antes de confirmar; confirmar no Mailpit | Tela "Confirme seu e-mail"; login recusado com "E-mail ainda não confirmado..."; o link leva ao painel com papel Solicitante. |
| G-07 | RN-AC-02 | Solicitante abre `/usuarios` ou `/ordens` | Volta ao painel com "Você não tem permissão para acessar aquela página." |
| G-08 | RN-AC-01 | `solicitante2` abre `/chamados/1` (de Daniela) | "Página não encontrada". |

### Equipamentos

| ID | Requisito | Passos resumidos | Resultado esperado |
| --- | --- | --- | --- |
| G-10 | RF-04 | Buscar "INF" | 4 resultados: INF-0001 a INF-0004. |
| G-11 | RF-04 | Buscar "laboratório" | 4 resultados: ELE-0002, INF-0001, LAB-0001, LAB-0002 (busca em código, nome e localização). |
| G-12 | RF-04 | Filtro estado Inativo | 1 resultado: LAB-0002. |
| G-13 | RN-EQ-01 | Cadastrar com código `inf-0099` | Salvo como **INF-0099**; mensagem "Equipamento cadastrado com sucesso."; histórico "Equipamento INF-0099 cadastrado". |
| G-14 | RN-EQ-01 | Código `INF-0001` | "Já existe um equipamento com este código." |
| G-15 | RN-EQ-01 | Código `INF99` | "Use o formato AAA-0000, por exemplo INF-0001." |
| G-16 | RN-EQ-02 | Nome com 2 caracteres | "Informe o nome (mínimo 3 caracteres)." |
| G-17 | RN-EQ-04 | Admin exclui INF-0001 | "Este equipamento tem chamados registrados e não pode ser excluído. Altere o estado para Inativo." |
| G-18 | RN-EQ-03 | Abrir chamado: lista de equipamentos | LAB-0002 **não** aparece. |

### Chamados

| ID | Requisito | Passos resumidos | Resultado esperado |
| --- | --- | --- | --- |
| G-20 | RN-CH-02 | Enviar formulário vazio | "Corrija os campos destacados." + "Selecione o equipamento.", "Informe um título com pelo menos 5 caracteres.", "Descreva o problema com pelo menos 10 caracteres.", "Selecione a categoria." |
| G-21 | RN-CH-02 | Título com 4 / 5 / 120 / 121 caracteres | 4 e 121 rejeitados; 5 e 120 aceitos. |
| G-22 | RN-CH-02 | Descrição só com espaços; descrição "    abc    " | Ambas rejeitadas com "Descreva o problema com pelo menos 10 caracteres." (é a regra afetada na OC-01). |
| G-23 | RF-08 | Abrir chamado válido | Status Aberto, sem técnico, solicitante = usuário logado; histórico "Chamado aberto com prioridade ...". |
| G-24 | RF-09, RN-AC-01 | Lista de cada solicitante | Daniela: 4 (CH-0001 a 0004); Eduardo: 6; Fernanda: 3. |
| G-25 | RF-09 | Técnico filtra status Aguardando / prioridade Crítica / equipamento INF-0002 | CH-0011 / CH-0006 / CH-0005 e CH-0009. |
| G-26 | RF-09 | Período 01/01/2000 a 02/01/2000 | "Nenhum chamado corresponde aos filtros." |
| G-27 | RN-CH-01 | Técnico em CH-0004 (Aberto) | Única ação: "Iniciar triagem". |
| G-28 | RN-CH-04 | CH-0012 → Iniciar atendimento (sem técnico) | "Atribua um técnico antes de iniciar o atendimento." |
| G-29 | RN-CH-03 | CH-0012 → Encerrar sem atendimento sem observação | "Informe uma observação para mudar o status para Encerrado." |
| G-30 | RN-CH-05 | CH-0002 → Marcar como resolvido (com observação) | "Conclua ou cancele a ordem de manutenção ativa antes de resolver o chamado." |
| G-31 | RN-CH-08 | Eduardo em CH-0005 (Resolvido) | Ações: confirmar ou reabrir; reabrir sem observação é recusado; confirmar leva a "Chamado encerrado. O histórico continua disponível para consulta." |
| G-32 | RN-CH-06 | CH-0001 (Encerrado) | Sem "Mudar status" e sem triagem; "Chamado encerrado: não aceita novos comentários." |
| G-33 | RF-12, RN-AC-01 | Técnico comenta em CH-0004 como interno e depois como público | Daniela vê apenas o público; o interno aparece para a equipe com "[Interno — só equipe]". |
| G-34 | RN-CH-04 | Triagem de CH-0002 com técnico "Não atribuído" | "Um chamado em atendimento precisa de técnico responsável. Escolha um técnico." |
| G-35 | RN-AU-01 | Ver histórico de CH-0003 | 11 eventos em ordem, incluindo reabertura com a observação da solicitante. |

### Ordens

| ID | Requisito | Passos resumidos | Resultado esperado |
| --- | --- | --- | --- |
| G-40 | RN-OM-02 | Criar ordem em CH-0012 (Em triagem) | Ordem criada Planejada, equipamento MEC-0001; o botão some do chamado (já há ordem ativa). |
| G-41 | RN-OM-02 | Abrir `/ordens/nova?chamado=4` (Aberto) | Aviso: chamado não aceita nova ordem agora. |
| G-42 | RN-OM-01 | OM-0004 (Planejada) | Ações: "Iniciar execução" e "Cancelar ordem". **Não** existe "Concluir" (regra afetada na OC-02). |
| G-43 | RN-OM-04 | OM-0005 → Iniciar execução | ELE-0001 passa a "Em manutenção"; histórico do equipamento: "Estado alterado de Disponível para Em manutenção (início da ordem OM-0005)". |
| G-44 | RN-OM-03 | Concluir OM-0005 sem atividades/resultado | Aviso de pendências e "Registre as atividades executadas antes de concluir a ordem." |
| G-45 | RN-OM-03/04 | Preencher registro e concluir OM-0005 | "Ordem concluída. O registro foi preservado..."; datas de início e conclusão; tempo de execução calculado; ELE-0001 volta a Disponível. |
| G-46 | RN-OM-06 | Abrir ordem concluída | Sem formulários; alerta de registro preservado. |
| G-47 | RN-OM-05 | Cancelar ordem sem motivo | "Informe o motivo do cancelamento da ordem." |

### Usuários, painel e não funcionais

| ID | Requisito | Passos resumidos | Resultado esperado |
| --- | --- | --- | --- |
| G-50 | RF-03 | Admin muda Fernanda para Técnico | "Papel alterado para Técnico."; ao entrar, Fernanda vê o menu Ordens. |
| G-51 | RN-AC-03 | Admin (único) muda o próprio papel para Solicitante | "Não é possível remover o último administrador do sistema." |
| G-52 | RF-18 | Painel do técnico | 13 equipamentos, 9 chamados em andamento, 5 ordens em andamento, 2 em execução; por status 3/1/4/1/1/4; em andamento por prioridade: baixa 3, média 3, alta 2, crítica 1; equipamentos 11/2/1. |
| G-53 | RF-18 | Painel de Daniela | 3 chamados em andamento, 2 ordens em andamento, 1 em execução. |
| G-54 | RF-19 | `/api/saude` | HTTP 200 com `"banco":"ok"`. |
| G-55 | RNF-02 | Navegar só com teclado | 1º `Tab` mostra "Pular para o conteúdo"; foco visível; selos com texto e ícone. |
| G-56 | RNF-03 | Largura 390 px | Menu quebra em linhas; tabelas rolam dentro do quadro; formulários em coluna única. |

## 3. Suítes automatizadas (referência da `main`)

| Suíte | Resultado na preparação |
| --- | --- |
| `npm run db:test` | 4 arquivos, 74 testes — `Result: PASS` (73 na tag `v1.0-base`) |
| `npm test` | 6 arquivos, 63 testes — todos passaram (58 na `v1.0-base`) |
| `npm run test:integration` | 2 arquivos, 11 testes — todos passaram |
| `npm run test:e2e` | 10 testes — todos passaram (9 na `v1.0-base`) |

## 4. Achados possíveis na versão estável

Comportamentos **reais** da `main` que estudantes atentos podem registrar. Não são defeitos plantados;
avalie a classificação e a justificativa (muitos são melhorias ou decisões de escopo):

| # | Achado | Classificação sugerida |
| --- | --- | --- |
| A1 | Lista de chamados exibe no máximo 100 registros, sem paginação (há aviso na tela). | Melhoria (baixa) |
| A2 | Não existe "esqueci minha senha". | Fora do escopo do MVP / melhoria |
| A3 | Não há tela para o usuário alterar o próprio nome (a regra no banco permite). | Melhoria (baixa) |
| A4 | A equipe pode mudar manualmente o estado do equipamento para "Disponível" mesmo com ordem em execução. | Risco de consistência (média) — boa discussão de regra de negócio |
| A5 | O solicitante não consegue desistir do próprio chamado ainda Aberto. | Decisão de projeto / sugestão |
| A6 | Comentários não podem ser editados nem excluídos. | Decisão de projeto (auditoria) |
| A7 | O link de confirmação só funciona se a aplicação for acessada por `localhost` (não por `127.0.0.1`). | Limitação documentada de ambiente |
| A8 | Ao tentar excluir equipamento sem chamados mas com histórico, a exclusão é permitida e apaga o histórico do equipamento. | Discussão de auditoria (média) |

Se surgir um achado que não está aqui, reproduza-o: pode ser um defeito real a ser corrigido na `main`.
