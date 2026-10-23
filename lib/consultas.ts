/**
 * Consultas reutilizadas pelas páginas. Todas usam o cliente do servidor,
 * então rodam como o usuário logado e respeitam as políticas RLS
 * (um solicitante só recebe os próprios chamados, por exemplo).
 */
import { createClient } from "@/lib/supabase/server";
import { registrarErro } from "@/lib/erros";
import { intervaloDoPeriodo } from "@/lib/formatacao";
import type { FiltrosChamados } from "@/lib/validacao/esquemas";
import type { ItemHistorico } from "@/components/Historico";

/**
 * Chamados com os filtros da lista (status, prioridade, equipamento e período),
 * do mais recente para o mais antigo. Usada pela tela e pela exportação CSV,
 * para que as duas mostrem exatamente o mesmo conjunto (RLS incluso).
 */
export async function consultarChamados(filtros: FiltrosChamados, limite: number) {
  const supabase = await createClient();
  const { inicio, fimExclusivo } = intervaloDoPeriodo(filtros.de, filtros.ate);
  let consulta = supabase
    .from("chamados")
    .select(
      "id, titulo, status, prioridade, categoria, criado_em, resolvido_em, encerrado_em, equipamento:equipamentos(id, codigo, nome), solicitante:perfis!chamados_solicitante_id_fkey(nome), tecnico:perfis!chamados_tecnico_id_fkey(nome)",
      { count: "exact" },
    )
    .order("criado_em", { ascending: false })
    .limit(limite);
  if (filtros.status) consulta = consulta.eq("status", filtros.status);
  if (filtros.prioridade) consulta = consulta.eq("prioridade", filtros.prioridade);
  if (filtros.equipamento) consulta = consulta.eq("equipamento_id", filtros.equipamento);
  if (inicio) consulta = consulta.gte("criado_em", inicio);
  if (fimExclusivo) consulta = consulta.lt("criado_em", fimExclusivo);
  return consulta;
}

type Alvo = { equipamento_id: number } | { chamado_id: number } | { ordem_id: number };

export async function buscarHistorico(alvo: Alvo): Promise<ItemHistorico[]> {
  const supabase = await createClient();
  const [coluna, valor] = Object.entries(alvo)[0] as [string, number];
  const { data, error } = await supabase
    .from("eventos")
    .select("id, criado_em, descricao, tipo, autor:perfis(nome)")
    .eq(coluna, valor)
    .order("criado_em", { ascending: true })
    .order("id", { ascending: true });
  if (error) {
    registrarErro("buscarHistorico", error);
    throw new Error("Falha ao carregar o histórico.");
  }
  return data.map((e) => ({
    id: e.id,
    criado_em: e.criado_em,
    descricao: e.descricao,
    tipo: e.tipo,
    autor: e.autor?.nome ?? null,
  }));
}

/** Técnicos e administradores (para atribuição de chamados e ordens). */
export async function listarEquipeTecnica() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perfis")
    .select("id, nome, papel")
    .in("papel", ["tecnico", "administrador"])
    .order("nome");
  if (error) {
    registrarErro("listarEquipeTecnica", error);
    throw new Error("Falha ao carregar a equipe técnica.");
  }
  return data;
}

/** Equipamentos para seleção em formulários (opcionalmente só os que aceitam chamados). */
export async function listarEquipamentosParaSelecao({ somenteAtivos = false } = {}) {
  const supabase = await createClient();
  let consulta = supabase.from("equipamentos").select("id, codigo, nome, estado").order("codigo");
  if (somenteAtivos) consulta = consulta.neq("estado", "inativo");
  const { data, error } = await consulta;
  if (error) {
    registrarErro("listarEquipamentosParaSelecao", error);
    throw new Error("Falha ao carregar os equipamentos.");
  }
  return data;
}
