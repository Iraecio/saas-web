# API Contracts: saas-web ↔ saas-api

**Branch**: `001-full-api-coverage` | **Date**: 2026-05-23

Todos os contratos HTTP que o frontend consome da API. Cada contrato especifica método, caminho, autenticação, shape da requisição e shape da resposta.

> Respostas de sucesso são sempre envelopadas: `{ success: true, data: <payload>, timestamp: string, requestId: string }`  
> Respostas de erro: `{ success: false, statusCode: number, message: string, errors?: string[] }`

---

## Auth

### POST `/v1/auth/register`
- **Auth**: público
- **Request**: `{ email: string, password: string, name?: string }`
- **Response**: `AuthResponse { accessToken, refreshToken, user }`
- **Errors**: 409 email já cadastrado

### POST `/v1/auth/register-reseller`
- **Auth**: público
- **Request**: `{ email: string, password: string, name: string, companyName?: string }`
- **Response**: `AuthResponse + defaultDomain: string`
- **Errors**: 409 email já cadastrado

### POST `/v1/auth/bootstrap`
- **Auth**: público
- **Request**: `{ email: string, password: string, name?: string }`
- **Response**: `AuthResponse`
- **Errors**: 409 sistema já inicializado

### POST `/v1/auth/login`
- **Auth**: público
- **Request**: `{ email: string, password: string }`
- **Response**: `AuthResponse { accessToken, refreshToken, user }`
- **Errors**: 401 credenciais inválidas, 401 conta inativa

### POST `/v1/auth/refresh`
- **Auth**: público
- **Request**: `{ refreshToken: string }`
- **Response**: `{ accessToken: string, refreshToken: string }`
- **Errors**: 400 token inválido/malformado, 401 token revogado/expirado

### POST `/v1/auth/logout`
- **Auth**: Bearer JWT
- **Request**: vazio
- **Response**: 204 No Content

---

## Users

### GET `/v1/users/me`
- **Auth**: Bearer JWT
- **Response**: `User`

### PUT `/v1/users/me`
- **Auth**: Bearer JWT
- **Request**: `{ name?, avatarUrl?, department?, jobTitle? }`
- **Response**: `User`

### GET `/v1/users?page&limit&role`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Query**: `page: number`, `limit: number`, `role?: UserRole`
- **Response**: `User[]` (paginado — verificar se a API retorna envelope com metadados ou array direto)

### GET `/v1/users/:id`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Response**: `User`
- **Errors**: 404 não encontrado

### PUT `/v1/users/:id`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Request**: `{ name?, email?, role?, isActive?, ... }`
- **Response**: `User`

### DELETE `/v1/users/:id`
- **Auth**: Bearer JWT | Roles: SUPER_ADMIN
- **Response**: 204 No Content

### POST `/v1/users/:id/permissions`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Request**: `{ permissionName: string, expiresAt?: string }`
- **Response**: `UserPermission`
- **Errors**: 404 usuário não encontrado

### DELETE `/v1/users/:id/permissions/:permissionName`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Response**: 204 No Content

### GET `/v1/users/:id/voice-profile`
- **Auth**: Bearer JWT (somente próprio usuário)
- **Response**: `VoiceProfile`
- **Errors**: 404 perfil não encontrado

### PATCH `/v1/users/:id/voice-profile`
- **Auth**: Bearer JWT (somente próprio usuário)
- **Request**: campos de `VoiceProfile` (exceto id/userId)
- **Response**: `VoiceProfile`

### GET `/v1/users/:id/producer-profile`
- **Auth**: Bearer JWT (somente próprio usuário)
- **Response**: `ProducerProfile`

### PATCH `/v1/users/:id/producer-profile`
- **Auth**: Bearer JWT (somente próprio usuário)
- **Request**: campos de `ProducerProfile`
- **Response**: `ProducerProfile`

### GET `/v1/users/:id/client-profile`
- **Auth**: Bearer JWT (somente próprio usuário)
- **Response**: `ClientProfile`

### PATCH `/v1/users/:id/client-profile`
- **Auth**: Bearer JWT (somente próprio usuário)
- **Request**: campos de `ClientProfile`
- **Response**: `ClientProfile`

### GET `/v1/users/:id/storage-quota`
- **Auth**: Bearer JWT (somente próprio usuário)
- **Response**: `{ usedBytes: number, totalBytes: number }`

---

## Admin

### GET `/v1/admin/revendedores`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Response**: `Reseller[]` (todos os revendedores da plataforma, sem filtro de tenant)

---

## Custom Domains

### POST `/v1/resellers/:resellerId/custom-domains`
- **Auth**: Bearer JWT | Roles: RESELLER, RESELLER_MANAGER, ADMIN, SUPER_ADMIN
- **Request**: `{ domain: string }`
- **Response**: `{ success: true, domain: string, message: string }` (message = instruções DNS)
- **Errors**: 409 domínio já registrado, 403 não é dono do reseller

### GET `/v1/resellers/:resellerId/custom-domains`
- **Auth**: Bearer JWT | Roles: RESELLER, RESELLER_MANAGER, ADMIN, SUPER_ADMIN
- **Response**: `CustomDomain[]`

### DELETE `/v1/resellers/:resellerId/custom-domains/:domainId`
- **Auth**: Bearer JWT | Roles: RESELLER, RESELLER_MANAGER, ADMIN, SUPER_ADMIN
- **Response**: 204 No Content

---

## Role Requests

