# 05 — Mapa: requisito × módulo × teste × encontro × evidência × critério

> **RESERVADO AO INSTRUTOR** — não distribuir aos estudantes.

## Requisitos do sistema

| Requisito | Módulo / arquivo principal | Testes automatizados | Gabarito | Encontros | Evidência esperada | Critério |
| --- | --- | --- | --- | --- | --- | --- |
| RF-01, RN-AC-03 | `app/(publico)/acoes.ts`, gatilho `criar_perfil_novo_usuario` | E2E cadastro com Mailpit; pgTAP 01 | G-04–G-06 | 3–6, 11 | Caso + captura do Mailpit | SA1 AA2; SA2 F5 |
| RF-02, RN-AC-04 | `proxy.ts`, `lib/supabase/proxy.ts`, `lib/auth.ts` | E2E autenticação; pgTAP 01 (anon) | G-01–G-03, G-07 | 3–6, 10 | Caso + captura | SA1 AA2 |
| RF-03 | `app/(sistema)/usuarios`, `definir_papel` | pgTAP 01; integração permissões | G-50, G-51 | 5–8 | Caso | SA1 prática |
| RF-04–RF-07, RN-EQ-01–04 | `app/(sistema)/equipamentos`, `equipamentoSchema` | unit validação; pgTAP 00; E2E equipamento; integração | G-10–G-18 | 4–8 | Casos de valor-limite | SA1 AA2 |
| RF-08, RN-CH-02 | `chamados/novo`, `abrirChamadoSchema` | unit validação; E2E ciclo | G-20–G-23 | 5–8, 13 | Casos; **OC-01** | SA1 AA2; SA3 AA1 |
| RF-09 | `chamados/page.tsx`, `filtrosChamadosSchema` | unit filtros; E2E filtros | G-24–G-26 | 5–8, 14 | Casos; **OC-03** | SA1; SA3 AA2 |
| RF-10, RN-CH-04 | `chamados/acoes.ts` (`salvarTriagem`) | unit regras; pgTAP 02; E2E | G-28, G-34 | 5–8 | Caso | SA1 |
| RF-11, RN-CH-01/03/05/06/08 | `lib/regras/chamados.ts`, `validar_alteracao_chamado` | unit regras; pgTAP 02; integração fluxo; E2E | G-27–G-32 | 5–8 | Tabela de transição de estados | SA1 AA2/prática |
| RF-12, RN-AC-01 | comentários (`comentarChamado`, RLS) | pgTAP 02; integração | G-33 | 5–8 | Caso por papel | SA1 |
| RF-13, RN-AU-01 | `components/Historico.tsx`, `registrar_evento_*` | unit componente; integração (eventos) | G-35 | 5–8, 13–14 | Captura do histórico | SA1; SA3 |
| RF-14–RF-17, RN-OM-01–06 | `app/(sistema)/ordens`, `lib/regras/ordens.ts`, gatilhos de ordem | unit regras; pgTAP 03; integração; E2E | G-40–G-47 | 5–8, 14 | Casos; **OC-02** | SA1; SA3 AA2/prática |
| RF-18 | `painel/page.tsx` | E2E login | G-52, G-53 | 1, 5–8, 15 | Captura do painel | SA1; SA3 indicadores |
| RF-19 | `app/api/saude/route.ts`, `verificar_conexao` | integração (anon) | G-54 | 10–12 | Saída JSON | SA2 F2 |
| RNF-02/03 | componentes `Selo*`, `Campos`, layout | unit componentes | G-55, G-56 | 5–7 | Teste com teclado/celular | SA1 |
| RNF-04 | migração RLS, `lib/env.ts`, `.gitignore` | pgTAP; integração permissões | — | 10–11 | Checklist de segurança | SA2 AA2 |
| RNF-06 | `supabase/migrations`, `seed.sql`, `setup-local.mjs` | CI (job banco) | — | 9–12 | Checklist de implantação | SA2 |
| RNF-07 | `.github/workflows/ci.yml` | — | — | 8, 12, 14 | Saída das suítes | SA1–SA3 |

## Encontros × atividades × materiais

| Enc. | Data | SA | Atividade no sistema | Material do estudante | Avaliação |
| --- | --- | --- | --- | --- | --- |
| 1 | 05/10 | 1 | Instalação, exploração por papel, mapa do sistema | README, 01, 02 | Diagnóstico |
| 2 | 06/10 | 1 | Leitura da especificação; estratégia | 00, 02 | — |
| 3 | 07/10 | 1 | Matriz de rastreabilidade | 08/matriz | AA1 (30%) |
| 4 | 12/10 | 1 | Plano de teste | 08/caso-de-teste | — (feriado: ver D3) |
| 5 | 13/10 | 1 | Casos e ambiente | 06, 08 | AA2 (60%) |
| 6 | 14/10 | 1 | Execução e evidências | 06, 08/falha | Formativa |
| 7 | 19/10 | 1 | Regressão, exploratório, classificação | 06 | Objetiva |
| 8 | 20/10 | 1 | Reteste e relatório final | 08 | Prática |
| 9 | 21/10 | 2 | Plano de implantação e retorno | 03, 05 | — |
| 10 | 26/10 | 2 | Instalação limpa e segurança | 05, 08/checklist | AA1 (30%) + objetiva |
| 11 | 27/10 | 2 | Migração, backup, parâmetros, validação | 03, 05 | AA2 (60%) |
| 12 | 28/10 | 2 | Manual breve, simulação de liberação; demonstração remota (opcional) | 07 | Prática |
| 13 | 02/11 | 3 | OC-01: atendimento e diagnóstico | 04, 08/atendimento | AA1 (30%) + objetiva (feriado: ver D3) |
| 14 | 03/11 | 3 | OC-02 (e OC-03): mudança controlada | 04, 08/mudança | AA2 (60%) + prática |
| 15 | 04/11 | 3 | Indicadores, PDCA, demonstração integrada | 04, 09 | Integrada + reflexão |

## Conhecimentos da matriz (projeto integrado) × sistema

| Conhecimento | Onde aparece no sistema |
| --- | --- |
| 1 Softwares de escritório | Matriz CSV, exportação CSV (OC-03), relatórios |
| 2 Serviços de implantação e manutenção | `setup:local`, migrações, ocorrências |
| 12 Instalação e configuração de serviços | Docker, Supabase local, `config.toml`, `.env.local` |
| 17 Requisitos e regras de negócio | `docs/aluno/00`, regras RN-* |
| 18/19 Modelagem e UML | Diagramas Mermaid (ER e estados) |
| 20/21 Técnicas de programação / OO | Leitura de `lib/regras`, correções OC-01/OC-02 |
| 22 Metodologias de desenvolvimento | Git, branches, CI, migrações versionadas |
| 23 Integração de sistemas | Aplicação ↔ Auth ↔ banco ↔ e-mail; testes de integração |
| 24 Planejamento e documentação de testes | Guias 02 e 06, modelos |
| 25 Tipos, níveis e técnicas de teste | Pirâmide de testes do projeto |
