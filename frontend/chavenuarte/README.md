# ChaveNUARTE V2 — Frontend

Fundação React + TypeScript da Fase 1, refinada na Fase 2 com retirada, agendamento, devolução e gestão administrativa em memória. A arquitetura permanece isolada do Laravel: mesmos pontos de entrada, matriz de permissões, serviço substituível e componentes compartilhados.

## Prévia local

Na raiz do repositório, com Node 22.12+ da linha 22 e npm 9+:

```sh
npm --prefix frontend/chavenuarte ci --ignore-scripts
npm --prefix frontend/chavenuarte run dev
```

Use o endereço local impresso pelo Vite, na porta **5174**, restrita a `127.0.0.1`. Não inicie Laravel, banco ou SUAP para usar esta prévia.

O controle **Simulação · Dev**, recolhido no canto da tela, identifica o ambiente e permite escolher perfil e cenário. O perfil inicial é Bolsista. Alterações ficam em memória; trocar perfil, cenário ou reiniciar a página restaura os dados iniciais. Matrículas com prefixo `DEMO-` e nomes são inteiramente simulados. Fotos não são carregadas: o avatar usa iniciais locais e o contrato aceita uma fotografia futura com fallback.

A preferência de sidebar compacta usa exclusivamente a chave `chavenuarte.sidebar.compact` no armazenamento local. Nenhuma permissão é obtida desse armazenamento.

## Organização

- `src/app/`: dashboard, layout responsivo, navegação e entrada segura de produção.
- `src/components/`: listas, diálogo acessível, formulários de operações e regras, confirmações e aviso de desfazer.
- `src/pages/`: visão geral, chaves, histórico, equipe e configurações.
- `src/types/domain.ts`: identidades, espaços, chaves físicas, reservas, eventos físicos e serviço.
- `src/permissions/`: matriz de visibilidade e limites de gestão de equipe.
- `src/services/`: calendário civil, seletores, resumos e validação de regras.
- `src/dev/`: fixtures, seletor e serviço de demonstração, eliminados do build de produção.
- `tests/`: cenários no Chrome para 1440, 1024, 497, 390 e 320 px, além dos builds demonstrativo e seguro de produção.

React 19.2.0, TypeScript 5.9.3, Vite 7.3.8 e Vitest 4.1.12 permanecem fixados no lockfile próprio. A Fase 2 não acrescentou dependências.

## Operações

Em **Início** e **Chaves**, os atalhos abrem retirada ou devolução. Os detalhes da chave também permitem agendar e consultar seu histórico.

**Retirar agora:** operador e matrícula vêm do serviço; o horário real é gerado na confirmação. Informe finalidade, data/horário da devolução prevista e observações opcionais. Confira o resumo e confirme.

**Agendar retirada:** escolha data e horário completos para início e devolução prevista. O agendamento não registra retirada física e não altera a disponibilidade atual da chave. O histórico oferece a retirada do agendamento dentro do período reservado, respeitando acesso e disponibilidade.

**Devolver:** escolha uma retirada aberta, confira pessoa, retirada registrada e devolução prevista, acrescente observação final se necessário e confirme. O serviço registra o horário real, atualiza a chave e mantém o mesmo registro no histórico.

O histórico reúne reservas e retiradas com estados agendada, em uso, devolvida, atrasada e cancelada. Uma retirada aberta mostra “Em andamento”; uma concluída mostra início e fim reais, incluindo ambas as datas ao atravessar dias. Há filtros por estado e período e um filtro contextual ao abrir o histórico de uma chave.

Datas civis são armazenadas como `YYYY-MM-DDTHH:MM[:SS]`, no horário de **America/Fortaleza**. A data escolhida não é reinterpretada como um instante UTC. Calendário, horários `00:00`–`23:59`, ordem cronológica, passado, conflitos e períodos que cruzam meia-noite são validados no serviço. Os dados iniciais usam datas relativas ao relógio atual.

## Gestão

| Perfil        | Operações | Gestão de chaves e regras globais | Gestão de equipe                  |
| ------------- | --------- | --------------------------------- | --------------------------------- |
| Supervisor    | Sim       | Sim                               | Todos os níveis, com proteções    |
| Administrador | Sim       | Sim                               | Bolsistas e pessoas sem permissão |
| Bolsista      | Sim       | Não                               | Não                               |
| Sem permissão | Não       | Não                               | Não                               |

No desktop, Equipe e Configurações aparecem na sidebar conforme o perfil. No mobile, uma quarta entrada **Gestão** agrupa essas duas áreas. Bolsistas têm apenas Início, Chaves e Histórico.

Chaves podem ser criadas, editadas, bloqueadas, desbloqueadas e arquivadas. Código e nome são essenciais; espaços são entidades separadas. Configurações avançadas ficam recolhidas. Chaves novas não possuem restrições específicas e seguem as regras globais.

