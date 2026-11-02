# Tasks: Painel Administrativo Completo de Pedidos

**Input**: Design documents from `/specs/008-order-admin/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluídos porque a especificação exige resultados mensuráveis para autorização, concorrência, responsividade, estados e acessibilidade.

**Organization**: Tarefas agrupadas por história para permitir implementação e validação incremental.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Executável em paralelo em arquivos distintos
- **[Story]**: História de usuário correspondente
- Todos os itens incluem caminhos concretos

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar limites administrativos e arquivos compartilhados sem alterar o fluxo atual.

- [x] T001 Registrar as rotas `manage` antes de `:id` e protegê-las com `roleGuard(['SUPER_ADMIN'])` em `src/app/features/orders/orders.routes.ts`
- [x] T002 [P] Criar o barrel de componentes administrativos em `src/app/features/orders/components/admin/index.ts`
- [x] T003 [P] Criar os tokens visuais responsivos e de estado reutilizáveis em `src/styles.css`
- [x] T004 [P] Adicionar item de navegação exclusivo do superadmin para a gestão de pedidos em `src/app/layouts/admin-layout/admin-layout.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Contratos, autorização, consulta e infraestrutura que bloqueiam todas as histórias.

**⚠️ CRITICAL**: Nenhuma história começa antes desta fase.

- [x] T005 Criar DTOs de consulta, resumo, detalhe, seleção, prévia, execução, exportação e erro em `src/app/core/models/order-admin.model.ts`
- [ ] T006 [P] Criar DTOs validados de consulta e comandos administrativos em `../saas-api/src/modules/order/dto/admin-order-query.dto.ts` e `../saas-api/src/modules/order/dto/admin-order-action.dto.ts`
- [ ] T007 [P] Adicionar testes de autorização `SUPER_ADMIN` e rejeição dos demais papéis em `../saas-api/src/modules/order/order.controller.spec.ts`
- [x] T008 Implementar endpoints administrativos aditivos e guards em `../saas-api/src/modules/order/order.controller.ts`
- [x] T009 Implementar consulta global paginada, filtros, busca, ordenação estável e agregados sem N+1 em `../saas-api/src/modules/order/repositories/order.repository.ts`
- [x] T010 [P] Adicionar testes de paginação, filtros combinados, desempate e zero resultados em `../saas-api/src/modules/order/repositories/order.repository.spec.ts`
- [ ] T011 Implementar orquestração administrativa, versionamento, idempotência e auditoria em `../saas-api/src/modules/order/order.service.ts`
- [ ] T012 [P] Adicionar testes de prévia expirada, idempotência, conflito e auditoria em `../saas-api/src/modules/order/order.service.spec.ts`
- [x] T013 Criar cliente tipado para lista, detalhe, opções, prévia, execução e exportação em `src/app/features/orders/services/order-admin.ts`
- [x] T014 [P] Testar URLs, parâmetros, payloads e mapeamento de erros do cliente em `src/app/features/orders/services/order-admin.spec.ts`
- [x] T015 Criar parser/serializer canônico de query params com defaults e validação em `src/app/features/orders/services/order-admin-query.ts`
- [x] T016 [P] Testar round-trip, parâmetros inválidos e restauração da consulta em `src/app/features/orders/services/order-admin-query.spec.ts`
- [ ] T017 Criar presenter puro de status, prazos, origem, ações e prioridade mobile em `src/app/features/orders/services/order-admin.presentation.ts`
- [ ] T018 [P] Testar apresentação textual sem dependência exclusiva de cor em `src/app/features/orders/services/order-admin.presentation.spec.ts`

**Checkpoint**: Contratos e infraestrutura prontos; histórias podem avançar incrementalmente.

---

## Phase 3: User Story 1 - Consultar todos os pedidos (Priority: P1) 🎯 MVP

**Goal**: Entregar consulta global pesquisável, paginada e responsiva com estado persistido.

**Independent Test**: Localizar pedido de qualquer cliente combinando busca/filtros e restaurar a consulta no desktop e smartphone.

