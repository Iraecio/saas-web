# Data Model: Administração completa de carteiras

## AdminWalletSummary

Representa uma linha/card da listagem.

- `walletId`, `userId`: identificadores estáveis.
- `ownerName`, `ownerEmail`, `role`, `accountStatus`: identidade e situação.
- `resellerId`, `resellerName`, `scope`: contexto organizacional.
- `currency`, `totalCredits`, `availableCredits`, `reservedCredits`, `frozenCredits`, `expiringCredits`: composição sem dupla contagem.
- `hasDiscrepancy`, `pendingCount`: indicadores operacionais.
- `lastMovementAt`, `createdAt`, `version`: datas e concorrência.

**Validation**: valores são inteiros; `available + reserved + frozen` não pode exceder a composição ativa reportada; papel pertence ao catálogo de papéis; versão é positiva.

## AdminWalletQuery

Define o conjunto da listagem.

- Busca: `search`.
- Filtros: `roles[]`, `resellerId`, `scope`, `status[]`, `balanceMin`, `balanceMax`, `hasReservations`, `expiringWithinDays`, `hasDiscrepancy`, `originTypes[]`, `movementFrom`, `movementTo`.
- Ordenação: `sort`, `direction`.
- Paginação: `page`, `pageSize`.

**Validation**: datas formam intervalo válido; mínimos não superam máximos; página começa em 1; `pageSize` aceita somente opções suportadas.

## AdminWalletPage

- `items`: lista de `AdminWalletSummary`.
- `page`, `pageSize`, `total`, `totalPages`.
- `filteredTotals`: saldos e contagens do conjunto filtrado.
- `queryFingerprint`: identificador estável usado em seleção lógica e exportação.

## AdminWalletDetail

- `summary`: `AdminWalletSummary` atualizado.
- `balanceComposition`: totais por estado, origem e vencimento.
- `capabilities`: mapa de ações permitidas e justificativas para bloqueios.
- `sectionCounts`: créditos, movimentações, reservas, disputas, estornos e alertas.

Relaciona-se com coleções paginadas de `AdminCredit`, `AdminWalletMovement`, `AdminReservation`, `AdminDispute`, `AdminRefund` e `AdminAuditEntry`.

## AdminWalletActionDraft

- `action`: emissão, cancelamento, ajuste compensatório, congelamento, liberação, decisão ou correção.
- `target`: carteira, créditos específicos ou seleção lógica.
- `payload`: valores próprios da ação.
- `reason`: obrigatório e limitado.
- `expectedVersion`: versão exibida ao operador.
- `idempotencyKey`: chave única por tentativa confirmada.

## AdminWalletActionPreview

- `eligibleCount`, `ineligibleCount`, `warnings`.
- `beforeTotals`, `delta`, `afterTotals`.
- `affectedItems`: amostra paginada e motivos de inelegibilidade.
- `previewToken`, `expiresAt`: vincula confirmação à prévia validada.

## AdminWalletActionResult

- `operationId`, `status`: `PROCESSING`, `COMPLETED`, `PARTIAL`, `FAILED`.
- `succeededCount`, `failedCount`, `results[]`.
- `currentWallet`: snapshot atualizado quando individual.
- `auditCorrelationId`, `completedAt`.

### State transitions

`DRAFT → PREVIEWING → READY → SUBMITTING → PROCESSING|COMPLETED|PARTIAL|FAILED`

- `READY → CONFLICT` quando a versão muda.
- `SUBMITTING → UNKNOWN` quando a conexão cai antes de confirmar o resultado; a interface consulta pelo `idempotencyKey` antes de permitir repetição.
- `CONFLICT → PREVIEWING` após recarregar e o operador revisar o novo impacto.

## WalletBulkSelection

- Modo `EXPLICIT`: conjunto de `walletIds`.
- Modo `FILTER`: `queryFingerprint` e lista opcional de exclusões.
- `count`, `eligibility`, `createdAt`.

Seleções expiram ao mudar filtros incompatíveis, perder autorização ou encerrar a sessão.

## WalletAdminViewState

Estado por região: `LOADING`, `READY`, `EMPTY`, `ERROR`, `OFFLINE`, `FORBIDDEN`, `SESSION_EXPIRED`, `STALE`.

Cada região mantém `lastSuccessfulData`, `errorMessage`, `retryAction` e timestamp para evitar que uma falha secundária apague dados válidos.
