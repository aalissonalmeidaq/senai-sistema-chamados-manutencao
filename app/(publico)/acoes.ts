"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cadastroSchema, entradaSchema } from "@/lib/validacao/esquemas";
import { falha, falhaValidacao, lerFormulario, type EstadoFormulario } from "@/lib/formulario";
import { registrarErro } from "@/lib/erros";

/** Só aceita caminhos internos como destino após o login (evita redirecionamento aberto). */
function destinoSeguro(valor: string | undefined) {
  return valor && valor.startsWith("/") && !valor.startsWith("//") ? valor : "/painel";
}

export async function entrar(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const valores = lerFormulario(formData);
  const dados = entradaSchema.safeParse(valores);
  if (!dados.success) return falhaValidacao(dados.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: dados.data.email,
    password: dados.data.senha,
  });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return falha(
        "E-mail ainda não confirmado. Abra a caixa de e-mail local (Mailpit) e clique no link de confirmação.",
      );
    }
    return falha("E-mail ou senha incorretos.");
  }
  redirect(destinoSeguro(valores.proximo));
}

export async function cadastrar(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const valores = lerFormulario(formData);
  const dados = cadastroSchema.safeParse(valores);
  if (!dados.success) return falhaValidacao(dados.error);

  const origem = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: dados.data.email,
    password: dados.data.senha,
    options: {
      // Apenas o nome vai nos metadados. O papel é sempre definido pelo banco.
      data: { nome: dados.data.nome },
      emailRedirectTo: `${origem}/auth/confirm?next=/painel`,
    },
  });

  if (error) {
    registrarErro("cadastrar", error);
    if (error.code === "user_already_exists") return falha("Este e-mail já está cadastrado.");
    if (error.code === "weak_password") return falha("Senha fraca. Use pelo menos 8 caracteres.");
    return falha("Não foi possível concluir o cadastro. Tente novamente.");
  }

  // Com confirmação de e-mail ativa, não há sessão até o usuário confirmar.
  if (!data.session) redirect(`/cadastro-enviado?email=${encodeURIComponent(dados.data.email)}`);
  redirect("/painel");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/entrar?aviso=saiu");
}
