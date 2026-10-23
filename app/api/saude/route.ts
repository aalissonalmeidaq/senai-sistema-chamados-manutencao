import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { configSupabaseDisponivel } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Teste de fumaça: GET /api/saude
 * Responde 200 quando a aplicação está no ar E consegue falar com o banco.
 * Não exige login e não devolve dados das tabelas.
 */
export async function GET() {
  if (!configSupabaseDisponivel()) {
    return NextResponse.json(
      { aplicacao: "ok", banco: "erro", detalhe: "Variáveis do Supabase ausentes (.env.local)." },
      { status: 503 },
    );
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("verificar_conexao");
    if (error) {
      return NextResponse.json({ aplicacao: "ok", banco: "erro", detalhe: error.message }, { status: 503 });
    }
    return NextResponse.json({ aplicacao: "ok", ...(data as object) });
  } catch (erro) {
    return NextResponse.json(
      { aplicacao: "ok", banco: "erro", detalhe: erro instanceof Error ? erro.message : "Falha de conexão." },
      { status: 503 },
    );
  }
}
