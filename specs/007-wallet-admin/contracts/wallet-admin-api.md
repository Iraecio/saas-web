# Contract: Wallet Admin API

Todos os endpoints abaixo exigem `SUPER_ADMIN`, usam o envelope padrão da API e preservam valores como inteiros. Contratos existentes podem ser mantidos como compatibilidade; o frontend novo usa as versões paginadas e versionadas descritas aqui.

## Consultas

### `GET /wallet/admin/overview`

Query: `from`, `to`, `resellerId`, `roles[]`.

Retorna totais globais/filtrados, distribuição por papel e estado, emissão, consumo, reserva, expiração, divergências e alertas acionáveis.

### `GET /wallet/admin/wallets`

Query: campos de `AdminWalletQuery`.

Retorna `AdminWalletPage`, incluindo `queryFingerprint` e totais do conjunto filtrado. Busca cobre nome, e-mail, `userId` e `walletId`.

### `GET /wallet/admin/wallets/:walletId`

Retorna `AdminWalletDetail` com versão e capacidades. Aceita temporariamente `userId` no endpoint legado, mas links novos usam `walletId`.

### Coleções do detalhe

- `GET /wallet/admin/wallets/:walletId/credits`
- `GET /wallet/admin/wallets/:walletId/movements`
- `GET /wallet/admin/wallets/:walletId/reservations`
- `GET /wallet/admin/wallets/:walletId/disputes`
- `GET /wallet/admin/wallets/:walletId/refunds`
- `GET /wallet/admin/wallets/:walletId/audit`

Todas aceitam paginação, filtros e ordenação próprios e retornam `{ items, page, pageSize, total, totalPages }`.

## Ações individuais

### `POST /wallet/admin/actions/preview`

Body: `AdminWalletActionDraft` sem `previewToken`.

Retorna `AdminWalletActionPreview`. Respostas: `200`, `400`, `401`, `403`, `404`, `409`, `422`.

### `POST /wallet/admin/actions`

Body: draft confirmado com `previewToken`, `expectedVersion` e `idempotencyKey`.

Retorna `AdminWalletActionResult` com `201` ou `202`. Repetição da mesma chave retorna o mesmo resultado. Versão divergente retorna `409` com `currentWallet` e código `WALLET_VERSION_CONFLICT`.

### `GET /wallet/admin/actions/by-idempotency-key/:key`

Consulta segura do resultado após perda de conexão ou resposta indeterminada.

## Ações em lote

### `POST /wallet/admin/bulk-actions/preview`

Body contém ação, seleção `EXPLICIT|FILTER`, motivo e payload. Retorna impacto agregado, inelegíveis e `previewToken`.

### `POST /wallet/admin/bulk-actions`

Inicia operação com `previewToken` e `idempotencyKey`; retorna `202` com `operationId`.

### `GET /wallet/admin/bulk-actions/:operationId`

Retorna progresso e resultados paginados por carteira. Falhas parciais não são ocultadas.

## Exportação

### `POST /wallet/admin/exports`

Recebe seleção/filtro e colunas permitidas. Retorna arquivo imediato ou job assíncrono com estado consultável. O arquivo inclui filtros e data de geração.

## Regras de erro

- `401 SESSION_EXPIRED`: limpar dados administrativos e redirecionar para autenticação.
- `403 FORBIDDEN`: negar acesso sem renderizar conteúdo em cache.
- `409 WALLET_VERSION_CONFLICT`: exibir estado atual e exigir nova prévia.
- `409 PREVIEW_EXPIRED`: gerar nova prévia.
- `422 ACTION_NOT_ELIGIBLE`: manter formulário e associar erros aos campos/alvos.
- Falha de rede após envio: consultar por chave idempotente antes de habilitar repetição.
