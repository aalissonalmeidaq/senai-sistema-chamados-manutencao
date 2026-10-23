import type { Metadata } from "next";
import Link from "next/link";
import { exigirUsuario } from "@/lib/auth";
import { listarEquipamentosParaSelecao } from "@/lib/consultas";
import {
  CATEGORIAS_CHAMADO,
  PRIORIDADES,
  ROTULO_CATEGORIA_CHAMADO,
  ROTULO_PRIORIDADE,
} from "@/lib/dominio/rotulos";
import { CabecalhoPagina } from "@/components/ui/CabecalhoPagina";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { FormAcao } from "@/components/formulario/FormAcao";
import { BotaoEnviar, CampoAreaTexto, CampoSelecao, CampoTexto } from "@/components/formulario/Campos";
import { botao } from "@/components/ui/estilos";
import { abrirChamado } from "../acoes";

export const metadata: Metadata = { title: "Abrir chamado" };

export default async function NovoChamado({ searchParams }: PageProps<"/chamados/novo">) {
  await exigirUsuario();
  const { equipamento } = await searchParams;
  // RN-CH-03: equipamentos inativos não aceitam chamados.
  const equipamentos = await listarEquipamentosParaSelecao({ somenteAtivos: true });

  return (
    <>
      <CabecalhoPagina
        titulo="Abrir chamado"
        acima={<Link href="/chamados" className={botao.link}>← Chamados</Link>}
        descricao="Descreva o problema com detalhes: o que acontece, desde quando e o que já foi tentado."
      />
      {equipamentos.length === 0 ? (
        <EstadoVazio titulo="Nenhum equipamento disponível para chamados.">
          Peça à equipe técnica para cadastrar o equipamento.
        </EstadoVazio>
      ) : (
        <FormAcao acao={abrirChamado} rotulo="Abrir chamado" className="max-w-2xl space-y-4">
          <CampoSelecao
            nome="equipamento_id"
            rotulo="Equipamento"
            obrigatorio
            vazio="Selecione o equipamento..."
            valorInicial={typeof equipamento === "string" ? equipamento : undefined}
            opcoes={equipamentos.map((e) => ({ valor: String(e.id), rotulo: `${e.codigo} — ${e.nome}` }))}
          />
          <CampoTexto nome="titulo" rotulo="Título" obrigatorio ajuda="Resumo em poucas palavras (5 a 120 caracteres)." />
          <CampoAreaTexto
            nome="descricao"
            rotulo="Descrição"
            obrigatorio
            linhas={5}
            ajuda="Mínimo de 10 caracteres (espaços não contam)."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoSelecao
              nome="categoria"
              rotulo="Categoria"
              obrigatorio
              vazio="Selecione..."
              opcoes={CATEGORIAS_CHAMADO.map((c) => ({ valor: c, rotulo: ROTULO_CATEGORIA_CHAMADO[c] }))}
            />
            <CampoSelecao
              nome="prioridade"
              rotulo="Prioridade sugerida"
              obrigatorio
              valorInicial="media"
              opcoes={PRIORIDADES.map((p) => ({ valor: p, rotulo: ROTULO_PRIORIDADE[p] }))}
              ajuda="A equipe técnica pode ajustar na triagem."
            />
          </div>
          <div className="flex gap-2">
            <BotaoEnviar pendente="Abrindo...">Abrir chamado</BotaoEnviar>
            <Link href="/chamados" className={botao.secundario}>Cancelar</Link>
          </div>
        </FormAcao>
      )}
    </>
  );
}
