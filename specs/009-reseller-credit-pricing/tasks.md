# Tasks: Configuração de Preços de Créditos do Revendedor

**Input**: Design documents from `/specs/009-reseller-credit-pricing/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluídos para dinheiro, autorização, concorrência, responsividade e acessibilidade.

**Organization**: Tarefas agrupadas por história para entrega incremental e validação independente.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar a modernização sem duplicar o domínio existente.

- [ ] T001 Confirmar a rota protegida e preservar compatibilidade em `src/app/features/reseller-credits/reseller-credits.routes.ts`
- [ ] T002 [P] Criar barrel dos componentes de pricing em `src/app/features/reseller-credits/components/pricing/index.ts`
- [ ] T003 [P] Adicionar item de menu “Preços e pacotes” aos papéis de revenda em `src/app/shared/components/sidebar/sidebar.ts`
- [ ] T004 [P] Documentar mapeamento dos contratos legados para os aditivos em `specs/009-reseller-credit-pricing/contracts/reseller-pricing-api.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Criar contratos, cálculo monetário, query state e segurança compartilhados.

**⚠️ CRITICAL**: Esta fase bloqueia todas as histórias.

- [ ] T005 Estender modelos de configuração, overview, pacote, prévia, versão, histórico e lote em `src/app/core/models/reseller-credit.model.ts`
- [ ] T006 [P] Criar DTOs validados de overview, prévia, comando, query e lote em `../saas-api/src/modules/credit-pricing/dto/reseller-pricing-admin.dto.ts`
- [ ] T007 [P] Testar autorização e isolamento entre revendas em `../saas-api/src/modules/credit-pricing/reseller-pricing.controller.spec.ts`
- [ ] T008 Implementar endpoints aditivos de overview, prévia, pacotes e histórico em `../saas-api/src/modules/credit-pricing/reseller-pricing.controller.ts`
- [ ] T009 Implementar versionamento, idempotência, prévia e auditoria em `../saas-api/src/modules/credit-pricing/reseller-pricing.service.ts`
- [ ] T010 [P] Testar preço em centavos, custo concorrente, preview expirado e idempotência em `../saas-api/src/modules/credit-pricing/reseller-pricing.service.spec.ts`
- [ ] T011 Implementar paginação, filtros e ordenação estável de pacotes/histórico em `../saas-api/src/modules/credit-pricing/repositories/reseller-pricing.repository.ts`
- [ ] T012 [P] Testar filtros, paginação, escopo e zero resultados em `../saas-api/src/modules/credit-pricing/repositories/reseller-pricing.repository.spec.ts`
- [ ] T013 Estender o cliente de overview, preview, comandos, pacotes, histórico e lote em `src/app/features/reseller-credits/services/reseller-credit.ts`
- [ ] T014 [P] Testar URLs, parâmetros, payloads e erros do cliente em `src/app/features/reseller-credits/services/reseller-credit.spec.ts`
- [ ] T015 Criar parser/serializer canônico da consulta de pacotes em `src/app/features/reseller-credits/services/reseller-pricing-query.ts`
- [ ] T016 [P] Testar defaults, round-trip e parâmetros inválidos em `src/app/features/reseller-credits/services/reseller-pricing-query.spec.ts`
- [ ] T017 Criar cálculos puros de moeda, preço efetivo, margem e status em `src/app/features/reseller-credits/services/reseller-pricing.presentation.ts`
- [ ] T018 [P] Testar arredondamento de exibição, margem zero/negativa e labels não cromáticos em `src/app/features/reseller-credits/services/reseller-pricing.presentation.spec.ts`

**Checkpoint**: Fundação segura e testável pronta.

---

## Phase 3: User Story 1 - Configurar preço unitário de revenda (Priority: P1) 🎯 MVP

**Goal**: Exibir custo/margem e salvar novo preço após prévia e confirmação.

**Independent Test**: Alterar preço válido, revisar impacto e confirmar atualização sem afetar vendas anteriores.

### Tests for User Story 1

- [ ] T019 [P] [US1] Testar skeleton, carga, erro, validação, sucesso e conflito em `src/app/features/reseller-credits/pages/pricing/pricing.spec.ts`
- [ ] T020 [P] [US1] Testar labels, erros associados e navegação por teclado do formulário em `src/app/features/reseller-credits/components/pricing/pricing-form/pricing-form.spec.ts`
- [ ] T021 [P] [US1] Testar foco, impacto e bloqueio de duplo envio no dialog em `src/app/features/reseller-credits/components/pricing/pricing-confirm-dialog/pricing-confirm-dialog.spec.ts`

