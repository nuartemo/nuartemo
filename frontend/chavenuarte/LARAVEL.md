# ChaveNUARTE V2.1 — adaptação frontend para Laravel

A view usada pela rota existente `/painel-chaves` foi substituída pelo ChaveNUARTE V2.1. O fluxo é **Site NUARTE → SUAP existente → `/painel-chaves` → React V2.1**. A implementação está na branch `feat/chavenuarte-v2-laravel-frontend`, partindo de `d540ccff0692e4581a00115febb160583a954d4d`. Não há troca de view pendente: ela já foi feita neste worktree. Nenhum commit, push ou deploy foi realizado.

## Inventário único e limites de integração

| Categoria | Constatação no checkout autorizado |
| --- | --- |
| Disponível no navegador | `GET /painel-chaves`, `GET /auth/suap/callback`, `GET /login`, `GET /auth/suap` e `POST /logout`, conforme condições abaixo. |
| Código sem rota | `KeyController`, `ReservationController`, `ReservationApprovalController` e `ReservationCheckoutController`. Não há registro de rota de chaves/reservas em `routes/web.php`; `bootstrap/app.php` registra apenas web, console e health. Não existe arquivo de rotas API neste checkout. |
| Incompatibilidades | A matrícula da sessão não fornece nome, ID local, cargo, suspensão ou permissões da V2. Chaves PHP não fornecem código, espaço, bloqueios e regras. Reservas PHP têm aprovação pendente/rejeitada; a V2 não representa esses dois estados. Listagem PHP de reservas é do usuário, insuficiente para disponibilidade global. |
| Dependências futuras | Identidade institucional completa, autorização no servidor, dados globais do painel e operações de chaves/reservas/equipe/regras. A equipe backend deverá definir e disponibilizar seus contratos e rotas. Nenhuma URL foi inventada. |

Os arquivos PHP de backend foram apenas lidos. A view `pages/key-panel` foi alterada e sua cópia anterior preservada em `pages/key-panel-legacy`. Controllers, models, migrations, policies, middleware, autenticação, rotas, agenda, views institucionais, `.env`, `AGENTS.md`, `boost.json` e bundles legados permanecem intactos. Não foi utilizado outro worktree. PHP/Composer foram verificados; não foram executados Composer setup, Boost ou migrations. O Vite raiz também permanece intacto.

## Contratos HTTP realmente observados

Os caminhos abaixo são os caminhos registrados; em instalações com prefixo, Laravel deve gerá-los com `route()`/`asset()`.

| Rota e método | Sessão/autenticação e entrada | Resposta / utilização |
| --- | --- | --- |
| `GET /painel-chaves` | Verifica `suap.key_panel_identifier` na sessão. Sem esse valor, inicia autorização SUAP quando habilitada; caso contrário, 404. | Com sessão, renderiza `pages.key-panel`, `Cache-Control: private, no-store`. Agora entrega a view V2.1 com manifesto e entrada `src/laravel.tsx`, preservando a verificação de sessão e os headers existentes. |
| `GET /auth/suap/callback` | `code`, `state` e sessão OAuth com prazo; valida state e PKCE no servidor. | O fluxo de painel salva apenas a identificação SUAP e redireciona ao painel. Não realiza `Auth::login`. O fluxo institucional separado pode autenticar uma conta local e redirecionar à agenda. |
| `GET /login`, `GET /auth/suap` | Middleware `guest`; SUAP habilitado. | Redirecionam ao OAuth existente. A V2 não faz OAuth no navegador nem recebe tokens. |
| `POST /logout` | Middleware `auth`, sessão e CSRF de web. | Invalida sessão e redireciona à home. Não foi conectado à V2: a sessão exclusiva do painel não implica usuário autenticado nesse guard. |

Nenhuma dessas rotas fornece JSON de identidade ou dados de chaves. Não há endpoint de dados compatível para consumir nesta entrega. A ligação reutilizada é a entrada Blade dentro do fluxo SUAP existente, com a própria view substituída sem modificar seu controller. A view publica CSRF, URLs e a identificação SUAP já existente na sessão, escapada para apresentação. Não publica tokens OAuth nem inventa nome, matrícula local ou cargo. Essa identificação não é usada para autorizar operações.

