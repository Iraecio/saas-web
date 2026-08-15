# Contract: Read-only Inspection API

## POST `/admin/impersonation-sessions`

Somente `SUPER_ADMIN`. Body `{ targetUserId, reason }`. Valida alvo ativo `VOICE_ACTOR|PRODUCER`, impede autoinspeção, administrador e sessão encadeada.

Resposta `201`:

```json
{
  "id": "inspection-id",
  "inspectionToken": "opaque-or-jwt",
  "mode": "READ_ONLY",
  "target": { "id": "user-id", "name": "Marina Costa", "role": "VOICE_ACTOR" },
  "startedAt": "2026-08-06T12:00:00Z",
  "expiresAt": "2026-08-06T12:30:00Z"
}
```

O token inclui vínculo ao `actorId`, `targetUserId`, `sessionId`, modo e expiração. Não é refreshable.

## Requests during inspection

Frontend envia `X-Impersonation-Token`. A API calcula visibilidade como alvo, preserva ator real no contexto de auditoria e aceita somente `GET|HEAD|OPTIONS`. Endpoints de senha, autenticação, arquivos privados exportáveis, pagamentos e segredos podem permanecer bloqueados mesmo para leitura.

Qualquer método mutável retorna `403 INSPECTION_READ_ONLY`, independentemente do frontend.

## DELETE `/admin/impersonation-sessions/:id`

Encerra sessão do próprio ator e registra término. Idempotente. Resposta `204`.

## GET `/admin/impersonation-sessions/active`

Permite restaurar banner após F5 quando a inspeção continua válida. Não retorna sessão de outro ator.

## GET `/admin/impersonation-sessions`

Histórico paginado para auditoria, filtrável por ator, alvo, período e forma de encerramento.

## Expiration and revocation

TTL máximo 30 min; bloquear alvo, desativar ator ou revogar sessão invalida imediatamente o token. O frontend limpa contexto e restaura rota administrativa ao receber `401/403` específico.
