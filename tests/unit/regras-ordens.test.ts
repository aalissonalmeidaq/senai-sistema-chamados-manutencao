import { describe, expect, it } from "vitest";
import {
  ordemFinalizada,
  pendenciasConclusao,
  TRANSICOES_ORDEM,
  validarTransicaoOrdem,
} from "@/lib/regras/ordens";

const completa = { diagnostico: "Causa encontrada", atividades_executadas: "Peça trocada", resultado: "resolvido" as const };
const vazia = { diagnostico: "", atividades_executadas: "", resultado: null };

describe("RN-OM-01 — transições da ordem de manutenção", () => {
  it("concluída e cancelada são finais", () => {
    expect(ordemFinalizada("concluida")).toBe(true);
    expect(ordemFinalizada("cancelada")).toBe(true);
    expect(ordemFinalizada("em_execucao")).toBe(false);
    expect(TRANSICOES_ORDEM.filter((t) => ordemFinalizada(t.de))).toHaveLength(0);
  });

  it("em execução → concluída quando o registro está completo", () => {
    expect(validarTransicaoOrdem({ de: "em_execucao", para: "concluida", ordem: completa })).toEqual({ ok: true });
  });

  it("RN-OM-03 — concluir exige diagnóstico, atividades e resultado", () => {
    expect(pendenciasConclusao(vazia)).toHaveLength(3);
    expect(pendenciasConclusao({ ...completa, atividades_executadas: "   " })).toEqual([
      "Registre as atividades executadas antes de concluir a ordem.",
    ]);
    expect(validarTransicaoOrdem({ de: "em_execucao", para: "concluida", ordem: vazia }).ok).toBe(false);
  });

  it("cancelar exige motivo", () => {
    expect(validarTransicaoOrdem({ de: "planejada", para: "cancelada", ordem: vazia }).ok).toBe(false);
    expect(validarTransicaoOrdem({ de: "planejada", para: "cancelada", observacao: "Duplicada", ordem: vazia })).toEqual({ ok: true });
  });
});
