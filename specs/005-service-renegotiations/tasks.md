# Tasks: Gestão de serviços e renegociações

**Input**: Design documents from `specs/005-service-renegotiations/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Incluídos para contratos financeiros, autorização de apresentação, estado na URL e principais jornadas administrativas.

**Organization**: Tasks are grouped by user story so each increment remains independently testable.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Alinhar contratos, rotas e estrutura antes da implementação visual.

- [ ] T001 Confirm the aggregate negotiation response against `specs/005-service-renegotiations/contracts/admin-negotiations-api.md`
- [ ] T002 [P] Add the feature component directories described by the plan under `src/app/features/services/components/`
- [ ] T003 [P] Add shared negotiation types and filter defaults in `src/app/core/models/service-negotiation.model.ts`
- [ ] T004 Add the aggregate manager queue and detail endpoints in `../saas-api/src/modules/professional-pricing/professional-pricing.controller.ts`
- [ ] T005 Add scoped aggregate query implementation and counters in `../saas-api/src/modules/professional-pricing/professional-pricing.service.ts`
- [ ] T006 Add API tests for global and reseller isolation in `../saas-api/src/modules/professional-pricing/professional-pricing.service.spec.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Construir contratos frontend, sincronização de navegação e componentes reutilizados por ambas as abas.

**⚠️ CRITICAL**: No user story work starts before this phase is complete.

- [ ] T007 Write negotiation service contract tests for list, detail, accept, reject and counter paths in `src/app/features/services/services/service-negotiation.spec.ts`
- [ ] T008 Implement the typed negotiation API client and query serialization in `src/app/features/services/services/service-negotiation.ts`
- [ ] T009 [P] Extend catalog service tests for search, scope, active state and mutation refresh behavior in `src/app/features/services/services/service-catalog.spec.ts`
- [ ] T010 Extend catalog list filtering without changing existing mutation contracts in `src/app/features/services/services/service-catalog.ts`
- [ ] T011 Create the tabbed catalog orchestration page and query-parameter state in `src/app/features/services/pages/catalog/catalog.ts`
- [ ] T012 Point the services root route to the catalog orchestration page while preserving form and audit routes in `src/app/features/services/services.routes.ts`
- [ ] T013 Create shared status, role, money and next-actor presentation helpers in `src/app/features/services/services/service-negotiation.presentation.ts`
- [ ] T014 Write unit tests for negotiation action eligibility and presentation helpers in `src/app/features/services/services/service-negotiation.presentation.spec.ts`

**Checkpoint**: API contract, frontend client, route and navigation state are ready.

---

## Phase 3: User Story 1 — Gerenciar o catálogo em um painel moderno (Priority: P1) 🎯 MVP

**Goal**: Deliver a complete, responsive service-management tab for each authorized scope.

**Independent Test**: A superadmin and a reseller can independently find and manage only their authorized services from the Services tab on desktop and mobile.

### Tests for User Story 1

- [ ] T015 [P] [US1] Add component tests for service metrics, filters, permission-aware actions and empty/error states in `src/app/features/services/components/service-list/service-list.spec.ts`
- [ ] T016 [P] [US1] Add catalog page tests for default tab and service-filter URL synchronization in `src/app/features/services/pages/catalog/catalog.spec.ts`

### Implementation for User Story 1

- [ ] T017 [P] [US1] Build reusable service summary metrics in `src/app/features/services/components/service-summary/service-summary.ts`
- [ ] T018 [US1] Build desktop table and mobile service cards with search, filters and action menus in `src/app/features/services/components/service-list/service-list.ts`
- [ ] T019 [US1] Integrate service summary, loading skeletons, contextual empty/error states and refresh into `src/app/features/services/pages/catalog/catalog.ts`
- [ ] T020 [US1] Modernize responsive fields, impact confirmation and inline validation in `src/app/features/services/pages/form/form.ts`
- [ ] T021 [US1] Modernize the service audit timeline and responsive back navigation in `src/app/features/services/pages/audit/audit.ts`
- [ ] T022 [US1] Verify owner-based action visibility for superadmin, reseller and reseller manager in `src/app/features/services/components/service-list/service-list.ts`

