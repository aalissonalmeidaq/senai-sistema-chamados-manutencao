/**
 * Selos de status. Cada selo combina TEXTO + ÍCONE + cor, para que a
 * informação não dependa só da cor (acessibilidade).
 */
import {
  ROTULO_ESTADO_EQUIPAMENTO,
  ROTULO_PAPEL,
  ROTULO_PRIORIDADE,
  ROTULO_STATUS_CHAMADO,
  ROTULO_STATUS_ORDEM,
} from "@/lib/dominio/rotulos";
import type {
  EstadoEquipamento,
  PapelUsuario,
  PrioridadeChamado,
  StatusChamado,
  StatusOrdem,
} from "@/types/dominio";

type Tom = "cinza" | "azul" | "roxo" | "ambar" | "verde" | "vermelho" | "laranja";

const TONS: Record<Tom, string> = {
  cinza: "bg-slate-100 text-slate-800 ring-slate-400",
  azul: "bg-blue-50 text-blue-900 ring-blue-600",
  roxo: "bg-violet-50 text-violet-900 ring-violet-600",
  ambar: "bg-amber-50 text-amber-900 ring-amber-600",
  verde: "bg-green-50 text-green-900 ring-green-700",
  vermelho: "bg-red-50 text-red-900 ring-red-700",
  laranja: "bg-orange-50 text-orange-900 ring-orange-600",
};

export function Selo({ rotulo, icone, tom, titulo }: { rotulo: string; icone: string; tom: Tom; titulo?: string }) {
  return (
    <span
      title={titulo}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONS[tom]}`}
    >
      <span aria-hidden="true">{icone}</span>
      {rotulo}
    </span>
  );
}

const STATUS_CHAMADO: Record<StatusChamado, { icone: string; tom: Tom }> = {
  aberto: { icone: "○", tom: "azul" },
  em_triagem: { icone: "◔", tom: "roxo" },
  em_atendimento: { icone: "◑", tom: "ambar" },
  aguardando: { icone: "⏸", tom: "laranja" },
  resolvido: { icone: "✓", tom: "verde" },
  encerrado: { icone: "■", tom: "cinza" },
};

export function SeloStatusChamado({ status }: { status: StatusChamado }) {
  const s = STATUS_CHAMADO[status];
  return <Selo rotulo={ROTULO_STATUS_CHAMADO[status]} icone={s.icone} tom={s.tom} titulo="Status do chamado" />;
}

const PRIORIDADE: Record<PrioridadeChamado, { icone: string; tom: Tom }> = {
  baixa: { icone: "▽", tom: "cinza" },
  media: { icone: "◇", tom: "azul" },
  alta: { icone: "△", tom: "laranja" },
  critica: { icone: "▲", tom: "vermelho" },
};

export function SeloPrioridade({ prioridade }: { prioridade: PrioridadeChamado }) {
  const p = PRIORIDADE[prioridade];
  return <Selo rotulo={ROTULO_PRIORIDADE[prioridade]} icone={p.icone} tom={p.tom} titulo="Prioridade" />;
}

const ESTADO_EQUIPAMENTO: Record<EstadoEquipamento, { icone: string; tom: Tom }> = {
  disponivel: { icone: "●", tom: "verde" },
  em_manutencao: { icone: "⚙", tom: "ambar" },
  inativo: { icone: "×", tom: "cinza" },
};

export function SeloEstadoEquipamento({ estado }: { estado: EstadoEquipamento }) {
  const e = ESTADO_EQUIPAMENTO[estado];
  return <Selo rotulo={ROTULO_ESTADO_EQUIPAMENTO[estado]} icone={e.icone} tom={e.tom} titulo="Estado operacional" />;
}

const STATUS_ORDEM: Record<StatusOrdem, { icone: string; tom: Tom }> = {
  planejada: { icone: "○", tom: "azul" },
  em_execucao: { icone: "⚙", tom: "ambar" },
  concluida: { icone: "✓", tom: "verde" },
  cancelada: { icone: "×", tom: "cinza" },
};

export function SeloStatusOrdem({ status }: { status: StatusOrdem }) {
  const s = STATUS_ORDEM[status];
  return <Selo rotulo={ROTULO_STATUS_ORDEM[status]} icone={s.icone} tom={s.tom} titulo="Status da ordem" />;
}

export function SeloPapel({ papel }: { papel: PapelUsuario }) {
  const tom: Tom = papel === "administrador" ? "roxo" : papel === "tecnico" ? "azul" : "cinza";
  return <Selo rotulo={ROTULO_PAPEL[papel]} icone="◆" tom={tom} titulo="Papel do usuário" />;
}
