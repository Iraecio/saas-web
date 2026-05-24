# Tasks: Cobertura Completa da API no Frontend

**Input**: Design documents from `specs/001-full-api-coverage/`

**Prerequisites**: plan.md âœ… | spec.md âœ… | research.md âœ… | data-model.md âœ… | contracts/api-contracts.md âœ… | quickstart.md âœ…

**Tests**: NÃ£o solicitados â€” nenhuma task de teste gerada.

**Organization**: Tasks agrupadas por User Story para permitir implementaÃ§Ã£o e validaÃ§Ã£o independente.

> **Nota sobre US4 (Role Requests)**: Feature jÃ¡ completamente implementada no frontend (service + pÃ¡ginas + rotas existem). Nenhuma task necessÃ¡ria.
> **Nota sobre US6 (Resellers Admin)**: Coberta por T002 na Phase 1 (correÃ§Ã£o de endpoint).

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependÃªncias pendentes)
- **[Story]**: User story Ã  qual a task pertence (ex: US1, US2...)
- Paths exatos incluÃ­dos em todas as descriptions

---

## Phase 1: Setup â€” CorreÃ§Ãµes de CÃ³digo Existente

**Purpose**: Corrigir os 3 problemas identificados no cÃ³digo antes de adicionar novas features. Essas correÃ§Ãµes eliminam inconsistÃªncias que afetariam todo o cÃ³digo novo.

- [X] T001 Consolidar os dois ApiService duplicados: mover todos os mÃ©todos de domÃ­nio de `src/app/service/api.service.ts` para `src/app/core/services/api.service.ts`, atualizar todos os imports nos arquivos que usam o serviÃ§o raiz (`src/app/features/resellers/services/reseller.ts`, `src/app/features/users/services/user.ts`), e remover o arquivo duplicado `src/app/service/api.service.ts`
- [X] T Corrigir `ResellerService` para usar `GET /admin/revendedores` no lugar de `GET /users?role=RESELLER`, atualizando o mÃ©todo `list()` e removendo o mapeamento `mapUsersToResellers` desnecessÃ¡rio em `src/app/features/resellers/services/reseller.ts`
- [X] T Corrigir `UserService.mapToListItem` para preservar todos os 7 valores de `UserRole` (SUPER_ADMIN, ADMIN, RESELLER, RESELLER_MANAGER, VOICE_ACTOR, PRODUCER, CLIENT) no lugar da simplificaÃ§Ã£o atual 'admin'/'user' em `src/app/features/users/services/user.ts`

**Checkpoint**: Sem regressÃµes â€” revendedores listam corretamente via endpoint admin, roles preservados na listagem de usuÃ¡rios.

---

## Phase 2: Foundational â€” Modelos de Dados

**Purpose**: Criar todas as interfaces TypeScript necessÃ¡rias para as novas features. Estas tasks BLOQUEIAM as phases de implementaÃ§Ã£o.

**âš ï¸ CRÃTICO**: Nenhuma implementaÃ§Ã£o de feature pode comeÃ§ar antes desta phase estar completa.

- [X] T [P] Estender interface `User` adicionando `avatarUrl`, `department`, `jobTitle`; adicionar interfaces `UserPermission` e `GrantPermissionDto` em `src/app/core/models/user.model.ts`
- [X] T [P] Criar `src/app/core/models/profile.model.ts` com interfaces: `VoiceProfile`, `ProducerProfile`, `ClientProfile`, `StorageQuota` (campos conforme `data-model.md`)
- [X] T [P] Criar `src/app/core/models/custom-domain.model.ts` com interfaces: `CustomDomain`, `RegisterCustomDomainDto`, `RegisterCustomDomainResponse`
- [X] T [P] Criar `src/app/core/models/wallet.model.ts` com todos os tipos de wallet: enums (`CreditStatus`, `CreditType`, `CreditOriginType`, `CreditEventType`, `RefundStatus`, `DisputeStatus`), interfaces (`WalletBalance`, `Credit`, `CreditEvent`, `CreditWithContext`, `CreditsListResponse`, `Dispute`, `RefundRequest`, `WalletNotification`, `IssueCreditDto`, `CancelCreditDto`, `WalletSummary`, `ReconciliationResult`, `WalletAnalytics`, `WalletAuditLogEntry`) conforme `data-model.md`
- [X] T [P] Criar `src/app/core/models/storage.model.ts` com: tipo `StorageBucket`, interfaces `UploadResponse`, `SignedUrlResponse`, `DeleteFileDto`

