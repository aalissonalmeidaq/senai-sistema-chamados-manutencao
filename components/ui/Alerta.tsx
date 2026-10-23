import type { ReactNode } from "react";

type TipoAlerta = "sucesso" | "erro" | "aviso" | "info";

const ESTILO: Record<TipoAlerta, { classes: string; icone: string; rotulo: string }> = {
  sucesso: { classes: "border-green-700 bg-green-50 text-green-900", icone: "✓", rotulo: "Sucesso" },
  erro: { classes: "border-red-700 bg-red-50 text-red-900", icone: "!", rotulo: "Erro" },
  aviso: { classes: "border-amber-600 bg-amber-50 text-amber-900", icone: "!", rotulo: "Atenção" },
  info: { classes: "border-marca-600 bg-marca-50 text-marca-900", icone: "i", rotulo: "Informação" },
};

/** Mensagem de retorno. Erros usam role="alert" (lido imediatamente por leitores de tela). */
export function Alerta({ tipo, children }: { tipo: TipoAlerta; children: ReactNode }) {
  const estilo = ESTILO[tipo];
  return (
    <div
      role={tipo === "erro" ? "alert" : "status"}
      className={`flex gap-3 rounded-md border-l-4 px-4 py-3 text-sm ${estilo.classes}`}
    >
      <span aria-hidden="true" className="font-bold">
        {estilo.icone}
      </span>
      <div>
        <span className="sr-only">{estilo.rotulo}: </span>
        {children}
      </div>
    </div>
  );
}
