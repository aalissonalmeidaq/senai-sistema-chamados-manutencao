import Link from "next/link";
import { FormAcao } from "@/components/formulario/FormAcao";
import { BotaoEnviar, CampoAreaTexto, CampoSelecao, CampoTexto } from "@/components/formulario/Campos";
import { botao } from "@/components/ui/estilos";
import {
  CATEGORIAS_EQUIPAMENTO,
  ESTADOS_EQUIPAMENTO,
  ROTULO_CATEGORIA_EQUIPAMENTO,
  ROTULO_ESTADO_EQUIPAMENTO,
} from "@/lib/dominio/rotulos";
import type { EstadoFormulario } from "@/lib/formulario";
import type { Equipamento } from "@/types/dominio";

type Props = {
  acao: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  equipamento?: Pick<Equipamento, "codigo" | "nome" | "categoria" | "localizacao" | "descricao" | "estado">;
  cancelarHref: string;
};

export function FormularioEquipamento({ acao, equipamento, cancelarHref }: Props) {
  return (
    <FormAcao acao={acao} rotulo="Dados do equipamento" className="max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoTexto
          nome="codigo"
          rotulo="Código patrimonial"
          obrigatorio
          valorInicial={equipamento?.codigo}
          placeholder="INF-0001"
          ajuda="Formato AAA-0000 (3 letras, hífen, 4 números). Deve ser único."
        />
        <CampoSelecao
          nome="estado"
          rotulo="Estado operacional"
          obrigatorio
          valorInicial={equipamento?.estado ?? "disponivel"}
          opcoes={ESTADOS_EQUIPAMENTO.map((e) => ({ valor: e, rotulo: ROTULO_ESTADO_EQUIPAMENTO[e] }))}
          ajuda="Inativo: não aceita novos chamados."
        />
      </div>
      <CampoTexto nome="nome" rotulo="Nome" obrigatorio valorInicial={equipamento?.nome} />
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSelecao
          nome="categoria"
          rotulo="Categoria"
          obrigatorio
          vazio="Selecione..."
          valorInicial={equipamento?.categoria}
          opcoes={CATEGORIAS_EQUIPAMENTO.map((c) => ({ valor: c, rotulo: ROTULO_CATEGORIA_EQUIPAMENTO[c] }))}
        />
        <CampoTexto
          nome="localizacao"
          rotulo="Localização"
          obrigatorio
          valorInicial={equipamento?.localizacao}
          placeholder="Bloco A — Laboratório 1"
        />
      </div>
      <CampoAreaTexto nome="descricao" rotulo="Descrição" valorInicial={equipamento?.descricao} linhas={3} />
      <div className="flex gap-2">
        <BotaoEnviar>Salvar equipamento</BotaoEnviar>
        <Link href={cancelarHref} className={botao.secundario}>
          Cancelar
        </Link>
      </div>
    </FormAcao>
  );
}
