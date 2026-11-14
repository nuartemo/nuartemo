NUARTEMO — migração institucional Blade: implementação e testes

1. Ambiente, branch e base

Execução exclusivamente no Ubuntu local, hostname `lain`, usuário `lain`, diretório `/home/lain/Documents/Github/nuartemo-blade-work`.

Branch: `feat/institutional-blade-migration`.
HEAD base e final: `2ca53d03933d70b7e947ee5fedff9b7dba6bd131`.
Origin: `https://github.com/nuartemo/nuartemo.git`.
Estado inicial: árvore limpa, sem alterações preexistentes. Nenhuma troca de branch ou criação de worktree/workspace.

O bootstrap obrigatório do `AGENTS.md` instalou PHP 8.5.12 e Composer 2.8.12 no usuário local. O instalador acrescentou o PATH em `~/.bashrc`; reiniciar o terminal atualiza o PATH. O Boost 2.10.4 já estava no lockfile: foram instaladas as dependências travadas, com scripts automáticos desativados, e executado `boost:install --guidelines --no-interaction`. O `AGENTS.md` foi regenerado e relido. `composer.json`, `composer.lock`, `CLAUDE.md` e `boost.json` permaneceram iguais à base. Nenhuma dependência foi acrescentada ou atualizada.

2. Arquivos modificados e criados

Modificados: `AGENTS.md`, `routes/web.php`, `tests/Feature/PublicPagesTest.php` e estas 14 views em `resources/views/pages/`:

```text
home.blade.php
about.blade.php
artevivencias.blade.php
a_cicuta.blade.php
andaluz.blade.php
banda_descendentes.blade.php
banda_sn.blade.php
clube_de_escrita.blade.php
clube_do_livro.blade.php
flauteando.blade.php
nuav.blade.php
passocompasso.blade.php
rabisco.blade.php
thank_you.blade.php
```

Criados: este relatório, `resources/views/layouts/institutional.blade.php` e os dez partials listados no item 4. Total: 17 arquivos rastreados modificados e 12 arquivos novos, sem staging.

3. Mapa completo de URLs

Todos os redirecionamentos abaixo retornam **302**. Nenhum 301 foi introduzido.

| URL antiga | URL canônica | Nome da rota |
| --- | --- | --- |
| `/` (preservada) | `/` | `home` |
| `/index.html` | `/` | `home` |
| `/about.html` | `/sobre` | `about` |
| `/artevivencias.html` | `/artevivencias` | `artevivencias` |
| `/a_cicuta.html` | `/projetos/a-cicuta` | `a_cicuta` |
| `/andaluz.html` | `/projetos/andaluz` | `andaluz` |
| `/banda_descendentes.html` | `/projetos/banda-descendentes` | `banda_descendentes` |
| `/banda_sn.html` | `/projetos/banda-sn` | `banda_sn` |
| `/clube_de_escrita.html` | `/projetos/clube-de-escrita` | `clube_de_escrita` |
| `/clube_do_livro.html` | `/projetos/clube-do-livro` | `clube_do_livro` |
| `/flauteando.html` | `/projetos/flauteando` | `flauteando` |
| `/nuav.html` | `/projetos/nuav` | `nuav` |
| `/passocompasso.html` | `/projetos/passocompasso` | `passocompasso` |
| `/rabisco.html` | `/projetos/rabisco` | `rabisco` |
| `/thank_you.html` | `/mensagem-enviada` | `thank_you` |
| `/eventos.php` | `/eventos` | `events.public` |
| `/eventos2.php` | `/admin/eventos` | `admin.events.index` |
| `/login.php` | `/login` | `login` |
| `/listar_evento.php` | `/eventos/feed` | `events.feed` |

Permaneceram iguais à base as 11 rotas que atendem `/eventos`, `/eventos/feed`, `/admin/eventos` e suas ações de recurso, `/painel-chaves`, `/login`, `/auth/suap`, `/auth/suap/callback` e `/logout`: mesmos métodos HTTP, nomes, controllers e middlewares. Evidência: [comparação das rotas protegidas](/tmp/nuartemo-blade-checkpoint/protected-routes.json).

4. Estrutura final de layouts e partials