**Checkpoint**: Modelos completos â€” TypeScript pode validar tipos em todos os novos serviÃ§os.

---

## Phase 3: User Story 1 â€” AutenticaÃ§Ã£o Completa (Priority: P1)

**Goal**: Completar o fluxo de autenticaÃ§Ã£o adicionando o cadastro de revendedor (Ãºnico endpoint ainda sem tela).

**Independent Test**: Acessar `/auth/register-reseller`, preencher o formulÃ¡rio com email, senha e nome da empresa, submeter e verificar que a tela de confirmaÃ§Ã£o exibe o `defaultDomain` retornado pela API.

- [X] T [US1] Adicionar mÃ©todo `registerReseller(dto: RegisterResellerDto): Observable<RegisterResellerResponse>` que chama `POST /auth/register-reseller` ao `AuthService` em `src/app/core/services/auth.ts`
- [X] T [US1] Criar `RegisterResellerComponent` com formulÃ¡rio (campos: email, password, name, companyName) e tela de confirmaÃ§Ã£o que exibe o `defaultDomain` retornado; redirecionar para `/auth/login` apÃ³s confirmaÃ§Ã£o em `src/app/features/auth/pages/register-reseller/register-reseller.ts`
- [X] T [US1] Adicionar rota `register-reseller` ao `AUTH_ROUTES` apontando para `RegisterResellerComponent` em `src/app/features/auth/auth.routes.ts`

**Checkpoint**: US1 completo â€” todos os 6 endpoints de auth tÃªm interface correspondente.

---

## Phase 4: User Story 2 â€” Perfil do PrÃ³prio UsuÃ¡rio (Priority: P1)

**Goal**: Permitir que qualquer usuÃ¡rio visualize e edite seus dados de perfil, perfil especializado por papel e cota de armazenamento.

**Independent Test**: Fazer login como VOICE_ACTOR, acessar `/admin/profile`, ver os dados do perfil, navegar para `/admin/profile/voice` e editar um campo; confirmar que a alteraÃ§Ã£o Ã© salva e refletida.

- [X] T [US2] Criar `ProfileService` com mÃ©todos: `getVoiceProfile(userId)`, `updateVoiceProfile(userId, dto)`, `getProducerProfile(userId)`, `updateProducerProfile(userId, dto)`, `getClientProfile(userId)`, `updateClientProfile(userId, dto)`, `getStorageQuota(userId)` â€” todos injetando o `ApiService` consolidado em `src/app/features/profile/services/my-profile.ts`
- [X] T [P] [US2] Criar `ProfileOverviewComponent` exibindo dados do usuÃ¡rio logado (nome, email, papel, avatar, departamento, cargo) com formulÃ¡rio de ediÃ§Ã£o inline via `PUT /users/me`; incluir widget de cota de armazenamento (usado/total em %) ao final da pÃ¡gina em `src/app/features/profile/pages/overview/overview.ts`
- [X] T [P] [US2] Criar `VoiceProfilePageComponent` com seÃ§Ã£o de visualizaÃ§Ã£o e formulÃ¡rio de ediÃ§Ã£o dos campos do perfil de locutor; visÃ­vel apenas para usuÃ¡rios com papel `VOICE_ACTOR` em `src/app/features/profile/pages/voice-profile/voice-profile.ts`
- [X] T [P] [US2] Criar `ProducerProfilePageComponent` com seÃ§Ã£o de visualizaÃ§Ã£o e formulÃ¡rio de ediÃ§Ã£o dos campos do perfil de produtor; visÃ­vel apenas para usuÃ¡rios com papel `PRODUCER` em `src/app/features/profile/pages/producer-profile/producer-profile.ts`
- [X] T [P] [US2] Criar `ClientProfilePageComponent` com seÃ§Ã£o de visualizaÃ§Ã£o e formulÃ¡rio de ediÃ§Ã£o dos campos do perfil de cliente; visÃ­vel apenas para usuÃ¡rios com papel `CLIENT` em `src/app/features/profile/pages/client-profile/client-profile.ts`
- [X] T [US2] Criar `profile.routes.ts` com rotas lazy: `/profile` â†’ `ProfileOverviewComponent`, `/profile/voice` â†’ `VoiceProfilePageComponent`, `/profile/producer` â†’ `ProducerProfilePageComponent`, `/profile/client` â†’ `ClientProfilePageComponent` em `src/app/features/profile/profile.routes.ts`
- [X] T [US2] Registrar `loadChildren` para `PROFILE_ROUTES` no path `/admin/profile` dentro do bloco `canActivate: [authGuard]` em `src/app/app.routes.ts`

