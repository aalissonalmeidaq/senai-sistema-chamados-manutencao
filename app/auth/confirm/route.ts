import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino do link do e-mail de confirmação.
 * Aceita o formato do modelo de e-mail do projeto (token_hash + type) e,
 * como alternativa, o código do fluxo PKCE (?code=).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type") as EmailOtpType | null;
  const codigo = searchParams.get("code");
  const proximo = searchParams.get("next") ?? "/painel";
  const destino = proximo.startsWith("/") && !proximo.startsWith("//") ? proximo : "/painel";

  const supabase = await createClient();

  if (tokenHash && tipo) {
    const { error } = await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash });
    if (!error) redirect(destino);
    redirect(`/auth/erro?motivo=${encodeURIComponent(error.message)}`);
  }

  if (codigo) {
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) redirect(destino);
    redirect(`/auth/erro?motivo=${encodeURIComponent(error.message)}`);
  }

  redirect("/auth/erro?motivo=Link%20de%20confirma%C3%A7%C3%A3o%20incompleto");
}
