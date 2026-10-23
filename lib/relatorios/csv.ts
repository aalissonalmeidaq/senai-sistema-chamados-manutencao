/**
 * Geração de CSV para abrir em planilhas (Excel, LibreOffice, Planilhas Google)
 * com acentuação correta: UTF-8 com BOM, separador ";" (padrão pt-BR) e
 * quebras de linha CRLF.
 */
import {
  ROTULO_CATEGORIA_CHAMADO,
  ROTULO_PRIORIDADE,
  ROTULO_STATUS_CHAMADO,
} from "@/lib/dominio/rotulos";
import { codigoChamado, formatarDataHora } from "@/lib/formatacao";
import type { CategoriaChamado, PrioridadeChamado, StatusChamado } from "@/types/dominio";

const BOM = "﻿";
const SEPARADOR = ";";

/** Coloca o valor entre aspas quando necessário e duplica aspas internas. */
export function escaparCelula(valor: string): string {
  // Impede que a planilha interprete o texto como fórmula (=, +, -, @).
  const seguro = /^[=+\-@]/.test(valor) ? `'${valor}` : valor;
  return /[";\r\n]/.test(seguro) ? `"${seguro.replaceAll('"', '""')}"` : seguro;
}

export function gerarCsv(cabecalho: string[], linhas: string[][]): string {
  const todas = [cabecalho, ...linhas].map((l) => l.map(escaparCelula).join(SEPARADOR));
  return BOM + todas.join("\r\n") + "\r\n";
}

export type ChamadoExportavel = {
  id: number;
  titulo: string;
  status: StatusChamado;
  prioridade: PrioridadeChamado;
  categoria: CategoriaChamado;
  criado_em: string;
  resolvido_em: string | null;
  encerrado_em: string | null;
  equipamento: { codigo: string; nome: string } | null;
  solicitante: { nome: string } | null;
  tecnico: { nome: string } | null;
};

export const CABECALHO_CHAMADOS = [
  "Código",
  "Título",
  "Equipamento",
  "Status",
  "Prioridade",
  "Categoria",
  "Solicitante",
  "Técnico",
  "Aberto em",
  "Resolvido em",
  "Encerrado em",
];

const dataOuVazio = (valor: string | null) => (valor ? formatarDataHora(valor) : "");

export function csvDeChamados(chamados: ChamadoExportavel[]): string {
  return gerarCsv(
    CABECALHO_CHAMADOS,
    chamados.map((c) => [
      codigoChamado(c.id),
      c.titulo,
      c.equipamento ? `${c.equipamento.codigo} — ${c.equipamento.nome}` : "",
      ROTULO_STATUS_CHAMADO[c.status],
      ROTULO_PRIORIDADE[c.prioridade],
      ROTULO_CATEGORIA_CHAMADO[c.categoria],
      c.solicitante?.nome ?? "",
      c.tecnico?.nome ?? "",
      dataOuVazio(c.criado_em),
      dataOuVazio(c.resolvido_em),
      dataOuVazio(c.encerrado_em),
    ]),
  );
}