**Checkpoint**: US2 completo â€” todos os papÃ©is podem acessar e editar seu perfil especializado.

---

## Phase 5: User Story 3 â€” GestÃ£o de PermissÃµes de UsuÃ¡rio (Priority: P2)

**Goal**: Completar a gestÃ£o de usuÃ¡rios pelo admin adicionando a interface para conceder e revogar permissÃµes granulares.

**Independent Test**: Fazer login como ADMIN, acessar a listagem de usuÃ¡rios, abrir um usuÃ¡rio, navegar para a aba/pÃ¡gina de permissÃµes, conceder a permissÃ£o `manage_clients`, verificar que aparece na lista; revogar e verificar que Ã© removida.

- [X] T [US3] Adicionar mÃ©todos `grantPermission(userId, dto: GrantPermissionDto): Observable<UserPermission>` e `revokePermission(userId, permissionName: string): Observable<void>` ao `UserService` em `src/app/features/users/services/user.ts`
- [X] T [US3] Criar `PermissionsPageComponent` exibindo tabela de permissÃµes ativas do usuÃ¡rio com colunas: permissÃ£o, concedida por, data de concessÃ£o, validade; formulÃ¡rio para conceder nova permissÃ£o (nome + validade opcional); botÃ£o revogar por linha em `src/app/features/users/pages/permissions/permissions.ts`
- [X] T [US3] Adicionar rota `/:id/permissions` ao `USERS_ROUTES` apontando para `PermissionsPageComponent` em `src/app/features/users/users.routes.ts`
- [X] T [US3] Adicionar link/botÃ£o "Gerenciar PermissÃµes" na pÃ¡gina de detalhe/ediÃ§Ã£o do usuÃ¡rio que navega para `/:id/permissions` em `src/app/features/users/pages/form/users-form.ts`

**Checkpoint**: US3 completo â€” admin pode gerenciar todo o ciclo de vida de usuÃ¡rios incluindo permissÃµes.

---

## Phase 6: User Story 5 â€” DomÃ­nios Customizados (Priority: P2)

**Goal**: Permitir que revendedores registrem domÃ­nios customizados, visualizem instruÃ§Ãµes DNS e gerenciem o ciclo de vida dos domÃ­nios.

**Independent Test**: Fazer login como RESELLER, acessar `/admin/custom-domains`, registrar o domÃ­nio `minha-revenda.com.br`, verificar que as instruÃ§Ãµes DNS sÃ£o exibidas em um modal; ver o domÃ­nio na lista com status ativo; clicar em desativar e confirmar que o status muda.

- [X] T [US5] Criar `CustomDomainService` com mÃ©todos: `registerDomain(resellerId, dto): Observable<RegisterCustomDomainResponse>`, `listDomains(resellerId): Observable<CustomDomain[]>`, `deactivateDomain(resellerId, domainId): Observable<void>` em `src/app/features/custom-domains/services/custom-domain.ts`
- [X] T [US5] Criar `CustomDomainsListComponent` com tabela de domÃ­nios registrados (colunas: domÃ­nio, status ativo/inativo, data de criaÃ§Ã£o, aÃ§Ãµes); formulÃ¡rio de registro (campo de domÃ­nio + botÃ£o registrar); modal de instruÃ§Ãµes DNS exibido apÃ³s registro bem-sucedido; botÃ£o desativar por linha com confirmaÃ§Ã£o em `src/app/features/custom-domains/pages/list/list.ts`
- [X] T [US5] Criar `custom-domains.routes.ts` com rota para `CustomDomainsListComponent` recebendo `resellerId` como route param em `src/app/features/custom-domains/custom-domains.routes.ts`
- [X] T [US5] Registrar `loadChildren` para `CUSTOM_DOMAINS_ROUTES` no path `/admin/custom-domains` em `src/app/app.routes.ts`

