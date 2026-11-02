# Tasks: Administração completa de carteiras

**Input**: Design documents from `/specs/007-wallet-admin/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluídos para contratos financeiros, autorização, concorrência, apresentação e jornadas responsivas/acessíveis.

**Organization**: Tarefas agrupadas por história para permitir implementação e validação incremental.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode ser executada em paralelo por alterar arquivos independentes.
- **[Story]**: História de usuário atendida pela tarefa.
- Todos os caminhos são relativos ao repositório indicado; caminhos `../saas-api/` pertencem à API irmã.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar contratos, modelos e rotas sem alterar o comportamento entregue.

- [x] T001 Criar modelos administrativos paginados e versionados em `src/app/core/models/wallet-admin.model.ts`
- [x] T002 [P] Criar utilitários de apresentação de papéis, valores e estados em `src/app/features/wallet-admin/services/wallet-admin.presentation.ts`
- [x] T003 [P] Criar estado serializável de consulta e seleção em `src/app/features/wallet-admin/services/wallet-admin-query.ts`
- [x] T004 Atualizar rotas e restringir todo o módulo a SUPER_ADMIN em `src/app/app.routes.ts` e `src/app/features/wallet-admin/wallet-admin.routes.ts`
- [ ] T005 [P] Criar fixtures de carteiras de todos os papéis e estados em `src/app/features/wallet-admin/testing/wallet-admin.fixtures.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Entregar contratos seguros e componentes compartilhados que bloqueiam as histórias.

**⚠️ CRITICAL**: Nenhuma história deve iniciar integração real antes da conclusão desta fase.

- [ ] T006 Implementar DTOs de consulta, página, detalhe, versão, prévia e resultado em `../saas-api/src/modules/wallet/dto/admin-wallet.dto.ts`
- [ ] T007 [P] Implementar DTOs de seleção, ação individual, lote e exportação em `../saas-api/src/modules/wallet/dto/admin-wallet-action.dto.ts`
- [ ] T008 Adicionar consultas agregadas sem N+1 e paginação server-side em `../saas-api/src/modules/wallet/repositories/wallet.repository.ts`
- [x] T009 Implementar autorização exclusiva, overview, lista, detalhe e coleções paginadas em `../saas-api/src/modules/wallet/wallet.controller.ts` e `../saas-api/src/modules/wallet/wallet.service.ts`
- [ ] T010 Implementar prévia, idempotência, mutações compensatórias, versão e conflito em `../saas-api/src/modules/wallet/wallet.controller.ts` e `../saas-api/src/modules/wallet/wallet.service.ts`
- [ ] T011 [P] Criar testes de contrato, autorização e paginação administrativa em `../saas-api/src/modules/wallet/wallet.controller.spec.ts`
- [ ] T012 [P] Criar testes de integridade, idempotência e concorrência em `../saas-api/src/modules/wallet/wallet.service.methods.spec.ts`
- [ ] T013 Atualizar o cliente para overview, lista, detalhe, coleções, prévias e ações em `src/app/features/wallet-admin/services/wallet-admin.ts`
- [x] T014 [P] Cobrir serialização de query, restauração e descarte seguro da seleção em `src/app/features/wallet-admin/services/wallet-admin-query.spec.ts`
- [x] T015 [P] Cobrir URLs, envelopes, conflitos e consulta idempotente em `src/app/features/wallet-admin/services/wallet-admin.spec.ts`
- [ ] T016 Criar dialog acessível reutilizável de prévia/confirmacão em `src/app/features/wallet-admin/components/wallet-admin-actions/wallet-admin-actions.ts`
- [ ] T017 [P] Criar componentes compartilhados de skeleton, vazio, erro, offline e stale em `src/app/features/wallet-admin/components/wallet-admin-state/wallet-admin-state.ts`

**Checkpoint**: API e infraestrutura frontend suportam consultas e ações seguras, sem depender da UI final.

---

## Phase 3: User Story 1 - Localizar e compreender qualquer carteira (Priority: P1) 🎯 MVP

