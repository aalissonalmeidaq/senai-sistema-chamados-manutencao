import type { Metadata } from "next";
import Link from "next/link";
import { Alerta } from "@/components/ui/Alerta";
import { botao } from "@/components/ui/estilos";

export const metadata: Metadata = { title: "Confirme seu e-mail" };

export default async function CadastroEnviado({ searchParams }: PageProps<"/cadastro-enviado">) {
  const { email } = await searchParams;
  return (
    <>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Confirme seu e-mail</h1>
      <Alerta tipo="sucesso">
        Cadastro recebido{typeof email === "string" ? ` para ${email}` : ""}. Enviamos um link de confirmação.
      </Alerta>
      <div className="mt-4 space-y-2 text-sm text-slate-700">
        <p>
          <strong>No ambiente local</strong>, nenhum e-mail sai do computador. Abra a caixa de e-mail local (Mailpit),
          normalmente em{" "}
          <a className={botao.link} href="http://127.0.0.1:55324" target="_blank" rel="noreferrer">
            http://127.0.0.1:55324
          </a>
          , abra a mensagem &quot;Confirme seu cadastro&quot; e clique em <em>Confirmar meu e-mail</em>.
        </p>
        <p>
          Depois disso, <Link href="/entrar" className={botao.link}>entre no sistema</Link>.
        </p>
      </div>
    </>
  );
}