**Checkpoint**: US5 completo â€” revendedores podem gerenciar domÃ­nios customizados end-to-end.

---

## Phase 7: User Story 7 â€” Carteira do UsuÃ¡rio (Priority: P3)

**Goal**: Permitir que qualquer usuÃ¡rio autenticado visualize seu saldo, histÃ³rico de crÃ©ditos, abra disputas, solicite reembolsos e veja notificaÃ§Ãµes da carteira.

**Independent Test**: Fazer login como CLIENT, acessar `/admin/wallet`, ver o saldo; navegar para a lista de crÃ©ditos e carregar mais itens (cursor pagination); abrir um crÃ©dito e ver o histÃ³rico de eventos; reportar uma disputa e verificar que aparece no detalhe do crÃ©dito.

- [X] T [US7] Criar `WalletService` com mÃ©todos: `getBalance()`, `listCredits(params: {cursor?, limit?, status?, type?})`, `getCreditWithContext(creditId)`, `reportDispute(creditId, dto)`, `requestRefund(creditId, dto)`, `listRefunds(params)`, `getNotifications()` em `src/app/features/wallet/services/wallet.ts`
- [X] T [P] [US7] Criar `WalletBalancePage` exibindo saldo atual em destaque, lista de notificaÃ§Ãµes com badges por tipo (EXPIRING_SOON, FROZEN, etc.) e links de aÃ§Ã£o rÃ¡pida para crÃ©ditos e reembolsos em `src/app/features/wallet/pages/balance/balance.ts`
- [X] T [P] [US7] Criar `CreditsListPage` com listagem de crÃ©ditos usando cursor pagination (botÃ£o "Carregar mais" acumula items), filtros de status e tipo via dropdowns, coluna de status com `p-tag` colorida por valor em `src/app/features/wallet/pages/credits/credits.ts`
- [X] T [US7] Criar `CreditDetailPage` exibindo: dados do crÃ©dito (valor, tipo, status, validade), linha do tempo de eventos (`CreditEvent[]`), lista de disputas com formulÃ¡rio de "Reportar disputa" em dialog, botÃ£o "Solicitar reembolso" que abre dialog com campo de justificativa em `src/app/features/wallet/pages/credit-detail/credit-detail.ts`
- [X] T [US7] Criar `RefundsListPage` com tabela de reembolsos do usuÃ¡rio, filtro por status, colunas: crÃ©dito, motivo, status, data da solicitaÃ§Ã£o em `src/app/features/wallet/pages/refunds/refunds.ts`
- [X] T [US7] Criar `wallet.routes.ts` com rotas: `/wallet` â†’ `WalletBalancePage`, `/wallet/credits` â†’ `CreditsListPage`, `/wallet/credits/:id` â†’ `CreditDetailPage`, `/wallet/refunds` â†’ `RefundsListPage` em `src/app/features/wallet/wallet.routes.ts`
- [X] T [US7] Registrar `loadChildren` para `WALLET_ROUTES` no path `/admin/wallet` em `src/app/app.routes.ts`

**Checkpoint**: US7 completo â€” usuÃ¡rios tÃªm acesso completo Ã  sua carteira e podem gerir crÃ©ditos.

---

## Phase 8: User Story 8 â€” Painel Financeiro do Admin (Priority: P3)

**Goal**: Fornecer ao admin ferramentas completas de gestÃ£o financeira: carteiras, crÃ©ditos, disputas, reembolsos, reconciliaÃ§Ã£o, auditoria e analytics. SUPER_ADMIN pode emitir e cancelar crÃ©ditos e corrigir reconciliaÃ§Ãµes.

**Independent Test**: Fazer login como ADMIN, acessar `/admin/wallet-admin/wallets`, ver a lista de carteiras; buscar por userId; acessar o detalhe de uma carteira; navegar para analytics e ver os totais com filtro de perÃ­odo; como SUPER_ADMIN, emitir crÃ©ditos para um usuÃ¡rio e verificar que o saldo na carteira aumenta.

