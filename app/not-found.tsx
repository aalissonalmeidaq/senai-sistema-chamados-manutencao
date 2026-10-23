import Link from "next/link";
import { botao } from "@/components/ui/estilos";

export default function NaoEncontrado() {
  return (
    <main id="conteudo" className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Página não encontrada</h1>
      <p className="mt-2 text-slate-700">
        O registro não existe ou você não tem permissão para vê-lo.
      </p>
      <Link href="/painel" className={`${botao.primario} mt-6`}>
        Voltar ao painel
      </Link>
    </main>
  );
}
