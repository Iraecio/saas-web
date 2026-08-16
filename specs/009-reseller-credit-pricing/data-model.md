# Data Model: Configuração de Preços de Créditos do Revendedor

## ResellerPricingConfig

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string | Imutável |
| `resellerId` | string | Derivado da autenticação |
| `unitPriceCents` | integer | Positivo e dentro da política |
| `allowDirectPurchase` | boolean | Ativação exige dependências válidas |
| `version` | integer/string | Incrementado em mutação |
| `updatedBy` | ParticipantSummary | Ator autorizado |
| `createdAt/updatedAt` | ISO date | Obrigatórios |

## PlatformCostReference

Contém `unitPriceCents`, `effectiveFrom`, `version` e `available`. É somente leitura para revendedores e alimenta a prévia/margem.

## CreditPackage

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string | Imutável |
| `resellerId` | string | Derivado da autenticação |
| `name` | string \| null | Nome curto opcional |
| `creditAmount` | integer | Positivo |
| `priceCents` | integer | Positivo |
| `isActive` | boolean | Inativos preservados |
| `version` | integer/string | Controle concorrente |
| `createdAt/updatedAt` | ISO date | Obrigatórios |

Derivados: `effectiveUnitPriceCents = priceCents / creditAmount`, `estimatedMarginCents = priceCents - platformCost * creditAmount` e percentual para apresentação.

## PricingOverview

Agrega `config`, `platformCost`, `activePackageCount`, `margin` e `generatedAt`. Ausência de configuração é estado válido de onboarding.

## PackageQuery

`q`, `status`, `minCredits`, `maxCredits`, `minPriceCents`, `maxPriceCents`, `sort`, `direction`, `page` e `pageSize`. Intervalos devem ser coerentes; página >= 1; tamanhos 10, 25 ou 50.

## PricingPreview

Contém `previewId`, configuração/custo versionados, valores anterior/novo, margens, alertas, `requiresConfirmation` e `expiresAt`. Expiração exige nova prévia.

## PackageSelection

União `EXPLICIT` com IDs ou `QUERY` com fingerprint e exclusões. Estados: `EMPTY → SELECTING → PREVIEWING → READY → EXECUTING → COMPLETE | PARTIAL | FAILED`.

## PricingAuditEvent

Evento imutável com `id`, `resellerId`, `targetType`, `targetId`, `action`, `actor`, `before`, `after`, `reason`, `result`, `correlationId` e `createdAt`. Dados sensíveis são redigidos no servidor.
