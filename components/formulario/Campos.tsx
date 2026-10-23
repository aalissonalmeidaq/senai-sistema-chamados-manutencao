"use client";

import { useId, type ReactNode } from "react";
import { useFormulario } from "@/components/formulario/FormAcao";
import { botao, campo } from "@/components/ui/estilos";

type Opcao = { valor: string; rotulo: string };

type PropsBase = {
  nome: string;
  rotulo: string;
  ajuda?: ReactNode;
  obrigatorio?: boolean;
  valorInicial?: string;
};

/** Estrutura comum: rótulo, controle, texto de ajuda e mensagem de erro. */
function useCampo(nome: string, valorInicial?: string) {
  const id = useId();
  const { estado } = useFormulario();
  return { id, erro: estado.erros?.[nome]?.[0], valor: valorInicial };
}

function Moldura({
  id,
  rotulo,
  obrigatorio,
  ajuda,
  erro,
  children,
}: {
  id: string;
  rotulo: string;
  obrigatorio?: boolean;
  ajuda?: ReactNode;
  erro?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-slate-800">
        {rotulo}
        {/* O asterisco é só visual; leitores de tela anunciam "obrigatório" pelo atributo required. */}
        {obrigatorio ? (
          <span aria-hidden="true" className="text-red-700">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      {ajuda ? (
        <p id={`${id}-ajuda`} className="mt-1 text-xs text-slate-600">
          {ajuda}
        </p>
      ) : null}
      {erro ? (
        <p id={`${id}-erro`} className="mt-1 text-sm font-medium text-red-700">
          {erro}
        </p>
      ) : null}
    </div>
  );
}

function descritoPor(id: string, ajuda?: ReactNode, erro?: string) {
  return [ajuda ? `${id}-ajuda` : null, erro ? `${id}-erro` : null].filter(Boolean).join(" ") || undefined;
}

export function CampoTexto({
  tipo = "text",
  autoComplete,
  placeholder,
  ...props
}: PropsBase & { tipo?: "text" | "email" | "password" | "date"; autoComplete?: string; placeholder?: string }) {
  const { id, erro, valor } = useCampo(props.nome, props.valorInicial);
  return (
    <Moldura id={id} {...props} erro={erro}>
      <input
        id={id}
        name={props.nome}
        type={tipo}
        defaultValue={tipo === "password" ? undefined : valor}
        required={props.obrigatorio}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descritoPor(id, props.ajuda, erro)}
        className={campo}
      />
    </Moldura>
  );
}

export function CampoAreaTexto({ linhas = 4, ...props }: PropsBase & { linhas?: number }) {
  const { id, erro, valor } = useCampo(props.nome, props.valorInicial);
  return (
    <Moldura id={id} {...props} erro={erro}>
      <textarea
        id={id}
        name={props.nome}
        defaultValue={valor}
        rows={linhas}
        required={props.obrigatorio}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descritoPor(id, props.ajuda, erro)}
        className={campo}
      />
    </Moldura>
  );
}

export function CampoSelecao({
  opcoes,
  vazio,
  ...props
}: PropsBase & { opcoes: Opcao[]; /** Texto da opção vazia (sem seleção). */ vazio?: string }) {
  const { id, erro, valor } = useCampo(props.nome, props.valorInicial);
  return (
    <Moldura id={id} {...props} erro={erro}>
      <select
        id={id}
        name={props.nome}
        defaultValue={valor ?? ""}
        required={props.obrigatorio}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descritoPor(id, props.ajuda, erro)}
        className={campo}
      >
        {vazio !== undefined ? <option value="">{vazio}</option> : null}
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
    </Moldura>
  );
}

export function CampoCaixa({ nome, rotulo, ajuda, marcado }: { nome: string; rotulo: string; ajuda?: string; marcado?: boolean }) {
  const id = useId();
  return (
    <div className="flex items-start gap-2">
      <input
        id={id}
        name={nome}
        type="checkbox"
        defaultChecked={marcado}
        className="mt-1 h-4 w-4 rounded border-slate-400"
        aria-describedby={ajuda ? `${id}-ajuda` : undefined}
      />
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-slate-800">
          {rotulo}
        </label>
        {ajuda ? (
          <p id={`${id}-ajuda`} className="text-xs text-slate-600">
            {ajuda}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function BotaoEnviar({
  children,
  pendente: textoPendente = "Salvando...",
  variante = "primario",
}: {
  children: ReactNode;
  pendente?: string;
  variante?: keyof typeof botao;
}) {
  const { pendente } = useFormulario();
  return (
    <button type="submit" disabled={pendente} aria-disabled={pendente} className={botao[variante]}>
      {pendente ? textoPendente : children}
    </button>
  );
}
