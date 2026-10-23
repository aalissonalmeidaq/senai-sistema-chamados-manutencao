import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirUsuario } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buscarHistorico, listarEquipeTecnica } from "@/lib/consultas";
import { ehEquipe } from "@/lib/regras/permissoes";
import {
  podeComentar,
  podeCriarOrdem,
  podeFazerTriagem,
  transicoesDisponiveis,
} from "@/lib/regras/chamados";
import { STATUS_ORDEM_ATIVOS } from "@/lib/regras/ordens";
import {
  CATEGORIAS_CHAMADO,
  PRIORIDADES,
  ROTULO_CATEGORIA_CHAMADO,
  ROTULO_PRIORIDADE,
  ROTULO_STATUS_CHAMADO,
  ROTULO_TIPO_MANUTENCAO,
} from "@/lib/dominio/rotulos";
import { codigoChamado, codigoOrdem, formatarDataHora } from "@/lib/formatacao";
import { registrarErro } from "@/lib/erros";
import { CabecalhoPagina } from "@/components/ui/CabecalhoPagina";
import { MensagemRetorno } from "@/components/MensagemRetorno";
import { Historico } from "@/components/Historico";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { SeloPrioridade, SeloStatusChamado, SeloStatusOrdem } from "@/components/ui/Selo";
import { botao, cartao } from "@/components/ui/estilos";
import { FormAcao } from "@/components/formulario/FormAcao";
import { BotaoEnviar, CampoAreaTexto, CampoCaixa, CampoSelecao } from "@/components/formulario/Campos";
import { comentarChamado, mudarStatusChamado, salvarTriagem } from "../acoes";

export const metadata: Metadata = { title: "Chamado" };

