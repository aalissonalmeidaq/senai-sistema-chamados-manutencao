# Modelo — Plano de teste, casos, execução e relatório

**Equipe:** ______ · **Integrantes e papéis:** ______ · **Versão testada (commit):** ______ · **Data:** ___/___/2026

---

## Parte A — Plano de teste

| Item | Conteúdo |
| --- | --- |
| Objetivo | |
| Escopo — o que será testado | |
| Fora do escopo (e por quê) | |
| Níveis e tipos de teste | (funcional, integração, permissão, usabilidade/acessibilidade, regressão...) |
| Técnicas | (valor-limite, partição, transição de estados, por papel, exploratório...) |
| Ambiente | (SO, navegador, Node, Supabase local, commit) |
| Dados de teste | (usuários do seed, `npm run db:reset` antes de cada rodada, dados criados) |
| Critérios de entrada | |
| Critérios de saída / de liberação | |
| Riscos do teste e contingência | |
| Cronograma e responsáveis | |

## Parte B — Caso de teste (copie este bloco para cada caso)

| Campo | Valor |
| --- | --- |
| ID | CT-___ |
| Título | |
| Requisito(s) | (ex.: RF-08, RN-CH-02) |
| Prioridade | Alta / Média / Baixa |
| Técnica | |
| Pré-condições | (ex.: banco recriado; logado como solicitante1@example.com) |
| Dados de entrada | |

| Passo | Ação | Resultado esperado |
| --- | --- | --- |
| 1 | | |
| 2 | | |
| 3 | | |

### Registro de execução

| Execução | Data/hora | Executor | Resultado obtido | Situação | Evidência | Falha |
| --- | --- | --- | --- | --- | --- | --- |
| 1ª | | | | Passou / Falhou / Bloqueado | | FA-___ |
| Reteste | | | | | | |

## Parte C — Relatório final de testes

1. **Resumo**: o que foi testado, versão, período, equipe.
2. **Indicadores**:

| Indicador | Valor |
| --- | --- |
| Casos planejados | |
| Casos executados | |
| Passou / Falhou / Bloqueado | / / |
| Falhas por severidade (Crítica / Alta / Média / Baixa) | / / / |
| Falhas corrigidas e retestadas | |
| Suítes automatizadas (resultado) | lint · typecheck · unit · db · integração · E2E · build |

3. **Falhas abertas e riscos** (com severidade e impacto).
4. **Possíveis soluções / encaminhamentos** para cada falha aberta.
5. **Recomendação**: ☐ Liberar ☐ Liberar com ressalvas ☐ Não liberar — **justificativa com base nas evidências**.
6. **Lições aprendidas** (o que faríamos diferente).