- [X] T [US8] Criar `WalletAdminService` com todos os 14 mÃ©todos admin: `listWallets(params)`, `getWalletDetails(userId)`, `searchCredits(params)`, `getReconciliationResults(params)`, `correctReconciliation(id, reason)`, `listDisputes(params)`, `updateDispute(id, dto)`, `listAllRefunds(params)`, `approveRefund(id, notes)`, `rejectRefund(id, reason)`, `getAuditLog(params)`, `getAnalytics(params)`, `issueCredits(dto)`, `cancelCredits(dto)` em `src/app/features/wallet-admin/services/wallet-admin.ts`
- [X] T [P] [US8] Criar `WalletsListPage` com tabela de carteiras (userId, saldo, nÂº de crÃ©ditos, criaÃ§Ã£o), paginaÃ§Ã£o offset, campo de busca por userId em `src/app/features/wallet-admin/pages/wallets/wallets.ts`
- [X] T [P] [US8] Criar `WalletDetailAdminPage` exibindo saldo do usuÃ¡rio, tabela de crÃ©ditos recentes com link para busca completa em `src/app/features/wallet-admin/pages/wallet-detail/wallet-detail.ts`
- [X] T [P] [US8] Criar `CreditsSearchPage` com barra de filtros multi-select (status, type, originType, userId), tabela de resultados paginada por offset em `src/app/features/wallet-admin/pages/credits/credits.ts`
- [X] T [P] [US8] Criar `DisputesAdminPage` com tabela de disputas filtrÃ¡veis por status, dialog inline para adicionar notas de investigaÃ§Ã£o e resoluÃ§Ã£o via `PATCH /wallet/admin/disputes/:id` em `src/app/features/wallet-admin/pages/disputes/disputes.ts`
- [X] T [P] [US8] Criar `RefundsAdminPage` com tabela de reembolsos filtrÃ¡veis por status, botÃµes "Aprovar" (com campo de notas) e "Rejeitar" (com campo de motivo obrigatÃ³rio) por linha em `src/app/features/wallet-admin/pages/refunds/refunds.ts`
- [X] T [P] [US8] Criar `ReconciliationPage` com tabela de resultados (walletId, saldo esperado, saldo real, diferenÃ§a, status OK/MISMATCH), botÃ£o "Corrigir" visÃ­vel apenas para SUPER_ADMIN nas linhas com status MISMATCH em `src/app/features/wallet-admin/pages/reconciliation/reconciliation.ts`
- [X] T [P] [US8] Criar `AuditLogPage` com tabela de entradas de auditoria, filtros: walletId, creditId, action; paginaÃ§Ã£o offset em `src/app/features/wallet-admin/pages/audit-log/audit-log.ts`
- [X] T [P] [US8] Criar `AnalyticsPage` com seletor de perÃ­odo (from/to), cards de resumo (total emitido, gasto, reembolsos, disputas, taxa de resoluÃ§Ã£o) usando `p-chart` para visualizaÃ§Ã£o de tendÃªncias em `src/app/features/wallet-admin/pages/analytics/analytics.ts`
- [X] T [US8] Criar `IssueCreditsPage` (exclusivo SUPER_ADMIN) com formulÃ¡rio para emitir crÃ©ditos (userId, amount, type, originType, expiresAt, note) e seÃ§Ã£o de cancelamento de crÃ©ditos (creditId, reason) em `src/app/features/wallet-admin/pages/issue-credits/issue-credits.ts`
- [X] T [US8] Criar `wallet-admin.routes.ts` com todas as rotas do mÃ³dulo; aplicar `canActivate: [roleGuard]` com `data: { roles: ['ADMIN', 'SUPER_ADMIN'] }` no mÃ³dulo; aplicar `data: { roles: ['SUPER_ADMIN'] }` especificamente nas rotas `issue-credits` e no botÃ£o de correÃ§Ã£o de reconciliaÃ§Ã£o em `src/app/features/wallet-admin/wallet-admin.routes.ts`
- [X] T [US8] Registrar `loadChildren` para `WALLET_ADMIN_ROUTES` no path `/admin/wallet-admin` em `src/app/app.routes.ts`

**Checkpoint**: US8 completo â€” admin tem visibilidade e controle total sobre as finanÃ§as da plataforma.

---

## Phase 9: User Story 9 â€” Armazenamento de Arquivos (Priority: P3)

**Goal**: Permitir que usuÃ¡rios autenticados faÃ§am upload de arquivos, gerem links temporÃ¡rios de acesso e deletem arquivos.

