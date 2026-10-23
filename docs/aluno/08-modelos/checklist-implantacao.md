# Modelo — Checklist de implantação, roteiro de validação e termo

**Equipe:** ______ · **Responsável pela implantação:** ______ · **Máquina:** ______ · **Data:** ___/___/2026

Marque cada item **enquanto executa**. Anote o horário e onde está a evidência.

## 1. Planejamento

| ✓ | Item | Registro |
| --- | --- | --- |
| ☐ | Método de implantação escolhido e justificado | |
| ☐ | Cronograma com etapas, tempos e responsáveis | |
| ☐ | Infraestrutura necessária listada (hardware, SO, softwares, portas) | |
| ☐ | Riscos identificados | |
| ☐ | Plano de retorno definido por etapa | |
| ☐ | Avaliação da necessidade de migração de dados registrada | |

## 2. Infraestrutura e pré-requisitos

| ✓ | Item | Valor/versão encontrado | Horário |
| --- | --- | --- | --- |
| ☐ | `git --version` | | |
| ☐ | `node --version` (24.x; mínimo 22.12) | | |
| ☐ | `npm --version` | | |
| ☐ | `docker info` responde | | |
| ☐ | RAM / disco livres | | |
| ☐ | Portas 3000 e 55321–55324 livres | | |

## 3. Instalação e configuração

| ✓ | Item | Resultado / evidência | Horário |
| --- | --- | --- | --- |
| ☐ | Código obtido; commit: `git log -1 --oneline` | | |
| ☐ | `npm ci` concluído sem erros | | |
| ☐ | `npm run setup:local` concluído | | |
| ☐ | `npx supabase --version` | | |
| ☐ | Migrações aplicadas (`npx supabase migration list --local`) | | |
| ☐ | Seed carregado (contagens conferidas) | | |
| ☐ | `.env.local` com URL e chave **publicável** (sem chave secreta) | | |
| ☐ | `.env.local` ignorado pelo Git (`git check-ignore -v .env.local`) | | |
| ☐ | Parâmetros de `supabase/config.toml` revisados (portas, site_url, confirmação de e-mail) | | |
| ☐ | Backup realizado e restauração testada | | |

## 4. Validação (testes de fumaça e suítes)

| ✓ | Verificação | Esperado | Obtido | Evidência |
| --- | --- | --- | --- | --- |
| ☐ | `/api/saude` | aplicação ok, banco ok | | |
| ☐ | Login técnico e painel | totais do seed | | |
| ☐ | Login solicitante | só os próprios chamados | | |
| ☐ | Cadastro + confirmação no Mailpit | entra como Solicitante | | |
| ☐ | Fluxo de chamado com ordem | histórico completo | | |
| ☐ | `npm run lint` / `npm run typecheck` | sem erros | | |
| ☐ | `npm test` | todos passam | | |
| ☐ | `npm run db:test` | `Result: PASS` | | |
| ☐ | `npm run test:integration` | todos passam | | |
| ☐ | `npm run test:e2e` | todos passam | | |
| ☐ | `npm run build` | build concluído | | |

## 5. Ocorrências durante a implantação

| Horário | Ocorrência | Causa | Ação tomada | Resolvida? |
| --- | --- | --- | --- | --- |
| | | | | |

## 6. Termo de validação

Declaramos que o Sistema de Chamados de Manutenção, versão (commit) `________`, foi implantado no
ambiente `________` em ___/___/2026, seguindo o procedimento estabelecido, e que as verificações acima
foram executadas com os resultados registrados.

Situação: ☐ Validado ☐ Validado com ressalvas (descrever) ☐ Não validado

Ressalvas: ____________________________________________

| Papel | Nome | Data |
| --- | --- | --- |
| Responsável pela implantação | | |
| Responsável por qualidade/documentação | | |
| Representante do "cliente" (instrutor ou outra equipe) | | |

## 7. Manual breve do usuário (anexo)

Anexe o manual de 1 a 2 páginas para o usuário final (como entrar, abrir e acompanhar chamados,
significado dos status, a quem pedir ajuda).
