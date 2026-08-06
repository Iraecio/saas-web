# Data Model: Administração completa de profissionais

## ProfessionalAdminSummary

`userId`, `profileId`, `name`, `email`, `avatarUrl`, `role`, `scope`, `reseller`, `verificationStatus`, `isActive`, `lastLoginAt`, `activeOrders`, `walletBalance`, `updatedAt`.

Regras: somente `VOICE_ACTOR|PRODUCER`; valores financeiros inteiros; `reseller` obrigatório para escopo particular; `updatedAt` usado em concorrência.

## ProfessionalAdminDetail

Estende o resumo com `account`, `professionalProfile`, `offeringsSummary`, `ordersSummary`, `walletSummary` e `availableActions`. Dados sensíveis e hashes nunca são incluídos.

## ProfessionalAdminFilters

`query`, `role`, `scope`, `resellerId`, `verificationStatus`, `accountStatus`, `activity`, `sort`, `page`, `pageSize`. Serializado na URL; valores vazios são omitidos.

## BulkActionRequest/Result

Pedido: `action`, `userIds`, `reason`, `expectedVersions`. Resultado: `succeeded[]`, `failed[]` com código/motivo por usuário. Ações permitidas inicialmente: bloquear, reativar e alterar verificação quando elegível.

## AdministrativeAction

Registro imutável com `id`, `actorId`, `targetUserId`, `action`, `reason`, `changedFields`, `sourceIp`, `createdAt` e `result`.

## ImpersonationSession

| Campo | Regra |
|---|---|
| `id` | Identificador opaco |
| `actorId` | Deve ser SUPER_ADMIN ativo |
| `targetUserId` | Locutor/produtor ativo, nunca administrador |
| `reason` | Obrigatório, mínimo 10 caracteres |
| `mode` | Sempre `READ_ONLY` nesta versão |
| `startedAt` | Data oficial da API |
| `expiresAt` | Máximo 30 minutos |
| `endedAt` | Nulo enquanto ativa |
| `endedBy` | `ACTOR|EXPIRATION|REVOCATION|TARGET_BLOCKED` |
| `sourceIp`, `userAgent` | Auditoria |

## ImpersonationClientState

Mantém credencial temporária, alvo resumido, validade e rota de retorno. A credencial administrativa original permanece no serviço de autenticação e nunca é sobrescrita.

## State transitions

- Conta: `ACTIVE → BLOCKED → ACTIVE`; exclusão definitiva fora do escopo.
- Inspeção: `NONE → ACTIVE → ENDED/EXPIRED/REVOKED`; não permite encadeamento.
- Ação: `IDLE → CONFIRMING → PROCESSING → SUCCEEDED|FAILED|CONFLICT`.

## Invariants

- Toda mutação usa identidade administrativa real, nunca identidade inspecionada.
- Toda requisição de inspeção é somente leitura e auditável.
- Bloqueio revoga refresh tokens e encerra inspeções cujo alvo foi bloqueado.
- Reset não retorna token nem senha ao superadmin.
