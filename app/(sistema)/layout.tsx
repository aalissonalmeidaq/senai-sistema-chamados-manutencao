import { exigirUsuario } from "@/lib/auth";
import { ehAdmin, ehEquipe } from "@/lib/regras/permissoes";
import { ROTULO_PAPEL } from "@/lib/dominio/rotulos";
import { NavPrincipal, type ItemMenu } from "@/components/NavPrincipal";
import { sair } from "../(publico)/acoes";

/** Layout das telas que exigem login. O menu varia conforme o papel. */
export default async function LayoutSistema({ children }: LayoutProps<"/">) {
  const usuario = await exigirUsuario();

  const itens: ItemMenu[] = [
    { href: "/painel", rotulo: "Painel" },
    { href: "/chamados", rotulo: "Chamados" },
    { href: "/equipamentos", rotulo: "Equipamentos" },
  ];
  if (ehEquipe(usuario.papel)) itens.push({ href: "/ordens", rotulo: "Ordens" });
  if (ehAdmin(usuario.papel)) itens.push({ href: "/usuarios", rotulo: "Usuários" });

  return (
    <>
      <a href="#conteudo" className="pular-conteudo">
        Pular para o conteúdo
      </a>
      <header className="bg-marca-700 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-md bg-white font-bold text-marca-700">
              CM
            </span>
            <div>
              <p className="font-bold leading-tight">Chamados de Manutenção</p>
              <p className="text-xs text-marca-100">Ambiente didático · dados fictícios</p>
            </div>
          </div>
          <NavPrincipal itens={itens} />
          <div className="flex items-center gap-3 text-sm">
            <span>
              <span className="font-semibold">{usuario.nome}</span>{" "}
              <span className="text-marca-100">({ROTULO_PAPEL[usuario.papel]})</span>
            </span>
            <form action={sair}>
              <button type="submit" className="rounded-md border border-white/60 px-3 py-1.5 font-semibold hover:bg-marca-800">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {children}
      </main>
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-600">
        Sistema didático — Curso Técnico em Desenvolvimento de Sistemas. Não usar com dados reais.
      </footer>
    </>
  );
}
