# OC-02 — Solução de referência (ordem concluída sem execução)

> **RESERVADO AO INSTRUTOR** — não distribuir aos estudantes.

| Item | Valor |
| --- | --- |
| Branch com o defeito | `ocorrencia/OC-02-conclusao-ordem` |
| Branch com a solução | `referencia/OC-02-correcao` (testes que falham → correção com nova migração) |
| Patches | [patches/OC-02-defeito.patch](patches/OC-02-defeito.patch), [patches/OC-02-correcao.patch](patches/OC-02-correcao.patch) |
| Requisitos violados | RN-OM-01 (Planejada só vai para Em execução ou Cancelada), RN-OM-03 (datas registradas), RN-OM-04 (efeito no equipamento) |
| Tipo de manutenção | Corretiva (com tratamento de dados legados) |
| Severidade sugerida | Alta (integridade dos dados e indicadores) |

## O que foi alterado para criar o defeito

1. `lib/regras/ordens.ts`: acrescentada a transição `planejada → concluida`.
2. `supabase/migrations/20261023120100_funcoes_e_gatilhos.sql`: `transicao_ordem_permitida` aceita `concluida` a partir de `planejada`.
3. `supabase/migrations/20261023120000_tipos_e_tabelas.sql`: a restrição `ordens_conclusao_completa` deixou de exigir `iniciada_em`.
4. Removidos os testes que cobriam a regra (unitário, pgTAP e integração).

## Reprodução executada na preparação (resultado real)

Em 23/10/2026, branch `ocorrencia/OC-02-conclusao-ordem`, banco recriado, usuário `tecnico1@example.com`, ordem OM-0004:

- Opções em "Próximo passo" com a ordem Planejada: `Iniciar execução | Concluir ordem | Cancelar ordem`.
- Após salvar atividades e resultado e escolher "Concluir ordem": ordem **Concluída** com
  `Início da execução: —`, `Tempo de execução: —`.
- Banco: `id=4, status=concluida, iniciada_em=NULL`; equipamento INF-0003 permaneceu `disponivel`
  (nunca passou a "Em manutenção").
- Histórico da ordem: criada → campos atualizados → "status alterado de Planejada para Concluída" (sem "Em execução").
- Todas as suítes passaram na branch com defeito (unitários 55 antes do merge com a `main`, 57 depois; pgTAP; integração 11; E2E 9).

## Correção de referência

**Aplicação** — remover a transição em `lib/regras/ordens.ts`.

**Banco** — **nova migração** (não editar as já distribuídas): `supabase/migrations/20261023185020_corrige_conclusao_ordem.sql`:

```sql
create or replace function public.transicao_ordem_permitida(de public.status_ordem, para public.status_ordem)
returns boolean language sql immutable set search_path = '' as $$
  select case
    when de = 'planejada'   and para in ('em_execucao', 'cancelada') then true
    when de = 'em_execucao' and para in ('concluida', 'cancelada')   then true
    else false
  end;
$$;

alter table public.ordens_manutencao drop constraint ordens_conclusao_completa;
alter table public.ordens_manutencao add constraint ordens_conclusao_completa check (
  status <> 'concluida' or (
    char_length(btrim(diagnostico)) > 0 and char_length(btrim(atividades_executadas)) > 0
    and resultado is not null and iniciada_em is not null and concluida_em is not null
  )
) not valid;
```

**Por que `NOT VALID`?** Em um banco em uso, já existem ordens concluídas sem início (geradas pelo defeito).
Verificado na preparação: aplicar a correção com `npx supabase migration up --local` sobre um banco com
1 ordem inconsistente funcionou (a linha antiga foi preservada; `convalidated = false`); `VALIDATE CONSTRAINT`
falharia com *"check constraint ... is violated by some row"*. Novas tentativas de concluir sem execução são
recusadas com *"Transição de status da ordem inválida: Planejada → Concluída."*. O tratamento dos registros
antigos é decisão de negócio (não inventar datas): listar com
`select id, chamado_id, concluida_em from public.ordens_manutencao where status = 'concluida' and iniciada_em is null;`
e registrar a decisão no registro de mudança.

## Testes de regressão sugeridos

- Unitário (`tests/unit/regras-ordens.test.ts`): `planejada → concluida` recusada e
  `transicoesOrdemDisponiveis("planejada")` = `["em_execucao", "cancelada"]`.
- pgTAP (`supabase/tests/03_ordens.test.sql`): `throws_like` para a transição e `isnt(iniciada_em, null)` após concluir.

Resultado real: antes da correção, o teste unitário falhou (`1 failed`) e o pgTAP falhou no teste novo
(`Failed test 6`); depois, todos passaram. Branch de referência (após merge): unitários 58, pgTAP PASS,
integração 11, E2E 9.

## Pontos para a avaliação

- Encontrou a causa nas **três** camadas (regra TS, função SQL, restrição)?
- Usou **nova migração** em vez de editar a antiga? Testou a migração com `db reset` **e** sobre dados existentes?
- Tratou ou documentou os registros já inconsistentes, sem inventar dados?
- Comunicou o impacto nos indicadores e o que muda para a equipe?
