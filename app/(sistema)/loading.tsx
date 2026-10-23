/** Exibido enquanto os dados da página são carregados do banco. */
export default function Carregando() {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 py-10 text-slate-700">
      <span aria-hidden="true" className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-marca-700" />
      Carregando dados...
    </div>
  );
}
