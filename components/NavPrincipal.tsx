"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type ItemMenu = { href: string; rotulo: string };

/** Menu principal; destaca a seção atual (aria-current). */
export function NavPrincipal({ itens }: { itens: ItemMenu[] }) {
  const caminho = usePathname();
  return (
    <nav aria-label="Menu principal">
      <ul className="flex flex-wrap gap-1">
        {itens.map((item) => {
          const ativo = caminho === item.href || caminho.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={`block rounded-md px-3 py-2 text-sm font-semibold ${
                  ativo ? "bg-white text-marca-800" : "text-white hover:bg-marca-800"
                }`}
              >
                {item.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
