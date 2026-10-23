import { formatarDataHora } from "@/lib/formatacao";
import { EstadoVazio } from "@/components/ui/EstadoVazio";

export type ItemHistorico = {
  id: number;
  criado_em: string;
  descricao: string;
  tipo: string;
  autor: string | null;
};

/** Linha do tempo (ordem cronológica) dos eventos de auditoria. */
export function Historico({ itens, titulo = "Histórico" }: { itens: ItemHistorico[]; titulo?: string }) {
  return (
    <section aria-labelledby="titulo-historico">
      <h2 id="titulo-historico" className="mb-3 text-lg font-bold text-slate-900">
        {titulo}
      </h2>
      {itens.length === 0 ? (
        <EstadoVazio titulo="Nenhum evento registrado." />
      ) : (
        <ol className="relative space-y-4 border-l-2 border-slate-200 pl-5">
          {itens.map((item) => (
            <li key={item.id} className="relative">
              <span aria-hidden="true" className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-marca-600" />
              <p className="text-sm text-slate-900">{item.descricao}</p>
              <p className="text-xs text-slate-600">
                <time dateTime={item.criado_em}>{formatarDataHora(item.criado_em)}</time>
                {item.autor ? ` · ${item.autor}` : " · Sistema"}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
