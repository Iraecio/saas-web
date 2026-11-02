# Implementation Plan: Painel Administrativo Completo de Pedidos

**Branch**: `008-order-admin` | **Date**: 2026-08-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-order-admin/spec.md`

## Summary

Evoluir o módulo Angular `orders` com uma experiência exclusiva do `SUPER_ADMIN`: visão global server-side, busca e filtros persistidos na URL, tabela adaptativa no desktop, cards no mobile, detalhe 360°, ações individuais e em lote precedidas por prévia, exportação assíncrona e tratamento explícito de concorrência. A API NestJS irmã receberá contratos administrativos aditivos; regras de estado, finanças, autorização e auditoria continuam no servidor.

## Technical Context

**Language/Version**: TypeScript 5.9

**Primary Dependencies**: Angular 21.2 standalone + SSR, Angular Router, Reactive Forms, Signals, RxJS 7.8, Angular CDK, Tailwind CSS 4, Lucide Angular; PrimeNG somente onde já adotado

**Storage**: PostgreSQL na `saas-api`; query parameters para consulta compartilhável e armazenamento local por usuário apenas para preferências visuais não sensíveis

**Testing**: Vitest e Angular TestBed no frontend; Jest e testes de integração no NestJS para autorização, paginação, auditoria, idempotência e concorrência; build SSR de produção

**Target Platform**: Navegadores modernos com SSR, de smartphones a partir de 320 px até desktop amplo

**Project Type**: Aplicação web Angular integrada a API REST NestJS no repositório irmão `../saas-api`

**Performance Goals**: Feedback inicial em até 1 s e lista utilizável em até 2 s p95; paginação server-side para 100 mil pedidos; ações em lote de até 1.000 pedidos por execução acompanhada

**Constraints**: Sem dependências novas; acesso exclusivo a `SUPER_ADMIN`; sem N+1; mutações versionadas, idempotentes e auditadas; sem edição direta de histórico/saldo; sem rolagem horizontal da página no mobile; compatível com claro/escuro, teclado, leitores de tela e redução de movimento

**Scale/Scope**: Uma rota administrativa de lista, uma rota de detalhe, cerca de dez componentes especializados, serviços de consulta/apresentação/seleção, contratos aditivos de API, exportação e cobertura dos doze estados de interface

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

A constituição permanece com placeholders. Foram aplicados os gates operacionais já consolidados no projeto.

| Gate | Avaliação | Resultado |
|---|---|---|
| Autorização | Rota e contratos administrativos exigem `SUPER_ADMIN`; ocultação na UI não substitui autorização da API | PASS |
| Integridade | Alterações financeiras ou de status usam comandos de domínio e prévia; histórico e saldo não são editáveis | PASS |
| Concorrência | Prévia retorna versão e mutação exige versão/idempotency key; 409 nunca é sobrescrito | PASS |
| Desempenho | Lista, agregados e seleção por filtro são server-side, paginados e sem N+1 | PASS |
| Acessibilidade | Semântica, foco, teclado, anúncios, contraste e redução de movimento têm tarefas e testes próprios | PASS |
| Responsividade | Tabela desktop, densidade tablet e cards/drawer mobile evitam rolagem horizontal de página | PASS |
| Dependências | Componentes e bibliotecas instaladas são reutilizados | PASS |
| Testabilidade | Query state, apresentação, contratos, permissões, lotes e estados críticos são isoláveis | PASS |

**Post-design re-evaluation**: PASS. Contratos separam leitura, prévia e comando; seleção por consulta evita transportar milhares de IDs; componentes responsivos compartilham o mesmo modelo de apresentação; nenhuma exceção constitucional é necessária.

## Project Structure

### Documentation (this feature)

```text
specs/008-order-admin/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── order-admin-api.md
│   └── ui-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/app/
├── core/models/
│   └── order-admin.model.ts
└── features/orders/
    ├── components/admin/
    │   ├── order-admin-toolbar/order-admin-toolbar.ts
    │   ├── order-admin-filters/order-admin-filters.ts
    │   ├── order-admin-table/order-admin-table.ts
    │   ├── order-admin-cards/order-admin-cards.ts
    │   ├── order-selection-bar/order-selection-bar.ts
    │   ├── order-action-dialog/order-action-dialog.ts
    │   └── order-admin-detail-sections/*.ts
    ├── pages/
    │   ├── admin-list/admin-list.ts
    │   └── admin-detail/admin-detail.ts
    ├── services/
    │   ├── order-admin.ts
    │   ├── order-admin-query.ts
    │   └── order-admin.presentation.ts
    └── orders.routes.ts
```

```text
../saas-api/src/modules/order/
├── dto/admin-order-*.dto.ts
├── repositories/order.repository.ts
├── order.controller.ts
└── order.service.ts
```

**Structure Decision**: A experiência global permanece no domínio `orders`, mas usa páginas e componentes `admin` separados para não misturar permissões nem complexidade com “Meus pedidos”. A rota `/admin/orders/manage` precede `:id` e exige `SUPER_ADMIN`; `/admin/orders/manage/:id` usa o mesmo limite. Estado serializável fica na URL; apresentação e seleção ficam em serviços puros testáveis.

## Delivery Sequence

1. Consolidar contratos administrativos, autorização, paginação, agregados, versão e auditoria na API.
2. Criar modelos, query state, presenter, rotas protegidas e testes fundamentais no frontend.
3. Entregar listagem global desktop/tablet/mobile com estados, filtros persistidos e detalhe somente leitura.
4. Integrar prévia e comandos administrativos individuais seguros.
5. Entregar seleção explícita, prévia, execução e relatório em lote.
6. Entregar preferências de colunas/densidade e exportação assíncrona.
7. Validar acessibilidade, temas, responsividade, offline, sessão, conflitos e builds.

## Complexity Tracking

Nenhuma violação constitucional identificada.
