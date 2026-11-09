# Tasks: Endurecimento das Fronteiras de Segurança

## Phase 1: Setup

- [x] T001 Criar branch correspondente no repositório `/home/iraecio/apps/saas-api`
- [x] T002 Verificar arquivos ignore e proteção de `.env*` em `/home/iraecio/apps/saas-web/.gitignore` e `/home/iraecio/apps/saas-api/.gitignore`

## Phase 2: Foundational

- [x] T003 [P] Adicionar testes de contrato de sessão por cookie em `/home/iraecio/apps/saas-api/src/modules/auth/auth.controller.spec.ts`
- [x] T004 [P] Adicionar testes de adulteração de faixa em `/home/iraecio/apps/saas-api/src/modules/order/order.service.spec.ts`
- [x] T005 [P] Adicionar verificação estática das migrations em `/home/iraecio/apps/saas-api/src/infrastructure/prisma/prisma.service.spec.ts`

## Phase 3: User Story 1 - Operações financeiras confiáveis

- [x] T006 [US1] Adicionar `maxDurationSeconds` em `/home/iraecio/apps/saas-api/prisma/schema.prisma` e migration dedicada
- [x] T007 [US1] Validar faixa e duração no servidor em `/home/iraecio/apps/saas-api/src/modules/order/order.service.ts`
- [x] T008 [US1] Expor e editar limite estruturado nos DTOs e formulário de serviço em ambos os repositórios
- [x] T009 [US1] Remover parsing decisório de descrição em `/home/iraecio/apps/saas-web/src/app/features/orders/pages/create/create.ts`

## Phase 4: User Story 2 - Dados isolados por identidade

- [x] T010 [US2] Criar migration deny-by-default de RLS público em `/home/iraecio/apps/saas-api/prisma/migrations/`
- [x] T011 [US2] Criar migration separada de policies Storage em `/home/iraecio/apps/saas-api/prisma/migrations/`
- [x] T012 [US2] Corrigir bootstrap local de policies em `/home/iraecio/apps/saas-api/docker/supabase/init.sql`

## Phase 5: User Story 3 - Credenciais e sessões

- [x] T013 [US3] Remover chaves administrativas literais de `/home/iraecio/apps/saas-api/docker-compose.yml`
- [x] T014 [US3] Emitir e rotacionar refresh cookie em `/home/iraecio/apps/saas-api/src/modules/auth/auth.controller.ts`
- [x] T015 [US3] Remover refresh token dos DTOs de resposta em `/home/iraecio/apps/saas-api/src/modules/auth/dto/responses/auth-response.dto.ts`
- [x] T016 [US3] Remover persistência de tokens em `/home/iraecio/apps/saas-web/src/app/core/services/auth.ts`
- [x] T017 [US3] Habilitar credenciais e cabeçalho anti-CSRF em clientes HTTP do frontend e CORS da API

## Phase 6: Polish & Verification

- [x] T018 Executar testes focados de autenticação, pedidos e Prisma em ambos os repositórios
- [x] T019 Executar builds de produção de `/home/iraecio/apps/saas-web` e `/home/iraecio/apps/saas-api`
- [x] T020 Revisar diff por bypass/regressão e registrar resultados em `specs/013-security-boundaries/quickstart.md`

## Dependencies

- T003–T005 precedem suas implementações correspondentes.
- T006 precede T007–T009.
- T010 e T011 são independentes e permanecem migrations separadas.
- T014–T15 precedem T016–T17 para manter o contrato coordenado.
- T018–T020 dependem de todas as histórias.

## Independent Test Criteria

- **US1**: payload adulterado não compra faixa inferior; fluxo compatível cria pedido.
- **US2**: anon e usuário cruzado são negados; acesso administrativo da API permanece.
- **US3**: refresh não aparece no JSON/localStorage; rotação, logout e login funcionam.
