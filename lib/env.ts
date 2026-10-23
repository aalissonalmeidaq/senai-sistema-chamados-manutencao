/**
 * Variáveis de ambiente públicas usadas pela aplicação.
 *
 * NEXT_PUBLIC_* vai para o navegador: aqui só entram a URL do Supabase e a
 * chave PUBLICÁVEL (publishable). Nunca coloque a chave secreta
 * (sb_secret_... / service_role) em uma variável NEXT_PUBLIC_*.
 */
export function obterConfigSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !chave) {
    throw new Error(
      "Variáveis do Supabase ausentes. Crie o arquivo .env.local com " +
        "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY " +
        "(rode `npm run setup:local` ou veja o README, seção 5).",
    );
  }
  if (chave.startsWith("sb_secret_")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY contém uma chave SECRETA. " +
        "Use a chave publicável (sb_publishable_...).",
    );
  }
  return { url, chave };
}

export function configSupabaseDisponivel() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
