-- =============================================================================
-- Migração 1 — Tipos controlados e tabelas
-- Sistema de Chamados e Ordens de Manutenção (uso didático, dados fictícios)
--
-- Modelo:
--   perfis (1:1 auth.users) ─┬─< chamados >── equipamentos
--                            ├─< comentarios_chamado >── chamados
--                            └─< ordens_manutencao >── chamados / equipamentos
--   eventos: trilha de auditoria ligada a equipamento, chamado e/ou ordem
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Tipos enumerados (valores controlados). Os rótulos em português para a
-- interface ficam em lib/dominio/rotulos.ts.
-- ---------------------------------------------------------------------------
create type public.papel_usuario as enum ('solicitante', 'tecnico', 'administrador');

create type public.estado_equipamento as enum ('disponivel', 'em_manutencao', 'inativo');

create type public.categoria_equipamento as enum (
  'informatica', 'eletrica', 'mecanica', 'climatizacao', 'laboratorio', 'mobiliario', 'outro'
);

create type public.status_chamado as enum (
  'aberto', 'em_triagem', 'em_atendimento', 'aguardando', 'resolvido', 'encerrado'
);

create type public.prioridade_chamado as enum ('baixa', 'media', 'alta', 'critica');

create type public.categoria_chamado as enum ('falha', 'desempenho', 'seguranca', 'melhoria', 'outro');

create type public.tipo_manutencao as enum ('corretiva', 'preventiva', 'evolutiva');

create type public.status_ordem as enum ('planejada', 'em_execucao', 'concluida', 'cancelada');

create type public.resultado_ordem as enum ('resolvido', 'parcial', 'nao_resolvido');

