/**
 * Apoio aos testes de integração: cria clientes do Supabase LOCAL
 * (mesma URL e chave publicável do .env.local) e faz login com os
 * usuários fictícios do seed.
 */
import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Em modo de teste o Next.js não lê o .env.local; carregamos diretamente.
// Variáveis já definidas no ambiente (ex.: na CI) têm prioridade.
if (existsSync(".env.local") && !process.env.NEXT_PUBLIC_SUPABASE_URL) process.loadEnvFile(".env.local");

export const SENHA_SEED = "Senha@123";

export const USUARIOS = {
  admin: "admin@example.com",
  tecnico1: "tecnico1@example.com",
  tecnico2: "tecnico2@example.com",
  solicitante1: "solicitante1@example.com",
  solicitante2: "solicitante2@example.com",
} as const;

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !chave) {
    throw new Error("Defina .env.local (npm run setup:local) antes de rodar os testes de integração.");
  }
  return { url, chave };
}

/** Cliente sem login (papel anon). */
export function clienteAnonimo() {
  const { url, chave } = config();
  return createClient<Database>(url, chave, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Cliente autenticado como um usuário do seed. */
export async function entrarComo(email: string) {
  const cliente = clienteAnonimo();
  const { data, error } = await cliente.auth.signInWithPassword({ email, password: SENHA_SEED });
  if (error) throw new Error(`Falha no login de ${email}: ${error.message}. Rode npm run db:reset.`);
  return { cliente, usuarioId: data.user.id };
}

/** Sufixo único para não colidir com execuções anteriores. */
export const sufixo = () => `${Date.now()}`.slice(-6);
