import { describe, expect, it } from "vitest";
import {
  codigoChamado,
  codigoOrdem,
  formatarData,
  formatarDataHora,
  formatarDuracao,
  intervaloDoPeriodo,
} from "@/lib/formatacao";
import { MENSAGEM_ERRO_GENERICO, traduzirErro } from "@/lib/erros";

describe("formatação pt-BR", () => {
  it("formata data e hora no fuso de Brasília", () => {
    expect(formatarData("2026-10-05T13:00:00Z")).toBe("05/10/2026");
    expect(formatarDataHora("2026-10-05T13:30:00Z")).toBe("05/10/2026 às 10:30");
    expect(formatarData(null)).toBe("—");
  });

  it("gera códigos de exibição", () => {
    expect(codigoChamado(7)).toBe("CH-0007");
    expect(codigoOrdem(12)).toBe("OM-0012");
  });

  it("período 'até' inclui o dia inteiro", () => {
    const { inicio, fimExclusivo } = intervaloDoPeriodo("2026-10-01", "2026-10-20");
    expect(inicio).toBe("2026-10-01T00:00:00-03:00");
    expect(fimExclusivo).toBe("2026-10-21T03:00:00.000Z");
  });

  it("duração legível", () => {
    expect(formatarDuracao("2026-10-01T10:00:00Z", "2026-10-01T10:45:00Z")).toBe("45 min");
    expect(formatarDuracao("2026-10-01T10:00:00Z", "2026-10-02T14:00:00Z")).toBe("1 d 4 h");
    expect(formatarDuracao(null, "2026-10-01T10:00:00Z")).toBe("—");
  });
});

describe("tradução de erros do banco", () => {
  it("mostra a mensagem da regra de negócio (P0001)", () => {
    expect(traduzirErro({ code: "P0001", message: "Chamado encerrado não pode ser alterado." })).toBe(
      "Chamado encerrado não pode ser alterado.",
    );
  });

  it("traduz código duplicado de equipamento", () => {
    expect(
      traduzirErro({ code: "23505", message: 'duplicate key value violates unique constraint "equipamentos_codigo_unico"' }),
    ).toBe("Já existe um equipamento com este código.");
  });

  it("traduz falta de permissão", () => {
    expect(traduzirErro({ code: "42501", message: "permission denied" })).toBe("Você não tem permissão para esta operação.");
  });

  it("usa mensagem genérica para erros desconhecidos (sem expor detalhes técnicos)", () => {
    expect(traduzirErro({ code: "23514", message: 'violates check constraint "x"' })).toBe(MENSAGEM_ERRO_GENERICO);
    expect(traduzirErro(null)).toBe(MENSAGEM_ERRO_GENERICO);
  });
});
