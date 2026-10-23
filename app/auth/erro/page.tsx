import Link from "next/link";
import { Alerta } from "@/components/ui/Alerta";
import { botao } from "@/components/ui/estilos";

export default async function ErroAutenticacao({ searchParams }: PageProps<"/auth/erro">) {
  const { motivo } = await searchParams;
  return (
    <main id="conteudo" className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-4 text-xl font-bold">Não foi possível confirmar o acesso</h1>
      <Alerta tipo="erro">
        {typeof motivo === "string" ? motivo : "O link é inválido ou expirou."}
      </Alerta>
      <p className="mt-4 text-sm">
        Links de confirmação valem por pouco tempo e só podem ser usados uma vez. Tente{" "}
        <Link className={botao.link} href="/entrar">
          entrar
        </Link>{" "}
        ou faça um novo cadastro.
      </p>
    </main>
  );
}
