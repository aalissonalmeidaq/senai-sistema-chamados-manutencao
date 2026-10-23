/**
 * Traduz erros do Supabase/PostgreSQL em mensagens para o usuário.
 *
 * - P0001: regra de negócio levantada pelos gatilhos (mensagem já em pt-BR)
 * - 23505: valor duplicado (restrição UNIQUE)
 * - 23503: chave estrangeira (registro relacionado)
 * - 23514: restrição CHECK
 * - 42501: sem permissão (GRANT/RLS)
 */
type ErroBanco = { code?: string; message?: string; details?: string | null } | null | undefined;

const MENSAGENS_RESTRICAO: Record<string, string> = {
  equipamentos_codigo_unico: "Já existe um equipamento com este código.",
  equipamentos_codigo_formato: "Use o formato AAA-0000 no código, por exemplo INF-0001.",
  ordens_uma_ativa_por_chamado: "Este chamado já possui uma ordem de manutenção ativa.",
};

export const MENSAGEM_ERRO_GENERICO = "Não foi possível concluir a operação. Tente novamente.";

export function traduzirErro(erro: ErroBanco): string {
  if (!erro) return MENSAGEM_ERRO_GENERICO;
  const texto = `${erro.message ?? ""} ${erro.details ?? ""}`;

  for (const [restricao, mensagem] of Object.entries(MENSAGENS_RESTRICAO)) {
    if (texto.includes(restricao)) return mensagem;
  }

  switch (erro.code) {
    case "P0001":
      return erro.message ?? MENSAGEM_ERRO_GENERICO;
    case "23505":
      return "Já existe um registro com estes dados.";
    case "23503":
      return "Operação não permitida: existem registros relacionados (por exemplo, chamados deste equipamento).";
    case "42501":
      return "Você não tem permissão para esta operação.";
    default:
      return MENSAGEM_ERRO_GENERICO;
  }
}

/** Registra o erro técnico no terminal do servidor (útil para diagnóstico). */
export function registrarErro(contexto: string, erro: unknown) {
  console.error(`[${contexto}]`, erro);
}
