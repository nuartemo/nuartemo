# Fase 2 — Entrega e validação

Implementação local na branch `feat/chavenuarte-v2-frontend`, mantendo HEAD em `4245211`. A base React da Fase 1 foi refinada sem trocar o projeto, as dependências, o Vite isolado ou a separação entre desenvolvimento e produção.

## Fluxos implementados

- Cabeçalho único com chave verde, nome, avatar neutro e contrato futuro de fotografia; sidebar expandida/compacta com preferência visual local.
- Navegação móvel inferior com Início, Chaves e Histórico; Gestão agrupa Equipe e Configurações conforme permissão, sem hambúrguer.
- Visão geral com três indicadores, alertas de atraso e últimos registros. Atalhos de retirada/devolução somente em Início e Chaves.
- Lista pesquisável com código, sala/bloco, disponibilidade atual, detalhes, regras, acesso ao histórico e agendamentos futuros separados da situação física.
- Retirada imediata com operador/matrícula do serviço, finalidade, devolução prevista, observações, resumo e horário real na confirmação.
- Agendamento futuro com datas e horários completos, resumo, validação de conflitos e retirada física separada dentro do período reservado.
- Devolução de retirada aberta com responsável, horários reais, previsão, observação final, confirmação e atualização imediata do histórico.
- Histórico com agendada, em uso, devolvida, atrasada e cancelada; intervalos sem inventar devoluções; filtros por estado, período e chave contextual.
- Equipe com busca por nome/matrícula, filtro por cargo, promoção/rebaixamento, revogação, suspensões e reativação, preservando identificadores e histórico.
- Proteção do último supervisor ativo e dos níveis superiores contra alterações por administradores; nenhuma autopromoção por operação de gestão.
- Criação, edição, bloqueio, desbloqueio e arquivamento lógico de chaves; espaços separados das chaves físicas; configurações avançadas recolhidas.
- Regras globais e específicas de dias, horários de início, duração e pessoas, com bloqueios temporários/permanentes distintos das regras de agendamento.
- Confirmação acessível e alteração administrativa pendente por 5 segundos, com Desfazer funcional. Falha de finalização restaura a visualização e informa o erro.

Todos esses fluxos usam exclusivamente o serviço demonstrativo em memória. A inscrição `Simulação · Dev` fica separada e recolhida. As matrículas `DEMO-` e identidades não representam dados institucionais. Trocar de perfil/cenário ou recarregar reinicia a simulação. Somente a preferência de sidebar persiste localmente; não interfere em permissões.

## Testes executados

| Comando / verificação | Resultado final |
| --- | --- |
| `npm run typecheck` | Passou |
| `npm test` | 81 testes passaram, em 7 arquivos |
| `npm run build` | Passou, incluindo TypeScript e verificação dos artefatos |
| `npm run test:browser` | 13 cenários passaram, em 5 projetos Playwright; nenhuma falha ou teste omitido na execução final |
| Navegador desktop | 1440 × 1050: navegação, sidebar persistida, formulários, gestão, teclado e axe |
| Navegador móvel | 497 × 900, 390 × 844 e 320 × 740: navegação inferior, formulários, gestão, teclado e axe |
| Datas em outro fuso do navegador | Projeto de 320 px executado em `Asia/Tokyo`, mantendo as operações no horário de Fortaleza |
| Acessibilidade automatizada | Axe sem violações nos escopos executados de visão geral, detalhes, equipe, formulário avançado, confirmação de retirada e bloqueio de produção |
| Teclado e movimento | Enter/Escape e retorno de foco verificados; redução de movimento confirmada |
| Regras de datas e operações | `15:99` recusado, `16:00` aceito, datas impossíveis/passadas, meia-noite, conflitos e horários reais cobertos |
| Confirmação / desfazer | Relógio simulado verifica 4999 ms, prazo de 5 segundos, finalização, desfazer e falha com restauração |
| Produção | Permanece bloqueada mesmo com tentativas de alteração por query, fragmento, storage e globais |
| Saída de produção | Manifesto e caminhos próprios, sem módulos demonstrativos, seletor, identidades `DEMO-` ou métodos administrativos |
| Git | Branch e HEAD preservados; nenhuma alteração no índice; verificações de whitespace sem falhas |

Não foram acrescentadas dependências nem refeita sua instalação: a infraestrutura da Fase 1 já estava disponível. A cobertura anterior foi mantida, com asserções de títulos e navegação adaptadas às exigências visuais desta fase e testes de regressão adicionais.

Falhas concretas encontradas durante o desenvolvimento e corrigidas: contraste de textos secundários; opacidade da transição interferindo na legibilidade; fechamento dos detalhes antes do arquivamento para não bloquear Desfazer. Também foram corrigidos seletores acessíveis e sincronização do relógio no próprio teste. As execuções finais acima passaram.

A análise axe e o Chrome local não equivalem a uma certificação completa de acessibilidade ou a testes em dispositivos físicos. Não foram executados testes de autenticação, autorização backend, banco ou SUAP real.

## Evidências de responsividade

As capturas da visão geral foram inspecionadas nas quatro larguras; também foi inspecionado o resumo de agendamento em 320 px. As demais capturas foram geradas como evidência dos testes. Os arquivos ficam em `test-results/`, ignorados pelo Git. Capturas de página inteira incluem elementos fixos na posição do viewport; a navegação inferior tem área segura e espaçamento reservado no conteúdo.

