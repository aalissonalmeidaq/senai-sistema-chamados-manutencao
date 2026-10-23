"use client";

import { createContext, useActionState, useContext, type ReactNode } from "react";
import { Alerta } from "@/components/ui/Alerta";
import { ESTADO_INICIAL, type EstadoFormulario } from "@/lib/formulario";

type AcaoFormulario = (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;

type ContextoFormulario = {
  estado: EstadoFormulario;
  pendente: boolean;
};

const Contexto = createContext<ContextoFormulario>({ estado: ESTADO_INICIAL, pendente: false });

export function useFormulario() {
  return useContext(Contexto);
}

/**
 * Formulário ligado a uma Server Action com useActionState.
 * Mostra a mensagem de sucesso/erro devolvida pela ação e disponibiliza
 * erros por campo e valores enviados aos componentes de campo.
 */
export function FormAcao({
  acao,
  children,
  className,
  rotulo,
}: {
  acao: AcaoFormulario;
  children: ReactNode;
  className?: string;
  /** Nome acessível do formulário. */
  rotulo?: string;
}) {
  const [estado, formAction, pendente] = useActionState(acao, ESTADO_INICIAL);

  return (
    <Contexto.Provider value={{ estado, pendente }}>
      <form action={formAction} className={className ?? "space-y-4"} aria-label={rotulo} noValidate>
        {estado.mensagem ? (
          <Alerta tipo={estado.ok ? "sucesso" : "erro"}>{estado.mensagem}</Alerta>
        ) : null}
        {children}
      </form>
    </Contexto.Provider>
  );
}