## Contratos dos controllers sem rota

**Método HTTP, URI e middleware não estão definidos para estes métodos PHP.** Os formatos abaixo foram observados no código e usados somente em simulações frontend.

| Método PHP | Entrada / resposta observada | Diferença para V2 |
| --- | --- | --- |
| `KeyController::index` | `{data: [{id, name, description}]}`, filtrado por `active=true`. | Snapshot exige código, relação com espaço, regras, bloqueio e disponibilidade global. DTO é mantido parcial. |
| `ReservationController::index` | `{data: reservas[]}` com relações `key`/`user`, limitado a `request->user()->id`. | Não é histórico/disponibilidade global; não traz a identidade/autorização do operador. |
| `ReservationController::store` | `key_id`, `starts_at` no futuro, `ends_at` posterior, `purpose` até 255 caracteres; retorna 201, `{data, message}`, status `pending`. | Retirada imediata, observações e aprovação automática da demo não correspondem ao contrato. Não se converte `pending` em `approved`. |
| `ReservationApprovalController::approve/reject` | `notes` opcional até 255; policy no código; resposta `{data, message}` com `approved`/`rejected`. | A V2 requer uma decisão funcional para solicitação pendente/rejeitada; não há fluxo HTTP disponível. |
| `ReservationCheckoutController::checkout/returnKey` | Reserva recebida pelo método PHP, `notes` opcional; policy e transição `approved → checked_out → returned`; `{data, message}` com timestamps reais. | Sem rota nem contrato completo de usuário/snapshot. `notes` é compartilhado; a V2 separa observação inicial/final e movimentos físicos. |

Não foram deduzidos fuso horário ou datas civis de uma resposta real. Os DTOs preservam as strings recebidas. O acordo futuro deve definir a conversão entre timestamps serializados e datas civis de `America/Fortaleza` usadas pela V2.

## Estrutura entregue

```text
resources/views/pages/key-panel.blade.php       view ativa da rota existente
resources/views/pages/key-panel-legacy.blade.php cópia exata para rollback
frontend/chavenuarte/
  vite.config.ts                              build normal/demo, CSS com namespace
  vite.laravel.config.ts                      entrada e saída Laravel exclusivas
  src/laravel.tsx                             montagem React institucional
  src/institutional/
    InstitutionalApp.tsx                      entrada React e seleção de estado de dados
    UnavailableDashboard.tsx                  interface V2 com dados não informados
    connection.ts                             fronteira tipada para KeyService futuro
    http.ts                                   transporte sessão/CSRF, sem endpoints
    observed-contracts.ts                     DTOs parciais dos controllers observados
    *.test.ts / *.test.tsx                     simulações explícitas de contratos
  src/panel-assets.ts                         SVG relativo ao módulo e link do painel
  scripts/build-laravel.mjs
  scripts/verify-laravel.mjs
  scripts/verify-blade.php
  scripts/preview-laravel.mjs
  scripts/compare-visual.mjs
  tests/laravel.spec.ts
public/chavenuarte-v2/                         gerado, ignorado pelo Git
  manifest.json
  assets/{laravel-*.js,Dashboard-*.js,laravel-*.css,chavenuarte-key-*.svg}
```

A view contém PHP de apresentação aceito por Blade. Lê e valida o manifesto e o grafo completo de arquivos antes de emitir CSS/JS; usa os helpers Laravel `asset()`, `route()`, `public_path()`, `csrf_token()` e `e()`. Os nomes com hash vêm do manifesto. Não usa Vite dev server, `public/hot`, Bootstrap ou layout/CSS institucional. Não contém decisão de acesso.

Manifesto ausente, inválido, caminho inseguro ou chunk/CSS/SVG ausente produzem mensagem de indisponibilidade sem executar o painel. Falha de rede no CSS/JS mostra recuperação; carregamento sem montagem tem limite de 20 segundos. Há orientação para JavaScript desativado. O servidor existente continua responsável pelo controle de acesso à view.

O CSS compilado recebe `:where(.chavenuarte-v2)` em todos os seletores, preservando especificidade e aparência; tokens são restritos à raiz marcada. Os nomes dos keyframes também recebem o prefixo `chavenuarte-`. O HTML da demo e a nova view recebem a classe. O SVG aprovado permanece idêntico; `new URL(..., import.meta.url)` resolve o ícone a partir do módulo, inclusive em `/painel-chaves/` e `/nuarte/painel-chaves`.

