/**
 * Validação dos formulários (camada de aplicação), com Zod.
 * O banco repete as regras essenciais (restrições CHECK e gatilhos),
 * mas aqui as mensagens são específicas por campo.
 */
import { z } from "zod";
import {
  CATEGORIAS_CHAMADO,
  CATEGORIAS_EQUIPAMENTO,
  ESTADOS_EQUIPAMENTO,
  PAPEIS,
  PRIORIDADES,
  RESULTADOS_ORDEM,
  STATUS_CHAMADO,
  STATUS_ORDEM,
  TIPOS_MANUTENCAO,
} from "@/lib/dominio/rotulos";

const textoOpcional = (max: number, nome: string) =>
  z.string().trim().max(max, `${nome}: use no máximo ${max} caracteres.`).default("");

const uuidOuVazio = (mensagem: string) =>
  z.union([z.uuid(mensagem), z.literal("")]).transform((v) => (v === "" ? null : v));

const idNumerico = (mensagem: string) => z.coerce.number({ error: mensagem }).int(mensagem).positive(mensagem);

// ---------------------------------------------------------------------------
// Autenticação
// ---------------------------------------------------------------------------
export const entradaSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe a senha."),
});

export const cadastroSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe seu nome (mínimo 2 caracteres).").max(120, "Nome muito longo."),
    email: z.email("Informe um e-mail válido."),
    senha: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
    confirmacao: z.string(),
  })
  .refine((d) => d.senha === d.confirmacao, {
    path: ["confirmacao"],
    message: "As senhas não conferem.",
  });

// ---------------------------------------------------------------------------
// Equipamentos (RN-EQ-01 a RN-EQ-03)
// ---------------------------------------------------------------------------
export const equipamentoSchema = z.object({
  codigo: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}-\d{4}$/, "Use o formato AAA-0000, por exemplo INF-0001."),
  nome: z.string().trim().min(3, "Informe o nome (mínimo 3 caracteres).").max(120, "Nome: no máximo 120 caracteres."),
  categoria: z.enum(CATEGORIAS_EQUIPAMENTO, { error: "Selecione a categoria." }),
  localizacao: z
    .string()
    .trim()
    .min(2, "Informe a localização.")
    .max(120, "Localização: no máximo 120 caracteres."),
  descricao: textoOpcional(1000, "Descrição"),
  estado: z.enum(ESTADOS_EQUIPAMENTO, { error: "Selecione o estado operacional." }),
});

export type DadosEquipamento = z.infer<typeof equipamentoSchema>;

// ---------------------------------------------------------------------------
// Chamados
// ---------------------------------------------------------------------------
/** RN-CH-02 — Abertura de chamado. */
export const abrirChamadoSchema = z.object({
  equipamento_id: idNumerico("Selecione o equipamento."),
  titulo: z
    .string()
    .trim()
    .min(5, "Informe um título com pelo menos 5 caracteres.")
    .max(120, "Título: no máximo 120 caracteres."),
  descricao: z
    .string()
    .trim()
    .min(10, "Descreva o problema com pelo menos 10 caracteres.")
    .max(2000, "Descrição: no máximo 2000 caracteres."),
  categoria: z.enum(CATEGORIAS_CHAMADO, { error: "Selecione a categoria." }),
  prioridade: z.enum(PRIORIDADES, { error: "Selecione a prioridade." }),
});

export const triagemSchema = z.object({
  prioridade: z.enum(PRIORIDADES, { error: "Selecione a prioridade." }),
  categoria: z.enum(CATEGORIAS_CHAMADO, { error: "Selecione a categoria." }),
  tecnico_id: uuidOuVazio("Selecione um técnico válido."),
});

export const mudarStatusChamadoSchema = z.object({
  para: z.enum(STATUS_CHAMADO, { error: "Selecione o novo status." }),
  observacao: textoOpcional(1000, "Observação"),
});

export const comentarioSchema = z.object({
  texto: z
    .string()
    .trim()
    .min(1, "Escreva o comentário.")
    .max(2000, "Comentário: no máximo 2000 caracteres."),
  interno: z
    .union([z.literal("on"), z.literal("")])
    .optional()
    .transform((v) => v === "on"),
});

/** Filtros da lista de chamados (vêm da URL). Valores inválidos são ignorados. */
export const filtrosChamadosSchema = z
  .object({
    status: z.enum(STATUS_CHAMADO).optional().catch(undefined),
    prioridade: z.enum(PRIORIDADES).optional().catch(undefined),
    equipamento: z.coerce.number().int().positive().optional().catch(undefined),
    de: z.iso.date().optional().catch(undefined),
    ate: z.iso.date().optional().catch(undefined),
  })
  .transform((f) => (f.de && f.ate && f.de > f.ate ? { ...f, de: f.ate, ate: f.de } : f));

export type FiltrosChamados = z.infer<typeof filtrosChamadosSchema>;

// ---------------------------------------------------------------------------
// Ordens de manutenção
// ---------------------------------------------------------------------------
export const criarOrdemSchema = z.object({
  chamado_id: idNumerico("Chamado inválido."),
  tipo: z.enum(TIPOS_MANUTENCAO, { error: "Selecione o tipo de manutenção." }),
  responsavel_id: z.uuid("Selecione o técnico responsável."),
  diagnostico: textoOpcional(2000, "Diagnóstico"),
  plano_acao: textoOpcional(2000, "Plano de ação"),
});

export const atualizarOrdemSchema = z.object({
  tipo: z.enum(TIPOS_MANUTENCAO, { error: "Selecione o tipo de manutenção." }),
  responsavel_id: z.uuid("Selecione o técnico responsável."),
  diagnostico: textoOpcional(2000, "Diagnóstico"),
  plano_acao: textoOpcional(2000, "Plano de ação"),
  atividades_executadas: textoOpcional(4000, "Atividades executadas"),
  resultado: z
    .union([z.enum(RESULTADOS_ORDEM), z.literal("")])
    .transform((v) => (v === "" ? null : v)),
});

export const mudarStatusOrdemSchema = z.object({
  para: z.enum(STATUS_ORDEM, { error: "Selecione o novo status." }),
  observacao: textoOpcional(1000, "Observação"),
});

// ---------------------------------------------------------------------------
// Usuários
// ---------------------------------------------------------------------------
export const definirPapelSchema = z.object({
  usuario_id: z.uuid("Usuário inválido."),
  papel: z.enum(PAPEIS, { error: "Selecione o papel." }),
});
