-- Testes de perfis, papéis e acesso sem login.
begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

-- Usuários próprios do teste (independentes do seed)
insert into auth.users (id, email, raw_user_meta_data) values
  ('b0000000-0000-4000-8000-000000000001', 'teste.admin@example.com', '{"nome":"Admin Teste"}'),
  ('b0000000-0000-4000-8000-000000000002', 'teste.solic@example.com', '{"nome":"Solicitante Teste", "papel":"administrador"}');
update public.perfis set papel = 'administrador' where id = 'b0000000-0000-4000-8000-000000000001';

create function pg_temp.como(p_usuario uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_usuario, 'role', 'authenticated')::text, true);
$$;

-- Cadastro cria perfil automaticamente, sempre como solicitante
select is(
  (select papel::text from public.perfis where id = 'b0000000-0000-4000-8000-000000000002'),
  'solicitante',
  'perfil novo é solicitante mesmo se o cadastro enviar papel nos metadados');
select is(
  (select nome from public.perfis where id = 'b0000000-0000-4000-8000-000000000002'),
  'Solicitante Teste',
  'nome do perfil vem dos metadados do cadastro');

-- Solicitante tentando elevar o próprio papel
select pg_temp.como('b0000000-0000-4000-8000-000000000002');
set local role authenticated;

select throws_ok(
  $$update public.perfis set papel = 'administrador' where id = auth.uid()$$,
  '42501', null, 'solicitante não tem privilégio para alterar a coluna papel');
select lives_ok(
  $$update public.perfis set nome = 'Nome Alterado' where id = auth.uid()$$,
  'usuário pode alterar o próprio nome');
select throws_like(
  $$select public.definir_papel(auth.uid(), 'administrador')$$,
  '%Apenas administradores%', 'solicitante não pode usar definir_papel');
select throws_ok(
  $$insert into public.perfis (id, nome) values (gen_random_uuid(), 'Intruso')$$,
  '42501', null, 'não é possível inserir perfis diretamente');
select is_empty(
  $$update public.perfis set nome = 'Hack' where id = 'b0000000-0000-4000-8000-000000000001' returning id$$,
  'usuário não altera o nome de outro usuário (RLS)');

reset role;

-- Administrador promove e protege o último administrador
select pg_temp.como('b0000000-0000-4000-8000-000000000001');
set local role authenticated;

select lives_ok(
  $$select public.definir_papel('b0000000-0000-4000-8000-000000000002', 'tecnico')$$,
  'administrador promove solicitante a técnico');
select is(
  (select papel::text from public.perfis where id = 'b0000000-0000-4000-8000-000000000002'),
  'tecnico', 'papel atualizado para técnico');

reset role;
-- garante que este seja o único administrador para testar a proteção
update public.perfis set papel = 'tecnico'
 where papel = 'administrador' and id <> 'b0000000-0000-4000-8000-000000000001';
set local role authenticated;

select throws_like(
  $$select public.definir_papel(auth.uid(), 'solicitante')$$,
  '%último administrador%', 'não é possível remover o último administrador');

reset role;

-- Visitante sem login (anon) não lê nenhuma tabela
set local role anon;
select throws_ok($$select * from public.chamados$$, '42501', null, 'anon não lê chamados');
select throws_ok($$select * from public.equipamentos$$, '42501', null, 'anon não lê equipamentos');
reset role;

select * from finish();
rollback;
