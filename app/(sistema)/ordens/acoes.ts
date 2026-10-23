"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirEquipe } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { atualizarOrdemSchema, criarOrdemSchema, mudarStatusOrdemSchema } from "@/lib/validacao/esquemas";
import { podeCriarOrdem } from "@/lib/regras/chamados";
import { ordemFinalizada, STATUS_ORDEM_ATIVOS, validarTransicaoOrdem } from "@/lib/regras/ordens";
import { ROTULO_STATUS_ORDEM } from "@/lib/dominio/rotulos";
import {
  falha,
  falhaValidacao,
  lerFormulario,
  sucesso,
  type EstadoFormulario,
} from "@/lib/formulario";
import { registrarErro, traduzirErro } from "@/lib/erros";

/** RN-OM-02 — Ordem ligada a um chamado; o equipamento vem do chamado. */
export async function criarOrdem(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const usuario = await exigirEquipe();
  const valores = lerFormulario(formData);
  const dados = criarOrdemSchema.safeParse(valores);
  if (!dados.success) return falhaValidacao(dados.error);

  const supabase = await createClient();
  const { data: chamado } = await supabase
    .from("chamados")
    .select("status, equipamento_id")
    .eq("id", dados.data.chamado_id)
    .maybeSingle();
  if (!chamado) return falha("Chamado não encontrado.");

  const { count } = await supabase
    .from("ordens_manutencao")
    .select("id", { count: "exact", head: true })
    .eq("chamado_id", dados.data.chamado_id)
    .in("status", [...STATUS_ORDEM_ATIVOS]);
  if (!podeCriarOrdem(chamado.status, usuario.papel, (count ?? 0) > 0)) {
    return falha(
      (count ?? 0) > 0
        ? "Este chamado já possui uma ordem de manutenção ativa."
        : "Só é possível criar ordem para chamado em triagem, em atendimento ou aguardando.");
  }

  const { data, error } = await supabase
    .from("ordens_manutencao")
    // equipamento_id é conferido/definido também pelo gatilho do banco
    .insert({ ...dados.data, equipamento_id: chamado.equipamento_id })
    .select("id")
    .single();
  if (error) {
    registrarErro("criarOrdem", error);
    return falha(traduzirErro(error));
  }
  revalidatePath(`/chamados/${dados.data.chamado_id}`);
  redirect(`/ordens/${data.id}?sucesso=ordem-criada`);
}

export async function atualizarOrdem(id: number, _estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirEquipe();
  const valores = lerFormulario(formData);
  const dados = atualizarOrdemSchema.safeParse(valores);
  if (!dados.success) return falhaValidacao(dados.error);

  const supabase = await createClient();
  const { data: ordem } = await supabase.from("ordens_manutencao").select("status, tipo").eq("id", id).maybeSingle();
  if (!ordem) return falha("Ordem não encontrada.");
  if (ordemFinalizada(ordem.status)) {
    return falha(`A ordem está ${ROTULO_STATUS_ORDEM[ordem.status].toLowerCase()} e não pode ser alterada.`);
  }
  if (dados.data.tipo !== ordem.tipo && ordem.status !== "planejada") {
    return falha("O tipo de manutenção só pode ser alterado enquanto a ordem está planejada.");
  }

  const { error } = await supabase.from("ordens_manutencao").update(dados.data).eq("id", id);
  if (error) {
    registrarErro("atualizarOrdem", error);
    return falha(traduzirErro(error));
  }
  revalidatePath(`/ordens/${id}`);
  return sucesso("Registro da ordem salvo.");
}

export async function mudarStatusOrdem(id: number, _estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirEquipe();
  const valores = lerFormulario(formData);
  const dados = mudarStatusOrdemSchema.safeParse(valores);
  if (!dados.success) return falhaValidacao(dados.error);

  const supabase = await createClient();
  const { data: ordem } = await supabase
    .from("ordens_manutencao")
    .select("status, diagnostico, atividades_executadas, resultado, chamado_id")
    .eq("id", id)
    .maybeSingle();
  if (!ordem) return falha("Ordem não encontrada.");

  const validacao = validarTransicaoOrdem({
    de: ordem.status,
    para: dados.data.para,
    observacao: dados.data.observacao,
    ordem,
  });
  if (!validacao.ok) return falha(validacao.motivo);

  const { error } = await supabase.rpc("alterar_status_ordem", {
    p_ordem_id: id,
    p_status: dados.data.para,
    p_observacao: dados.data.observacao || undefined,
  });
  if (error) {
    registrarErro("mudarStatusOrdem", error);
    return falha(traduzirErro(error));
  }
  revalidatePath(`/ordens/${id}`);
  revalidatePath(`/chamados/${ordem.chamado_id}`);
  // Ordem finalizada não tem mais formulários: a mensagem vai pela URL.
  if (ordemFinalizada(dados.data.para)) redirect(`/ordens/${id}?sucesso=ordem-${dados.data.para}`);
  return sucesso(`Status da ordem alterado para ${ROTULO_STATUS_ORDEM[dados.data.para]}.`);
}
