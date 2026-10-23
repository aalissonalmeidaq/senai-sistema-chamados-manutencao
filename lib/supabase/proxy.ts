import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { configSupabaseDisponivel, obterConfigSupabase } from "@/lib/env";

/** Rotas acessíveis sem login. */
const ROTAS_PUBLICAS = ["/entrar", "/cadastrar", "/auth", "/api/saude"];

export function rotaPublica(caminho: string) {
  return caminho === "/" || ROTAS_PUBLICAS.some((r) => caminho === r || caminho.startsWith(`${r}/`));
}

/**
 * Renova a sessão do Supabase (cookies) a cada requisição e redireciona
 * visitantes sem login para /entrar. Baseado no exemplo oficial
 * "with-supabase" do Next.js.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Sem .env.local a aplicação mostra a orientação de configuração.
  if (!configSupabaseDisponivel()) {
    return supabaseResponse;
  }

  const { url, chave } = obterConfigSupabase();
  const supabase = createServerClient(url, chave, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Não coloque código entre createServerClient e getClaims().
  const { data } = await supabase.auth.getClaims();
  const usuario = data?.claims;

  if (!usuario && !rotaPublica(request.nextUrl.pathname)) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/entrar";
    destino.search = "";
    destino.searchParams.set("proximo", request.nextUrl.pathname);
    return NextResponse.redirect(destino);
  }

  // Devolva o supabaseResponse como está, para não perder os cookies.
  return supabaseResponse;
}
