<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Convenções do projeto — Sistema de Chamados de Manutenção (didático)

Sistema **didático** usado em aulas do Curso Técnico em Desenvolvimento de Sistemas. Todos os dados
são fictícios. Não use nomes, marcas, logotipos ou credenciais reais.

## Stack e versões

- Node.js 24 LTS (`.nvmrc`; mínimo 22.12), npm com `package-lock.json` (instale com `npm ci`).
- Next.js 16 (App Router, `proxy.ts` no lugar de `middleware.ts`), React 19, TypeScript estrito.
- Tailwind CSS 4. Supabase (PostgreSQL + Auth + RLS) via `@supabase/ssr`.
- Supabase CLI como dependência de desenvolvimento (`npx supabase ...`), Docker para o ambiente local.
- Testes: Vitest (unit/integração), Testing Library, Playwright (E2E), pgTAP (banco).

## Comandos

| Objetivo | Comando |
| --- | --- |
| Preparar tudo (Supabase, migrações, `.env.local`) | `npm run setup:local` |
| Aplicação em desenvolvimento | `npm run dev` |
| Banco: iniciar / parar / estado | `npm run db:start` / `npm run db:stop` / `npm run db:status` |
| Banco: recriar com migrações + seed (apaga dados locais) | `npm run db:reset` |
| Testes do banco (pgTAP) | `npm run db:test` |
| Lint / tipos / unitários | `npm run lint` / `npm run typecheck` / `npm test` |
| Integração (precisa do Supabase local) | `npm run test:integration` |
| E2E (precisa do Supabase local) | `npm run test:e2e` |
| Tipos do banco após mudar migrações | `npm run db:types` |

Antes de concluir uma alteração: `npm run lint && npm run typecheck && npm test && npm run build`
e, se tocar banco ou fluxos, `npm run db:reset && npm run db:test && npm run test:integration && npm run test:e2e`.

## Estrutura

- `app/(publico)` telas sem login; `app/(sistema)` telas autenticadas; cada módulo tem `acoes.ts` (Server Actions).
- `lib/regras/` regras de negócio (transições de status) — **espelhadas no banco** (`supabase/migrations/*funcoes_e_gatilhos.sql`).
- `lib/validacao/esquemas.ts` validação de formulários (Zod). `lib/dominio/rotulos.ts` rótulos pt-BR.
- `supabase/migrations/` esquema, gatilhos e RLS; `supabase/seed.sql` só dados fictícios; `supabase/tests/` pgTAP.
- `docs/aluno/` material do estudante.

## Regras obrigatórias

1. **Autorização sempre no servidor e no banco.** Server Actions conferem o papel (`exigirUsuario/exigirEquipe/exigirAdmin`)
   e o banco reforça com RLS e gatilhos. Nunca confie em dados de papel vindos do navegador.
2. **Nunca** coloque chave secreta (`sb_secret_...`/`service_role`) em código ou em variável `NEXT_PUBLIC_*`.
   Não versione `.env.local`, tokens, dumps ou bancos binários.
3. Mudança de esquema = **nova migração** em `supabase/migrations/` (não edite migrações já distribuídas).
   Depois: `npm run db:reset`, `npm run db:types`, `npm run db:test`.
4. Mudou uma regra de transição? Altere `lib/regras/*.ts` **e** a função SQL correspondente, e atualize os testes
   (unitário + pgTAP). As duas camadas devem dizer a mesma coisa.
5. Interface em pt-BR, datas `dd/mm/aaaa`, rótulos de `lib/dominio/rotulos.ts`. Status nunca só por cor
   (use os componentes `Selo*`). Todo campo com `<label>`; foco visível; mensagens de carregamento, vazio, erro e sucesso.
6. Use `supabase.select("...")` com **uma única string literal** (o tipo gerado depende disso).
7. `main` deve estar sempre estável e com todos os testes passando. Exercícios com falhas ficam em branches
   próprias e nunca são mesclados na `main`. Materiais reservados não fazem parte do pacote do estudante
   (gerado por lista de permissão).
8. Fora do escopo do MVP (não implementar sem pedido): inventário de peças, manutenção preditiva, IoT,
   integrações externas, multiempresa, automações.
