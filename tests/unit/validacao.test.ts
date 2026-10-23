import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  abrirChamadoSchema,
  atualizarOrdemSchema,
  cadastroSchema,
  comentarioSchema,
  equipamentoSchema,
  filtrosChamadosSchema,
} from "@/lib/validacao/esquemas";

const erros = (r: { success: boolean; error?: z.ZodError }) =>
  r.error ? (z.flattenError(r.error).fieldErrors as Record<string, string[]>) : {};

describe("equipamento", () => {
  const valido = {
    codigo: "inf-0010",
    nome: "Monitor da estação 10",
    categoria: "informatica",
    localizacao: "Laboratório 1",
    descricao: "",
    estado: "disponivel",
  };

  it("normaliza o código para maiúsculas", () => {
    const r = equipamentoSchema.safeParse(valido);
    expect(r.success && r.data.codigo).toBe("INF-0010");
  });

  it.each(["INF0010", "IN-0010", "INF-10", "INFO-0010", ""])("rejeita código fora do padrão: '%s'", (codigo) => {
    const r = equipamentoSchema.safeParse({ ...valido, codigo });
    expect(erros(r).codigo?.[0]).toMatch(/AAA-0000/);
  });

  it("exige nome, categoria, localização e estado", () => {
    const r = equipamentoSchema.safeParse({ codigo: "INF-0001" });
    expect(Object.keys(erros(r)).sort()).toEqual(["categoria", "estado", "localizacao", "nome"]);
  });
});

describe("abertura de chamado (RN-CH-02)", () => {
  const valido = {
    equipamento_id: "3",
    titulo: "Projetor sem imagem",
    descricao: "O projetor liga mas não mostra imagem.",
    categoria: "falha",
    prioridade: "media",
  };

  it("aceita dados válidos e converte o id do equipamento", () => {
    const r = abrirChamadoSchema.safeParse(valido);
    expect(r.success && r.data.equipamento_id).toBe(3);
  });

  it("rejeita descrição só com espaços (espaços não contam)", () => {
    const r = abrirChamadoSchema.safeParse({ ...valido, descricao: "              " });
    expect(erros(r).descricao).toEqual(["Descreva o problema com pelo menos 10 caracteres."]);
  });

  it("rejeita descrição curta mesmo com espaços nas pontas", () => {
    const r = abrirChamadoSchema.safeParse({ ...valido, descricao: "   curta   " });
    expect(r.success).toBe(false);
  });

  it("exige equipamento selecionado", () => {
    const r = abrirChamadoSchema.safeParse({ ...valido, equipamento_id: "" });
    expect(erros(r).equipamento_id).toEqual(["Selecione o equipamento."]);
  });

  it("rejeita prioridade inexistente", () => {
    expect(abrirChamadoSchema.safeParse({ ...valido, prioridade: "urgente" }).success).toBe(false);
  });
});

describe("cadastro", () => {
  it("exige senhas iguais e com 8+ caracteres", () => {
    const r = cadastroSchema.safeParse({ nome: "Ana", email: "ana@example.com", senha: "12345678", confirmacao: "x" });
    expect(erros(r).confirmacao).toEqual(["As senhas não conferem."]);
    const curta = cadastroSchema.safeParse({ nome: "Ana", email: "ana@example.com", senha: "123", confirmacao: "123" });
    expect(erros(curta).senha?.[0]).toMatch(/8 caracteres/);
  });
});

describe("comentário e ordem", () => {
  it("checkbox 'interno' vira booleano", () => {
    expect(comentarioSchema.parse({ texto: "Ok", interno: "on" }).interno).toBe(true);
    expect(comentarioSchema.parse({ texto: "Ok" }).interno).toBe(false);
  });

  it("resultado vazio da ordem vira null", () => {
    const r = atualizarOrdemSchema.parse({
      tipo: "corretiva",
      responsavel_id: "a0000000-0000-4000-8000-000000000002",
      resultado: "",
    });
    expect(r.resultado).toBeNull();
  });
});

describe("filtros da lista de chamados", () => {
  it("ignora valores inválidos vindos da URL", () => {
    expect(filtrosChamadosSchema.parse({ status: "xyz", prioridade: "alta", de: "31/12/2026" })).toEqual({
      status: undefined,
      prioridade: "alta",
      equipamento: undefined,
      de: undefined,
      ate: undefined,
    });
  });

  it("inverte período informado ao contrário", () => {
    const f = filtrosChamadosSchema.parse({ de: "2026-10-20", ate: "2026-10-01" });
    expect([f.de, f.ate]).toEqual(["2026-10-01", "2026-10-20"]);
  });
});