### Implementation for User Story 1

- [ ] T022 [P] [US1] Implementar cards de custo, preço e margem com skeleton em `src/app/features/reseller-credits/components/pricing/pricing-overview/pricing-overview.ts`
- [ ] T023 [P] [US1] Implementar formulário reativo monetário e prévia local em `src/app/features/reseller-credits/components/pricing/pricing-form/pricing-form.ts`
- [ ] T024 [P] [US1] Implementar dialog acessível de prévia autoritativa e confirmação em `src/app/features/reseller-credits/components/pricing/pricing-confirm-dialog/pricing-confirm-dialog.ts`
- [ ] T025 [US1] Integrar overview, rascunho, preview, comando, sucesso e conflito em `src/app/features/reseller-credits/pages/pricing/pricing.ts`
- [ ] T026 [US1] Preservar rascunho seguro durante offline e bloquear mutações em `src/app/features/reseller-credits/pages/pricing/pricing.ts`

**Checkpoint**: Preço unitário pode ser configurado com segurança.

---

## Phase 4: User Story 2 - Controlar compra direta (Priority: P1)

**Goal**: Ativar ou suspender compras diretas com consequências explícitas.

**Independent Test**: Alternar disponibilidade, confirmar impacto e validar dependências.

### Tests for User Story 2

- [ ] T027 [P] [US2] Testar ativação sem preço, suspensão e atualização de status em `src/app/features/reseller-credits/pages/pricing/pricing.spec.ts`
- [ ] T028 [P] [US2] Testar regra de dependência e auditoria na API em `../saas-api/src/modules/credit-pricing/reseller-pricing.service.spec.ts`

### Implementation for User Story 2

- [ ] T029 [US2] Implementar validação de dependências e prévia de ativação/suspensão em `../saas-api/src/modules/credit-pricing/reseller-pricing.service.ts`
- [ ] T030 [P] [US2] Implementar controle de status com texto, ícone e ajuda em `src/app/features/reseller-credits/components/pricing/pricing-form/pricing-form.ts`
- [ ] T031 [US2] Integrar confirmação e atualização persistente da compra direta em `src/app/features/reseller-credits/pages/pricing/pricing.ts`

**Checkpoint**: O canal de compra direta é controlável e auditado.

---

## Phase 5: User Story 3 - Gerenciar pacotes de créditos (Priority: P2)

**Goal**: Criar e consultar pacotes em tabela/cards com filtros persistidos.

**Independent Test**: Criar pacote, localizar via filtros e desativar com confirmação.

### Tests for User Story 3

- [ ] T032 [P] [US3] Testar validação, preço efetivo, margem e foco do dialog de pacote em `src/app/features/reseller-credits/components/pricing/package-form-dialog/package-form-dialog.spec.ts`
- [ ] T033 [P] [US3] Testar cabeçalhos, aria-sort, seleção e ações da tabela em `src/app/features/reseller-credits/components/pricing/package-table/package-table.spec.ts`
- [ ] T034 [P] [US3] Testar prioridade de dados e ausência de overflow dos cards em `src/app/features/reseller-credits/components/pricing/package-cards/package-cards.spec.ts`

### Implementation for User Story 3

- [ ] T035 [P] [US3] Implementar busca, filtros, chips e drawer responsivo em `src/app/features/reseller-credits/components/pricing/package-filters/package-filters.ts`
- [ ] T036 [P] [US3] Implementar dialog de criação/edição compatível de pacote em `src/app/features/reseller-credits/components/pricing/package-form-dialog/package-form-dialog.ts`
- [ ] T037 [P] [US3] Implementar tabela desktop/tablet, paginação, seleção e skeleton em `src/app/features/reseller-credits/components/pricing/package-table/package-table.ts`
- [ ] T038 [P] [US3] Implementar cards mobile sem rolagem horizontal em `src/app/features/reseller-credits/components/pricing/package-cards/package-cards.ts`
- [ ] T039 [US3] Integrar query params, requests canceláveis, lista, vazio e erros em `src/app/features/reseller-credits/pages/pricing/pricing.ts`
- [ ] T040 [US3] Integrar ativação/desativação individual com preview e atualização em `src/app/features/reseller-credits/pages/pricing/pricing.ts`

**Checkpoint**: Pacotes podem ser gerenciados em todos os breakpoints.

---

