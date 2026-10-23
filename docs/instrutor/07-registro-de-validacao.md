# 07 — Registro de validação da preparação

> **RESERVADO AO INSTRUTOR** — não distribuir aos estudantes.

Validação executada em **23/10/2026**, em Windows 11 Pro, com Docker Desktop. Resultados **reais** dos
comandos executados; nada foi estimado.

## Ambiente e versões

| Item | Versão |
| --- | --- |
| Node.js / npm | 24.21.0 / 12.1.0 |
| Git | 2.55.0 |
| Docker | 29.7.2 |
| Supabase CLI (dependência do projeto) | 2.122.0 |
| PostgreSQL (imagem local do Supabase) | 17.11 |
| Next.js / React | 16.4.3 / 19.3.0 (versões instaladas pelo `create-next-app@16.4.3`) |
| TypeScript / Tailwind CSS / ESLint | 5.9.3 / 4.3.3 / 9.39.5 |
| @supabase/ssr / @supabase/supabase-js / Zod | 0.12.7 / 2.118.0 / 4.6.7 |
| Vitest / Playwright | 5.0.5 / 1.64.1 |

Todas as versões estão fixadas no `package.json` e no `package-lock.json`.

## Repositório do instrutor (`main`)

| Comando | Resultado |
| --- | --- |
| `npx supabase db reset` | 3 migrações + seed aplicados sem erro. |
| `npm run db:test` | 4 arquivos, 73 testes pgTAP — `Result: PASS`. |
| `npm run lint` | Sem erros nem avisos. |
| `npm run typecheck` | Sem erros. |
| `npm test` | 5 arquivos, 58 testes — todos passaram. |
| `npm run test:integration` | 2 arquivos, 11 testes — todos passaram. |
| `npm run test:e2e` (servidor de desenvolvimento) | 9 testes — todos passaram. |
| `npm run build` + `CI=true npm run test:e2e` (build de produção, como na CI) | 9 testes — todos passaram. |
| `npm run build` sem `.env.local` | Build concluído (variáveis só são exigidas em tempo de execução). |
| `npm run setup:local` (2ª execução) | Idempotente: "já estava em execução", "Migrações conferidas", ".env.local já está correto". |
| Backup/restauração (`db dump --local --data-only` → `db reset --no-seed` → `docker cp` + `psql -f`) | Restaurados 14 chamados, 107 eventos e 6 usuários; acentos preservados; testado no PowerShell e no Git Bash; `db:test` passou após a restauração. |

### Casos do gabarito verificados no navegador

Executados por roteiro automatizado (Playwright) contra a `main` com banco recém-criado:
G-03, G-11, G-17, G-21, G-30, G-31, G-33, G-34, G-40, G-41, G-42, G-43, G-44, G-45, G-47, G-50, G-51,
G-53 e G-55 — **todos com o resultado descrito no gabarito**. (G-50 foi conferido em execução separada
porque a primeira versão do roteiro procurava a mensagem de sucesso com o papel ARIA errado; a aplicação
estava correta.) Os demais casos são cobertos pelas suítes automatizadas ou foram observados durante o
desenvolvimento.

## Pacote do estudante

| Verificação | Resultado |
| --- | --- |
| `npm run student:export` | 115 arquivos incluídos; 20 não incluídos (todo `docs/instrutor/`, `STATUS_IMPLEMENTACAO.md`, `scripts/exportar-aluno.mjs`); `docs/` só com `aluno/`; repositório novo com 1 commit; script `student:export` removido do `package.json`. |
| Tentativa de vazamento por caminho (`docs/aluno/gabarito-sa1.md`) | Exportação **falhou** como esperado; nenhum pacote gravado. |
| Tentativa de vazamento por conteúdo ("RESERVADO AO INSTRUTOR" em `docs/aluno/notas.md`) | Exportação **falhou**; pacote removido. |
| Tentativa de vazamento de segredo (`sb_secret_...` em `lib/chave.ts`) | Exportação **falhou**; pacote removido. |
| Fluxo completo do estudante na pasta exportada | `npm ci` (126 s) → `npm run setup:local` (criou `.env.local`) → `npm run db:reset` → `lint` → `typecheck` → `npm test` (58) → `db:test` (PASS) → `test:integration` (11) → `build` → `test:e2e` (9) — **todos com código 0**; `git status` limpo (`.env.local` ignorado). |

Observação: a máquina de preparação já tinha as imagens Docker baixadas, então o tempo do primeiro
`supabase start` em uma máquina nova (download de ~3 GB) **não** foi medido.

