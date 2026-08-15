# Implementation Plan: Administração completa de carteiras

**Branch**: `007-wallet-admin` | **Date**: 2026-08-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-wallet-admin/spec.md`

## Summary

Modernizar o módulo `wallet-admin` para oferecer ao superadmin uma visão global, paginada e responsiva das carteiras de todos os papéis, um detalhe 360° e ações individuais/em lote com confirmação, auditoria e controle de concorrência. O frontend Angular reaproveitará rotas e serviços existentes, centralizará estado de consulta na URL e consumirá contratos administrativos aditivos da API NestJS para agregados, seleção por filtro, prévia de impacto e mutações versionadas.

## Technical Context

**Language/Version**: TypeScript 5.9

**Primary Dependencies**: Angular 21.2 standalone + SSR, Angular Router, Reactive Forms, Signals, RxJS 7.8, Tailwind CSS 4, Angular CDK, Lucide Angular

**Storage**: PostgreSQL na `saas-api`; no frontend, query parameters para filtros compartilháveis e session storage somente para rascunhos/seleções transitórias não sensíveis

**Testing**: Vitest e Angular TestBed no frontend; Jest no NestJS para autorização, agregados e concorrência; build de produção com SSR

**Target Platform**: Navegadores modernos em desktop, tablet e smartphones a partir de 320 px

**Project Type**: Aplicação web Angular integrada a uma API REST NestJS em repositório irmão

**Performance Goals**: Feedback de carregamento em até 1 s; lista e resumo utilizáveis em até 2 s; paginação server-side para 100 mil carteiras; ações em lote de até 1.000 registros com processamento acompanhado

**Constraints**: Sem dependências novas; acesso exclusivo a `SUPER_ADMIN`; valores inteiros sem arredondamento; mutações idempotentes e auditadas; versão obrigatória para alterações; sem N+1; sem rolagem horizontal de página no mobile; temas claro/escuro e redução de movimento

**Scale/Scope**: Um workspace administrativo com overview, lista, detalhe com até oito seções, filtros em drawer, ações críticas, ações em lote, exportação, modelos/serviços/testes frontend e contratos aditivos na API

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

A constituição contém placeholders. Os gates operacionais abaixo refletem os padrões já adotados pelo projeto e os requisitos da feature.

| Gate | Avaliação | Resultado |
|---|---|---|
| Autorização | Rota, endpoints, exportações e mutações exigem `SUPER_ADMIN`; UI não é fonte de autorização | PASS |
| Integridade financeira | Saldo não é editado diretamente; ajustes geram operações compensatórias, versionadas e auditadas | PASS |
| Concorrência | Prévia e mutação carregam versão; conflitos retornam o estado corrente sem sobrescrita | PASS |
| Isolamento | Visão global é intencional e exclusiva do superadmin; contexto de revenda continua explícito | PASS |
| Desempenho | Paginação, filtros e agregados são processados no servidor sem N+1 | PASS |
| Acessibilidade | Teclado, foco, semântica, anúncios, contraste e redução de movimento fazem parte dos critérios de aceite | PASS |
| Responsividade | Tabela no desktop, densidade adaptativa no tablet e cards/drawer no smartphone | PASS |
| Dependências | A solução reutiliza bibliotecas instaladas e componentes existentes | PASS |
| Testabilidade | Contratos, apresentação, autorização, conflito e estados críticos possuem testes planejados | PASS |

**Post-design re-evaluation**: PASS. Os contratos separam consultas, prévias e execução; a UI contract define estados e acessibilidade; nenhuma violação exige exceção.

## Project Structure

### Documentation (this feature)

```text
specs/007-wallet-admin/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── wallet-admin-api.md
│   └── ui-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/app/
├── core/models/
│   └── wallet-admin.model.ts
└── features/wallet-admin/
    ├── components/
    │   ├── wallet-admin-filters/wallet-admin-filters.ts
    │   ├── wallet-admin-table/wallet-admin-table.ts
    │   ├── wallet-admin-cards/wallet-admin-cards.ts
    │   ├── wallet-admin-actions/wallet-admin-actions.ts
    │   ├── wallet-bulk-bar/wallet-bulk-bar.ts
    │   └── wallet-detail-sections/*.ts
    ├── pages/
    │   ├── overview/overview.ts
    │   ├── wallets/wallets.ts
    │   └── wallet-detail/wallet-detail.ts
    ├── services/
    │   ├── wallet-admin.ts
    │   ├── wallet-admin-query.ts
    │   └── wallet-admin.presentation.ts
    └── wallet-admin.routes.ts
```

```text
../saas-api/src/modules/wallet/
├── dto/admin-wallet-*.dto.ts
├── repositories/wallet.repository.ts
├── wallet.controller.ts
└── wallet.service.ts
```

**Structure Decision**: A modernização permanece em `features/wallet-admin`, preservando URLs compatíveis. Modelos administrativos deixam o modelo de carteira pessoal para evitar contratos híbridos. Componentes de lista e detalhe são separados por responsabilidade e breakpoint; estado de consulta fica em um serviço puro e testável. A API irmã recebe somente contratos aditivos necessários para agregação, paginação e mutações seguras.

## Delivery Sequence

1. Consolidar contratos administrativos da API, autorização exclusiva, paginação, agregados e versão da carteira.
2. Implementar modelos, query state e testes de contrato/presentação no frontend.
3. Entregar overview e listagem responsiva com filtros persistidos e estados completos.
4. Entregar detalhe 360° com resumo prioritário e seções independentes.
5. Integrar prévia e execução das ações individuais críticas.
6. Entregar seleção, prévia, execução e relatório das ações em lote e exportação.
7. Validar acessibilidade, temas, responsividade, offline, sessão, conflitos e builds.

## Complexity Tracking

Nenhuma violação constitucional identificada.
