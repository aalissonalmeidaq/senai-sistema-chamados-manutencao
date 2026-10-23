/** Classes Tailwind reutilizadas para manter a aparência consistente. */

const botaoBase =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold " +
  "transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const botao = {
  primario: `${botaoBase} bg-marca-700 text-white hover:bg-marca-800`,
  secundario: `${botaoBase} border border-slate-300 bg-white text-slate-800 hover:bg-slate-50`,
  perigo: `${botaoBase} bg-red-700 text-white hover:bg-red-800`,
  link: "font-semibold text-marca-700 underline-offset-2 hover:underline",
};

export const campo =
  "block w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-sm text-slate-900 " +
  "placeholder:text-slate-500 aria-[invalid=true]:border-red-700";

export const cartao = "rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6";

export const tabela = {
  envoltorio: "overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm",
  tabela: "min-w-full divide-y divide-slate-200 text-left text-sm",
  cabecalho: "bg-slate-50 px-4 py-3 font-semibold text-slate-700",
  celula: "px-4 py-3 align-top text-slate-800",
};