**Independent Test**: Fazer login, acessar `/admin/storage`, selecionar bucket "imagens", fazer upload de um arquivo PNG de 1MB; verificar barra de progresso durante upload; clicar em "Gerar link" e verificar que uma URL Ã© exibida; clicar em deletar e confirmar que o arquivo Ã© removido da lista.

- [X] T [US9] Criar `StorageService` com mÃ©todos: `uploadFile(file: File, bucket, folder?): Observable<UploadResponse>` usando `HttpClient` com `FormData` e `reportProgress: true` para emitir progresso; `getSignedUrl(bucket, path, expiresIn?): Observable<SignedUrlResponse>`; `deleteFile(dto: DeleteFileDto): Observable<void>` em `src/app/features/storage/services/storage.ts`
- [X] T [US9] Criar `FileManagerPage` com: seletor de bucket (images/audios/documents), Ã¡rea de drag-and-drop/browse para upload com barra de progresso (`HttpEventType.UploadProgress`), validaÃ§Ã£o de tamanho mÃ¡ximo 50MB no cliente antes do upload; tabela de arquivos recentes (path, tamanho, tipo); botÃ£o "Gerar link" que exibe URL assinada em um dialog copiÃ¡vel; botÃ£o "Deletar" com confirmaÃ§Ã£o em `src/app/features/storage/pages/file-manager/file-manager.ts`
- [X] T [US9] Criar `storage.routes.ts` com rota raiz para `FileManagerPage` em `src/app/features/storage/storage.routes.ts`
- [X] T [US9] Registrar `loadChildren` para `STORAGE_ROUTES` no path `/admin/storage` em `src/app/app.routes.ts`

**Checkpoint**: US9 completo â€” usuÃ¡rios podem fazer upload, acessar e remover arquivos.

---

## Phase Final: Polish & Cross-Cutting Concerns

**Purpose**: Melhorias que afetam mÃºltiplas User Stories â€” navegaÃ§Ã£o, guards, links de dashboard.

- [X] T [P] Atualizar componente de sidebar com links para todas as novas features: Perfil (`/admin/profile`), Carteira (`/admin/wallet`), Armazenamento (`/admin/storage`) para usuÃ¡rios; Carteira Admin (`/admin/wallet-admin`), DomÃ­nios Customizados (`/admin/custom-domains`) para admins/revendedores em `src/app/shared/components/sidebar/sidebar.ts`
- [X] T Auditar e aplicar `canActivate: [roleGuard]` em todas as rotas que ainda nÃ£o tÃªm proteÃ§Ã£o explÃ­cita por papel: `/admin/wallet-admin` (ADMIN/SUPER_ADMIN), `/admin/custom-domains` (RESELLER/RESELLER_MANAGER/ADMIN/SUPER_ADMIN) em `src/app/app.routes.ts`
- [X] T [P] Atualizar `client-dashboard` com cards de navegaÃ§Ã£o para Carteira e Perfil (src/app/features/dashboard/pages/client-dashboard/client-dashboard.ts)
- [X] T [P] Atualizar `voice-actor-dashboard` com cards de navegaÃ§Ã£o para Perfil de Locutor e Armazenamento (src/app/features/dashboard/pages/voice-actor-dashboard/voice-actor-dashboard.ts)
- [X] T [P] Atualizar `producer-dashboard` com cards de navegaÃ§Ã£o para Perfil de Produtor e Armazenamento (src/app/features/dashboard/pages/producer-dashboard/producer-dashboard.ts)
- [X] T [P] Atualizar `reseller-dashboard` com card de navegaÃ§Ã£o para DomÃ­nios Customizados (src/app/features/dashboard/pages/reseller-dashboard/reseller-dashboard.ts)
- [X] T [P] Atualizar `admin-dashboard` com cards de navegaÃ§Ã£o para Carteira Admin e Analytics (src/app/features/dashboard/pages/admin-dashboard/admin-dashboard.ts)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** â€” Sem dependÃªncias, comeÃ§ar imediatamente
- **Foundational (Phase 2)** â€” Depende da Phase 1; **BLOQUEIA todas as fases de User Story**
- **US1 (Phase 3)** â€” Depende da Phase 2; independente das outras US
- **US2 (Phase 4)** â€” Depende da Phase 2 (profile.model.ts T005); independente de US1
- **US3 (Phase 5)** â€” Depende da Phase 2 (user.model.ts T004); independente de US1/US2
- **US5 (Phase 6)** â€” Depende da Phase 2 (custom-domain.model.ts T006); independente das anteriores
- **US7 (Phase 7)** â€” Depende da Phase 2 (wallet.model.ts T007); independente das anteriores
- **US8 (Phase 8)** â€” Depende da Phase 2 (wallet.model.ts T007); pode rodar em paralelo com US7
- **US9 (Phase 9)** â€” Depende da Phase 2 (storage.model.ts T008); independente das anteriores
- **Polish (Phase Final)** â€” Depende de todas as US desejadas estarem completas

