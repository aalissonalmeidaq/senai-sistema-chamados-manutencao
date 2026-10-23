"use client";

import {
  createContext,
  startTransition,
  useActionState,
  useContext,
  useEffect,
  useRef,
  type FormEvent,
  type ReactNode,
} from "react";
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
 *
 * O envio é feito por onSubmit + startTransition (e não pela prop `action`)
 * para que o React NÃO limpe os campos quando a validação falha: o usuário
 * corrige só o que foi apontado. Após um envio bem-sucedido, o formulário
 * volta aos valores iniciais.
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
  const [estado, executar, pendente] = useActionState(acao, ESTADO_INICIAL);
  const formulario = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) formulario.current?.reset();
  }, [estado]);

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    startTransition(() => executar(dados));
  }

  return (
    <Contexto.Provider value={{ estado, pendente }}>
      {/* `action` garante envio por POST mesmo antes do JavaScript carregar
          (nunca por GET, que exporia senhas na URL); depois de carregado, onSubmit assume. */}
      <form
        ref={formulario}
        action={executar}
        onSubmit={enviar}
        className={className ?? "space-y-4"}
        aria-label={rotulo}
        noValidate
      >
        {estado.mensagem ? (
          <Alerta tipo={estado.ok ? "sucesso" : "erro"}>{estado.mensagem}</Alerta>
        ) : null}
        {children}
      </form>
    </Contexto.Provider>
  );
}
