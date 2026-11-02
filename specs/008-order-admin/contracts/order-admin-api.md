# API Contract: Administração de Pedidos

Prefixo sugerido: `/orders/admin`. Todos os endpoints exigem `SUPER_ADMIN`; respostas seguem o envelope padrão do projeto.

## Consultas

### `GET /orders/admin`

Aceita os campos de `AdminOrderQuery`. Retorna `AdminOrderPage`. Ordenação sempre usa `id` como desempate estável. Parâmetros inválidos retornam 400 com erros por campo.

### `GET /orders/admin/:orderId`

Retorna `AdminOrderDetail`, `version` e ações disponíveis. 404 não diferencia inexistência de alvo inacessível.

### `GET /orders/admin/:orderId/audit`

Retorna eventos paginados em ordem decrescente, com cursor estável.

### `GET /orders/admin/filter-options`

Busca incremental de clientes, profissionais e revendas. Aceita `type`, `q`, `cursor`, `limit`; não retorna diretórios completos sem termo.

## Prévia e comandos

### `POST /orders/admin/actions/preview`

Body: `{ action, selection, payload? }`. Retorna `AdminActionPreview`, incluindo elegíveis, inelegíveis, versões e impacto. Não altera estado.

### `POST /orders/admin/actions/execute`

Headers: `Idempotency-Key` obrigatório. Body: `{ previewId, reason?, confirmation }`. Retorna `AdminActionExecution`; 409 retorna alvos alterados e estado corrente resumido; 410 exige nova prévia.

### `GET /orders/admin/actions/:executionId`

Retorna progresso e resultados por alvo. O cliente pode usar polling com backoff e interromper ao sair da tela sem cancelar o processamento.

## Exportação

### `POST /orders/admin/exports`

Body: `{ selection, format: "csv", columns, timezone }`. Retorna `{ exportId, status }`.

### `GET /orders/admin/exports/:exportId`

Retorna `{ status, processed, total, downloadUrl?, expiresAt?, error? }`. URL é temporária e vinculada ao solicitante.

## Erros

| HTTP | Código de domínio | Comportamento cliente |
|---|---|---|
| 400/422 | `VALIDATION_ERROR` | Associar erros aos campos |
| 401 | `SESSION_EXPIRED` | Autenticar e restaurar rota sem repetir comando |
| 403 | `ACCESS_DENIED` | Estado dedicado sem dados |
| 404 | `ORDER_NOT_FOUND` | Estado de registro indisponível |
| 409 | `VERSION_CONFLICT` | Atualizar, explicar mudança e pedir nova decisão |
| 410 | `PREVIEW_EXPIRED` | Gerar nova prévia |
| 429 | `RATE_LIMITED` | Informar espera e permitir nova tentativa |
| 503 | `TEMPORARILY_UNAVAILABLE` | Preservar consulta e tentar novamente |

## Segurança e consistência

- O servidor autoriza cada alvo, inclusive seleção por consulta.
- Toda mutação gera auditoria com correlation ID e nunca aceita edição direta de status/histórico/saldo.
- A consulta usada por seleção/exportação é normalizada e revalidada no servidor.
- Campos pessoais e financeiros seguem minimização e redaction nos logs.
- Limite inicial: 1.000 alvos elegíveis por execução; acima disso, a prévia rejeita com orientação para refinar filtros.
