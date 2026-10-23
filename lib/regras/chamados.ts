/**
 * Regras de negócio dos chamados (RN-CH).
 *
 * IMPORTANTE: estas regras também existem no banco (função
 * public.transicao_chamado_permitida e gatilho validar_alteracao_chamado).
 * Aqui elas servem para a interface mostrar só as ações possíveis e para as
 * Server Actions recusarem pedidos inválidos com mensagens claras.
 * Se mudar uma regra, mude as duas camadas e os testes.
 */
import { ROTULO_STATUS_CHAMADO } from "@/lib/dominio/rotulos";
import { ehEquipe } from "@/lib/regras/permissoes";
import type { PapelUsuario, StatusChamado } from "@/types/dominio";

export type QuemPode = "equipe" | "equipe_ou_solicitante";

export type TransicaoChamado = {
  de: StatusChamado;
  para: StatusChamado;
  quem: QuemPode;
  exigeObservacao: boolean;
  /** Texto da ação na interface. */
  acao: string;
};

/** RN-CH-01 — Transições de status permitidas. */
export const TRANSICOES_CHAMADO: readonly TransicaoChamado[] = [
  { de: "aberto", para: "em_triagem", quem: "equipe", exigeObservacao: false, acao: "Iniciar triagem" },
  { de: "em_triagem", para: "em_atendimento", quem: "equipe", exigeObservacao: false, acao: "Iniciar atendimento" },
  { de: "em_triagem", para: "encerrado", quem: "equipe", exigeObservacao: true, acao: "Encerrar sem atendimento" },
  { de: "em_atendimento", para: "aguardando", quem: "equipe", exigeObservacao: true, acao: "Colocar em espera" },
  { de: "em_atendimento", para: "resolvido", quem: "equipe", exigeObservacao: true, acao: "Marcar como resolvido" },
  { de: "aguardando", para: "em_atendimento", quem: "equipe", exigeObservacao: false, acao: "Retomar atendimento" },
  { de: "resolvido", para: "encerrado", quem: "equipe_ou_solicitante", exigeObservacao: false, acao: "Confirmar solução e encerrar" },
  { de: "resolvido", para: "em_atendimento", quem: "equipe_ou_solicitante", exigeObservacao: true, acao: "Reabrir chamado" },
];

/** Status em que o chamado ainda está em andamento. */
export const STATUS_CHAMADO_ATIVOS: readonly StatusChamado[] = [
  "aberto",
  "em_triagem",
  "em_atendimento",
  "aguardando",
];

/** RN-OM-02 — Status do chamado que permitem criar ordem de manutenção. */
export const STATUS_CHAMADO_ACEITA_ORDEM: readonly StatusChamado[] = [
  "em_triagem",
  "em_atendimento",
  "aguardando",
];

type Contexto = {
  papel: PapelUsuario;
  /** O usuário logado é o solicitante deste chamado? */
  ehSolicitante: boolean;
};

function podeExecutar(t: TransicaoChamado, ctx: Contexto) {
  if (ehEquipe(ctx.papel)) return true;
  return t.quem === "equipe_ou_solicitante" && ctx.ehSolicitante;
}

/** Transições que o usuário pode executar a partir do status atual. */
export function transicoesDisponiveis(status: StatusChamado, ctx: Contexto): TransicaoChamado[] {
  return TRANSICOES_CHAMADO.filter((t) => t.de === status && podeExecutar(t, ctx));
}

export function buscarTransicao(de: StatusChamado, para: StatusChamado) {
  return TRANSICOES_CHAMADO.find((t) => t.de === de && t.para === para);
}

export type ResultadoValidacao = { ok: true } | { ok: false; motivo: string };

/** Valida uma mudança de status antes de enviá-la ao banco. */
export function validarTransicaoChamado(entrada: {
  de: StatusChamado;
  para: StatusChamado;
  papel: PapelUsuario;
  ehSolicitante: boolean;
  observacao?: string | null;
  temTecnico: boolean;
  temOrdemAtiva: boolean;
}): ResultadoValidacao {
  const t = buscarTransicao(entrada.de, entrada.para);
  if (!t) {
    return {
      ok: false,
      motivo: `Transição de status inválida: ${ROTULO_STATUS_CHAMADO[entrada.de]} → ${ROTULO_STATUS_CHAMADO[entrada.para]}.`,
    };
  }
  if (!podeExecutar(t, entrada)) {
    return { ok: false, motivo: "Você não tem permissão para esta mudança de status." };
  }
  if (t.exigeObservacao && !entrada.observacao?.trim()) {
    return {
      ok: false,
      motivo: `Informe uma observação para mudar o status para ${ROTULO_STATUS_CHAMADO[entrada.para]}.`,
    };
  }
  if (entrada.para === "em_atendimento" && !entrada.temTecnico) {
    return { ok: false, motivo: "Atribua um técnico antes de iniciar o atendimento." };
  }
  if (entrada.para === "resolvido" && entrada.temOrdemAtiva) {
    return {
      ok: false,
      motivo: "Conclua ou cancele a ordem de manutenção ativa antes de resolver o chamado.",
    };
  }
  return { ok: true };
}

/** RN-CH-04 — Status que exigem técnico responsável atribuído. */
export const STATUS_CHAMADO_EXIGE_TECNICO: readonly StatusChamado[] = ["em_atendimento", "aguardando", "resolvido"];

export function exigeTecnico(status: StatusChamado) {
  return STATUS_CHAMADO_EXIGE_TECNICO.includes(status);
}

/** A triagem (prioridade, categoria, técnico) é feita pela equipe em chamados ainda em andamento. */
export function podeFazerTriagem(status: StatusChamado, papel: PapelUsuario) {
  return ehEquipe(papel) && STATUS_CHAMADO_ATIVOS.includes(status);
}

/** Comentários são aceitos enquanto o chamado não estiver encerrado. */
export function podeComentar(status: StatusChamado) {
  return status !== "encerrado";
}

/** RN-OM-02 — Equipe cria ordem em chamado em triagem/atendimento/aguardando, sem outra ordem ativa. */
export function podeCriarOrdem(status: StatusChamado, papel: PapelUsuario, temOrdemAtiva: boolean) {
  return ehEquipe(papel) && STATUS_CHAMADO_ACEITA_ORDEM.includes(status) && !temOrdemAtiva;
}
