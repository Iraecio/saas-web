# Contract: Admin Negotiations API

Contrato aditivo requerido na `saas-api` para a fila administrativa. O envelope padrão é removido pelo interceptor do frontend. A API deriva o escopo do JWT: superadmin/admin consultam globais e autorizados; revendedor/gerente consultam somente sua rede.

## GET `/professional-pricing/negotiations`

Lista paginada e agregada de negociações visíveis ao gestor.

### Query

- `page` (default `1`)
- `pageSize` (default `20`, máximo `100`)
- `status`: `PENDING|ACCEPTED|REJECTED|COUNTERED|APPLIED`
- `nextActor`: `MANAGER|PROFESSIONAL|NONE`
- `professionalRole`: `VOICE_ACTOR|PRODUCER`
- `serviceId`
- `search`: nome do profissional ou serviço
- `from`, `to`: datas ISO
- `sort`: `createdAt:desc` por padrão

### Response 200

```json
{
  "items": [
    {
      "id": "neg-123",
      "pricingId": "pricing-123",
      "professional": {
        "id": "usr-1",
        "name": "Marina Costa",
        "role": "VOICE_ACTOR",
        "avatarUrl": null,
        "scope": "GLOBAL",
        "resellerName": null
      },
      "service": {
        "id": "svc-1",
        "name": "Locução institucional",
        "scope": "GLOBAL",
        "active": true
      },
      "currentPriceCents": 27500,
      "previousPriceCents": 25000,
      "proposedPriceCents": 30000,
      "variationPercent": 20,
      "initiator": "PROFESSIONAL",
      "status": "PENDING",
      "nextActor": "MANAGER",
      "notes": "Revisão anual",
      "createdAt": "2026-08-05T12:00:00.000Z",
      "decidedAt": null
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1,
  "counters": {
    "pendingManager": 1,
    "pendingProfessional": 0,
    "finished": 0
  }
}
```

Os contadores respeitam o escopo e os filtros estruturais, mas não a página. Retornos: `401`, `403`, `422` para query inválida.

## GET `/professional-pricing/negotiations/:negotiationId`

Retorna resumo agregado e `timeline` ordenada por `createdAt asc`, com identidades resumidas dos autores/decisores. O acesso a um ID fora do escopo retorna `403` ou `404` conforme a política existente da API.

## Mutações reutilizadas

- `POST /professionals/:professionalId/services/:serviceId/negotiations/:negotiationId/accept`
- `POST /professionals/:professionalId/services/:serviceId/negotiations/:negotiationId/reject`
- `POST /professionals/:professionalId/services/:serviceId/negotiations/:negotiationId/counter`

O frontend usa os IDs presentes no resumo, nunca aceita escopo arbitrário e envia valores em centavos.

## Concorrência e erros

- Decisão sobre etapa que deixou de estar pendente retorna `422`; o frontend recarrega item e contadores.
- Duplicidade/etapa pendente conflitante retorna `409`.
- Falha de autorização retorna `403` e não expõe dados da outra rede.
- Rate limit retorna `429` com mensagem recuperável.
