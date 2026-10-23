# Status da implementação

Checklist de construção do sistema didático. Marcado conforme cada etapa foi concluída **e verificada**.
Detalhes dos comandos e resultados: `docs/instrutor/07-registro-de-validacao.md`.

## 0. Preparação
- [x] Inspecionar workspace (vazio) e documentos curriculares (plano de ensino + projeto integrado; MSEP consultado para critérios de avaliação)
- [x] Conferir ferramentas: Node 24.21, npm 12.1, Git 2.55, Docker 29.7, gh 2.100 autenticado
- [x] Consultar documentação oficial (Next.js 16 instalação/proxy, Supabase SSR, Vercel variáveis e rollback)
- [x] Scaffold Next.js 16.4.3 (`create-next-app`) + dependências com versões fixas
- [x] `supabase init` e ajuste do `config.toml` (portas 553xx, e-mail com confirmação, serviços não usados desligados)

## 1. Banco de dados
- [x] Modelo relacional revisado (perfis, equipamentos, chamados, comentários, ordens, eventos)
- [x] Migrações: tipos e tabelas
- [x] Migrações: funções, gatilhos, regras de transição e trilha de auditoria
- [x] Migrações: RLS e privilégios
- [x] `seed.sql` com dados fictícios (exercita as regras como cada usuário)
- [x] Testes pgTAP (RLS, restrições, transições) — 73 testes
- [x] `supabase db reset` + `supabase test db` passando

## 2. Aplicação
- [x] Clientes Supabase SSR + `proxy.ts`
- [x] Autenticação: cadastro, entrada, saída, confirmação de e-mail (Mailpit)
- [x] Equipamentos: listar, buscar, detalhar, cadastrar, editar, excluir (admin)
- [x] Chamados: abrir, listar/filtrar, triagem, atribuição, status, comentários, histórico
- [x] Ordens: criar, editar, transições, histórico, efeito no equipamento
- [x] Painel e usuários (administração de papéis)
- [x] Estados de carregamento, vazio, erro e sucesso; acessibilidade

## 3. Qualidade
- [x] Testes unitários e de componentes (Vitest + Testing Library) — 58
- [x] Testes de integração com o Supabase local (RLS via API) — 11
- [x] Testes E2E (Playwright) — 9 (dev e build de produção)
- [x] Lint, typecheck e build
- [x] CI no GitHub Actions (escrita; validada localmente com os mesmos comandos)

## 4. Scripts
- [x] `setup:local` (idempotente), `db:*`, `test:*`, `student:export` (lista de permissão, testado contra vazamentos)

## 5. Materiais
- [x] README do estudante
- [x] Guias do estudante (requisitos, uso, SA1, SA2, SA3, implantação local, testes, implantação demonstrativa, modelos, critérios, modelo de dados)
- [x] Materiais do instrutor (preparação + divergências, gabarito verificado, ocorrências, rubricas, mapa, pacote, registro de validação)
- [x] AGENTS.md

## 6. Ocorrências controladas
- [x] OC-01 e OC-02 (branches de defeito + branches de referência) e OC-03 (demanda evolutiva + referência), com resultado real registrado

## 7. Entrega
- [x] Validação ponta a ponta registrada (inclui pacote exportado em pasta limpa)
- [x] Revisão de segredos e pacote do aluno
- [ ] Git (main) + repositório remoto privado — ver relatório final
