"use server";

import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { definirPapelSchema } from "@/lib/validacao/esquemas";
import { ROTULO_PAPEL } from "@/lib/dominio/rotulos";
import { falha, falhaValidacao, lerFormulario, sucesso, type EstadoFormulario } from "@/lib/formulario";
import { registrarErro, traduzirErro } from "@/lib/erros";

/** Altera o papel de um usuário pela função segura do banco (public.definir_papel). */
export async function definirPapel(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const valores = lerFormulario(formData);
  const dados = definirPapelSchema.safeParse(valores);
  if (!dados.success) return falhaValidacao(dados.error, valores);

  const supabase = await createClient();
  const { error } = await supabase.rpc("definir_papel", {
    p_usuario: dados.data.usuario_id,
    p_papel: dados.data.papel,
  });
  if (error) {
    registrarErro("definirPapel", error);
    return falha(traduzirErro(error));
  }
  revalidatePath("/usuarios");
  return sucesso(`Papel alterado para ${ROTULO_PAPEL[dados.data.papel]}.`);
}