## Telas, fontes e fronteira de serviço

Foram preservados os componentes TSX, páginas, tipos, tokens, estilos, testes, fixtures e serviço local: visão geral, chaves/espaços, histórico, equipe, configurações, retirada, devolução, agendamento, edição, bloqueios e pessoas autorizadas; navegação desktop/mobile e temas claro/escuro.

O build Laravel inclui o Dashboard completo em chunk próprio e elimina `src/dev/`. `InstitutionalApp` pode consumir um `KeyService` real pela fronteira `connectInstitutionalPanel()`. Atualmente essa fronteira retorna explicitamente `pending`; não faz requisições, não instancia demo, não obtém cargo do DOM, URL, matrícula ou armazenamento. A identificação SUAP fornecida pela própria view é lida apenas para exibição, sem autorizar ações. Nesse estado, `InstitutionalApp` renderiza `UnavailableDashboard`: o Layout V2 real, marca, sidebar, breadcrumb, navegação inferior, temas, cards e todas as áreas navegáveis. O perfil não cria um usuário local ou snapshot. Exibe a identificação SUAP da sessão quando fornecida pela view, mantendo nome, vínculo e cargo desconhecidos (`null`). Os totais são “—”, e cada tela informa a dependência específica. Navegar para Equipe/Configurações permite ver apenas o estado indisponível, sem conceder acesso a registros ou operações. Com dados e identidade reais, a fronteira continua podendo renderizar o Dashboard completo. As operações sem backend continuam homologáveis na demo local isolada.

Contrato esperado pelo frontend, **sem propor novas URLs**:

| KeyService | Necessidade da V2 e bloqueio atual |
| --- | --- |
| `load` | `DashboardSnapshot`: data de referência, `currentUser` completo com cargo/status autoritativos, espaços, chaves, reservas, movimentos, equipe, regras globais e pendência. Nenhuma resposta acessível fornece isso. |
| `reserve`, `registerMovement`, `checkoutReservation`, `returnKey` | Validação e gravação autoritativas, timestamps reais, erros e snapshot consistente. Existem partes no PHP, sem rotas, com diferenças funcionais acima. |
| `cancelReservation`, `stageAdmin`, `undoPending` | Cancelamento, gestão de chaves, bloqueios, equipe/regras e protocolo real para pendência/desfazer. Não há contrato disponível; o backend não deve prometer o desfazer em memória da demo. |
| `subscribe`, `dispose` | Ciclo de atualizações/limpeza do serviço. Nenhum polling de API ou stream foi inventado. |

`http.ts` é transporte preparado, ainda **não conectado**: cookies `same-origin`, JSON, abort signal e `X-CSRF-TOKEN` nas mutações. Impede destino fora da origem/base da aplicação, redirecionamentos de login e HTML tratado como JSON; propaga estados 401/403/419/422/5xx. Não usa bearer token nem armazenamento de credenciais. `observed-contracts.ts` valida DTOs sem preencher campos ausentes ou fingir um `DashboardSnapshot`.

## Build e prévias reproduzíveis

Executar na raiz do repositório, com Node 22.12+ da linha 22, npm 9+ e PHP disponível:

```sh
npm --prefix frontend/chavenuarte ci --ignore-scripts
npm --prefix frontend/chavenuarte run dev                 # 127.0.0.1:5174, demo com fontes
npm --prefix frontend/chavenuarte run build:demo          # dist-demo/, somente homologação
npm --prefix frontend/chavenuarte run preview:demo        # 127.0.0.1:4175
npm --prefix frontend/chavenuarte run build               # dist/, produção independente pendente
npm --prefix frontend/chavenuarte run preview             # 127.0.0.1:4174
npm --prefix frontend/chavenuarte run build:laravel       # public/chavenuarte-v2/
npm --prefix frontend/chavenuarte run verify:laravel
npm --prefix frontend/chavenuarte run verify:blade
npm --prefix frontend/chavenuarte run preview:laravel     # 127.0.0.1:4176/painel-chaves
```

