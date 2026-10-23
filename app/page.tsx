import { redirect } from "next/navigation";
import { configSupabaseDisponivel } from "@/lib/env";
import { obterUsuarioAtual } from "@/lib/auth";
import { Alerta } from "@/components/ui/Alerta";

/** Página inicial: leva ao painel (logado) ou à tela de entrada. */
export default async function Inicio() {
  if (!configSupabaseDisponivel()) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-2xl font-bold">Configuração pendente</h1>
        <Alerta tipo="aviso">
          O arquivo <code>.env.local</code> não foi encontrado ou está incompleto. Rode{" "}
          <code>npm run setup:local</code> e reinicie <code>npm run dev</code>. Veja a seção 5 do README.
        </Alerta>
      </main>
    );
  }
  const usuario = await obterUsuarioAtual();
  redirect(usuario ? "/painel" : "/entrar");
}