### User Story Dependencies

- **US1 (P1)**: Pode comeÃ§ar apÃ³s Phase 2 â€” sem dependÃªncias de outras US
- **US2 (P1)**: Pode comeÃ§ar apÃ³s Phase 2 â€” sem dependÃªncias de outras US (paralelo com US1)
- **US3 (P2)**: Pode comeÃ§ar apÃ³s Phase 2 â€” sem dependÃªncias de outras US
- **US5 (P2)**: Pode comeÃ§ar apÃ³s Phase 2 â€” sem dependÃªncias de outras US
- **US7 (P3)**: Pode comeÃ§ar apÃ³s Phase 2 â€” sem dependÃªncias de outras US
- **US8 (P3)**: Pode comeÃ§ar apÃ³s Phase 2 â€” sem dependÃªncias de outras US (paralelo com US7)
- **US9 (P3)**: Pode comeÃ§ar apÃ³s Phase 2 â€” sem dependÃªncias de outras US

### Within Each User Story (ordem interna)

- ServiÃ§o â†’ Componentes de pÃ¡gina â†’ Rotas â†’ Registro no app.routes.ts
- Dentro de cada story: tasks marcadas [P] podem rodar em paralelo

---

## Parallel Example: User Story 8 (maior fase)

```
# ApÃ³s T034 (WalletAdminService) estar completo, lanÃ§ar em paralelo:
Task T035: WalletsListPage
Task T036: WalletDetailAdminPage
Task T037: CreditsSearchPage
Task T038: DisputesAdminPage
Task T039: RefundsAdminPage
Task T040: ReconciliationPage
Task T041: AuditLogPage
Task T042: AnalyticsPage

# T043 (IssueCreditsPage) depois â€” depende de WalletAdminService (T034)
# T044 (rotas com guards) depois â€” depende de todas as pÃ¡ginas
# T045 (registro no app.routes.ts) por Ãºltimo
```

---

## Implementation Strategy

### MVP First (User Stories P1 apenas)

1. Complete Phase 1: Setup (correÃ§Ãµes)
2. Complete Phase 2: Foundational (modelos)
3. Complete Phase 3: US1 (register-reseller)
4. Complete Phase 4: US2 (perfis)
5. **PARAR e VALIDAR**: todos os fluxos P1 funcionais
6. Deploy/demo se pronto

### Incremental Delivery

1. Setup + Foundational â†’ base sÃ³lida
2. US1 + US2 (P1) â†’ autenticaÃ§Ã£o + perfis completos
3. US3 + US5 (P2) â†’ permissÃµes + domÃ­nios
4. US7 + US8 (P3) â†’ wallet completa
5. US9 (P3) â†’ storage
6. Polish â†’ navegaÃ§Ã£o e dashboards completos

### Parallel Team Strategy

Com mÃºltiplos desenvolvedores apÃ³s Phase 2:
- Dev A: US1 + US2 (auth + profile)
- Dev B: US3 + US5 (users + custom-domains)
- Dev C: US7 + US8 (wallet user + wallet admin)
- Dev D: US9 + Polish (storage + dashboards)

---

## Notes

- `[P]` = arquivos diferentes, sem dependÃªncias pendentes no momento de execuÃ§Ã£o
- `[Story]` = rastreabilidade atÃ© a User Story do spec
- US4 (Role Requests) estÃ¡ **100% completa** â€” nenhuma task gerada
- US6 (Resellers Admin) foi coberta por **T002** na Phase 1
- Cada US Ã© independentemente testÃ¡vel ao final da sua phase
- Confirmar que **Angular SSR Ã© compatÃ­vel**: usar `isPlatformBrowser()` onde necessÃ¡rio (upload, localStorage)
- Commitar apÃ³s cada phase ou grupo lÃ³gico de tasks
