/**
 * Regras de negócio das ordens de manutenção (RN-OM).
 * Espelhadas no banco: public.transicao_ordem_permitida e gatilho
 * validar_alteracao_ordem.
 */
import { ROTULO_STATUS_ORDEM } from "@/lib/dominio/rotulos";
import type { ResultadoValidacao } from "@/lib/regras/chamados";
import type { ResultadoOrdem, StatusOrdem } from "@/types/dominio";

export type TransicaoOrdem = {
  de: StatusOrdem;
  para: StatusOrdem;
  exigeObservacao: boolean;
  acao: string;
};

/** RN-OM-01 — Transições permitidas. Concluída e cancelada são finais. */
export const TRANSICOES_ORDEM: readonly TransicaoOrdem[] = [
  { de: "planejada", para: "em_execucao", exigeObservacao: false, acao: "Iniciar execução" },
  { de: "planejada", para: "cancelada", exigeObservacao: true, acao: "Cancelar ordem" },
  { de: "em_execucao", para: "concluida", exigeObservacao: false, acao: "Concluir ordem" },
  { de: "em_execucao", para: "cancelada", exigeObservacao: true, acao: "Cancelar ordem" },
];

export const STATUS_ORDEM_ATIVOS: readonly StatusOrdem[] = ["planejada", "em_execucao"];

export function ordemFinalizada(status: StatusOrdem) {
  return status === "concluida" || status === "cancelada";
}

export function transicoesOrdemDisponiveis(status: StatusOrdem): TransicaoOrdem[] {
  return TRANSICOES_ORDEM.filter((t) => t.de === status);
}

type DadosConclusao = {
  diagnostico: string;
  atividades_executadas: string;
  resultado: ResultadoOrdem | null;
};

/** RN-OM-03 — Para concluir: diagnóstico, atividades executadas e resultado. */
export function pendenciasConclusao(ordem: DadosConclusao): string[] {
  const pendencias: string[] = [];
  if (!ordem.diagnostico.trim()) pendencias.push("Preencha o diagnóstico antes de concluir a ordem.");
  if (!ordem.atividades_executadas.trim())
    pendencias.push("Registre as atividades executadas antes de concluir a ordem.");
  if (!ordem.resultado) pendencias.push("Informe o resultado antes de concluir a ordem.");
  return pendencias;
}

export function validarTransicaoOrdem(entrada: {
  de: StatusOrdem;
  para: StatusOrdem;
  observacao?: string | null;
  ordem: DadosConclusao;
}): ResultadoValidacao {
  const t = TRANSICOES_ORDEM.find((x) => x.de === entrada.de && x.para === entrada.para);
  if (!t) {
    return {
      ok: false,
      motivo: `Transição de status da ordem inválida: ${ROTULO_STATUS_ORDEM[entrada.de]} → ${ROTULO_STATUS_ORDEM[entrada.para]}.`,
    };
  }
  if (t.exigeObservacao && !entrada.observacao?.trim()) {
    return { ok: false, motivo: "Informe o motivo do cancelamento da ordem." };
  }
  if (entrada.para === "concluida") {
    const pendencias = pendenciasConclusao(entrada.ordem);
    if (pendencias.length > 0) return { ok: false, motivo: pendencias[0] };
  }
  return { ok: true };
}
