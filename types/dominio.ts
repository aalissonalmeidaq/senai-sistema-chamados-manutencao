import type { Database } from "./database";

type Enums = Database["public"]["Enums"];
type Linha<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];

export type PapelUsuario = Enums["papel_usuario"];
export type EstadoEquipamento = Enums["estado_equipamento"];
export type CategoriaEquipamento = Enums["categoria_equipamento"];
export type StatusChamado = Enums["status_chamado"];
export type PrioridadeChamado = Enums["prioridade_chamado"];
export type CategoriaChamado = Enums["categoria_chamado"];
export type TipoManutencao = Enums["tipo_manutencao"];
export type StatusOrdem = Enums["status_ordem"];
export type ResultadoOrdem = Enums["resultado_ordem"];

export type Perfil = Linha<"perfis">;
export type Equipamento = Linha<"equipamentos">;
export type Chamado = Linha<"chamados">;
export type ComentarioChamado = Linha<"comentarios_chamado">;
export type OrdemManutencao = Linha<"ordens_manutencao">;
export type Evento = Linha<"eventos">;

/** Usuário autenticado com seu perfil (papel) carregado do banco. */
export type UsuarioAtual = {
  id: string;
  email: string;
  nome: string;
  papel: PapelUsuario;
};
