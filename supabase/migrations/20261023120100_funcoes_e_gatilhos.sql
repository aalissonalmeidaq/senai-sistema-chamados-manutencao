-- =============================================================================
-- Migração 2 — Funções auxiliares, regras de negócio e trilha de auditoria
--
-- As regras de transição de status existem em DUAS camadas:
--   1. lib/regras/*.ts  → usadas pela interface e pelas Server Actions
--   2. este arquivo     → garantia final no banco (vale mesmo se alguém
--                         chamar a API do Supabase diretamente)
-- Se mudar uma regra, mude as duas e os testes correspondentes.
--
-- "Contexto de sistema": comandos executados pelo próprio banco (migrações,
-- seed, funções SECURITY DEFINER) ou pela chave secreta. Nesse contexto as
-- validações de papel não se aplicam. Requisições de usuários chegam com o
-- papel de banco "authenticated" (ou "anon", sem login).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Funções auxiliares de autorização
-- ---------------------------------------------------------------------------
create function public.contexto_sistema()
returns boolean
language sql
stable
set search_path = ''
as $$
  select current_user not in ('authenticated', 'anon');
$$;

create function public.papel_atual()
returns public.papel_usuario
language sql
stable
security definer
set search_path = ''
as $$
  select p.papel from public.perfis p where p.id = auth.uid();
$$;

comment on function public.papel_atual() is 'Papel do usuário autenticado (null se não autenticado).';

create function public.eh_equipe()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.papel_atual() in ('tecnico', 'administrador'), false);
$$;

create function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.papel_atual() = 'administrador', false);
$$;

-- Rótulos em português para mensagens e histórico (espelha lib/dominio/rotulos.ts).
create function public.rotulo(valor text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case valor
    when 'aberto' then 'Aberto'
    when 'em_triagem' then 'Em triagem'
    when 'em_atendimento' then 'Em atendimento'
    when 'aguardando' then 'Aguardando'
    when 'resolvido' then 'Resolvido'
    when 'encerrado' then 'Encerrado'
    when 'baixa' then 'Baixa'
    when 'media' then 'Média'
    when 'alta' then 'Alta'
    when 'critica' then 'Crítica'
    when 'planejada' then 'Planejada'
    when 'em_execucao' then 'Em execução'
    when 'concluida' then 'Concluída'
    when 'cancelada' then 'Cancelada'
    when 'corretiva' then 'Corretiva'
    when 'preventiva' then 'Preventiva'
    when 'evolutiva' then 'Evolutiva'
    when 'disponivel' then 'Disponível'
    when 'em_manutencao' then 'Em manutenção'
    when 'inativo' then 'Inativo'
    when 'falha' then 'Falha'
    when 'desempenho' then 'Desempenho'
    when 'seguranca' then 'Segurança'
    when 'melhoria' then 'Melhoria'
    when 'outro' then 'Outro'
    else coalesce(valor, '—')
  end;
$$;

create function public.codigo_ordem(ordem_id bigint)
returns text
language sql
immutable
set search_path = ''
as $$
  select 'OM-' || lpad(ordem_id::text, 4, '0');
$$;

-- ---------------------------------------------------------------------------
-- Regras de transição (RN-CH-01 e RN-OM-01)
-- ---------------------------------------------------------------------------
create function public.transicao_chamado_permitida(
  de public.status_chamado,
  para public.status_chamado,
  equipe boolean,
  solicitante boolean
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when de = 'aberto'         and para = 'em_triagem'                       then equipe
    when de = 'em_triagem'     and para in ('em_atendimento', 'encerrado')   then equipe
    when de = 'em_atendimento' and para in ('aguardando', 'resolvido')       then equipe
    when de = 'aguardando'     and para = 'em_atendimento'                   then equipe
    when de = 'resolvido'      and para in ('encerrado', 'em_atendimento')   then equipe or solicitante
    else false
  end;
$$;

create function public.transicao_chamado_exige_observacao(
  de public.status_chamado,
  para public.status_chamado
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select (de = 'em_triagem' and para = 'encerrado')
      or para = 'aguardando'
      or para = 'resolvido'
      or (de = 'resolvido' and para = 'em_atendimento');
$$;

create function public.transicao_ordem_permitida(
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

-- Observação informada em alterar_status_* (vale só durante a transação).
create function public.observacao_atual()
returns text
language sql
stable
set search_path = ''
as $$
  select nullif(btrim(coalesce(current_setting('app.observacao', true), '')), '');
$$;

-- ---------------------------------------------------------------------------
-- atualizado_em automático
-- ---------------------------------------------------------------------------
create function public.definir_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- O seed (contexto de sistema) pode definir datas retroativas explicitamente.
  if public.contexto_sistema() and new.atualizado_em is distinct from old.atualizado_em then
    return new;
  end if;
  new.atualizado_em := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Perfis
-- ---------------------------------------------------------------------------
create function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nome text;
begin
  v_nome := left(btrim(coalesce(new.raw_user_meta_data ->> 'nome', '')), 120);
  if char_length(v_nome) < 2 then
    v_nome := left(split_part(coalesce(new.email, 'usuario'), '@', 1), 120);
  end if;
  if char_length(v_nome) < 2 then
    v_nome := 'Usuário';
  end if;

  -- O papel NUNCA vem dos metadados enviados no cadastro: sempre começa
  -- como 'solicitante'. Só um administrador pode promover (definir_papel).
  insert into public.perfis (id, nome) values (new.id, v_nome);
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_usuario();

create function public.validar_alteracao_perfil()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if public.contexto_sistema() then
    return new;
  end if;
  if new.id is distinct from old.id or new.criado_em is distinct from old.criado_em then
    raise exception 'Identificador e data de criação do perfil não podem ser alterados.';
  end if;
  if new.papel is distinct from old.papel then
    raise exception 'Somente um administrador pode alterar papéis, pela tela de usuários.';
  end if;
  return new;
end;
$$;

create trigger a_validar_alteracao_perfil
  before update on public.perfis
  for each row execute function public.validar_alteracao_perfil();

create trigger z_atualizado_em
  before update on public.perfis
  for each row execute function public.definir_atualizado_em();

-- RPC usada pela tela de usuários (somente administrador).
create function public.definir_papel(p_usuario uuid, p_papel public.papel_usuario)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_admin() then
    raise exception 'Apenas administradores podem alterar papéis.';
  end if;

  if p_papel <> 'administrador'
     and exists (select 1 from public.perfis where id = p_usuario and papel = 'administrador')
     and (select count(*) from public.perfis where papel = 'administrador') <= 1 then
    raise exception 'Não é possível remover o último administrador do sistema.';
  end if;

  update public.perfis set papel = p_papel where id = p_usuario;
  if not found then
    raise exception 'Usuário não encontrado.';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Equipamentos
-- ---------------------------------------------------------------------------
create function public.preparar_equipamento()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.codigo := upper(btrim(new.codigo));
  new.nome := btrim(new.nome);
  new.localizacao := btrim(new.localizacao);
  new.descricao := btrim(coalesce(new.descricao, ''));

  if public.contexto_sistema() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.criado_por := auth.uid();
    new.criado_em := now();
    new.atualizado_em := now();
  else
    new.criado_por := old.criado_por;
    new.criado_em := old.criado_em;
  end if;
  return new;
end;
$$;

create trigger a_preparar_equipamento
  before insert or update on public.equipamentos
  for each row execute function public.preparar_equipamento();

create trigger z_atualizado_em
  before update on public.equipamentos
  for each row execute function public.definir_atualizado_em();

create function public.registrar_evento_equipamento()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_campos text[] := '{}';
  v_motivo text := nullif(current_setting('app.motivo', true), '');
begin
  if tg_op = 'INSERT' then
    insert into public.eventos (autor_id, tipo, descricao, dados, equipamento_id)
    values (auth.uid(), 'equipamento_criado',
            format('Equipamento %s cadastrado', new.codigo),
            jsonb_build_object('estado', new.estado), new.id);
    return new;
  end if;

  if new.estado is distinct from old.estado then
    insert into public.eventos (autor_id, tipo, descricao, dados, equipamento_id)
    values (auth.uid(), 'equipamento_estado',
            format('Estado alterado de %s para %s', public.rotulo(old.estado::text), public.rotulo(new.estado::text))
              || coalesce(' (' || v_motivo || ')', ''),
            jsonb_build_object('de', old.estado, 'para', new.estado), new.id);
  end if;

  if new.codigo is distinct from old.codigo then v_campos := array_append(v_campos, 'código'); end if;
  if new.nome is distinct from old.nome then v_campos := array_append(v_campos, 'nome'); end if;
  if new.categoria is distinct from old.categoria then v_campos := array_append(v_campos, 'categoria'); end if;
  if new.localizacao is distinct from old.localizacao then v_campos := array_append(v_campos, 'localização'); end if;
  if new.descricao is distinct from old.descricao then v_campos := array_append(v_campos, 'descrição'); end if;

  if cardinality(v_campos) > 0 then
    insert into public.eventos (autor_id, tipo, descricao, dados, equipamento_id)
    values (auth.uid(), 'equipamento_atualizado',
            'Dados atualizados: ' || array_to_string(v_campos, ', '),
            jsonb_build_object('campos', v_campos), new.id);
  end if;
  return new;
end;
$$;

create trigger z_registrar_evento_equipamento
  after insert or update on public.equipamentos
  for each row execute function public.registrar_evento_equipamento();

-- ---------------------------------------------------------------------------
-- Chamados
-- ---------------------------------------------------------------------------
create function public.preparar_novo_chamado()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_estado public.estado_equipamento;
begin
  select e.estado into v_estado from public.equipamentos e where e.id = new.equipamento_id;
  if v_estado = 'inativo' then
    raise exception 'Não é possível abrir chamado para equipamento inativo.';
  end if;

  new.titulo := btrim(new.titulo);
  new.descricao := btrim(new.descricao);

  if public.contexto_sistema() then
    return new;
  end if;

  -- Todo chamado nasce "aberto", sem técnico, com data do servidor.
  new.solicitante_id := auth.uid();
  new.status := 'aberto';
  new.tecnico_id := null;
  new.resolvido_em := null;
  new.encerrado_em := null;
  new.criado_em := now();
  new.atualizado_em := now();
  return new;
end;
$$;

create trigger a_preparar_novo_chamado
  before insert on public.chamados
  for each row execute function public.preparar_novo_chamado();

create function public.validar_alteracao_chamado()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_equipe boolean;
  v_solicitante boolean;
begin
  if not public.contexto_sistema() then
    if old.status = 'encerrado' then
      raise exception 'Chamado encerrado não pode ser alterado.';
    end if;

    if new.id is distinct from old.id
       or new.solicitante_id is distinct from old.solicitante_id
       or new.criado_em is distinct from old.criado_em
       or new.titulo is distinct from old.titulo
       or new.descricao is distinct from old.descricao then
      raise exception 'Título, descrição, solicitante e data de abertura não podem ser alterados.';
    end if;

    v_equipe := public.eh_equipe();
    v_solicitante := old.solicitante_id = auth.uid();

    if not v_equipe and (
         new.categoria is distinct from old.categoria
      or new.prioridade is distinct from old.prioridade
      or new.tecnico_id is distinct from old.tecnico_id
      or new.equipamento_id is distinct from old.equipamento_id) then
      raise exception 'Somente a equipe técnica pode alterar categoria, prioridade, técnico ou equipamento.';
    end if;

    if new.equipamento_id is distinct from old.equipamento_id
       and old.status not in ('aberto', 'em_triagem') then
      raise exception 'O equipamento só pode ser trocado enquanto o chamado está aberto ou em triagem.';
    end if;

    if new.status is distinct from old.status then
      if not public.transicao_chamado_permitida(old.status, new.status, v_equipe, v_solicitante) then
        raise exception 'Transição de status inválida: % → %.',
          public.rotulo(old.status::text), public.rotulo(new.status::text);
      end if;
      if public.transicao_chamado_exige_observacao(old.status, new.status)
         and public.observacao_atual() is null then
        raise exception 'Informe uma observação para mudar o status para %.', public.rotulo(new.status::text);
      end if;
    end if;

    new.resolvido_em := old.resolvido_em;
    new.encerrado_em := old.encerrado_em;
  end if;

  if new.tecnico_id is distinct from old.tecnico_id and new.tecnico_id is not null
     and not exists (select 1 from public.perfis p
                     where p.id = new.tecnico_id and p.papel in ('tecnico', 'administrador')) then
    raise exception 'O responsável pelo chamado deve ter papel de técnico ou administrador.';
  end if;

  if new.status is distinct from old.status then
    if new.status = 'em_atendimento' and new.tecnico_id is null then
      raise exception 'Atribua um técnico antes de iniciar o atendimento.';
    end if;
    if new.status = 'resolvido' and exists (
         select 1 from public.ordens_manutencao o
         where o.chamado_id = new.id and o.status in ('planejada', 'em_execucao')) then
      raise exception 'Conclua ou cancele a ordem de manutenção ativa antes de resolver o chamado.';
    end if;

    if new.status = 'resolvido' then
      new.resolvido_em := now();
    elsif old.status = 'resolvido' and new.status = 'em_atendimento' then
      new.resolvido_em := null;
    end if;
    if new.status = 'encerrado' then
      new.encerrado_em := now();
    end if;
  end if;

  return new;
end;
$$;

create trigger a_validar_alteracao_chamado
  before update on public.chamados
  for each row execute function public.validar_alteracao_chamado();

create trigger z_atualizado_em
  before update on public.chamados
  for each row execute function public.definir_atualizado_em();

create function public.registrar_evento_chamado()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_obs text := public.observacao_atual();
  v_nome text;
  v_mudancas text[] := '{}';
begin
  if tg_op = 'INSERT' then
    insert into public.eventos (autor_id, tipo, descricao, dados, equipamento_id, chamado_id)
    values (coalesce(auth.uid(), new.solicitante_id), 'chamado_aberto',
            format('Chamado aberto com prioridade %s', public.rotulo(new.prioridade::text)),
            jsonb_build_object('prioridade', new.prioridade, 'categoria', new.categoria),
            new.equipamento_id, new.id);
    return new;
  end if;

  if new.status is distinct from old.status then
    insert into public.eventos (autor_id, tipo, descricao, dados, equipamento_id, chamado_id)
    values (auth.uid(), 'chamado_status',
            format('Status alterado de %s para %s', public.rotulo(old.status::text), public.rotulo(new.status::text))
              || coalesce('. Observação: ' || v_obs, ''),
            jsonb_build_object('de', old.status, 'para', new.status, 'observacao', v_obs),
            new.equipamento_id, new.id);
  end if;

  if new.tecnico_id is distinct from old.tecnico_id then
    select p.nome into v_nome from public.perfis p where p.id = new.tecnico_id;
    insert into public.eventos (autor_id, tipo, descricao, dados, equipamento_id, chamado_id)
    values (auth.uid(), 'chamado_atribuido',
            case when new.tecnico_id is null then 'Atribuição de técnico removida'
                 else 'Técnico responsável: ' || v_nome end,
            jsonb_build_object('tecnico_id', new.tecnico_id),
            new.equipamento_id, new.id);
  end if;

  if new.prioridade is distinct from old.prioridade then
    v_mudancas := v_mudancas || format('prioridade %s → %s', public.rotulo(old.prioridade::text), public.rotulo(new.prioridade::text));
  end if;
  if new.categoria is distinct from old.categoria then
    v_mudancas := v_mudancas || format('categoria %s → %s', public.rotulo(old.categoria::text), public.rotulo(new.categoria::text));
  end if;
  if new.equipamento_id is distinct from old.equipamento_id then
    v_mudancas := array_append(v_mudancas, 'equipamento alterado');
  end if;

  if cardinality(v_mudancas) > 0 then
    insert into public.eventos (autor_id, tipo, descricao, dados, equipamento_id, chamado_id)
    values (auth.uid(), 'chamado_atualizado',
            'Triagem: ' || array_to_string(v_mudancas, '; '),
            jsonb_build_object('mudancas', v_mudancas),
            new.equipamento_id, new.id);
  end if;
  return new;
end;
$$;

create trigger z_registrar_evento_chamado
  after insert or update on public.chamados
  for each row execute function public.registrar_evento_chamado();

-- RPC: muda o status com observação (usada pela aplicação).
create function public.alterar_status_chamado(
  p_chamado_id bigint,
  p_status public.status_chamado,
  p_observacao text default null
)
returns void
language plpgsql
set search_path = ''
as $$
begin
  perform set_config('app.observacao', coalesce(p_observacao, ''), true);
  update public.chamados set status = p_status where id = p_chamado_id;
  if not found then
    raise exception 'Chamado não encontrado ou você não tem permissão para alterá-lo.';
  end if;
  perform set_config('app.observacao', '', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- Comentários
-- ---------------------------------------------------------------------------
create function public.preparar_comentario()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (select 1 from public.chamados c where c.id = new.chamado_id and c.status = 'encerrado') then
    raise exception 'Não é possível comentar em chamado encerrado.';
  end if;
  new.texto := btrim(new.texto);
  if public.contexto_sistema() then
    return new;
  end if;
  new.autor_id := auth.uid();
  new.criado_em := now();
  if not public.eh_equipe() then
    new.interno := false;
  end if;
  return new;
end;
$$;

create trigger a_preparar_comentario
  before insert on public.comentarios_chamado
  for each row execute function public.preparar_comentario();

create function public.registrar_evento_comentario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.eventos (autor_id, tipo, descricao, dados, equipamento_id, chamado_id, visivel_solicitante)
  select new.autor_id, 'comentario',
         case when new.interno then 'Comentário interno registrado' else 'Comentário registrado' end,
         jsonb_build_object('comentario_id', new.id, 'interno', new.interno),
         c.equipamento_id, c.id, not new.interno
  from public.chamados c where c.id = new.chamado_id;
  return new;
end;
$$;

create trigger z_registrar_evento_comentario
  after insert on public.comentarios_chamado
  for each row execute function public.registrar_evento_comentario();

-- ---------------------------------------------------------------------------
-- Ordens de manutenção
-- ---------------------------------------------------------------------------
create function public.preparar_nova_ordem()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_chamado public.chamados%rowtype;
begin
  -- Mensagem clara antes das demais regras (a política RLS também bloqueia).
  if not public.contexto_sistema() and not public.eh_equipe() then
    raise exception 'Somente a equipe técnica pode criar ordens de manutenção.';
  end if;

  select * into v_chamado from public.chamados c where c.id = new.chamado_id;
  if not found then
    raise exception 'Chamado não encontrado.';
  end if;

  -- A ordem sempre se refere ao equipamento do chamado.
  new.equipamento_id := v_chamado.equipamento_id;

  if not exists (select 1 from public.perfis p
                 where p.id = new.responsavel_id and p.papel in ('tecnico', 'administrador')) then
    raise exception 'O responsável pela ordem deve ter papel de técnico ou administrador.';
  end if;

  if public.contexto_sistema() then
    return new;
  end if;

  if v_chamado.status not in ('em_triagem', 'em_atendimento', 'aguardando') then
    raise exception 'Só é possível criar ordem para chamado em triagem, em atendimento ou aguardando.';
  end if;

  new.status := 'planejada';
  new.resultado := null;
  new.iniciada_em := null;
  new.concluida_em := null;
  new.criado_em := now();
  new.atualizado_em := now();
  return new;
end;
$$;

create trigger a_preparar_nova_ordem
  before insert on public.ordens_manutencao
  for each row execute function public.preparar_nova_ordem();

create function public.validar_alteracao_ordem()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if public.contexto_sistema() then
    return new;
  end if;

  if old.status in ('concluida', 'cancelada') then
    raise exception 'Ordem % está % e não pode ser alterada.',
      public.codigo_ordem(old.id), lower(public.rotulo(old.status::text));
  end if;

  if new.id is distinct from old.id
     or new.chamado_id is distinct from old.chamado_id
     or new.equipamento_id is distinct from old.equipamento_id
     or new.criado_em is distinct from old.criado_em then
    raise exception 'Chamado, equipamento e data de criação da ordem não podem ser alterados.';
  end if;

  if new.tipo is distinct from old.tipo and old.status <> 'planejada' then
    raise exception 'O tipo de manutenção só pode ser alterado enquanto a ordem está planejada.';
  end if;

  if new.responsavel_id is distinct from old.responsavel_id
     and not exists (select 1 from public.perfis p
                     where p.id = new.responsavel_id and p.papel in ('tecnico', 'administrador')) then
    raise exception 'O responsável pela ordem deve ter papel de técnico ou administrador.';
  end if;

  -- Datas de início/conclusão são definidas somente pelas transições.
  new.iniciada_em := old.iniciada_em;
  new.concluida_em := old.concluida_em;

  if new.status is distinct from old.status then
    if not public.transicao_ordem_permitida(old.status, new.status) then
      raise exception 'Transição de status da ordem inválida: % → %.',
        public.rotulo(old.status::text), public.rotulo(new.status::text);
    end if;

    if new.status = 'em_execucao' then
      new.iniciada_em := now();
    elsif new.status = 'concluida' then
      if char_length(btrim(new.diagnostico)) = 0 then
        raise exception 'Preencha o diagnóstico antes de concluir a ordem.';
      end if;
      if char_length(btrim(new.atividades_executadas)) = 0 then
        raise exception 'Registre as atividades executadas antes de concluir a ordem.';
      end if;
      if new.resultado is null then
        raise exception 'Informe o resultado antes de concluir a ordem.';
      end if;
      new.concluida_em := now();
    elsif new.status = 'cancelada' then
      if public.observacao_atual() is null then
        raise exception 'Informe o motivo do cancelamento da ordem.';
      end if;
    end if;
  end if;

  return new;
end;
$$;

create trigger a_validar_alteracao_ordem
  before update on public.ordens_manutencao
  for each row execute function public.validar_alteracao_ordem();

create trigger z_atualizado_em
  before update on public.ordens_manutencao
  for each row execute function public.definir_atualizado_em();

create function public.registrar_evento_ordem()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_obs text := public.observacao_atual();
  v_campos text[] := '{}';
  v_codigo text := public.codigo_ordem(new.id);
begin
  if tg_op = 'INSERT' then
    insert into public.eventos (autor_id, tipo, descricao, dados, equipamento_id, chamado_id, ordem_id)
    values (auth.uid(), 'ordem_criada',
            format('Ordem %s criada (manutenção %s)', v_codigo, lower(public.rotulo(new.tipo::text))),
            jsonb_build_object('tipo', new.tipo), new.equipamento_id, new.chamado_id, new.id);
    return new;
  end if;

  if new.status is distinct from old.status then
    insert into public.eventos (autor_id, tipo, descricao, dados, equipamento_id, chamado_id, ordem_id)
    values (auth.uid(), 'ordem_status',
            format('Ordem %s: status alterado de %s para %s', v_codigo,
                   public.rotulo(old.status::text), public.rotulo(new.status::text))
              || case when new.status = 'concluida'
                      then format(' (resultado: %s)', lower(public.rotulo(new.resultado::text))) else '' end
              || coalesce('. Observação: ' || v_obs, ''),
            jsonb_build_object('de', old.status, 'para', new.status, 'resultado', new.resultado, 'observacao', v_obs),
            new.equipamento_id, new.chamado_id, new.id);

    -- Efeito no equipamento (RN-OM-04): em execução → "em manutenção";
    -- ao concluir/cancelar a última ordem em execução → "disponível".
    if new.status = 'em_execucao' then
      perform set_config('app.motivo', 'início da ordem ' || v_codigo, true);
      update public.equipamentos set estado = 'em_manutencao'
        where id = new.equipamento_id and estado = 'disponivel';
      perform set_config('app.motivo', '', true);
    elsif new.status in ('concluida', 'cancelada') and old.status = 'em_execucao'
          and not exists (select 1 from public.ordens_manutencao o
                          where o.equipamento_id = new.equipamento_id
                            and o.status = 'em_execucao' and o.id <> new.id) then
      perform set_config('app.motivo', lower(public.rotulo(new.status::text)) || ' da ordem ' || v_codigo, true);
      update public.equipamentos set estado = 'disponivel'
        where id = new.equipamento_id and estado = 'em_manutencao';
      perform set_config('app.motivo', '', true);
    end if;
  end if;

  if new.tipo is distinct from old.tipo then v_campos := array_append(v_campos, 'tipo'); end if;
  if new.responsavel_id is distinct from old.responsavel_id then v_campos := array_append(v_campos, 'responsável'); end if;
  if new.diagnostico is distinct from old.diagnostico then v_campos := array_append(v_campos, 'diagnóstico'); end if;
  if new.plano_acao is distinct from old.plano_acao then v_campos := array_append(v_campos, 'plano de ação'); end if;
  if new.atividades_executadas is distinct from old.atividades_executadas then v_campos := array_append(v_campos, 'atividades executadas'); end if;
  if new.resultado is distinct from old.resultado then v_campos := array_append(v_campos, 'resultado'); end if;

  if cardinality(v_campos) > 0 then
    insert into public.eventos (autor_id, tipo, descricao, dados, equipamento_id, chamado_id, ordem_id, visivel_solicitante)
    values (auth.uid(), 'ordem_atualizada',
            format('Ordem %s: campos atualizados (%s)', v_codigo, array_to_string(v_campos, ', ')),
            jsonb_build_object('campos', v_campos), new.equipamento_id, new.chamado_id, new.id, false);
  end if;
  return new;
end;
$$;

create trigger z_registrar_evento_ordem
  after insert or update on public.ordens_manutencao
  for each row execute function public.registrar_evento_ordem();

-- RPC: muda o status da ordem com observação opcional.
create function public.alterar_status_ordem(
  p_ordem_id bigint,
  p_status public.status_ordem,
  p_observacao text default null
)
returns void
language plpgsql
set search_path = ''
as $$
begin
  perform set_config('app.observacao', coalesce(p_observacao, ''), true);
  update public.ordens_manutencao set status = p_status where id = p_ordem_id;
  if not found then
    raise exception 'Ordem não encontrada ou você não tem permissão para alterá-la.';
  end if;
  perform set_config('app.observacao', '', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- Verificação de conexão (teste de fumaça). Não expõe dados das tabelas.
-- ---------------------------------------------------------------------------
create function public.verificar_conexao()
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'banco', 'ok',
    'horario_servidor', now(),
    'versao_postgres', current_setting('server_version')
  );
$$;