### Tests for User Story 1

- [ ] T019 [P] [US1] Testar fluxo de carregamento, vazio, erro, refetch e descarte de resposta obsoleta em `src/app/features/orders/pages/admin-list/admin-list.spec.ts`
- [ ] T020 [P] [US1] Testar colunas semânticas, ordenação por teclado e ações nomeadas em `src/app/features/orders/components/admin/order-admin-table/order-admin-table.spec.ts`
- [ ] T021 [P] [US1] Testar prioridade de conteúdo e ausência de overflow nos cards em `src/app/features/orders/components/admin/order-admin-cards/order-admin-cards.spec.ts`

### Implementation for User Story 1

- [ ] T022 [P] [US1] Implementar busca, chips, total, export trigger e abertura de filtros em `src/app/features/orders/components/admin/order-admin-toolbar/order-admin-toolbar.ts`
- [ ] T023 [P] [US1] Implementar formulário reativo de filtros, erros por campo e modo drawer em `src/app/features/orders/components/admin/order-admin-filters/order-admin-filters.ts`
- [ ] T024 [P] [US1] Implementar tabela desktop com seleção, colunas, ordenação, paginação e skeleton em `src/app/features/orders/components/admin/order-admin-table/order-admin-table.ts`
- [ ] T025 [P] [US1] Implementar cards mobile com seleção, dados prioritários e ações acessíveis em `src/app/features/orders/components/admin/order-admin-cards/order-admin-cards.ts`
- [x] T026 [US1] Integrar query state, requisições canceláveis, URL, breakpoints e estados na página em `src/app/features/orders/pages/admin-list/admin-list.ts`
- [x] T027 [US1] Implementar paginação acessível, intervalo/total e tamanhos 25/50/100 na página em `src/app/features/orders/pages/admin-list/admin-list.ts`
- [x] T028 [US1] Integrar acesso negado, sessão expirada e offline aos handlers centrais em `src/app/features/orders/pages/admin-list/admin-list.ts`

**Checkpoint**: A visão global é utilizável e testável sem detalhe ou mutações.

---

## Phase 4: User Story 2 - Examinar o pedido em profundidade (Priority: P1)

**Goal**: Entregar detalhe 360° com seções independentes e atualização concorrente visível.

**Independent Test**: Abrir pedido complexo e conferir resumo, participantes, itens, finanças, conteúdo, entregas e auditoria mesmo com falha parcial.

### Tests for User Story 2

- [ ] T029 [P] [US2] Testar carga principal, falha parcial, registro ausente e atualização por terceiro em `src/app/features/orders/pages/admin-detail/admin-detail.spec.ts`
- [ ] T030 [P] [US2] Testar semântica e controles de mídia das seções em `src/app/features/orders/components/admin/order-admin-detail-sections/order-admin-detail-sections.spec.ts`

### Implementation for User Story 2

- [ ] T031 [P] [US2] Implementar resumo, participantes, indicadores financeiros e prazos em `src/app/features/orders/components/admin/order-admin-detail-sections/order-summary-section.ts`
- [ ] T032 [P] [US2] Implementar itens, briefing, pronunciamentos e entregas reutilizando mídia existente em `src/app/features/orders/components/admin/order-admin-detail-sections/order-content-section.ts`
- [ ] T033 [P] [US2] Implementar disputa, timeline e auditoria paginada em `src/app/features/orders/components/admin/order-admin-detail-sections/order-audit-section.ts`
- [x] T034 [US2] Integrar seções, retries isolados, atualização e indicador de versão em `src/app/features/orders/pages/admin-detail/admin-detail.ts`
- [x] T035 [US2] Conectar links de lista/card ao detalhe preservando retorno à consulta em `src/app/features/orders/pages/admin-list/admin-list.ts`

**Checkpoint**: Consulta e diagnóstico completo funcionam sem comandos administrativos.

---

## Phase 5: User Story 3 - Executar ações administrativas seguras (Priority: P2)

**Goal**: Executar comandos individuais autorizados com prévia, confirmação, idempotência e conflito.

