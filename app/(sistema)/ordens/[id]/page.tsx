import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirEquipe } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buscarHistorico, listarEquipeTecnica } from "@/lib/consultas";
import { ordemFinalizada, pendenciasConclusao, transicoesOrdemDisponiveis } from "@/lib/regras/ordens";
import {
  DESCRICAO_TIPO_MANUTENCAO,
  RESULTADOS_ORDEM,
  ROTULO_RESULTADO_ORDEM,
  ROTULO_STATUS_ORDEM,
  ROTULO_TIPO_MANUTENCAO,
  TIPOS_MANUTENCAO,
} from "@/lib/dominio/rotulos";
import { codigoChamado, codigoOrdem, formatarDataHora, formatarDuracao } from "@/lib/formatacao";
import { registrarErro } from "@/lib/erros";
import { CabecalhoPagina } from "@/components/ui/CabecalhoPagina";
import { MensagemRetorno } from "@/components/MensagemRetorno";
import { Historico } from "@/components/Historico";
import { Alerta } from "@/components/ui/Alerta";
import { SeloStatusChamado, SeloStatusOrdem } from "@/components/ui/Selo";
import { botao, cartao } from "@/components/ui/estilos";
import { FormAcao } from "@/components/formulario/FormAcao";
import { BotaoEnviar, CampoAreaTexto, CampoSelecao } from "@/components/formulario/Campos";
import { atualizarOrdem, mudarStatusOrdem } from "../acoes";

export const metadata: Metadata = { title: "Ordem de manutenção" };

function Texto({ valor }: { valor: string }) {
  return valor.trim() ? <span className="whitespace-pre-line">{valor}</span> : <span className="text-slate-500">Não informado</span>;
}

