# 04 — Rubricas de avaliação

> **RESERVADO AO INSTRUTOR** — não distribuir aos estudantes (os critérios gerais estão em `docs/aluno/09-criterios-de-avaliacao.md`).

Organização conforme o MSEP: critérios **específicos por tarefa**, **dicotômicos** (atende/não atende) ou
**graduais** (níveis de desempenho), permitindo concluir se cada **capacidade** foi desenvolvida. Escala
gradual do projeto integrado: **0** não evidenciado · **1** com apoio intenso/falhas relevantes ·
**2** parcial, com correções · **3** autônomo, conforme os critérios. As capacidades são as do plano de
ensino; nenhuma capacidade nova foi criada. Pesos: AA1 = 30% e AA2 = 60% de cada SA, conforme o plano
(os 10% restantes não estão definidos no plano — ver divergência D2).

## Diagnóstico inicial (encontro 1 — sem nota)

Questionário curto + microdesafio: ler RN-CH-04 e RN-CH-05, propor um caso de teste para cada uma e
analisar uma evidência (captura do erro "Atribua um técnico..."). Registrar por estudante:
☐ identifica o resultado esperado · ☐ propõe dado/condição de teste · ☐ distingue esperado × obtido ·
☐ conhece comandos básicos de terminal/Git. Usar para planejar retomadas.

## SA 1 — Teste de Sistemas

### AA1 (enc. 3, 30%) — análise de documentação e planejamento

| Capacidade | Critério (tarefa: matriz de rastreabilidade v1 + estratégia) | Tipo | 0–3 |
| --- | --- | --- | --- |
| Analisar documentação de teste para planejamento da rotina | Matriz cobre ≥ 80% dos RF/RN com módulo/tela correto | Gradual | |
| | Aponta ao menos 2 ambiguidades ou riscos reais dos requisitos | Gradual | |
| | Estratégia define níveis e tipos de teste adequados ao sistema | Gradual | |
| Integrar princípios da qualidade | Usa os IDs da especificação de forma consistente | Dicotômico | ☐ |

### AA2 (enc. 5, 60%) — casos, execução e evidências

| Capacidade | Critério (tarefa: casos + execução de um lote) | Tipo | 0–3 |
| --- | --- | --- | --- |
| Identificar problemas por meio de aplicação de teste | Casos com pré-condição, passos e resultado esperado verificável | Gradual | |
| | Aplica ao menos 3 técnicas (valor-limite, transição de estados, por papel...) | Gradual | |
| Avaliar resultado obtido no teste | Registra esperado × obtido e situação corretamente | Gradual | |
| Empregar ferramenta de documentação de teste | Evidência rastreável (nome, URL/usuário, data, commit) | Gradual | |
| | Executou e registrou as suítes automatizadas | Dicotômico | ☐ |

### Avaliação objetiva (enc. 7)

Itens contextualizados (sugestões, use o sistema como cenário): identificar o tipo/nível de teste de uma
situação; escolher valores-limite para o título (5–120); apontar a transição inválida em uma lista;
classificar a severidade de uma falha descrita; reconhecer uma evidência adequada; relacionar requisito a caso.
Correção dicotômica por item.

### Avaliação prática (enc. 8)

Tarefa: executar 5 casos sorteados do [gabarito](02-gabarito-casos-de-teste.md) (ex.: G-21, G-28, G-30, G-42, G-51),
registrar evidências, classificar uma falha (pode ser um achado A1–A8) e emitir recomendação de liberação.

| Dimensão | Evidência de domínio (nível 3) | 0–3 |
| --- | --- | --- |
| Planejamento e interpretação | Interpreta os requisitos dos casos sorteados sem apoio | |
| Execução técnica | Prepara o ambiente (`db:reset`) e executa os passos fielmente | |
| Qualidade e validação | Compara esperado × obtido corretamente nos 5 casos | |
| Registro e documentação | Evidências completas e rastreáveis | |
| Decisão e resolução | Severidade/encaminhamento justificados; recomendação coerente | |
| Organização e colaboração | Cumpre tempo e papel; comunica com clareza | |

**Capacidade desenvolvida** quando nenhuma dimensão fica em 0 e a média ≥ 2 (sugestão; ajuste ao critério da unidade).

## SA 2 — Implantação de Sistemas

### AA1 (enc. 10, 30%) — métodos, cronograma e infraestrutura

