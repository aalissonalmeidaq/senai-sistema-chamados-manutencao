import type { Metadata } from "next";
import Link from "next/link";
import { exigirEquipe } from "@/lib/auth";
import { CabecalhoPagina } from "@/components/ui/CabecalhoPagina";
import { botao } from "@/components/ui/estilos";
import { FormularioEquipamento } from "../FormularioEquipamento";
import { criarEquipamento } from "../acoes";

export const metadata: Metadata = { title: "Cadastrar equipamento" };

export default async function NovoEquipamento() {
  await exigirEquipe();
  return (
    <>
      <CabecalhoPagina
        titulo="Cadastrar equipamento"
        acima={<Link href="/equipamentos" className={botao.link}>← Equipamentos</Link>}
        descricao="Campos marcados com * são obrigatórios."
      />
      <FormularioEquipamento acao={criarEquipamento} cancelarHref="/equipamentos" />
    </>
  );
}
