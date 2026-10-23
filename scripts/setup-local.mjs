#!/usr/bin/env node
/**
 * npm run setup:local — preparação guiada do ambiente LOCAL.
 *
 * O que faz (pode ser executado várias vezes sem estragar nada):
 *   1. Confere Node.js, dependências instaladas e Docker em execução.
 *   2. Inicia o Supabase local (na 1ª vez, baixa as imagens e aplica
 *      migrações + seed automaticamente).
 *   3. Aplica migrações pendentes (sem apagar dados).
 *   4. Cria o .env.local com a URL e a chave PUBLICÁVEL locais, se ele
 *      ainda não existir. Se existir e estiver diferente, só avisa.
 *   5. Mostra endereços, usuários de teste e próximos passos.
 *
 * Opções:
 *   --reset          recria o banco do zero (APAGA os dados locais) com `supabase db reset`
 *   --atualizar-env  sobrescreve o .env.local com os valores atuais da CLI
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const ARQ_ENV = join(RAIZ, ".env.local");
const WINDOWS = process.platform === "win32";
const args = new Set(process.argv.slice(2));

const ok = (msg) => console.log(`  [ok] ${msg}`);
const info = (msg) => console.log(`       ${msg}`);
const aviso = (msg) => console.log(`  [!]  ${msg}`);
const etapa = (n, msg) => console.log(`\n${n}. ${msg}`);

function falhar(msg, dicas = []) {
  console.error(`\n  [ERRO] ${msg}`);
  for (const d of dicas) console.error(`         - ${d}`);
  console.error("\n  Consulte também: README.md, seção \"Solução de problemas\".\n");
  process.exit(1);
}

/** Executa um comando. `herdar` mostra a saída ao vivo no terminal. */
function executar(comando, argumentos, { herdar = false } = {}) {
  const opcoes = { cwd: RAIZ, encoding: "utf8", stdio: herdar ? "inherit" : "pipe" };
  // No Windows, "npx" é um .cmd e precisa de shell; os argumentos são fixos (sem entrada do usuário).
  const r = WINDOWS
    ? spawnSync([comando, ...argumentos].join(" "), { ...opcoes, shell: true })
    : spawnSync(comando, argumentos, opcoes);
  return { codigo: r.status ?? 1, saida: r.stdout ?? "", erro: r.stderr ?? "" };
}

const supabase = (argumentos, opcoes) => executar("npx", ["--no-install", "supabase", ...argumentos], opcoes);

function lerStatus() {
  const r = supabase(["status", "-o", "json"]);
  if (r.codigo !== 0) return null;
  const inicio = r.saida.indexOf("{");
  const fim = r.saida.lastIndexOf("}");
  if (inicio < 0 || fim < 0) return null;
  try {
    return JSON.parse(r.saida.slice(inicio, fim + 1));
  } catch {
    return null;
  }
}