**Checkpoint**: User Story 1 is deployable as an independently useful catalog-management redesign.

---

## Phase 4: User Story 2 — Analisar e decidir renegociações pendentes (Priority: P1)

**Goal**: Deliver an administrative queue with sufficient context and safe accept, reject and counter actions.

**Independent Test**: Given pending voice-actor and producer proposals, an authorized manager can filter the queue and complete each valid decision while counters and status update in place.

### Tests for User Story 2

- [ ] T023 [P] [US2] Add negotiation list tests for filters, metrics, responsive representations and action eligibility in `src/app/features/services/components/negotiation-list/negotiation-list.spec.ts`
- [ ] T024 [P] [US2] Add decision flow tests for accept, required rejection reason, counter validation, duplicate blocking and conflict refresh in `src/app/features/services/components/negotiation-detail/negotiation-detail.spec.ts`

### Implementation for User Story 2

- [ ] T025 [P] [US2] Build negotiation summary counters and loading states in `src/app/features/services/components/service-summary/negotiation-summary.ts`
- [ ] T026 [US2] Build the paginated desktop queue and mobile cards with professional, service, price, variation and next-actor context in `src/app/features/services/components/negotiation-list/negotiation-list.ts`
- [ ] T027 [US2] Implement accept confirmation and authoritative response refresh in `src/app/features/services/components/negotiation-detail/negotiation-detail.ts`
- [ ] T028 [US2] Implement rejection form with required reason and preserved current price in `src/app/features/services/components/negotiation-detail/negotiation-detail.ts`
- [ ] T029 [US2] Implement counterproposal form with currency conversion, validation and pending-professional state in `src/app/features/services/components/negotiation-detail/negotiation-detail.ts`
- [ ] T030 [US2] Integrate queue filters, pagination, counters, detail selection and retry states into `src/app/features/services/pages/catalog/catalog.ts`

**Checkpoint**: User Stories 1 and 2 work independently; negotiation decisions use official API responses.

---

## Phase 5: User Story 3 — Acompanhar propostas e contrapropostas até o desfecho (Priority: P2)

**Goal**: Make the entire linked financial conversation understandable and identify the next responsible actor.

**Independent Test**: Opening a multi-round negotiation reveals every linked step, value, actor, note and decision in chronological order, with no invalid manager actions.

### Tests for User Story 3

- [ ] T031 [P] [US3] Add timeline tests for counter chains, final states, applied prices and pending-professional steps in `src/app/features/services/components/negotiation-detail/negotiation-detail.spec.ts`

### Implementation for User Story 3

- [ ] T032 [US3] Build the linked chronological timeline and current-step emphasis in `src/app/features/services/components/negotiation-detail/negotiation-detail.ts`
- [ ] T033 [US3] Add direct-link restoration for an open negotiation and safe fallback when it is unavailable in `src/app/features/services/pages/catalog/catalog.ts`
- [ ] T034 [US3] Add finalized-history filters and APPLIED/ACCEPTED/REJECTED/COUNTERED presentation in `src/app/features/services/components/negotiation-list/negotiation-list.ts`

**Checkpoint**: The manager can audit the complete lifecycle without leaving the catalog area.

---

## Phase 6: User Story 4 — Operar com acessibilidade em temas claro e escuro (Priority: P3)

**Goal**: Ensure the redesigned panel is operable across viewports, themes and keyboard navigation.

**Independent Test**: Primary catalog and negotiation journeys complete at 320, 768 and 1440 px in both themes and with keyboard-only input.

### Tests for User Story 4

