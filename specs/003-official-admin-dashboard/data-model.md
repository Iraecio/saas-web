# Data Model: Dashboard Administrativo com Dados Oficiais

## Princípios

- Reutilizar entidades persistidas existentes; o resumo administrativo não cria tabela.
- Manter centavos (`*Cents`) separados de quantidades de créditos.
- Preservar estados como enums oficiais, sem rótulos livres no contrato.
- IDs são UUIDs; datas são ISO 8601 em UTC no transporte.

## AdminDashboardSummary (read model)

| Campo | Tipo | Regra |
|---|---|---|
| `period` | `DashboardPeriod` | Período atual e anterior resolvidos no servidor |
| `metrics` | `AdminDashboardMetrics` | Contagens e movimentações oficiais |
| `recentOrders` | `RecentOrder[]` | Máximo 10, mais recentes primeiro |
| `pendingActions` | `PendingAction[]` | Máximo 20, prioridade/data |
| `generatedAt` | datetime | Instante da fotografia |

### DashboardPeriod

`from`, `to`, `previousFrom`, `previousTo`, `timezone`.

### MetricValue

`current`, `previous`, `variationPercent: number | null`, `comparisonLabel: NORMAL | NO_BASELINE` e `unit: COUNT | CREDITS | CENTS`.

### AdminDashboardMetrics

- `activeUsers`
- `ordersCreated`
- `creditsIssued`
- `creditsSpent`
- `creditsRefunded`
- `availableProfessionals`
- `pendingDisputes`
- `pendingRefunds`
- `pendingWithdrawals`
- `pendingCreditPurchases`

## PendingAction

| Campo | Tipo | Regra |
|---|---|---|
| `id` | UUID | ID da entidade fonte |
| `type` | enum | `CREDIT_DISPUTE`, `REFUND`, `WITHDRAWAL`, `CREDIT_PURCHASE`, `ROLE_REQUEST`, `RECONCILIATION` |
| `priority` | enum | `HIGH`, `MEDIUM`, `LOW`, calculada por tipo/idade |
| `title` | string | Texto factual, sem dados inventados |
| `createdAt` | datetime | Data da entidade fonte |
| `targetPath` | string | Destino frontend existente e autorizado |

## Order

Agregado existente com `id`, `clientId`, `resellerId?`, `briefing?`, `lineItems[]`, totais e timestamps. O estado operacional deve ser derivado/exibido por item.

## OrderLineItem

Campos relevantes: `id`, `orderId`, `serviceId?`, `professionalId?`, `parentLineItemId?`, `briefingText?`, `status`, `priceCredits`, `professionalPayoutCents`, `deadline?`, entregas, disputa e timestamps.

### Transições

`AWAITING_ASSIGNMENT → PENDING` por atribuição; `PENDING ↔ AWAITING_BRIEF`; `PENDING → IN_PROGRESS` por aceite; `IN_PROGRESS → REVIEW` por entrega; `REVIEW → COMPLETED` por aprovação; revisão/reentrega conforme regra; disputa para `DISPUTED`; cancelamento/recusa para estado terminal permitido. O frontend sempre usa o conjunto de ações derivado de papel + estado.

## Wallet e Credit

`Wallet` é única por usuário e contém `availableCredits`, `frozenCredits`, `expiredCredits`, totais e moeda. `Credit` contém origem, tipo, status, `valueCents`, `costCents`, emissão e expiração. Extrato usa `items` e `nextCursor`.

## ResellerCreditPurchase

`id`, `resellerId`, `creditAmount`, `unitPriceCents`, `totalCents`, `status`, `paymentReference?`, `createdAt`. Estados: `PENDING_PAYMENT → CONFIRMED` ou `CANCELLED`; confirmação cria lote uma única vez.

## ResellerStockLot

`id`, `sourceType`, `initialCredits`, `remainingCredits`, `unitCostCents`, `createdAt`. Validações: quantidades não negativas; consumo FIFO; soma de `remainingCredits` igual ao total disponível.

## ResellerCreditSale

`id`, `resellerId`, `clientId`, `creditAmount`, `unitSalePriceCents`, `totalSaleCents`, `totalCostCents`, `marginCents`, `createdAt`. `marginCents = totalSaleCents - totalCostCents`.

## Pagination View Models

- `CursorPage<T>`: `items`, `nextCursor`.
- `OffsetPage<T>`: `items`, `limit`, `offset`, `hasMore` (derivado quando a API retornar array).
- `NumberedPage<T>`: `items`, `page`, `limit`, `total`, `totalPages` quando disponível.

Esses modelos normalizam a UI, mas cada serviço envia somente os parâmetros aceitos pelo domínio.