**Independent Test**: Pré-visualizar e executar ação elegível, validar auditoria e repetir após conflito somente com nova decisão.

### Tests for User Story 3

- [ ] T036 [P] [US3] Testar foco, validação, confirmação e anúncios do diálogo em `src/app/features/orders/components/admin/order-action-dialog/order-action-dialog.spec.ts`
- [ ] T037 [P] [US3] Testar duplo envio, sucesso, validação, sessão, offline e conflito em `src/app/features/orders/pages/admin-detail/admin-detail.spec.ts`

### Implementation for User Story 3

- [ ] T038 [US3] Implementar allowlist e prévia das ações individuais no domínio em `../saas-api/src/modules/order/order.service.ts`
- [ ] T039 [P] [US3] Implementar diálogo acessível de impacto, justificativa, confirmação e conflito em `src/app/features/orders/components/admin/order-action-dialog/order-action-dialog.ts`
- [ ] T040 [US3] Integrar menu de ações derivadas do servidor e estados de execução em `src/app/features/orders/pages/admin-detail/admin-detail.ts`
- [ ] T041 [US3] Atualizar lista, detalhe, indicadores e auditoria após resultado em `src/app/features/orders/services/order-admin.ts`

**Checkpoint**: Uma ação individual pode ser concluída com segurança e rastreabilidade.

---

## Phase 6: User Story 4 - Operar pedidos em lote (Priority: P2)

**Goal**: Selecionar página ou consulta, pré-visualizar elegibilidade e acompanhar resultado por pedido.

**Independent Test**: Executar lote misto e distinguir sucessos, falhas e conflitos por alvo.

### Tests for User Story 4

- [ ] T042 [P] [US4] Testar estados da seleção explícita/query, exclusões e confirmação de descarte em `src/app/features/orders/services/order-selection.spec.ts`
- [ ] T043 [P] [US4] Testar operação parcial, progresso e relatório acessível em `src/app/features/orders/components/admin/order-selection-bar/order-selection-bar.spec.ts`
- [ ] T044 [P] [US4] Testar limite, elegibilidade revalidada e resultados individuais em `../saas-api/src/modules/order/order.integration.spec.ts`

### Implementation for User Story 4

- [ ] T045 [P] [US4] Criar estado de seleção explícita ou por consulta com exclusões em `src/app/features/orders/services/order-selection.ts`
- [ ] T046 [US4] Implementar resolução segura de seleção por fingerprint e limite de 1.000 alvos em `../saas-api/src/modules/order/order.service.ts`
- [ ] T047 [P] [US4] Implementar barra responsiva de seleção, escopo e ações em `src/app/features/orders/components/admin/order-selection-bar/order-selection-bar.ts`
- [ ] T048 [P] [US4] Implementar painel de progresso e resultado por registro em `src/app/features/orders/components/admin/order-action-results/order-action-results.ts`
- [ ] T049 [US4] Integrar seleção, prévia, polling com backoff e descarte protegido em `src/app/features/orders/pages/admin-list/admin-list.ts`

**Checkpoint**: Lotes são revalidados, auditados e reportam sucesso parcial corretamente.

---

## Phase 7: User Story 5 - Personalizar e exportar a visão (Priority: P3)

**Goal**: Persistir preferências visuais e exportar o escopo declarado sem bloquear a lista.

**Independent Test**: Restaurar colunas/densidade por usuário e concluir exportação filtrada assíncrona.

### Tests for User Story 5

- [ ] T050 [P] [US5] Testar versionamento, isolamento por usuário e fallback das preferências em `src/app/features/orders/services/order-view-preferences.spec.ts`
- [ ] T051 [P] [US5] Testar criação, autorização, progresso e expiração de exportação em `../saas-api/src/modules/order/order.integration.spec.ts`

### Implementation for User Story 5

