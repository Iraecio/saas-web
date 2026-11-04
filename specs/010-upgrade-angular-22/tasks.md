# Tasks: Atualização para Angular 22

**Input**: Design documents from `/specs/010-upgrade-angular-22/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: A especificação exige regressão automatizada, build e validação SSR.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Registrar baseline e preparar a cadeia compatível.

- [x] T001 Registrar versões e baseline da migração em specs/010-upgrade-angular-22/quickstart.md
- [x] T002 Verificar ignores e pré-requisitos Node/npm em .gitignore e package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Alinhar o framework e todos os peers antes das validações funcionais.

- [x] T003 Atualizar Angular core, CLI, build e SSR para 22.2 com migrações oficiais em package.json, package-lock.json e arquivos migrados
- [x] T004 Atualizar Angular Material/CDK e PrimeNG para versões compatíveis em package.json e package-lock.json
- [x] T005 Substituir lucide-angular por @lucide/angular em package.json, package-lock.json e src/app/**/*.ts
- [x] T006 Alinhar TypeScript 6.0 e declarar engines Node suportados em package.json e package-lock.json
- [x] T007 Validar árvore sem peers inválidos com npm ls e registrar resultado em specs/010-upgrade-angular-22/quickstart.md

**Checkpoint**: Instalação limpa e dependências Angular 22 resolvidas.

---

## Phase 3: User Story 1 - Continuar usando os fluxos essenciais (Priority: P1) 🎯 MVP

**Goal**: Preservar compilação e comportamento dos fluxos existentes.

**Independent Test**: Executar toda a suíte e compilar a aplicação, sem falhas ou regressões atribuíveis à atualização.

- [x] T008 [US1] Executar testes existentes e corrigir incompatibilidades Angular 22 em src/**/*.spec.ts e respectivos arquivos de origem
- [x] T009 [US1] Executar build de produção e corrigir erros de templates, TypeScript ou estilos em src/** e arquivos de configuração
- [x] T010 [US1] Confirmar ausência de referências Angular 21 e lucide-angular em package.json, package-lock.json, README.md e src/**

**Checkpoint**: Testes e build aprovados com os fluxos existentes preservados.

---

## Phase 4: User Story 2 - Entregar e operar a aplicação atualizada (Priority: P2)

**Goal**: Produzir e iniciar o artefato SSR Angular 22.

**Independent Test**: Iniciar o bundle de produção e obter resposta HTTP válida na rota inicial.

- [x] T011 [US2] Validar geração do bundle SSR e a presença de dist/saas-web/server/server.mjs
- [x] T012 [US2] Executar smoke test HTTP do servidor SSR e corrigir incompatibilidades em src/server.ts, api/handler.ts ou vercel.json
- [x] T013 [US2] Validar configuração de hidratação e rotas de servidor em src/app/app.config.ts, src/app/app.config.server.ts e src/app/app.routes.server.ts

**Checkpoint**: Artefato SSR inicia, responde e preserva a hidratação.

---

## Phase 5: User Story 3 - Manter o desenvolvimento confiável (Priority: P3)

**Goal**: Tornar a atualização reproduzível e documentada.

**Independent Test**: Uma instalação limpa consegue testar, compilar e iniciar o projeto usando apenas a documentação.

- [x] T014 [US3] Atualizar pré-requisitos e comandos Angular 22 em README.md e VERCEL_DEPLOYMENT.md
- [x] T015 [US3] Executar npm ci a partir do lockfile e repetir testes, build e inspeção de peers
- [x] T016 [US3] Registrar os resultados finais reproduzíveis em specs/010-upgrade-angular-22/quickstart.md

**Checkpoint**: Desenvolvimento e entrega reproduzíveis em instalação limpa.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T017 Executar formatação e git diff --check nos arquivos modificados
- [x] T018 Revisar critérios FR-001 a FR-015 e SC verificáveis em specs/010-upgrade-angular-22/spec.md
- [x] T019 Consolidar evidências e limitações da validação em specs/010-upgrade-angular-22/quickstart.md

---

## Dependencies & Execution Order

- Setup precede Foundation.
- T003 precede T004-T006; T003-T006 precedem T007.
- US1 depende de Foundation e precede US2 e US3 para evitar documentar uma migração ainda instável.
- US2 e US3 dependem do build aprovado em US1.
- Polish depende de todas as histórias.

## Parallel Opportunities

As mudanças de dependências compartilham manifests e devem ser sequenciais. Após o build aprovado, a revisão documental de T014 pode ocorrer em paralelo à inspeção SSR de T013, mas a execução atual permanece sequencial para evitar edições conflitantes.

## Implementation Strategy

1. Capturar baseline e alinhar dependências com migrações oficiais.
2. Corrigir regressões de compilação e testes como MVP.
3. Validar SSR/hidratação e instalação limpa.
4. Documentar, formatar e conferir os critérios da spec.
