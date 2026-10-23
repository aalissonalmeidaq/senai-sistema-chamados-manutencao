import type { Metadata } from "next";
import { exigirAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PAPEIS, ROTULO_PAPEL } from "@/lib/dominio/rotulos";
import { formatarData } from "@/lib/formatacao";
import { registrarErro } from "@/lib/erros";
import { CabecalhoPagina } from "@/components/ui/CabecalhoPagina";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { SeloPapel } from "@/components/ui/Selo";
import { cartao } from "@/components/ui/estilos";
import { FormAcao } from "@/components/formulario/FormAcao";
import { BotaoEnviar, CampoSelecao } from "@/components/formulario/Campos";
import { definirPapel } from "./acoes";

export const metadata: Metadata = { title: "Usuários" };

export default async function Usuarios() {
  const admin = await exigirAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.from("perfis").select("id, nome, papel, criado_em").order("nome");
  if (error) {
    registrarErro("usuarios", error);
    throw new Error("Falha ao carregar usuários.");
  }
  const perfis = data ?? [];

  return (
    <>
      <CabecalhoPagina
        titulo="Usuários e papéis"
        descricao="Toda conta nova começa como Solicitante. Apenas administradores alteram papéis; o sistema impede remover o último administrador."
      />
      {perfis.length === 0 ? (
        <EstadoVazio titulo="Nenhum usuário cadastrado." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {perfis.map((p) => (
            <li key={p.id} className={cartao}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {p.nome} {p.id === admin.id ? <span className="text-xs text-slate-600">(você)</span> : null}
                  </p>
                  <p className="text-xs text-slate-600">Cadastro em {formatarData(p.criado_em)}</p>
                </div>
                <SeloPapel papel={p.papel} />
              </div>
              <FormAcao acao={definirPapel} rotulo={`Papel de ${p.nome}`} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="usuario_id" value={p.id} />
                <div className="min-w-48 flex-1">
                  <CampoSelecao
                    nome="papel"
                    rotulo={`Papel de ${p.nome}`}
                    valorInicial={p.papel}
                    opcoes={PAPEIS.map((papel) => ({ valor: papel, rotulo: ROTULO_PAPEL[papel] }))}
                  />
                </div>
                <BotaoEnviar variante="secundario">Salvar papel</BotaoEnviar>
              </FormAcao>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
