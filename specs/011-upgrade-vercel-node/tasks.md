# Tasks: Remediação do Toolchain Vercel

**Input**: Design documents from `/specs/011-upgrade-vercel-node/`

## Phase 1: Setup

- [x] T001 Registrar audit e caminho de dependência vulnerável em specs/011-upgrade-vercel-node/research.md
- [x] T002 Confirmar uso e callers do handler em api/handler.ts, vercel.json e src/server.ts

## Phase 2: Foundation

- [x] T003 Remover @vercel/node de package.json e package-lock.json sem flags de compatibilidade
- [x] T004 Adaptar api/handler.ts para tipos nativos Node e loader testável
- [x] T005 Adicionar teste de delegação, retorno e erro em src/app/core/serverless/vercel-handler.spec.ts

## Phase 3: User Story 1 - Dependências seguras (P1)

- [x] T006 [US1] Executar npm ci, npm ls e npm audit e registrar evidências em specs/011-upgrade-vercel-node/quickstart.md

## Phase 4: User Story 2 - Handler preservado (P2)

- [x] T007 [US2] Executar testes focados do handler e suíte completa
- [x] T008 [US2] Gerar bundle SSR e executar smoke HTTP das rotas definidas em specs/011-upgrade-vercel-node/quickstart.md

## Phase 5: User Story 3 - Entrega reproduzível (P3)

- [x] T009 [US3] Validar vercel.json, typecheck do handler, formatação e git diff --check
- [x] T010 [US3] Documentar resultados e riscos residuais em specs/011-upgrade-vercel-node/quickstart.md

## Phase 6: Security Review

- [x] T011 Executar revisão independente de bypass e regressão sobre o diff candidato
- [x] T012 Reexecutar gates finais após a revisão e confirmar todos os critérios da spec

## Dependencies

- T003-T005 dependem da investigação T001-T002.
- T006-T010 dependem da implementação T003-T005.
- T011 depende do diff candidato validado; T012 encerra a feature.

## Implementation Strategy

Remover primeiro a cadeia vulnerável, provar o contrato do adaptador com teste unitário e só então validar instalação, audit, build e execução SSR.