| Capacidade | Critério | Tipo | 0–3 |
| --- | --- | --- | --- |
| Identificar métodos para implantação | Compara ≥ 2 métodos e justifica a escolha | Gradual | |
| Definir cronograma de implantação | Etapas, tempos, responsáveis e dependências | Gradual | |
| Identificar infraestrutura necessária | Lista hardware, SO, softwares/versões, portas e riscos | Gradual | |

Objetiva (enc. 10): ordenar etapas de implantação; identificar dependência faltante; escolher onde colocar
cada variável/chave (publicável × secreta); interpretar mensagem de erro de porta ocupada.

### AA2 (enc. 11, 60%) — configuração, segurança e migração

| Capacidade | Critério | Tipo | 0–3 |
| --- | --- | --- | --- |
| Aplicar configurações dos serviços e segurança | `.env.local` correto, sem chave secreta, ignorado pelo Git | Dicotômico | ☐ |
| | Explica RLS/permissões e confere políticas no Studio | Gradual | |
| Avaliar necessidade de migração de dados | Avaliação registrada; backup e restauração executados com evidência | Gradual | |
| Identificar parâmetros a serem configurados | Tabela de parâmetros (URL, chave, portas, site_url, confirmação) | Gradual | |

### Avaliação prática (enc. 12)

Tarefa: implantação em pasta/máquina limpa seguindo o guia 05, testes de fumaça, suítes, plano de retorno e termo.

| Dimensão | Evidência de domínio | 0–3 |
| --- | --- | --- |
| Planejamento e interpretação | Segue o plano e o checklist na ordem | |
| Execução técnica | Instala e configura sem apoio; resolve 1 problema simulado (ex.: porta ocupada) | |
| Qualidade e validação | V1–V7 e suítes executados e registrados | |
| Registro e documentação | Checklist preenchido durante a execução; termo assinado | |
| Decisão e resolução | Plano de retorno executável; decisão correta diante de falha | |
| Organização e colaboração | Papéis, tempo e manual breve para o usuário | |

Sugestão de "incidente" na prática: parar o Docker no meio da validação ou ocupar a porta 55321 com outro contêiner.

## SA 3 — Manutenção de Sistemas

### AA1 (enc. 13, 30%) — triagem, interpretação e registro (OC-01)

| Capacidade | Critério | Tipo | 0–3 |
| --- | --- | --- | --- |
| Reconhecer serviços de chamados | Classifica natureza e tipo de manutenção corretamente | Dicotômico | ☐ |
| Interpretar demanda de manutenção | Reproduz as duas situações do relato com evidências | Gradual | |
| Aplicar normas no atendimento (netiqueta) | Confirmação de recebimento clara e cordial | Gradual | |
| Registrar o atendimento | Registro de atendimento completo até o diagnóstico | Gradual | |

Objetiva (enc. 13): matriz impacto × urgência; tipo de manutenção de cenários; passos de um atendimento;
o que não pode faltar no encerramento.

### AA2 (enc. 14, 60%) — procedimento de manutenção (OC-02, opcionalmente OC-03)

| Capacidade | Critério | Tipo | 0–3 |
| --- | --- | --- | --- |
| Identificar tipo, procedimento e plano de manutenção | Registro de mudança com riscos, testes e retorno | Gradual | |
| Identificar procedimento de registro de serviços | Branch, commits e (se banco) nova migração | Dicotômico | ☐ |
| Identificar métodos de correção e atualização | Corrige nas camadas necessárias (TS + banco) | Gradual | |
| Definir método adequado para correção | Trata dados legados sem inventar valores; justifica | Gradual | |

### Avaliação prática (enc. 14)

| Dimensão | Evidência de domínio | 0–3 |
| --- | --- | --- |
| Planejamento e interpretação | Diagnóstico ligado aos requisitos (RN-OM-01/03/04) | |
| Execução técnica | Correção funcional; migração aplicada com `db reset` e sobre dados existentes | |
| Qualidade e validação | Teste de regressão falha antes/passa depois; suítes completas | |
| Registro e documentação | Registros de atendimento e mudança completos | |
| Decisão e resolução | Escolha de método justificada com dados | |
| Organização e colaboração | Comunicação ao usuário e divisão de tarefas | |

## Demonstração integrada (enc. 15)

| Critério | 0–3 |
| --- | --- |
| Coerência dos artefatos (requisito → teste → implantação → manutenção) | |
| Simulação de liberação ou incidente conduzida com segurança | |
| Indicadores calculados e análise PDCA | |
| Justificativa técnica das decisões | |
| Colaboração e comunicação na apresentação | |
| Reflexão individual (crescimento profissional, lacunas, próximos passos) | |