As regras permitem dias autorizados, faixas para **iniciar** a retirada, duração máxima e pessoas autorizadas. Nenhuma faixa ou pessoa selecionada significa ausência dessa restrição específica. Os dias autorizados são conferidos em todo o período ocupado; a data final à meia-noite não ocupa o dia seguinte. Regras globais e específicas se somam. Bloqueios são distintos das regras e impedem períodos coincidentes; não cancelam reservas existentes. Não é possível arquivar chave com retirada aberta ou agendamento futuro.

A equipe permite busca por nome/matrícula, filtro de cargo, promoção, rebaixamento, remoção de vínculo, suspensão temporária ou por tempo indeterminado e reativação. O último supervisor ativo é protegido. Administradores não alteram níveis superiores nem concedem esses níveis. Revogação preserva identidade e registros históricos. Suspensões temporárias expiram pelo relógio do serviço; a interface atualiza os estados periodicamente.

Alterações administrativas e cancelamentos exigem confirmação. Depois, ficam pendentes por **5 segundos**, com **Desfazer funcional**. A finalização ocorre no serviço após o prazo. Uma falha restaura os dados anteriores e produz uma mensagem de erro; o cenário de desenvolvimento “Falha ao concluir alteração” permite testar isso. Operações concorrentes ficam bloqueadas durante esse curto prazo para evitar conflitos com a alteração pendente.

## Verificação e build

```sh
npm --prefix frontend/chavenuarte run typecheck
npm --prefix frontend/chavenuarte test
npm --prefix frontend/chavenuarte run build
npm --prefix frontend/chavenuarte run test:browser
```

Playwright usa o Chrome local em `/usr/bin/google-chrome`; ajuste `CHAVENUARTE_CHROME_PATH` se necessário. Os testes abrem e encerram seus servidores locais nas portas 5174, 4174 e 4175. Capturas e rastros ficam em `test-results/`, ignorados pelo Git. Os testes de cinco segundos usam relógio simulado.

O build fixa o runtime de produção e escreve somente em `frontend/chavenuarte/dist/`, com manifesto próprio e caminhos relativos. `envDir: false` impede o carregamento de arquivos de ambiente. O Vite do Laravel, o bundle legado e `/painel-chaves` permanecem preservados.

```sh
npm --prefix frontend/chavenuarte run preview
```

A prévia do build usa a porta **4174** e mostra **Aguardando integração institucional**. O seletor, o serviço demonstrativo, as fixtures e o dashboard administrativo não integram o JavaScript de produção. O plugin e o verificador de build mantêm esse limite.

## Limites

Todas as operações descritas são demonstrativas. Não há persistência, autenticação SUAP, autorização backend ou integração com a agenda institucional. A autorização e as validações precisam ser reproduzidas de forma autoritativa pelo futuro backend; permissões visuais não oferecem essa garantia.

O próximo bloco é homologar estes fluxos com bolsistas e supervisores e acordar os contratos da API, identidade, permissões, concorrência e auditoria antes de qualquer ativação institucional.

O registro [VALIDACAO.md](VALIDACAO.md) documenta historicamente a Fase 1.

O relatório [FASE2.md](FASE2.md) reúne o inventário, resultados executados e evidências da Fase 2.

## Acabamento visual V2.1

A marca e o favicon da V2 usam o mesmo asset em `public/chavenuarte-key.svg`, com a geometria da chave efetivamente usada no cabeçalho do painel legado. O favicon roxo do legado não era uma chave; a referência ao cabeçalho foi confirmada pelo usuário. Nenhum asset institucional foi editado.

No desktop, a marca fica no topo lateral, junto ao controle de recolhimento; o header mostra o breadcrumb e os controles de tema/perfil. Configurações fica no rodapé lateral autorizado. No mobile, a mesma marca ocupa o header compacto e a navegação inferior mantém seus destinos. O cartão Nossos espaços aparece a partir de 1280 px e usa as contagens atuais de chaves ativas, disponíveis e em uso.

O tema começa claro. A opção claro/escuro persiste somente em `chavenuarte.theme`, independentemente da preferência da sidebar. Os tokens em `src/theme/tokens.css` cobrem a interface inteira; os campos de data usam o `color-scheme` correspondente para o calendário nativo. A preferência não fornece cargos, não altera dados e também funciona na página bloqueada de produção.

O build demonstrativo solicitado para homologação é separado e exclusivamente local:

```sh
npm --prefix frontend/chavenuarte run build:demo
npm --prefix frontend/chavenuarte run preview:demo
```

A saída é `dist-demo/`, ignorada pelo Git, e o preview escuta na porta 4175. Esse artefato contém o seletor e os serviços simulados e não deve ser publicado como produção. O comando habitual `build` continua produzindo `dist/` bloqueado, com seu verificador de isolamento. A preferência visual de tema é permitida em produção; perfis, seletor e métodos demonstrativos continuam excluídos do JavaScript.

O relatório [V2.1.md](V2.1.md) reúne os arquivos alterados, testes executados, capturas dos dois temas e limites da homologação visual.