**Goal**: Entregar overview, listagem responsiva e detalhe 360° somente leitura para todos os papéis.

**Independent Test**: Localizar carteiras de papéis distintos usando busca/filtros/ordenação/paginação, restaurar a URL e consultar todas as seções do detalhe sem executar mutações.

### Tests for User Story 1

- [x] T018 [P] [US1] Testar apresentação, formatação inteira e descrição textual de estados em `src/app/features/wallet-admin/services/wallet-admin.presentation.spec.ts`
- [ ] T019 [P] [US1] Testar filtros, ordenação, paginação, vazio e erro da lista em `src/app/features/wallet-admin/pages/wallets/wallets.spec.ts`
- [ ] T020 [P] [US1] Testar resumo e falhas independentes das seções em `src/app/features/wallet-admin/pages/wallet-detail/wallet-detail.spec.ts`

### Implementation for User Story 1

- [x] T021 [P] [US1] Implementar cards de indicadores e alertas acionáveis em `src/app/features/wallet-admin/pages/overview/overview.ts`
- [ ] T022 [P] [US1] Implementar formulário de filtros com painel desktop e drawer mobile em `src/app/features/wallet-admin/components/wallet-admin-filters/wallet-admin-filters.ts`
- [ ] T023 [P] [US1] Implementar tabela desktop/tablet ordenável e acessível em `src/app/features/wallet-admin/components/wallet-admin-table/wallet-admin-table.ts`
- [ ] T024 [P] [US1] Implementar cards mobile sem rolagem horizontal em `src/app/features/wallet-admin/components/wallet-admin-cards/wallet-admin-cards.ts`
- [x] T025 [US1] Integrar overview, query parameters, lista, totais, paginação e estados em `src/app/features/wallet-admin/pages/wallets/wallets.ts`
- [ ] T026 [P] [US1] Criar seções de saldo, créditos e movimentações em `src/app/features/wallet-admin/components/wallet-detail-sections/`
- [ ] T027 [P] [US1] Criar seções de reservas, disputas, estornos e auditoria em `src/app/features/wallet-admin/components/wallet-detail-sections/`
- [x] T028 [US1] Integrar resumo prioritário, navegação de seção e repetição isolada em `src/app/features/wallet-admin/pages/wallet-detail/wallet-detail.ts`
- [x] T029 [US1] Preservar compatibilidade e redirecionamentos das URLs administrativas legadas em `src/app/features/wallet-admin/wallet-admin.routes.ts`

**Checkpoint**: O superadmin consegue investigar qualquer carteira em qualquer breakpoint; a história é demonstrável sem ações administrativas.

---

## Phase 4: User Story 2 - Executar ações administrativas seguras (Priority: P2)

**Goal**: Permitir ações individuais com prévia, confirmação, integridade, feedback e auditoria.

**Independent Test**: Emitir, cancelar, ajustar, congelar/liberar e decidir uma pendência; verificar conflito de versão e recuperação após perda de conexão.

### Tests for User Story 2

- [ ] T030 [P] [US2] Testar validação, prévia, confirmação, foco e bloqueio de duplo envio em `src/app/features/wallet-admin/components/wallet-admin-actions/wallet-admin-actions.spec.ts`
- [ ] T031 [P] [US2] Testar conflito, resultado indeterminado e atualização focal no detalhe em `src/app/features/wallet-admin/pages/wallet-detail/wallet-detail-actions.spec.ts`
- [ ] T032 [P] [US2] Testar auditoria e efeitos das ações individuais em `../saas-api/src/modules/wallet/wallet.integration.spec.ts`

### Implementation for User Story 2

