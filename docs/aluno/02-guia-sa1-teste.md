# 02 — Guia da SA 1: Verificação e qualidade (Teste de Sistemas)

**Período:** encontros 1 a 8 — 05/10 a 20/10/2026 · **Estratégia:** projeto

## Desafio

Planejar e executar a verificação do Sistema de Chamados de Manutenção. A equipe deve analisar a
documentação, organizar a rotina e os casos de teste, preparar o ambiente, executar os testes, registrar
evidências, avaliar os resultados e classificar as falhas. Ao final, apresentar uma **síntese técnica**
que indique as correções necessárias e fundamente uma **recomendação sobre a liberação** do sistema.

## Capacidades trabalhadas

- Analisar documentação de teste para planejamento da rotina.
- Identificar problemas de sistemas por meio de aplicação de teste.
- Avaliar resultado obtido no teste.
- Identificar possível solução para correção de falhas de acordo com a metodologia de teste.
- Empregar ferramenta de documentação de teste para registro do resultado obtido.
- Socioemocionais: integrar princípios da qualidade; tomar decisões no planejamento e na resolução de
  problemas; avaliar oportunidades de crescimento profissional.

## Papéis na equipe (revezar entre as SAs)

Analista de testes · Responsável pela implantação · Responsável por suporte/manutenção ·
Responsável por qualidade/documentação. Na SA 1, todos testam; o papel define quem **consolida** cada entrega.

## Cronograma

| Enc. | Data | Atividade com o sistema | Evidência / entrega |
| --- | --- | --- | --- |
| 1 | 05/10 | Abertura do desafio. Instalar e explorar o sistema com os três papéis. **Diagnóstico inicial.** | Mapa do sistema (telas, papéis, fluxos), requisitos iniciais e riscos. |
| 2 | 06/10 | Fundamentos de qualidade; tipos, níveis e objetivos de teste. Ler a especificação de requisitos. | Glossário aplicado e estratégia inicial de teste. |
| 3 | 07/10 | Análise documental e rastreabilidade requisito × funcionalidade × teste. **AA1** (30% da SA). | Matriz de rastreabilidade (versão 1). |
| 4 | 12/10 | Plano de teste: escopo, prioridades, dados, cronograma, riscos, ambiente. | Plano de teste. |
| 5 | 13/10 | Casos de teste, técnicas e configuração do ambiente de teste. **AA2** (60% da SA). | Casos com passos e resultados esperados; registros de execução iniciais. |
| 6 | 14/10 | Execução funcional e de integração; comparação esperado × obtido. **Aferição formativa.** | Registros de execução e evidências. |
| 7 | 19/10 | Regressão, testes exploratórios, classificação de falhas. **Avaliação objetiva.** | Relatório de falhas e impacto. |
| 8 | 20/10 | Reteste, ações corretivas e recomendação de liberação. **Avaliação prática.** | Relatório final de testes. |

> As datas e avaliações seguem o plano de ensino da turma. Se o instrutor ajustar o calendário, vale o
> comunicado em aula.

## Roteiro

### 1. Análise da documentação (enc. 1 a 3)

1. Leia a [Especificação de requisitos](00-especificacao-de-requisitos.md) e o [Guia de uso](01-guia-de-uso.md).
2. Prepare o ambiente ([README](../../README.md), seções 4 a 8) e entre com cada papel.
3. Monte o **mapa do sistema**: telas, quem acessa, entradas, saídas e estados.
4. Para cada requisito, pergunte: *está claro? é testável? qual o resultado esperado? há ambiguidade?*
   Registre dúvidas e riscos (ex.: "o que acontece se dois técnicos alterarem o mesmo chamado?").
5. Preencha a [matriz de rastreabilidade](08-modelos/matriz-rastreabilidade.csv): requisito → funcionalidade
   (tela/módulo) → caso(s) de teste → resultado → evidência.

### 2. Plano de teste (enc. 4)

Use o modelo do [caso de teste](08-modelos/caso-de-teste.md) e inclua no plano:

- **Objetivo e escopo**: o que será e o que **não** será testado (ex.: desempenho com milhares de registros fica fora).
- **Itens e prioridades**: comece pelos riscos maiores (permissões, transições de status, integridade dos dados).
- **Níveis e tipos**: funcional, integração (aplicação ↔ banco), segurança/permissão, usabilidade/acessibilidade, regressão.
- **Técnicas**: partição de equivalência e valor-limite (campos), tabela de decisão e **transição de estados**
  (status de chamado e ordem), teste por papel (solicitante × técnico × administrador), exploratório.