```text
resources/views/
├── layouts/
│   ├── application.blade.php       (administrativo existente, intacto)
│   └── institutional.blade.php     (novo layout institucional)
├── institutional/partials/
│   ├── head.blade.php
│   ├── header.blade.php
│   ├── navigation.blade.php
│   ├── key-panel-entry.blade.php
│   ├── preloader.blade.php
│   ├── footer.blade.php
│   ├── scripts.blade.php
│   ├── symbols.blade.php
│   ├── symbols-home.blade.php
│   └── symbols-collective.blade.php
└── pages/                          (conteúdo específico das 14 páginas)
```

As páginas usam `@extends`, seções de conteúdo/SVGs/estilos, `@yield` e `@include`. O header mantém a estrutura desktop/mobile e o offcanvas originais. As variantes dos SVGs foram preservadas; o botão animado de chaves continua apenas na homepage, como na base. Banners, textos, galerias e os IDs individuais do LightWidget permanecem no conteúdo de cada página.

`thank_you` compartilha apenas a estrutura documental e o head; mantém `body.main-tx`, sem navegação, rodapé, SVGs ou scripts que não existiam na original. A diferença de metadado mobile da página Sobre foi preservada.

Links institucionais usam `route()` e assets locais usam `asset()`, incluindo o background inline da homepage. Links externos, âncoras como `#scroll` e dependências externas foram preservados. O campo oculto `redirectTo` do formulário Sobre passou de `localhost/Projeto/thank_you.html` para `route('thank_you')`; endpoint e demais campos continuam iguais. A referência `images/carousel/nua-01.jpg` foi corrigida para o arquivo existente `nua-01.JPG`, sem modificar a imagem.

5. Evidências de preservação visual

Homepage e Andaluz foram migradas primeiro. A comparação estrutural do piloto e seis pares de capturas desktop/mobile/menu aberto ficaram idênticos antes da migração das demais páginas.

Na versão final, foram comparadas as 14 páginas com a base, normalizando URLs e espaços de formatação, mais as duas correções de URL descritas acima. A sequência de tags, atributos visuais, textos e SVGs permaneceu equivalente em todas as páginas. Evidência: [comparação estrutural](/tmp/nuartemo-blade-checkpoint/final-fixed-rendered-expected-structure.json).

Foram produzidas 56 capturas de página e 26 de menu aberto, em Chrome 157, com viewports de 1440 × 1000 e 390 × 844. Das **41 comparações de pares**, **39 apresentaram zero pixels diferentes**. As duas diferenças correspondem exclusivamente à imagem restaurada do NUAV: retângulo de 270 × 360 pixels dentro do primeiro slide, tanto no desktop quanto no mobile, com dimensões totais das páginas iguais às da base. Evidência: [diferenças visuais](/tmp/nuartemo-blade-checkpoint/final-visual-diff.json).

Capturas para revisão:

- [Homepage desktop](/tmp/nuartemo-blade-checkpoint/final-fixed-rendered-screenshots/home-desktop-current.png)
- [Homepage mobile](/tmp/nuartemo-blade-checkpoint/final-fixed-rendered-screenshots/home-mobile-current.png)
- [Andaluz mobile](/tmp/nuartemo-blade-checkpoint/final-fixed-rendered-screenshots/andaluz-mobile-current.png)
- [Menu mobile aberto](/tmp/nuartemo-blade-checkpoint/final-fixed-rendered-screenshots/home-mobile-current-menu.png)
- [Diferença do NUAV](/tmp/nuartemo-blade-checkpoint/final-fixed-rendered-screenshots/nuav-desktop-diff.png)

As capturas usam HTML renderizado pelo Laravel isolado, servido por um servidor local de artefatos. As rotas HTTP foram verificadas separadamente pelo PHPUnit. CSS, JavaScript e fontes originais foram carregados; as respostas externas foram reutilizadas entre as versões. LightWidget e VLibras receberam respostas controladas exclusivamente no teste visual, e animações/transições foram congeladas exclusivamente para as capturas. A comparação não atesta a execução real desses serviços nem o timing das animações.

6. Testes executados e resultados

O `compose.yaml`, o Dockerfile e o entrypoint foram inspecionados antes de iniciar containers. O entrypoint existente executa migrations automaticamente, portanto o Compose de produção não foi iniciado.

