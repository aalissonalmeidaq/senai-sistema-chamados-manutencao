# 06 — Pacote exclusivo do estudante

> **RESERVADO AO INSTRUTOR** — não distribuir aos estudantes.

O pacote é gerado por `scripts/exportar-aluno.mjs` (`npm run student:export`), que trabalha por **lista de
permissão**: só entram os caminhos listados em `LISTA_PERMITIDA`. Tudo o mais fica de fora, inclusive arquivos
novos que alguém crie no futuro.

## Uso

```bash
npm run student:export                                      # versão estável (main)
npm run student:export -- --ref ocorrencia/OC-02-conclusao-ordem --nome sistema-chamados-oc02 --substituir
npm run student:export -- --destino ../entregas --sem-git   # outra pasta, sem repositório Git
```

Saída: o destino, a lista de arquivos incluídos e a lista de arquivos **não incluídos**.

## Garantias do script

| Proteção | Como funciona |
| --- | --- |
| Lista de permissão | Copia apenas `app/`, `components/`, `lib/`, `types/`, `public/`, `supabase/` (config, migrations, seed, tests, templates), `tests/`, `docs/aluno/`, `scripts/setup-local.mjs`, `scripts/gerar-tipos.mjs`, CI e arquivos de configuração. |
| Só arquivos versionados | Lê o conteúdo com `git show <ref>:<arquivo>`; `.env.local`, `node_modules`, backups e relatórios locais nunca entram. |
| Caminhos reservados | Falha se algum caminho incluído contiver `docs/instrutor`, `instrutor`, `gabarito`, `solucao`, `patch(es)`, `.patch`, `.diff`, `.env` (exceto `.env.example`), `exportar-aluno` ou `STATUS_IMPLEMENTACAO`. |
| Marcador de conteúdo | Falha (e apaga o pacote) se algum arquivo contiver o texto "RESERVADO AO INSTRUTOR". |
| Segredos | Falha se encontrar algo com formato de chave secreta (`sb_secret_...`), JWT ou chave privada. |
| Histórico | O pacote recebe um repositório Git **novo** com um único commit ("Versão entregue para a turma"), sem o histórico do instrutor — o diff dos defeitos não é visível. |
| `package.json` | O script `student:export` é removido da cópia do estudante. |

## Conferência antes de distribuir

1. Leia a lista "Incluídos" impressa pelo script.
2. Confirme: `docs/` contém **só** `aluno/`; não há `docs/instrutor`, branches `referencia/*` ou patches.
3. Na pasta gerada: `git log --oneline` mostra 1 commit.
4. Teste de fumaça do pacote (recomendado): na pasta gerada, `npm ci`, `npm run lint`, `npm run typecheck`,
   `npm test` e `npm run build`.

Resultados das verificações feitas na preparação (inclusive os testes de falha proposital do script) estão em
[07 — Registro de validação](07-registro-de-validacao.md).

## Ao incluir material novo para estudantes

- Coloque-o em `docs/aluno/` (já permitido) ou acrescente o caminho em `LISTA_PERMITIDA`.
- Nunca use o marcador "RESERVADO AO INSTRUTOR" em material do estudante.
- Gabaritos, soluções e patches ficam sempre em `docs/instrutor/`.
