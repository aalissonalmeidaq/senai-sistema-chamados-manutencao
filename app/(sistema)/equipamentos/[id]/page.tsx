import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirUsuario } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buscarHistorico } from "@/lib/consultas";
import { ehAdmin, ehEquipe } from "@/lib/regras/permissoes";
import { ROTULO_CATEGORIA_EQUIPAMENTO } from "@/lib/dominio/rotulos";
import { codigoChamado, formatarDataHora } from "@/lib/formatacao";
import { registrarErro } from "@/lib/erros";
import { CabecalhoPagina } from "@/components/ui/CabecalhoPagina";
import { MensagemRetorno } from "@/components/MensagemRetorno";
import { Historico } from "@/components/Historico";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { SeloEstadoEquipamento, SeloPrioridade, SeloStatusChamado } from "@/components/ui/Selo";
import { botao, cartao, tabela } from "@/components/ui/estilos";
import { FormAcao } from "@/components/formulario/FormAcao";
import { BotaoEnviar } from "@/components/formulario/Campos";
import { excluirEquipamento } from "../acoes";

export const metadata: Metadata = { title: "Equipamento" };

export default async function DetalheEquipamento({ params, searchParams }: PageProps<"/equipamentos/[id]">) {
  const usuario = await exigirUsuario();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const { sucesso } = await searchParams;

  const supabase = await createClient();
  const { data: equipamento, error } = await supabase
    .from("equipamentos")
    .select("*, criado_por_perfil:perfis(nome)")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    registrarErro("detalheEquipamento", error);
    throw new Error("Falha ao carregar o equipamento.");
  }
  if (!equipamento) notFound();

  // RLS: o solicitante vê apenas os próprios chamados deste equipamento.
  const [{ data: chamados }, historico] = await Promise.all([
    supabase
      .from("chamados")
      .select("id, titulo, status, prioridade, criado_em")
      .eq("equipamento_id", id)
      .order("criado_em", { ascending: false }),
    buscarHistorico({ equipamento_id: id }),
  ]);
  const listaChamados = chamados ?? [];

  return (
    <>
      <MensagemRetorno sucesso={sucesso} />
      <CabecalhoPagina
        acima={<Link href="/equipamentos" className={botao.link}>← Equipamentos</Link>}
        titulo={
          <span className="flex flex-wrap items-center gap-3">
            <span className="font-mono">{equipamento.codigo}</span> {equipamento.nome}
            <SeloEstadoEquipamento estado={equipamento.estado} />
          </span>
        }
        acoes={
          <>
            {equipamento.estado !== "inativo" ? (
              <Link href={`/chamados/novo?equipamento=${id}`} className={botao.primario}>
                Abrir chamado
              </Link>
            ) : null}
            {ehEquipe(usuario.papel) ? (
              <Link href={`/equipamentos/${id}/editar`} className={botao.secundario}>
                Editar
              </Link>
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className={cartao} aria-labelledby="titulo-dados">
            <h2 id="titulo-dados" className="mb-3 text-lg font-bold">Dados do equipamento</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="font-semibold text-slate-600">Categoria</dt><dd>{ROTULO_CATEGORIA_EQUIPAMENTO[equipamento.categoria]}</dd></div>
              <div><dt className="font-semibold text-slate-600">Localização</dt><dd>{equipamento.localizacao}</dd></div>
              <div className="sm:col-span-2"><dt className="font-semibold text-slate-600">Descrição</dt><dd>{equipamento.descricao || "—"}</dd></div>
              <div><dt className="font-semibold text-slate-600">Cadastrado em</dt><dd>{formatarDataHora(equipamento.criado_em)}</dd></div>
              <div><dt className="font-semibold text-slate-600">Última atualização</dt><dd>{formatarDataHora(equipamento.atualizado_em)}</dd></div>
              <div><dt className="font-semibold text-slate-600">Cadastrado por</dt><dd>{equipamento.criado_por_perfil?.nome ?? "—"}</dd></div>
            </dl>
            {equipamento.estado === "inativo" ? (
              <p className="mt-3 text-sm text-slate-700">Equipamento inativo: não aceita novos chamados.</p>
            ) : null}
          </section>

          <section aria-labelledby="titulo-chamados">
            <h2 id="titulo-chamados" className="mb-3 text-lg font-bold">
              {ehEquipe(usuario.papel) ? "Chamados deste equipamento" : "Meus chamados deste equipamento"}
            </h2>
            {listaChamados.length === 0 ? (
              <EstadoVazio titulo="Nenhum chamado registrado para este equipamento." />
            ) : (
              <div className={tabela.envoltorio}>
                <table className={tabela.tabela}>
                  <thead>
                    <tr>
                      <th scope="col" className={tabela.cabecalho}>Chamado</th>
                      <th scope="col" className={tabela.cabecalho}>Status</th>
                      <th scope="col" className={tabela.cabecalho}>Prioridade</th>
                      <th scope="col" className={tabela.cabecalho}>Abertura</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {listaChamados.map((c) => (
                      <tr key={c.id}>
                        <td className={tabela.celula}>
                          <Link href={`/chamados/${c.id}`} className={botao.link}>{codigoChamado(c.id)} — {c.titulo}</Link>
                        </td>
                        <td className={tabela.celula}><SeloStatusChamado status={c.status} /></td>
                        <td className={tabela.celula}><SeloPrioridade prioridade={c.prioridade} /></td>
                        <td className={tabela.celula}>{formatarDataHora(c.criado_em)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {ehAdmin(usuario.papel) ? (
            <section className={cartao} aria-labelledby="titulo-excluir">
              <h2 id="titulo-excluir" className="mb-2 font-bold">Excluir equipamento</h2>
              <p className="mb-3 text-sm text-slate-700">
                Só é possível excluir equipamentos sem chamados. Para retirar de uso, prefira o estado <strong>Inativo</strong>.
              </p>
              <FormAcao acao={excluirEquipamento.bind(null, id)} rotulo="Excluir equipamento">
                <BotaoEnviar variante="perigo" pendente="Excluindo...">Excluir equipamento</BotaoEnviar>
              </FormAcao>
            </section>
          ) : null}
        </div>

        <div className={cartao}>
          <Historico itens={historico} titulo="Histórico do equipamento" />
        </div>
      </div>
    </>
  );
}
