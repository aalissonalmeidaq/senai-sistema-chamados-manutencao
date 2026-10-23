import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ehAdmin, ehEquipe } from "@/lib/regras/permissoes";
import type { UsuarioAtual } from "@/types/dominio";

/**
 * Usuário logado + perfil, validado no servidor.
 * getClaims() verifica a assinatura do token (não confie em getSession()
 * no servidor). O papel vem da tabela perfis, nunca do navegador.
 * `cache` evita repetir a consulta na mesma requisição.
 */
export const obterUsuarioAtual = cache(async (): Promise<UsuarioAtual | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;

  const { data: perfil } = await supabase
    .from("perfis")
    .select("nome, papel")
    .eq("id", data.claims.sub)
    .single();
  if (!perfil) return null;

  return {
    id: data.claims.sub,
    email: typeof data.claims.email === "string" ? data.claims.email : "",
    nome: perfil.nome,
    papel: perfil.papel,
  };
});

/** Exige login; sem sessão, redireciona para /entrar. */
export async function exigirUsuario(): Promise<UsuarioAtual> {
  const usuario = await obterUsuarioAtual();
  if (!usuario) redirect("/entrar");
  return usuario;
}

/** Exige técnico ou administrador; caso contrário, volta ao painel com aviso. */
export async function exigirEquipe(): Promise<UsuarioAtual> {
  const usuario = await exigirUsuario();
  if (!ehEquipe(usuario.papel)) redirect("/painel?aviso=sem-permissao");
  return usuario;
}

export async function exigirAdmin(): Promise<UsuarioAtual> {
  const usuario = await exigirUsuario();
  if (!ehAdmin(usuario.papel)) redirect("/painel?aviso=sem-permissao");
  return usuario;
}