-- ---------------------------------------------------------------------------
-- perfis: dados do usuário usados pela aplicação. Criado automaticamente
-- por gatilho quando alguém se cadastra no Supabase Auth.
-- Guardamos apenas nome e papel (sem e-mail) para evitar dados pessoais
-- desnecessários fora do Auth.
-- ---------------------------------------------------------------------------
create table public.perfis (
  id            uuid primary key references auth.users (id) on delete cascade,
  nome          text not null check (char_length(btrim(nome)) between 2 and 120),
  papel         public.papel_usuario not null default 'solicitante',
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table public.perfis is 'Perfil de cada usuário autenticado. Papel inicial: solicitante.';

-- ---------------------------------------------------------------------------
-- equipamentos
-- ---------------------------------------------------------------------------
create table public.equipamentos (
  id            bigint generated always as identity primary key,
  codigo        text not null,
  nome          text not null,
  categoria     public.categoria_equipamento not null,
  localizacao   text not null,
  descricao     text not null default '',
  estado        public.estado_equipamento not null default 'disponivel',
  criado_por    uuid references public.perfis (id) on delete set null,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  constraint equipamentos_codigo_unico unique (codigo),
  -- Código patrimonial fictício: 3 letras maiúsculas, hífen e 4 dígitos. Ex.: INF-0001
  constraint equipamentos_codigo_formato check (codigo ~ '^[A-Z]{3}-[0-9]{4}$'),
  constraint equipamentos_nome_tamanho check (char_length(btrim(nome)) between 3 and 120),
  constraint equipamentos_localizacao_tamanho check (char_length(btrim(localizacao)) between 2 and 120),
  constraint equipamentos_descricao_tamanho check (char_length(descricao) <= 1000)
);

comment on table public.equipamentos is 'Equipamentos fictícios atendidos pelo setor de manutenção.';

create index equipamentos_estado_idx on public.equipamentos (estado);
create index equipamentos_categoria_idx on public.equipamentos (categoria);

-- ---------------------------------------------------------------------------
-- chamados
-- ---------------------------------------------------------------------------
create table public.chamados (
  id             bigint generated always as identity primary key,
  titulo         text not null,
  descricao      text not null,
  categoria      public.categoria_chamado not null,
  prioridade     public.prioridade_chamado not null default 'media',
  status         public.status_chamado not null default 'aberto',
  equipamento_id bigint not null references public.equipamentos (id) on delete restrict,
  solicitante_id uuid not null references public.perfis (id) on delete restrict,
  tecnico_id     uuid references public.perfis (id) on delete set null,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  resolvido_em   timestamptz,
  encerrado_em   timestamptz,

  constraint chamados_titulo_tamanho check (char_length(btrim(titulo)) between 5 and 120),
  -- A camada de aplicação valida "mínimo de 10 caracteres sem contar espaços";
  -- o banco garante ao menos que a descrição não esteja vazia.
  constraint chamados_descricao_preenchida check (char_length(btrim(descricao)) > 0),
  constraint chamados_descricao_tamanho check (char_length(descricao) <= 2000),
  -- Em atendimento, aguardando ou resolvido exige técnico responsável.
  constraint chamados_tecnico_obrigatorio check (
    status not in ('em_atendimento', 'aguardando', 'resolvido') or tecnico_id is not null
  ),
  constraint chamados_resolvido_em_coerente check (
    (status = 'resolvido') = (resolvido_em is not null) or status = 'encerrado'
  ),
  constraint chamados_encerrado_em_coerente check ((status = 'encerrado') = (encerrado_em is not null))
);

comment on table public.chamados is 'Solicitações de atendimento relacionadas a um equipamento.';

create index chamados_status_idx on public.chamados (status);
create index chamados_prioridade_idx on public.chamados (prioridade);
create index chamados_equipamento_idx on public.chamados (equipamento_id);
create index chamados_solicitante_idx on public.chamados (solicitante_id);
create index chamados_tecnico_idx on public.chamados (tecnico_id);
create index chamados_criado_em_idx on public.chamados (criado_em desc);

-- ---------------------------------------------------------------------------
-- comentarios_chamado: comentários internos (somente equipe) ou públicos
-- (visíveis também ao solicitante). Não podem ser editados nem apagados.
-- ---------------------------------------------------------------------------
create table public.comentarios_chamado (
  id         bigint generated always as identity primary key,
  chamado_id bigint not null references public.chamados (id) on delete cascade,
  autor_id   uuid references public.perfis (id) on delete set null,
  texto      text not null check (char_length(btrim(texto)) between 1 and 2000),
  interno    boolean not null default true,
  criado_em  timestamptz not null default now()
);

create index comentarios_chamado_chamado_idx on public.comentarios_chamado (chamado_id, criado_em);

-- ---------------------------------------------------------------------------
-- ordens_manutencao
-- ---------------------------------------------------------------------------
create table public.ordens_manutencao (
  id                    bigint generated always as identity primary key,
  chamado_id            bigint not null references public.chamados (id) on delete restrict,
  equipamento_id        bigint not null references public.equipamentos (id) on delete restrict,
  tipo                  public.tipo_manutencao not null,
  status                public.status_ordem not null default 'planejada',
  responsavel_id        uuid not null references public.perfis (id) on delete restrict,
  diagnostico           text not null default '',
  plano_acao            text not null default '',
  atividades_executadas text not null default '',
  resultado             public.resultado_ordem,
  iniciada_em           timestamptz,
  concluida_em          timestamptz,
  criado_em             timestamptz not null default now(),
  atualizado_em         timestamptz not null default now(),

  constraint ordens_textos_tamanho check (
    char_length(diagnostico) <= 2000
    and char_length(plano_acao) <= 2000
    and char_length(atividades_executadas) <= 4000
  ),
  -- Ordem concluída precisa de diagnóstico, atividades, resultado e datas.
  constraint ordens_conclusao_completa check (
    status <> 'concluida' or (
      char_length(btrim(diagnostico)) > 0
      and char_length(btrim(atividades_executadas)) > 0
      and resultado is not null
      and iniciada_em is not null
      and concluida_em is not null
    )
  ),
  constraint ordens_inicio_coerente check (status <> 'em_execucao' or iniciada_em is not null),
  constraint ordens_datas_ordenadas check (concluida_em is null or iniciada_em is null or concluida_em >= iniciada_em)
);

comment on table public.ordens_manutencao is 'Ordem de serviço de manutenção ligada a um chamado e ao seu equipamento.';

-- No máximo uma ordem ativa (planejada ou em execução) por chamado.
create unique index ordens_uma_ativa_por_chamado
  on public.ordens_manutencao (chamado_id)
  where status in ('planejada', 'em_execucao');

create index ordens_status_idx on public.ordens_manutencao (status);
create index ordens_equipamento_idx on public.ordens_manutencao (equipamento_id);
create index ordens_responsavel_idx on public.ordens_manutencao (responsavel_id);

-- ---------------------------------------------------------------------------
-- eventos: trilha de auditoria (histórico). Inserida somente por gatilhos.
-- Não guarda segredos nem textos completos de comentários.
-- ---------------------------------------------------------------------------
create table public.eventos (
  id                  bigint generated always as identity primary key,
  criado_em           timestamptz not null default clock_timestamp(),
  autor_id            uuid references public.perfis (id) on delete set null,
  tipo                text not null,
  descricao           text not null,
  dados               jsonb not null default '{}'::jsonb,
  equipamento_id      bigint references public.equipamentos (id) on delete cascade,
  chamado_id          bigint references public.chamados (id) on delete cascade,
  ordem_id            bigint references public.ordens_manutencao (id) on delete cascade,
  visivel_solicitante boolean not null default true,

  constraint eventos_tipo_valido check (tipo in (
    'equipamento_criado', 'equipamento_atualizado', 'equipamento_estado',
    'chamado_aberto', 'chamado_status', 'chamado_atribuido', 'chamado_atualizado',
    'comentario', 'ordem_criada', 'ordem_status', 'ordem_atualizada'
  )),
  constraint eventos_tem_alvo check (num_nonnulls(equipamento_id, chamado_id, ordem_id) > 0)
);

comment on table public.eventos is 'Histórico cronológico de ações relevantes (auditoria).';

create index eventos_equipamento_idx on public.eventos (equipamento_id, criado_em);
create index eventos_chamado_idx on public.eventos (chamado_id, criado_em);
create index eventos_ordem_idx on public.eventos (ordem_id, criado_em);