- [ ] T033 [P] [US2] Implementar formulários tipados de emissão e ajuste compensatório em `src/app/features/wallet-admin/components/wallet-admin-actions/wallet-credit-action-form.ts`
- [ ] T034 [P] [US2] Implementar formulários de cancelamento, congelamento e liberação em `src/app/features/wallet-admin/components/wallet-admin-actions/wallet-state-action-form.ts`
- [ ] T035 [P] [US2] Integrar decisões de disputa, estorno e conciliação em `src/app/features/wallet-admin/components/wallet-detail-sections/`
- [ ] T036 [US2] Orquestrar prévia, idempotência, conflito e consulta de resultado em `src/app/features/wallet-admin/services/wallet-admin-actions.ts`
- [ ] T037 [US2] Integrar capacidades, ações contextuais e atualização das seções afetadas em `src/app/features/wallet-admin/pages/wallet-detail/wallet-detail.ts`
- [ ] T038 [US2] Anunciar validação, progresso, sucesso, falha e correlação de auditoria em `src/app/features/wallet-admin/components/wallet-admin-actions/wallet-admin-actions.ts`

**Checkpoint**: Cada ação individual é segura, auditável e recuperável sem depender de lote.

---

## Phase 5: User Story 3 - Operar várias carteiras com eficiência (Priority: P3)

**Goal**: Entregar seleção explícita/por filtro, prévia, execução, relatório e exportação.

**Independent Test**: Selecionar carteiras em páginas diferentes ou todos os resultados filtrados, executar lote com inelegíveis e exportar o relatório.

### Tests for User Story 3

- [ ] T039 [P] [US3] Testar seleção por IDs/filtro, mudança incompatível e expiração em `src/app/features/wallet-admin/services/wallet-admin-query.spec.ts`
- [ ] T040 [P] [US3] Testar prévia, progresso e falha parcial em `src/app/features/wallet-admin/components/wallet-bulk-bar/wallet-bulk-bar.spec.ts`
- [ ] T041 [P] [US3] Testar revalidação, limites e resultado por registro em `../saas-api/src/modules/wallet/wallet-bulk-actions.spec.ts`

### Implementation for User Story 3

- [ ] T042 [US3] Implementar contratos de lote, processamento acompanhado e resultados paginados em `../saas-api/src/modules/wallet/wallet.controller.ts` e `../saas-api/src/modules/wallet/wallet.service.ts`
- [ ] T043 [P] [US3] Implementar exportação imediata/assíncrona com metadados do filtro em `../saas-api/src/modules/wallet/wallet-export.service.ts`
- [ ] T044 [US3] Implementar barra acessível de seleção e resumo do escopo em `src/app/features/wallet-admin/components/wallet-bulk-bar/wallet-bulk-bar.ts`
- [ ] T045 [US3] Integrar seleção explícita e lógica com tabela/cards/listagem em `src/app/features/wallet-admin/pages/wallets/wallets.ts`
- [ ] T046 [US3] Implementar prévia, acompanhamento e relatório de resultados em `src/app/features/wallet-admin/pages/bulk-operation/bulk-operation.ts`
- [x] T047 [US3] Integrar criação e download de exportações em `src/app/features/wallet-admin/services/wallet-admin.ts` e `src/app/features/wallet-admin/pages/wallets/wallets.ts`

**Checkpoint**: Operações de grande volume são previsíveis, revalidadas e auditáveis.

---

## Phase 6: User Story 4 - Acompanhar saúde e anomalias das carteiras (Priority: P4)

**Goal**: Exibir tendências e alertas que conduzem diretamente ao conjunto afetado.

**Independent Test**: Carregar período com dados conhecidos, conferir agregados e abrir cada alerta como lista filtrada.

### Tests for User Story 4

- [ ] T048 [P] [US4] Testar totais, período, vazio e links filtrados do overview em `src/app/features/wallet-admin/pages/overview/overview.spec.ts`
- [ ] T049 [P] [US4] Testar agregados e isolamento exclusivo do superadmin em `../saas-api/src/modules/wallet/wallet-analytics.spec.ts`

### Implementation for User Story 4

- [x] T050 [US4] Expandir agregados por papel, estado, período e alerta em `../saas-api/src/modules/wallet/wallet.service.ts`
- [x] T051 [US4] Implementar visualizações acessíveis de distribuição e tendência em `src/app/features/wallet-admin/pages/overview/overview.ts`
- [x] T052 [US4] Integrar atalhos de indicadores ao estado persistido da listagem em `src/app/features/wallet-admin/pages/overview/overview.ts`

