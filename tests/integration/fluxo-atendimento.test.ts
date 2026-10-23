/**
 * Fluxo completo pela API: abertura → triagem → atendimento → ordem →
 * conclusão → resolução → encerramento, conferindo histórico e o estado
 * do equipamento. Cria dados novos (use npm run db:reset para limpar).
 */
import { describe, expect, it } from "vitest";
import { entrarComo, sufixo, USUARIOS } from "./apoio";

describe("fluxo de atendimento ponta a ponta", () => {
  it("percorre o ciclo de vida do chamado e da ordem", async () => {
    const solicitante = await entrarComo(USUARIOS.solicitante2);
    const tecnico = await entrarComo(USUARIOS.tecnico1);

    const { data: equipamento } = await tecnico.cliente
      .from("equipamentos")
      .select("id, estado")
      .eq("codigo", "INF-0003")
      .single();
    expect(equipamento).toBeTruthy();

    // 1. Abertura (o banco força status "aberto")
    const titulo = `Teste de integração ${sufixo()}`;
    const aberto = await solicitante.cliente
      .from("chamados")
      .insert({
        titulo,
        descricao: "Chamado criado pelo teste automatizado de integração.",
        categoria: "falha",
        prioridade: "media",
        equipamento_id: equipamento!.id,
        solicitante_id: solicitante.usuarioId,
      })
      .select("id, status")
      .single();
    expect(aberto.error).toBeNull();
    expect(aberto.data!.status).toBe("aberto");
    const chamadoId = aberto.data!.id;

    // 2. Solicitante não faz triagem
    const semPermissao = await solicitante.cliente.rpc("alterar_status_chamado", {
      p_chamado_id: chamadoId,
      p_status: "em_triagem",
    });
    expect(semPermissao.error).not.toBeNull();

    // 3. Triagem e atribuição pelo técnico
    expect((await tecnico.cliente.rpc("alterar_status_chamado", { p_chamado_id: chamadoId, p_status: "em_triagem" })).error).toBeNull();
    expect(
      (await tecnico.cliente.from("chamados").update({ tecnico_id: tecnico.usuarioId, prioridade: "alta" }).eq("id", chamadoId)).error,
    ).toBeNull();
    expect((await tecnico.cliente.rpc("alterar_status_chamado", { p_chamado_id: chamadoId, p_status: "em_atendimento" })).error).toBeNull();

    // 4. Ordem de manutenção
    const ordem = await tecnico.cliente
      .from("ordens_manutencao")
      .insert({ chamado_id: chamadoId, equipamento_id: equipamento!.id, tipo: "corretiva", responsavel_id: tecnico.usuarioId })
      .select("id")
      .single();
    expect(ordem.error).toBeNull();
    const ordemId = ordem.data!.id;

    expect((await tecnico.cliente.rpc("alterar_status_ordem", { p_ordem_id: ordemId, p_status: "em_execucao" })).error).toBeNull();
    const emManutencao = await tecnico.cliente.from("equipamentos").select("estado").eq("id", equipamento!.id).single();
    expect(emManutencao.data!.estado).toBe("em_manutencao");

    // Resolver o chamado com ordem ativa é bloqueado
    const cedo = await tecnico.cliente.rpc("alterar_status_chamado", {
      p_chamado_id: chamadoId,
      p_status: "resolvido",
      p_observacao: "Tentativa antecipada",
    });
    expect(cedo.error?.message).toMatch(/ordem de manutenção ativa/);

    expect(
      (
        await tecnico.cliente
          .from("ordens_manutencao")
          .update({ diagnostico: "Rolete gasto", atividades_executadas: "Rolete substituído e testado", resultado: "resolvido" })
          .eq("id", ordemId)
      ).error,
    ).toBeNull();
    expect((await tecnico.cliente.rpc("alterar_status_ordem", { p_ordem_id: ordemId, p_status: "concluida" })).error).toBeNull();

    // 5. Resolução e confirmação pelo solicitante
    expect(
      (
        await tecnico.cliente.rpc("alterar_status_chamado", {
          p_chamado_id: chamadoId,
          p_status: "resolvido",
          p_observacao: "Rolete substituído.",
        })
      ).error,
    ).toBeNull();
    expect((await solicitante.cliente.rpc("alterar_status_chamado", { p_chamado_id: chamadoId, p_status: "encerrado" })).error).toBeNull();

    // 6. Chamado encerrado é imutável e o histórico está completo
    const depois = await tecnico.cliente.from("chamados").update({ prioridade: "baixa" }).eq("id", chamadoId);
    expect(depois.error?.message).toMatch(/encerrado não pode ser alterado/);

    const { data: eventos } = await tecnico.cliente
      .from("eventos")
      .select("tipo")
      .eq("chamado_id", chamadoId)
      .order("criado_em");
    const tipos = eventos!.map((e) => e.tipo);
    expect(tipos[0]).toBe("chamado_aberto");
    expect(tipos.filter((t) => t === "chamado_status")).toHaveLength(4);
    expect(tipos).toContain("ordem_criada");
    expect(tipos.filter((t) => t === "ordem_status")).toHaveLength(2);

    // O solicitante não vê eventos internos (ex.: "ordem_atualizada")
    const { data: visiveis } = await solicitante.cliente.from("eventos").select("tipo").eq("chamado_id", chamadoId);
    expect(visiveis!.map((e) => e.tipo)).not.toContain("ordem_atualizada");
  });
});
