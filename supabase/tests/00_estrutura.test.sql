-- Testes de estrutura: tabelas, RLS ativo e restrições essenciais.
-- Executar com: npm run db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(19);

select has_table('public', 'perfis', 'tabela perfis existe');
select has_table('public', 'equipamentos', 'tabela equipamentos existe');
select has_table('public', 'chamados', 'tabela chamados existe');
select has_table('public', 'comentarios_chamado', 'tabela comentarios_chamado existe');
select has_table('public', 'ordens_manutencao', 'tabela ordens_manutencao existe');
select has_table('public', 'eventos', 'tabela eventos existe');

-- RLS precisa estar ativo em TODAS as tabelas expostas pela API
select is(
  (select count(*)::int from pg_tables where schemaname = 'public' and not rowsecurity),
  0,
  'todas as tabelas do schema public têm RLS ativo'
);

select col_is_unique('public', 'equipamentos', 'codigo', 'código do equipamento é único');
select col_is_fk('public', 'chamados', 'equipamento_id', 'chamado referencia equipamento');
select col_is_fk('public', 'ordens_manutencao', 'chamado_id', 'ordem referencia chamado');
select col_not_null('public', 'chamados', 'solicitante_id', 'chamado sempre tem solicitante');

select has_type('public', 'status_chamado', 'tipo status_chamado existe');
select enum_has_labels('public', 'status_chamado',
  array['aberto', 'em_triagem', 'em_atendimento', 'aguardando', 'resolvido', 'encerrado'],
  'status de chamado são os seis previstos');
select enum_has_labels('public', 'status_ordem',
  array['planejada', 'em_execucao', 'concluida', 'cancelada'],
  'status de ordem são os quatro previstos');
select enum_has_labels('public', 'tipo_manutencao',
  array['corretiva', 'preventiva', 'evolutiva'],
  'tipos de manutenção previstos');

-- Formato do código patrimonial
select throws_ok(
  $$insert into public.equipamentos (codigo, nome, categoria, localizacao) values ('ABC123', 'Equipamento teste', 'outro', 'Sala X')$$,
  '23514', null, 'código fora do padrão AAA-0000 é rejeitado');

select lives_ok(
  $$insert into public.equipamentos (codigo, nome, categoria, localizacao) values ('tst-9999', 'Equipamento teste', 'outro', 'Sala X')$$,
  'código em minúsculas é normalizado para maiúsculas');

select is((select codigo from public.equipamentos where codigo = 'TST-9999'), 'TST-9999', 'código salvo em maiúsculas');

select throws_ok(
  $$insert into public.equipamentos (codigo, nome, categoria, localizacao) values ('TST-9999', 'Outro', 'outro', 'Sala Y')$$,
  '23505', null, 'código duplicado é rejeitado');

select * from finish();
rollback;
