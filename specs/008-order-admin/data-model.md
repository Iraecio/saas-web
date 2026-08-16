# Data Model: Painel Administrativo Completo de Pedidos

## AdminOrderSummary

Representa uma linha/card da consulta global.

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string | Identificador imutável |
| `displayCode` | string | Código curto pesquisável |
| `client` | ParticipantSummary | Obrigatório |
| `professionals` | ParticipantSummary[] | Pode estar vazio |
| `reseller` | ParticipantSummary \| null | Ausente em origem plataforma |
| `origin` | `PLATFORM \| RESELLER` | Sempre textual na UI |
| `itemTypes` | OrderType[] | Um ou mais tipos |
| `itemCount` | number | Inteiro positivo |
| `totalCredits` | number | Inteiro não negativo |
| `status` | OrderStatus | Status agregado |
| `deadlineAt` | ISO date \| null | Pode não existir |
| `isOverdue` | boolean | Calculado no servidor |
| `createdAt` | ISO date | Obrigatório |
| `updatedAt` | ISO date | Obrigatório |
| `version` | string | Token de concorrência |
| `availableActions` | AdminOrderAction[] | Calculadas no servidor |

## AdminOrderDetail

Estende `AdminOrderSummary` com itens, briefing, pronunciamentos, versões de entrega, disputa, composição financeira e eventos. Seções de alto custo podem ser carregadas separadamente, cada uma com estado próprio.

## ParticipantSummary

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string | Obrigatório |
| `name` | string | Nome de exibição |
| `email` | string \| null | Exibir apenas a perfis autorizados |
| `role` | UserRole | Não inferir pelo texto |
| `avatarUrl` | string \| null | Opcional |

## AdminOrderQuery

| Campo | Tipo | Validação |
|---|---|---|
| `q` | string \| null | Normalizado, limite definido no contrato |
| `statuses` | OrderStatus[] | Sem duplicatas |
| `types` | OrderType[] | Sem duplicatas |
| `origins` | OrderOrigin[] | Sem duplicatas |
| `clientId` | string \| null | UUID válido |
| `professionalId` | string \| null | UUID válido |
| `resellerId` | string \| null | UUID válido |
| `createdFrom/createdTo` | ISO date \| null | Início não posterior ao fim |
| `deadlineFrom/deadlineTo` | ISO date \| null | Início não posterior ao fim |
| `overdue` | boolean \| null | Filtro tri-state |
| `sort` | sort key | Allowlist do contrato |
| `direction` | `asc \| desc` | Obrigatório com sort |
| `page` | number | Inteiro >= 1 |
| `pageSize` | number | Allowlist: 25, 50, 100 |

## AdminOrderPage

Contém `items`, `page`, `pageSize`, `totalItems`, `totalPages`, `queryFingerprint`, `summary` e `generatedAt`. O fingerprint identifica exatamente o universo usado por seleção/exportação.

## OrderSelection

União discriminada:

- `EXPLICIT`: `ids` não vazios, limitado ao máximo do lote.
- `QUERY`: `queryFingerprint`, consulta normalizada e `excludedIds`; exige revalidação na prévia.

Transições: `EMPTY → SELECTING → PREVIEWING → READY → EXECUTING → COMPLETE | PARTIAL | FAILED`. Alterar consulta a partir de `SELECTING` exige descarte confirmado.

## AdminActionPreview

| Campo | Tipo | Regra |
|---|---|---|
| `previewId` | string | Curta duração |
| `action` | AdminOrderAction | Allowlist por estado/permissão |
| `eligible` | PreviewTarget[] | ID + versão + impacto |
| `ineligible` | PreviewTarget[] | ID + motivo legível/código |
| `warnings` | string[] | Não substituem confirmação |
| `expiresAt` | ISO date | Execução após expiração exige nova prévia |
| `requiresReason` | boolean | Derivado da ação |

## AdminActionExecution

| Campo | Tipo | Regra |
|---|---|---|
| `executionId` | string | Identificador de acompanhamento |
| `idempotencyKey` | string | Única por intenção do usuário |
| `status` | queued/running/complete/partial/failed | Estado monitorável |
| `processed/total` | number | Progresso coerente |
| `results` | ActionTargetResult[] | Sucesso/falha/conflito por alvo |
| `createdAt/completedAt` | ISO date | `completedAt` opcional |

## AuditEvent

Evento imutável com `id`, `orderId`, `lineItemId?`, `actor`, `action`, `reason?`, `before?`, `after?`, `result`, `createdAt` e `correlationId`. Valores sensíveis devem ser redigidos no servidor.

## ViewPreference

Preferência por usuário e versão de schema: `visibleColumns`, `columnOrder`, `density`. Nunca contém filtros, resultados, tokens ou dados pessoais.
