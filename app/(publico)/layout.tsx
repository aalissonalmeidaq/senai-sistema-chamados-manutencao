/** Layout das telas sem login (entrar e cadastrar). */
export default function LayoutPublico({ children }: LayoutProps<"/">) {
  return (
    <main id="conteudo" className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-marca-700">Ambiente didático</p>
          <p className="text-xl font-bold text-slate-900">Sistema de Chamados de Manutenção</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">{children}</div>
        <p className="mt-4 text-center text-xs text-slate-600">
          Uso exclusivo em aula. Todos os dados são fictícios.
        </p>
      </div>
    </main>
  );
}
