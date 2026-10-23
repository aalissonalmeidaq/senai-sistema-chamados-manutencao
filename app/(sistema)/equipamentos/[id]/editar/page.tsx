import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirEquipe } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CabecalhoPagina } from "@/components/ui/CabecalhoPagina";
import { botao } from "@/components/ui/estilos";
import { FormularioEquipamento } from "../../FormularioEquipamento";
import { atualizarEquipamento } from "../../acoes";

export const metadata: Metadata = { title: "Editar equipamento" };

export default async function EditarEquipamento({ params }: PageProps<"/equipamentos/[id]/editar">) {
  await exigirEquipe();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const supabase = await createClient();
  const { data: equipamento } = await supabase
    .from("equipamentos")
    .select("id, codigo, nome, categoria, localizacao, descricao, estado")
    .eq("id", id)
    .maybeSingle();
  if (!equipamento) notFound();

  return (
    <>
      <CabecalhoPagina
        titulo={`Editar ${equipamento.codigo}`}
        acima={<Link href={`/equipamentos/${id}`} className={botao.link}>← Voltar ao equipamento</Link>}
        descricao="As alterações ficam registradas no histórico do equipamento."
      />
      <FormularioEquipamento
        acao={atualizarEquipamento.bind(null, id)}
        equipamento={equipamento}
        cancelarHref={`/equipamentos/${id}`}
      />
    </>
  );
}
