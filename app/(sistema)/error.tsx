"use client";

import { Alerta } from "@/components/ui/Alerta";
import { botao } from "@/components/ui/estilos";

/** Exibido quando uma página falha ao carregar (ex.: banco fora do ar). */
export default function ErroPagina({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="space-y-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900">Algo deu errado</h1>
      <Alerta tipo="erro">
        Não foi possível carregar esta página. Verifique se o Supabase local está rodando (<code>npm run db:status</code>)
        e tente novamente.
        {error.digest ? <span className="block text-xs">Código para diagnóstico: {error.digest}</span> : null}
      </Alerta>
      <button type="button" onClick={reset} className={botao.secundario}>
        Tentar novamente
      </button>
    </div>
  );
}
