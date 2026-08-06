# Tasks: Configuração de Meios de Pagamento

**Input**: Design documents from `specs/004-payment-settings/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluídos para o contrato HTTP e as regras críticas de credenciais e escopo.

**Organization**: Tasks grouped by user story for independent validation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contrato e estrutura de integração.

- [x] T001 Verificar os contratos oficiais de configuração em `../saas-api/src/modules/payment/payment-config.controller.ts` e `../saas-api/src/modules/payment/dto/configuration.dto.ts`
- [x] T002 Verificar guards, interceptor de envelope e convenções de serviço em `src/app/core/guards/role.guard.ts`, `src/app/core/interceptors/response-transform.interceptor.ts` e `src/app/core/services/api.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Criar contrato compartilhado e cliente HTTP antes das histórias.

- [x] T003 Criar modelos tipados de políticas, configurações e DTOs em `src/app/core/models/payment-settings.model.ts`
- [x] T004 Criar serviço de configurações com operações por escopo em `src/app/features/settings/services/payment-settings.ts`
- [x] T005 Escrever testes de paths, verbos e payloads do serviço em `src/app/features/settings/services/payment-settings.spec.ts`

**Checkpoint**: Contrato frontend pronto e testado.

---

## Phase 3: User Story 1 - Superadmin configura pagamentos da plataforma (Priority: P1) 🎯 MVP

**Goal**: Administrar políticas globais e configurações da plataforma.

**Independent Test**: Como superadmin, criar/editar política e configuração, validar, ativar e suspender com justificativa.

- [x] T006 [US1] Implementar painel de políticas globais do superadmin em `src/app/features/settings/pages/payment/payment.ts`
- [x] T007 [US1] Implementar listagem e editor de configurações da plataforma em `src/app/features/settings/pages/payment/payment.ts`
- [x] T008 [US1] Implementar ações de validar, ativar e suspender com confirmação contextual em `src/app/features/settings/pages/payment/payment.ts`

**Checkpoint**: Fluxo da plataforma funcional de ponta a ponta.

---

## Phase 4: User Story 2 - Revendedor configura pagamentos dos clientes (Priority: P1)

**Goal**: Permitir que a revenda configure somente seus meios autorizados.

**Independent Test**: Como revendedor/gerente, criar, editar sem apagar credencial, validar e ativar configuração própria.

- [x] T009 [US2] Adaptar políticas elegíveis, conteúdo e ações da página ao escopo revenda em `src/app/features/settings/pages/payment/payment.ts`
- [x] T010 [US2] Garantir omissão de credenciais vazias e indicação segura de credencial existente em `src/app/features/settings/pages/payment/payment.ts`
- [x] T011 [US2] Adicionar rota protegida para superadmin e revenda em `src/app/features/settings/settings.routes.ts`
- [x] T012 [US2] Exibir a aba Pagamento somente aos papéis autorizados em `src/app/features/settings/pages/general/general.ts`

**Checkpoint**: Fluxos de plataforma e revenda coexistem com isolamento explícito.

---

## Phase 5: User Story 3 - Operador entende e recupera falhas (Priority: P2)

**Goal**: Oferecer validação local e estados de feedback seguros.

**Independent Test**: Simular vazio, erro e operações concorrentes; corrigir JSON inválido e repetir carregamento.

- [x] T013 [US3] Implementar estados de carregamento, vazio, erro, sucesso e retry em `src/app/features/settings/pages/payment/payment.ts`
- [x] T014 [US3] Implementar validação de formulário, JSON e bloqueio de comandos concorrentes em `src/app/features/settings/pages/payment/payment.ts`

**Checkpoint**: Todos os cenários de feedback e recuperação estão cobertos.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validar qualidade e documentar conclusão.

- [x] T015 Formatar arquivos alterados com Prettier em `src/app/core/models/payment-settings.model.ts` e `src/app/features/settings/`
- [x] T016 Executar testes automatizados definidos em `src/app/features/settings/services/payment-settings.spec.ts`
- [x] T017 Executar build de produção conforme `specs/004-payment-settings/quickstart.md`
- [x] T018 Marcar tarefas concluídas e registrar resultados em `specs/004-payment-settings/tasks.md`

---

## Phase 7: Extensão - Valor dos créditos do superadmin

**Purpose**: Permitir que o superadmin defina o custo unitário dos créditos vendidos às revendas usando o contrato append-only da API.

- [x] T019 Verificar os contratos `GET/POST /admin/credit-price` em `../saas-api/src/modules/credit-pricing/`
- [x] T020 Criar modelos e serviço tipado em `src/app/core/models/credit-price.model.ts` e `src/app/features/settings/services/credit-price-settings.ts`
- [x] T021 Cobrir paths, verbos, query params e payload do serviço em `src/app/features/settings/services/credit-price-settings.spec.ts`
- [x] T022 Criar a página com preço vigente, nova vigência e histórico em `src/app/features/settings/pages/credit-price/credit-price.ts`
- [x] T023 Adicionar aba e rota exclusivas para `SUPER_ADMIN` em `src/app/features/settings/pages/general/general.ts` e `src/app/features/settings/settings.routes.ts`
- [x] T024 Formatar, executar os testes de contrato e validar o build SSR de produção
- [x] T025 Corrigir o consumo do envelope `{ current }` no preço exibido ao revendedor e cobrir respostas com e sem preço vigente
- [x] T026 Exibir chave PIX, dados públicos e QR Code/copia-e-cola disponíveis antes e depois de iniciar a compra, preservando instruções entre eventos
- [x] T027 Relacionar histórico de compras e transações para permitir envio de comprovante e acompanhamento da resolução pela revenda
- [x] T028 Aceitar comprovantes privados em JPEG, PNG, WebP, HEIC, HEIF e PDF para compras de revendas e clientes, com validação de 10 MB na API e frontend
- [x] T029 Serializar `PaymentProof.fileSize` em JSON com segurança após o upload de comprovantes

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup → Foundational → US1/US2 → US3 → Polish.
- US1 e US2 compartilham a página e devem ser integradas sequencialmente no mesmo arquivo.
- Rota e aba dependem da página existente.

### User Story Dependencies

- **US1**: depende do serviço e modelos; entrega o MVP do superadmin.
- **US2**: depende do mesmo editor base, mas é validável com identidade de revenda.
- **US3**: cruza os dois escopos depois que suas operações existem.

### Parallel Opportunities

- A documentação e o contrato de serviço podem ser revisados independentemente.
- Após a página, rota e aba são arquivos distintos e podem ser validados separadamente.
- Testes e build são sequenciais para facilitar diagnóstico.

## Parallel Example: User Story 2

```text
Task T011: adicionar rota protegida em settings.routes.ts
Task T012: adicionar aba condicional em general.ts
```

## Implementation Strategy

### MVP First

1. Modelos e serviço.
2. Painel do superadmin.
3. Validar criação, edição, validação, ativação e suspensão.

### Incremental Delivery

1. Acrescentar escopo da revenda no editor compartilhado.
2. Integrar navegação e guard.
3. Consolidar feedback, testes e build.

## Format Validation

As 18 tarefas usam checkbox, identificador sequencial, rótulo de história quando aplicável e caminho de arquivo explícito.
