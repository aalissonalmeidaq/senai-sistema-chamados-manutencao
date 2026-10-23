# OC-03 — Solução de referência (exportação CSV)

> **RESERVADO AO INSTRUTOR** — não distribuir aos estudantes.

| Item | Valor |
| --- | --- |
| Versão entregue | `main` (não há defeito) |
| Branch com a solução | `referencia/OC-03-exportacao-csv` |
| Patch | [patches/OC-03-referencia.patch](patches/OC-03-referencia.patch) |
| Tipo de manutenção | Evolutiva |
| Requisitos relacionados | RF-09 (filtros), RN-AC-01 (visibilidade), RNF-01 (pt-BR) |

## Implementação de referência

| Arquivo | O que faz |
| --- | --- |
| `lib/consultas.ts` → `consultarChamados(filtros, limite)` | Consulta com os filtros da lista, **compartilhada** entre a tela e a exportação (evita duplicar regra). |
| `app/(sistema)/chamados/page.tsx` | Usa `consultarChamados` e mostra o botão **Exportar CSV** com os filtros atuais na URL. |
| `lib/relatorios/csv.ts` | `gerarCsv` (BOM UTF-8, `;`, CRLF, aspas, proteção contra fórmulas) e `csvDeChamados`. |
| `app/(sistema)/chamados/exportar/route.ts` | `GET /chamados/exportar?...` exige login, aplica filtros, responde `text/csv` com `chamados-AAAA-MM-DD.csv`. |
| `tests/unit/csv.test.ts` | 4 testes (formato, escape, fórmulas, linha completa). |
| `tests/e2e/fluxo-chamado.spec.ts` | Download filtrado (técnico) e restrição por RLS (solicitante). |

Permissões: a rota usa o cliente do servidor com a sessão do usuário, então o **RLS** garante que o solicitante
só exporta os próprios chamados — sem código extra de autorização além de exigir login.

## Resultado real na preparação

Branch `referencia/OC-03-exportacao-csv`: lint e tipos sem erros; unitários 62 passaram; E2E 10 passaram,
incluindo "OC-03: exportar a lista filtrada em CSV respeitando permissões" (arquivo `chamados-AAAA-MM-DD.csv`,
cabeçalho correto, todas as linhas com "Em atendimento" quando filtrado; para `solicitante1`, todas as linhas
com "Daniela Souza").

## Pontos para a avaliação

- Traduziu o pedido em critérios verificáveis e testou cada um?
- Reutilizou a lógica de filtros em vez de duplicá-la?
- Garantiu acentos no Excel (BOM) e separador `;`? Evidência de abertura em planilha?
- Considerou permissões (solicitante só os seus)?
- Bônus: proteção contra "injeção de fórmula" (`=`, `+`, `-`, `@` no início das células).
