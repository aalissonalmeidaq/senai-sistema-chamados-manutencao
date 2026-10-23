# Modelo — Registro de mudança

| Campo | Valor |
| --- | --- |
| ID da mudança | MU-___ |
| Atendimento / ocorrência de origem | AT-___ / OC-___ |
| Solicitante da mudança | |
| Responsável pela execução | |
| Tipo de manutenção | Corretiva / Preventiva / Evolutiva |
| Prioridade | |
| Requisito(s) afetado(s) | (IDs da especificação) |

## 1. Descrição e justificativa

(O que será mudado e por quê. Qual o problema ou necessidade.)

## 2. Diagnóstico (causa raiz)

(Como o problema foi reproduzido, onde está a causa, evidências.)

## 3. Plano da mudança

| Item | Conteúdo |
| --- | --- |
| Método (código, nova migração, dados, configuração, documentação) | |
| Arquivos/componentes afetados | |
| Impacto em outras funcionalidades | |
| Riscos | |
| Testes previstos (reteste + regressão + novo teste automatizado) | |
| Plano de retorno (como desfazer) | |
| Aprovação (quem e quando) | |

## 4. Execução no Git

| Item | Valor |
| --- | --- |
| Branch | `correcao/OC-__-...` ou `melhoria/OC-__-...` |
| Commits (hash curto e mensagem) | |
| Migração nova (se houver) | `supabase/migrations/..._*.sql` |
| Integração na `main` (data, hash) | |
| Versão / tag | |

## 5. Verificação

| Verificação | Resultado | Evidência |
| --- | --- | --- |
| Reteste do problema original | | |
| Novo teste automatizado criado | | |
| `npm run lint` / `typecheck` | | |
| `npm test` | | |
| `npm run db:test` | | |
| `npm run test:integration` | | |
| `npm run test:e2e` | | |
| Casos manuais de regressão | | |

## 6. Encerramento

Situação final: ☐ Implantada ☐ Revertida ☐ Cancelada — Data: ___/___/2026 — Responsável: ______