### POST `/v1/role-requests`
- **Auth**: Bearer JWT
- **Request**: `{ requestedRole: UserRole, justification?: string, portfolioNotes?: string, audioUrls?: string[], voiceStyles?: string[], photoUrl?: string, companyName?: string, specialty?: string }`
- **Response**: `RoleRequest`

### GET `/v1/role-requests/my`
- **Auth**: Bearer JWT
- **Response**: `RoleRequest[]`

### GET `/v1/role-requests?page&pageSize&status`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Query**: `page`, `pageSize`, `status?: RoleRequestStatus`
- **Response**: `{ items: RoleRequest[], total: number, page: number, pageSize: number }`

### GET `/v1/role-requests/:id`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Response**: `RoleRequest`

### PATCH `/v1/role-requests/:id/approve`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Response**: `RoleRequest`

### PATCH `/v1/role-requests/:id/reject`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Request**: `{ reason: string }`
- **Response**: `RoleRequest`

---

## Wallet — Usuário

### GET `/v1/wallet/balance`
- **Auth**: Bearer JWT
- **Response**: `WalletBalance { balance: number, currency: string }`

### GET `/v1/wallet/credits?cursor&limit&status&type`
- **Auth**: Bearer JWT
- **Query**: `cursor?: string`, `limit?: number`, `status?: CreditStatus`, `type?: CreditType`
- **Response**: `CreditsListResponse { items: Credit[], nextCursor?: string, hasMore: boolean }`

### GET `/v1/wallet/credits/:creditId`
- **Auth**: Bearer JWT
- **Response**: `CreditWithContext { ...Credit, events: CreditEvent[], disputes: Dispute[] }`
- **Errors**: 404 crédito não encontrado

### POST `/v1/wallet/disputes/:creditId`
- **Auth**: Bearer JWT
- **Request**: `{ reason: string, metadata?: object }`
- **Response**: `Dispute` (201)

### POST `/v1/wallet/refunds/:creditId`
- **Auth**: Bearer JWT
- **Request**: `{ reason: string, note?: string }`
- **Response**: `RefundRequest` (201)

### GET `/v1/wallet/refunds?status&limit&offset`
- **Auth**: Bearer JWT
- **Query**: `status?: RefundStatus`, `limit?: number`, `offset?: number`
- **Response**: `RefundRequest[]`

### GET `/v1/wallet/notifications`
- **Auth**: Bearer JWT
- **Response**: `WalletNotification[]`

---

## Wallet — Admin

### GET `/v1/wallet/admin/wallets?limit&offset&userId`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Response**: `WalletSummary[]`

### GET `/v1/wallet/admin/wallets/:userId`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Response**: `WalletSummary + credits (recentes)`

### GET `/v1/wallet/admin/credits?status&type&userId&originType&limit&offset`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Response**: `Credit[]`

### GET `/v1/wallet/admin/reconciliation?walletId&limit`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Response**: `ReconciliationResult[]`

### PATCH `/v1/wallet/admin/reconciliation/:reconciliationId/correct`
- **Auth**: Bearer JWT | Roles: SUPER_ADMIN
- **Request**: `{ reason?: string }`
- **Response**: `ReconciliationResult`

### GET `/v1/wallet/admin/disputes?status&limit&offset`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Response**: `Dispute[]`

### PATCH `/v1/wallet/admin/disputes/:disputeId`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Request**: `{ status?: DisputeStatus, investigationNotes?: string, resolution?: string }`
- **Response**: `Dispute`

### GET `/v1/wallet/admin/refunds?status&limit&offset`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Response**: `RefundRequest[]`

### PATCH `/v1/wallet/admin/refunds/:refundId/approve`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Request**: `{ notes?: string }`
- **Response**: `RefundRequest`

### PATCH `/v1/wallet/admin/refunds/:refundId/reject`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Request**: `{ reason: string }`
- **Response**: `RefundRequest`

### GET `/v1/wallet/admin/audit-log?walletId&creditId&action&limit&offset`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Response**: `WalletAuditLogEntry[]`

### GET `/v1/wallet/admin/analytics?from&to`
- **Auth**: Bearer JWT | Roles: ADMIN, SUPER_ADMIN
- **Query**: `from?: ISO8601`, `to?: ISO8601`
- **Response**: `WalletAnalytics`

### POST `/v1/wallet/admin/issue`
- **Auth**: Bearer JWT | Roles: SUPER_ADMIN
- **Request**: `IssueCreditDto { userId, amount, type, originType, expiresAt?, note? }`
- **Response**: `Credit` (201)

### POST `/v1/wallet/admin/cancel`
- **Auth**: Bearer JWT | Roles: SUPER_ADMIN
- **Request**: `CancelCreditDto { creditId, reason? }`
- **Response**: 200 OK

---

## Storage

### POST `/v1/storage/upload`
- **Auth**: Bearer JWT
- **Content-Type**: `multipart/form-data`
- **Request**: `file: File`, `bucket: StorageBucket`, `folder?: string`
- **Limit**: 50MB por arquivo
- **Response**: `UploadResponse { path, fullPath, bucket, size, mimeType }`

### GET `/v1/storage/signed-url?bucket&path&expiresIn`
- **Auth**: Bearer JWT
- **Query**: `bucket: StorageBucket`, `path: string`, `expiresIn?: number` (segundos)
- **Response**: `SignedUrlResponse { signedUrl, expiresAt }`

### DELETE `/v1/storage/file`
- **Auth**: Bearer JWT
- **Body**: `{ bucket: StorageBucket, path: string }`
- **Response**: 204 No Content
