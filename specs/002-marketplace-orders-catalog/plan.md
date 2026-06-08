# Implementation Plan: Marketplace de Pedidos, Catálogo de Serviços e Escopo de Profissionais

**Branch**: `002-marketplace-orders-catalog` | **Date**: 2026-06-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-marketplace-orders-catalog/spec.md`

---

## Summary

Adicionar ao frontend (saas-web, Angular 21) a camada de **marketplace de áudio** já entregue na saas-api (specs 004/005/006): catálogo de serviços com auditoria, ciclo de vida completo de pedidos (VOICE/PRODUCTION), classificação de profissionais por escopo, saques de profissionais globais, emissão de créditos RESELLER e a evolução da carteira para o modelo de dupla carteira (PLATFORM/RESELLER). O trabalho cria 5 novas features standalone (`services`, `orders`, `professionals`, `withdrawals`, `reseller-credits`) e evolui a feature `wallet` existente, mantendo a convenção de domínio já adotada no spec `001`.

---

## Technical Context

**Language/Version**: TypeScript 5.9

**Primary Dependencies**: Angular 21.2 (standalone components, signals, SSR), PrimeNG 21.1, Tailwind CSS 4, RxJS 7.8

**Storage**: LocalStorage para tokens de sessão (`saas-web.accessToken`, `saas-web.refreshToken`) — acesso somente via `isPlatformBrowser`

**Testing**: Vitest 4.x (unit/component `.spec.ts`)

**Target Platform**: Web (browser + Angular SSR via Express 5)

**Project Type**: Web application (SPA com SSR)

**Base da API**: `environment.apiUrl = '/v1'` — services chamam endpoints **sem** o prefixo `/v1` (ex.: `api.get('/orders')`). Toda resposta vem no envelope `{ success, data }` e é desembrulhada por interceptor antes de chegar ao service.

**Performance Goals**: Listagens carregam em < 2s com paginação; uploads de áudio (briefing PRODUCTION e entrega) exibem progresso contínuo; ações de pedido refletem novo status em < 2s.

**Constraints**: Sem novas dependências de runtime; compatível com SSR; uploads e player de áudio usam recursos nativos do browser + PrimeNG já presentes.

**Scale/Scope**: 7 papéis de usuário; ~30 endpoints novos; ~18 páginas novas; 6 features (5 novas + 1 evoluída).

---

## Constitution Check

> A constitution do projeto permanece com template placeholder — sem princípios formais.
> **Gates**: nenhuma violação. Prosseguir.

**Post-design re-evaluation**: As novas features seguem o padrão standalone-por-domínio já validado no `001`. O serviço HTTP central (`core/services/api.ts`) é reutilizado; nenhum novo padrão arquitetural é introduzido. Nenhuma violação.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-marketplace-orders-catalog/
├── plan.md              ← este arquivo
├── spec.md              ← especificação da feature
├── research.md          ← decisões técnicas e divergências de contrato resolvidas
├── data-model.md        ← interfaces TypeScript a criar/estender
├── quickstart.md        ← convenções e guia de implementação
├── contracts/           ← (referência ao contrato da API; ver research.md)
└── tasks.md             ← gerado por /speckit-tasks (ainda não criado)
```

### Source Code

