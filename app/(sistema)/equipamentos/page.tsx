import type { Metadata } from "next";
import Link from "next/link";
import { exigirUsuario } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ehEquipe } from "@/lib/regras/permissoes";
import {
  CATEGORIAS_EQUIPAMENTO,
  ESTADOS_EQUIPAMENTO,
  ROTULO_CATEGORIA_EQUIPAMENTO,
  ROTULO_ESTADO_EQUIPAMENTO,
} from "@/lib/dominio/rotulos";
import { registrarErro } from "@/lib/erros";
import { CabecalhoPagina } from "@/components/ui/CabecalhoPagina";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { MensagemRetorno } from "@/components/MensagemRetorno";
import { SeloEstadoEquipamento } from "@/components/ui/Selo";
import { botao, campo, tabela } from "@/components/ui/estilos";
import type { CategoriaEquipamento, EstadoEquipamento } from "@/types/dominio";

export const metadata: Metadata = { title: "Equipamentos" };

export default async function ListaEquipamentos({ searchParams }: PageProps<"/equipamentos">) {
  const usuario = await exigirUsuario();
  const params = await searchParams;
  const busca = typeof params.q === "string" ? params.q.trim() : "";
  const categoria = CATEGORIAS_EQUIPAMENTO.find((c) => c === params.categoria) as CategoriaEquipamento | undefined;
  const estado = ESTADOS_EQUIPAMENTO.find((e) => e === params.estado) as EstadoEquipamento | undefined;

  const supabase = await createClient();
  let consulta = supabase
    .from("equipamentos")
    .select("id, codigo, nome, categoria, localizacao, estado")
    .order("codigo");
  if (busca) {
    // Remove caracteres usados pela sintaxe de filtro do PostgREST.
    const termo = busca.replace(/[%,()*]/g, " ");
    consulta = consulta.or(`codigo.ilike.%${termo}%,nome.ilike.%${termo}%,localizacao.ilike.%${termo}%`);
  }
  if (categoria) consulta = consulta.eq("categoria", categoria);
  if (estado) consulta = consulta.eq("estado", estado);

  const { data: equipamentos, error } = await consulta;
  if (error) {
    registrarErro("listaEquipamentos", error);
    throw new Error("Falha ao carregar equipamentos.");
  }
  const filtrando = Boolean(busca || categoria || estado);

  return (
    <>
      <MensagemRetorno sucesso={params.sucesso} />
      <CabecalhoPagina
        titulo="Equipamentos"
        descricao="Equipamentos fictícios atendidos pela manutenção."
        acoes={
          ehEquipe(usuario.papel) ? (
            <Link href="/equipamentos/novo" className={botao.primario}>
              Cadastrar equipamento
            </Link>
          ) : null
        }
      />

      <form role="search" aria-label="Buscar equipamentos" className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor="q" className="mb-1 block text-sm font-semibold">Buscar</label>
          <input id="q" name="q" defaultValue={busca} placeholder="Código, nome ou localização" className={campo} />
        </div>
        <div>
          <label htmlFor="categoria" className="mb-1 block text-sm font-semibold">Categoria</label>
          <select id="categoria" name="categoria" defaultValue={categoria ?? ""} className={campo}>
            <option value="">Todas</option>
            {CATEGORIAS_EQUIPAMENTO.map((c) => (
              <option key={c} value={c}>{ROTULO_CATEGORIA_EQUIPAMENTO[c]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="estado" className="mb-1 block text-sm font-semibold">Estado</label>
          <select id="estado" name="estado" defaultValue={estado ?? ""} className={campo}>
            <option value="">Todos</option>
            {ESTADOS_EQUIPAMENTO.map((e) => (
              <option key={e} value={e}>{ROTULO_ESTADO_EQUIPAMENTO[e]}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 sm:col-span-4">
          <button type="submit" className={botao.primario}>Filtrar</button>
          {filtrando ? <Link href="/equipamentos" className={botao.secundario}>Limpar filtros</Link> : null}
        </div>
      </form>

      <p className="mb-2 text-sm text-slate-700" aria-live="polite">
        {equipamentos.length} equipamento(s) encontrado(s).
      </p>

      {equipamentos.length === 0 ? (
        <EstadoVazio titulo={filtrando ? "Nenhum equipamento corresponde aos filtros." : "Nenhum equipamento cadastrado."}>
          {filtrando ? "Altere ou limpe os filtros." : null}
        </EstadoVazio>
      ) : (
        <div className={tabela.envoltorio}>
          <table className={tabela.tabela}>
            <caption className="sr-only">Lista de equipamentos</caption>
            <thead>
              <tr>
                <th scope="col" className={tabela.cabecalho}>Código</th>
                <th scope="col" className={tabela.cabecalho}>Nome</th>
                <th scope="col" className={tabela.cabecalho}>Categoria</th>
                <th scope="col" className={tabela.cabecalho}>Localização</th>
                <th scope="col" className={tabela.cabecalho}>Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipamentos.map((e) => (
                <tr key={e.id}>
                  <td className={`${tabela.celula} font-mono`}>
                    <Link href={`/equipamentos/${e.id}`} className={botao.link}>{e.codigo}</Link>
                  </td>
                  <td className={tabela.celula}>{e.nome}</td>
                  <td className={tabela.celula}>{ROTULO_CATEGORIA_EQUIPAMENTO[e.categoria]}</td>
                  <td className={tabela.celula}>{e.localizacao}</td>
                  <td className={tabela.celula}><SeloEstadoEquipamento estado={e.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