- [ ] T035 [P] [US4] Add tab keyboard-navigation and focus-restoration tests in `src/app/features/services/pages/catalog/catalog.spec.ts`
- [ ] T036 [P] [US4] Add accessible-name, focus-trap and status-text tests in `src/app/features/services/components/negotiation-detail/negotiation-detail.spec.ts`

### Implementation for User Story 4

- [ ] T037 [US4] Implement semantic tablist behavior, arrow-key navigation and visible focus in `src/app/features/services/pages/catalog/catalog.ts`
- [ ] T038 [US4] Implement responsive drawer focus management, close behavior and focus return in `src/app/features/services/components/negotiation-detail/negotiation-detail.ts`
- [ ] T039 [US4] Replace hardcoded catalog colors with light/dark design tokens and reduced-motion-safe transitions in `src/styles.scss`
- [ ] T040 [US4] Verify 44px touch targets, no required horizontal scrolling and equivalent mobile actions in `src/app/features/services/components/negotiation-list/negotiation-list.ts`

**Checkpoint**: All stories meet responsive, theme and keyboard requirements.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final contract, regression, quality and documentation gates.

- [ ] T041 [P] Add Portuguese copy review and consistent direct success/error messages in `src/app/features/services/`
- [ ] T042 [P] Add service-management and negotiation examples to `specs/005-service-renegotiations/quickstart.md`
- [ ] T043 Run focused Vitest suites for services and catalog components using `package.json`
- [ ] T044 Run formatting and production SSR build gates using `package.json`
- [ ] T045 Validate all quickstart authorization, concurrency, responsive and theme scenarios in `specs/005-service-renegotiations/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately; T004–T006 are the backend integration dependency.
- **Foundational (Phase 2)**: Depends on T001 and T003; frontend mocks may unblock work before T004–T006 land.
- **US1 (Phase 3)**: Depends on frontend foundation, not on the aggregate negotiation endpoint.
- **US2 (Phase 4)**: Depends on T004–T014 and blocks only negotiation delivery.
- **US3 (Phase 5)**: Depends on the US2 detail and queue components.
- **US4 (Phase 6)**: Runs after target components exist; individual accessibility tests may be prepared earlier.
- **Polish (Phase 7)**: Depends on all selected stories.

### User Story Dependencies

- **US1 (P1)**: Independently deployable after Phase 2.
- **US2 (P1)**: Independently testable with the aggregate queue contract and decision endpoints.
- **US3 (P2)**: Extends US2 detail/history but does not affect service management.
- **US4 (P3)**: Cross-cuts both tabs after their interaction surfaces exist.

### Parallel Opportunities

- T002 and T003 can run in parallel.
- Backend T004–T006 can run in parallel with frontend model/client work T007–T014 after T001.
- US1 can proceed while the aggregate negotiation endpoint is implemented.
- Tests marked `[P]` target separate spec files and can be prepared alongside components.
- Summary components T017 and T025 are independent of their respective lists.

---

## Parallel Example: User Story 2

```text
Task T023: Test negotiation list states in service-list-independent spec.
Task T024: Test detail decisions in negotiation-detail spec.
Task T025: Build negotiation summary component.
```

After those complete, execute T026–T030 in dependency order.

---

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Deliver US1 as the modernized service catalog without waiting for negotiation aggregation.
3. Validate scope, mobile representation and existing CRUD regressions.
4. Deploy or demo the service-management increment.

### Incremental Delivery

1. Foundation + US1: modern catalog management.
2. API aggregate contract + US2: actionable negotiation queue.
3. US3: full counterproposal timeline and history.
4. US4 + Polish: accessibility, themes and production gates.

## Format Validation

- Total tasks: 45.
- US1: 8 tasks; US2: 8 tasks; US3: 4 tasks; US4: 6 tasks.
- Setup/foundation/polish: 19 tasks.
- Every task uses the required checkbox, sequential ID, optional `[P]`, story label where applicable and an explicit file path.
