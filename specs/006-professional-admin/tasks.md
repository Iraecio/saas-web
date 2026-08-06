# Tasks: Administração completa de profissionais

**Input**: Design documents from `specs/006-professional-admin/`

**Prerequisites**: spec.md, plan.md, research.md, data-model.md, contracts/

**Tests**: Obrigatórios para autorização, isolamento por escopo, ações críticas, impersonação somente leitura e jornadas responsivas.

**Organization**: As tarefas estão agrupadas por história para permitir entregas e validações independentes.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar contratos, tipos e estrutura compartilhada.

- [ ] T001 Validar os contratos administrativos com os módulos existentes em `specs/006-professional-admin/contracts/professional-admin-api.md`
- [ ] T002 [P] Criar os diretórios de componentes definidos no plano em `src/app/features/professionals/components/`
- [ ] T003 [P] Criar modelos, filtros e estados tipados em `src/app/core/models/professional-admin.model.ts`
- [ ] T004 [P] Criar DTOs administrativos de consulta e mutação em `../saas-api/src/modules/professional/dto/admin-professional.dto.ts`
- [ ] T005 Criar o serviço de auditoria das ações administrativas em `../saas-api/src/modules/professional/admin-professional-audit.service.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Disponibilizar API agregada, cliente frontend e controles de autorização usados por todas as histórias.

**⚠️ CRITICAL**: Nenhuma história começa antes desta fase estar concluída.

- [ ] T006 Implementar consulta paginada agregada sem N+1 em `../saas-api/src/modules/professional/admin-professional.service.ts`
- [ ] T007 Expor listagem e detalhe exclusivos de SUPER_ADMIN em `../saas-api/src/modules/professional/admin-professional.controller.ts`
- [ ] T008 [P] Testar autorização, escopo global/revenda, busca, ordenação e paginação em `../saas-api/src/modules/professional/admin-professional.service.spec.ts`
- [ ] T009 [P] Criar testes do cliente para serialização, paginação e erros em `src/app/features/professionals/services/professional-admin.spec.ts`
- [ ] T010 Implementar o cliente administrativo tipado em `src/app/features/professionals/services/professional-admin.ts`
- [ ] T011 Restringir as rotas administrativas ao SUPER_ADMIN em `src/app/features/professionals/professionals.routes.ts`
- [ ] T012 Criar helpers de apresentação para status, função, escopo e valores em `src/app/features/professionals/services/professional-admin.presentation.ts`

**Checkpoint**: Lista e detalhe administrativos possuem contrato, autorização e cliente estáveis.

---

## Phase 3: User Story 1 — Encontrar e gerenciar profissionais (Priority: P1) 🎯 MVP

**Goal**: Entregar listagem unificada, rápida e responsiva de locutores e produtores globais ou de revenda.

**Independent Test**: O superadmin localiza um profissional com filtros persistidos, alterna páginas e executa ações individuais ou em lote equivalentes no desktop e mobile.

### Tests for User Story 1

- [ ] T013 [P] [US1] Testar filtros, ordenação, paginação e persistência na URL em `src/app/features/professionals/pages/admin-list/admin-list.spec.ts`
- [ ] T014 [P] [US1] Testar tabela, cards, seleção e estados vazio/erro/carregamento em `src/app/features/professionals/components/professional-list/professional-list.spec.ts`

### Implementation for User Story 1

- [ ] T015 [P] [US1] Criar filtros de busca, tipo, escopo, status e verificação em `src/app/features/professionals/components/professional-filters/professional-filters.ts`
- [ ] T016 [US1] Criar tabela desktop com colunas e ações do contrato visual em `src/app/features/professionals/components/professional-list/professional-list.ts`
- [ ] T017 [US1] Criar cards mobile sem rolagem horizontal e com ações prioritárias em `src/app/features/professionals/components/professional-list/professional-list.ts`
- [ ] T018 [US1] Implementar seleção e ações em lote com resultado parcial em `src/app/features/professionals/components/professional-actions/professional-actions.ts`
- [ ] T019 [US1] Orquestrar URL, filtros, paginação, skeleton, vazio, erro e retry em `src/app/features/professionals/pages/admin-list/admin-list.ts`

**Checkpoint**: A listagem é utilizável e testável independentemente do detalhe 360º.

---

## Phase 4: User Story 2 — Consultar visão 360º do profissional (Priority: P1)

**Goal**: Reunir perfil, serviços, pedidos, carteira e histórico administrativo em uma única página.

**Independent Test**: Ao abrir um registro, o superadmin acessa resumo e cada seção secundária, com falhas isoladas e dados financeiros claros.

### Tests for User Story 2

- [ ] T020 [P] [US2] Testar agregado de perfil, indicadores e isolamento das consultas secundárias em `../saas-api/src/modules/professional/admin-professional.service.spec.ts`
- [ ] T021 [P] [US2] Testar carregamento independente, ausência de dados e retry por seção em `src/app/features/professionals/pages/admin-detail/admin-detail.spec.ts`

### Implementation for User Story 2

- [ ] T022 [US2] Implementar endpoints paginados de serviços, pedidos, carteira e auditoria em `../saas-api/src/modules/professional/admin-professional.controller.ts`
- [ ] T023 [P] [US2] Criar seção de resumo e perfil em `src/app/features/professionals/components/professional-detail-sections/profile-section.ts`
- [ ] T024 [P] [US2] Criar seção de serviços em `src/app/features/professionals/components/professional-detail-sections/services-section.ts`
- [ ] T025 [P] [US2] Criar seção de pedidos em `src/app/features/professionals/components/professional-detail-sections/orders-section.ts`
- [ ] T026 [P] [US2] Criar seção de carteira com saldo, bloqueios e transações em `src/app/features/professionals/components/professional-detail-sections/wallet-section.ts`
- [ ] T027 [P] [US2] Criar timeline de auditoria em `src/app/features/professionals/components/professional-detail-sections/audit-section.ts`
- [ ] T028 [US2] Orquestrar resumo e módulos independentes em `src/app/features/professionals/pages/admin-detail/admin-detail.ts`
- [ ] T029 [US2] Adicionar rota direta e retorno preservando filtros em `src/app/features/professionals/professionals.routes.ts`

**Checkpoint**: O detalhe 360º pode ser entregue e validado sem ações destrutivas.

---

## Phase 5: User Story 3 — Executar ações administrativas críticas (Priority: P2)

**Goal**: Editar, alterar escopo, bloquear, reativar e solicitar redefinição de senha com segurança e auditoria.

**Independent Test**: Cada ação exige as confirmações adequadas, produz feedback, aparece na auditoria e trata conflito concorrente sem sobrescrever alterações.

### Tests for User Story 3

- [ ] T030 [P] [US3] Testar edição, versão esperada, bloqueio, revogação de sessões e reset por link em `../saas-api/src/modules/professional/admin-professional.controller.spec.ts`
- [ ] T031 [P] [US3] Testar confirmações, validação, progresso, sucesso, erro e conflito em `src/app/features/professionals/components/professional-actions/professional-actions.spec.ts`

### Implementation for User Story 3

- [ ] T032 [US3] Implementar edição e alteração de escopo com versão esperada em `../saas-api/src/modules/professional/admin-professional.service.ts`
- [ ] T033 [US3] Implementar bloqueio reversível, reativação e revogação de sessões em `../saas-api/src/modules/professional/admin-professional.service.ts`
- [ ] T034 [US3] Implementar envio de link temporário de redefinição em `../saas-api/src/modules/auth/admin-password-reset.service.ts`
- [ ] T035 [US3] Expor endpoints críticos e registrar motivo, ator e resultado em `../saas-api/src/modules/professional/admin-professional.controller.ts`
- [ ] T036 [US3] Criar formulários e diálogos acessíveis de confirmação em `src/app/features/professionals/components/professional-actions/professional-actions.ts`
- [ ] T037 [US3] Implementar tratamento de conflito com comparação e recarga em `src/app/features/professionals/pages/admin-detail/admin-detail.ts`

**Checkpoint**: A gestão administrativa completa é auditável e resistente a concorrência.

---

## Phase 6: User Story 4 — Inspecionar a perspectiva do profissional (Priority: P2)

**Goal**: Permitir inspeção temporária e somente leitura sem substituir a sessão original do superadmin.

**Independent Test**: O superadmin informa um motivo, entra na perspectiva de um profissional ativo, navega apenas por leituras, encerra ou expira a inspeção e retorna à sessão original.

### Tests for User Story 4

- [ ] T038 [P] [US4] Testar emissão, TTL, alvo permitido, auditoria e revogação em `../saas-api/src/modules/auth/impersonation.service.spec.ts`
- [ ] T039 [P] [US4] Testar bloqueio server-side de toda mutação durante inspeção em `../saas-api/src/modules/auth/guards/impersonation-read-only.guard.spec.ts`
- [ ] T040 [P] [US4] Testar início, F5, expiração, encerramento e preservação da sessão admin em `src/app/core/services/impersonation.spec.ts`

### Implementation for User Story 4

- [ ] T041 [US4] Criar persistência e migração da sessão de inspeção em `../saas-api/src/modules/auth/entities/impersonation-session.entity.ts`
- [ ] T042 [US4] Implementar emissão e revogação de token separado com TTL máximo de 30 minutos em `../saas-api/src/modules/auth/impersonation.service.ts`
- [ ] T043 [US4] Bloquear métodos e recursos sensíveis no servidor em `../saas-api/src/modules/auth/guards/impersonation-read-only.guard.ts`
- [ ] T044 [US4] Expor início, sessão ativa, histórico e encerramento em `../saas-api/src/modules/auth/impersonation.controller.ts`
- [ ] T045 [US4] Implementar estado restaurável separado da autenticação principal em `src/app/core/services/impersonation.ts`
- [ ] T046 [US4] Anexar o token de inspeção somente nas leituras elegíveis em `src/app/core/interceptors/impersonation.interceptor.ts`
- [ ] T047 [US4] Criar banner persistente com alvo, expiração e ação de saída em `src/app/shared/components/impersonation-banner/impersonation-banner.ts`
- [ ] T048 [US4] Integrar início com motivo obrigatório e término seguro em `src/app/features/professionals/components/professional-actions/professional-actions.ts`
- [ ] T049 [US4] Integrar o banner ao shell autenticado em `src/app/layouts/admin-layout/admin-layout.ts`

**Checkpoint**: A inspeção reproduz o escopo do alvo, mas não permite qualquer alteração.

---

## Phase 7: User Story 5 — Operar com acessibilidade e resiliência (Priority: P3)

**Goal**: Garantir operação consistente em temas, viewports e estados adversos.

**Independent Test**: Jornadas principais funcionam por teclado e leitor de tela em 320, 768 e 1440 px, nos temas claro/escuro e nos estados offline, expirado e acesso negado.

- [ ] T050 [P] [US5] Testar nomes acessíveis, foco, anúncio de estado e retorno de diálogos em `src/app/features/professionals/pages/admin-list/admin-list.spec.ts`
- [ ] T051 [US5] Implementar drawer mobile de filtros com focus trap e retorno de foco em `src/app/features/professionals/components/professional-filters/professional-filters.ts`
- [ ] T052 [US5] Implementar acesso negado, sessão expirada, offline e registro alterado em `src/app/features/professionals/pages/admin-detail/admin-detail.ts`
- [ ] T053 [US5] Aplicar tokens light/dark, foco visível, alvos de 44 px e redução de movimento em `src/styles.scss`
- [ ] T054 [US5] Validar equivalência funcional sem rolagem horizontal em `src/app/features/professionals/components/professional-list/professional-list.ts`

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T055 [P] Revisar mensagens em português e feedbacks consistentes em `src/app/features/professionals/`
- [ ] T056 [P] Revisar logs para impedir exposição de tokens e dados sensíveis em `../saas-api/src/modules/auth/impersonation.service.ts`
- [ ] T057 Executar testes focados frontend e API conforme `specs/006-professional-admin/quickstart.md`
- [ ] T058 Executar formatação e build SSR de produção conforme `package.json`
- [ ] T059 Validar manualmente autorização, responsividade, temas, concorrência e inspeção conforme `specs/006-professional-admin/quickstart.md`

---

## Dependencies & Execution Order

- **Setup** precede a fundação; **Foundation** bloqueia todas as histórias.
- **US1** e **US2** podem avançar em paralelo após a fundação.
- **US3** depende do detalhe da US2 e dos componentes de ações da US1.
- **US4** depende da autorização fundamental, mas pode ser construída em paralelo à US3.
- **US5** é aplicada quando as superfícies das histórias anteriores existirem.
- T008–T009, T013–T014, T020–T021, T030–T031 e T038–T040 são oportunidades de paralelismo em arquivos distintos.

## Implementation Strategy

1. Entregar primeiro a lista unificada e o detalhe somente leitura como MVP seguro.
2. Adicionar ações críticas com auditoria e concorrência otimista.
3. Liberar inspeção somente após os testes server-side comprovarem o bloqueio de mutações.
4. Finalizar com matriz de acessibilidade, temas, viewports e estados adversos.
