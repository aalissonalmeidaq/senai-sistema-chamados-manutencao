#!/usr/bin/env node
// npm run db:types — gera types/database.ts a partir do banco LOCAL (precisa do Supabase rodando).
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const comando = "npx --no-install supabase gen types typescript --local";
const r = spawnSync(comando, { shell: true, encoding: "utf8" });
if (r.status !== 0 || !r.stdout.includes("export type Database")) {
  console.error(r.stderr || "Falha ao gerar tipos. O Supabase local está rodando? (npm run db:start)");
  process.exit(1);
}
writeFileSync("types/database.ts", r.stdout, "utf8");
console.log("types/database.ts atualizado.");
