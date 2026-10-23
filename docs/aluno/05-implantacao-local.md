# 05 — Implantação local passo a passo

Roteiro para instalar o sistema **do zero** em um computador de desenvolvimento, validar a instalação e
recuperar falhas. Use-o junto com o [checklist de implantação](08-modelos/checklist-implantacao.md),
marcando cada item e anotando horário e evidência.

> Os comandos funcionam no PowerShell (Windows), no Git Bash e no terminal do macOS/Linux, salvo
> indicação. Execute-os na **pasta do projeto**.

## Etapa 0 — Ambiente limpo

Considere "limpo" um computador **sem** uma instalação anterior deste projeto. Se houver uma, faça
backup do que precisar e remova-a:

```bash
npx supabase stop --no-backup   # ⚠️ apaga o banco local DESTE projeto
```

e apague a pasta antiga do projeto. Não é preciso desinstalar Node, Git ou Docker.

## Etapa 1 — Pré-requisitos

| # | Verificação | Comando | Esperado |
| --- | --- | --- | --- |
| 1.1 | Git instalado | `git --version` | `git version 2.x` |
| 1.2 | Node.js compatível | `node --version` | `v24.x` (mínimo `v22.12`) |
| 1.3 | npm | `npm --version` | `10.x` ou superior |
| 1.4 | Docker em execução | `docker info` | mostra `Server Version` |
| 1.5 | Espaço em disco | Explorador / `df -h` | ≥ 10 GB livres |
| 1.6 | Portas livres | `docker ps` | nada usando 55321–55324 e 3000 |

Instalação das ferramentas: [README, seção 2](../../README.md#2-instalar-as-ferramentas).

## Etapa 2 — Obter o código

```bash
git clone <endereço-fornecido-pelo-instrutor> sistema-chamados-manutencao
cd sistema-chamados-manutencao
git log -1 --oneline          # registre o commit instalado
```

(Ou extraia o .zip em uma pasta sem espaços/acentos.)

## Etapa 3 — Dependências

```bash
npm ci
```

Esperado: termina sem `ERR!`. Avisos (`warn`) não impedem a instalação. Registre o tempo gasto.

## Etapa 4 — Serviços, banco e configuração

```bash
npm run setup:local
```

| O script mostra | Significado |
| --- | --- |
| `[ok] Node.js ...`, `[ok] Docker ... em execução` | Pré-requisitos confirmados. |
| `Supabase local iniciado` | Contêineres criados; **na 1ª vez** migrações + seed aplicados. |
| `Migrações conferidas` | Migrações pendentes aplicadas sem apagar dados. |
| `.env.local criado` / `já está correto` | Parâmetros da aplicação configurados. |
| Endereços e usuários | Próximos passos. |

Conferências manuais (registre as saídas):

```bash
npx supabase status -o env          # endereços e chaves locais (NÃO copie chaves secretas para documentos)
npx supabase migration list --local # migrações aplicadas
git check-ignore -v .env.local      # confirma que o .env.local não vai para o Git
```

Alternativa manual ao `setup:local`: `npm run db:start`, depois crie o `.env.local` como no
[README, seção 5](../../README.md#criar-o-envlocal-manualmente-se-preferir-ou-se-o-script-não-conseguir).

## Etapa 5 — Aplicação

```bash
npm run dev
```

Esperado: `Ready` e o endereço `http://localhost:3000`. Mantenha esse terminal aberto. Para a versão
de produção (mais rápida, como em um servidor): `npm run build` e depois `npm run start`.

## Etapa 6 — Validação pós-instalação

### Testes de fumaça

| # | Ação | Resultado esperado |
| --- | --- | --- |
| V1 | Abrir <http://localhost:3000/api/saude> | `{"aplicacao":"ok","banco":"ok",...}` |
| V2 | Abrir <http://localhost:3000> | Redireciona para **Entrar**. |
| V3 | Entrar como `tecnico1@example.com` / `Senha@123` | Painel: 13 equipamentos, 9 chamados em andamento, 5 ordens em andamento. |
| V4 | Abrir **Chamados** | Lista com 14 chamados. |
| V5 | Sair e entrar como `solicitante1@example.com` | Só os chamados de Daniela Souza; sem menus Ordens/Usuários. |
| V6 | Cadastrar nova conta e confirmar no Mailpit (<http://127.0.0.1:55324>) | Entra como Solicitante. |
| V7 | Abrir o Studio (<http://127.0.0.1:55323>) | Tabelas `equipamentos`, `chamados`, `ordens_manutencao`, `eventos` visíveis. |

### Suítes automatizadas

```bash
npm run lint
npm run typecheck
npm test
npm run db:test
npm run test:integration
npx playwright install chromium   # só na primeira vez
npm run db:reset                  # parte de dados conhecidos
npm run test:e2e
```

Todas devem terminar sem falhas. Guarde as saídas (copie o texto do terminal para um arquivo).

### Critério de aceite da implantação

A implantação é considerada **validada** quando V1–V7 passam e todas as suítes automatizadas passam.
Registre no termo de validação (seção final do checklist) quem validou, quando e com quais evidências.

## Etapa 7 — Encerrar e retomar

| Ação | Comando |
| --- | --- |
| Parar a aplicação | `Ctrl + C` no terminal do `npm run dev` |
| Parar o Supabase mantendo os dados | `npm run db:stop` |
| Retomar | `npm run setup:local` (ou `npm run db:start`) e `npm run dev` |

## Recuperação de falhas

| Etapa | Falha | Recuperação |
| --- | --- | --- |
| 3 | `npm ci` com erro de rede | Verifique a internet/proxy e repita. |
| 3 | `npm ci` com `EBADENGINE` | Atualize o Node.js para 24 LTS, abra novo terminal, repita. |
| 4 | Docker não responde | Abra o Docker Desktop, aguarde "Engine running", repita. |
| 4 | Porta ocupada (`port is already allocated`) | `docker ps` para achar o contêiner; pare o outro projeto; `npm run db:stop`; repita. |
| 4 | Contêiner reiniciando / sem memória | Feche programas; aumente a memória do Docker; `npm run db:stop` e repita. |
| 4 | Migração falhou | Leia o erro; `npm run db:reset` recria o banco do zero (apaga dados locais). |
| 5 | "Configuração pendente" | `.env.local` ausente: `npm run setup:local` e reinicie o `npm run dev`. |
| 6 | V1 com `"banco":"erro"` | `npm run db:status`; confira URL e chave do `.env.local`. |
| 6 | V3 com login recusado | `npm run db:reset` para recriar os usuários do seed. |
| Qualquer | Estado irrecuperável | Backup (se necessário), `npx supabase stop --no-backup` ⚠️, `npm run setup:local`. |

Mais mensagens de erro: [README, seção 11](../../README.md#11-solução-de-problemas).
