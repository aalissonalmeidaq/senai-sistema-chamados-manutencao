import { describe, expect, it } from "vitest";
import {
  podeComentar,
  podeCriarOrdem,
  podeFazerTriagem,
  TRANSICOES_CHAMADO,
  transicoesDisponiveis,
  validarTransicaoChamado,
} from "@/lib/regras/chamados";

const base = {
  papel: "tecnico" as const,
  ehSolicitante: false,
  observacao: "",
  temTecnico: true,
  temOrdemAtiva: false,
};

describe("RN-CH-01 — transições de status do chamado", () => {
  it("contém exatamente as 8 transições documentadas", () => {
    const pares = TRANSICOES_CHAMADO.map((t) => `${t.de}>${t.para}`).sort();
    expect(pares).toEqual(
      [
        "aberto>em_triagem",
        "em_triagem>em_atendimento",
        "em_triagem>encerrado",
        "em_atendimento>aguardando",
        "em_atendimento>resolvido",
        "aguardando>em_atendimento",
        "resolvido>encerrado",
        "resolvido>em_atendimento",
      ].sort(),
    );
  });

  it("encerrado é estado final (sem saídas)", () => {
    expect(TRANSICOES_CHAMADO.filter((t) => t.de === "encerrado")).toHaveLength(0);
  });

  it.each([
    ["aberto", "resolvido"],
    ["aberto", "encerrado"],
    ["em_atendimento", "encerrado"],
    ["aguardando", "resolvido"],
    ["encerrado", "aberto"],
  ] as const)("rejeita %s → %s", (de, para) => {
    const r = validarTransicaoChamado({ ...base, de, para, observacao: "x" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toMatch(/Transição de status inválida/);
  });

  it("aceita aberto → em triagem pela equipe", () => {
    expect(validarTransicaoChamado({ ...base, de: "aberto", para: "em_triagem" })).toEqual({ ok: true });
  });

  it("exige observação para resolver", () => {
    const r = validarTransicaoChamado({ ...base, de: "em_atendimento", para: "resolvido", observacao: "   " });
    expect(r).toEqual({ ok: false, motivo: "Informe uma observação para mudar o status para Resolvido." });
  });

  it("exige técnico atribuído para iniciar atendimento", () => {
    const r = validarTransicaoChamado({ ...base, de: "em_triagem", para: "em_atendimento", temTecnico: false });
    expect(r).toEqual({ ok: false, motivo: "Atribua um técnico antes de iniciar o atendimento." });
  });

  it("não permite resolver com ordem de manutenção ativa", () => {
    const r = validarTransicaoChamado({
      ...base,
      de: "em_atendimento",
      para: "resolvido",
      observacao: "ok",
      temOrdemAtiva: true,
    });
    expect(r.ok).toBe(false);
  });

  it("solicitante só confirma ou reabre o PRÓPRIO chamado resolvido", () => {
    const solicitante = { ...base, papel: "solicitante" as const };
    expect(validarTransicaoChamado({ ...solicitante, ehSolicitante: true, de: "resolvido", para: "encerrado" }).ok).toBe(true);
    expect(validarTransicaoChamado({ ...solicitante, ehSolicitante: false, de: "resolvido", para: "encerrado" }).ok).toBe(false);
    expect(validarTransicaoChamado({ ...solicitante, ehSolicitante: true, de: "aberto", para: "em_triagem" }).ok).toBe(false);
  });

  it("reabrir exige observação", () => {
    const r = validarTransicaoChamado({
      ...base,
      papel: "solicitante",
      ehSolicitante: true,
      de: "resolvido",
      para: "em_atendimento",
    });
    expect(r.ok).toBe(false);
  });
});

describe("ações disponíveis por papel", () => {
  it("solicitante não vê ações em chamado aberto", () => {
    expect(transicoesDisponiveis("aberto", { papel: "solicitante", ehSolicitante: true })).toHaveLength(0);
  });

  it("solicitante vê confirmar/reabrir no próprio chamado resolvido", () => {
    const acoes = transicoesDisponiveis("resolvido", { papel: "solicitante", ehSolicitante: true }).map((t) => t.para);
    expect(acoes).toEqual(["encerrado", "em_atendimento"]);
  });

  it("técnico vê duas saídas na triagem", () => {
    const acoes = transicoesDisponiveis("em_triagem", { papel: "tecnico", ehSolicitante: false }).map((t) => t.para);
    expect(acoes).toEqual(["em_atendimento", "encerrado"]);
  });

  it("triagem só pela equipe e com chamado em andamento", () => {
    expect(podeFazerTriagem("em_triagem", "tecnico")).toBe(true);
    expect(podeFazerTriagem("em_triagem", "solicitante")).toBe(false);
    expect(podeFazerTriagem("encerrado", "administrador")).toBe(false);
  });

  it("comentários bloqueados apenas em chamado encerrado", () => {
    expect(podeComentar("resolvido")).toBe(true);
    expect(podeComentar("encerrado")).toBe(false);
  });

  it("RN-OM-02 — ordem só em triagem/atendimento/aguardando e sem outra ativa", () => {
    expect(podeCriarOrdem("em_triagem", "tecnico", false)).toBe(true);
    expect(podeCriarOrdem("aberto", "tecnico", false)).toBe(false);
    expect(podeCriarOrdem("em_atendimento", "tecnico", true)).toBe(false);
    expect(podeCriarOrdem("em_atendimento", "solicitante", false)).toBe(false);
  });
});
