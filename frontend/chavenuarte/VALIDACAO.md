# Validação da Fase 1

Execução local em 14/11/2026, Ubuntu 26.04.1, Node 22.22.1, npm 9.2.0 e Google Chrome 157.0.8103.78. Branch `feat/chavenuarte-v2-frontend`, HEAD preservado em `4245211`.

## Resultados executados

| Verificação | Resultado |
| --- | --- |
| Instalação frontend por `npm install --ignore-scripts` | Concluída; versões corrigidas e lockfile próprio |
| Instalação limpa por `npm ci --ignore-scripts --offline --no-audit --no-fund` | Passou, usando cache em `/tmp`; nenhuma resolução nova |
| Auditoria npm na árvore final | Zero vulnerabilidades reportadas |
| `npm run typecheck` / `tsc --noEmit` | Passou; também executado em cada build |
| `npm test` | 19 testes passaram em 3 arquivos |
| `npm run build` e verificador de artefatos | Passaram |
| Segundo build com `NODE_ENV=development` herdado | Mesmos 5 arquivos e SHA-256 do build normal |
| `npm run test:browser` | 5 cenários passaram no Chrome local |
| Axe WCAG 2 A/AA e 2.1 AA | Sem violações nos escopos auditados: visão geral desktop/mobile e bloqueio de produção |
| Capturas desktop/mobile | Geradas e inspecionadas; 1440 e 390 pixels de largura |
| Layout estreito | Sem transbordamento horizontal a 320 pixels nas telas verificadas |
| Teclado | Abertura de modal por Enter, fechamento por Escape e retorno de foco; menu móvel fecha com Escape e restaura foco |
| `prefers-reduced-motion` | Confirmado no navegador |
| Produção com tentativa de alteração de perfil | Bloqueada, inclusive com query, fragmento, storage e globais alterados |
| Rede da interface | Sem requisições externas ou à API institucional nos cenários monitorados |
| `git diff --check` | Passou nos arquivos modificados e, por comparação sem indexação, nos 42 arquivos novos |
| Estado Git | Branch e HEAD preservados; nenhuma alteração no índice; somente os arquivos declarados no inventário |

Os testes cobrem permissões por perfil, bloqueio sem carregar serviço, busca, erro e nova tentativa, isolamento dos dados, retirada/devolução consistentes, operações inválidas e cancelamento. O build recusa módulos demonstrativos no grafo e verifica manifesto, conteúdo, caminhos relativos e ausência de source maps.

A checagem automatizada de acessibilidade não é uma certificação completa. SUAP real, autenticação institucional, autorização backend, banco, agenda real e outros navegadores não foram testados. Não foram executados migrations, testes Laravel que inicializam a aplicação ou operações em HOMELAB/VPS.

## Preservação institucional

A comparação SHA-256 antes/depois abrangeu 194 arquivos versionados de `app/`, `resources/views/`, `routes/`, `public/`, `config/`, `database/` e manifests selecionados. Destes, 193 permaneceram idênticos; a única alteração foi `AGENTS.md`, regenerado pelo preparo obrigatório do Boost. Arquivos de ambiente foram excluídos da inspeção e não foram lidos ou carregados.

Fora da nova pasta frontend, o Git registra somente alterações de ferramentas em `AGENTS.md` e `boost.json`. O agente anterior de Boost foi preservado e Codex foi acrescentado. `composer.json`, `composer.lock`, `package.json` e `vite.config.js` da raiz, o Blade de `/painel-chaves`, o bundle atual, rotas e modelos permanecem intactos. Nenhuma alteração está ativada no fluxo real.

SHA-256 do bundle anterior, idêntico ao início:

```text
53a9db7ffa331523c2d0212c46f2dfa953b8ead6b40551db2545b2d69b95289b  public/chavenuarte-assets/assets/index-C36Vd_dx.css
a588e939141e56c502f330f5cf72df4c9a86046e219385a926a7c80e5bba73b5  public/chavenuarte-assets/assets/index-a588e939141e56c5.js
61bc9a161de58248288e6905425d7180f0624c2865007b97d763fdac12043a66  public/chavenuarte-assets/favicon.svg
b45fa506195cfcdef406ba9f0c77b36ddc1a7c224040926ec70abc2fdea7b93a  public/chavenuarte-assets/icons.svg
```

## Build V2 reproduzido

Saída exclusiva em `frontend/chavenuarte/dist/`, ignorada pelo Git:

```text
d3d18faecef389724747120c6b8256b8f7f00b64bb294871576b06779ffa20a3  .vite/manifest.json
66aa667e3f7d83cb1972b3b73d94ec6ef17ecb199423f6655094ec4b84035b68  assets/ProductionApp-C8s0bev5.js
1d3e0ffbd2916044ec528f661fa9623152e59cb5a5e221385d7cea991ca2ec3f  assets/index-CGRyfZbC.css
3887d668438737b9b8401bedba277f508d345029f03570e6f5e9e8b980cda3dc  assets/index-DLN3VKEK.js
169e2f97323083025594573da138eabd450f3a17f9480b13396b4e42df9d43e5  index.html
```

## Inventário da entrega

Arquivos existentes modificados:

- `AGENTS.md`: diretrizes geradas pelo Laravel Boost.
- `boost.json`: inclusão de Codex, mantendo o agente anterior.

Arquivos novos, todos em `frontend/chavenuarte/`:

```text
.gitignore
.node-version
README.md
VALIDACAO.md
index.html
package-lock.json
package.json
playwright.config.ts
scripts/build.mjs
scripts/verify-build.mjs
src/app/Dashboard.test.tsx
src/app/Dashboard.tsx
src/app/ErrorBoundary.tsx
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
src/dev/demo-service.test.ts
src/dev/demo-service.ts
src/dev/fixtures.ts
src/main.tsx
src/pages/Catalog.tsx
src/pages/Overview.tsx
src/pages/Team.tsx
src/permissions/access.test.ts
src/permissions/access.ts
src/services/selectors.ts
src/styles.css
src/test/setup.ts
src/types/domain.ts
tests/development.spec.ts
tests/production.spec.ts
tsconfig.json
vite.config.ts
vitest.config.ts
```

`node_modules/`, `dist/` e `test-results/` são somente artefatos locais e estão ignorados pelo Git. Os servidores abertos pelos testes foram encerrados pelo Playwright.

Não houve commit, push ou deploy. A ativação institucional e a integração real dependem de homologação e de um próximo bloco específico.
