import type { ReactNode } from "react";

export function CabecalhoPagina({
  titulo,
  descricao,
  acoes,
  acima,
}: {
  titulo: ReactNode;
  descricao?: ReactNode;
  acoes?: ReactNode;
  /** Conteúdo acima do título (ex.: link "voltar"). */
  acima?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {acima ? <div className="mb-2 text-sm">{acima}</div> : null}
        <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>
        {descricao ? <div className="mt-1 text-sm text-slate-600">{descricao}</div> : null}
      </div>
      {acoes ? <div className="flex flex-wrap gap-2">{acoes}</div> : null}
    </div>
  );
}
