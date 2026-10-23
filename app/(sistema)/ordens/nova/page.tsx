import type { Metadata } from "next";
import Link from "next/link";
import { exigirEquipe } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { listarEquipeTecnica } from "@/lib/consultas";
import { podeCriarOrdem } from "@/lib/regras/chamados";
import { STATUS_ORDEM_ATIVOS } from "@/lib/regras/ordens";
import { DESCRICAO_TIPO_MANUTENCAO, ROTULO_TIPO_MANUTENCAO, TIPOS_MANUTENCAO } from "@/lib/dominio/rotulos";
import { codigoChamado } from "@/lib/formatacao";
import { CabecalhoPagina } from "@/components/ui/CabecalhoPagina";
import { Alerta } from "@/components/ui/Alerta";
import { FormAcao } from "@/components/formulario/FormAcao";
import { BotaoEnviar, CampoAreaTexto, CampoSelecao } from "@/components/formulario/Campos";
import { botao } from "@/components/ui/estilos";
import { criarOrdem } from "../acoes";

export const metadata: Metadata = { title: "Nova ordem de manutenção" };

export default async function NovaOrdem({ searchParams }: PageProps<"/ordens/nova">) {
  const usuario = await exigirEquipe();
  const chamadoId = Number((await searchParams).chamado);

  const supabase = await createClient();
  const { data: chamado } = Number.isInteger(chamadoId)
    ? await supabase
        .from("chamados")
        .select("id, titulo, status, tecnico_id, equipamento:equipamentos(codigo, nome)")
        .eq("id", chamadoId)
        .maybeSingle()
    : { data: null };

  if (!chamado) {
    return (
      <>
        <CabecalhoPagina titulo="Nova ordem de manutenção" />
        <Alerta tipo="aviso">
          Abra a ordem a partir de um chamado: acesse <Link href="/chamados" className={botao.link}>Chamados</Link>, escolha o
          chamado e use “Criar ordem de manutenção”.
        </Alerta>
      </>
    );
  }

  const [{ count }, tecnicos] = await Promise.all([
    supabase
      .from("ordens_manutencao")
      .select("id", { count: "exact", head: true })
      .eq("chamado_id", chamado.id)
      .in("status", [...STATUS_ORDEM_ATIVOS]),
    listarEquipeTecnica(),
  ]);
  const permitido = podeCriarOrdem(chamado.status, usuario.papel, (count ?? 0) > 0);

  return (
    <>
      <CabecalhoPagina
        titulo="Nova ordem de manutenção"
        acima={<Link href={`/chamados/${chamado.id}`} className={botao.link}>← Voltar ao chamado</Link>}
        descricao={
          <>
            Chamado <strong>{codigoChamado(chamado.id)}</strong> — {chamado.titulo} · Equipamento{" "}
            <strong>{chamado.equipamento?.codigo}</strong> ({chamado.equipamento?.nome})
          </>
        }
      />
      {!permitido ? (
        <Alerta tipo="aviso">
          Este chamado não aceita nova ordem agora: ele precisa estar em triagem, em atendimento ou aguardando, e não pode ter
          outra ordem ativa.
        </Alerta>
      ) : (
        <FormAcao acao={criarOrdem} rotulo="Nova ordem de manutenção" className="max-w-2xl space-y-4">
          <input type="hidden" name="chamado_id" value={chamado.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoSelecao
              nome="tipo"
              rotulo="Tipo de manutenção"
              obrigatorio
              vazio="Selecione..."
              opcoes={TIPOS_MANUTENCAO.map((t) => ({
                valor: t,
                rotulo: `${ROTULO_TIPO_MANUTENCAO[t]} — ${DESCRICAO_TIPO_MANUTENCAO[t]}`,
              }))}
            />
            <CampoSelecao
              nome="responsavel_id"
              rotulo="Responsável"
              obrigatorio
              valorInicial={chamado.tecnico_id ?? usuario.id}
              opcoes={tecnicos.map((t) => ({ valor: t.id, rotulo: t.nome }))}
            />
          </div>
          <CampoAreaTexto nome="diagnostico" rotulo="Diagnóstico inicial" linhas={3} ajuda="O que foi identificado como causa provável." />
          <CampoAreaTexto nome="plano_acao" rotulo="Plano de ação" linhas={3} ajuda="Passos previstos para a manutenção." />
          <div className="flex gap-2">
            <BotaoEnviar pendente="Criando...">Criar ordem</BotaoEnviar>
            <Link href={`/chamados/${chamado.id}`} className={botao.secundario}>Cancelar</Link>
          </div>
        </FormAcao>
      )}
    </>
  );
}
