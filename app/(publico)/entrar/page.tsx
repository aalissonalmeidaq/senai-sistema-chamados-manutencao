import type { Metadata } from "next";
import Link from "next/link";
import { FormAcao } from "@/components/formulario/FormAcao";
import { BotaoEnviar, CampoTexto } from "@/components/formulario/Campos";
import { Alerta } from "@/components/ui/Alerta";
import { botao } from "@/components/ui/estilos";
import { entrar } from "../acoes";

export const metadata: Metadata = { title: "Entrar" };

const AVISOS: Record<string, string> = {
  saiu: "Você saiu do sistema.",
  confirmado: "E-mail confirmado. Agora você já pode entrar.",
};

export default async function PaginaEntrar({ searchParams }: PageProps<"/entrar">) {
  const { proximo, aviso } = await searchParams;
  const textoAviso = typeof aviso === "string" ? AVISOS[aviso] : undefined;

  return (
    <>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Entrar</h1>
      {textoAviso ? (
        <div className="mb-4">
          <Alerta tipo="info">{textoAviso}</Alerta>
        </div>
      ) : null}
      <FormAcao acao={entrar} rotulo="Entrar no sistema">
        <input type="hidden" name="proximo" value={typeof proximo === "string" ? proximo : ""} />
        <CampoTexto nome="email" rotulo="E-mail" tipo="email" autoComplete="email" obrigatorio />
        <CampoTexto nome="senha" rotulo="Senha" tipo="password" autoComplete="current-password" obrigatorio />
        <BotaoEnviar pendente="Entrando...">Entrar</BotaoEnviar>
      </FormAcao>
      <p className="mt-6 text-sm text-slate-700">
        Ainda não tem conta?{" "}
        <Link href="/cadastrar" className={botao.link}>
          Cadastre-se
        </Link>
      </p>
    </>
  );
}