Os testes Laravel utilizaram a imagem local `python:3.13-slim` com o PHP estático instalado, containers `--rm`, `--network none`, filesystem somente leitura, usuário 1000:1000, capabilities removidas, repositório montado somente para leitura e caches/storage em tmpfs. Banco `sqlite` em `:memory:`, sessão/cache em arrays e chave fictícia de teste. O `.env` institucional não foi utilizado; não há `.env` neste diretório. Nenhum volume, banco ou credencial de produção foi usado. Os containers foram removidos ao terminar.

| Verificação | Resultado |
| --- | --- |
| Referência, antes das alterações | PASS — 15 testes Feature, 104 asserções |
| `AuthenticationTest` preservado | PASS — 1 teste, 3 asserções |
| `EventManagementTest` preservado | PASS — 4 testes, 34 asserções |
| `LegacyDatabaseMigrationTest` preservado | PASS — 1 teste, 2 asserções |
| `SuapLoginTest` preservado | PASS — 6 testes, 47 asserções |
| `PublicPagesTest` ampliado | PASS — 66 testes, 1.168 asserções |
| Suíte Feature completa, com rotas e views compiladas | **PASS — 78 testes, 1.254 asserções**, sem warnings ou skips |
| `php artisan view:cache --no-interaction` | PASS |
| `php artisan route:cache --no-interaction` | PASS |
| `php artisan route:list --except-vendor --json --no-interaction` | PASS |
| Comparação das 11 rotas protegidas com a base | PASS |
| 14 URLs canônicas e 18 redirects 302 | PASS |
| Navegação e rodapés, links internos sem `.html`/`.php` | PASS |
| Assets locais absolutos e capitalização dos arquivos | PASS |
| Navegação por clique no Chrome | PASS — 28 verificações |
| Offcanvas e dropdown mobile | PASS — 13 páginas em cada verificação |
| Imagens no navegador | PASS — 230 verificações, nenhuma imagem quebrada na versão migrada |
| Erros de JS e HTTP na versão migrada durante os testes de navegador | Nenhuma falha registrada |
| Comparação de capturas | 39 pares idênticos; 2 diferenças esperadas, restritas à imagem corrigida do NUAV |
| `vendor/bin/pint --dirty --format agent` | PASS |
| `git diff --check` e whitespace dos arquivos novos | PASS |

O teste de links legados também cobre os atributos `src` e `value`, incluindo o destino oculto do formulário. O teste de `thank_you` verifica a apresentação isolada. O teste da homepage cobre cards, âncora e entrada de chaves; o de Andaluz verifica banner, breadcrumb, galeria e URLs das integrações.

Logs: [suíte final](/tmp/nuartemo-blade-checkpoint/final-tests.log), [JUnit](/tmp/nuartemo-blade-checkpoint/final-tests.xml), [rotas](/tmp/nuartemo-blade-checkpoint/routes.log), [navegador](/tmp/nuartemo-blade-checkpoint/final-fixed-rendered-browser.json), [resumo do navegador](/tmp/nuartemo-blade-checkpoint/browser-summary.json).

Comando da suíte final, executado pelo runner descartável preservado em `/tmp/nuartemo-blade-checkpoint`:

```sh
python3 /tmp/nuartemo-blade-checkpoint/run-isolated.py final-tests.log /bin/sh -c 'php artisan view:cache --no-interaction && php artisan route:cache --no-interaction && php vendor/bin/phpunit tests/Feature --do-not-cache-result --log-junit /evidence/final-tests.xml'
```

Os artefatos de testes estão em `/tmp` e podem ser removidos pelo sistema; não foram adicionados ao Git.

7. Falhas encontradas e limitações

- O comando PHPUnit sem filtro falha já na base: `phpunit.xml` referencia `tests/Unit`, que não existe. Toda a suíte existente em `tests/Feature` foi executada. A configuração permaneceu intacta.
- O 404 original da imagem `nua-01.jpg` foi corrigido na view para `.JPG`; o arquivo original não foi alterado.
- O destino de agradecimento fixado em localhost foi migrado para a rota nomeada.
- Permanecem ausentes na base dois arquivos opcionais referenciados por `public/css/vendor.css`: `images/colorbox/controls.png` e `images/colorbox/loading.gif`. O CSS permaneceu intacto; esses recursos não foram requisitados nas páginas verificadas. Não há novo erro de carregamento nas capturas finais.
- **NOT_RUN** — execução real de LightWidget e VLibras; apenas markup e URLs foram preservados/verificados e o espaço visual foi controlado nas capturas.
- **NOT_RUN** — login real no SUAP e operações reais de reservas/chaves. A suíte existente usa mocks e o React compilado permaneceu intacto.
- **NOT_RUN** — envio real do formulário externo, sem disparo de mensagem; endpoint e destino de retorno foram testados no HTML.
- **NOT_RUN** — validação manual do timing das animações e hover/foco do botão de chaves; CSS, SVG e markup originais foram preservados.

