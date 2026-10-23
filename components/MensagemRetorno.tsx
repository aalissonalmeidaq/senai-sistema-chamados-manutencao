import { Alerta } from "@/components/ui/Alerta";

/**
 * Mensagens de sucesso/aviso exibidas após um redirecionamento
 * (ex.: /chamados/3?sucesso=aberto).
 */
const SUCESSO: Record<string, string> = {
  "equipamento-criado": "Equipamento cadastrado com sucesso.",
  "equipamento-atualizado": "Equipamento atualizado com sucesso.",
  "equipamento-excluido": "Equipamento excluído.",
  "chamado-aberto": "Chamado aberto com sucesso. Acompanhe o andamento por esta página.",
  "ordem-criada": "Ordem de manutenção criada com sucesso.",
};

const AVISO: Record<string, string> = {
  "sem-permissao": "Você não tem permissão para acessar aquela página.",
};

export function MensagemRetorno({ sucesso, aviso }: { sucesso?: string | string[]; aviso?: string | string[] }) {
  const textoSucesso = typeof sucesso === "string" ? SUCESSO[sucesso] : undefined;
  const textoAviso = typeof aviso === "string" ? AVISO[aviso] : undefined;
  if (!textoSucesso && !textoAviso) return null;
  return (
    <div className="mb-4 space-y-2">
      {textoSucesso ? <Alerta tipo="sucesso">{textoSucesso}</Alerta> : null}
      {textoAviso ? <Alerta tipo="aviso">{textoAviso}</Alerta> : null}
    </div>
  );
}
