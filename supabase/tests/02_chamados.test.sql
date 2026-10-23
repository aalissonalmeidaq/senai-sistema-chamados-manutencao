-- Testes de chamados: visibilidade (RLS), abertura, transições e comentários.
begin;
create extension if not exists pgtap with schema extensions;
select plan(24);

insert into auth.users (id, email, raw_user_meta_data) values
  ('c0000000-0000-4000-8000-000000000001', 'ch.tecnico@example.com', '{"nome":"Técnico Teste"}'),
  ('c0000000-0000-4000-8000-000000000002', 'ch.solic.a@example.com', '{"nome":"Solicitante A"}'),
  ('c0000000-0000-4000-8000-000000000003', 'ch.solic.b@example.com', '{"nome":"Solicitante B"}');
update public.perfis set papel = 'tecnico' where id = 'c0000000-0000-4000-8000-000000000001';

insert into public.equipamentos (codigo, nome, categoria, localizacao, estado) values
  ('TCH-0001', 'Equipamento ativo de teste', 'outro', 'Sala de testes', 'disponivel'),
  ('TCH-0002', 'Equipamento inativo de teste', 'outro', 'Sala de testes', 'inativo');

create function pg_temp.como(p_usuario uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_usuario, 'role', 'authenticated')::text, true);
$$;
create function pg_temp.eq(p_codigo text) returns bigint language sql as $$
  select id from public.equipamentos where codigo = p_codigo;
$$;
create function pg_temp.ch(p_titulo text) returns bigint language sql security definer as $$
  select id from public.chamados where titulo = p_titulo;
$$;

-- ---------------------------------------------------------------------------
-- Abertura pelo solicitante A
-- ---------------------------------------------------------------------------
select pg_temp.como('c0000000-0000-4000-8000-000000000002');
set local role authenticated;

select lives_ok(
  $$insert into public.chamados (titulo, descricao, categoria, prioridade, status, tecnico_id, equipamento_id, solicitante_id)
    values ('Chamado de teste A', 'Descrição do chamado de teste A.', 'falha', 'alta', 'resolvido',
            'c0000000-0000-4000-8000-000000000001', pg_temp.eq('TCH-0001'), auth.uid())$$,
  'solicitante abre chamado');
select is(
  (select status::text from public.chamados where id = pg_temp.ch('Chamado de teste A')),
  'aberto', 'chamado sempre nasce "aberto", mesmo se outro status for enviado');
select is(
  (select tecnico_id from public.chamados where id = pg_temp.ch('Chamado de teste A')),
  null, 'chamado nasce sem técnico atribuído');
-- O gatilho força solicitante = usuário logado; confirmamos abaixo que não existe chamado de B.
select lives_ok(
  $$insert into public.chamados (titulo, descricao, categoria, equipamento_id, solicitante_id)
    values ('Chamado em nome de outro', 'Tentativa de abrir em nome de B.', 'falha', pg_temp.eq('TCH-0001'),
            'c0000000-0000-4000-8000-000000000003')$$,
  'tentativa de abrir em nome de outra pessoa é gravada em nome de quem está logado');
select throws_like(
  $$insert into public.chamados (titulo, descricao, categoria, equipamento_id, solicitante_id)
    values ('Chamado inativo', 'Equipamento inativo não aceita chamado.', 'falha', pg_temp.eq('TCH-0002'), auth.uid())$$,
  '%equipamento inativo%', 'não é possível abrir chamado para equipamento inativo');
select throws_ok(
  $$insert into public.chamados (titulo, descricao, categoria, equipamento_id, solicitante_id)
    values ('Descrição vazia', '     ', 'falha', pg_temp.eq('TCH-0001'), auth.uid())$$,
  '23514', null, 'descrição só com espaços é rejeitada pelo banco');
select throws_like(
  $$select public.alterar_status_chamado(pg_temp.ch('Chamado de teste A'), 'em_triagem')$$,
  '%não encontrado ou você não tem permissão%', 'solicitante não faz triagem do próprio chamado');
select throws_ok(
  $$delete from public.chamados where id = pg_temp.ch('Chamado de teste A')$$,
  '42501', null, 'ninguém apaga chamados');
