import { z } from "zod";

/** Estado devolvido pelas Server Actions aos formulários (useActionState). */
export type EstadoFormulario = {
  ok: boolean;
  mensagem?: string;
  /** Erros por campo (nome do campo → mensagens). */
  erros?: Record<string, string[] | undefined>;
};

export const ESTADO_INICIAL: EstadoFormulario = { ok: false };

/** Lê os campos de texto do FormData (ignora arquivos). */
export function lerFormulario(formData: FormData): Record<string, string> {
  const valores: Record<string, string> = {};
  for (const [chave, valor] of formData.entries()) {
    if (typeof valor === "string" && !chave.startsWith("$ACTION")) valores[chave] = valor;
  }
  return valores;
}

export function falhaValidacao(erro: z.ZodError): EstadoFormulario {
  return {
    ok: false,
    mensagem: "Corrija os campos destacados.",
    erros: z.flattenError(erro).fieldErrors as Record<string, string[]>,
  };
}

export function falha(mensagem: string): EstadoFormulario {
  return { ok: false, mensagem };
}

export function sucesso(mensagem: string): EstadoFormulario {
  return { ok: true, mensagem };
}
