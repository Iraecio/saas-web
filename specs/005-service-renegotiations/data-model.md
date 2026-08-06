# Data Model: Gestão de serviços e renegociações

O frontend não cria persistência. Os modelos abaixo representam respostas oficiais da API e estado efêmero de apresentação. Valores monetários usam centavos inteiros.

## ServiceNegotiationSummary

Representa uma linha da fila administrativa.

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string | ID da etapa atual |
| `professional` | `NegotiationProfessional` | Profissional sob o escopo do gestor |
| `service` | `NegotiationService` | Serviço associado |
| `pricingId` | string | Associação profissional-serviço |
| `currentPriceCents` | number | Inteiro maior que zero |
| `previousPriceCents` | number | Preço no início da etapa |
| `proposedPriceCents` | number | Inteiro maior que zero |
| `variationPercent` | number | Derivado para apresentação; não usado em mutação |
| `initiator` | `PROFESSIONAL \| MANAGER` | Define o decisor esperado |
| `status` | `PENDING \| ACCEPTED \| REJECTED \| COUNTERED \| APPLIED` | Estado oficial |
| `nextActor` | `MANAGER \| PROFESSIONAL \| NONE` | Derivado pela API para reduzir ambiguidade |
| `notes` | string ou null | Justificativa da etapa |
| `createdAt` | ISO datetime | Ordenação e tempo de espera |
| `decidedAt` | ISO datetime ou null | Obrigatório quando resolvida |

## NegotiationProfessional

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string | Identificador estável |
| `name` | string | Obrigatório para a fila |
| `role` | `VOICE_ACTOR \| PRODUCER` | Compatível com o serviço |
| `avatarUrl` | string ou null | Opcional; fallback textual |
| `scope` | `GLOBAL \| PARTICULAR` | Define gestor responsável |
| `resellerName` | string ou null | Exibido apenas quando autorizado |

## NegotiationService

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string | Identificador do serviço |
| `name` | string | Nome administrativo |
| `scope` | `GLOBAL \| PARTICULAR` | Coerente com profissional/oferta |
| `active` | boolean | Oferta inativa não aceita precificação |

## ServiceNegotiationDetail

Estende o resumo com `timeline: ServiceNegotiationStep[]`. A etapa atual corresponde ao último item pendente ou, na ausência dele, à decisão mais recente.

## ServiceNegotiationStep

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string | ID da etapa |
| `counteredFromId` | string ou null | Liga uma contraproposta à origem |
| `initiator` | enum | Profissional ou gestor |
| `initiatedBy` | identidade resumida | Autor exibível |
| `previousPriceCents` | number | Inteiro positivo |
| `proposedPriceCents` | number | Inteiro positivo |
| `status` | enum | Estado oficial |
| `notes` | string ou null | Observação preservada |
| `createdAt` | ISO datetime | Obrigatório |
| `decidedBy` | identidade resumida ou null | Presente quando resolvida |
| `decidedAt` | ISO datetime ou null | Presente quando resolvida |

## NegotiationFilters

`page`, `pageSize`, `status`, `professionalRole`, `serviceId`, `period`, `search` e `sort`. `pageSize` fica limitado às opções oferecidas pela API. Filtros são serializados na URL e omitidos quando vazios.

## NegotiationCounters

`pendingManager`, `pendingProfessional` e `finished`, calculados pela mesma consulta/escopo da fila para não divergir dos resultados.

## Decision DTOs

- `AcceptNegotiationDto`: `notes?`.
- `RejectNegotiationDto`: `notes` obrigatório no frontend, mínimo de 3 caracteres.
- `CounterNegotiationDto`: `proposedPriceCents` inteiro positivo e `notes?`.

## Máquina de estados apresentada

| Estado atual | Iniciador | Próxima ação | Ações do gestor |
|---|---|---|---|
| `PENDING` | `PROFESSIONAL` | `MANAGER` | Aceitar, negar, contrapor |
| `PENDING` | `MANAGER` | `PROFESSIONAL` | Somente acompanhar |
| `ACCEPTED` | qualquer | `NONE` | Consultar histórico |
| `REJECTED` | qualquer | `NONE` | Consultar histórico |
| `COUNTERED` | qualquer | etapa vinculada | Consultar etapa seguinte |
| `APPLIED` | `MANAGER` | `NONE` | Consultar histórico |

## Invariantes

- Apenas uma etapa `PENDING` pode existir por `pricingId`.
- Reseller nunca escolhe nem envia `resellerId`; o escopo vem do token.
- A interface não altera preço vigente antes da resposta oficial.
- Histórico nunca é excluído ou reordenado pelo frontend.
- Uma oferta inativa bloqueia contraproposta e mudança de preço.
