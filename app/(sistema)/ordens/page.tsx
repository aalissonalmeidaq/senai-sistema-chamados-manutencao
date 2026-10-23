import type { Metadata } from "next";
import Link from "next/link";
import { exigirEquipe } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ROTULO_STATUS_ORDEM, ROTULO_TIPO_MANUTENCAO, STATUS_ORDEM, TIPOS_MANUTENCAO } from "@/lib/dominio/rotulos";
import { codigoChamado, codigoOrdem, formatarDataHora } from "@/lib/formatacao";
import { registrarErro } from "@/lib/erros";
import { CabecalhoPagina } from "@/components/ui/CabecalhoPagina";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { SeloStatusOrdem } from "@/components/ui/Selo";
import { botao, campo, tabela } from "@/components/ui/estilos";
import type { StatusOrdem, TipoManutencao } from "@/types/dominio";

export const metadata: Metadata = { title: "Ordens de manutenção" };

export default async function ListaOrdens({ searchParams }: PageProps<"/ordens">) {
  await exigirEquipe();
  const params = await searchParams;
  const status = STATUS_ORDEM.find((s) => s === params.status) as StatusOrdem | undefined;
  const tipo = TIPOS_MANUTENCAO.find((t) => t === params.tipo) as TipoManutencao | undefined;

  const supabase = await createClient();
  let consulta = supabase
    .from("ordens_manutencao")
    .select(
      "id, tipo, status, criado_em, iniciada_em, concluida_em, chamado_id, chamado:chamados(titulo), equipamento:equipamentos(codigo), responsavel:perfis(nome)",
    )
    .order("criado_em", { ascending: false });
  if (status) consulta = consulta.eq("status", status);
  if (tipo) consulta = consulta.eq("tipo", tipo);

  const { data, error } = await consulta;
  if (error) {
    registrarErro("listaOrdens", error);
    throw new Error("Falha ao carregar ordens.");
  }
  const ordens = data ?? [];
  const filtrando = Boolean(status || tipo);

  return (
    <>
      <CabecalhoPagina
        titulo="Ordens de manutenção"
        descricao="Para criar uma ordem, abra o chamado correspondente e use “Criar ordem de manutenção”."
      />
      <form role="search" aria-label="Filtrar ordens" className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-semibold">Status</label>
          <select id="status" name="status" defaultValue={status ?? ""} className={campo}>
            <option value="">Todos</option>
            {STATUS_ORDEM.map((s) => <option key={s} value={s}>{ROTULO_STATUS_ORDEM[s]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="tipo" className="mb-1 block text-sm font-semibold">Tipo</label>
          <select id="tipo" name="tipo" defaultValue={tipo ?? ""} className={campo}>
            <option value="">Todos</option>
            {TIPOS_MANUTENCAO.map((t) => <option key={t} value={t}>{ROTULO_TIPO_MANUTENCAO[t]}</option>)}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className={botao.primario}>Filtrar</button>
          {filtrando ? <Link href="/ordens" className={botao.secundario}>Limpar</Link> : null}
        </div>
      </form>

      <p className="mb-2 text-sm text-slate-700" aria-live="polite">{ordens.length} ordem(ns) encontrada(s).</p>

      {ordens.length === 0 ? (
        <EstadoVazio titulo={filtrando ? "Nenhuma ordem corresponde aos filtros." : "Nenhuma ordem registrada."} />
      ) : (
        <div className={tabela.envoltorio}>
          <table className={tabela.tabela}>
            <caption className="sr-only">Lista de ordens de manutenção</caption>
            <thead>
              <tr>
                <th scope="col" className={tabela.cabecalho}>Ordem</th>
                <th scope="col" className={tabela.cabecalho}>Chamado</th>
                <th scope="col" className={tabela.cabecalho}>Equipamento</th>
                <th scope="col" className={tabela.cabecalho}>Tipo</th>
                <th scope="col" className={tabela.cabecalho}>Responsável</th>
                <th scope="col" className={tabela.cabecalho}>Status</th>
                <th scope="col" className={tabela.cabecalho}>Criada em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ordens.map((o) => (
                <tr key={o.id}>
                  <td className={`${tabela.celula} font-mono`}>
                    <Link href={`/ordens/${o.id}`} className={botao.link}>{codigoOrdem(o.id)}</Link>
                  </td>
                  <td className={tabela.celula}>
                    <Link href={`/chamados/${o.chamado_id}`} className={botao.link}>
                      {codigoChamado(o.chamado_id)}
                    </Link>{" "}
                    {o.chamado?.titulo}
                  </td>
                  <td className={`${tabela.celula} font-mono`}>{o.equipamento?.codigo}</td>
                  <td className={tabela.celula}>{ROTULO_TIPO_MANUTENCAO[o.tipo]}</td>
                  <td className={tabela.celula}>{o.responsavel?.nome}</td>
                  <td className={tabela.celula}><SeloStatusOrdem status={o.status} /></td>
                  <td className={tabela.celula}>{formatarDataHora(o.criado_em)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
