# Tasks: Design system inspirado no Kuber

**Input**: Artefatos em `/specs/012-kuber-design-system/`

## Phase 1: Fundação

- [x] T001 [US1] Mapear tokens Kuber em `src/styles.scss`
- [x] T002 [US1] Atualizar primitives globais de botão, card, formulário, tabela e badge em `src/styles.scss`

## Phase 2: Shell e navegação

- [x] T003 [US2] Atualizar shell em `src/app/layouts/admin-layout/admin-layout.ts`
- [x] T004 [US2] Aplicar navegação Kuber em `src/app/shared/components/sidebar/sidebar.ts`
- [x] T005 [US2] Aplicar cabeçalho e menus Kuber em `src/app/shared/components/header/header.ts`

## Phase 3: Componentes compartilhados

- [x] T006 [US1] Alinhar cards e métricas em `src/app/shared/components/card/card.ts`, `src/app/shared/components/stats-card/stats-card.ts` e `src/app/shared/ui/card/ui-card.ts`
- [x] T007 [US1] Alinhar botões e badges em `src/app/shared/components/button/button.ts`, `src/app/shared/ui/button/ui-button.ts` e `src/app/shared/ui/badge/ui-badge.ts`
- [x] T008 [US1] Alinhar tabela compartilhada em `src/app/shared/components/table/table.ts`

## Phase 4: Tema e validação

- [x] T009 [US3] Validar paridade dos tokens no tema escuro
- [x] T010 Executar formatação, testes e build de produção
- [x] T011 Atualizar `quickstart.md` e marcar tarefas concluídas

## Phase 5: Padrões de página Kuber

- [x] T012 [US1] Migrar a tela de login para card dividido responsivo em `src/app/features/auth/pages/login/login.ts`
- [x] T013 [US1] Criar padrões estruturais de cabeçalho, toolbar, tabela, formulário e estados em `src/styles.scss`
- [x] T014 [US1] Aplicar o padrão de listagem Kuber em `src/app/features/users/pages/list/users-list.ts`
- [x] T015 [US2] Consolidar menus, popovers e paginação compartilhada
- [x] T016 Executar testes e build após a migração de páginas

## Dependencies & Execution Order

T001 bloqueia T002–T009. T003–T008 podem ser executadas após a fundação. T010 depende de toda implementação.
