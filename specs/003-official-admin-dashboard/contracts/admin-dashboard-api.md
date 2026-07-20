# Contract: Admin Dashboard API

## GET `/v1/admin/dashboard`

**Auth**: JWT; `ADMIN` ou `SUPER_ADMIN`.

**Query**:

- `from?`: ISO 8601 inclusivo; padrão início do mês atual.
- `to?`: ISO 8601 inclusivo; padrão instante atual.
- `timezone?`: timezone IANA; padrão configuração da aplicação.

**Success 200** (antes do envelope global):

```json
{
  "period": {
    "from": "2026-07-01T04:00:00.000Z",
    "to": "2026-07-20T17:00:00.000Z",
    "previousFrom": "2026-06-11T15:00:00.000Z",
    "previousTo": "2026-07-01T03:59:59.999Z",
    "timezone": "America/Cuiaba"
  },
  "metrics": {
    "activeUsers": { "current": 120, "previous": 110, "variationPercent": 9.09, "comparisonLabel": "NORMAL", "unit": "COUNT" },
    "ordersCreated": { "current": 47, "previous": 40, "variationPercent": 17.5, "comparisonLabel": "NORMAL", "unit": "COUNT" },
    "creditsIssued": { "current": 12500, "previous": 0, "variationPercent": null, "comparisonLabel": "NO_BASELINE", "unit": "CREDITS" },
    "creditsSpent": { "current": 9800, "previous": 8100, "variationPercent": 20.99, "comparisonLabel": "NORMAL", "unit": "CREDITS" },
    "creditsRefunded": { "current": 320, "previous": 100, "variationPercent": 220, "comparisonLabel": "NORMAL", "unit": "CREDITS" },
    "availableProfessionals": { "current": 12, "previous": 10, "variationPercent": 20, "comparisonLabel": "NORMAL", "unit": "COUNT" },
    "pendingDisputes": 3,
    "pendingRefunds": 2,
    "pendingWithdrawals": 4,
    "pendingCreditPurchases": 1
  },
  "recentOrders": [],
  "pendingActions": [],
  "generatedAt": "2026-07-20T17:00:00.000Z"
}
```

**Errors**: `400` período/timezone inválido; `401`; `403`; `422` intervalo excede 366 dias.

## Calculation rules

- Intervalos são convertidos para UTC usando o timezone solicitado.
- Comparativo tem a mesma duração e termina imediatamente antes do período atual.
- `variationPercent = ((current - previous) / previous) * 100`; se `previous = 0`, retorna `null/NO_BASELINE`.
- Usuário ativo significa `isActive = true` no fim do período.
- Profissional disponível exige status oficial configurado como disponível; ausência de status não conta.
- Pedidos recentes são ordenados por `createdAt DESC`, máximo 10.
- Pendências são dados acionáveis e nunca incluem eventos de infraestrutura.

## Security and performance

- Nenhum dado cross-tenant é exposto a papéis de revenda; a rota é exclusiva de admin da plataforma.
- Consultas usam agregações/batches e não fazem busca individual por pedido ou usuário.
- A resposta segue o envelope global da API.
