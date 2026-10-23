-- =============================================================================
-- Migração 3 — Row Level Security (RLS) e privilégios
--
-- Papéis da aplicação (coluna perfis.papel):
--   solicitante   → abre e acompanha os PRÓPRIOS chamados
--   tecnico       → atende chamados, cadastra equipamentos, executa ordens
--   administrador → tudo do técnico + gerencia papéis e exclui equipamentos
--
-- Sem login (papel de banco "anon") não há acesso a nenhuma tabela.
-- Quando uma operação não tem política, ela é NEGADA pelo RLS. Abaixo, cada
-- tabela lista explicitamente as quatro operações.
-- =============================================================================

alter table public.perfis              enable row level security;
alter table public.equipamentos        enable row level security;
alter table public.chamados            enable row level security;
alter table public.comentarios_chamado enable row level security;
alter table public.ordens_manutencao   enable row level security;
alter table public.eventos             enable row level security;

-- Privilégios (GRANT) dizem QUAIS comandos cada papel de banco pode tentar;
-- as políticas RLS dizem EM QUAIS LINHAS. Começamos sem nenhum privilégio e
-- concedemos só o necessário. Visitantes sem login (anon) não recebem nada.
revoke all on public.perfis, public.equipamentos, public.chamados,
              public.comentarios_chamado, public.ordens_manutencao, public.eventos
  from anon, authenticated;

grant select on public.perfis, public.equipamentos, public.chamados,
                public.comentarios_chamado, public.ordens_manutencao, public.eventos
  to authenticated;
grant update (nome) on public.perfis to authenticated;
grant insert, update, delete on public.equipamentos to authenticated;
grant insert, update on public.chamados to authenticated;
grant insert on public.comentarios_chamado to authenticated;
grant insert, update on public.ordens_manutencao to authenticated;

-- ---------------------------------------------------------------------------
-- perfis
-- ---------------------------------------------------------------------------
-- SELECT: qualquer usuário autenticado vê nome e papel (necessário para
--         mostrar solicitante e técnico nos chamados).
create policy "perfis: autenticados leem"
  on public.perfis for select to authenticated
  using (true);

-- UPDATE: o próprio usuário (apenas a coluna nome — ver GRANT abaixo).
--         Papel só muda pela função definir_papel (administrador).
create policy "perfis: usuário atualiza o próprio nome"
  on public.perfis for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- INSERT: sem política → negado (o perfil é criado por gatilho no cadastro).
-- DELETE: sem política → negado (o perfil some junto com o usuário do Auth).

-- ---------------------------------------------------------------------------
-- equipamentos
-- ---------------------------------------------------------------------------
create policy "equipamentos: autenticados leem"
  on public.equipamentos for select to authenticated
  using (true);

create policy "equipamentos: equipe cadastra"
  on public.equipamentos for insert to authenticated
  with check ((select public.eh_equipe()));

create policy "equipamentos: equipe atualiza"
  on public.equipamentos for update to authenticated
  using ((select public.eh_equipe()))
  with check ((select public.eh_equipe()));

-- DELETE: só administrador. Equipamento com chamados não pode ser excluído
-- (chave estrangeira RESTRICT) — nesse caso use o estado "inativo".
create policy "equipamentos: administrador exclui"
  on public.equipamentos for delete to authenticated
  using ((select public.eh_admin()));

-- ---------------------------------------------------------------------------
-- chamados
-- ---------------------------------------------------------------------------
create policy "chamados: solicitante vê os seus, equipe vê todos"
  on public.chamados for select to authenticated
  using (solicitante_id = (select auth.uid()) or (select public.eh_equipe()));

create policy "chamados: autenticado abre em seu nome"
  on public.chamados for insert to authenticated
  with check (solicitante_id = (select auth.uid()));

