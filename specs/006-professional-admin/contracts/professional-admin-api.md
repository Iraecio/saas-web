# Contract: Professional Admin API

Base `/admin/professionals`; autenticação `SUPER_ADMIN` obrigatória.

## GET `/admin/professionals`

Query: `query`, `role`, `scope`, `resellerId`, `verificationStatus`, `accountStatus`, `activity`, `sort`, `page`, `pageSize` (máximo 100).

Resposta: `{ items: ProfessionalAdminSummary[], page, pageSize, total, totalPages, counters }`. `counters` inclui total, locutores, produtores, globais, particulares e bloqueados sob os filtros estruturais.

## GET `/admin/professionals/:userId`

Retorna `ProfessionalAdminDetail` e `availableActions`. `404` para usuário inexistente/não profissional.

## GET `/admin/professionals/:userId/{services|orders|wallet|audit}`

Leituras paginadas específicas. Pedidos filtram itens atribuídos ao profissional. Carteira reutiliza a fonte oficial administrativa. Cada resposta é independente.

## PATCH `/admin/professionals/:userId`

Body: campos editáveis de conta/perfil, `expectedUpdatedAt`, `reason`. Não aceita senha, hash, saldo ou role administrativa. Retorna `409` com versão atual em conflito.

## POST `/admin/professionals/:userId/block`

Body `{ reason, expectedUpdatedAt }`. Desativa conta, revoga sessões e encerra inspeções. Idempotente; audita resultado.

## POST `/admin/professionals/:userId/reactivate`

Body `{ reason, expectedUpdatedAt }`. Reativa autenticação sem recriar dados.

## POST `/admin/professionals/:userId/password-reset`

Body `{ reason }`. Envia link temporário ao e-mail cadastrado, aplica rate limit e retorna mensagem neutra. Nunca retorna token ou senha.

## POST `/admin/professionals/bulk-actions`

Body `{ action, userIds, reason, expectedVersions }`. Máximo 100 IDs. Resposta `200` com sucessos/falhas individuais; não usa transação global para permitir resultado parcial.

## Errors

`401` sessão expirada; `403` acesso negado; `404` alvo; `409` conflito/estado; `422` validação; `429` limite; `503` dependência indisponível.
