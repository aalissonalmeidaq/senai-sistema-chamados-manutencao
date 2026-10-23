import type { Metadata } from "next";
import Link from "next/link";
import { exigirUsuario } from "@/lib/auth";
import { consultarChamados, listarEquipamentosParaSelecao } from "@/lib/consultas";
import { ehEquipe } from "@/lib/regras/permissoes";
import { filtrosChamadosSchema } from "@/lib/validacao/esquemas";
import { PRIORIDADES, ROTULO_PRIORIDADE, ROTULO_STATUS_CHAMADO, STATUS_CHAMADO } from "@/lib/dominio/rotulos";
import { codigoChamado, formatarDataHora } from "@/lib/formatacao";
import { registrarErro } from "@/lib/erros";
import { CabecalhoPagina } from "@/components/ui/CabecalhoPagina";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { MensagemRetorno } from "@/components/MensagemRetorno";
import { SeloPrioridade, SeloStatusChamado } from "@/components/ui/Selo";
import { botao, campo, tabela } from "@/components/ui/estilos";

export const metadata: Metadata = { title: "Chamados" };

const LIMITE = 100;

export default async function ListaChamados({ searchParams }: PageProps<"/chamados">) {
  const usuario = await exigirUsuario();
  const params = await searchParams;
  const filtros = filtrosChamadosSchema.parse(params);

  const [{ data: chamados, count, error }, equipamentos] = await Promise.all([
    consultarChamados(filtros, LIMITE),
    listarEquipamentosParaSelecao(),
  ]);
  if (error) {
    registrarErro("listaChamados", error);
    throw new Error("Falha ao carregar chamados.");
  }
  const lista = chamados ?? [];
  const filtrando = Boolean(filtros.status || filtros.prioridade || filtros.equipamento || filtros.de || filtros.ate);
  const equipe = ehEquipe(usuario.papel);
  // Mesmos filtros da tela, repassados para a exportação.
  const consultaAtual = new URLSearchParams(
    Object.entries(filtros).flatMap(([chave, valor]) => (valor === undefined ? [] : [[chave, String(valor)]])),
  ).toString();

  return (
    <>
      <MensagemRetorno sucesso={params.sucesso} />
      <CabecalhoPagina
        titulo={equipe ? "Chamados" : "Meus chamados"}
        descricao={equipe ? "Todos os chamados registrados." : "Chamados abertos por você."}
        acoes={
          <>
            <a
              href={`/chamados/exportar${consultaAtual ? `?${consultaAtual}` : ""}`}
              className={botao.secundario}
              download
            >
              Exportar CSV
            </a>
            <Link href="/chamados/novo" className={botao.primario}>
              Abrir chamado
            </Link>
          </>
        }
      />

      <form role="search" aria-label="Filtrar chamados" className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-semibold">Status</label>
          <select id="status" name="status" defaultValue={filtros.status ?? ""} className={campo}>
            <option value="">Todos</option>
            {STATUS_CHAMADO.map((s) => <option key={s} value={s}>{ROTULO_STATUS_CHAMADO[s]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="prioridade" className="mb-1 block text-sm font-semibold">Prioridade</label>
          <select id="prioridade" name="prioridade" defaultValue={filtros.prioridade ?? ""} className={campo}>
            <option value="">Todas</option>
            {PRIORIDADES.map((p) => <option key={p} value={p}>{ROTULO_PRIORIDADE[p]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="equipamento" className="mb-1 block text-sm font-semibold">Equipamento</label>
          <select id="equipamento" name="equipamento" defaultValue={filtros.equipamento?.toString() ?? ""} className={campo}>
            <option value="">Todos</option>
            {equipamentos.map((e) => <option key={e.id} value={e.id}>{e.codigo} — {e.nome}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="de" className="mb-1 block text-sm font-semibold">Aberto de</label>
          <input id="de" name="de" type="date" defaultValue={filtros.de ?? ""} className={campo} />
        </div>
        <div>
          <label htmlFor="ate" className="mb-1 block text-sm font-semibold">Até</label>
          <input id="ate" name="ate" type="date" defaultValue={filtros.ate ?? ""} className={campo} />
        </div>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
          <button type="submit" className={botao.primario}>Filtrar</button>
          {filtrando ? <Link href="/chamados" className={botao.secundario}>Limpar filtros</Link> : null}
        </div>
      </form>

      <p className="mb-2 text-sm text-slate-700" aria-live="polite">
        {count ?? lista.length} chamado(s) encontrado(s)
        {(count ?? 0) > LIMITE ? ` — exibindo os ${LIMITE} mais recentes. Use os filtros para refinar.` : "."}
      </p>

      {lista.length === 0 ? (
        <EstadoVazio titulo={filtrando ? "Nenhum chamado corresponde aos filtros." : "Nenhum chamado registrado ainda."}>
          {filtrando ? "Altere ou limpe os filtros." : "Use o botão Abrir chamado para registrar um problema."}
        </EstadoVazio>
      ) : (
        <div className={tabela.envoltorio}>
          <table className={tabela.tabela}>
            <caption className="sr-only">Lista de chamados</caption>
            <thead>
              <tr>
                <th scope="col" className={tabela.cabecalho}>Chamado</th>
                <th scope="col" className={tabela.cabecalho}>Equipamento</th>
                <th scope="col" className={tabela.cabecalho}>Status</th>
                <th scope="col" className={tabela.cabecalho}>Prioridade</th>
                {equipe ? <th scope="col" className={tabela.cabecalho}>Solicitante</th> : null}
                <th scope="col" className={tabela.cabecalho}>Técnico</th>
                <th scope="col" className={tabela.cabecalho}>Abertura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lista.map((c) => (
                <tr key={c.id}>
                  <td className={tabela.celula}>
                    <Link href={`/chamados/${c.id}`} className={botao.link}>
                      <span className="font-mono">{codigoChamado(c.id)}</span> — {c.titulo}
                    </Link>
                  </td>
                  <td className={`${tabela.celula} font-mono`}>{c.equipamento?.codigo}</td>
                  <td className={tabela.celula}><SeloStatusChamado status={c.status} /></td>
                  <td className={tabela.celula}><SeloPrioridade prioridade={c.prioridade} /></td>
                  {equipe ? <td className={tabela.celula}>{c.solicitante?.nome}</td> : null}
                  <td className={tabela.celula}>{c.tecnico?.nome ?? <span className="text-slate-500">Não atribuído</span>}</td>
                  <td className={tabela.celula}>{formatarDataHora(c.criado_em)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
