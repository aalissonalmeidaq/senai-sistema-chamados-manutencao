import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { obterConfigSupabase } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Cliente Supabase para Server Components, Server Actions e Route Handlers.
 * Usa os cookies da requisição, então as consultas rodam COMO o usuário
 * logado e passam pelas políticas RLS do banco.
 *
 * Não guarde este cliente em variável global: crie um novo a cada uso.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, chave } = obterConfigSupabase();

  return createServerClient<Database>(url, chave, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Chamado a partir de um Server Component: pode ser ignorado,
          // porque o proxy.ts renova a sessão a cada requisição.
        }
      },
    },
  });
}
