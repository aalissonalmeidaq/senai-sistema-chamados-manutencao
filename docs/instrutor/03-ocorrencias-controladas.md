# 03 — Ocorrências controladas: distribuição e restauração

> **RESERVADO AO INSTRUTOR** — não distribuir aos estudantes.

Três ocorrências para a SA 3, entregues **uma por vez**. Os defeitos ficam **isolados em branches** e nunca
na `main`. Os estudantes recebem a versão do código pelo **pacote exportado** (sem histórico Git), então não
conseguem ver o diff do defeito.

| ID | Tipo | Branch entregue | Enunciado | Solução de referência |
| --- | --- | --- | --- | --- |
| OC-01 | Corretiva — validação/fluxo de chamado | `ocorrencia/OC-01-descricao-chamado` | [enunciados/OC-01.md](ocorrencias/enunciados/OC-01.md) | [OC-01-solucao.md](ocorrencias/OC-01-solucao.md) · branch `referencia/OC-01-correcao` |
| OC-02 | Corretiva — transição/integridade de ordem | `ocorrencia/OC-02-conclusao-ordem` | [enunciados/OC-02.md](ocorrencias/enunciados/OC-02.md) | [OC-02-solucao.md](ocorrencias/OC-02-solucao.md) · branch `referencia/OC-02-correcao` |
| OC-03 | Evolutiva — relatório/interface | `main` (sem defeito) | [enunciados/OC-03.md](ocorrencias/enunciados/OC-03.md) | [OC-03-solucao.md](ocorrencias/OC-03-solucao.md) · branch `referencia/OC-03-exportacao-csv` |

Patches para consulta: [ocorrencias/patches/](ocorrencias/patches/) (`*-defeito.patch` = o que foi inserido;
`*-correcao.patch`/`*-referencia.patch` = solução).

## Sugestão de uso nos encontros

| Encontro | Ocorrência | Foco |
| --- | --- | --- |
| 13 (02/11) | OC-01 | Atendimento, triagem, reprodução, diagnóstico, plano (AA1). |
| 14 (03/11) | OC-02 | Mudança controlada com **nova migração**, reteste, regressão (AA2 / prática). |
| 14–15 | OC-03 | Manutenção evolutiva, comunicação e encerramento; base para a demonstração integrada. |

Equipes mais rápidas podem receber a ocorrência seguinte; equipes com dificuldade podem fazer só OC-01 e OC-03.

## Como entregar uma ocorrência

1. Gere o pacote da branch da ocorrência (no repositório do instrutor):

   ```bash
   npm run student:export -- --ref ocorrencia/OC-01-descricao-chamado --nome sistema-chamados-oc01 --substituir
   ```

2. Entregue a pasta gerada em `dist-aluno/sistema-chamados-oc01` (zip ou repositório privado da equipe —
   ver [01](01-preparacao-ambiente-e-repositorio.md#4-disponibilização-do-código-aos-estudantes)).
3. Entregue o **enunciado** correspondente (copie o texto de `ocorrencias/enunciados/OC-0X.md`).
4. Os estudantes instalam como de costume (`npm ci`, `npm run setup:local`, `npm run db:reset`).
   Atenção: o Supabase local é identificado pelo `project_id` do `config.toml`; uma nova pasta do mesmo
   projeto reaproveita os mesmos contêineres. Oriente a rodar `npm run db:reset` na pasta nova (as migrações
   da OC-02 são diferentes das da `main`).

Para a **OC-03**, entregue o pacote da `main` (ou a equipe continua no próprio repositório) e o enunciado.

## Como restaurar o estado inicial

| Situação | Ação |
| --- | --- |
| Equipe "estragou" o banco local | `npm run db:reset` na pasta do projeto. |
| Equipe precisa recomeçar a ocorrência | Entregar de novo o pacote exportado (ou `git switch main && git reset --hard <commit-inicial>` no repositório da equipe, se combinado). |
| Encerrar a SA 3 e voltar à versão estável | Entregar o pacote da `main` e rodar `npm run db:reset`. |
| Laboratório compartilhado entre turmas | Em cada máquina: `npm run db:stop`, apagar a pasta do projeto; se necessário `npx supabase stop --no-backup` (apaga o banco local). |

## Critérios de encerramento (todas as ocorrências)

- Registro de atendimento completo (triagem, reprodução, diagnóstico, comunicação, encerramento).
- Registro de mudança com plano, execução no Git, reteste e regressão.
- Teste automatizado novo que **falha antes** e **passa depois** da correção (OC-01, OC-02) ou que cobre a
  funcionalidade nova (OC-03).
- Todas as suítes passando (`lint`, `typecheck`, `test`, `db:test`, `test:integration`, `test:e2e`).
