import type { PapelUsuario } from "@/types/dominio";

/** Técnicos e administradores formam a "equipe técnica". */
export function ehEquipe(papel: PapelUsuario | null | undefined): boolean {
  return papel === "tecnico" || papel === "administrador";
}

export function ehAdmin(papel: PapelUsuario | null | undefined): boolean {
  return papel === "administrador";
}
