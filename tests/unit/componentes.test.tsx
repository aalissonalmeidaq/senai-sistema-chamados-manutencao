import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Alerta } from "@/components/ui/Alerta";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { SeloPrioridade, SeloStatusChamado, SeloStatusOrdem } from "@/components/ui/Selo";
import { Historico } from "@/components/Historico";

describe("Selos de status (não dependem só de cor)", () => {
  it("exibem o rótulo em texto", () => {
    render(
      <>
        <SeloStatusChamado status="em_atendimento" />
        <SeloPrioridade prioridade="critica" />
        <SeloStatusOrdem status="em_execucao" />
      </>,
    );
    expect(screen.getByText("Em atendimento")).toBeInTheDocument();
    expect(screen.getByText("Crítica")).toBeInTheDocument();
    expect(screen.getByText("Em execução")).toBeInTheDocument();
  });

  it("ícone decorativo é ocultado de leitores de tela", () => {
    const { container } = render(<SeloStatusChamado status="resolvido" />);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent("✓");
  });
});

describe("Alerta", () => {
  it("erro usa role=alert", () => {
    render(<Alerta tipo="erro">Falhou</Alerta>);
    expect(screen.getByRole("alert")).toHaveTextContent("Falhou");
  });

  it("sucesso usa role=status", () => {
    render(<Alerta tipo="sucesso">Salvo</Alerta>);
    expect(screen.getByRole("status")).toHaveTextContent("Salvo");
  });
});

describe("Estado vazio e histórico", () => {
  it("mostra a mensagem de lista vazia", () => {
    render(<EstadoVazio titulo="Nenhum chamado.">Abra um chamado.</EstadoVazio>);
    expect(screen.getByText("Nenhum chamado.")).toBeInTheDocument();
  });

  it("histórico sem eventos mostra estado vazio", () => {
    render(<Historico itens={[]} />);
    expect(screen.getByText("Nenhum evento registrado.")).toBeInTheDocument();
  });

  it("histórico lista eventos na ordem recebida, com autor ou 'Sistema'", () => {
    render(
      <Historico
        itens={[
          { id: 1, criado_em: "2026-10-05T13:00:00Z", descricao: "Chamado aberto", tipo: "chamado_aberto", autor: "Daniela Souza" },
          { id: 2, criado_em: "2026-10-05T14:00:00Z", descricao: "Estado alterado", tipo: "equipamento_estado", autor: null },
        ]}
      />,
    );
    const itens = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(itens[0]).toHaveTextContent("Chamado aberto");
    expect(itens[0]).toHaveTextContent("Daniela Souza");
    expect(itens[1]).toHaveTextContent("Sistema");
  });
});
