# Status da implementação

Checklist de construção do sistema didático. Marcado conforme cada etapa foi concluída **e verificada**.

## 0. Preparação
- [x] Inspecionar workspace (vazio) e documentos curriculares (plano de ensino + projeto integrado em `Downloads/Projeto Integrado de Qualidade de Sistemas`)
- [x] Conferir ferramentas: Node 24.21, npm 12.1, Git 2.55, Docker 29.7, gh 2.100 autenticado
- [x] Consultar documentação oficial (Next.js 16 instalação/proxy, Supabase SSR)
- [x] Scaffold Next.js 16.4.3 (`create-next-app`) + dependências com versões fixas
- [x] `supabase init` e ajuste do `config.toml` (portas 553xx, e-mail com confirmação, serviços não usados desligados)

## 1. Banco de dados
- [ ] Modelo relacional revisado (perfis, equipamentos, chamados, comentários, ordens, eventos)
- [ ] Migrações: tipos e tabelas
- [ ] Migrações: funções, gatilhos, regras de transição e trilha de auditoria
- [ ] Migrações: RLS e privilégios
- [ ] `seed.sql` com dados fictícios
- [ ] Testes pgTAP (RLS, restrições, transições)
- [ ] `supabase db reset` + `supabase test db` passando

## 2. Aplicação
- [ ] Clientes Supabase SSR + `proxy.ts`
- [ ] Autenticação: cadastro, entrada, saída, confirmação de e-mail
- [ ] Equipamentos: listar, buscar, detalhar, cadastrar, editar
- [ ] Chamados: abrir, listar/filtrar, triagem, atribuição, status, comentários, histórico
- [ ] Ordens: criar, editar, transições, histórico
- [ ] Painel e usuários (administração de papéis)
- [ ] Estados de carregamento, vazio, erro e sucesso; acessibilidade

## 3. Qualidade
- [ ] Testes unitários e de componentes (Vitest + Testing Library)
- [ ] Testes de integração com o Supabase local (RLS via API)
- [ ] Testes E2E (Playwright)
- [ ] Lint, typecheck e build
- [ ] CI no GitHub Actions

## 4. Scripts
- [ ] `setup:local`, `db:*`, `student:export`

## 5. Materiais
- [ ] README do estudante
- [ ] Guias do estudante (uso, SA1, SA2, SA3, implantação local, testes, implantação demonstrativa, modelos, critérios)
- [ ] Materiais do instrutor (preparação, gabarito, ocorrências, rubricas, mapa, exportação)
- [ ] AGENTS.md

## 6. Ocorrências controladas
- [ ] OC-01, OC-02 (branches de defeito) e OC-03 (demanda evolutiva) com resultado real registrado

## 7. Entrega
- [ ] Validação ponta a ponta registrada
- [ ] Revisão de segredos e pacote do aluno
- [ ] Git (main) + repositório remoto privado
