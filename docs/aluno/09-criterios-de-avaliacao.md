# 09 — Critérios de avaliação

Como seu trabalho será avaliado nas três situações de aprendizagem. Os critérios são comunicados **antes**
da execução para que você saiba o que é esperado. Instrumentos, pesos e datas oficiais são os do plano de
ensino e os comunicados pelo instrutor.

## Calendário de avaliações

| Enc. | Data | Momento | Foco |
| --- | --- | --- | --- |
| 1 | 05/10 | Diagnóstico inicial (sem nota) | Conhecimentos prévios: requisitos, testes, implantação, manutenção. |
| 3 | 07/10 | SA 1 — AA1 (30% da SA), objetiva e prática | Análise de documentação e planejamento de testes. |
| 5 | 13/10 | SA 1 — AA2 (60% da SA), objetiva e prática | Execução de testes, registro de evidências e análise. |
| 6 | 14/10 | SA 1 — Aferição formativa | Lista de verificação durante a execução; revisão da matriz. |
| 7 | 19/10 | SA 1 — Avaliação objetiva | Prova contextualizada sobre teste de sistemas. |
| 8 | 20/10 | SA 1 — Avaliação prática | Executar casos, registrar evidências, classificar falhas, recomendar ação. |
| 10 | 26/10 | SA 2 — AA1 (30% da SA) e avaliação objetiva | Métodos, cronograma e infraestrutura de implantação. |
| 11 | 27/10 | SA 2 — AA2 (60% da SA) | Configurações, segurança e avaliação da migração. |
| 12 | 28/10 | SA 2 — Avaliação prática | Implantação conforme roteiro, validação e plano de retorno. |
| 13 | 02/11 | SA 3 — AA1 (30% da SA) e avaliação objetiva | Triagem, interpretação e registro de chamados. |
| 14 | 03/11 | SA 3 — AA2 (60% da SA) e avaliação prática | Definição e execução do procedimento de manutenção. |
| 15 | 04/11 | Demonstração integrada e reflexão individual | Dossiê, simulação de liberação/incidente, autoavaliação. |

## Escala usada nas rubricas

| Nível | Significado |
| --- | --- |
| 3 | Realiza **com autonomia**, atendendo aos critérios. |
| 2 | Realiza **parcialmente**, com correções necessárias. |
| 1 | Realiza com **apoio intenso** ou com falhas relevantes. |
| 0 | **Não evidenciado**. |

## Dimensões avaliadas nas práticas

| Dimensão | O que demonstra domínio |
| --- | --- |
| Planejamento e interpretação | Compreende requisitos, escopo, restrições e sequência de trabalho. |
| Execução técnica | Aplica o procedimento, configura recursos e executa com segurança. |
| Qualidade e validação | Confere resultados, integridade, critérios e efeitos da mudança. |
| Registro e documentação | Mantém rastreabilidade, evidências e registros compreensíveis. |
| Decisão e resolução | Classifica falhas/demandas e justifica ações com dados. |
| Organização e colaboração | Cumpre papel, prazo, checklist, comunicação e regras do ambiente. |

## O que será observado em cada SA

### SA 1 — Teste

- A matriz liga **cada requisito** a funcionalidade, caso, resultado e evidência.
- O plano define escopo, técnicas, ambiente, dados, critérios e riscos coerentes com o sistema.
- Os casos têm pré-condições, passos e **resultado esperado verificável**.
- A execução registra **esperado × obtido** com evidência que outra pessoa consegue conferir.
- As falhas são reproduzíveis, classificadas (severidade e tipo) e têm encaminhamento.
- Reteste e regressão são registrados.
- A recomendação de liberação é **fundamentada** nas evidências.

### SA 2 — Implantação

- Método, cronograma e infraestrutura são justificados e coerentes com os requisitos.
- A instalação segue o procedimento e o checklist é preenchido durante a execução.
- Serviços e segurança estão configurados (nenhuma chave secreta exposta; `.env.local` fora do Git).
- A necessidade de migração foi avaliada e o backup/restauração foi praticado.
- A validação inclui testes de fumaça e suítes automatizadas, com resultados registrados.
- O plano de retorno é executável; o manual breve é compreensível para o usuário final.

### SA 3 — Manutenção

- A demanda é interpretada, registrada e triada (natureza, tipo, prioridade justificada).
- O diagnóstico se apoia em reprodução e evidências; a causa é identificada.
- A mudança é **controlada**: branch própria, commits claros, migração nova quando o banco muda.
- A correção é verificada por reteste, teste de regressão e suítes automatizadas.
- A comunicação com o usuário é clara e cordial; o atendimento é encerrado com registro completo.
- Indicadores são calculados e usados em uma análise de melhoria (PDCA).

### Demonstração integrada (encontro 15)

- Coerência entre os artefatos das três SAs (requisito → teste → implantação → manutenção).
- Justificativa técnica das decisões; colaboração; qualidade, organização e comunicação.
- Reflexão individual: o que aprendeu, o que faria diferente, próximos passos de formação.

## Boas práticas que contam a favor

- Entregas identificadas (equipe, data, versão/commit) e nomes de arquivos rastreáveis.
- Evidências em texto quando possível (saídas de terminal), e capturas com contexto (URL, usuário).
- Uso dos IDs da especificação em todos os documentos.
- Nenhum dado real, senha pessoal ou chave secreta nos documentos.
