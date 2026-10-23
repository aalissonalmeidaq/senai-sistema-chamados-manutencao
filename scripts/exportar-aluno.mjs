#!/usr/bin/env node
/**
 * npm run student:export — gera o pacote do ESTUDANTE por LISTA DE PERMISSÃO.
 *
 * Uso (o "--" separa as opções do npm das opções do script):
 *   npm run student:export
 *   npm run student:export -- --ref ocorrencia/OC-01-descricao-em-branco --nome turma-oc01
 *   npm run student:export -- --destino ../entrega --substituir --sem-git
 *
 * Opções:
 *   --ref <ref>      referência do Git a exportar (padrão: main). Só arquivos
 *                    VERSIONADOS nessa referência são considerados.
 *   --nome <nome>    nome da pasta gerada (padrão: sistema-chamados-manutencao)
 *   --destino <dir>  pasta onde o pacote será criado (padrão: dist-aluno)
 *   --substituir     apaga um pacote anterior com o mesmo nome
 *   --sem-git        não inicializa um repositório Git novo no pacote
 *
 * Garantias:
 *   - copia somente caminhos da LISTA_PERMITIDA;
 *   - falha se algum caminho reservado (instrutor, gabarito, patches...) aparecer;
 *   - falha se encontrar texto marcado como reservado ou algo parecido com chave secreta;
 *   - o pacote não leva o histórico do repositório do instrutor.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

// --- Lista de permissão: SÓ o que está aqui vai para o estudante ------------
const LISTA_PERMITIDA = [
  "app/",
  "components/",
  "lib/",
  "types/",
  "public/",
  "proxy.ts",
  "supabase/config.toml",
  "supabase/migrations/",
  "supabase/seed.sql",
  "supabase/tests/",
  "supabase/templates/",
  "tests/unit/",
  "tests/integration/",
  "tests/e2e/",
  "scripts/setup-local.mjs",
  "scripts/gerar-tipos.mjs",
  "docs/aluno/",
  ".github/workflows/ci.yml",
  ".vscode/settings.json",
  ".vscode/extensions.json",
  ".env.example",
  ".gitignore",
  ".gitattributes",
  ".nvmrc",
  "AGENTS.md",
  "README.md",
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "tsconfig.json",
  "eslint.config.mjs",
  "vitest.config.mts",
  "playwright.config.ts",
];

// --- Defesa extra: nada disso pode aparecer no resultado ---------------------
const CAMINHOS_RESERVADOS = [
  /(^|\/)docs\/instrutor(\/|$)/i,
  /instrutor/i,
  /gabarito/i,
  /solu[cç][aã]o/i,
  /(^|\/)patches?(\/|$)/i,
  /\.patch$/i,
  /\.diff$/i,
  /(^|\/)\.env(\.|$)(?!example$)/i,
  /exportar-aluno/i,
  /STATUS_IMPLEMENTACAO/i,
];

const MARCADOR_RESERVADO = "RESERVADO AO INSTRUTOR";
const PADROES_SEGREDO = [
  /sb_secret_[A-Za-z0-9_-]{10,}/,
  /eyJ[A-Za-z0-9_-]{15,}\.eyJ[A-Za-z0-9_-]{15,}/, // JWT (ex.: chave service_role)
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
];

// --- Argumentos --------------------------------------------------------------
const args = process.argv.slice(2);
const opcao = (nome, padrao) => {
  const i = args.indexOf(nome);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : padrao;
};
const ref = opcao("--ref", "main");
const nome = opcao("--nome", "sistema-chamados-manutencao");
const destinoBase = resolve(opcao("--destino", "dist-aluno"));
const destino = join(destinoBase, nome);
const substituir = args.includes("--substituir");
const semGit = args.includes("--sem-git");

function falhar(msg) {
  console.error(`\n[ERRO] ${msg}\n`);
  process.exit(1);
}

function git(argumentos, { binario = false } = {}) {
  const r = spawnSync("git", argumentos, { encoding: binario ? "buffer" : "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) falhar(`git ${argumentos.join(" ")}\n${r.stderr?.toString() ?? ""}`);
  return r.stdout;
}

const permitido = (caminho) =>
  LISTA_PERMITIDA.some((p) => (p.endsWith("/") ? caminho.startsWith(p) : caminho === p));

// --- Execução ----------------------------------------------------------------
console.log("\n=== Exportação do pacote do estudante ===");
console.log(`Referência Git: ${ref}`);
console.log(`Destino:        ${destino}`);

git(["rev-parse", "--verify", `${ref}^{commit}`]);
if (existsSync(destino)) {
  if (!substituir) falhar(`O destino já existe. Use --substituir para recriá-lo: ${destino}`);
  rmSync(destino, { recursive: true, force: true });
}

const todos = git(["ls-tree", "-r", "--name-only", ref]).split("\n").filter(Boolean);
const incluidos = todos.filter(permitido);
const ignorados = todos.filter((c) => !permitido(c));

// 1. Nenhum caminho reservado pode ter passado pela lista de permissão.
const reservados = incluidos.filter((c) => CAMINHOS_RESERVADOS.some((r) => r.test(c)));
if (reservados.length > 0) falhar(`Caminhos reservados detectados no resultado:\n  ${reservados.join("\n  ")}`);

// 2. Copia os arquivos e verifica o conteúdo.
mkdirSync(destino, { recursive: true });
const problemas = [];
for (const caminho of incluidos) {
  let conteudo = git(["show", `${ref}:${caminho}`], { binario: true });
  const texto = conteudo.toString("utf8");

  if (texto.includes(MARCADOR_RESERVADO)) problemas.push(`${caminho}: contém "${MARCADOR_RESERVADO}"`);
  for (const padrao of PADROES_SEGREDO) {
    if (padrao.test(texto)) problemas.push(`${caminho}: parece conter uma chave/segredo (${padrao})`);
  }

  if (caminho === "package.json") {
    // O script de exportação não vai para o estudante.
    const pacote = JSON.parse(texto);
    delete pacote.scripts["student:export"];
    conteudo = Buffer.from(`${JSON.stringify(pacote, null, 2)}\n`, "utf8");
  }

  const arquivo = join(destino, caminho);
  mkdirSync(dirname(arquivo), { recursive: true });
  writeFileSync(arquivo, conteudo);
}
if (problemas.length > 0) {
  rmSync(destino, { recursive: true, force: true });
  falhar(`Conteúdo reservado ou sensível encontrado (pacote removido):\n  ${problemas.join("\n  ")}`);
}

// 3. Repositório Git novo, sem o histórico do instrutor.
if (!semGit) {
  const opcoesGit = { cwd: destino, encoding: "utf8" };
  spawnSync("git", ["init", "-q", "-b", "main"], opcoesGit);
  spawnSync("git", ["add", "-A"], opcoesGit);
  const commit = spawnSync("git", ["commit", "-q", "-m", "Versão entregue para a turma"], opcoesGit);
  if (commit.status !== 0) {
    console.log("[aviso] Repositório criado, mas o commit inicial falhou (configure git user.name/user.email).");
  }
}

// 4. Relatório
console.log(`\nIncluídos (${incluidos.length} arquivos):`);
for (const c of incluidos) console.log(`  + ${c}`);
console.log(`\nNão incluídos (${ignorados.length} arquivos fora da lista de permissão):`);
for (const c of ignorados) console.log(`  - ${c}`);
console.log(`\n[ok] Pacote do estudante gerado em: ${destino}`);
console.log(semGit ? "     (sem repositório Git)" : "     (com repositório Git novo: 1 commit, sem histórico do instrutor)");
console.log("     Confira o conteúdo antes de distribuir.\n");
