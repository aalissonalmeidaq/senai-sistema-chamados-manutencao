/**
 * Formatação no padrão brasileiro. As datas são exibidas no fuso
 * America/Sao_Paulo (UTC-3, sem horário de verão desde 2019).
 */
const FUSO = "America/Sao_Paulo";

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const formatoDataHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatarData(valor: string | Date | null | undefined): string {
  if (!valor) return "—";
  return formatoData.format(new Date(valor));
}

export function formatarDataHora(valor: string | Date | null | undefined): string {
  if (!valor) return "—";
  return formatoDataHora.format(new Date(valor)).replace(",", " às");
}

/** Código de exibição do chamado: CH-0007. */
export function codigoChamado(id: number): string {
  return `CH-${String(id).padStart(4, "0")}`;
}

/** Código de exibição da ordem: OM-0003 (igual à função SQL codigo_ordem). */
export function codigoOrdem(id: number): string {
  return `OM-${String(id).padStart(4, "0")}`;
}

/**
 * Converte o período do filtro (datas AAAA-MM-DD do formulário) em
 * instantes ISO no fuso de Brasília. "ate" é inclusivo: vai até o fim do dia.
 */
export function intervaloDoPeriodo(de?: string, ate?: string) {
  const inicio = de ? `${de}T00:00:00-03:00` : undefined;
  let fimExclusivo: string | undefined;
  if (ate) {
    const proximoDia = new Date(`${ate}T00:00:00-03:00`);
    proximoDia.setUTCDate(proximoDia.getUTCDate() + 1);
    fimExclusivo = proximoDia.toISOString();
  }
  return { inicio, fimExclusivo };
}

/** Duração legível entre duas datas (ex.: "2 d 4 h", "35 min"). */
export function formatarDuracao(inicio: string | null, fim: string | null): string {
  if (!inicio || !fim) return "—";
  const minutos = Math.max(0, Math.round((new Date(fim).getTime() - new Date(inicio).getTime()) / 60000));
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `${horas} h ${minutos % 60} min`;
  return `${Math.floor(horas / 24)} d ${horas % 24} h`;
}
