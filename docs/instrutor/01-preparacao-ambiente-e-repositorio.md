# 01 — Preparação do ambiente e disponibilização do repositório

> **RESERVADO AO INSTRUTOR** — não distribuir aos estudantes.

## 1. Fontes curriculares usadas

Lidas antes da construção do sistema (pasta `Downloads/Projeto Integrado de Qualidade de Sistemas` da máquina
de preparação):

- `Plano_de_Ensino_Tecnico_Desenvolvimento_de_Sistemas - Projeto Integrado.docx` — planos de ensino das UCs
  Teste (SA 1), Implantação (SA 2) e Manutenção (SA 3), com capacidades, datas e avaliações por encontro.
- `Projeto_Integrado_Testes_Implantacao_Manutencao_Sistemas.docx` — projeto integrado (desafio, encontros,
  calendário de aferições, matriz de conhecimentos, rubrica sugerida e escala 0–3).
- MSEP (livro e guia de prática pedagógica, em PDF): orientação sobre critérios de avaliação dicotômicos ou
  graduais, específicos por tarefa, com níveis de desempenho por capacidade (usada nas rubricas).

Os objetivos das UCs, as capacidades e as datas **não foram alterados**. Os guias do estudante reproduzem as
capacidades e o calendário do plano de ensino.

## 2. Divergências e pontos de atenção registrados

| # | Ponto | Situação nos documentos | Como os materiais trataram | Decisão pendente do instrutor |
| --- | --- | --- | --- | --- |
| D1 | Carga horária das UCs | Plano de ensino: Teste 32 h, Implantação 16 h, Manutenção 12 h (total 60 h, 15 encontros). Projeto integrado: 60 h + 30 h + 30 h = 120 h; afirma que as 60 h restantes devem ser previstas pela unidade. | Materiais seguem os **15 encontros / 60 h** e as datas do plano de ensino; a carga oficial não foi reduzida nem redistribuída. | Confirmar com a coordenação como as 60 h complementares serão cumpridas. |
| D2 | Distribuição das avaliações | Projeto integrado: diagnóstico (1), formativa (6), objetiva (7), prática (8), objetiva (10), prática (12), objetiva (13), prática (14), integrada (15). Plano de ensino acrescenta **AA1 (30% da SA)** nos encontros 3, 10 e 13 e **AA2 (60% da SA)** nos encontros 5, 11 e 14. | Guias e critérios mostram **as duas** marcações. | O plano não especifica os 10% restantes de cada SA; definir e comunicar. |
| D3 | Feriados | 12/10/2026 (encontro 4) é feriado nacional (Nossa Senhora Aparecida) e 02/11/2026 (encontro 13) é Finados. | Datas mantidas como no plano. | Confirmar no calendário escolar se haverá reposição/troca de datas. |
| D4 | Capacidades da SA 2 | O plano informa 13 capacidades, mas lista 8 técnicas distintas (duas repetidas: "Identificar métodos para implantação" e "Definir cronograma de implantação do sistema") + 3 socioemocionais. | Guia usa a lista **sem duplicidade**, sem criar capacidades novas. | Conferir se falta alguma capacidade no plano. |
| D5 | Capacidades da SA 3 | O plano informa 11 capacidades; lista 8 técnicas + 3 socioemocionais (soma 11). | Mantido. | — |
| D6 | Nome do arquivo do projeto | O plano cita `..._Papel_Timbrado_SENAI.docx`; a versão disponível não tem "Papel_Timbrado" no nome. | Usada a versão disponível. | Confirmar se há versão timbrada diferente. |
| D7 | Data atual | Esta preparação foi concluída em 23/10/2026, com a SA 1 já encerrada e a SA 2 em andamento. | Materiais completos para as três SAs (reutilizáveis em outras turmas). | Decidir se a SA 2 em curso adota o sistema agora ou na próxima oferta. |

## 3. Preparação do laboratório (antes da primeira aula)

1. **Hardware**: 8 GB de RAM (16 GB recomendado), 20 GB livres, virtualização ativa na BIOS/UEFI.
2. **Software**: Git, Node.js 24 LTS, Docker Desktop (WSL 2 no Windows) e VS Code. Confirme com a TI a
   licença do Docker Desktop adequada à instituição (ou use outro runtime compatível com Docker).
3. **Imagens Docker** (~3 GB): o primeiro `npm run setup:local` baixa as imagens. Em laboratório com internet
   limitada, prepare uma máquina e exporte as imagens:

   ```bash
   docker images --format "{{.Repository}}:{{.Tag}}" | grep supabase > imagens.txt
   docker save $(cat imagens.txt) -o supabase-imagens.tar      # copie para as demais máquinas
   docker load -i supabase-imagens.tar                          # em cada máquina
   ```

4. **Pacotes npm**: `npm ci` precisa de internet na primeira vez (ou de um cache/espelho local).
5. **Navegador dos testes E2E**: `npx playwright install chromium` (~120 MB).
6. Faça um ensaio completo em uma máquina do laboratório seguindo o README do pacote do estudante.

## 4. Disponibilização do código aos estudantes

1. Gere o pacote ([06 — Pacote do estudante](06-pacote-do-estudante.md)): `npm run student:export`.
2. Escolha **uma** forma de entrega:
   - **Repositório por equipe** (recomendado para a SA 3, que exige Git): crie um repositório **privado** por
     equipe a partir da pasta exportada (`git remote add origin <url>` e `git push -u origin main` dentro da
     pasta exportada) e dê acesso à equipe;
   - **Arquivo .zip** da pasta exportada, publicado no ambiente virtual da turma.
3. Nunca compartilhe este repositório do instrutor, nem as branches `referencia/*`.

## 5. Antes de cada SA

| SA | Preparação |
| --- | --- |
| SA 1 | Entregar o pacote da `main` (ou da tag `v1.0-base`, sem a exportação CSV). Os estudantes testam a versão estável (achados possíveis no [gabarito](02-gabarito-casos-de-teste.md#4-achados-possíveis-na-versão-estável)). |
| SA 2 | Os estudantes reinstalam do zero (máquina limpa ou pasta nova) seguindo o guia 05. Opcional: demonstração remota pelo instrutor (guia 07). |
| SA 3 | Entregar uma ocorrência por vez ([03 — Ocorrências](03-ocorrencias-controladas.md)). |

## 6. Credenciais e segurança

- As senhas do seed (`Senha@123`) são públicas e existem só nos bancos locais.
- Para demonstração remota, crie projeto Supabase e Vercel **didáticos**, sem o seed, com senhas próprias;
  remova-os ao final do período.
- A chave secreta do Supabase nunca é necessária para a aplicação.
