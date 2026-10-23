"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAdmin, exigirEquipe } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { equipamentoSchema } from "@/lib/validacao/esquemas";
import { falha, falhaValidacao, lerFormulario, type EstadoFormulario } from "@/lib/formulario";
import { registrarErro, traduzirErro } from "@/lib/erros";

export async function criarEquipamento(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirEquipe();
  const valores = lerFormulario(formData);
  const dados = equipamentoSchema.safeParse(valores);
  if (!dados.success) return falhaValidacao(dados.error);

  const supabase = await createClient();
  const { data, error } = await supabase.from("equipamentos").insert(dados.data).select("id").single();
  if (error) {
    registrarErro("criarEquipamento", error);
    return falha(traduzirErro(error));
  }
  revalidatePath("/equipamentos");
  redirect(`/equipamentos/${data.id}?sucesso=equipamento-criado`);
}

export async function atualizarEquipamento(
  id: number,
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await exigirEquipe();
  const valores = lerFormulario(formData);
  const dados = equipamentoSchema.safeParse(valores);
  if (!dados.success) return falhaValidacao(dados.error);

  const supabase = await createClient();
  const { data, error } = await supabase.from("equipamentos").update(dados.data).eq("id", id).select("id");
  if (error) {
    registrarErro("atualizarEquipamento", error);
    return falha(traduzirErro(error));
  }
  if (data.length === 0) return falha("Equipamento não encontrado ou sem permissão para editar.");
  revalidatePath(`/equipamentos/${id}`);
  redirect(`/equipamentos/${id}?sucesso=equipamento-atualizado`);
}

export async function excluirEquipamento(id: number, _estado: EstadoFormulario): Promise<EstadoFormulario> {
  await exigirAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.from("equipamentos").delete().eq("id", id).select("id");
  if (error) {
    registrarErro("excluirEquipamento", error);
    if (error.code === "23503") {
      return falha("Este equipamento tem chamados registrados e não pode ser excluído. Altere o estado para Inativo.");
    }
    return falha(traduzirErro(error));
  }
  if (data.length === 0) return falha("Equipamento não encontrado ou sem permissão para excluir.");
  revalidatePath("/equipamentos");
  redirect("/equipamentos?sucesso=equipamento-excluido");
}