function lerEnvLocal() {
  if (!existsSync(ARQ_ENV)) return null;
  const valores = {};
  for (const linha of readFileSync(ARQ_ENV, "utf8").split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) valores[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return valores;
}

console.log("\n=== Preparação do ambiente local — Sistema de Chamados de Manutenção ===");

// 1. Pré-requisitos ----------------------------------------------------------
etapa(1, "Conferindo pré-requisitos");
const [maior, menor] = process.versions.node.split(".").map(Number);
if (maior < 22 || (maior === 22 && menor < 12)) {
  falhar(`Node.js ${process.versions.node} é antigo demais. Instale o Node.js 24 LTS.`, [
    "Windows: baixe o instalador LTS em https://nodejs.org e reinicie o terminal.",
    "macOS/Linux: use https://nodejs.org ou um gerenciador como nvm (`nvm install 24`).",
  ]);
}
ok(`Node.js ${process.versions.node}`);
if (maior !== 24) aviso("Versão recomendada: Node.js 24 LTS (a mesma usada na integração contínua).");

if (!existsSync(join(RAIZ, "node_modules", "supabase"))) {
  falhar("Dependências não instaladas.", ["Rode `npm ci` na pasta do projeto e repita `npm run setup:local`."]);
}
ok("Dependências instaladas (inclui a Supabase CLI do projeto)");

const docker = executar("docker", ["info", "--format", "{{.ServerVersion}}"]);
if (docker.codigo !== 0) {
  falhar("O Docker não está respondendo.", [
    "Windows: abra o Docker Desktop e espere o status \"Engine running\" (ícone da baleia parado).",
    "Windows: se o Docker Desktop pedir, habilite o WSL 2 e reinicie o computador.",
    "macOS: abra o Docker Desktop pela pasta Aplicativos e aguarde iniciar.",
    "Linux: `sudo systemctl start docker` e confira se seu usuário está no grupo docker.",
    "Depois, rode `npm run setup:local` novamente.",
  ]);
}
ok(`Docker ${docker.saida.trim()} em execução`);

// 2. Supabase local ----------------------------------------------------------
etapa(2, "Iniciando o Supabase local");
let status = lerStatus();
if (status?.API_URL) {
  ok("Supabase local já estava em execução");
} else {
  info("Na primeira vez o download das imagens pode levar vários minutos.");
  const inicio = supabase(["start"], { herdar: true });
  if (inicio.codigo !== 0) {
    falhar("Não foi possível iniciar o Supabase local.", [
      "Leia a mensagem acima. Erro \"port is already allocated\": outra aplicação usa as portas 553xx.",
      "Tente `npm run db:stop` e depois `npm run setup:local` de novo.",
      "Confira se há memória livre suficiente (recomendado: 8 GB de RAM no total).",
    ]);
  }
  status = lerStatus();
  if (!status?.API_URL) falhar("O Supabase iniciou, mas `supabase status` não retornou os endereços.");
  ok("Supabase local iniciado");
}

// 3. Banco: migrações e seed -------------------------------------------------
etapa(3, "Banco de dados");
if (args.has("--reset")) {
  aviso("--reset informado: o banco local será APAGADO e recriado com as migrações e o seed.");
  if (supabase(["db", "reset"], { herdar: true }).codigo !== 0) falhar("Falha no `supabase db reset`.");
  ok("Banco recriado (migrações + dados fictícios do seed)");
} else {
  const migracao = supabase(["migration", "up", "--local"]);
  if (migracao.codigo !== 0) {
    falhar("Falha ao aplicar migrações pendentes.", [
      migracao.erro.trim() || migracao.saida.trim(),
      "Se o banco local estiver inconsistente, recrie-o com `npm run db:reset` (apaga os dados locais).",
    ]);
  }
  ok("Migrações conferidas (pendentes aplicadas, dados preservados)");
  info("Para recriar tudo do zero com os dados fictícios: npm run db:reset");
}

// 4. .env.local --------------------------------------------------------------
etapa(4, "Variáveis de ambiente (.env.local)");
const esperado = {
  NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.PUBLISHABLE_KEY,
};
if (!esperado.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
  falhar("A CLI não informou PUBLISHABLE_KEY. Atualize as dependências com `npm ci`.");
}
const atual = lerEnvLocal();
const conteudo = [
  "# Gerado por `npm run setup:local` para o Supabase LOCAL. NÃO versionar.",
  "# Valores obtidos com `npx supabase status`. A chave publicável pode ir ao navegador;",
  "# a chave secreta (SECRET_KEY / service_role) NUNCA deve ser colocada aqui.",
  `NEXT_PUBLIC_SUPABASE_URL=${esperado.NEXT_PUBLIC_SUPABASE_URL}`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${esperado.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}`,
  "",
].join("\n");

if (!atual) {
  writeFileSync(ARQ_ENV, conteudo, "utf8");
  ok(".env.local criado");
} else {
  const diferentes = Object.keys(esperado).filter((k) => atual[k] !== esperado[k]);
  if (diferentes.length === 0) {
    ok(".env.local já está correto");
  } else if (args.has("--atualizar-env")) {
    writeFileSync(ARQ_ENV, conteudo, "utf8");
    ok(".env.local atualizado (--atualizar-env)");
  } else {
    aviso(`.env.local existe, mas difere da CLI em: ${diferentes.join(", ")}.`);
    info("Para substituir pelos valores locais: npm run setup:local -- --atualizar-env");
  }
}

// 5. Próximos passos ---------------------------------------------------------
etapa(5, "Pronto! Próximos passos");
console.log(`
  Inicie a aplicação:       npm run dev
  Aplicação:                http://localhost:3000
  Supabase Studio (banco):  ${status.STUDIO_URL}
  Caixa de e-mail local:    ${status.MAILPIT_URL ?? status.INBUCKET_URL}
  Teste de fumaça:          http://localhost:3000/api/saude

  Usuários fictícios (senha: Senha@123):
    admin@example.com · tecnico1@example.com · tecnico2@example.com
    solicitante1@example.com · solicitante2@example.com · solicitante3@example.com

  Ao terminar a aula:       npm run db:stop
`);