reset role;

-- O "chamado em nome de outro" não pode ter sido criado em nome de B
select is(
  (select count(*)::int from public.chamados where solicitante_id = 'c0000000-0000-4000-8000-000000000003'),
  0, 'nenhum chamado foi criado em nome do solicitante B');

-- ---------------------------------------------------------------------------
-- Visibilidade: B não vê o chamado de A; técnico vê
-- ---------------------------------------------------------------------------
select pg_temp.como('c0000000-0000-4000-8000-000000000003');
set local role authenticated;
select is_empty(
  $$select id from public.chamados where titulo = 'Chamado de teste A'$$,
  'solicitante B não vê chamado de A');
reset role;

select pg_temp.como('c0000000-0000-4000-8000-000000000001');
set local role authenticated;
select isnt_empty(
  $$select id from public.chamados where titulo = 'Chamado de teste A'$$,
  'técnico vê chamados de todos');

-- ---------------------------------------------------------------------------
-- Transições pela equipe
-- ---------------------------------------------------------------------------
select throws_like(
  $$select public.alterar_status_chamado(pg_temp.ch('Chamado de teste A'), 'resolvido', 'x')$$,
  '%Transição de status inválida: Aberto → Resolvido%', 'aberto não pode ir direto para resolvido');
select lives_ok(
  $$select public.alterar_status_chamado(pg_temp.ch('Chamado de teste A'), 'em_triagem')$$,
  'aberto → em triagem');
select throws_like(
  $$select public.alterar_status_chamado(pg_temp.ch('Chamado de teste A'), 'em_atendimento')$$,
  '%Atribua um técnico%', 'atendimento exige técnico atribuído');
select lives_ok(
  $$update public.chamados set tecnico_id = 'c0000000-0000-4000-8000-000000000001', prioridade = 'critica'
     where id = pg_temp.ch('Chamado de teste A')$$,
  'técnico atribui responsável e ajusta prioridade na triagem');
select throws_like(
  $$update public.chamados set tecnico_id = 'c0000000-0000-4000-8000-000000000003' where id = pg_temp.ch('Chamado de teste A')$$,
  '%papel de técnico ou administrador%', 'não é possível atribuir chamado a um solicitante');
select lives_ok(
  $$select public.alterar_status_chamado(pg_temp.ch('Chamado de teste A'), 'em_atendimento')$$,
  'em triagem → em atendimento');
select throws_like(
  $$select public.alterar_status_chamado(pg_temp.ch('Chamado de teste A'), 'resolvido')$$,
  '%Informe uma observação%', 'resolver exige observação');
select lives_ok(
  $$select public.alterar_status_chamado(pg_temp.ch('Chamado de teste A'), 'resolvido', 'Problema corrigido.')$$,
  'em atendimento → resolvido com observação');
select lives_ok(
  $$insert into public.comentarios_chamado (chamado_id, texto, interno) values (pg_temp.ch('Chamado de teste A'), 'Nota interna da equipe.', true)$$,
  'técnico registra comentário interno');
reset role;

-- ---------------------------------------------------------------------------
-- Solicitante confirma o encerramento e não vê comentário interno
-- ---------------------------------------------------------------------------
select pg_temp.como('c0000000-0000-4000-8000-000000000002');
set local role authenticated;
select is_empty(
  $$select id from public.comentarios_chamado where interno$$,
  'solicitante não vê comentários internos');
select lives_ok(
  $$select public.alterar_status_chamado(pg_temp.ch('Chamado de teste A'), 'encerrado')$$,
  'solicitante confirma e encerra o chamado resolvido');
select throws_like(
  $$insert into public.comentarios_chamado (chamado_id, texto, interno) values (pg_temp.ch('Chamado de teste A'), 'Mais uma coisa', false)$$,
  '%chamado encerrado%', 'não é possível comentar em chamado encerrado');
reset role;

select is(
  (select count(*)::int from public.eventos
    where chamado_id = pg_temp.ch('Chamado de teste A') and tipo = 'chamado_status'),
  4, 'histórico registra as 4 mudanças de status');

select * from finish();
rollback;
