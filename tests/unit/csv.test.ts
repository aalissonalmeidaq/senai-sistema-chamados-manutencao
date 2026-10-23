import { describe, expect, it } from "vitest";
import { CABECALHO_CHAMADOS, csvDeChamados, escaparCelula, gerarCsv } from "@/lib/relatorios/csv";

describe("CSV (OC-03 — exportação de chamados)", () => {
  it("começa com BOM UTF-8 e usa ';' e CRLF", () => {
    const csv = gerarCsv(["A", "B"], [["1", "2"]]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toBe("﻿A;B\r\n1;2\r\n");
  });

  it("protege separador, aspas e quebras de linha", () => {
    expect(escaparCelula("texto; com separador")).toBe('"texto; com separador"');
    expect(escaparCelula('diz "olá"')).toBe('"diz ""olá"""');
    expect(escaparCelula("linha 1\nlinha 2")).toBe('"linha 1\nlinha 2"');
  });

  it("neutraliza conteúdo que a planilha executaria como fórmula", () => {
    expect(escaparCelula("=SOMA(A1:A2)")).toBe("'=SOMA(A1:A2)");
    expect(escaparCelula("@usuario")).toBe("'@usuario");
  });

  it("gera uma linha por chamado com rótulos e datas em pt-BR", () => {
    const csv = csvDeChamados([
      {
        id: 7,
        titulo: "Projetor sem imagem",
        status: "em_atendimento",
        prioridade: "critica",
        categoria: "falha",
        criado_em: "2026-10-05T13:30:00Z",
        resolvido_em: null,
        encerrado_em: null,
        equipamento: { codigo: "INF-0002", nome: "Projetor" },
        solicitante: { nome: "Eduardo Lima" },
        tecnico: null,
      },
    ]);
    const [cabecalho, linha] = csv.replace("﻿", "").trim().split("\r\n");
    expect(cabecalho).toBe(CABECALHO_CHAMADOS.join(";"));
    expect(linha).toBe(
      "CH-0007;Projetor sem imagem;INF-0002 — Projetor;Em atendimento;Crítica;Falha;Eduardo Lima;;05/10/2026 às 10:30;;",
    );
  });
});