A última prévia renderiza o arquivo real da view com **helpers de apresentação simulados**. Ela não é um servidor Laravel, não autentica e não deve ser publicada. Também aceita `/nuarte/painel-chaves` para verificação de prefixos. O compilador Blade/Laravel não foi executado porque este checkout não tem `vendor/`, e a tarefa proíbe Composer setup. A view usa PHP nativo para permitir essa verificação isolada sem instalar dependências PHP.

Os scripts fixam `NODE_ENV=production` ao gerar artefatos; `envDir: false` impede carregar `.env`. A configuração Laravel recusa modo demo/serve e grava somente no diretório exclusivo. `public/chavenuarte-assets/`, `public/build/` e o Vite raiz não são sobrescritos. Empacotar o diretório Laravel inteiro com o manifesto; não copiar `dist-demo/` para a aplicação.

## Validação executada

| Verificação | Resultado |
| --- | --- |
| TypeScript | Aprovado |
| Vitest | 134 testes aprovados em 13 arquivos; inclui simulações explícitas de DTOs e HTTP, CSRF, falhas, sessão e ausência de integração |
| Build de demonstração | Aprovado, separado em `dist-demo/` |
| Build de produção independente | Aprovado, verificador de isolamento em `dist/` |
| Build Laravel + manifesto/caminhos/CSS | Aprovado, quatro assets com hash, sem demo/URLs de API inventadas |
| Renderização isolada da view ativa PHP/Blade | Aprovada com helpers simulados: manifesto válido/ausente/inválido, arquivo ausente, caminho inseguro, prefixo, CSRF, identificação de sessão escapada e SHA-256 da cópia de rollback; `php -l` aprovado |
| Playwright | 42 cenários aprovados, nenhum ignorado: 15 da entrada institucional ativa e 27 fluxos preservados |
| Comparação com V2.1 original | 60 comparações em Chrome: cinco páginas e formulário de retirada × cinco larguras × dois temas; **zero diferenças acima de 2/255 por canal** |
| `git diff --check` | Aprovado; novos arquivos também verificados quanto a whitespace |

Os testes de browser usam Chrome local em 1440, 1024, 497, 390 e 320 px e ambos os temas. A suíte existente cobre operações, agendamento/conflitos, devolução, equipe, edição, regras, confirmações e desfazer. A nova suíte navega por todas as áreas institucionais, verifica operações desabilitadas e identidade desconhecida nas cinco larguras e nos dois temas, além de assets em URL com/sem barra e subdiretório, ausência de seletor e acesso por dados manipulados, persistência visual, Axe, falhas de rede e manifesto, JavaScript desativado e CSS sem efeito fora do namespace.

As simulações não comprovam autenticação SUAP, chamadas a APIs reais, persistência, banco, autorização ou funcionamento dos controllers. A homologação real dessas integrações depende do backend. As 60 comparações não apresentaram deslocamentos ou diferenças acima de 2/255 por canal. O comparador registra também todas as diferenças brutas e seu delta máximo; pequenas variações de rasterização de 1–2/255 ocorreram em algumas capturas. Não se afirma igualdade binária dos PNGs nem cobertura de todo navegador/dispositivo físico.

Evidências locais ignoradas pelo Git: `visual-comparison/report.json`, capturas `visual-comparison/*-before.png` / `*-after.png` e capturas/rastros Playwright em `test-results/`. O baseline foi preservado em `/tmp/chavenuarte-v21-baseline-d540ccf`. Sua igualdade foi confirmada por comparação de todos os arquivos com um segundo build gerado de `git archive` do commit-base em diretório temporário, sem criar ou acessar outro worktree. Para repetir a comparação nesta máquina:

```sh
npm --prefix frontend/chavenuarte run test:visual:compare -- /tmp/chavenuarte-v21-baseline-d540ccf
```

Em outra máquina, extrair apenas `frontend/chavenuarte` do commit-base com `git archive` para um diretório temporário, instalar suas dependências npm e gerar `build:demo`; passar esse `dist-demo` como argumento. Não usar o outro worktree como referência.

## Substituição realizada e continuidade da integração

