import type { Metadata } from "next";
import Link from "next/link";
import { FormAcao } from "@/components/formulario/FormAcao";
import { BotaoEnviar, CampoTexto } from "@/components/formulario/Campos";
import { botao } from "@/components/ui/estilos";
import { cadastrar } from "../acoes";

export const metadata: Metadata = { title: "Cadastrar" };

export default function PaginaCadastrar() {
  return (
    <>
      <h1 className="mb-1 text-xl font-bold text-slate-900">Criar conta</h1>
      <p className="mb-4 text-sm text-slate-600">
        Toda conta nova começa com o papel <strong>Solicitante</strong>. Um administrador pode alterar o papel depois.
      </p>
      <FormAcao acao={cadastrar} rotulo="Criar conta">
        <CampoTexto nome="nome" rotulo="Nome" autoComplete="name" obrigatorio />
        <CampoTexto nome="email" rotulo="E-mail" tipo="email" autoComplete="email" obrigatorio />
        <CampoTexto
          nome="senha"
          rotulo="Senha"
          tipo="password"
          autoComplete="new-password"
          ajuda="Mínimo de 8 caracteres. Use uma senha fictícia, só para a aula."
          obrigatorio
        />
        <CampoTexto nome="confirmacao" rotulo="Confirme a senha" tipo="password" autoComplete="new-password" obrigatorio />
        <BotaoEnviar pendente="Cadastrando...">Cadastrar</BotaoEnviar>
      </FormAcao>
      <p className="mt-6 text-sm text-slate-700">
        Já tem conta?{" "}
        <Link href="/entrar" className={botao.link}>
          Entrar
        </Link>
      </p>
    </>
  );
}
