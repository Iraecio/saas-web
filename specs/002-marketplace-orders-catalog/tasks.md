# Tasks: Marketplace de Pedidos, Catálogo de Serviços e Escopo de Profissionais

**Input**: Design documents from `specs/002-marketplace-orders-catalog/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Não solicitados explicitamente. Apenas a task de teste do `order-actions` (matriz status×papel) é incluída por ser o ponto crítico de SC-003 — opcional, marcada como tal.

**Organization**: Tasks agrupadas por User Story para implementação e validação independentes.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências pendentes)
- **[Story]**: User story à qual a task pertence (ex: US1, US3...)
- Paths exatos incluídos em todas as descriptions

> **Nota**: US3–US8 vivem na mesma feature `orders` e compartilham `services/order.ts` — métodos no mesmo arquivo NÃO são `[P]` entre si. Páginas/componentes em arquivos distintos podem ser `[P]`.

---

## Phase 1: Foundational — Modelos de Dados

**Purpose**: Criar todas as interfaces TypeScript. Estas tasks BLOQUEIAM todas as phases de implementação.

**⚠️ CRÍTICO**: Nenhuma feature pode começar antes desta phase.

- [x] T001 [P] Criar `src/app/core/models/service.model.ts` com tipos `ProfessionalRole`, `ServiceScope`, `CreditType`, `ServiceAction` e interfaces `Service`, `CreateServiceDto`, `UpdateServiceDto`, `ServiceAuditEntry`, `ServiceListFilters` (conforme `data-model.md`)
- [x] T002 [P] Criar `src/app/core/models/order.model.ts` com tipos `OrderType`, `OrderStatus`, `DisputeDecision` e interfaces `Order`, `OrderBriefVersion`, `OrderDelivery`, `OrderStatusHistoryEntry`, `OrderListFilters`, `CreateOrderDto` e DTOs de ação (`ReasonDto`, `InstructionsDto`, `JustificationDto`, `UpdateBriefDto`, `DeliverDto`, `ResolveDisputeDto`)
- [x] T003 [P] Criar `src/app/core/models/professional.model.ts` com `Professional`, `ProfessionalListResponse`, `ProfessionalListFilters`, `SetScopeDto`
- [x] T004 [P] Criar `src/app/core/models/withdrawal.model.ts` com tipo `WithdrawalStatus` e interfaces `WithdrawalRequest`, `WithdrawalListFilters`, `CompleteWithdrawalDto`, `RejectWithdrawalDto`
- [x] T005 [P] Criar `src/app/core/models/reseller-credit.model.ts` com `EmitCreditDto`, `CreditEmission`, `EmissionsSummary`, `EmissionsReport`, `EmissionsFilters`
- [x] T006 [P] Estender `src/app/core/models/wallet.model.ts` adicionando tipo `WalletType` e interface `Wallet` (PLATFORM/RESELLER) — sem remover os tipos existentes

**Checkpoint**: Modelos completos — TypeScript valida tipos em todos os novos serviços.

---

## Phase 2: User Story 1 + 2 — Catálogo de Serviços (Priority: P1)

**Goal**: ADMIN gerencia serviços GLOBAIS e RESELLER gerencia serviços PARTICULARES, com auditoria. Desbloqueia a criação de pedidos.

**Independent Test**: Logar como ADMIN, criar serviço VOICE_ACTOR GLOBAL, vê-lo na listagem pública e no histórico de auditoria; alterar `creditCost` exige confirmação de impacto.

- [x] T007 [US1] Criar `ServiceCatalogService` com `list(filters)`, `getById(id)`, `create(dto)`, `update(id, dto)` (anexa `confirmImpact` quando altera `creditCost`/`defaultDeliveryHours`/`maxRevisions`), `deactivate(id)`, `activate(id)`, `getAudit(id)` em `src/app/features/services/services/service-catalog.ts`
- [x] T008 [US1] Criar `ServicesListPage` com tabela e filtros (`professionalRole`; `ownerId`/`includeInactive` apenas para ADMIN); ocultar ações de edição/inativação para serviços que o usuário não possui em `src/app/features/services/pages/list/list.ts`
- [x] T009 [US1] Criar `ServiceFormPage` (criar/editar) com campos por papel (ADMIN: escopo GLOBAL + `professionalPayout` obrigatório; RESELLER: escopo PARTICULAR inferido, sem campo de escopo); diálogo de confirmação de impacto que reenvia com `confirmImpact: true` e trata o 422 em `src/app/features/services/pages/form/form.ts`
- [x] T010 [P] [US2] Criar `ServiceAuditPage` exibindo histórico (`GET /services/:id/audit`) com ação, ator, papel, campos alterados (from→to) e data em `src/app/features/services/pages/audit/audit.ts`
- [x] T011 [US1] Criar `src/app/features/services/services.routes.ts` com rotas lazy: `''` → list, `new` → form, `:id/edit` → form, `:id/audit` → audit
- [x] T012 [US1] Registrar `loadChildren` de `SERVICES_ROUTES` no path `services` com `roleGuard(['ADMIN','SUPER_ADMIN','RESELLER','RESELLER_MANAGER'])` em `src/app/app.routes.ts`

**Checkpoint**: Catálogo completo — serviços podem ser criados e referenciados na criação de pedidos.

---

## Phase 3: User Story 3 — Cliente Cria Pedido (Priority: P1)

**Goal**: CLIENT cria pedido VOICE (JSON) ou PRODUCTION (multipart com upload), com reserva de créditos e seleção de serviço compatível.

**Independent Test**: Logar como CLIENT com saldo PLATFORM, escolher locutor GLOBAL → serviço → script → criar; pedido fica PENDING e saldo disponível reduz pela reserva.

- [x] T013 [US3] Criar `OrderService` com `list(filters)`, `getById(id)`, `getHistory(id)` e `create(dto)` — `create` usa `HttpClient` + `FormData` com `reportProgress` para PRODUCTION/upload (ver `quickstart.md`) e JSON para VOICE — em `src/app/features/orders/services/order.ts`
- [x] T014 [US3] Criar `OrderCreatePage` (CLIENT): seletor de profissional → carrega serviços compatíveis via `ServiceCatalogService` filtrando por `scope`/`professionalRole` → campo `briefingText` (VOICE) ou upload de áudio (PRODUCTION) com validação de formato/tamanho e barra de progresso → indica carteira/crédito a debitar → trata 400/402/403/422 em `src/app/features/orders/pages/create/create.ts`
- [x] T015 [US3] Criar `OrdersListPage` consumindo `GET /orders` (a API segmenta por papel) com filtros `status`/`orderType`/período e paginação em `src/app/features/orders/pages/list/list.ts`
- [x] T016 [US3] Criar `src/app/features/orders/orders.routes.ts` com rotas lazy: `''` → list, `new` → create, `:id` → detail (detail criada na Phase 4)
- [x] T017 [US3] Registrar `loadChildren` de `ORDERS_ROUTES` no path `orders` (sob `authGuard`, sem `roleGuard` — segmentação na página) em `src/app/app.routes.ts`

**Checkpoint**: US3 completo — cliente cria pedidos e os vê na listagem.

---

## Phase 4: User Story 4 — Profissional Gerencia Pedidos (Priority: P1)

**Goal**: Profissional pede revisão de briefing, aceita, recusa, entrega e re-entrega áudio. Inclui a página de detalhe e o componente de ações.

**Independent Test**: Logar como VOICE_ACTOR, abrir pedido PENDING e aceitar; status vira IN_PROGRESS com prazo definido.

- [x] T018 [US4] Adicionar ao `OrderService` os métodos `requestBriefRevision(id, dto)`, `accept(id)`, `refuse(id, dto)`, `deliver(id, dto)` (multipart com `redeliveryReason` opcional) em `src/app/features/orders/services/order.ts`
- [x] T019 [US4] Criar função pura `availableOrderActions(status, role, isOwnerClient, isAssignedProfessional)` (matriz status×papel do `quickstart.md`) em `src/app/features/orders/components/order-actions/order-actions.logic.ts`
- [x] T020 [US4] Criar `OrderActionsComponent` que renderiza apenas as ações retornadas por `availableOrderActions` e emite eventos para a página de detalhe em `src/app/features/orders/components/order-actions/order-actions.ts`
- [x] T021 [P] [US4] Criar `AudioDeliveryComponent` com `<audio controls>` + download da entrega atual e upload de re-entrega (`redeliveryReason` obrigatório) em `src/app/features/orders/components/audio-delivery/audio-delivery.ts`
- [x] T022 [US4] Criar `OrderDetailPage` exibindo status, serviço, créditos, prazo, `revisionCount`/`maxRevisions`, briefing atual, entrega atual (via `AudioDeliveryComponent`) e barra de ações (`OrderActionsComponent`); reflete novo status/saldo após cada ação em `src/app/features/orders/pages/detail/detail.ts`
- [x] T023 [P] [US4] (opcional) Teste de `availableOrderActions` cobrindo cada combinação status×papel em `src/app/features/orders/components/order-actions/order-actions.logic.spec.ts`

**Checkpoint**: US4 completo — profissional executa todo o ciclo até a entrega; detalhe do pedido operacional.

---

## Phase 5: User Story 5 — Cliente Revisa Entrega (Priority: P1)

**Goal**: Cliente aprova, solicita revisão de áudio (dentro do limite) ou abre disputa.

**Independent Test**: Logar como CLIENT em pedido REVIEW e aprovar; status vira COMPLETED e créditos são debitados.

- [x] T024 [US5] Adicionar ao `OrderService` os métodos `updateBrief(id, dto)` (multipart opcional), `approve(id)`, `requestRevision(id, dto)`, `dispute(id, dto)` em `src/app/features/orders/services/order.ts`
- [x] T025 [US5] Integrar as ações de cliente (`approve`/`requestRevision`/`dispute`/`updateBrief`) no `OrderActionsComponent`/`OrderDetailPage`; desabilitar `requestRevision` quando `revisionCount >= maxRevisions` (exibir apenas approve/dispute) e tratar 422 do limite em `src/app/features/orders/pages/detail/detail.ts`

**Checkpoint**: US5 completo — ciclo financeiro principal (aprovação/revisão/disputa) operante.

---

## Phase 6: User Story 6 — Resolução de Disputas (Priority: P2)

**Goal**: ADMIN (qualquer) e RESELLER (PARTICULARES da rede) resolvem disputas.

**Independent Test**: Logar como ADMIN, abrir pedido DISPUTED, resolver FAVOR_CLIENT; créditos voltam e status vira CANCELLED.

- [x] T026 [US6] Adicionar `resolve(id, dto: ResolveDisputeDto)` ao `OrderService` em `src/app/features/orders/services/order.ts`
- [x] T027 [US6] Adicionar à `OrdersListPage` um filtro/visão de pedidos `DISPUTED` para ADMIN/RESELLER e, no `OrderDetailPage`, a ação de resolução (decisão FAVOR_CLIENT/FAVOR_PROFESSIONAL + notas), exibindo briefing e todas as versões de entrega em `src/app/features/orders/pages/detail/detail.ts`

**Checkpoint**: US6 completo — nenhuma disputa fica sem caminho de resolução.

---

## Phase 7: User Story 7 — Histórico e Auditoria do Pedido (Priority: P3)

**Goal**: Linha do tempo de transições de status no detalhe do pedido.

**Independent Test**: Abrir pedido com várias transições e ver cada uma com status anterior/novo, ator, papel e data.

- [x] T028 [P] [US7] Criar `OrderTimelineComponent` consumindo `getHistory(id)` e renderizando linha do tempo cronológica (`fromStatus`→`toStatus`, ator, papel, notas, data) em `src/app/features/orders/components/order-timeline/order-timeline.ts`
- [x] T029 [US7] Integrar `OrderTimelineComponent` ao `OrderDetailPage` em `src/app/features/orders/pages/detail/detail.ts`

**Checkpoint**: US7 completo — rastreabilidade visível para as partes do pedido.

---

## Phase 8: User Story 8 — Cancelamento pelo Cliente (Priority: P3)

**Goal**: Cancelar PENDING/AWAITING_BRIEF livremente; IN_PROGRESS só com prazo excedido.

**Independent Test**: Cancelar pedido PENDING e ver créditos liberados imediatamente.

- [x] T030 [US8] Adicionar `cancel(id)` ao `OrderService` em `src/app/features/orders/services/order.ts`
- [x] T031 [US8] Habilitar a ação `cancel` no `OrderActionsComponent` conforme a matriz (PENDING/AWAITING_BRIEF; IN_PROGRESS apenas se `now() > deadlineAt`) com mensagem explicativa quando bloqueado em `src/app/features/orders/components/order-actions/order-actions.ts`

**Checkpoint**: US8 completo — cancelamento coberto em todos os estados permitidos.

---

## Phase 9: User Story 9 — Profissionais por Escopo (Priority: P2)

**Goal**: Listar locutores/produtores e classificar escopo (ADMIN→GLOBAL, RESELLER→PARTICULAR).

**Independent Test**: Logar como ADMIN, definir escopo de um locutor como GLOBAL; ele passa a aparecer para todas as revendas.

- [x] T032 [US9] Criar `ProfessionalService` com `listVoiceActors(filters)`, `listProducers(filters)`, `setScope(type, id, dto)` em `src/app/features/professionals/services/professional.ts`
- [x] T033 [US9] Criar `ProfessionalsListPage` com toggle locutores/produtores, filtro por escopo e paginação em `src/app/features/professionals/pages/list/list.ts`
- [x] T034 [P] [US9] Criar `ScopeDialogComponent` para ADMIN (GLOBAL) e RESELLER (PARTICULAR, `resellerId` obrigatório), tratando 400 (validação) e 409 (pedidos ativos) em `src/app/features/professionals/pages/scope-dialog/scope-dialog.ts`
- [x] T035 [US9] Criar `professionals.routes.ts` e registrar `loadChildren` no path `professionals` (sob `authGuard`; ação de escopo restrita na UI) em `src/app/features/professionals/professionals.routes.ts` e `src/app/app.routes.ts`

**Checkpoint**: US9 completo — escopo de profissionais gerenciável.

---

## Phase 10: User Story 10 — Saques de Profissionais Globais (Priority: P2)

**Goal**: Profissional GLOBAL solicita saque; ADMIN processa/completa/rejeita.

**Independent Test**: Profissional GLOBAL com ≥300 créditos solicita saque (PENDING); ADMIN completa com `paymentReference`.

- [x] T036 [US10] Criar `WithdrawalService` com `request()`, `list(filters)`, `process(id)`, `complete(id, dto)`, `reject(id, dto)` em `src/app/features/withdrawals/services/withdrawal.ts`
- [x] T037 [P] [US10] Criar `MyWithdrawalsPage` (profissional): exibe saldo acumulado e mínimo de 300, botão de solicitação (desabilitado abaixo do mínimo; bloqueado para PARTICULAR com aviso), lista de solicitações; trata 409 em `src/app/features/withdrawals/pages/my-withdrawals/my-withdrawals.ts`
- [x] T038 [P] [US10] Criar `AdminWithdrawalsPage` (ADMIN): fila com filtro por status e ações process/complete (`paymentReference`)/reject (motivo) em `src/app/features/withdrawals/pages/admin-withdrawals/admin-withdrawals.ts`
- [x] T039 [US10] Criar `withdrawals.routes.ts` e registrar `loadChildren` no path `withdrawals` com `roleGuard(['VOICE_ACTOR','PRODUCER','ADMIN','SUPER_ADMIN'])` em `src/app/features/withdrawals/withdrawals.routes.ts` e `src/app/app.routes.ts`

**Checkpoint**: US10 completo — fluxo de saque ponta a ponta.

---

## Phase 11: User Story 11 — Emissão de Créditos RESELLER (Priority: P2)

**Goal**: Revenda emite créditos para clientes da rede e consulta relatório.

**Independent Test**: Logar como RESELLER, emitir 100 créditos para um cliente; saldo RESELLER do cliente aumenta e a emissão aparece no relatório.

- [x] T040 [US11] Criar `ResellerCreditService` com `emit(dto)`, `listEmissions(filters)` em `src/app/features/reseller-credits/services/reseller-credit.ts`
- [x] T041 [P] [US11] Criar `EmitCreditPage` com seleção de cliente da rede + `creditAmount` + `unitValueCents`, exibindo `newWalletBalance` na resposta e tratando 403 (cliente fora da rede) em `src/app/features/reseller-credits/pages/emit/emit.ts`
- [x] T042 [P] [US11] Criar `EmissionsReportPage` com filtros (período, cliente), paginação e resumo (total emitido/utilizado) em `src/app/features/reseller-credits/pages/emissions/emissions.ts`
- [x] T043 [US11] Criar `reseller-credits.routes.ts` e registrar `loadChildren` no path `reseller-credits` com `roleGuard(['RESELLER','RESELLER_MANAGER','ADMIN','SUPER_ADMIN'])` em `src/app/features/reseller-credits/reseller-credits.routes.ts` e `src/app/app.routes.ts`

**Checkpoint**: US11 completo — emissão e relatório de créditos RESELLER.

---

## Phase 12: User Story 12 — Dupla Carteira (Priority: P2)

**Goal**: Exibir carteiras PLATFORM e RESELLER separadas; sem transferência entre elas.

**Independent Test**: CLIENT de revenda vê as duas carteiras; cliente sem revenda vê apenas PLATFORM (403 da RESELLER tratado silenciosamente).

- [x] T044 [US12] Adicionar `getPlatformWallet()` e `getResellerWallet()` ao `WalletService` em `src/app/features/wallet/services/wallet.ts`
- [x] T045 [US12] Atualizar `WalletBalancePage` para exibir as duas carteiras (`availableCredits`/`frozenCredits`/`currency`); tratar 403 da RESELLER para clientes sem `resellerId` sem erro visível; não oferecer transferência/conversão em `src/app/features/wallet/pages/balance/balance.ts`

**Checkpoint**: US12 completo — visão de dupla carteira.

---

## Phase 13: Navegação e Polimento

**Purpose**: Tornar as novas features acessíveis e consistentes.

- [x] T046 Adicionar itens de menu na sidebar para `services`, `orders`, `professionals`, `withdrawals`, `reseller-credits` — exibindo cada item apenas para papéis com acesso (reaproveitar a lógica de visibilidade já usada por `wallet-admin`/`custom-domains`) no componente da sidebar do `admin-layout`
- [x] T047 Revisar tratamento de erro consistente (400/402/403/409/422) via `NotificationService` em todas as novas páginas (ver tabela do `quickstart.md`)
- [x] T048 Verificar compatibilidade SSR de todas as novas páginas (sem `window`/`localStorage` direto fora de `isPlatformBrowser`; `<audio>`/upload apenas em interação)

**Checkpoint**: Marketplace navegável e polido — todas as user stories acessíveis pelos papéis corretos.

---

## Dependências entre Phases

```
Phase 1 (modelos) ─┬─→ Phase 2 (services) ──→ Phase 3 (criar pedido) ──→ Phase 4 (profissional)
                   │                                                          │
                   │                                                          ├─→ Phase 5 (cliente revisa)
                   │                                                          ├─→ Phase 6 (disputas)
                   │                                                          ├─→ Phase 7 (histórico)
                   │                                                          └─→ Phase 8 (cancelamento)
                   ├─→ Phase 9 (profissionais escopo)   [independente de orders]
                   ├─→ Phase 10 (saques)                [independente de orders]
                   ├─→ Phase 11 (emissão créditos)      [independente de orders]
                   └─→ Phase 12 (dupla carteira)        [independente de orders]
Phase 13 (navegação) depende de todas as features-alvo existirem.
```

- **MVP mínimo (P1)**: Phases 1 → 2 → 3 → 4 → 5. Entrega o fluxo de pedido ponta a ponta com catálogo.
- **Paralelizável**: Phases 9, 10, 11, 12 podem ser desenvolvidas em paralelo entre si (e em paralelo a 5–8) por equipes/sessões diferentes, pois tocam features distintas.
- Dentro de `orders` (Phases 3–8), métodos no mesmo `order.ts` são sequenciais; páginas/componentes distintos são `[P]`.