## Ocorrências controladas

| Branch | Verificação | Resultado |
| --- | --- | --- |
| `ocorrencia/OC-01-descricao-chamado` | Suítes completas | Todas passaram (defeito escapa dos testes, como pretendido). |
| | Reprodução no navegador | Cenário A: mensagem genérica + erro 23514 no terminal. Cenário B: chamado aceito com descrição "abc". |
| `referencia/OC-01-correcao` | Teste de regressão antes/depois | Antes: 3 falharam. Depois: todos passaram (unit 59, pgTAP PASS, integração 11, E2E 9). |
| `ocorrencia/OC-02-conclusao-ordem` | Suítes completas | Todas passaram. |
| | Reprodução | OM-0004 concluída a partir de Planejada; `iniciada_em` nulo; equipamento nunca "Em manutenção". |
| `referencia/OC-02-correcao` | Regressão antes/depois | Antes: unitário e pgTAP falharam. Depois: unit 58, pgTAP PASS, integração 11, E2E 9. |
| | Migração sobre banco com dado inconsistente | `migration up` aplicou; linha antiga preservada; restrição `NOT VALID`; nova conclusão sem execução recusada; `VALIDATE CONSTRAINT` falharia (confirmado). |
| `referencia/OC-03-exportacao-csv` | Suítes | Lint/tipos sem erros; unit 62; E2E 10 (inclui download CSV e restrição por papel). |

## Problemas encontrados e corrigidos durante a preparação

| Problema | Correção |
| --- | --- |
| Portas padrão 543xx ocupadas por outro projeto Supabase da máquina. | Projeto usa a faixa 553xx (`config.toml`); documentado. |
| Seed falhou: `texto[] \|\| 'literal'` em PL/pgSQL. | Uso de `array_append`. |
| Gatilho de ordem respondia com mensagem de status do chamado para solicitante. | Verificação de papel primeiro, com mensagem clara. |
| Nome acessível dos campos incluía "* (obrigatório)". | Asterisco só visual (`aria-hidden`), obrigatoriedade pelo atributo `required`. |
| Corrida entre o reset automático de formulários do React 19 e a preservação dos campos (descrição apagada). | Envio por `onSubmit` + `startTransition`; campos preservados em erro. |
| Antes da hidratação, formulário enviado por GET com a senha na URL. | Prop `action` mantida (envio progressivo por POST) junto com `onSubmit`. |
| Sem retorno visual ao concluir ordem/encerrar chamado (formulário some). | Redirecionamento com mensagem de sucesso na página. |
| Triagem com "Não atribuído" em chamado em atendimento mostrava erro genérico. | Validação na Server Action + mensagem para a restrição. |
| Restauração de backup com `<` no PowerShell 5.1 pode corromper acentos; `/tmp` convertido pelo Git Bash. | Procedimento com `docker cp` + caminho relativo; testado nos dois terminais. |

## Mesclagem das ocorrências na `main` (23/10/2026)

A pedido do responsável, os PRs #1 a #5 (ocorrência → correção da OC-01; ocorrência → correção da OC-02;
referência da OC-03) foram mesclados na `main` do repositório `aalissonalmeidaq/senai-sistema-chamados-manutencao`.
A versão anterior foi preservada na tag `v1.0-base`. Verificação da `main` resultante: `npm ci`, lint e tipos sem
erros; unitários 63; 4 migrações aplicadas; pgTAP 74 (`PASS`); integração 11; build; E2E com build de produção 10 —
todos passaram. A CI (disparo manual, run 40020701227) passou antes da mesclagem.

## Limitações conhecidas

- ESLint 9.39.5 é a versão instalada pelo `create-next-app` 16.4.3; o npm a marca como descontinuada. O
  ESLint 10 funcionou no teste, mas os plugins incluídos no `eslint-config-next` (import, jsx-a11y, react)
  ainda declaram suporte só até a versão 9 (árvore de dependências inválida). Manter a 9 até o Next.js atualizar.
- `npm` 12 bloqueia scripts de instalação não aprovados (aviso sobre `unrs-resolver`); não afeta o
  funcionamento (o lint passa).
- CI no GitHub Actions: primeira execução (run 40014034032, push na `main`) **passou** — job de qualidade
  em 1m02s e job de banco/integração/E2E em 13m25s. Aviso do GitHub: o rótulo `ubuntu-latest` migra para
  Ubuntu 26 a partir de 19/10/2026; acompanhar a próxima execução.
- A implantação demonstrativa (Vercel + Supabase remoto) foi **documentada, não executada** (exige contas e
  autorização).
