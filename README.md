# Sistema de Chamados e Ordens de Manutenção (didático)

Aplicação web para **registrar chamados de manutenção de equipamentos** e acompanhar as **ordens de
manutenção** até a conclusão. Ela é usada no Curso Técnico em Desenvolvimento de Sistemas para praticar
três etapas profissionais:

| Situação de aprendizagem | O que você vai fazer com este sistema |
| --- | --- |
| **SA 1 — Verificação e qualidade** (Teste de Sistemas) | Analisar requisitos, planejar e executar testes, registrar evidências e falhas, recomendar a liberação. |
| **SA 2 — Liberação controlada** (Implantação de Sistemas) | Instalar e configurar o ambiente, aplicar migrações, validar, documentar e planejar o retorno. |
| **SA 3 — Operação e sustentação** (Manutenção de Sistemas) | Atender chamados, diagnosticar, fazer manutenção controlada no Git, retestar e encerrar. |

> **Ambiente didático.** Todos os nomes, equipamentos e usuários são fictícios. Não cadastre dados reais
> e não use este sistema para controlar equipamentos ou instalações de verdade.

## Acesso rápido

Com o ambiente pronto (`npm run setup:local` e `npm run dev`), abra <http://localhost:3000> e entre com um
dos usuários de teste. **Senha de todos: `Senha@123`**

| Papel | E-mail | Nome |
| --- | --- | --- |
| Administrador | `admin@example.com` | Alex Moreira |
| Técnico | `tecnico1@example.com` | Bianca Lopes |
| Técnico | `tecnico2@example.com` | Caio Ferreira |
| Solicitante | `solicitante1@example.com` | Daniela Souza |
| Solicitante | `solicitante2@example.com` | Eduardo Lima |
| Solicitante | `solicitante3@example.com` | Fernanda Rocha |

Essas contas são **fictícias**, existem só no banco local e são recriadas a cada `npm run db:reset`.
Não use essas senhas em nenhum ambiente publicado (veja o guia de
[implantação demonstrativa](docs/aluno/07-implantacao-demonstrativa.md)).

| Serviço | Endereço |
| --- | --- |
| Aplicação | <http://localhost:3000> |
| Supabase Studio (banco) | <http://127.0.0.1:55323> |
| Caixa de e-mail local (Mailpit) | <http://127.0.0.1:55324> |

## Sumário