- [ ] T052 [P] [US5] Criar serviço SSR-safe de colunas e densidade por usuário em `src/app/features/orders/services/order-view-preferences.ts`
- [ ] T053 [US5] Integrar seletor de colunas/densidade na toolbar e tabela em `src/app/features/orders/components/admin/order-admin-toolbar/order-admin-toolbar.ts`
- [ ] T054 [US5] Implementar job e acesso temporário de exportação em `../saas-api/src/modules/order/order.service.ts`
- [x] T055 [US5] Integrar criação, progresso, sucesso e falha de exportação em `src/app/features/orders/pages/admin-list/admin-list.ts`

**Checkpoint**: Preferências e exportações respeitam usuário e consulta.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validar qualidade transversal e documentação.

- [ ] T056 [P] Executar auditoria de teclado, foco, leitor de tela, contraste e redução de movimento conforme `specs/008-order-admin/quickstart.md`
- [ ] T057 [P] Validar 320, 390, 768, 1024 e 1440 px em claro/escuro e corrigir overflow em `src/app/features/orders/components/admin/`
- [ ] T058 [P] Validar estados carregando, vazio, erro, offline, acesso negado, sessão expirada e conflito em `src/app/features/orders/pages/admin-list/admin-list.spec.ts` e `src/app/features/orders/pages/admin-detail/admin-detail.spec.ts`
- [x] T059 Executar e corrigir testes do frontend com `npm test -- --watch=false` e formatação com `npm run format:check`
- [x] T060 Executar e corrigir testes do módulo order da API em `../saas-api/src/modules/order/`
- [x] T061 Executar e corrigir build SSR de produção com `npm run build`
- [ ] T062 Validar manualmente todos os cenários e registrar resultados em `specs/008-order-admin/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup não possui dependências.
- Foundational depende de Setup e bloqueia todas as histórias.
- US1 e US2 podem começar após Foundational; US2 reutiliza navegação da US1 para o fluxo completo.
- US3 depende do detalhe US2.
- US4 depende da listagem US1 e da infraestrutura de ações US3.
- US5 depende da listagem US1; exportação reutiliza seleção da US4 quando esse escopo for escolhido.
- Polish depende das histórias incluídas na entrega.

### User Story Dependencies

- **US1 (P1)**: Independente após a fundação; MVP recomendado.
- **US2 (P1)**: Independente em leitura após a fundação; integra retorno à US1.
- **US3 (P2)**: Depende da superfície de detalhe da US2.
- **US4 (P2)**: Depende de US1 e do padrão de prévia/comando da US3.
- **US5 (P3)**: Preferências dependem de US1; exportação completa integra US4.

### Parallel Opportunities

- DTO/testes de API e estilos/navegação podem avançar em paralelo na fundação.
- Dentro da US1, toolbar, filtros, tabela e cards ocupam arquivos distintos.
- Dentro da US2, resumo, conteúdo e auditoria podem avançar em paralelo.
- Testes marcados `[P]` podem ser escritos em paralelo antes da integração da história.
- Após a fundação, US1 e a parte somente leitura da US2 podem avançar simultaneamente.

## Parallel Example: User Story 1

```text
Task T022: toolbar em order-admin-toolbar.ts
Task T023: filtros em order-admin-filters.ts
Task T024: tabela em order-admin-table.ts
Task T025: cards em order-admin-cards.ts
```

## Implementation Strategy

### MVP First

1. Completar Setup e Foundational.
2. Implementar US1.
3. Validar consulta global, URL e responsividade de forma independente.
4. Demonstrar a visão global antes de adicionar mutações.

### Incremental Delivery

1. Fundação → contratos e segurança.
2. US1 → visão global pesquisável.
3. US2 → detalhe 360°.
4. US3 → gerenciamento individual seguro.
5. US4 → produtividade em lote.
6. US5 → personalização e exportação.
7. Polish → gates finais.

## Format Validation

- 62 tarefas numeradas sequencialmente.
- Todas começam com checkbox e ID.
- Tarefas de histórias possuem `[USn]`.
- `[P]` aparece apenas em arquivos ou verificações independentes.
- Todas as tarefas de implementação e teste indicam caminho concreto.
