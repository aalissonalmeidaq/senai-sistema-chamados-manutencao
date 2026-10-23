-- =============================================================================
-- seed.sql — Dados FICTÍCIOS para o ambiente didático
--
-- Executado automaticamente por `supabase db reset` (e no primeiro
-- `supabase start`). Contém apenas INSERTs/UPDATEs de dados: tabelas,
-- gatilhos e políticas ficam em supabase/migrations/.
--
-- Usuários de teste (senha de todos: Senha@123 — somente para uso local):
--   admin@example.com          Administrador(a)  Alex Moreira
--   tecnico1@example.com       Técnico(a)        Bianca Lopes
--   tecnico2@example.com       Técnico(a)        Caio Ferreira
--   solicitante1@example.com   Solicitante       Daniela Souza
--   solicitante2@example.com   Solicitante       Eduardo Lima
--   solicitante3@example.com   Solicitante       Fernanda Rocha
--
-- Os chamados são criados e movimentados "como" cada usuário (set role
-- authenticated + claims do JWT), passando pelas mesmas regras e políticas
-- que a aplicação usa. Ao final, as datas são distribuídas no passado.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Usuários no Supabase Auth (o gatilho cria os perfis como solicitante)
-- ---------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token
)
select
  '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
  extensions.crypt('Senha@123', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('nome', u.nome), now(), now(),
  '', '', '', '', '', '', '', ''
from (values
  ('a0000000-0000-4000-8000-000000000001'::uuid, 'admin@example.com',        'Alex Moreira'),
  ('a0000000-0000-4000-8000-000000000002'::uuid, 'tecnico1@example.com',     'Bianca Lopes'),
  ('a0000000-0000-4000-8000-000000000003'::uuid, 'tecnico2@example.com',     'Caio Ferreira'),
  ('a0000000-0000-4000-8000-000000000004'::uuid, 'solicitante1@example.com', 'Daniela Souza'),
  ('a0000000-0000-4000-8000-000000000005'::uuid, 'solicitante2@example.com', 'Eduardo Lima'),
  ('a0000000-0000-4000-8000-000000000006'::uuid, 'solicitante3@example.com', 'Fernanda Rocha')
) as u (id, email, nome);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text,
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
       'email', now(), now(), now()
from auth.users u
where u.email like '%@example.com';

-- Papéis da equipe (seed roda como sistema, por isso pode definir papéis).
update public.perfis set papel = 'administrador' where id = 'a0000000-0000-4000-8000-000000000001';
update public.perfis set papel = 'tecnico'
  where id in ('a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000003');

-- ---------------------------------------------------------------------------
-- 2. Funções temporárias de apoio (existem só durante o seed)
-- ---------------------------------------------------------------------------
-- Simula o login: define as claims do JWT lidas por auth.uid().
create function pg_temp.como(p_usuario uuid) returns void language sql as $$
  select set_config('request.jwt.claims',
    json_build_object('sub', p_usuario, 'role', 'authenticated')::text, false);
$$;

create function pg_temp.eq(p_codigo text) returns bigint language sql as $$
  select id from public.equipamentos where codigo = p_codigo;
$$;

create function pg_temp.ch(p_titulo text) returns bigint language sql as $$
  select id from public.chamados where titulo = p_titulo;
$$;

create function pg_temp.om(p_titulo text) returns bigint language sql as $$
  select max(o.id) from public.ordens_manutencao o
  join public.chamados c on c.id = o.chamado_id where c.titulo = p_titulo;
$$;

-- ---------------------------------------------------------------------------
-- 3. Equipamentos (cadastrados pela técnica Bianca)
-- ---------------------------------------------------------------------------
select pg_temp.como('a0000000-0000-4000-8000-000000000002');
set role authenticated;

insert into public.equipamentos (codigo, nome, categoria, localizacao, descricao) values
  ('INF-0001', 'Computador da estação 05', 'informatica', 'Bloco A — Laboratório 1', 'Desktop de uso dos estudantes. Patrimônio fictício.'),
  ('INF-0002', 'Projetor multimídia da sala 12', 'informatica', 'Bloco B — Sala 12', 'Projetor fixo no teto, entrada HDMI.'),
  ('INF-0003', 'Impressora a laser da secretaria', 'informatica', 'Bloco A — Secretaria', 'Impressora monocromática compartilhada.'),
  ('INF-0004', 'Switch de rede do rack 2', 'informatica', 'Bloco C — Sala de servidores', 'Switch de 24 portas do laboratório 1.'),
  ('ELE-0001', 'Quadro de distribuição do Bloco B', 'eletrica', 'Bloco B — Corredor térreo', 'Quadro geral de circuitos das salas 10 a 14.'),
  ('ELE-0002', 'Nobreak 3 kVA do laboratório 2', 'eletrica', 'Bloco A — Laboratório 2', 'Protege os computadores da bancada central.'),
  ('MEC-0001', 'Torno mecânico didático', 'mecanica', 'Oficina mecânica', 'Torno de bancada usado nas aulas práticas.'),
  ('MEC-0002', 'Furadeira de bancada', 'mecanica', 'Oficina mecânica', 'Furadeira com mandril de 16 mm.'),
  ('CLI-0001', 'Ar-condicionado split da biblioteca', 'climatizacao', 'Bloco A — Biblioteca', 'Equipamento de 24.000 BTU.'),
  ('CLI-0002', 'Ar-condicionado split do auditório', 'climatizacao', 'Bloco C — Auditório', 'Equipamento de 36.000 BTU.'),
  ('LAB-0001', 'Osciloscópio digital da bancada 3', 'laboratorio', 'Bloco C — Laboratório de eletrônica', 'Osciloscópio de 2 canais.'),
  ('LAB-0002', 'Fonte de bancada regulável', 'laboratorio', 'Bloco C — Laboratório de eletrônica', 'Retirada de uso aguardando descarte.'),
  ('MOB-0001', 'Cadeira ergonômica da recepção', 'mobiliario', 'Bloco A — Recepção', 'Cadeira giratória com rodízios.');

update public.equipamentos set estado = 'inativo' where codigo = 'LAB-0002';

reset role;

-- ---------------------------------------------------------------------------
-- 4. Chamados abertos pelos solicitantes
-- ---------------------------------------------------------------------------
-- Daniela (solicitante1)
select pg_temp.como('a0000000-0000-4000-8000-000000000004');
set role authenticated;
insert into public.chamados (titulo, descricao, categoria, prioridade, equipamento_id, solicitante_id) values
  ('Computador não liga', 'Ao apertar o botão, o computador da estação 05 não liga e nenhuma luz acende.', 'falha', 'alta', pg_temp.eq('INF-0001'), auth.uid()),
  ('Ar-condicionado pingando água', 'O aparelho da biblioteca está pingando água sobre a mesa de estudos.', 'falha', 'alta', pg_temp.eq('CLI-0001'), auth.uid()),
  ('Osciloscópio sem sinal no canal 2', 'O canal 2 não mostra sinal, mesmo com a ponta de prova conectada.', 'falha', 'media', pg_temp.eq('LAB-0001'), auth.uid()),
  ('Rede lenta no laboratório 1', 'Desde ontem as páginas demoram mais de um minuto para abrir no laboratório 1.', 'desempenho', 'media', pg_temp.eq('INF-0004'), auth.uid());
reset role;

-- Eduardo (solicitante2)
select pg_temp.como('a0000000-0000-4000-8000-000000000005');
set role authenticated;
insert into public.chamados (titulo, descricao, categoria, prioridade, equipamento_id, solicitante_id) values
  ('Projetor com imagem amarelada', 'A imagem do projetor da sala 12 está amarelada e com pouco brilho.', 'desempenho', 'media', pg_temp.eq('INF-0002'), auth.uid()),
  ('Disjuntor desarmando na sala 12', 'O disjuntor das tomadas da sala 12 desarma quando ligamos mais de 5 computadores.', 'seguranca', 'alta', pg_temp.eq('ELE-0001'), auth.uid()),
  ('Nobreak apitando', 'O nobreak do laboratório 2 apita continuamente desde a queda de energia.', 'falha', 'media', pg_temp.eq('ELE-0002'), auth.uid()),
  ('Controle remoto extra para o auditório', 'Solicito um controle remoto reserva para o ar-condicionado do auditório.', 'melhoria', 'baixa', pg_temp.eq('CLI-0002'), auth.uid()),
  ('Cabo HDMI com mau contato', 'A imagem do projetor some quando o cabo HDMI é movimentado.', 'falha', 'baixa', pg_temp.eq('INF-0002'), auth.uid()),
  ('Teclado com teclas falhando', 'As teclas A e S do teclado da estação 05 falham com frequência.', 'falha', 'baixa', pg_temp.eq('INF-0001'), auth.uid());
reset role;

-- Fernanda (solicitante3)
select pg_temp.como('a0000000-0000-4000-8000-000000000006');
set role authenticated;
insert into public.chamados (titulo, descricao, categoria, prioridade, equipamento_id, solicitante_id) values
  ('Impressora atolando papel', 'A impressora da secretaria atola papel a cada 3 ou 4 folhas.', 'falha', 'media', pg_temp.eq('INF-0003'), auth.uid()),
  ('Ruído anormal no torno', 'O torno faz um ruído metálico alto ao trabalhar em rotação média.', 'falha', 'alta', pg_temp.eq('MEC-0001'), auth.uid()),
  ('Cadeira com rodízio quebrado', 'Um dos rodízios da cadeira da recepção quebrou.', 'falha', 'baixa', pg_temp.eq('MOB-0001'), auth.uid());
reset role;

-- Caio (técnico) abre um chamado de manutenção preventiva programada
select pg_temp.como('a0000000-0000-4000-8000-000000000003');
set role authenticated;
insert into public.chamados (titulo, descricao, categoria, prioridade, equipamento_id, solicitante_id) values
  ('Preventiva semestral da furadeira', 'Manutenção preventiva programada: lubrificação, aperto e verificação de correia.', 'outro', 'baixa', pg_temp.eq('MEC-0002'), auth.uid());
reset role;

-- ---------------------------------------------------------------------------
-- 5. Atendimento pela equipe técnica (Bianca = tecnico1, Caio = tecnico2)
-- ---------------------------------------------------------------------------
select pg_temp.como('a0000000-0000-4000-8000-000000000002');
set role authenticated;

-- "Computador não liga": fluxo completo até resolvido (encerrado depois pela solicitante)
select public.alterar_status_chamado(pg_temp.ch('Computador não liga'), 'em_triagem');
update public.chamados set tecnico_id = 'a0000000-0000-4000-8000-000000000002' where id = pg_temp.ch('Computador não liga');
select public.alterar_status_chamado(pg_temp.ch('Computador não liga'), 'em_atendimento');
insert into public.ordens_manutencao (chamado_id, tipo, responsavel_id, diagnostico, plano_acao)
values (pg_temp.ch('Computador não liga'), 'corretiva', 'a0000000-0000-4000-8000-000000000002',
        'Fonte de alimentação queimada (sem tensão na saída).', 'Substituir a fonte por outra de mesma potência e testar.');
select public.alterar_status_ordem(pg_temp.om('Computador não liga'), 'em_execucao');
update public.ordens_manutencao
   set atividades_executadas = 'Fonte substituída. Computador ligado e testado por 30 minutos sem falhas.',
       resultado = 'resolvido'
 where id = pg_temp.om('Computador não liga');
select public.alterar_status_ordem(pg_temp.om('Computador não liga'), 'concluida');
insert into public.comentarios_chamado (chamado_id, texto, interno) values
  (pg_temp.ch('Computador não liga'), 'Fonte trocada. Pode testar o computador, por favor?', false);
select public.alterar_status_chamado(pg_temp.ch('Computador não liga'), 'resolvido', 'Fonte de alimentação substituída.');

-- "Projetor com imagem amarelada": resolvido, aguardando confirmação do solicitante
select public.alterar_status_chamado(pg_temp.ch('Projetor com imagem amarelada'), 'em_triagem');
update public.chamados set tecnico_id = 'a0000000-0000-4000-8000-000000000002' where id = pg_temp.ch('Projetor com imagem amarelada');
select public.alterar_status_chamado(pg_temp.ch('Projetor com imagem amarelada'), 'em_atendimento');
insert into public.ordens_manutencao (chamado_id, tipo, responsavel_id, diagnostico, plano_acao)
values (pg_temp.ch('Projetor com imagem amarelada'), 'corretiva', 'a0000000-0000-4000-8000-000000000002',
        'Filtro de ar obstruído e lâmpada com 95% da vida útil.', 'Limpar filtro e substituir lâmpada.');
select public.alterar_status_ordem(pg_temp.om('Projetor com imagem amarelada'), 'em_execucao');
update public.ordens_manutencao
   set atividades_executadas = 'Filtro limpo e lâmpada substituída. Brilho e cores normais.', resultado = 'resolvido'
 where id = pg_temp.om('Projetor com imagem amarelada');
select public.alterar_status_ordem(pg_temp.om('Projetor com imagem amarelada'), 'concluida');
select public.alterar_status_chamado(pg_temp.ch('Projetor com imagem amarelada'), 'resolvido', 'Lâmpada substituída e filtro limpo.');

-- "Ar-condicionado pingando água": em atendimento, ordem em execução (equipamento em manutenção)
select public.alterar_status_chamado(pg_temp.ch('Ar-condicionado pingando água'), 'em_triagem');
update public.chamados set tecnico_id = 'a0000000-0000-4000-8000-000000000002' where id = pg_temp.ch('Ar-condicionado pingando água');
select public.alterar_status_chamado(pg_temp.ch('Ar-condicionado pingando água'), 'em_atendimento');
insert into public.ordens_manutencao (chamado_id, tipo, responsavel_id, diagnostico, plano_acao)
values (pg_temp.ch('Ar-condicionado pingando água'), 'corretiva', 'a0000000-0000-4000-8000-000000000002',
        'Dreno obstruído por sujeira.', 'Desobstruir o dreno, limpar a bandeja e testar o escoamento.');
select public.alterar_status_ordem(pg_temp.om('Ar-condicionado pingando água'), 'em_execucao');
insert into public.comentarios_chamado (chamado_id, texto, interno) values
  (pg_temp.ch('Ar-condicionado pingando água'), 'Isolar a área da mesa até concluir o serviço.', true);

-- "Impressora atolando papel": aguardando peça, ordem planejada
select public.alterar_status_chamado(pg_temp.ch('Impressora atolando papel'), 'em_triagem');
update public.chamados set tecnico_id = 'a0000000-0000-4000-8000-000000000002' where id = pg_temp.ch('Impressora atolando papel');
select public.alterar_status_chamado(pg_temp.ch('Impressora atolando papel'), 'em_atendimento');
insert into public.ordens_manutencao (chamado_id, tipo, responsavel_id, diagnostico, plano_acao)
values (pg_temp.ch('Impressora atolando papel'), 'corretiva', 'a0000000-0000-4000-8000-000000000002',
        'Rolete de tração gasto.', 'Substituir o rolete de tração quando a peça chegar.');
select public.alterar_status_chamado(pg_temp.ch('Impressora atolando papel'), 'aguardando', 'Aguardando entrega do rolete de tração.');

reset role;

select pg_temp.como('a0000000-0000-4000-8000-000000000003');
set role authenticated;

-- "Disjuntor desarmando na sala 12": triagem eleva prioridade para crítica
select public.alterar_status_chamado(pg_temp.ch('Disjuntor desarmando na sala 12'), 'em_triagem');
update public.chamados set prioridade = 'critica', tecnico_id = 'a0000000-0000-4000-8000-000000000003'
 where id = pg_temp.ch('Disjuntor desarmando na sala 12');
select public.alterar_status_chamado(pg_temp.ch('Disjuntor desarmando na sala 12'), 'em_atendimento');
insert into public.ordens_manutencao (chamado_id, tipo, responsavel_id, diagnostico, plano_acao)
values (pg_temp.ch('Disjuntor desarmando na sala 12'), 'corretiva', 'a0000000-0000-4000-8000-000000000003',
        'Circuito sobrecarregado; possível subdimensionamento do disjuntor.', 'Medir corrente, redistribuir cargas e avaliar troca do disjuntor.');
insert into public.comentarios_chamado (chamado_id, texto, interno) values
  (pg_temp.ch('Disjuntor desarmando na sala 12'), 'Por segurança, limite o uso a 4 computadores até a conclusão.', false);

-- "Ruído anormal no torno": apenas em triagem
select public.alterar_status_chamado(pg_temp.ch('Ruído anormal no torno'), 'em_triagem');

-- "Nobreak apitando": resolvido (encerrado depois pelo solicitante)
select public.alterar_status_chamado(pg_temp.ch('Nobreak apitando'), 'em_triagem');
update public.chamados set tecnico_id = 'a0000000-0000-4000-8000-000000000003' where id = pg_temp.ch('Nobreak apitando');
select public.alterar_status_chamado(pg_temp.ch('Nobreak apitando'), 'em_atendimento');
insert into public.ordens_manutencao (chamado_id, tipo, responsavel_id, diagnostico, plano_acao)
values (pg_temp.ch('Nobreak apitando'), 'corretiva', 'a0000000-0000-4000-8000-000000000003',
        'Bateria interna sem carga após a queda de energia.', 'Substituir a bateria e executar autoteste.');
select public.alterar_status_ordem(pg_temp.om('Nobreak apitando'), 'em_execucao');
update public.ordens_manutencao
   set atividades_executadas = 'Bateria substituída. Autoteste aprovado.', resultado = 'resolvido'
 where id = pg_temp.om('Nobreak apitando');
select public.alterar_status_ordem(pg_temp.om('Nobreak apitando'), 'concluida');
select public.alterar_status_chamado(pg_temp.ch('Nobreak apitando'), 'resolvido', 'Bateria do nobreak substituída.');

-- "Osciloscópio sem sinal no canal 2": resolvido, reaberto pela solicitante, nova ordem planejada
select public.alterar_status_chamado(pg_temp.ch('Osciloscópio sem sinal no canal 2'), 'em_triagem');
update public.chamados set tecnico_id = 'a0000000-0000-4000-8000-000000000003' where id = pg_temp.ch('Osciloscópio sem sinal no canal 2');
select public.alterar_status_chamado(pg_temp.ch('Osciloscópio sem sinal no canal 2'), 'em_atendimento');
insert into public.ordens_manutencao (chamado_id, tipo, responsavel_id, diagnostico, plano_acao)
values (pg_temp.ch('Osciloscópio sem sinal no canal 2'), 'corretiva', 'a0000000-0000-4000-8000-000000000003',
        'Ponta de prova do canal 2 com cabo rompido.', 'Substituir a ponta de prova.');
select public.alterar_status_ordem(pg_temp.om('Osciloscópio sem sinal no canal 2'), 'em_execucao');
update public.ordens_manutencao
   set atividades_executadas = 'Ponta de prova substituída. Sinal de teste visível no canal 2.', resultado = 'parcial'
 where id = pg_temp.om('Osciloscópio sem sinal no canal 2');
select public.alterar_status_ordem(pg_temp.om('Osciloscópio sem sinal no canal 2'), 'concluida');
select public.alterar_status_chamado(pg_temp.ch('Osciloscópio sem sinal no canal 2'), 'resolvido', 'Ponta de prova substituída.');

-- "Cabo HDMI com mau contato": ordem cancelada e chamado resolvido
select public.alterar_status_chamado(pg_temp.ch('Cabo HDMI com mau contato'), 'em_triagem');
update public.chamados set tecnico_id = 'a0000000-0000-4000-8000-000000000003' where id = pg_temp.ch('Cabo HDMI com mau contato');
select public.alterar_status_chamado(pg_temp.ch('Cabo HDMI com mau contato'), 'em_atendimento');
insert into public.ordens_manutencao (chamado_id, tipo, responsavel_id, diagnostico, plano_acao)
values (pg_temp.ch('Cabo HDMI com mau contato'), 'corretiva', 'a0000000-0000-4000-8000-000000000003',
        'Conector HDMI do cabo com folga.', 'Substituir o cabo HDMI.');
select public.alterar_status_ordem(pg_temp.om('Cabo HDMI com mau contato'), 'cancelada',
        'Cabo reserva já disponível na sala; troca feita pelo professor responsável.');
select public.alterar_status_chamado(pg_temp.ch('Cabo HDMI com mau contato'), 'resolvido', 'Cabo trocado pelo cabo reserva da sala.');

-- "Cadeira com rodízio quebrado": encerrado na triagem (fora do escopo)
select public.alterar_status_chamado(pg_temp.ch('Cadeira com rodízio quebrado'), 'em_triagem');
select public.alterar_status_chamado(pg_temp.ch('Cadeira com rodízio quebrado'), 'encerrado',
        'Mobiliário é atendido pelo setor administrativo. Solicitação encaminhada.');

-- "Preventiva semestral da furadeira": preventiva em execução
select public.alterar_status_chamado(pg_temp.ch('Preventiva semestral da furadeira'), 'em_triagem');
update public.chamados set tecnico_id = 'a0000000-0000-4000-8000-000000000003' where id = pg_temp.ch('Preventiva semestral da furadeira');
select public.alterar_status_chamado(pg_temp.ch('Preventiva semestral da furadeira'), 'em_atendimento');
insert into public.ordens_manutencao (chamado_id, tipo, responsavel_id, plano_acao)
values (pg_temp.ch('Preventiva semestral da furadeira'), 'preventiva', 'a0000000-0000-4000-8000-000000000003',
        '1. Lubrificar o eixo. 2. Verificar tensão da correia. 3. Reapertar fixações.');
select public.alterar_status_ordem(pg_temp.om('Preventiva semestral da furadeira'), 'em_execucao');

reset role;

-- Solicitantes confirmam ou reabrem chamados resolvidos
select pg_temp.como('a0000000-0000-4000-8000-000000000004');
set role authenticated;
select public.alterar_status_chamado(pg_temp.ch('Computador não liga'), 'encerrado');
select public.alterar_status_chamado(pg_temp.ch('Osciloscópio sem sinal no canal 2'), 'em_atendimento',
        'O canal 2 voltou a funcionar, mas o canal 1 agora apresenta ruído.');
reset role;

select pg_temp.como('a0000000-0000-4000-8000-000000000005');
set role authenticated;
select public.alterar_status_chamado(pg_temp.ch('Nobreak apitando'), 'encerrado');
select public.alterar_status_chamado(pg_temp.ch('Cabo HDMI com mau contato'), 'encerrado');
reset role;

-- Nova ordem para o chamado reaberto do osciloscópio
select pg_temp.como('a0000000-0000-4000-8000-000000000003');
set role authenticated;
insert into public.ordens_manutencao (chamado_id, tipo, responsavel_id, plano_acao)
values (pg_temp.ch('Osciloscópio sem sinal no canal 2'), 'corretiva', 'a0000000-0000-4000-8000-000000000003',
        'Verificar aterramento e calibrar o canal 1.');
reset role;

-- ---------------------------------------------------------------------------
-- 6. Distribui as datas no passado (contexto de sistema)
--    Cada chamado recebe uma "idade" em dias; seus eventos ficam espalhados
--    entre a abertura e o momento atual, mantendo a ordem em que ocorreram.
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', '', false);

create temporary table idade_chamado (titulo text primary key, dias int not null);
insert into idade_chamado values
  ('Nobreak apitando', 25),
  ('Computador não liga', 20),
  ('Cadeira com rodízio quebrado', 15),
  ('Cabo HDMI com mau contato', 12),
  ('Projetor com imagem amarelada', 10),
  ('Osciloscópio sem sinal no canal 2', 8),
  ('Impressora atolando papel', 6),
  ('Ar-condicionado pingando água', 5),
  ('Preventiva semestral da furadeira', 3),
  ('Ruído anormal no torno', 2),
  ('Disjuntor desarmando na sala 12', 1),
  ('Controle remoto extra para o auditório', 1),
  ('Rede lenta no laboratório 1', 0),
  ('Teclado com teclas falhando', 0);

update public.perfis set criado_em = now() - interval '90 days', atualizado_em = now() - interval '90 days';

-- Eventos de cadastro dos equipamentos: 60 dias atrás
update public.eventos set criado_em = now() - interval '60 days' where tipo = 'equipamento_criado';
update public.eventos set criado_em = now() - interval '59 days'
 where tipo = 'equipamento_estado' and chamado_id is null and dados ->> 'para' = 'inativo';

-- Eventos dos chamados: espalhados de (abertura) até no máximo 1 hora atrás
with base as (
  select c.id as chamado_id,
         now() - make_interval(days => i.dias) - interval '2 hours' as inicio,
         greatest(make_interval(days => i.dias) * 0.8, interval '20 minutes') as janela
  from public.chamados c join idade_chamado i on i.titulo = c.titulo
),
ordenados as (
  select e.id, b.inicio, b.janela,
         row_number() over (partition by e.chamado_id order by e.id) - 1 as posicao,
         count(*) over (partition by e.chamado_id) as total
  from public.eventos e join base b on b.chamado_id = e.chamado_id
)
update public.eventos e
   set criado_em = o.inicio + o.janela * (o.posicao::numeric / greatest(o.total - 1, 1))
  from ordenados o
 where o.id = e.id;

-- Mudança automática de estado do equipamento: logo após o evento da ordem que a causou
update public.eventos e
   set criado_em = anterior.criado_em + interval '1 minute'
  from public.eventos anterior
 where e.tipo = 'equipamento_estado' and e.chamado_id is null
   and anterior.id = e.id - 1 and anterior.tipo = 'ordem_status';

update public.chamados c
   set criado_em     = (select min(e.criado_em) from public.eventos e where e.chamado_id = c.id),
       resolvido_em  = case when c.resolvido_em is null then null else
                         (select max(e.criado_em) from public.eventos e
                           where e.chamado_id = c.id and e.tipo = 'chamado_status' and e.dados ->> 'para' = 'resolvido') end,
       encerrado_em  = case when c.encerrado_em is null then null else
                         (select max(e.criado_em) from public.eventos e
                           where e.chamado_id = c.id and e.tipo = 'chamado_status' and e.dados ->> 'para' = 'encerrado') end,
       atualizado_em = (select max(e.criado_em) from public.eventos e where e.chamado_id = c.id);

update public.ordens_manutencao o
   set criado_em     = (select min(e.criado_em) from public.eventos e where e.ordem_id = o.id),
       iniciada_em   = case when o.iniciada_em is null then null else
                         (select max(e.criado_em) from public.eventos e
                           where e.ordem_id = o.id and e.tipo = 'ordem_status' and e.dados ->> 'para' = 'em_execucao') end,
       concluida_em  = case when o.concluida_em is null then null else
                         (select max(e.criado_em) from public.eventos e
                           where e.ordem_id = o.id and e.tipo = 'ordem_status' and e.dados ->> 'para' = 'concluida') end,
       atualizado_em = (select max(e.criado_em) from public.eventos e where e.ordem_id = o.id);

update public.comentarios_chamado cm
   set criado_em = e.criado_em
  from public.eventos e
 where e.tipo = 'comentario' and (e.dados ->> 'comentario_id')::bigint = cm.id;

update public.equipamentos q
   set criado_em     = now() - interval '60 days',
       atualizado_em = (select max(e.criado_em) from public.eventos e where e.equipamento_id = q.id);

drop table idade_chamado;