## Phase 6: User Story 4 - Revisar histórico e aplicar ações em lote (Priority: P3)

**Goal**: Oferecer auditoria pesquisável e operações de pacote em lote.

**Independent Test**: Consultar alteração e executar lote com resultados mistos.

### Tests for User Story 4

- [ ] T041 [P] [US4] Testar seleção explícita/query e descarte ao mudar filtros em `src/app/features/reseller-credits/services/package-selection.spec.ts`
- [ ] T042 [P] [US4] Testar preview, limite, sucesso parcial e auditoria em `../saas-api/src/modules/credit-pricing/reseller-pricing.integration.spec.ts`

### Implementation for User Story 4

- [ ] T043 [P] [US4] Criar estado de seleção por IDs ou query com exclusões em `src/app/features/reseller-credits/services/package-selection.ts`
- [ ] T044 [US4] Implementar resolução segura e execução de lote de até 500 pacotes em `../saas-api/src/modules/credit-pricing/reseller-pricing.service.ts`
- [ ] T045 [P] [US4] Implementar barra responsiva de seleção e ações em `src/app/features/reseller-credits/components/pricing/package-bulk-bar/package-bulk-bar.ts`
- [ ] T046 [P] [US4] Implementar histórico paginado com filtros e detalhes de mudança em `src/app/features/reseller-credits/components/pricing/pricing-history/pricing-history.ts`
- [ ] T047 [US4] Integrar preview, execução, progresso e resultado por pacote em `src/app/features/reseller-credits/pages/pricing/pricing.ts`

**Checkpoint**: Histórico e lote são rastreáveis e resilientes a sucesso parcial.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validar todos os requisitos transversais.

- [ ] T048 [P] Validar teclado, foco, leitor de tela, contraste e redução de movimento conforme `specs/009-reseller-credit-pricing/quickstart.md`
- [ ] T049 [P] Validar 320, 390, 768, 1024 e 1440 px em claro/escuro em `src/app/features/reseller-credits/components/pricing/`
- [ ] T050 [P] Validar carregando, vazio, erro, offline, acesso negado, sessão e conflito em `src/app/features/reseller-credits/pages/pricing/pricing.spec.ts`
- [ ] T051 Executar e corrigir frontend com `npm test -- --watch=false`, `npm run format:check` e `npm run build`
- [ ] T052 Executar e corrigir testes de credit-pricing/credit-trade e build em `../saas-api/`
- [ ] T053 Registrar resultados manuais dos cenários em `specs/009-reseller-credit-pricing/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup inicia imediatamente.
- Foundational depende de Setup e bloqueia todas as histórias.
- US1 e US2 formam o MVP; US2 reutiliza formulário/preview da US1.
- US3 depende do overview de custo da US1 para calcular margens.
- US4 depende da listagem/seleção da US3.
- Polish depende das histórias incluídas na entrega.

### User Story Dependencies

- **US1 (P1)**: Independente após Foundational.
- **US2 (P1)**: Depende do fluxo de preview/confirm da US1.
- **US3 (P2)**: Usa custo e presenter da fundação/US1, mas pacotes são testáveis isoladamente.
- **US4 (P3)**: Depende da consulta e seleção da US3.

### Parallel Opportunities

- DTOs/testes API e modelos/query/presenter frontend podem avançar em paralelo na fundação.
- Overview, formulário e dialog da US1 ocupam arquivos distintos.
- Filtros, dialog, tabela e cards da US3 podem avançar em paralelo.
- Testes `[P]` podem ser escritos em paralelo antes da integração de cada história.

## Parallel Example: User Story 3

```text
Task T035: filtros/drawer em package-filters.ts
Task T036: formulário em package-form-dialog.ts
Task T037: tabela em package-table.ts
Task T038: cards em package-cards.ts
```

## Implementation Strategy

### MVP First

1. Completar Setup e Foundational.
2. Entregar US1 e US2.
3. Validar preço, margem, compra direta, concorrência e acessibilidade.
4. Demonstrar antes de expandir pacotes.

### Incremental Delivery

1. Fundação → contratos seguros.
2. US1 → preço e margem.
3. US2 → disponibilidade de compra.
4. US3 → pacotes responsivos.
5. US4 → histórico e lote.
6. Polish → gates finais.

## Format Validation

- 53 tarefas numeradas sequencialmente.
- Todas usam checkbox, ID e caminho concreto.
- Tarefas de história possuem `[USn]`.
- `[P]` aparece somente para trabalho em arquivos independentes.