1. [Requisitos da máquina](#1-requisitos-da-máquina)
2. [Instalar as ferramentas](#2-instalar-as-ferramentas)
3. [Configurar o Docker pela primeira vez](#3-configurar-o-docker-pela-primeira-vez)
4. [Obter o projeto e instalar as dependências](#4-obter-o-projeto-e-instalar-as-dependências)
5. [Preparar o ambiente local](#5-preparar-o-ambiente-local)
6. [Iniciar a aplicação e endereços](#6-iniciar-a-aplicação-e-endereços)
7. [Primeiro acesso](#7-primeiro-acesso)
8. [Verificar a conexão com o banco](#8-verificar-a-conexão-com-o-banco)
9. [Executar os testes](#9-executar-os-testes)
10. [Reinicializar, parar e limpar](#10-reinicializar-parar-e-limpar)
11. [Solução de problemas](#11-solução-de-problemas)
12. [Limites do ambiente didático](#12-limites-do-ambiente-didático)
13. [Mapa da documentação](#13-mapa-da-documentação)
14. [Estrutura do projeto](#14-estrutura-do-projeto)

---

## 1. Requisitos da máquina

| Item | Mínimo | Recomendado |
| --- | --- | --- |
| Sistema operacional | Windows 10 (22H2) ou 11 de 64 bits, macOS 13+, Linux de 64 bits | Windows 11 / macOS 14+ |
| Memória RAM | 8 GB | 16 GB |
| Espaço livre em disco | 10 GB | 20 GB |
| Processador | 64 bits com virtualização ativa na BIOS/UEFI | 4 núcleos ou mais |
| Internet | Necessária **na primeira preparação** (baixa ~3 GB de imagens Docker e pacotes npm) | — |

Depois da primeira preparação, o sistema funciona **sem internet** (o banco roda no seu computador).

## 2. Instalar as ferramentas

Você precisa de **Git**, **Node.js 24 LTS** e **Docker Desktop** (ou outro runtime compatível com Docker).
A ferramenta do banco (Supabase CLI) **não** precisa ser instalada à parte: ela vem com o projeto
e é usada com `npx supabase ...`.

### Windows

1. **Git**: baixe em <https://git-scm.com/download/win> e instale com as opções padrão.
2. **Node.js 24 LTS**: baixe o instalador "LTS" em <https://nodejs.org> e instale com as opções padrão.
3. **Docker Desktop**: baixe em <https://www.docker.com/products/docker-desktop/>. Durante a instalação,
   mantenha marcada a opção **Use WSL 2**. Reinicie o computador se for solicitado.
4. Feche e abra novamente o terminal (PowerShell ou o terminal do VS Code) e confira:

```powershell
git --version
node --version     # deve mostrar v24.x (mínimo v22.12)
npm --version
docker --version
```

### macOS

1. Git: rode `git --version` no Terminal; se não estiver instalado, o macOS oferece instalar as
   "Command Line Tools".
2. Node.js 24 LTS: instalador em <https://nodejs.org> (ou `nvm install 24`).
3. Docker Desktop: <https://www.docker.com/products/docker-desktop/> (escolha Apple Silicon ou Intel).

### Linux (Ubuntu/Debian)

1. `sudo apt install git`
2. Node.js 24 LTS: <https://nodejs.org> ou `nvm install 24`.
3. Docker Engine: <https://docs.docker.com/engine/install/> e depois
   `sudo usermod -aG docker $USER` (saia e entre de novo na sessão).

### Editor

Recomendado: **Visual Studio Code**. Ao abrir o projeto, aceite instalar as extensões recomendadas
(ESLint, Tailwind CSS, Playwright, Vitest e visualizador de diagramas Mermaid).

## 3. Configurar o Docker pela primeira vez

1. Abra o **Docker Desktop** e aceite os termos de uso.
2. Espere o indicador mostrar **Engine running** (no Windows, o ícone da baleia na bandeja para de se mexer).
3. No Windows, em *Settings → Resources → WSL integration*, deixe ativa a integração padrão.
4. Teste no terminal:

```bash
docker info
```

Se aparecer `Server Version: ...`, está pronto. Se aparecer erro de conexão, veja a
[seção 11](#11-solução-de-problemas).

> O Docker Desktop precisa estar **aberto** sempre que você for usar o sistema.

## 4. Obter o projeto e instalar as dependências

O instrutor vai informar **um** destes caminhos:

- **Repositório Git** (endereço fornecido pelo instrutor):

  ```bash
  git clone <endereço-do-repositório> sistema-chamados-manutencao
  cd sistema-chamados-manutencao
  ```

- **Pasta compactada (.zip)**: extraia em uma pasta **sem espaços nem acentos** no caminho
  (ex.: `C:\projetos\sistema-chamados-manutencao`) e abra um terminal nessa pasta.

Instale as dependências **exatamente** nas versões do projeto (instalação limpa):

```bash
npm ci
```

`npm ci` usa o arquivo `package-lock.json` e não altera versões. Use `npm install` somente se o
instrutor pedir para adicionar uma dependência.

## 5. Preparar o ambiente local

Com o Docker aberto, rode **um único comando**:

```bash
npm run setup:local
```

Ele pode ser executado quantas vezes for preciso. O que ele faz:

1. confere Node.js, dependências e Docker;
2. inicia o **Supabase local** (banco PostgreSQL, autenticação, painel Studio e caixa de e-mail).
   **Na primeira vez**, baixa as imagens (alguns minutos) e já aplica as **migrações** e carrega os
   **dados fictícios** (`supabase/seed.sql`);
3. nas vezes seguintes, aplica apenas migrações pendentes, **sem apagar dados**;
4. cria o arquivo **`.env.local`** com o endereço e a chave **publicável** do Supabase local;
5. mostra os endereços e os próximos passos.

### Criar o `.env.local` manualmente (se preferir ou se o script não conseguir)

1. Com o Supabase rodando, mostre os valores locais:

   ```bash
   npx supabase status -o env
   ```

2. Copie o modelo: `cp .env.example .env.local` (no PowerShell: `Copy-Item .env.example .env.local`).
3. No `.env.local`, preencha:
   - `NEXT_PUBLIC_SUPABASE_URL` com o valor de **`API_URL`** (ex.: `http://127.0.0.1:55321`);
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` com o valor de **`PUBLISHABLE_KEY`** (começa com `sb_publishable_`).

> **Segurança:** a saída do `status` também mostra `SECRET_KEY` e `SERVICE_ROLE_KEY`. Essas chaves
> **ignoram as regras de acesso do banco** e **nunca** devem ir para o `.env.local` da aplicação nem
> para variáveis `NEXT_PUBLIC_*` (que ficam visíveis no navegador). O `.env.local` não é versionado
> no Git.

## 6. Iniciar a aplicação e endereços

```bash
npm run dev
```

| Serviço | Endereço | Para quê |
| --- | --- | --- |
| **Aplicação** | <http://localhost:3000> | Use sempre `localhost` (não `127.0.0.1`), para o login funcionar com os links de e-mail. |
| Teste de fumaça | <http://localhost:3000/api/saude> | Confere se a aplicação fala com o banco. |
| Supabase Studio | <http://127.0.0.1:55323> | Ver tabelas, dados e usuários do banco local. |
| Caixa de e-mail local (Mailpit) | <http://127.0.0.1:55324> | Recebe os e-mails de confirmação de cadastro. |
| API do Supabase | <http://127.0.0.1:55321> | Usada pela aplicação. |
| Banco PostgreSQL | `127.0.0.1:55322` (usuário `postgres`, senha `postgres`) | Acesso direto (ex.: ferramentas de banco). |

> As portas usam a faixa **553xx** (e não as padrão 543xx) para não conflitar com outros projetos
> Supabase que você tenha na máquina.

Para parar a aplicação, pressione `Ctrl + C` no terminal do `npm run dev`.

## 7. Primeiro acesso

### Usuários fictícios prontos (senha de todos: `Senha@123`)

| E-mail | Nome | Papel |
| --- | --- | --- |
| `admin@example.com` | Alex Moreira | Administrador |
| `tecnico1@example.com` | Bianca Lopes | Técnico |
| `tecnico2@example.com` | Caio Ferreira | Técnico |
| `solicitante1@example.com` | Daniela Souza | Solicitante |
| `solicitante2@example.com` | Eduardo Lima | Solicitante |
| `solicitante3@example.com` | Fernanda Rocha | Solicitante |

Essas credenciais existem **somente no seu banco local** e são recriadas a cada `npm run db:reset`.

### Criar sua própria conta e confirmar o e-mail

1. Em <http://localhost:3000/cadastrar>, preencha nome, e-mail fictício (ex.: `seu.nome@example.com`) e senha.
2. A tela "Confirme seu e-mail" aparece. **Nenhum e-mail sai do computador**: abra a caixa local
   **Mailpit** em <http://127.0.0.1:55324>.
3. Abra a mensagem **"Confirme seu cadastro"** e clique em **Confirmar meu e-mail**. Você entra no painel.
4. Toda conta nova começa como **Solicitante**. Para virar técnico, entre como `admin@example.com`,
   vá em **Usuários** e altere o papel.

O que cada papel pode fazer está no [Guia de uso](docs/aluno/01-guia-de-uso.md).

## 8. Verificar a conexão com o banco

1. Abra <http://localhost:3000/api/saude>. O esperado é algo como
   `{"aplicacao":"ok","banco":"ok","horario_servidor":"...","versao_postgres":"17..."}`.
   Se aparecer `"banco":"erro"`, o Supabase não está rodando ou o `.env.local` está incorreto.
2. Entre com `tecnico1@example.com`: logo após `npm run db:reset`, o **Painel** mostra
   **13** equipamentos cadastrados, **9** chamados em andamento e **5** ordens em andamento (dados do seed);
   a lista **Chamados** mostra **14** chamados.
3. No **Studio** (<http://127.0.0.1:55323>), em *Table Editor*, veja as tabelas `equipamentos`,
   `chamados`, `ordens_manutencao` e `eventos`.
4. No terminal: `npm run db:status` mostra se os serviços estão de pé.

## 9. Executar os testes

| Suíte | Comando | Precisa do Supabase? |
| --- | --- | --- |
| Verificação de código (lint) | `npm run lint` | Não |
| Verificação de tipos | `npm run typecheck` | Não |
| Unitários e componentes | `npm test` | Não |
| Banco: RLS, restrições e regras (pgTAP) | `npm run db:test` | Sim |
| Integração (permissões pela API) | `npm run test:integration` | Sim |
| Ponta a ponta no navegador (E2E) | `npm run test:e2e` | Sim |
| Build de produção | `npm run build` | Não |

Antes dos testes E2E, na primeira vez, instale o navegador do Playwright: `npx playwright install chromium`.
Para resultados previsíveis, recrie o banco antes (`npm run db:reset`): os testes de integração e E2E
criam registros novos.

Como registrar evidências, testes manuais, falhas e reteste: [Guia de testes](docs/aluno/06-guia-de-testes.md).

## 10. Reinicializar, parar e limpar

| Situação | Comando | Efeito nos dados |
| --- | --- | --- |
| Voltar o banco ao estado inicial (migrações + dados fictícios) | `npm run db:reset` | **Apaga** tudo o que você cadastrou e recria o seed. |
| Encerrar a aula | `npm run db:stop` | **Mantém** os dados para a próxima aula. |
| Retomar | `npm run db:start` (ou `npm run setup:local`) | Dados preservados. |
| Limpar tudo do Supabase deste projeto | `npx supabase stop --no-backup` | ⚠️ **Apaga os volumes do banco deste projeto. Não há como desfazer.** |

> ⚠️ **Atenção:** `--no-backup` remove permanentemente o banco local deste projeto. Use apenas se o
> instrutor pedir ou se o ambiente estiver irrecuperável. Depois, rode `npm run setup:local` para recriar.

## 11. Solução de problemas

| Mensagem ou sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| `failed to connect to the docker API` / `Cannot connect to the Docker daemon` / `O Docker não está respondendo` | Docker Desktop fechado ou ainda iniciando. | Abra o Docker Desktop, espere "Engine running" e repita o comando. |
| `WSL 2 installation is incomplete` (Windows) | WSL não instalado. | No PowerShell como administrador: `wsl --install`, reinicie o computador. |
| `port is already allocated` / `Bind for 0.0.0.0:5532x failed` | Outra aplicação usa a porta. | `npm run db:stop`; veja quem usa com `docker ps`; feche o outro projeto e repita. |
| `npm ci` falha com `EBADENGINE` ou erro de sintaxe | Node.js antigo. | Instale o Node.js 24 LTS e abra um novo terminal. |
| `Dependências não instaladas` no `setup:local` | Faltou `npm ci`. | Rode `npm ci` e depois `npm run setup:local`. |
| Página "Configuração pendente" | `.env.local` ausente ou incompleto. | `npm run setup:local` e reinicie o `npm run dev`. |
| `/api/saude` retorna `"banco":"erro"` | Supabase parado ou URL/chave erradas. | `npm run db:status`; se parado, `npm run db:start`; confira o `.env.local` (seção 5). |
| "E-mail ou senha incorretos." com usuário do seed | Banco recriado sem seed ou senha digitada errada. | Senha: `Senha@123`. Se persistir, `npm run db:reset`. |
| "E-mail ainda não confirmado" | Cadastro sem confirmação. | Abra o Mailpit (<http://127.0.0.1:55324>) e clique no link. |
| Link do e-mail abre "Não foi possível confirmar o acesso" | Link já usado/expirado ou aberto em `127.0.0.1`. | Use `localhost:3000`; faça novo cadastro se preciso. |
| `Error: Defina .env.local` nos testes de integração | `.env.local` ausente. | `npm run setup:local`. |
| Testes E2E: `Executable doesn't exist` | Navegador do Playwright não instalado. | `npx playwright install chromium`. |
| Testes falham após você cadastrar muitos dados | Base diferente do seed. | `npm run db:reset` e rode de novo. |
| `supabase start` muito lento ou falha por memória | Pouca RAM disponível. | Feche programas; no Docker Desktop, aumente a memória em *Settings → Resources*. |
| Erro com caminho contendo espaços/acentos | Pasta do projeto com caracteres especiais. | Mova o projeto para algo como `C:\projetos\sistema-chamados-manutencao`. |

Ainda com problema? Registre a mensagem completa do terminal (texto, não foto) e o comando executado.

## 12. Limites do ambiente didático

- O Supabase local roda **só no seu computador**. Uma aplicação publicada na internet (ex.: Vercel)
  **não consegue** acessar esse banco. Demonstrações remotas usam um projeto Supabase **separado**
  — veja o [Guia de implantação demonstrativa](docs/aluno/07-implantacao-demonstrativa.md).
- Os e-mails são capturados pelo Mailpit; nada é enviado de verdade.
- Não há backup automático do banco local. `npm run db:reset` volta ao estado inicial.
- Fora do escopo: estoque de peças, manutenção preditiva, IoT, integrações externas, várias empresas.

## 13. Mapa da documentação

| Documento | Conteúdo |
| --- | --- |
| [00 — Especificação de requisitos](docs/aluno/00-especificacao-de-requisitos.md) | Requisitos funcionais, regras de negócio e não funcionais (base dos testes). |
| [01 — Guia de uso](docs/aluno/01-guia-de-uso.md) | Telas, papéis, estados e fluxos. |
| [02 — Guia da SA 1 (Teste)](docs/aluno/02-guia-sa1-teste.md) | Roteiro, entregas e evidências da SA 1. |
| [03 — Guia da SA 2 (Implantação)](docs/aluno/03-guia-sa2-implantacao.md) | Roteiro, entregas e evidências da SA 2. |
| [04 — Guia da SA 3 (Manutenção)](docs/aluno/04-guia-sa3-manutencao.md) | Roteiro, entregas e evidências da SA 3. |
| [05 — Implantação local passo a passo](docs/aluno/05-implantacao-local.md) | Ambiente limpo, validação pós-instalação, recuperação. |
| [06 — Guia de testes](docs/aluno/06-guia-de-testes.md) | Suítes, evidências, registro de defeitos, reteste e regressão. |
| [07 — Implantação demonstrativa](docs/aluno/07-implantacao-demonstrativa.md) | Vercel + Supabase remoto de demonstração, retorno de versão. |
| [08 — Modelos de entrega](docs/aluno/08-modelos/) | Matriz, caso de teste, falha, checklist, mudança, atendimento. |
| [09 — Critérios de avaliação](docs/aluno/09-criterios-de-avaliacao.md) | Como as entregas serão avaliadas. |
| [10 — Modelo de dados](docs/aluno/10-modelo-de-dados.md) | Tabelas, relacionamentos (Mermaid) e segurança (RLS). |

## 14. Estrutura do projeto

```text
app/                    rotas e telas (Next.js App Router)
  (publico)/            entrar, cadastrar
  (sistema)/            painel, equipamentos, chamados, ordens, usuários (exigem login)
  api/saude/            teste de fumaça
components/             componentes reutilizáveis (formulários, selos de status, histórico)
lib/                    clientes Supabase, regras de negócio, validações, formatação
types/                  tipos TypeScript (database.ts é gerado do banco)
supabase/
  config.toml           configuração do Supabase local
  migrations/           esquema do banco, regras e políticas RLS (versionados)
  seed.sql              dados fictícios
  tests/                testes do banco (pgTAP)
tests/                  unit/, integration/, e2e/
docs/aluno/             guias e modelos
scripts/                preparação do ambiente e geração de tipos
proxy.ts                renovação de sessão e proteção das rotas
```

Convenções para quem for alterar o código (pessoas ou agentes): [AGENTS.md](AGENTS.md).
