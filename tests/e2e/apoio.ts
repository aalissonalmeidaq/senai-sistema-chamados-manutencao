import { expect, type Page } from "@playwright/test";

export const SENHA_SEED = "Senha@123";
export const MAILPIT_URL = process.env.MAILPIT_URL ?? "http://127.0.0.1:55324";

export async function entrar(page: Page, email: string, senha = SENHA_SEED) {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill(email);
  await page.getByRole("textbox", { name: "Senha", exact: true }).fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/painel/);
}

export async function sair(page: Page) {
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/entrar/);
}

/** Busca na caixa de e-mail local (Mailpit) o link de confirmação enviado para `email`. */
export async function linkDeConfirmacao(email: string): Promise<string> {
  for (let tentativa = 0; tentativa < 20; tentativa++) {
    const busca = await fetch(`${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`);
    const { messages } = (await busca.json()) as { messages: { ID: string }[] };
    if (messages.length > 0) {
      const resposta = await fetch(`${MAILPIT_URL}/api/v1/message/${messages[0].ID}`);
      const { HTML } = (await resposta.json()) as { HTML: string };
      const link = HTML.match(/href="([^"]*\/auth\/confirm[^"]*)"/)?.[1];
      if (link) return link.replaceAll("&amp;", "&");
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`E-mail de confirmação para ${email} não encontrado no Mailpit (${MAILPIT_URL}).`);
}