-- UPDATE: equipe em qualquer chamado; solicitante só no próprio chamado
-- "resolvido" (para confirmar o encerramento ou reabrir). As transições e
-- colunas permitidas são conferidas pelo gatilho validar_alteracao_chamado.
create policy "chamados: equipe atualiza; solicitante confirma resolução"
  on public.chamados for update to authenticated
  using (
    (select public.eh_equipe())
    or (solicitante_id = (select auth.uid()) and status = 'resolvido')
  )
  with check (
    (select public.eh_equipe()) or solicitante_id = (select auth.uid())
  );

-- DELETE: sem política → negado. Chamados nunca são apagados (histórico).

-- ---------------------------------------------------------------------------
-- comentarios_chamado
-- ---------------------------------------------------------------------------
create policy "comentarios: equipe vê todos; solicitante vê públicos dos seus chamados"
  on public.comentarios_chamado for select to authenticated
  using (
    (select public.eh_equipe())
    or (
      not interno
      and exists (select 1 from public.chamados c
                  where c.id = chamado_id and c.solicitante_id = (select auth.uid()))
    )
  );

create policy "comentarios: equipe comenta; solicitante comenta nos seus (público)"
  on public.comentarios_chamado for insert to authenticated
  with check (
    autor_id = (select auth.uid())
    and (
      (select public.eh_equipe())
      or (
        not interno
        and exists (select 1 from public.chamados c
                    where c.id = chamado_id and c.solicitante_id = (select auth.uid()))
      )
    )
  );

-- UPDATE e DELETE: sem política → negado (comentários são registro histórico).

-- ---------------------------------------------------------------------------
-- ordens_manutencao
-- ---------------------------------------------------------------------------
create policy "ordens: equipe vê todas; solicitante vê as dos seus chamados"
  on public.ordens_manutencao for select to authenticated
  using (
    (select public.eh_equipe())
    or exists (select 1 from public.chamados c
               where c.id = chamado_id and c.solicitante_id = (select auth.uid()))
  );

create policy "ordens: equipe cria"
  on public.ordens_manutencao for insert to authenticated
  with check ((select public.eh_equipe()));

create policy "ordens: equipe atualiza"
  on public.ordens_manutencao for update to authenticated
  using ((select public.eh_equipe()))
  with check ((select public.eh_equipe()));

-- DELETE: sem política → negado. Use o status "cancelada".

-- ---------------------------------------------------------------------------
-- eventos (histórico)
-- ---------------------------------------------------------------------------
create policy "eventos: equipe vê todos; solicitante vê os visíveis dos seus chamados"
  on public.eventos for select to authenticated
  using (
    (select public.eh_equipe())
    or (
      visivel_solicitante
      and (
        (chamado_id is null and ordem_id is null)
        or exists (select 1 from public.chamados c
                   where c.id = chamado_id and c.solicitante_id = (select auth.uid()))
      )
    )
  );

-- INSERT, UPDATE e DELETE: sem política → negado. Somente os gatilhos
-- (SECURITY DEFINER) gravam eventos; ninguém altera ou apaga o histórico.

-- ---------------------------------------------------------------------------
-- Funções expostas como RPC: só para usuários autenticados.
-- ---------------------------------------------------------------------------
revoke execute on function public.definir_papel(uuid, public.papel_usuario) from public, anon;
revoke execute on function public.alterar_status_chamado(bigint, public.status_chamado, text) from public, anon;
revoke execute on function public.alterar_status_ordem(bigint, public.status_ordem, text) from public, anon;
grant execute on function public.definir_papel(uuid, public.papel_usuario) to authenticated;
grant execute on function public.alterar_status_chamado(bigint, public.status_chamado, text) to authenticated;
grant execute on function public.alterar_status_ordem(bigint, public.status_ordem, text) to authenticated;

-- Teste de fumaça: única função disponível também sem login (não lê tabelas).
revoke execute on function public.verificar_conexao() from public;
grant execute on function public.verificar_conexao() to anon, authenticated;
