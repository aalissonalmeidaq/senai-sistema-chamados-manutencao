/**
 * Rótulos em português para os valores controlados do banco.
 * Os mesmos nomes aparecem na interface, no README e nos roteiros.
 * (A função SQL public.rotulo() espelha esta tabela para o histórico.)
 */
import type {
  CategoriaChamado,
  CategoriaEquipamento,
  EstadoEquipamento,
  PapelUsuario,
  PrioridadeChamado,
  ResultadoOrdem,
  StatusChamado,
  StatusOrdem,
  TipoManutencao,
} from "@/types/dominio";

export const ROTULO_PAPEL: Record<PapelUsuario, string> = {
  solicitante: "Solicitante",
  tecnico: "Técnico",
  administrador: "Administrador",
};

export const ROTULO_ESTADO_EQUIPAMENTO: Record<EstadoEquipamento, string> = {
  disponivel: "Disponível",
  em_manutencao: "Em manutenção",
  inativo: "Inativo",
};

export const ROTULO_CATEGORIA_EQUIPAMENTO: Record<CategoriaEquipamento, string> = {
  informatica: "Informática",
  eletrica: "Elétrica",
  mecanica: "Mecânica",
  climatizacao: "Climatização",
  laboratorio: "Laboratório",
  mobiliario: "Mobiliário",
  outro: "Outro",
};

export const ROTULO_STATUS_CHAMADO: Record<StatusChamado, string> = {
  aberto: "Aberto",
  em_triagem: "Em triagem",
  em_atendimento: "Em atendimento",
  aguardando: "Aguardando",
  resolvido: "Resolvido",
  encerrado: "Encerrado",
};

export const ROTULO_PRIORIDADE: Record<PrioridadeChamado, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

export const ROTULO_CATEGORIA_CHAMADO: Record<CategoriaChamado, string> = {
  falha: "Falha",
  desempenho: "Desempenho",
  seguranca: "Segurança",
  melhoria: "Melhoria",
  outro: "Outro",
};

export const ROTULO_TIPO_MANUTENCAO: Record<TipoManutencao, string> = {
  corretiva: "Corretiva",
  preventiva: "Preventiva",
  evolutiva: "Evolutiva",
};

export const ROTULO_STATUS_ORDEM: Record<StatusOrdem, string> = {
  planejada: "Planejada",
  em_execucao: "Em execução",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export const ROTULO_RESULTADO_ORDEM: Record<ResultadoOrdem, string> = {
  resolvido: "Resolvido",
  parcial: "Parcial",
  nao_resolvido: "Não resolvido",
};

/** Listas de valores na ordem de exibição (para selects e filtros). */
export const STATUS_CHAMADO = Object.keys(ROTULO_STATUS_CHAMADO) as StatusChamado[];
export const PRIORIDADES = Object.keys(ROTULO_PRIORIDADE) as PrioridadeChamado[];
export const CATEGORIAS_CHAMADO = Object.keys(ROTULO_CATEGORIA_CHAMADO) as CategoriaChamado[];
export const ESTADOS_EQUIPAMENTO = Object.keys(ROTULO_ESTADO_EQUIPAMENTO) as EstadoEquipamento[];
export const CATEGORIAS_EQUIPAMENTO = Object.keys(ROTULO_CATEGORIA_EQUIPAMENTO) as CategoriaEquipamento[];
export const TIPOS_MANUTENCAO = Object.keys(ROTULO_TIPO_MANUTENCAO) as TipoManutencao[];
export const STATUS_ORDEM = Object.keys(ROTULO_STATUS_ORDEM) as StatusOrdem[];
export const RESULTADOS_ORDEM = Object.keys(ROTULO_RESULTADO_ORDEM) as ResultadoOrdem[];
export const PAPEIS = Object.keys(ROTULO_PAPEL) as PapelUsuario[];

/** Descrição curta de cada tipo de manutenção (ajuda na escolha). */
export const DESCRICAO_TIPO_MANUTENCAO: Record<TipoManutencao, string> = {
  corretiva: "Corrige uma falha que já aconteceu.",
  preventiva: "Evita falhas futuras com revisões programadas.",
  evolutiva: "Melhora ou adapta o equipamento a uma nova necessidade.",
};
