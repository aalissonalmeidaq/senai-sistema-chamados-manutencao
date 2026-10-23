"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirEquipe, exigirUsuario } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  abrirChamadoSchema,
  comentarioSchema,
  mudarStatusChamadoSchema,
  triagemSchema,
} from "@/lib/validacao/esquemas";
import { podeComentar, podeFazerTriagem, validarTransicaoChamado } from "@/lib/regras/chamados";
import { STATUS_ORDEM_ATIVOS } from "@/lib/regras/ordens";
import { ehEquipe } from "@/lib/regras/permissoes";
import { ROTULO_STATUS_CHAMADO } from "@/lib/dominio/rotulos";
import {
  falha,
  falhaValidacao,
  lerFormulario,
  sucesso,
  type EstadoFormulario,
} from "@/lib/formulario";
import { registrarErro, traduzirErro } from "@/lib/erros";

/** RN-CH-02 — Qualquer usuário autenticado abre chamado em seu próprio nome. */
export async function abrirChamado(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const usuario = await exigirUsuario();
  const valores = lerFormulario(formData);
  const dados = abrirChamadoSchema.safeParse(valores);
  if (!dados.success) return falhaValidacao(dados.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chamados")
    .insert({ ...dados.data, solicitante_id: usuario.id })
    .select("id")
    .single();
  if (error) {
    registrarErro("abrirChamado", error);
    return falha(traduzirErro(error));
  }
  revalidatePath("/chamados");
  redirect(`/chamados/${data.id}?sucesso=chamado-aberto`);
}

/** Triagem: prioridade, categoria e técnico responsável (somente equipe). */
export async function salvarTriagem(id: number, _estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const usuario = await exigirEquipe();
  const valores = lerFormulario(formData);
  const dados = triagemSchema.safeParse(valores);
  if (!dados.success) return falhaValidacao(dados.error);

  const supabase = await createClient();
  const { data: chamado } = await supabase.from("chamados").select("status").eq("id", id).maybeSingle();
  if (!chamado) return falha("Chamado não encontrado.");
  if (!podeFazerTriagem(chamado.status, usuario.papel)) {
    return falha(`A triagem não pode ser alterada com o chamado ${ROTULO_STATUS_CHAMADO[chamado.status].toLowerCase()}.`);
  }

  const { error } = await supabase.from("chamados").update(dados.data).eq("id", id);
  if (error) {
    registrarErro("salvarTriagem", error);
    return falha(traduzirErro(error));
  }
  revalidatePath(`/chamados/${id}`);
  return sucesso("Triagem salva.");
}

/** Mudança de status com validação da transição (RN-CH-01) antes de chamar o banco. */
export async function mudarStatusChamado(
  id: number,
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await exigirUsuario();
  const valores = lerFormulario(formData);
  const dados = mudarStatusChamadoSchema.safeParse(valores);
  if (!dados.success) return falhaValidacao(dados.error);

  const supabase = await createClient();
  const { data: chamado } = await supabase
    .from("chamados")
    .select("status, solicitante_id, tecnico_id")
    .eq("id", id)
    .maybeSingle();
  if (!chamado) return falha("Chamado não encontrado.");

  const { count: ordensAtivas } = await supabase
    .from("ordens_manutencao")
    .select("id", { count: "exact", head: true })
    .eq("chamado_id", id)
    .in("status", [...STATUS_ORDEM_ATIVOS]);

  const validacao = validarTransicaoChamado({
    de: chamado.status,
    para: dados.data.para,
    papel: usuario.papel,
    ehSolicitante: chamado.solicitante_id === usuario.id,
    observacao: dados.data.observacao,
    temTecnico: Boolean(chamado.tecnico_id),
    temOrdemAtiva: (ordensAtivas ?? 0) > 0,
  });
  if (!validacao.ok) return falha(validacao.motivo);

  const { error } = await supabase.rpc("alterar_status_chamado", {
    p_chamado_id: id,
    p_status: dados.data.para,
    p_observacao: dados.data.observacao || undefined,
  });
  if (error) {
    registrarErro("mudarStatusChamado", error);
    return falha(traduzirErro(error));
  }
  revalidatePath(`/chamados/${id}`);
  // Encerrado não tem mais ações: o formulário some, então a mensagem vai pela URL.
  if (dados.data.para === "encerrado") redirect(`/chamados/${id}?sucesso=chamado-encerrado`);
  return sucesso(`Status alterado para ${ROTULO_STATUS_CHAMADO[dados.data.para]}.`);
}

/** Comentários: internos (só equipe) ou visíveis ao solicitante. */
export async function comentarChamado(id: number, _estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const usuario = await exigirUsuario();
  const valores = lerFormulario(formData);
  const dados = comentarioSchema.safeParse(valores);
  if (!dados.success) return falhaValidacao(dados.error);

  const supabase = await createClient();
  const { data: chamado } = await supabase.from("chamados").select("status").eq("id", id).maybeSingle();
  if (!chamado) return falha("Chamado não encontrado.");
  if (!podeComentar(chamado.status)) return falha("Não é possível comentar em chamado encerrado.");

  const { error } = await supabase.from("comentarios_chamado").insert({
    chamado_id: id,
    texto: dados.data.texto,
    interno: ehEquipe(usuario.papel) ? dados.data.interno : false,
    autor_id: usuario.id,
  });
  if (error) {
    registrarErro("comentarChamado", error);
    return falha(traduzirErro(error));
  }
  revalidatePath(`/chamados/${id}`);
  return sucesso("Comentário registrado.");
}
