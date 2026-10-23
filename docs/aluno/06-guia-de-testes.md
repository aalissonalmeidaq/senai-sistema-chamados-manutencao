# 06 — Guia de testes

Como executar cada tipo de teste, preparar dados, encontrar resultados, capturar evidências, registrar
defeitos e fazer reteste e regressão.

## Pirâmide de testes do projeto

| Nível | Ferramenta | Onde ficam | Comando | O que verifica |
| --- | --- | --- | --- | --- |
| Estático | ESLint, TypeScript | todo o código | `npm run lint`, `npm run typecheck` | Erros de código e de tipos antes de executar. |
| Unitário / componente | Vitest + Testing Library | `tests/unit/` | `npm test` | Regras de transição, validações, formatação, componentes. |
| Banco | pgTAP | `supabase/tests/` | `npm run db:test` | Estrutura, RLS, restrições, gatilhos e regras no PostgreSQL. |
| Integração | Vitest + supabase-js | `tests/integration/` | `npm run test:integration` | Permissões e fluxo completo pela API, como cada usuário. |
| Ponta a ponta (E2E) | Playwright | `tests/e2e/` | `npm run test:e2e` | Fluxos reais no navegador (login, cadastro, chamado, ordem). |
| Manual | Você | casos da equipe | — | Requisitos, usabilidade, exploração, acessibilidade. |

`npm run test:all` executa banco, unitários, integração e E2E em sequência.

## Preparar os dados

- `npm run db:reset` recria o banco com as migrações e o **seed** (dados conhecidos). Faça isso antes de
  cada rodada de testes manuais e antes de integração/E2E.
- Usuários e senhas: [README, seção 7](../../README.md#7-primeiro-acesso). Os números esperados após o
  reset estão na [Especificação, seção 5](00-especificacao-de-requisitos.md#5-dados-iniciais-seed).
- Precisa de um dado específico? Crie pela própria aplicação (e registre isso nas pré-condições do caso).
  Para consultar dados, use o Studio (<http://127.0.0.1:55323>, *Table Editor* ou *SQL Editor*).

## Executar e ler os resultados

### Unitários (`npm test`)

```text
 Test Files  5 passed (5)
      Tests  58 passed (58)      ← os números variam conforme a versão
```

Uma falha mostra o nome do teste, o valor esperado (`Expected`) e o obtido (`Received`).
Para rodar só um arquivo: `npx vitest run tests/unit/regras-chamados.test.ts`. Modo contínuo: `npm run test:watch`.

### Banco (`npm run db:test`)

Cada arquivo de `supabase/tests/` aparece com `ok` ou com a lista de testes que falharam
(`# Failed test 3: "..."`, `have:` obtido, `want:` esperado). Termina com `Result: PASS` ou `FAIL`.

### Integração (`npm run test:integration`)

Precisa do Supabase local rodando e do seed. Mostra um resumo como o do Vitest.

### E2E (`npm run test:e2e`)

O Playwright inicia a aplicação (ou reaproveita um `npm run dev` aberto). Ao terminar:

- `npx playwright show-report` abre o **relatório HTML** (pasta `playwright-report/`);
- em falhas, `test-results/` guarda **captura de tela** e **trace** (`npx playwright show-trace <arquivo>.zip`),
  que permite ver passo a passo o que o navegador fez — ótima evidência.
- Para ver o navegador durante o teste: `npx playwright test --headed`.

## Testes manuais

1. Escreva o caso **antes** de executar ([modelo](08-modelos/caso-de-teste.md)), com resultado esperado.
2. Execute exatamente os passos. Não "conserte" o caminho durante a execução; se algo inesperado acontecer,
   pare e registre.
3. Compare esperado × obtido e marque **Passou**, **Falhou**, **Bloqueado** (não deu para executar) ou
   **Não executado**.

Dicas de técnicas:

- **Valor-limite**: teste no limite e logo fora dele (ex.: título com 4, 5, 120 e 121 caracteres).
- **Partição de equivalência**: um representante de cada grupo de entradas (válidas e inválidas).
- **Transição de estados**: cada seta do diagrama de status **e** setas que não existem.
- **Papéis**: a mesma ação com solicitante, técnico e administrador.
- **Exploratório**: sessão curta (ex.: 20 min) com um objetivo ("tentar ver dados de outro solicitante"),
  anotando o que foi tentado.
- **Acessibilidade**: usar só o teclado (`Tab`, `Shift+Tab`, `Enter`, `Espaço`), conferir foco visível e rótulos.

## Evidências

| Tipo | Como capturar | Cuidados |
| --- | --- | --- |
| Captura de tela | `Win + Shift + S` (Windows), `Cmd + Shift + 4` (macOS) | Mostre URL, usuário logado e a mensagem. |
| Saída de terminal | Selecione e copie o **texto** para um arquivo `.txt` | Inclua o comando executado. |
| Dados do banco | Consulta no Studio + captura | Mostre a consulta e o resultado. |
| Relatório automatizado | `playwright-report/`, saída do Vitest/pgTAP | Anote data/hora e commit (`git log -1 --oneline`). |

Nomeie de forma rastreável: `CT-014_obtido_2026-10-14.png`, `FA-003_reteste.txt`.
**Nunca** inclua chaves secretas nas evidências (a chave publicável e as senhas fictícias do seed podem aparecer).

## Registrar defeitos

Use o [registro de falha](08-modelos/registro-de-falha.md). Um bom registro permite que outra pessoa
reproduza o problema sem perguntar nada: ambiente/versão, pré-condições, passos numerados, esperado,
obtido, evidência, severidade, requisito violado e sugestão de solução.

## Reteste e regressão

- **Reteste**: depois da correção, execute **o mesmo caso** que falhou, nas mesmas condições, e anexe a
  nova evidência ao registro de falha.
- **Regressão**: rode as suítes automatizadas completas e os casos manuais das funcionalidades próximas
  à correção. Uma correção só é aceita se nada que passava antes passou a falhar.
- Se a falha não tinha teste automatizado, **crie um** (teste de regressão) junto com a correção.
