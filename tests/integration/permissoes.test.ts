/**
 * Permissões e RLS vistos pela API (como a aplicação acessa o banco).
 * Pré-requisito: Supabase local rodando e seed carregado (npm run db:reset).
 */
import { describe, expect, it } from "vitest";
import { clienteAnonimo, entrarComo, USUARIOS } from "./apoio";

describe("sem login (anon)", () => {
  it("não lê chamados nem equipamentos", async () => {
    const anon = clienteAnonimo();
    const chamados = await anon.from("chamados").select("id");
    expect(chamados.error?.code).toBe("42501");
    const equipamentos = await anon.from("equipamentos").select("id");
    expect(equipamentos.error?.code).toBe("42501");
  });

  it("consegue apenas a verificação de conexão (teste de fumaça)", async () => {
    const { data, error } = await clienteAnonimo().rpc("verificar_conexao");
    expect(error).toBeNull();
    expect(data).toMatchObject({ banco: "ok" });
  });
});

describe("solicitante", () => {
  it("vê somente os próprios chamados", async () => {
    const { cliente, usuarioId } = await entrarComo(USUARIOS.solicitante1);
    const { data, error } = await cliente.from("chamados").select("id, solicitante_id");
    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThan(0);
    expect(data!.every((c) => c.solicitante_id === usuarioId)).toBe(true);
  });

  it("não vê comentários internos", async () => {
    const { cliente } = await entrarComo(USUARIOS.solicitante1);
    const { data } = await cliente.from("comentarios_chamado").select("interno");
    expect(data!.some((c) => c.interno)).toBe(false);
  });

  it("não eleva o próprio papel", async () => {
    const { cliente, usuarioId } = await entrarComo(USUARIOS.solicitante1);
    const direto = await cliente.from("perfis").update({ papel: "administrador" }).eq("id", usuarioId);
    expect(direto.error?.code).toBe("42501");
    const rpc = await cliente.rpc("definir_papel", { p_usuario: usuarioId, p_papel: "administrador" });
    expect(rpc.error?.message).toMatch(/Apenas administradores/);
    const { data } = await cliente.from("perfis").select("papel").eq("id", usuarioId).single();
    expect(data?.papel).toBe("solicitante");
  });

  it("não cadastra equipamento", async () => {
    const { cliente } = await entrarComo(USUARIOS.solicitante1);
    const { error } = await cliente
      .from("equipamentos")
      .insert({ codigo: "ZZZ-0001", nome: "Tentativa", categoria: "outro", localizacao: "Sala" });
    expect(error?.code).toBe("42501");
  });

  it("não altera a trilha de auditoria", async () => {
    const { cliente } = await entrarComo(USUARIOS.solicitante1);
    const { error } = await cliente.from("eventos").delete().gt("id", 0);
    expect(error?.code).toBe("42501");
  });
});

describe("técnico e administrador", () => {
  it("técnico vê chamados de todos os solicitantes", async () => {
    const { cliente } = await entrarComo(USUARIOS.tecnico1);
    const { data } = await cliente.from("chamados").select("solicitante_id");
    expect(new Set(data!.map((c) => c.solicitante_id)).size).toBeGreaterThan(1);
  });

  it("código de equipamento duplicado é rejeitado", async () => {
    const { cliente } = await entrarComo(USUARIOS.tecnico1);
    const { error } = await cliente
      .from("equipamentos")
      .insert({ codigo: "INF-0001", nome: "Duplicado", categoria: "informatica", localizacao: "Sala" });
    expect(error?.code).toBe("23505");
  });

  it("técnico não exclui equipamento; administrador não exclui equipamento com chamados", async () => {
    const tecnico = await entrarComo(USUARIOS.tecnico1);
    const t = await tecnico.cliente.from("equipamentos").delete().eq("codigo", "INF-0001").select("id");
    expect(t.data).toEqual([]); // RLS: nenhuma linha visível para exclusão
    const admin = await entrarComo(USUARIOS.admin);
    const a = await admin.cliente.from("equipamentos").delete().eq("codigo", "INF-0001");
    expect(a.error?.code).toBe("23503");
  });
});