```text
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts                     [existente]
│   │   │   └── role.guard.ts                     [existente — reutilizar]
│   │   ├── models/
│   │   │   ├── service.model.ts                  [NOVO]
│   │   │   ├── order.model.ts                    [NOVO]
│   │   │   ├── professional.model.ts             [NOVO]
│   │   │   ├── withdrawal.model.ts               [NOVO]
│   │   │   ├── reseller-credit.model.ts          [NOVO]
│   │   │   └── wallet.model.ts                    [existente — estender p/ dupla carteira]
│   │   └── services/
│   │       └── api.ts                             [existente — usar get/post/put/patch/delete genéricos]
│   ├── features/
│   │   ├── services/                              [NOVO — catálogo de serviços]
│   │   │   ├── pages/
│   │   │   │   ├── list/                          (listagem c/ filtros por papel)
│   │   │   │   ├── form/                          (criar/editar; confirmImpact em campos críticos)
│   │   │   │   └── audit/                         (histórico de auditoria do serviço)
│   │   │   ├── services/service-catalog.ts
│   │   │   └── services.routes.ts
│   │   ├── orders/                                [NOVO — order flow completo]
│   │   │   ├── pages/
│   │   │   │   ├── list/                          (segmentada por papel; filtros status/tipo/período)
│   │   │   │   ├── create/                        (cliente: escolher profissional→serviço→briefing/upload)
│   │   │   │   └── detail/                         (status, briefing, entregas, ações por papel, histórico)
│   │   │   ├── components/
│   │   │   │   ├── order-actions/                 (botões de ação derivados de status+papel)
│   │   │   │   ├── order-timeline/                (histórico de transições)
│   │   │   │   └── audio-delivery/                (player/download + upload de entrega)
│   │   │   ├── services/order.ts
│   │   │   └── orders.routes.ts
│   │   ├── professionals/                         [NOVO — escopo de profissionais]
│   │   │   ├── pages/
│   │   │   │   ├── list/                          (locutores/produtores, filtro por escopo)
│   │   │   │   └── scope-dialog/                  (definir GLOBAL/PARTICULAR — ADMIN/RESELLER)
│   │   │   ├── services/professional.ts
│   │   │   └── professionals.routes.ts
│   │   ├── withdrawals/                           [NOVO — saques]
│   │   │   ├── pages/
│   │   │   │   ├── my-withdrawals/                (profissional: saldo, solicitar, listar)
│   │   │   │   └── admin-withdrawals/             (ADMIN: process/complete/reject)
│   │   │   ├── services/withdrawal.ts
│   │   │   └── withdrawals.routes.ts
│   │   ├── reseller-credits/                      [NOVO — emissão de créditos RESELLER]
│   │   │   ├── pages/
│   │   │   │   ├── emit/                          (formulário de emissão)
│   │   │   │   └── emissions/                     (relatório c/ filtros e resumo)
│   │   │   ├── services/reseller-credit.ts
│   │   │   └── reseller-credits.routes.ts
│   │   ├── wallet/                                [existente — EVOLUIR p/ dupla carteira]
│   │   │   ├── pages/balance/                     (exibir PLATFORM + RESELLER)
│   │   │   └── services/wallet.ts                 (adicionar getPlatformWallet/getResellerWallet)
│   │   └── (demais features existentes inalteradas)
│   └── app.routes.ts                              [existente — registrar 5 novas rotas + guards]
└── environments/                                  [existente — sem mudança]
```

**Structure Decision**: Uma feature por domínio de marketplace. `orders` recebe subpasta `components/` (diferente das features do `001`) porque concentra UI reutilizável complexa — ações por status, timeline e player/upload de áudio. `professionals`, `withdrawals` e `reseller-credits` são features enxutas (2 páginas cada). `wallet` é **evoluída**, não recriada.

---

## Implementation Phases

> Ordem por prioridade do spec (P1 → P3). Cada fase é independentemente testável e entrega valor.

### Phase 0 — Fundação compartilhada (pré-requisito de todas)

- Criar os modelos em `core/models/` (ver `data-model.md`): `service.model.ts`, `order.model.ts`, `professional.model.ts`, `withdrawal.model.ts`, `reseller-credit.model.ts`; estender `wallet.model.ts`.
- Confirmar/ajustar `UserRole` para incluir os papéis usados nos guards (`VOICE_ACTOR`, `PRODUCER`, `CLIENT`, `RESELLER`, `RESELLER_MANAGER`, `ADMIN`, `SUPER_ADMIN`) — usar os já existentes.
- Não adicionar métodos ao `ApiService`: usar os genéricos `get/post/put/patch/delete` e criar um helper de upload `multipart` (via `FormData` + `HttpClient`) no service de `orders`.

### Phase 1 — Catálogo de Serviços (US1, US2) `services`

- `service-catalog.ts`: `list(filters)`, `getById(id)`, `create(dto)`, `update(id, dto)` (anexa `confirmImpact` quando campos críticos), `deactivate(id)`, `activate(id)`, `getAudit(id)`.
- Páginas `list` (filtros `professionalRole`/`ownerId`/`includeInactive` conforme papel), `form` (criar/editar com diálogo de confirmação de impacto), `audit`.
- Ocultar ações de edição/inativação para serviços que o usuário não possui.
- Registrar rota `/admin/services` com `roleGuard` permitindo ADMIN/SUPER_ADMIN/RESELLER/RESELLER_MANAGER (visibilidade refinada dentro da página).

### Phase 2 — Pedidos: criação e listagem (US3, parte de US4/US5) `orders`

- `order.ts`: `list(filters)`, `getById(id)`, `getHistory(id)`, `create(dto)` (JSON para VOICE, `FormData` para PRODUCTION com progresso), e os métodos de ação (`accept`, `refuse`, `deliver`, `requestBriefRevision`, `updateBrief`, `approve`, `requestRevision`, `dispute`, `resolve`, `cancel`).
- Página `create` (CLIENT): seletor de profissional → carrega serviços compatíveis (via `service-catalog` + filtro de escopo/role) → briefing (texto) ou upload de áudio → indica carteira/crédito a debitar → trata 402/403/422.
- Página `list`: segmentada por papel via `GET /v1/orders` (a própria API filtra); filtros de status/tipo/período + paginação.

### Phase 3 — Pedidos: ações de ciclo de vida (US4, US5, US6, US7, US8) `orders`