| Largura | Visão geral | Outras evidências |
| --- | --- | --- |
| 1440 px | [Visão geral](test-results/development-prévia-respons-f57f4-teclado-operações-e-estados-desktop/visao-geral.png) | [Equipe](test-results/development-prévia-respons-f57f4-teclado-operações-e-estados-desktop/equipe.png), [Agendamento](test-results/development-retirada-devol-0f380-onflito-histórico-e-filtros-desktop/agendamento.png), [Configurações](test-results/development-gestão-adminis-5e1fc-ição-confirmação-e-desfazer-desktop/configuracoes.png) |
| 497 px | [Visão geral](test-results/development-prévia-respons-f57f4-teclado-operações-e-estados-mobile-497/visao-geral.png) | [Equipe](test-results/development-prévia-respons-f57f4-teclado-operações-e-estados-mobile-497/equipe.png), [Agendamento](test-results/development-retirada-devol-0f380-onflito-histórico-e-filtros-mobile-497/agendamento.png), [Configurações](test-results/development-gestão-adminis-5e1fc-ição-confirmação-e-desfazer-mobile-497/configuracoes.png) |
| 390 px | [Visão geral](test-results/development-prévia-respons-f57f4-teclado-operações-e-estados-mobile/visao-geral.png) | [Equipe](test-results/development-prévia-respons-f57f4-teclado-operações-e-estados-mobile/equipe.png), [Agendamento](test-results/development-retirada-devol-0f380-onflito-histórico-e-filtros-mobile/agendamento.png), [Configurações](test-results/development-gestão-adminis-5e1fc-ição-confirmação-e-desfazer-mobile/configuracoes.png) |
| 320 px | [Visão geral](test-results/development-prévia-respons-f57f4-teclado-operações-e-estados-mobile-320/visao-geral.png) | [Equipe](test-results/development-prévia-respons-f57f4-teclado-operações-e-estados-mobile-320/equipe.png), [Agendamento](test-results/development-retirada-devol-0f380-onflito-histórico-e-filtros-mobile-320/agendamento.png), [Configurações](test-results/development-gestão-adminis-5e1fc-ição-confirmação-e-desfazer-mobile-320/configuracoes.png) |

## Isolamento confirmado

A comparação SHA-256 antes/depois confirmou **278 arquivos fora do frontend idênticos** ao início da Fase 2. Isso inclui backend Laravel, controllers, modelos, migrations, rotas, páginas Blade, SUAP, `public/chavenuarte-assets/`, configurações e manifests da raiz, `AGENTS.md` e `boost.json`.

`AGENTS.md` e `boost.json` já estavam modificados no Git antes desta tarefa, pela Fase 1; não foram editados nesta fase. O Git continua mostrando essas modificações anteriores e a pasta frontend ainda sem commit. Nenhuma alteração foi adicionada ao índice.

Nenhum arquivo de ambiente institucional foi acessado ou carregado. Não foram executados PHP/Composer/Boost novamente, migrations, operações de banco, acesso aos outros repositórios, HOMELAB/VPS, commit, push ou deploy. O fluxo real `/painel-chaves` permanece preservado.

SHA-256 do bundle legado, idêntico ao início desta fase:

```text
53a9db7ffa331523c2d0212c46f2dfa953b8ead6b40551db2545b2d69b95289b  public/chavenuarte-assets/assets/index-C36Vd_dx.css
a588e939141e56c502f330f5cf72df4c9a86046e219385a926a7c80e5bba73b5  public/chavenuarte-assets/assets/index-a588e939141e56c5.js
61bc9a161de58248288e6905425d7180f0624c2865007b97d763fdac12043a66  public/chavenuarte-assets/favicon.svg
b45fa506195cfcdef406ba9f0c77b36ddc1a7c224040926ec70abc2fdea7b93a  public/chavenuarte-assets/icons.svg
```

## Inventário da Fase 2

27 arquivos existentes modificados, todos em `frontend/chavenuarte/`:

```text
README.md
index.html
playwright.config.ts
scripts/verify-build.mjs
src/app/Dashboard.test.tsx
src/app/Dashboard.tsx
src/app/Layout.tsx
src/app/ProductionApp.tsx
src/components/Brand.tsx
src/components/Dialog.tsx
src/components/Icon.tsx
src/components/KeyList.tsx
src/components/MovementList.tsx
src/components/OperationDialog.tsx
src/components/States.tsx
src/components/StatusBadge.tsx
src/dev/DevelopmentApp.tsx
src/dev/demo-service.ts
src/dev/fixtures.ts
src/pages/Catalog.tsx
src/pages/Overview.tsx
src/pages/Team.tsx
src/permissions/access.ts
src/services/selectors.ts
src/styles.css
src/types/domain.ts
tests/development.spec.ts
```

15 arquivos criados, incluindo este relatório:

```text
FASE2.md
src/components/ConfirmDialog.tsx
src/components/DateTimeFields.tsx
src/components/KeyEditorDialog.tsx
src/components/KeyList.test.tsx
src/components/PendingNotice.tsx
src/components/RulesEditor.tsx
src/components/UserAvatar.tsx
src/dev/administration.test.ts
src/dev/reservations.test.ts
src/pages/History.tsx
src/pages/Settings.tsx
src/services/date-time.test.ts
src/services/date-time.ts
src/services/rules.ts
```

## Iniciar a prévia e próximo bloco

Na raiz do repositório:

```sh
npm --prefix frontend/chavenuarte run dev
```

O endereço local é impresso pelo Vite na porta 5174. Para uma instalação limpa em outro terminal, execute antes `npm --prefix frontend/chavenuarte ci --ignore-scripts`. O build continua em `frontend/chavenuarte/dist/`; `npm --prefix frontend/chavenuarte run preview` apresenta somente o estado bloqueado na porta 4174.

Aguardar homologação dos fluxos. O próximo bloco deve definir e integrar os contratos reais de identidade/fotografia, permissões, chaves, reservas, conflitos concorrentes, persistência e trilha de auditoria, com autorização e validação autoritativas no backend. Não há autenticação ou autorização institucional implementada nesta entrega.
