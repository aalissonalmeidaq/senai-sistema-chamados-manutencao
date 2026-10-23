import type { Metadata } from "next";
import Link from "next/link";
import { exigirUsuario } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ehEquipe } from "@/lib/regras/permissoes";
import { STATUS_CHAMADO_ATIVOS } from "@/lib/regras/chamados";
import {
  ESTADOS_EQUIPAMENTO,
  PRIORIDADES,
  ROTULO_ESTADO_EQUIPAMENTO,
  ROTULO_PRIORIDADE,
  ROTULO_STATUS_CHAMADO,
  STATUS_CHAMADO,
} from "@/lib/dominio/rotulos";
import { codigoChamado, formatarDataHora } from "@/lib/formatacao";
import { registrarErro } from "@/lib/erros";
import { CabecalhoPagina } from "@/components/ui/CabecalhoPagina";
import { MensagemRetorno } from "@/components/MensagemRetorno";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { SeloPrioridade, SeloStatusChamado } from "@/components/ui/Selo";
import { botao, cartao, tabela } from "@/components/ui/estilos";

export const metadata: Metadata = { title: "Painel" };

function contar<T extends string>(valores: T[], chaves: readonly T[]) {
  const total = Object.fromEntries(chaves.map((c) => [c, 0])) as Record<T, number>;
  for (const v of valores) total[v] += 1;
  return total;
}

function Indicador({ rotulo, valor, href }: { rotulo: string; valor: number; href?: string }) {
  const conteudo = (
    <>
      <span className="block text-3xl font-bold text-slate-900">{valor}</span>
      <span className="text-sm text-slate-700">{rotulo}</span>
    </>
  );
  return href ? (
    <Link href={href} className={`${cartao} block hover:border-marca-600`}>
      {conteudo}
    </Link>
  ) : (
    <div className={cartao}>{conteudo}</div>
  );
}

export default async function Painel({ searchParams }: PageProps<"/painel">) {
  const { aviso } = await searchParams;
  const usuario = await exigirUsuario();
  const equipe = ehEquipe(usuario.papel);
  const supabase = await createClient();

  // RLS: o solicitante recebe só os próprios chamados; a equipe recebe todos.
  const [equipamentos, chamados, ordens, recentes] = await Promise.all([
    supabase.from("equipamentos").select("estado"),
    supabase.from("chamados").select("status, prioridade"),
    supabase.from("ordens_manutencao").select("status").in("status", ["planejada", "em_execucao"]),
    supabase
      .from("chamados")
      .select("id, titulo, status, prioridade, criado_em, equipamento:equipamentos(codigo)")
      .in("status", [...STATUS_CHAMADO_ATIVOS])
      .order("criado_em", { ascending: false })
      .limit(5),
  ]);

  const erro = equipamentos.error ?? chamados.error ?? ordens.error ?? recentes.error;
  if (erro) {
    registrarErro("painel", erro);
    throw new Error("Falha ao carregar o painel.");
  }

  const listaEquipamentos = equipamentos.data ?? [];
  const listaChamados = chamados.data ?? [];
  const listaOrdens = ordens.data ?? [];
  const listaRecentes = recentes.data ?? [];

  const porEstado = contar(listaEquipamentos.map((e) => e.estado), ESTADOS_EQUIPAMENTO);
  const porStatus = contar(listaChamados.map((c) => c.status), STATUS_CHAMADO);
  const ativos = listaChamados.filter((c) => STATUS_CHAMADO_ATIVOS.includes(c.status));
  const porPrioridade = contar(ativos.map((c) => c.prioridade), PRIORIDADES);
  const ordensEmExecucao = listaOrdens.filter((o) => o.status === "em_execucao").length;

  return (
    <>
      <MensagemRetorno aviso={aviso} />
      <CabecalhoPagina
        titulo={`Olá, ${usuario.nome}`}
        descricao={
          equipe
            ? "Visão geral de todos os equipamentos, chamados e ordens."
            : "Visão geral dos seus chamados e dos equipamentos."
        }
        acoes={
          <Link href="/chamados/novo" className={botao.primario}>
            Abrir chamado
          </Link>
        }
      />

      <section aria-labelledby="titulo-totais" className="mb-8">
        <h2 id="titulo-totais" className="sr-only">
          Totais
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Indicador rotulo="Equipamentos cadastrados" valor={listaEquipamentos.length} href="/equipamentos" />
          <Indicador rotulo={equipe ? "Chamados em andamento" : "Meus chamados em andamento"} valor={ativos.length} href="/chamados" />
          <Indicador rotulo="Ordens em andamento" valor={listaOrdens.length} href={equipe ? "/ordens" : undefined} />
          <Indicador rotulo="Ordens em execução" valor={ordensEmExecucao} />
        </div>
      </section>

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <section aria-labelledby="titulo-status" className={cartao}>
          <h2 id="titulo-status" className="mb-3 font-bold">
            Chamados por status
          </h2>
          <ul className="space-y-2 text-sm">
            {STATUS_CHAMADO.map((s) => (
              <li key={s} className="flex items-center justify-between">
                <Link href={`/chamados?status=${s}`} className="hover:underline">
                  <SeloStatusChamado status={s} />
                </Link>
                <span className="font-semibold" aria-label={`${porStatus[s]} chamados ${ROTULO_STATUS_CHAMADO[s]}`}>
                  {porStatus[s]}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="titulo-prioridade" className={cartao}>
          <h2 id="titulo-prioridade" className="mb-3 font-bold">
            Em andamento por prioridade
          </h2>
          <ul className="space-y-2 text-sm">
            {PRIORIDADES.map((p) => (
              <li key={p} className="flex items-center justify-between">
                <SeloPrioridade prioridade={p} />
                <span className="font-semibold" aria-label={`${porPrioridade[p]} chamados de prioridade ${ROTULO_PRIORIDADE[p]}`}>
                  {porPrioridade[p]}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="titulo-equip" className={cartao}>
          <h2 id="titulo-equip" className="mb-3 font-bold">
            Equipamentos por estado
          </h2>
          <ul className="space-y-2 text-sm">
            {ESTADOS_EQUIPAMENTO.map((e) => (
              <li key={e} className="flex items-center justify-between">
                <span>{ROTULO_ESTADO_EQUIPAMENTO[e]}</span>
                <span className="font-semibold">{porEstado[e]}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="titulo-recentes">
        <h2 id="titulo-recentes" className="mb-3 text-lg font-bold">
          Chamados em andamento mais recentes
        </h2>
        {listaRecentes.length === 0 ? (
          <EstadoVazio titulo="Nenhum chamado em andamento.">
            Para registrar um problema, use <strong>Abrir chamado</strong>.
          </EstadoVazio>
        ) : (
          <div className={tabela.envoltorio}>
            <table className={tabela.tabela}>
              <thead>
                <tr>
                  <th scope="col" className={tabela.cabecalho}>Chamado</th>
                  <th scope="col" className={tabela.cabecalho}>Equipamento</th>
                  <th scope="col" className={tabela.cabecalho}>Status</th>
                  <th scope="col" className={tabela.cabecalho}>Prioridade</th>
                  <th scope="col" className={tabela.cabecalho}>Abertura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listaRecentes.map((c) => (
                  <tr key={c.id}>
                    <td className={tabela.celula}>
                      <Link href={`/chamados/${c.id}`} className={botao.link}>
                        {codigoChamado(c.id)} — {c.titulo}
                      </Link>
                    </td>
                    <td className={tabela.celula}>{c.equipamento?.codigo}</td>
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
    </>
  );
}