- Página `detail` + componente `order-actions`: renderiza apenas as ações válidas para `status` × papel (matriz no `quickstart.md`).
- Componente `audio-delivery`: player/download da entrega atual + upload de re-entrega com `redeliveryReason`.
- Componente `order-timeline`: consome `GET /v1/orders/:id/history`.
- Fluxo de disputa (abrir pelo cliente; resolver por ADMIN/RESELLER com decisão+notas).
- Cancelamento conforme status (PENDING/AWAITING_BRIEF livre; IN_PROGRESS só com prazo excedido).

### Phase 4 — Profissionais por escopo (US9) `professionals`

- `professional.ts`: `listVoiceActors(filters)`, `listProducers(filters)`, `setScope(type, id, dto)`.
- Página `list` com toggle locutores/produtores e filtro por escopo; `scope-dialog` para ADMIN (GLOBAL) e RESELLER (PARTICULAR), tratando 409.

### Phase 5 — Saques (US10) `withdrawals`

- `withdrawal.ts`: `request()`, `list(filters)`, `process(id)`, `complete(id, dto)`, `reject(id, dto)`.
- Página `my-withdrawals` (profissional: saldo acumulado, mínimo 300, solicitar, histórico; bloqueio para PARTICULAR) e `admin-withdrawals` (fila + ações ADMIN).

### Phase 6 — Emissão de créditos RESELLER (US11) `reseller-credits`

- `reseller-credit.ts`: `emit(dto)`, `listEmissions(filters)`.
- Página `emit` (seleção de cliente da rede + quantidade + valor unitário) e `emissions` (relatório com filtros e resumo).

### Phase 7 — Dupla carteira (US12) `wallet` (evolução)

- Adicionar `getPlatformWallet()` e `getResellerWallet()` ao `wallet.ts`.
- Atualizar a página `balance` para exibir as duas carteiras (`availableCredits`/`frozenCredits`/`currency`); tratar 403 da RESELLER silenciosamente para clientes sem `resellerId`.

---

## Navigation & Routing

Registrar em `app.routes.ts` (dentro de `admin` layout, com `authGuard` herdado):

| Rota | Feature | `roleGuard` | Item de menu (para) |
|---|---|---|---|
| `services` | services | ADMIN, SUPER_ADMIN, RESELLER, RESELLER_MANAGER | Admin/Revenda |
| `orders` | orders | (qualquer autenticado — segmentação na página) | Todos |
| `professionals` | professionals | (qualquer autenticado; ação de escopo restrita) | Todos (gestão p/ ADMIN/RESELLER) |
| `withdrawals` | withdrawals | VOICE_ACTOR, PRODUCER, ADMIN, SUPER_ADMIN | Profissional/Admin |
| `reseller-credits` | reseller-credits | RESELLER, RESELLER_MANAGER, ADMIN, SUPER_ADMIN | Revenda/Admin |

O menu lateral (sidebar) deve exibir cada item somente para papéis com acesso, reaproveitando a lógica de visibilidade já usada por `wallet-admin`/`custom-domains`.

---

## Testing Strategy

- **Unit (services)**: mockar `ApiService` e validar que cada método monta a URL/`query`/body corretos — com atenção ao `multipart` de `create`/`deliver`/`update-brief` e à anexação de `confirmImpact`.
- **Component (`.spec.ts`)**: a matriz de ações de pedido (`order-actions`) é o ponto mais crítico — testar que cada combinação `status` × papel renderiza apenas as ações válidas (cobre SC-003).
- **Tratamento de erro**: testar render das mensagens para 402 (saldo), 403 (autorização), 409 (escopo c/ pedidos ativos) e 422 (incompatibilidade / `confirmImpact`).
- Sem testes E2E nesta fase (não há infra E2E no projeto).

---

## Risks & Open Questions

1. **Divergência de contrato 004 vs 005/006** — `briefing`/`serviceTypeId`/`reject` (004) vs `briefingText`/`serviceId`/`refuse` (005/006). **Decisão (research.md R-001)**: seguir 005/006 (mais recentes) + tabela de endpoints do `saas-api/CLAUDE.md`. Validar contra a API real na Phase 2 antes de finalizar o service.
2. **Formato exato do payload de criação de pedido** (campo `orderType` explícito vs inferido pelo serviço) — confirmar na integração.
3. **Visibilidade de serviços para o cliente ao criar pedido** — a API filtra por papel em `GET /v1/services`; validar se o filtro por profissional selecionado é client-side (escopo/role) ou requer query específica.
4. **Shape do profissional** (`producers` vs `voice-actors`) — campos específicos do produtor não detalhados no contrato; modelar genérico e refinar na integração.

---

## Complexity Tracking

> Nenhuma violação de constitution. Seção não aplicável.
