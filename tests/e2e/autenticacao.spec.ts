import { expect, test } from "@playwright/test";
import { entrar, linkDeConfirmacao, sair } from "./apoio";

test.describe("autenticação e acesso", () => {
  test("visitante sem login é levado para a tela de entrada", async ({ page }) => {
    await page.goto("/chamados");
    await expect(page).toHaveURL(/\/entrar\?proximo=%2Fchamados/);
    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  });

  test("senha errada mostra mensagem clara", async ({ page }) => {
    await page.goto("/entrar");
    await page.getByLabel("E-mail").fill("solicitante1@example.com");
    await page.getByRole("textbox", { name: "Senha", exact: true }).fill("errada123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("E-mail ou senha incorretos.");
  });

  test("solicitante entra, vê o painel e sai", async ({ page }) => {
    await entrar(page, "solicitante1@example.com");
    await expect(page.getByRole("heading", { name: "Olá, Daniela Souza" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Menu principal" })).not.toContainText("Usuários");
    await sair(page);
    await expect(page.getByText("Você saiu do sistema.")).toBeVisible();
  });

  test("solicitante não acessa telas da equipe", async ({ page }) => {
    await entrar(page, "solicitante1@example.com");
    await page.goto("/usuarios");
    await expect(page).toHaveURL(/\/painel\?aviso=sem-permissao/);
    await expect(page.getByText("Você não tem permissão para acessar aquela página.")).toBeVisible();
  });

  test("cadastro com confirmação pela caixa de e-mail local", async ({ page }) => {
    const email = `aluno.e2e.${Date.now()}@example.com`;
    await page.goto("/cadastrar");
    await page.getByLabel("Nome").fill("Aluno E2E");
    await page.getByLabel("E-mail").fill(email);
    await page.getByRole("textbox", { name: "Senha", exact: true }).fill("Senha@1234");
    await page.getByLabel("Confirme a senha").fill("Senha@1234");
    await page.getByRole("button", { name: "Cadastrar" }).click();
    await expect(page).toHaveURL(/\/cadastro-enviado/);

    // Antes de confirmar, o login é recusado
    await page.goto("/entrar");
    await page.getByLabel("E-mail").fill(email);
    await page.getByRole("textbox", { name: "Senha", exact: true }).fill("Senha@1234");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("E-mail ainda não confirmado");

    // Confirma pelo link recebido no Mailpit
    await page.goto(await linkDeConfirmacao(email));
    await expect(page).toHaveURL(/\/painel/);
    await expect(page.getByText("(Solicitante)")).toBeVisible();
  });
});
