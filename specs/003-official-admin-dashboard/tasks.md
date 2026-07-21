# Tasks: Dashboard Administrativo com Dados Oficiais

**Input**: Design documents from `/specs/003-official-admin-dashboard/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluídos porque a spec exige validação automatizada dos fluxos críticos financeiros, pedidos compostos, estoque e venda.

**Organization**: Tarefas agrupadas pelas cinco histórias, na ordem de entrega solicitada.

## Phase 1: Setup

**Purpose**: Confirmar contexto e proteger os dois repositórios antes das mudanças.

- [x] T001 Verificar feature ativa, worktrees e arquivos de ignore em `/home/iraecio/apps/saas-web` e `/home/iraecio/apps/saas-api`
- [x] T002 Mapear contratos oficiais usados pela implementação em `specs/003-official-admin-dashboard/contracts/integration-matrix.md`

---

## Phase 2: Foundational

**Purpose**: Alinhar modelos e utilitários compartilhados antes das histórias.

- [x] T003 [P] Remover operação inexistente de criação administrativa em `src/app/core/services/api.ts`
- [x] T004 [P] Criar utilitários tipados de parâmetros de paginação em `src/app/core/models/pagination.model.ts`
- [x] T005 [P] Revisar guards e matriz de papéis em `src/app/app.routes.ts` e `src/app/core/guards/role.guard.ts`
- [x] T006 Validar interceptação do envelope oficial em `src/app/core/interceptors/response-transform.interceptor.ts`

**Checkpoint**: Fundação pronta para os contratos oficiais.

---

## Phase 3: User Story 1 — Operações financeiras confiáveis (P1) 🎯 MVP

**Goal**: Carteira única e administração financeira usando paths, verbos, modelos e paginação oficiais.

**Independent Test**: ADMIN consulta e decide disputas/estornos; SUPER_ADMIN corrige, emite e cancela; usuário consulta carteira única e extrato cursor-based.

- [x] T007 [P] [US1] Atualizar contratos de carteira única em `src/app/core/models/wallet.model.ts`
- [x] T008 [P] [US1] Criar testes de contrato do serviço da carteira em `src/app/features/wallet/services/wallet.spec.ts`
- [x] T009 [P] [US1] Criar testes de contrato administrativo em `src/app/features/wallet-admin/services/wallet-admin.spec.ts`
- [x] T010 [US1] Corrigir paths, verbos e paginação em `src/app/features/wallet/services/wallet.ts`
- [x] T011 [US1] Corrigir paths, verbos e offset em `src/app/features/wallet-admin/services/wallet-admin.ts`
- [x] T012 [P] [US1] Adaptar páginas de carteira única em `src/app/features/wallet/pages/balance/balance.ts`, `credits/credits.ts`, `credit-detail/credit-detail.ts` e `refunds/refunds.ts`
- [x] T013 [P] [US1] Adaptar páginas administrativas a offset e RBAC em `src/app/features/wallet-admin/pages/`
- [x] T014 [US1] Executar testes focados e build do frontend para US1 em `package.json`

**Checkpoint**: US1 funcional isoladamente.

---

## Phase 4: User Story 2 — Pedidos compostos operacionais (P2)

**Goal**: Criação e ciclo operacional por `OrderLineItem`.

**Independent Test**: Cliente cria pedido com dois itens e transições em um item não alteram o outro.

- [x] T015 [P] [US2] Remodelar pedido e item em `src/app/core/models/order.model.ts`
- [x] T016 [P] [US2] Criar testes de contrato por item em `src/app/features/orders/services/order.spec.ts`
- [x] T017 [P] [US2] Atualizar lógica/testes de ações por item em `src/app/features/orders/components/order-actions/order-actions.logic.ts` e `order-actions.logic.spec.ts`
- [x] T018 [US2] Migrar criação JSON e endpoints `/line-items/:itemId` em `src/app/features/orders/services/order.ts`
- [x] T019 [US2] Migrar formulário para `items[]` em `src/app/features/orders/pages/create/create.ts`
- [x] T020 [US2] Migrar detalhe, seleção e histórico por item em `src/app/features/orders/pages/detail/detail.ts`
- [x] T021 [P] [US2] Adaptar timeline, ações e entrega ao item em `src/app/features/orders/components/`
- [x] T022 [US2] Executar testes focados e build do frontend para US2 em `package.json`

**Checkpoint**: US2 funcional isoladamente.

---

## Phase 5: User Story 3 — Ciclo comercial de créditos da revenda (P3)

**Goal**: Substituir emissão antiga por preço, pacotes, compra, estoque, venda e margem.

**Independent Test**: Compra confirmada vira estoque e uma venda reduz o estoque e registra margem.

- [x] T023 [P] [US3] Remodelar pricing, compra, lote e venda em `src/app/core/models/reseller-credit.model.ts`
- [x] T024 [P] [US3] Criar testes do serviço de comércio em `src/app/features/reseller-credits/services/reseller-credit.spec.ts`
- [x] T025 [US3] Substituir endpoints antigos no serviço em `src/app/features/reseller-credits/services/reseller-credit.ts`
- [x] T026 [P] [US3] Criar páginas de preço/pacotes e compras em `src/app/features/reseller-credits/pages/pricing/pricing.ts` e `pages/purchases/purchases.ts`
- [x] T027 [P] [US3] Criar páginas de estoque e vendas em `src/app/features/reseller-credits/pages/stock/stock.ts` e `pages/sales/sales.ts`
- [x] T028 [US3] Criar gestão admin de compras em `src/app/features/reseller-credits/pages/admin-purchases/admin-purchases.ts`
- [x] T029 [US3] Substituir rotas de emissão em `src/app/features/reseller-credits/reseller-credits.routes.ts`
- [x] T030 [US3] Executar testes focados e build do frontend para US3 em `package.json`

**Checkpoint**: US3 funcional isoladamente.

---

## Phase 6: User Story 4 — Visão administrativa oficial (P4)

**Goal**: Resumo administrativo agregado sem persistência e dashboard sem mocks.

**Independent Test**: Dados controlados dos períodos atual/anterior correspondem aos cartões, pedidos e pendências.

- [x] T031 [P] [US4] Criar DTO de resposta em `../saas-api/src/modules/admin-dashboard/dto/responses/admin-dashboard-response.dto.ts`
- [x] T032 [P] [US4] Criar testes de cálculo/RBAC em `../saas-api/src/modules/admin-dashboard/admin-dashboard.service.spec.ts` e `admin-dashboard.controller.spec.ts`
- [x] T033 [US4] Implementar agregações em `../saas-api/src/modules/admin-dashboard/admin-dashboard.service.ts`
- [x] T034 [US4] Expor `GET /v1/admin/dashboard` em `../saas-api/src/modules/admin-dashboard/admin-dashboard.controller.ts` e `admin-dashboard.module.ts`
- [x] T035 [US4] Registrar módulo em `../saas-api/src/app.module.ts`
- [x] T036 [P] [US4] Criar modelo e serviço frontend em `src/app/core/models/admin-dashboard.model.ts` e `src/app/features/dashboard/services/admin-dashboard.ts`
- [x] T037 [P] [US4] Criar teste do serviço frontend em `src/app/features/dashboard/services/admin-dashboard.spec.ts`
- [x] T038 [US4] Substituir dados estáticos e implementar estados em `src/app/features/dashboard/pages/admin-dashboard/admin-dashboard.ts`
- [x] T039 [US4] Executar testes e builds de API/frontend para US4 em `../saas-api/package.json` e `package.json`

**Checkpoint**: US4 funcional isoladamente e sem mocks.

---

## Phase 7: User Story 5 — Navegação e relatórios consistentes (P5)

**Goal**: Todos os destinos visíveis existem e relatórios mostram somente dados oficiais.

**Independent Test**: Menus dos sete papéis abrem destinos válidos; relatórios visíveis carregam dados reais.

- [x] T040 [P] [US5] Corrigir menu por papel em `src/app/shared/components/sidebar/sidebar.ts`
- [x] T041 [P] [US5] Corrigir acessos rápidos e remover overview mockado em `src/app/features/dashboard/pages/admin-dashboard/admin-dashboard.ts` e `overview/overview.ts`
- [x] T042 [US5] Criar relatórios oficiais por papel em `src/app/features/reports/pages/reports-home.ts`
- [x] T043 [P] [US5] Remover totais artificiais de revendedores em `src/app/features/resellers/services/reseller.ts` e páginas relacionadas
- [x] T044 [US5] Corrigir rotas/guards e remover destinos inexistentes em `src/app/app.routes.ts` e arquivos `*.routes.ts` afetados
- [x] T045 [US5] Validar navegação dos sete papéis e build SSR em `src/app/shared/components/sidebar/sidebar.ts`

**Checkpoint**: US5 funcional isoladamente.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T046 [P] Atualizar documentação de validação em `specs/003-official-admin-dashboard/quickstart.md`
- [x] T047 Verificar ausência de endpoints antigos e mocks com busca estática em `src/app/`
- [x] T048 Executar suítes completas e builds em `/home/iraecio/apps/saas-api` e `/home/iraecio/apps/saas-web`
- [x] T049 Marcar todas as tarefas concluídas e registrar resultados em `specs/003-official-admin-dashboard/tasks.md`

---

## Dependencies & Execution Order

- Setup → Foundational → US1 → US2 → US3 → US4 → US5 → Polish.
- US4 depende de fontes confiáveis entregues por US1–US3.
- US5 depende das rotas finais das histórias anteriores.
- T033 depende de T031/T032; T034 depende de T033; T035 depende de T034.
- T018 depende de T015–T017; T019–T021 dependem de T018.
- T025 depende de T023/T024; T026–T029 dependem de T025.

## Parallel Opportunities

- Modelos e testes marcados `[P]` podem ser feitos em paralelo dentro da história.
- Na US3, pricing/compras e estoque/vendas ocupam arquivos distintos após o serviço.
- Na US4, frontend models/service podem avançar em paralelo ao módulo da API após estabilizar o contrato.
- Na US5, menu, overview e revendedores ocupam arquivos distintos.

## Implementation Strategy

### MVP First

Completar T001–T014 entrega operações financeiras confiáveis sem depender do dashboard.

### Incremental Delivery

Cada checkpoint exige testes focados e build antes da próxima história. Nenhuma fase introduz dados substitutos para esconder uma fonte ausente.

## Format Validation

Todas as 49 tarefas usam checkbox, ID sequencial, rótulo de história nas fases de história, marcador `[P]` somente quando paralelizável e caminho de arquivo explícito.