8. Backend e banco

Os hashes SHA-256 de **162 arquivos protegidos** conferem com a base: arquivos de `app/`, `database/`, `config/`, `public/`, `docker/`, Dockerfile, Compose, definição CapRover e manifests Composer. Nenhum model, migration, controller, política, autenticação SUAP, lógica de reservas/chaves, imagem, CSS/JS original ou React compilado foi alterado. O layout administrativo e os outros testes também permaneceram intactos.

Evidência: [verificação dos arquivos protegidos](/tmp/nuartemo-blade-checkpoint/protected-verification.json). O banco institucional permaneceu inacessado; migrations de teste rodaram exclusivamente no SQLite em memória dos containers descartáveis.

Nenhum comando foi executado em VPS, HOMELAB ou produção. Nenhum commit, push, PR, merge ou deploy foi realizado.

9. Estado final do Git

`git status --short`:

```text
 M AGENTS.md
 M resources/views/pages/a_cicuta.blade.php
 M resources/views/pages/about.blade.php
 M resources/views/pages/andaluz.blade.php
 M resources/views/pages/artevivencias.blade.php
 M resources/views/pages/banda_descendentes.blade.php
 M resources/views/pages/banda_sn.blade.php
 M resources/views/pages/clube_de_escrita.blade.php
 M resources/views/pages/clube_do_livro.blade.php
 M resources/views/pages/flauteando.blade.php
 M resources/views/pages/home.blade.php
 M resources/views/pages/nuav.blade.php
 M resources/views/pages/passocompasso.blade.php
 M resources/views/pages/rabisco.blade.php
 M resources/views/pages/thank_you.blade.php
 M routes/web.php
 M tests/Feature/PublicPagesTest.php
?? INSTITUTIONAL_BLADE_CHECKPOINT.md
?? resources/views/institutional/
?? resources/views/layouts/institutional.blade.php
```

`git diff --stat` (somente arquivos rastreados; os 12 arquivos novos estão listados nos itens 2 e 4):

```text
 AGENTS.md                                          | 154 ++++++--
 resources/views/pages/a_cicuta.blade.php           | 338 +-----------------
 resources/views/pages/about.blade.php              | 338 +-----------------
 resources/views/pages/andaluz.blade.php            | 321 +----------------
 resources/views/pages/artevivencias.blade.php      | 344 +-----------------
 resources/views/pages/banda_descendentes.blade.php | 322 +----------------
 resources/views/pages/banda_sn.blade.php           | 344 +-----------------
 resources/views/pages/clube_de_escrita.blade.php   | 341 +-----------------
 resources/views/pages/clube_do_livro.blade.php     | 342 +-----------------
 resources/views/pages/flauteando.blade.php         | 344 +-----------------
 resources/views/pages/home.blade.php               | 389 ++-------------------
 resources/views/pages/nuav.blade.php               | 342 +-----------------
 resources/views/pages/passocompasso.blade.php      | 344 +-----------------
 resources/views/pages/rabisco.blade.php            | 344 +-----------------
 resources/views/pages/thank_you.blade.php          |  42 +--
 routes/web.php                                     |  43 +--
 tests/Feature/PublicPagesTest.php                  | 229 +++++++++++-
 17 files changed, 556 insertions(+), 4365 deletions(-)
```

Nenhuma alteração está staged. Os arquivos novos permanecem untracked para revisão.

10. Recomendação

**GO para homologação manual, mantendo todos os redirects em 302.**

Na homologação, revisar homepage, Sobre e páginas de grupos em desktop/mobile, menus, banners, galerias, imagem restaurada do NUAV, animação do botão de chaves e o destino de agradecimento. Verificar LightWidget/VLibras reais e os fluxos existentes de agenda, SUAP e ChaveNUARTE no ambiente autorizado de homologação. A mudança para 301 depende da homologação posterior.