export default async function DetalheChamado({ params, searchParams }: PageProps<"/chamados/[id]">) {
  const usuario = await exigirUsuario();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const { sucesso } = await searchParams;
  const equipe = ehEquipe(usuario.papel);

  const supabase = await createClient();
  const { data: chamado, error } = await supabase
    .from("chamados")
    .select(
      "*, equipamento:equipamentos(id, codigo, nome, localizacao, estado), solicitante:perfis!chamados_solicitante_id_fkey(nome), tecnico:perfis!chamados_tecnico_id_fkey(nome)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    registrarErro("detalheChamado", error);
    throw new Error("Falha ao carregar o chamado.");
  }
  // RLS: se o chamado é de outra pessoa, o solicitante simplesmente não o recebe.
  if (!chamado) notFound();

  const [ordensResp, comentariosResp, historico, tecnicos] = await Promise.all([
    supabase
      .from("ordens_manutencao")
      .select("id, tipo, status, criado_em, responsavel:perfis(nome)")
      .eq("chamado_id", id)
      .order("criado_em"),
    supabase
      .from("comentarios_chamado")
      .select("id, texto, interno, criado_em, autor:perfis(nome)")
      .eq("chamado_id", id)
      .order("criado_em"),
    buscarHistorico({ chamado_id: id }),
    equipe ? listarEquipeTecnica() : Promise.resolve([]),
  ]);
  const ordens = ordensResp.data ?? [];
  const comentarios = comentariosResp.data ?? [];

  const temOrdemAtiva = ordens.some((o) => STATUS_ORDEM_ATIVOS.includes(o.status));
  const ehSolicitante = chamado.solicitante_id === usuario.id;
  const transicoes = transicoesDisponiveis(chamado.status, { papel: usuario.papel, ehSolicitante });
  const exigemObservacao = transicoes.filter((t) => t.exigeObservacao).map((t) => ROTULO_STATUS_CHAMADO[t.para]);

  return (
    <>
      <MensagemRetorno sucesso={sucesso} />
      <CabecalhoPagina
        acima={<Link href="/chamados" className={botao.link}>← Chamados</Link>}
        titulo={
          <span>
            <span className="font-mono text-slate-600">{codigoChamado(chamado.id)}</span> {chamado.titulo}
          </span>
        }
        descricao={
          <span className="mt-2 flex flex-wrap gap-2">
            <SeloStatusChamado status={chamado.status} />
            <SeloPrioridade prioridade={chamado.prioridade} />
          </span>
        }
        acoes={
          podeCriarOrdem(chamado.status, usuario.papel, temOrdemAtiva) ? (
            <Link href={`/ordens/nova?chamado=${chamado.id}`} className={botao.primario}>
              Criar ordem de manutenção
            </Link>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className={cartao} aria-labelledby="titulo-detalhes">
            <h2 id="titulo-detalhes" className="mb-3 text-lg font-bold">Detalhes</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-600">Equipamento</dt>
                <dd>
                  <Link href={`/equipamentos/${chamado.equipamento?.id}`} className={botao.link}>
                    {chamado.equipamento?.codigo} — {chamado.equipamento?.nome}
                  </Link>
                  <span className="block text-slate-600">{chamado.equipamento?.localizacao}</span>
                </dd>
              </div>
              <div><dt className="font-semibold text-slate-600">Categoria</dt><dd>{ROTULO_CATEGORIA_CHAMADO[chamado.categoria]}</dd></div>
              <div><dt className="font-semibold text-slate-600">Solicitante</dt><dd>{chamado.solicitante?.nome}</dd></div>
              <div><dt className="font-semibold text-slate-600">Técnico responsável</dt><dd>{chamado.tecnico?.nome ?? "Não atribuído"}</dd></div>
              <div><dt className="font-semibold text-slate-600">Aberto em</dt><dd>{formatarDataHora(chamado.criado_em)}</dd></div>
              <div><dt className="font-semibold text-slate-600">Última atualização</dt><dd>{formatarDataHora(chamado.atualizado_em)}</dd></div>
              {chamado.resolvido_em ? <div><dt className="font-semibold text-slate-600">Resolvido em</dt><dd>{formatarDataHora(chamado.resolvido_em)}</dd></div> : null}
              {chamado.encerrado_em ? <div><dt className="font-semibold text-slate-600">Encerrado em</dt><dd>{formatarDataHora(chamado.encerrado_em)}</dd></div> : null}
              <div className="sm:col-span-2">
                <dt className="font-semibold text-slate-600">Descrição</dt>
                <dd className="whitespace-pre-line">{chamado.descricao}</dd>
              </div>
            </dl>
          </section>

          {transicoes.length > 0 ? (
            <section className={cartao} aria-labelledby="titulo-status">
              <h2 id="titulo-status" className="mb-3 text-lg font-bold">Mudar status</h2>
              <FormAcao acao={mudarStatusChamado.bind(null, chamado.id)} rotulo="Mudar status do chamado">
                <CampoSelecao
                  nome="para"
                  rotulo="Próximo passo"
                  obrigatorio
                  valorInicial={transicoes[0].para}
                  opcoes={transicoes.map((t) => ({ valor: t.para, rotulo: `${t.acao} (→ ${ROTULO_STATUS_CHAMADO[t.para]})` }))}
                />
                <CampoAreaTexto
                  nome="observacao"
                  rotulo="Observação"
                  linhas={3}
                  ajuda={
                    exigemObservacao.length > 0
                      ? `Obrigatória ao mudar para: ${exigemObservacao.join(", ")}. A observação fica visível no histórico.`
                      : "Opcional. Fica visível no histórico."
                  }
                />
                <BotaoEnviar pendente="Salvando...">Confirmar mudança</BotaoEnviar>
              </FormAcao>
            </section>
          ) : null}

          {podeFazerTriagem(chamado.status, usuario.papel) ? (
            <section className={cartao} aria-labelledby="titulo-triagem">
              <h2 id="titulo-triagem" className="mb-3 text-lg font-bold">Triagem</h2>
              <FormAcao acao={salvarTriagem.bind(null, chamado.id)} rotulo="Triagem do chamado">
                <div className="grid gap-4 sm:grid-cols-3">
                  <CampoSelecao
                    nome="prioridade"
                    rotulo="Prioridade"
                    obrigatorio
                    valorInicial={chamado.prioridade}
                    opcoes={PRIORIDADES.map((p) => ({ valor: p, rotulo: ROTULO_PRIORIDADE[p] }))}
                  />
                  <CampoSelecao
                    nome="categoria"
                    rotulo="Categoria"
                    obrigatorio
                    valorInicial={chamado.categoria}
                    opcoes={CATEGORIAS_CHAMADO.map((c) => ({ valor: c, rotulo: ROTULO_CATEGORIA_CHAMADO[c] }))}
                  />
                  <CampoSelecao
                    nome="tecnico_id"
                    rotulo="Técnico responsável"
                    vazio="Não atribuído"
                    valorInicial={chamado.tecnico_id ?? ""}
                    opcoes={tecnicos.map((t) => ({ valor: t.id, rotulo: t.nome }))}
                  />
                </div>
                <BotaoEnviar>Salvar triagem</BotaoEnviar>
              </FormAcao>
            </section>
          ) : null}

          <section aria-labelledby="titulo-ordens">
            <h2 id="titulo-ordens" className="mb-3 text-lg font-bold">Ordens de manutenção</h2>
            {ordens.length === 0 ? (
              <EstadoVazio titulo="Nenhuma ordem de manutenção para este chamado." />
            ) : (
              <ul className="space-y-2">
                {ordens.map((o) => (
                  <li key={o.id} className={`${cartao} flex flex-wrap items-center justify-between gap-2`}>
                    <span>
                      {equipe ? (
                        <Link href={`/ordens/${o.id}`} className={`${botao.link} font-mono`}>{codigoOrdem(o.id)}</Link>
                      ) : (
                        <span className="font-mono font-semibold">{codigoOrdem(o.id)}</span>
                      )}{" "}
                      · Manutenção {ROTULO_TIPO_MANUTENCAO[o.tipo].toLowerCase()} · {o.responsavel?.nome}
                    </span>
                    <SeloStatusOrdem status={o.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="titulo-comentarios">
            <h2 id="titulo-comentarios" className="mb-3 text-lg font-bold">Comentários</h2>
            {comentarios.length === 0 ? (
              <EstadoVazio titulo="Nenhum comentário." />
            ) : (
              <ul className="mb-4 space-y-3">
                {comentarios.map((c) => (
                  <li key={c.id} className={`${cartao} ${c.interno ? "border-l-4 border-l-amber-500" : ""}`}>
                    <p className="mb-1 text-xs text-slate-600">
                      <strong className="text-slate-800">{c.autor?.nome ?? "Usuário removido"}</strong> ·{" "}
                      {formatarDataHora(c.criado_em)}
                      {c.interno ? <span className="ml-2 font-semibold text-amber-800">[Interno — só equipe]</span> : null}
                    </p>
                    <p className="whitespace-pre-line text-sm">{c.texto}</p>
                  </li>
                ))}
              </ul>
            )}
            {podeComentar(chamado.status) ? (
              <div className={cartao}>
                <FormAcao acao={comentarChamado.bind(null, chamado.id)} rotulo="Novo comentário">
                  <CampoAreaTexto nome="texto" rotulo="Novo comentário" obrigatorio linhas={3} />
                  {equipe ? (
                    <CampoCaixa
                      nome="interno"
                      rotulo="Comentário interno"
                      ajuda="Visível apenas para técnicos e administradores."
                      marcado
                    />
                  ) : null}
                  <BotaoEnviar pendente="Enviando...">Comentar</BotaoEnviar>
                </FormAcao>
              </div>
            ) : (
              <p className="text-sm text-slate-600">Chamado encerrado: não aceita novos comentários.</p>
            )}
          </section>
        </div>

        <div className={cartao}>
          <Historico itens={historico} titulo="Histórico do chamado" />
        </div>
      </div>
    </>
  );
}
