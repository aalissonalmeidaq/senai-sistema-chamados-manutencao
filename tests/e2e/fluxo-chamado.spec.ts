import { expect, test, type Page } from "@playwright/test";
import { entrar, sair } from "./apoio";

/** Seleciona a opção do campo "Próximo passo" cujo texto casa com `opcao` e confirma. */
async function mudarStatus(page: Page, secao: string, opcao: RegExp, observacao?: string) {
  const formulario = page.getByRole("form", { name: secao });
  const campo = formulario.getByLabel("Próximo passo");
  const alvo = campo.locator("option").filter({ hasText: opcao });
  await expect(alvo).toHaveCount(1);
  await campo.selectOption({ label: (await alvo.textContent()) ?? "" });
  if (observacao) await formulario.getByLabel("Observação").fill(observacao);
  await formulario.getByRole("button", { name: "Confirmar mudança" }).click();
}

test("ciclo completo: abrir, triar, executar ordem, resolver e encerrar", async ({ page }) => {
  const titulo = `Impressora com ruído E2E ${Date.now()}`;

  // --- Solicitante abre o chamado (com validação) ---
  await entrar(page, "solicitante2@example.com");
  await page.goto("/chamados/novo");
  await page.getByRole("button", { name: "Abrir chamado" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Corrija os campos destacados.");
  await expect(page.getByText("Selecione o equipamento.", { exact: true })).toBeVisible();

  await page.getByLabel("Equipamento").selectOption({ label: "INF-0003 — Impressora a laser da secretaria" });
  await page.getByLabel("Título").fill(titulo);
  await page.getByLabel("Descrição").fill("            ");
  await page.getByLabel("Categoria").selectOption({ label: "Falha" });
  await page.getByRole("button", { name: "Abrir chamado" }).click();
  await expect(page.getByText("Descreva o problema com pelo menos 10 caracteres.")).toBeVisible();
  // O que já foi digitado é preservado após o erro
  await expect(page.getByLabel("Título")).toHaveValue(titulo);

  await page.getByLabel("Descrição").fill("A impressora faz um ruído alto ao puxar o papel.");
  await page.getByRole("button", { name: "Abrir chamado" }).click();
  await expect(page.getByText("Chamado aberto com sucesso.")).toBeVisible();
  await expect(page.getByTitle("Status do chamado")).toHaveText(/Aberto/);
  const urlChamado = page.url().split("?")[0];
  await sair(page);

  // --- Técnico faz a triagem e o atendimento ---
  await entrar(page, "tecnico1@example.com");
  await page.goto(urlChamado);
  await mudarStatus(page, "Mudar status do chamado", /Iniciar triagem/);
  await expect(page.getByText("Status alterado para Em triagem.")).toBeVisible();

  // Iniciar atendimento sem técnico é bloqueado
  await mudarStatus(page, "Mudar status do chamado", /Iniciar atendimento/);
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Atribua um técnico antes de iniciar o atendimento.");

  const triagem = page.getByRole("form", { name: "Triagem do chamado" });
  await triagem.getByLabel("Prioridade").selectOption({ label: "Alta" });
  await triagem.getByLabel("Técnico responsável").selectOption({ label: "Bianca Lopes" });
  await triagem.getByRole("button", { name: "Salvar triagem" }).click();
  await expect(page.getByText("Triagem salva.")).toBeVisible();

  await mudarStatus(page, "Mudar status do chamado", /Iniciar atendimento/);
  await expect(page.getByText("Status alterado para Em atendimento.")).toBeVisible();

  // --- Ordem de manutenção ---
  await page.getByRole("link", { name: "Criar ordem de manutenção" }).click();
  await page.getByLabel("Tipo de manutenção").selectOption({ value: "corretiva" });
  await page.getByLabel("Diagnóstico inicial").fill("Rolete de tração desgastado.");
  await page.getByRole("button", { name: "Criar ordem" }).click();
  await expect(page.getByText("Ordem de manutenção criada com sucesso.")).toBeVisible();

  await mudarStatus(page, "Mudar status da ordem", /Iniciar execução/);
  await expect(page.getByText("Status da ordem alterado para Em execução.")).toBeVisible();

  // Concluir sem registro completo é bloqueado
  await mudarStatus(page, "Mudar status da ordem", /Concluir ordem/);
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Registre as atividades executadas");

  const registro = page.getByRole("form", { name: "Registro da manutenção" });
  await registro.getByLabel("Atividades executadas").fill("Rolete substituído. 20 páginas impressas sem ruído.");
  await registro.getByLabel("Resultado").selectOption({ label: "Resolvido" });
  await registro.getByRole("button", { name: "Salvar registro" }).click();
  await expect(page.getByText("Registro da ordem salvo.")).toBeVisible();

  await mudarStatus(page, "Mudar status da ordem", /Concluir ordem/);
  await expect(page.getByText("Ordem concluída. O registro foi preservado")).toBeVisible();
  await expect(page.getByText(/não podem mais ser alterados/)).toBeVisible();

  // --- Resolver o chamado ---
  await page.goto(urlChamado);
  await mudarStatus(page, "Mudar status do chamado", /Marcar como resolvido/, "Rolete substituído e testado.");
  await expect(page.getByText("Status alterado para Resolvido.")).toBeVisible();
  await sair(page);

  // --- Solicitante confirma e encerra ---
  await entrar(page, "solicitante2@example.com");
  await page.goto(urlChamado);
  await mudarStatus(page, "Mudar status do chamado", /Confirmar solução e encerrar/);
  await expect(page.getByText("Chamado encerrado. O histórico continua disponível")).toBeVisible();
  await expect(page.getByText("Chamado encerrado: não aceita novos comentários.")).toBeVisible();

  const historico = page.getByRole("region", { name: "Histórico do chamado" });
  await expect(historico).toContainText("Chamado aberto com prioridade Média");
  await expect(historico).toContainText("Status alterado de Resolvido para Encerrado");
});

test("filtros da lista de chamados e estado vazio", async ({ page }) => {
  await entrar(page, "tecnico1@example.com");
  await page.goto("/chamados?status=aguardando");
  await expect(page.getByRole("table")).toContainText("Impressora atolando papel");
  await page.goto("/chamados?de=2000-01-01&ate=2000-01-02");
  await expect(page.getByText("Nenhum chamado corresponde aos filtros.")).toBeVisible();
});

test("equipamento: validação de código e cadastro", async ({ page }) => {
  await entrar(page, "tecnico2@example.com");
  await page.goto("/equipamentos/novo");
  await page.getByLabel("Código patrimonial").fill("INF-0001");
  await page.getByRole("textbox", { name: "Nome", exact: true }).fill("Equipamento duplicado");
  await page.getByLabel("Categoria").selectOption({ label: "Informática" });
  await page.getByLabel("Localização").fill("Sala de testes");
  await page.getByRole("button", { name: "Salvar equipamento" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Já existe um equipamento com este código.");

  const codigo = `TST-${String(Date.now()).slice(-4)}`;
  await page.getByLabel("Código patrimonial").fill(codigo.toLowerCase());
  await page.getByRole("button", { name: "Salvar equipamento" }).click();
  await expect(page.getByText("Equipamento cadastrado com sucesso.")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(codigo);
});

test("triagem: remover o técnico de chamado em atendimento mostra mensagem clara", async ({ page }) => {
  await entrar(page, "tecnico1@example.com");
  await page.goto("/chamados/2"); // "Ar-condicionado pingando água", em atendimento no seed
  const triagem = page.getByRole("form", { name: "Triagem do chamado" });
  await triagem.getByLabel("Técnico responsável").selectOption({ label: "Não atribuído" });
  await triagem.getByRole("button", { name: "Salvar triagem" }).click();
  await expect(triagem.getByRole("alert")).toContainText("precisa de técnico responsável");
});
