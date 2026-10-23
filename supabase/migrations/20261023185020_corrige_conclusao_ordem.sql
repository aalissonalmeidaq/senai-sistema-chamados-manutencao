-- =============================================================================
-- Correção OC-02 — ordem de manutenção concluída sem passar por execução
--
-- Causa: a transição Planejada → Concluída estava liberada (TypeScript e banco)
-- e a restrição de integridade deixou de exigir a data de início.
-- Correção (manutenção corretiva): nova migração; as migrações já
-- distribuídas NÃO são editadas.
-- =============================================================================

-- 1. Regra de transição (RN-OM-01): concluir só a partir de "em execução".
create or replace function public.transicao_ordem_permitida(
  de public.status_ordem,
  para public.status_ordem
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when de = 'planejada'   and para in ('em_execucao', 'cancelada') then true
    when de = 'em_execucao' and para in ('concluida', 'cancelada')   then true
    else false
  end;
$$;

-- 2. Integridade (RN-OM-03): ordem concluída precisa ter data de início.
--    Registros antigos concluídos sem início (gerados pelo defeito) não são
--    alterados automaticamente — não inventamos datas. A restrição vale para
--    linhas novas e alteradas (NOT VALID); os registros antigos devem ser
--    listados no registro de mudança e tratados com o responsável:
--      select id, chamado_id, concluida_em from public.ordens_manutencao
--      where status = 'concluida' and iniciada_em is null;
alter table public.ordens_manutencao drop constraint ordens_conclusao_completa;
alter table public.ordens_manutencao add constraint ordens_conclusao_completa check (
  status <> 'concluida' or (
    char_length(btrim(diagnostico)) > 0
    and char_length(btrim(atividades_executadas)) > 0
    and resultado is not null
    and iniciada_em is not null
    and concluida_em is not null
  )
) not valid;