export default async function DetalheOrdem({ params, searchParams }: PageProps<"/ordens/[id]">) {
  await exigirEquipe();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const { sucesso } = await searchParams;

  const supabase = await createClient();
  const { data: ordem, error } = await supabase
    .from("ordens_manutencao")
    .select(
      "*, chamado:chamados(id, titulo, status), equipamento:equipamentos(id, codigo, nome, estado), responsavel:perfis(nome)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    registrarErro("detalheOrdem", error);
    throw new Error("Falha ao carregar a ordem.");
  }
  if (!ordem) notFound();

  const [historico, tecnicos] = await Promise.all([buscarHistorico({ ordem_id: id }), listarEquipeTecnica()]);
  const finalizada = ordemFinalizada(ordem.status);
  const transicoes = transicoesOrdemDisponiveis(ordem.status);
  const pendencias = ordem.status === "em_execucao" ? pendenciasConclusao(ordem) : [];

  return (
    <>
      <MensagemRetorno sucesso={sucesso} />
      <CabecalhoPagina
        acima={
          <Link href={`/chamados/${ordem.chamado_id}`} className={botao.link}>
            ← Chamado {codigoChamado(ordem.chamado_id)}
          </Link>
        }
        titulo={
          <span>
            <span className="font-mono">{codigoOrdem(ordem.id)}</span> · Manutenção{" "}
            {ROTULO_TIPO_MANUTENCAO[ordem.tipo].toLowerCase()}
          </span>
        }
        descricao={<span className="mt-2 inline-flex"><SeloStatusOrdem status={ordem.status} /></span>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className={cartao} aria-labelledby="titulo-resumo">
            <h2 id="titulo-resumo" className="mb-3 text-lg font-bold">Resumo</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-600">Chamado</dt>
                <dd className="flex flex-wrap items-center gap-2">
                  <Link href={`/chamados/${ordem.chamado_id}`} className={botao.link}>
                    {codigoChamado(ordem.chamado_id)} — {ordem.chamado?.titulo}
                  </Link>
                  {ordem.chamado ? <SeloStatusChamado status={ordem.chamado.status} /> : null}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-600">Equipamento</dt>
                <dd>
                  <Link href={`/equipamentos/${ordem.equipamento_id}`} className={botao.link}>
                    {ordem.equipamento?.codigo} — {ordem.equipamento?.nome}
                  </Link>
                </dd>
              </div>
              <div><dt className="font-semibold text-slate-600">Responsável</dt><dd>{ordem.responsavel?.nome}</dd></div>
              <div><dt className="font-semibold text-slate-600">Tipo</dt><dd>{ROTULO_TIPO_MANUTENCAO[ordem.tipo]} — {DESCRICAO_TIPO_MANUTENCAO[ordem.tipo]}</dd></div>
              <div><dt className="font-semibold text-slate-600">Criada em</dt><dd>{formatarDataHora(ordem.criado_em)}</dd></div>
              <div><dt className="font-semibold text-slate-600">Início da execução</dt><dd>{formatarDataHora(ordem.iniciada_em)}</dd></div>
              <div><dt className="font-semibold text-slate-600">Conclusão</dt><dd>{formatarDataHora(ordem.concluida_em)}</dd></div>
              <div><dt className="font-semibold text-slate-600">Tempo de execução</dt><dd>{formatarDuracao(ordem.iniciada_em, ordem.concluida_em)}</dd></div>
              <div><dt className="font-semibold text-slate-600">Resultado</dt><dd>{ordem.resultado ? ROTULO_RESULTADO_ORDEM[ordem.resultado] : "—"}</dd></div>
            </dl>
          </section>

          {finalizada ? (
            <section className={cartao} aria-labelledby="titulo-registro">
              <h2 id="titulo-registro" className="mb-3 text-lg font-bold">Registro da manutenção</h2>
              <Alerta tipo="info">
                Ordem {ROTULO_STATUS_ORDEM[ordem.status].toLowerCase()}: os dados ficam preservados e não podem mais ser alterados.
              </Alerta>
              <dl className="mt-4 space-y-3 text-sm">
                <div><dt className="font-semibold text-slate-600">Diagnóstico</dt><dd><Texto valor={ordem.diagnostico} /></dd></div>
                <div><dt className="font-semibold text-slate-600">Plano de ação</dt><dd><Texto valor={ordem.plano_acao} /></dd></div>
                <div><dt className="font-semibold text-slate-600">Atividades executadas</dt><dd><Texto valor={ordem.atividades_executadas} /></dd></div>
              </dl>
            </section>
          ) : (
            <>
              <section className={cartao} aria-labelledby="titulo-registro">
                <h2 id="titulo-registro" className="mb-3 text-lg font-bold">Registro da manutenção</h2>
                <FormAcao acao={atualizarOrdem.bind(null, ordem.id)} rotulo="Registro da manutenção">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {ordem.status === "planejada" ? (
                      <CampoSelecao
                        nome="tipo"
                        rotulo="Tipo de manutenção"
                        obrigatorio
                        valorInicial={ordem.tipo}
                        opcoes={TIPOS_MANUTENCAO.map((t) => ({ valor: t, rotulo: ROTULO_TIPO_MANUTENCAO[t] }))}
                      />
                    ) : (
                      <input type="hidden" name="tipo" value={ordem.tipo} />
                    )}
                    <CampoSelecao
                      nome="responsavel_id"
                      rotulo="Responsável"
                      obrigatorio
                      valorInicial={ordem.responsavel_id}
                      opcoes={tecnicos.map((t) => ({ valor: t.id, rotulo: t.nome }))}
                    />
                  </div>
                  <CampoAreaTexto nome="diagnostico" rotulo="Diagnóstico" linhas={3} valorInicial={ordem.diagnostico} />
                  <CampoAreaTexto nome="plano_acao" rotulo="Plano de ação" linhas={3} valorInicial={ordem.plano_acao} />
                  <CampoAreaTexto
                    nome="atividades_executadas"
                    rotulo="Atividades executadas"
                    linhas={4}
                    valorInicial={ordem.atividades_executadas}
                    ajuda="Descreva o que foi feito e os testes realizados (reteste)."
                  />
                  <CampoSelecao
                    nome="resultado"
                    rotulo="Resultado"
                    vazio="Ainda não definido"
                    valorInicial={ordem.resultado ?? ""}
                    opcoes={RESULTADOS_ORDEM.map((r) => ({ valor: r, rotulo: ROTULO_RESULTADO_ORDEM[r] }))}
                  />
                  <BotaoEnviar>Salvar registro</BotaoEnviar>
                </FormAcao>
              </section>

              <section className={cartao} aria-labelledby="titulo-status-ordem">
                <h2 id="titulo-status-ordem" className="mb-3 text-lg font-bold">Mudar status da ordem</h2>
                {pendencias.length > 0 ? (
                  <div className="mb-3">
                    <Alerta tipo="aviso">
                      Para concluir, salve antes o registro:
                      <ul className="ml-5 list-disc">{pendencias.map((p) => <li key={p}>{p}</li>)}</ul>
                    </Alerta>
                  </div>
                ) : null}
                <FormAcao acao={mudarStatusOrdem.bind(null, ordem.id)} rotulo="Mudar status da ordem">
                  <CampoSelecao
                    nome="para"
                    rotulo="Próximo passo"
                    obrigatorio
                    valorInicial={transicoes[0]?.para}
                    opcoes={transicoes.map((t) => ({ valor: t.para, rotulo: `${t.acao} (→ ${ROTULO_STATUS_ORDEM[t.para]})` }))}
                  />
                  <CampoAreaTexto nome="observacao" rotulo="Observação" linhas={2} ajuda="Obrigatória para cancelar (informe o motivo)." />
                  <BotaoEnviar>Confirmar mudança</BotaoEnviar>
                </FormAcao>
              </section>
            </>
          )}
        </div>

        <div className={cartao}>
          <Historico itens={historico} titulo="Histórico da ordem" />
        </div>
      </div>
    </>
  );
}
