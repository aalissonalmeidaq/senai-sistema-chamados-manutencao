-- Testes de ordens de manutenção: criação, transições, integridade e efeito no equipamento.
begin;
create extension if not exists pgtap with schema extensions;
select plan(18);

insert into auth.users (id, email, raw_user_meta_data) values
  ('d0000000-0000-4000-8000-000000000001', 'om.tecnico@example.com', '{"nome":"Técnico OM"}'),
  ('d0000000-0000-4000-8000-000000000002', 'om.solic@example.com', '{"nome":"Solicitante OM"}');
update public.perfis set papel = 'tecnico' where id = 'd0000000-0000-4000-8000-000000000001';

insert into public.equipamentos (codigo, nome, categoria, localizacao) values
  ('TOM-0001', 'Equipamento da ordem', 'outro', 'Sala de testes');

create function pg_temp.como(p_usuario uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_usuario, 'role', 'authenticated')::text, true);
$$;
create function pg_temp.ch() returns bigint language sql security definer as $$
  select id from public.chamados where titulo = 'Chamado da ordem';
$$;
create function pg_temp.om() returns bigint language sql security definer as $$
  select max(id) from public.ordens_manutencao where chamado_id = pg_temp.ch();
$$;
create function pg_temp.estado() returns text language sql security definer as $$
  select estado::text from public.equipamentos where codigo = 'TOM-0001';
$$;

-- Solicitante abre o chamado
select pg_temp.como('d0000000-0000-4000-8000-000000000002');
set local role authenticated;
insert into public.chamados (titulo, descricao, categoria, equipamento_id, solicitante_id)
values ('Chamado da ordem', 'Chamado usado nos testes de ordem.', 'falha',
        (select id from public.equipamentos where codigo = 'TOM-0001'), auth.uid());
select throws_like(
  $$insert into public.ordens_manutencao (chamado_id, tipo, responsavel_id)
    values (pg_temp.ch(), 'corretiva', 'd0000000-0000-4000-8000-000000000001')$$,
  '%Somente a equipe técnica%', 'solicitante não cria ordem');
reset role;

select pg_temp.como('d0000000-0000-4000-8000-000000000001');
set local role authenticated;

select throws_like(
  $$insert into public.ordens_manutencao (chamado_id, tipo, responsavel_id)
    values (pg_temp.ch(), 'corretiva', 'd0000000-0000-4000-8000-000000000001')$$,
  '%chamado em triagem, em atendimento ou aguardando%', 'chamado apenas aberto não recebe ordem');

select public.alterar_status_chamado(pg_temp.ch(), 'em_triagem');

select lives_ok(
  $$insert into public.ordens_manutencao (chamado_id, tipo, responsavel_id, diagnostico)
    values (pg_temp.ch(), 'corretiva', 'd0000000-0000-4000-8000-000000000001', 'Diagnóstico inicial.')$$,
  'técnico cria ordem para chamado em triagem');
select is(
  (select equipamento_id from public.ordens_manutencao where id = pg_temp.om()),
  (select id from public.equipamentos where codigo = 'TOM-0001'),
  'ordem recebe automaticamente o equipamento do chamado');
select throws_ok(
  $$insert into public.ordens_manutencao (chamado_id, tipo, responsavel_id)
    values (pg_temp.ch(), 'preventiva', 'd0000000-0000-4000-8000-000000000001')$$,
  '23505', null, 'só pode haver uma ordem ativa por chamado');
select throws_like(
  $$select public.alterar_status_ordem(pg_temp.om(), 'concluida')$$,
  '%Transição de status da ordem inválida: Planejada → Concluída%', 'ordem planejada não pode ser concluída sem execução');

select lives_ok($$select public.alterar_status_ordem(pg_temp.om(), 'em_execucao')$$, 'planejada → em execução');
select isnt((select iniciada_em from public.ordens_manutencao where id = pg_temp.om()), null, 'data de início registrada');
select is(pg_temp.estado(), 'em_manutencao', 'equipamento passa para "em manutenção"');

select throws_like(
  $$update public.ordens_manutencao set tipo = 'evolutiva' where id = pg_temp.om()$$,
  '%tipo de manutenção só pode ser alterado%', 'tipo não muda depois de iniciada');
select throws_like(
  $$select public.alterar_status_ordem(pg_temp.om(), 'concluida')$$,
  '%atividades executadas%', 'concluir exige atividades executadas');

update public.ordens_manutencao
   set atividades_executadas = 'Peça substituída e testada.', resultado = 'resolvido'
 where id = pg_temp.om();

select throws_like(
  $$select public.alterar_status_chamado(pg_temp.ch(), 'em_atendimento')$$,
  '%Atribua um técnico%', 'chamado ainda sem técnico não entra em atendimento');

select lives_ok($$select public.alterar_status_ordem(pg_temp.om(), 'concluida')$$, 'em execução → concluída');
select is(pg_temp.estado(), 'disponivel', 'equipamento volta para "disponível" ao concluir a ordem');
select throws_like(
  $$update public.ordens_manutencao set diagnostico = 'Alterado depois' where id = pg_temp.om()$$,
  '%não pode ser alterada%', 'ordem concluída não pode ser alterada');
select throws_ok(
  $$delete from public.ordens_manutencao where id = pg_temp.om()$$,
  '42501', null, 'ordens não podem ser apagadas');

-- Cancelamento exige motivo
insert into public.ordens_manutencao (chamado_id, tipo, responsavel_id)
values (pg_temp.ch(), 'preventiva', 'd0000000-0000-4000-8000-000000000001');
select throws_like(
  $$select public.alterar_status_ordem(pg_temp.om(), 'cancelada')$$,
  '%motivo do cancelamento%', 'cancelar exige motivo');
reset role;

select is(
  (select count(*)::int from public.eventos where chamado_id = pg_temp.ch() and tipo = 'ordem_status'),
  2, 'histórico do chamado inclui as mudanças de status da ordem');

select * from finish();
rollback;
