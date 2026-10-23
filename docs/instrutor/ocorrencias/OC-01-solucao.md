# OC-01 — Solução de referência (descrição de chamado)

> **RESERVADO AO INSTRUTOR** — não distribuir aos estudantes.

| Item | Valor |
| --- | --- |
| Branch com o defeito | `ocorrencia/OC-01-descricao-chamado` |
| Branch com a solução | `referencia/OC-01-correcao` (2 commits: teste que falha → correção) |
| Patches | [patches/OC-01-defeito.patch](patches/OC-01-defeito.patch), [patches/OC-01-correcao.patch](patches/OC-01-correcao.patch) |
| Requisito violado | RN-CH-02 (descrição com no mínimo 10 caracteres, **sem contar espaços no início e no fim**) |
| Tipo de manutenção | Corretiva |
| Severidade sugerida | Média (dado inválido aceito + mensagem que não orienta; há contorno) |

## O que foi alterado para criar o defeito

1. `lib/validacao/esquemas.ts`: removido `.trim()` do campo `descricao` em `abrirChamadoSchema`.
2. Removidos os testes que detectariam o problema: dois casos em `tests/unit/validacao.test.ts` e o trecho de
   descrição só com espaços em `tests/e2e/fluxo-chamado.spec.ts` (simula uma lacuna de cobertura).

O banco **não** foi alterado: o gatilho continua removendo os espaços das pontas e a restrição
`chamados_descricao_preenchida` continua recusando descrição vazia.

## Diagnóstico

- A validação da aplicação conta os espaços: `"            "` (12 espaços) tem 12 caracteres e passa no
  `min(10)`. No banco, o gatilho `preparar_novo_chamado` faz `btrim` e a descrição fica vazia → a restrição
  CHECK falha (código 23514) → a Server Action devolve a mensagem genérica.
- `"    abc    "` tem 11 caracteres e passa no `min(10)`; o gatilho grava `"abc"` → chamado aceito com
  descrição de 3 caracteres, violando a RN-CH-02.
- O terminal do `npm run dev` mostra a causa técnica:
  `[abrirChamado] { code: '23514', message: 'new row for relation "chamados" violates check constraint "chamados_descricao_preenchida"' }`.

## Reprodução executada na preparação (resultado real)

Executado em 23/10/2026 na branch `ocorrencia/OC-01-descricao-chamado`, banco recriado, usuário `solicitante2@example.com`:

| Cenário | Entrada | Obtido |
| --- | --- | --- |
| A | Descrição com 12 espaços | Permaneceu em `/chamados/novo`; alerta "Não foi possível concluir a operação. Tente novamente."; terminal com o erro 23514 acima. |
| B | Descrição `"    abc    "` | Chamado **aberto** (`/chamados/23?sucesso=chamado-aberto`) com descrição gravada `"abc"`. |

Nessa mesma branch, todas as suítes passaram (54 unitários antes do merge com a `main`; 56 depois; pgTAP 73;
integração 11; E2E 9) — o defeito **escapa** dos testes existentes, como pretendido.

## Correção de referência

```diff
   descricao: z
     .string()
+    .trim()
     .min(10, "Descreva o problema com pelo menos 10 caracteres.")
```

## Teste de regressão sugerido (`tests/unit/validacao.test.ts`)

```ts
it("rejeita descrição só com espaços", () => {
  const r = abrirChamadoSchema.safeParse({ ...valido, descricao: "            " });
  expect(erros(r).descricao).toEqual(["Descreva o problema com pelo menos 10 caracteres."]);
});
it("rejeita descrição curta cercada de espaços", () => {
  const r = abrirChamadoSchema.safeParse({ ...valido, descricao: "    abc    " });
  expect(erros(r).descricao).toEqual(["Descreva o problema com pelo menos 10 caracteres."]);
});
it("grava a descrição sem os espaços das pontas", () => {
  const r = abrirChamadoSchema.safeParse({ ...valido, descricao: "  Projetor sem imagem  " });
  expect(r.success && r.data.descricao).toBe("Projetor sem imagem");
});
```

Resultado real: **antes** da correção, os 3 testes falharam (`3 failed | 15 passed`); **depois**, todos
passaram. Na branch de referência (após o merge com a `main`): unitários 59, pgTAP 73, integração 11, E2E 9 —
todos passando.

## Pontos para a avaliação

- Reproduziu **as duas** situações e relacionou-as à mesma causa? (diagnóstico baseado em dados)
- Consultou o log do servidor para entender a mensagem genérica?
- Identificou que o banco protegeu parcialmente (por isso o erro genérico) e que a regra precisa estar na aplicação?
- Criou teste de regressão que falha antes e passa depois?
- Melhoria opcional bem-vinda: mapear `chamados_descricao_preenchida` em `lib/erros.ts` para uma mensagem clara.