- **Ambiente e dados**: Supabase local, usuários do seed, `npm run db:reset` antes de cada rodada.
- **Critérios de entrada e saída**: ex.: "todos os casos de prioridade alta executados e nenhuma falha crítica aberta".
- **Cronograma, responsáveis e riscos do teste**.

### 3. Casos de teste (enc. 5)

Cada caso tem: identificador, requisito(s), pré-condições, dados, passos, **resultado esperado**.
Áreas que devem aparecer no conjunto de casos (escolha e detalhe os seus):

- validação dos formulários (limites de tamanho, campos obrigatórios, formato do código);
- cada transição de status permitida **e** exemplos de transições proibidas;
- observações obrigatórias;
- o que cada papel pode e não pode ver e fazer;
- efeitos automáticos (estado do equipamento, datas, histórico);
- filtros e buscas (incluindo períodos e listas vazias);
- mensagens de carregamento, vazio, erro e sucesso; navegação por teclado.

### 4. Preparação do ambiente e execução (enc. 5 e 6)

1. `npm run db:reset` para partir dos dados conhecidos. Anote data/hora e o commit (`git log -1 --oneline`).
2. Execute os casos na ordem planejada. Para cada um, registre **resultado obtido**, **situação**
   (Passou / Falhou / Bloqueado / Não executado) e a **evidência**.
3. Rode também as suítes automatizadas e guarde a saída ([Guia de testes](06-guia-de-testes.md)).

**Evidência boa** = alguém de fora consegue verificar o que aconteceu: captura de tela inteira com URL e
usuário visíveis, saída do terminal em texto, consulta no Studio. Nomeie arquivos como
`CT-012_passo3_2026-10-14.png`.

### 5. Falhas: registro e classificação (enc. 6 e 7)

Use o [modelo de registro de falha](08-modelos/registro-de-falha.md). Uma falha por registro, com passos
para reproduzir, esperado × obtido e evidência.

| Severidade | Quando usar |
| --- | --- |
| Crítica | Perda/corrupção de dados, falha de segurança (acesso indevido) ou fluxo principal impossível. |
| Alta | Regra de negócio descumprida ou funcionalidade importante errada, sem alternativa razoável. |
| Média | Funciona com contorno ou erro em fluxo secundário. |
| Baixa | Problema visual, de texto ou de usabilidade sem impacto no resultado. |

Classifique também o **tipo** (funcional, validação, permissão/segurança, dados/integridade,
usabilidade/acessibilidade, documentação) e proponha uma **possível solução** ou encaminhamento.

### 6. Regressão, reteste e relatório (enc. 7 e 8)

- **Reteste**: execute de novo o caso que falhou, depois da correção, e registre o novo resultado.
- **Regressão**: repita os casos ao redor da área corrigida e as suítes automatizadas.
- **Relatório final**: resumo do que foi testado, indicadores (casos planejados, executados, aprovados,
  falhas por severidade), falhas abertas, riscos e a **recomendação**:
  - **Liberar**: critérios de saída atendidos;
  - **Liberar com ressalvas**: só falhas de baixa/média severidade, com plano de correção;
  - **Não liberar**: falha crítica ou alta sem correção.

## Entregas da SA 1

| Entrega | Modelo |
| --- | --- |
| Mapa do sistema, requisitos iniciais e riscos | livre (texto ou diagrama) |
| Matriz de rastreabilidade | [matriz-rastreabilidade.csv](08-modelos/matriz-rastreabilidade.csv) |
| Plano de teste | [caso-de-teste.md](08-modelos/caso-de-teste.md) (seção "Plano") |
| Casos de teste e registros de execução | [caso-de-teste.md](08-modelos/caso-de-teste.md) |
| Registros de falha | [registro-de-falha.md](08-modelos/registro-de-falha.md) |
| Relatório final com recomendação | [caso-de-teste.md](08-modelos/caso-de-teste.md) (seção "Relatório") |

Critérios de avaliação: [09 — Critérios de avaliação](09-criterios-de-avaliacao.md).