1. `resources/views/pages/key-panel.blade.php` já contém a apresentação V2, lê o manifesto e monta a entrada institucional. `SuapLoginController::keyPanel()` continua renderizando o mesmo nome de view, após a mesma verificação SUAP. Não foi criada outra rota ou página de ativação.
2. O build Laravel já foi gerado em `public/chavenuarte-v2/`. Para reproduzir, executar `build:laravel`, `verify:laravel` e `verify:blade`. Nenhum artefato demo deve ser copiado para esse diretório.
3. A interface institucional abre e navega agora. A ausência de dados não bloqueia toda a aplicação nem troca usuários por identidades demonstrativas. Só consultas/ações que dependem dos contratos ausentes ficam indisponíveis.
4. Para conectar dados reais futuramente, adaptar `connection.ts` e um `KeyService` frontend somente às rotas disponibilizadas pela equipe backend. Não converter a matrícula de sessão em cargo, nem interpretar o `pending` PHP como reserva aprovada. A autorização continua sendo do servidor.

| Área | Estado atual e operações dependentes |
| --- | --- |
| Visão geral | Totais, disponibilidade, espaços e últimas movimentações não informados; nenhum zero fictício ou medidor com valores inventados. Navegação para Chaves/Histórico funciona. |
| Chaves e espaços | Consulta/busca, retirada, devolução, agendamento, criação, edição e bloqueio dependem de dados de chaves, identidade e permissões ausentes. Controles de operação ficam desabilitados, com motivo explícito. |
| Movimentações | Não há endpoint para consultar reservas/histórico. Não se afirmam retiradas/devoluções realizadas ou sucesso de cancelamento. |
| Equipe | Não há relação de pessoas nem cargos/status autoritativos. Gestão visual permanece no fonte; a tela institucional identifica a ausência e desabilita a gestão de pessoas. |
| Configurações | Não há regras atuais nem permissão de gestão. Não são preenchidos dias/horários/limites/pessoas padrão; salvar fica desabilitado. |
| Perfil | A identificação SUAP da sessão é exibida quando disponível. Nome, matrícula local, vínculo e cargo não são presumidos. O avatar usa um ícone neutro, sem iniciais inventadas. Sidebar, tema, marca e navegação continuam funcionais. |

## Rollback

A cópia fonte `resources/views/pages/key-panel-legacy.blade.php` é idêntica, byte a byte, à view de entrada do commit-base. O verificador de view confere seu SHA-256. Está incluída entre os arquivos adicionados da entrega, sem commit automático.

Para voltar ao painel anterior, executar na raiz deste worktree:

```sh
cp resources/views/pages/key-panel-legacy.blade.php resources/views/pages/key-panel.blade.php
```

O procedimento habitual de cache de views da equipe pode ser necessário no ambiente responsável. O controller e `/painel-chaves` continuam iguais. Os quatro arquivos de `public/chavenuarte-assets/` não foram alterados. O novo diretório isolado pode permanecer sem referência. Nenhuma reversão de banco, autenticação, rotas ou backend é necessária. O rollback não foi executado nesta entrega.

## Arquivos adicionados e modificados

**Adicionados:** `resources/views/pages/key-panel-legacy.blade.php`; nesta pasta frontend: `LARAVEL.md`, `vite.laravel.config.ts`, `src/laravel.tsx`, `src/panel-assets.ts`, `src/institutional/{InstitutionalApp.tsx,InstitutionalApp.test.tsx,connection.ts,http.ts,observed-contracts.ts,contracts.test.ts,UnavailableDashboard.tsx}`, `scripts/{build-laravel.mjs,verify-laravel.mjs,verify-blade.php,preview-laravel.mjs,compare-visual.mjs}` e `tests/laravel.spec.ts`.

**Modificados:** `resources/views/pages/key-panel.blade.php`, `.gitignore` da raiz e do frontend; nesta pasta frontend: `README.md`, `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `playwright.config.ts`, `src/app/Layout.tsx`, `src/components/{Brand.tsx,Icon.tsx,Brand.test.tsx}`, `src/styles.css` e `tests/visual.spec.ts`. As mudanças nos testes visuais apenas aceitam o SVG resolvido pelo módulo. Nenhum componente de operação, página com dados, regra de permissão ou serviço de demonstração foi modificado. O Layout compartilhado passou a aceitar identidade/cargo nulos para a apresentação de dados indisponíveis, preservando o comportamento dos perfis conhecidos.
