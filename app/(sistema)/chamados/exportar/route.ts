import { exigirUsuario } from "@/lib/auth";
import { consultarChamados } from "@/lib/consultas";
import { csvDeChamados } from "@/lib/relatorios/csv";
import { filtrosChamadosSchema } from "@/lib/validacao/esquemas";
import { registrarErro } from "@/lib/erros";

/** Limite de segurança para a exportação (a tela mostra até 100). */
const LIMITE_EXPORTACAO = 5000;

/**
 * GET /chamados/exportar?status=...&prioridade=...&equipamento=...&de=...&ate=...
 * Exporta em CSV os chamados com os mesmos filtros da lista. As permissões
 * são as do usuário logado (RLS): o solicitante exporta só os próprios chamados.
 */
export async function GET(request: Request) {
  await exigirUsuario();
  const parametros = Object.fromEntries(new URL(request.url).searchParams);
  const filtros = filtrosChamadosSchema.parse(parametros);

  const { data, error } = await consultarChamados(filtros, LIMITE_EXPORTACAO);
  if (error) {
    registrarErro("exportarChamados", error);
    return new Response("Não foi possível gerar o arquivo. Tente novamente.", { status: 500 });
  }

  const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" }); // AAAA-MM-DD
  return new Response(csvDeChamados(data ?? []), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="chamados-${hoje}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
