# Contract: Integration Matrix

## Wallet user

| Capability | Official request | Pagination |
|---|---|---|
| Unified wallet | `GET /v1/wallet` | — |
| Balance | `GET /v1/wallet/balance` | — |
| Credits | `GET /v1/wallet/credits?cursor&limit&status&type` | cursor |
| Credit detail | `GET /v1/wallet/credits/:creditId` | — |
| Dispute | `POST /v1/wallet/disputes/:creditId` | — |
| Refund request | `POST /v1/wallet/refunds/:creditId` | — |
| Refunds | `GET /v1/wallet/refunds?limit&offset&status` | offset |
| Notifications | `GET /v1/wallet/notifications` | — |

## Wallet admin

`GET /wallet/admin/wallets`, `GET /wallet/admin/wallets/:userId`, `GET /wallet/admin/credits`, `GET /wallet/admin/reconciliation`, `PATCH /wallet/admin/reconciliation/:id/correct`, `GET/PATCH /wallet/admin/disputes`, `GET /wallet/admin/refunds`, `PATCH .../approve|reject`, `GET /wallet/admin/audit-log`, `GET /wallet/admin/analytics`, `POST /wallet/admin/issue`, `POST /wallet/admin/cancel`.

Listagens usam `limit/offset`; emissão, cancelamento e correção são somente SUPER_ADMIN.

## Orders

- Create: `POST /v1/orders` com `{ briefing?, items: [{ ref?, serviceId?, professionalId?, parentRef?, briefingText? }] }`.
- Add item: `POST /v1/orders/:orderId/line-items`.
- Read item/history: `GET /orders/:orderId/line-items/:itemId[/history]`.
- Actions: `assign`, `request-brief-revision`, `update-brief`, `accept`, `refuse`, `deliver`, `approve`, `request-revision`, `dispute`, `resolve`, `cancel`, sempre abaixo de `/line-items/:itemId`.

## Reseller credit trade

- Pricing: `GET /reseller/credit-price`; `GET/PUT /reseller/pricing`; `POST/PATCH /reseller/pricing/packages(/:id)`.
- Purchase: `POST /reseller/credits/purchase`; `GET /reseller/credits/purchases?page&limit&status`.
- Admin purchase: `GET /admin/credit-purchases`; `POST /admin/credit-purchases/:id/confirm|cancel`.
- Stock: `GET /reseller/stock`.
- Sale: `POST /reseller/credits/sell`; `GET /reseller/credits/sales?page&limit&clientId&startDate&endDate`.

## Removed frontend contracts

`/wallet/platform`, `/wallet/reseller`, `/wallet/credits/:id/disputes`, `/wallet/credits/:id/refunds`, `/wallet/admin/audit`, `/wallet/admin/credits/issue`, `/wallet/admin/credits/cancel`, `/reseller/credits/emit`, `/reseller/credits/emissions`, ações de pedido sem `line-items/:itemId`, `POST /users`, rotas de menu `/admin/clients`, `/admin/commissions`, `/admin/earnings`, `/admin/voice-actors` e `/admin/producers`.
