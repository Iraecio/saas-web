# API Contract: Configuração de Preços do Revendedor

Todos os endpoints exigem `RESELLER` ou `RESELLER_MANAGER`; a revenda é derivada do token. Respostas seguem o envelope padrão.

## Overview e configuração

### `GET /reseller/pricing/overview`

Retorna `PricingOverview`, incluindo custo vigente, configuração versionada e contagem de pacotes ativos.

### `POST /reseller/pricing/preview`

Body: `{ unitPriceCents, allowDirectPurchase, expectedVersion? }`. Retorna `PricingPreview` sem alterar estado.

### `PUT /reseller/pricing`

Headers: `Idempotency-Key`. Body: `{ previewId, confirmation, reason? }`. Retorna configuração atualizada. `409 VERSION_CONFLICT` devolve estado atual; `410 PREVIEW_EXPIRED` exige nova prévia.

## Pacotes

### `GET /reseller/pricing/packages`

Aceita `PackageQuery`; retorna `{ items, meta, queryFingerprint }` com ordenação estável por ID.

### `POST /reseller/pricing/packages`

Body: `{ name?, creditAmount, priceCents, expectedPricingVersion }`. Retorna pacote criado e métricas derivadas do custo vigente.

### `PATCH /reseller/pricing/packages/:id`

Body: campos editáveis, `expectedVersion` e justificativa quando exigida. Vendas anteriores não são afetadas.

### `POST /reseller/pricing/packages/actions/preview`

Body: `{ action: ACTIVATE | DEACTIVATE, selection }`. Retorna elegíveis, inelegíveis, impacto e versões.

### `POST /reseller/pricing/packages/actions/execute`

Headers: `Idempotency-Key`. Body: `{ previewId, confirmation, reason? }`. Retorna execução com resultado por pacote.

## Histórico

### `GET /reseller/pricing/history`

Aceita alvo, ação, ator, período, página e ordenação. Retorna eventos paginados, sempre limitados à revenda autenticada.

## Erros

| HTTP | Código | Comportamento cliente |
|---|---|---|
| 400/422 | `VALIDATION_ERROR` | Associar mensagens aos campos |
| 401 | `SESSION_EXPIRED` | Login e retorno sem repetir comando |
| 403 | `ACCESS_DENIED` | Estado seguro |
| 404 | `PACKAGE_NOT_FOUND` | Atualizar lista e informar ausência |
| 409 | `VERSION_CONFLICT` | Mostrar estado atual e exigir revisão |
| 410 | `PREVIEW_EXPIRED` | Solicitar nova prévia |
| 429 | `RATE_LIMITED` | Informar espera |
| 503 | `TEMPORARILY_UNAVAILABLE` | Preservar contexto e retry |

## Compatibilidade

Os contratos atuais `GET/PUT /reseller/pricing`, `POST /reseller/pricing/packages` e `PATCH /reseller/pricing/packages/:id` podem permanecer durante migração; novos campos devem ser aditivos até o frontend atualizado estar implantado.