**Checkpoint**: Alertas e indicadores priorizam investigações sem criar um fluxo separado.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validar qualidade transversal antes da entrega.

- [ ] T053 [P] Validar foco, labels, live regions, contraste e redução de movimento em `src/app/features/wallet-admin/`
- [ ] T054 [P] Validar desktop, tablet, 320 px, zoom de 200% e temas em `src/app/features/wallet-admin/`
- [ ] T055 Tratar acesso negado, sessão expirada e limpeza de dados administrativos em `src/app/core/interceptors/error.interceptor.ts` e `src/app/features/wallet-admin/`
- [ ] T056 [P] Adicionar testes de navegação e guarda SUPER_ADMIN em `src/app/app.routes.spec.ts`
- [ ] T057 Executar e registrar todos os cenários de `specs/007-wallet-admin/quickstart.md`
- [x] T058 Executar `npm test -- --watch=false` e `npm run build` no `saas-web`
- [x] T059 Executar `npm run db:generate`, `npm test -- --runInBand` e `npm run build` no `saas-api`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup**: inicia imediatamente.
- **Foundational**: depende dos modelos/rotas de Setup e bloqueia integração das histórias.
- **US1**: depende de Foundational e constitui o MVP.
- **US2**: depende de Foundational e integra-se ao detalhe da US1.
- **US3**: depende da seleção da US1 e da infraestrutura de ação da US2.
- **US4**: depende do overview/lista da US1, mas seus agregados podem ser desenvolvidos em paralelo à US2.
- **Polish**: depende das histórias incluídas no release.

### User Story Dependencies

- **US1 (P1)**: sem dependência de outra história após Foundational.
- **US2 (P2)**: reutiliza detalhe e componentes de estado da US1.
- **US3 (P3)**: reutiliza query state da US1 e prévia/idempotência da US2.
- **US4 (P4)**: reutiliza overview e links de consulta da US1; não depende das ações.

### Parallel Opportunities

- T002, T003 e T005 podem ocorrer em paralelo após T001.
- T007, T011, T012, T014, T015 e T017 atuam em arquivos independentes conforme suas dependências locais.
- Na US1, filtros, tabela, cards e seções podem ser implementados em paralelo antes da integração.
- Testes de cada história marcados `[P]` podem ser escritos simultaneamente.
- Após US1, US2 e os agregados de US4 podem avançar em paralelo.

## Parallel Example: User Story 1

```text
Task T022: filtros em wallet-admin-filters.ts
Task T023: tabela em wallet-admin-table.ts
Task T024: cards em wallet-admin-cards.ts
Task T026: seções de saldo/créditos/movimentações
Task T027: seções de reservas/disputas/estornos/auditoria
```

## Implementation Strategy

### MVP First

1. Concluir Setup e Foundational.
2. Entregar US1 com overview, lista e detalhe somente leitura.
3. Validar autorização, 100 mil carteiras, breakpoints e acessibilidade.
4. Demonstrar e estabilizar antes de habilitar mutações.

### Incremental Delivery

1. **MVP**: investigação completa e responsiva.
2. **Incremento 2**: ações individuais seguras.
3. **Incremento 3**: lote e exportação.
4. **Incremento 4**: analytics e alertas avançados.
5. **Release**: polish transversal e quickstart completo.

## Task Summary

- **Total**: 59 tarefas.
- **Setup**: 5.
- **Foundational**: 12.
- **US1**: 12.
- **US2**: 9.
- **US3**: 9.
- **US4**: 5.
- **Polish**: 7.
- **Parallelizable**: 27 tarefas marcadas `[P]`.
- **Suggested MVP**: Phases 1–3 (T001–T029).

## Format Validation

Todas as tarefas usam checkbox, ID sequencial, marcador `[P]` somente quando aplicável, label de história nas fases de história e caminhos de arquivo explícitos.
