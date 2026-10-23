# Materiais do instrutor

> **RESERVADO AO INSTRUTOR** — não distribuir aos estudantes. Esta pasta nunca entra no pacote do estudante
> (o script `npm run student:export` usa lista de permissão e falha se encontrar este marcador).

| Documento | Conteúdo |
| --- | --- |
| [01 — Preparação do ambiente e do repositório](01-preparacao-ambiente-e-repositorio.md) | Laboratório, distribuição do código, calendário e **divergências curriculares registradas**. |
| [02 — Gabarito dos casos de teste](02-gabarito-casos-de-teste.md) | Dados iniciais, casos de referência com resultados esperados, achados possíveis. |
| [03 — Ocorrências controladas](03-ocorrencias-controladas.md) | Como distribuir cada ocorrência e restaurar o estado inicial. |
| [ocorrencias/](ocorrencias/) | Enunciados (para entregar) e soluções de referência OC-01, OC-02, OC-03, com patches. |
| [04 — Rubricas](04-rubricas.md) | Avaliações objetiva, prática e demonstração integradora. |
| [05 — Mapa requisito × módulo × teste × encontro](05-mapa-rastreabilidade-curricular.md) | Rastreabilidade entre sistema, testes, encontros, evidências e critérios. |
| [06 — Pacote do estudante](06-pacote-do-estudante.md) | Como gerar e conferir a distribuição sem material reservado. |
| [07 — Registro de validação](07-registro-de-validacao.md) | Comandos executados na preparação e resultados reais. |

## Branches do repositório do instrutor

| Branch | Conteúdo | Pode ir para estudantes? |
| --- | --- | --- |
| `main` | Versão estável, todos os testes passando. | Sim, **somente pelo pacote exportado**. |
| `ocorrencia/OC-01-descricao-chamado` | Versão com o defeito controlado da OC-01. | Sim, pelo pacote exportado (`--ref`). |
| `ocorrencia/OC-02-conclusao-ordem` | Versão com o defeito controlado da OC-02. | Sim, pelo pacote exportado (`--ref`). |
| `referencia/OC-01-correcao` | Teste de regressão + correção da OC-01. | **Não.** |
| `referencia/OC-02-correcao` | Teste de regressão + migração corretiva da OC-02. | **Não.** |
| `referencia/OC-03-exportacao-csv` | Implementação de referência da melhoria OC-03. | **Não.** |

Nunca mescle `ocorrencia/*` na `main`. Nunca dê acesso de leitura a este repositório aos estudantes.
