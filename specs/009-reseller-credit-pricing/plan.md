# Implementation Plan: Configuração de Preços de Créditos do Revendedor

**Branch**: `009-reseller-credit-pricing` | **Date**: 2026-08-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-reseller-credit-pricing/spec.md`

## Summary

Modernizar `reseller-credits/pricing` para oferecer ao revendedor uma configuração segura e responsiva do preço ao cliente, compra direta e pacotes. O frontend Angular substituirá a página mínima por overview financeiro, formulário com prévia/confirm dialog, tabela desktop/cards mobile, filtros persistidos e estados completos. A API NestJS existente receberá contratos aditivos para versão, histórico, paginação, prévia e lote, mantendo preços em centavos e escopo derivado da autenticação.

## Technical Context

**Language/Version**: TypeScript 5.9 no frontend; TypeScript 6.0 na API

**Primary Dependencies**: Angular 21.2 standalone + SSR, Reactive Forms, Signals, RxJS 7.8, Angular CDK, Tailwind CSS 4, Lucide Angular; NestJS 11, Prisma 7 e PostgreSQL na API

**Storage**: PostgreSQL na `saas-api`; query parameters para consulta e local storage SSR-safe somente para preferências visuais por usuário

**Testing**: Vitest e Angular TestBed no frontend; Jest na API; build Angular SSR e build NestJS

**Target Platform**: Navegadores modernos de 320 px a desktop amplo

**Project Type**: Aplicação web Angular integrada a API REST NestJS no repositório irmão

**Performance Goals**: Feedback em até 1 s; conteúdo utilizável em até 2 s p95; paginação server-side para 10 mil pacotes/eventos; lote de até 500 pacotes

**Constraints**: Sem dependências novas; escopo `RESELLER`/`RESELLER_MANAGER`; moeda em centavos inteiros; sem reprecificar vendas antigas; versão/idempotência em mutações; sem rolagem horizontal mobile; claro/escuro e redução de movimento

**Scale/Scope**: Uma página principal com overview, configuração e pacotes; drawer de filtros; dialogs de prévia; histórico paginado; serviços/modelos/testes frontend e contratos aditivos na API

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

A constituição contém placeholders; aplicam-se gates operacionais consolidados no projeto.

| Gate | Avaliação | Resultado |
|---|---|---|
| Autorização/isolamento | A revenda vem do usuário autenticado; IDs de revenda não são aceitos do cliente | PASS |
| Integridade monetária | Valores persistidos em centavos; vendas anteriores são imutáveis | PASS |
| Concorrência | Prévia e comando carregam versão; 409 exige nova decisão | PASS |
| Auditoria | Alterações de configuração e pacotes geram evento com ator e valores | PASS |
| Desempenho | Pacotes e histórico são paginados no servidor | PASS |
| Acessibilidade | Semântica, foco, teclado, contraste e movimento possuem critérios e tarefas | PASS |
| Responsividade | Tabela desktop e cards/drawer mobile sem scroll horizontal da página | PASS |
| Dependências | Reutiliza CDK, Tailwind, components e services existentes | PASS |
| Testabilidade | Conversão monetária, margem, query state, conflito e permissões são isoláveis | PASS |

**Post-design re-evaluation**: PASS. O modelo versionado preserva histórico, a prévia usa custo vigente do servidor e a UI não replica regras financeiras como fonte de verdade.

## Project Structure

### Documentation (this feature)

```text
specs/009-reseller-credit-pricing/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── reseller-pricing-api.md
│   └── ui-contract.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/app/
├── core/models/reseller-credit.model.ts
└── features/reseller-credits/
    ├── components/pricing/
    │   ├── pricing-overview/pricing-overview.ts
    │   ├── pricing-form/pricing-form.ts
    │   ├── package-filters/package-filters.ts
    │   ├── package-table/package-table.ts
    │   ├── package-cards/package-cards.ts
    │   ├── package-form-dialog/package-form-dialog.ts
    │   ├── pricing-confirm-dialog/pricing-confirm-dialog.ts
    │   └── package-bulk-bar/package-bulk-bar.ts
    ├── pages/pricing/pricing.ts
    └── services/
        ├── reseller-credit.ts
        ├── reseller-pricing-query.ts
        └── reseller-pricing.presentation.ts
```

```text
../saas-api/src/modules/credit-pricing/
├── dto/reseller-pricing-*.dto.ts
├── repositories/reseller-pricing.repository.ts
├── reseller-pricing.controller.ts
└── reseller-pricing.service.ts
```

**Structure Decision**: A rota e feature existentes serão preservadas. A página `pricing.ts` vira contêiner; cálculos de apresentação e query state saem do template; tabela e cards compartilham o mesmo view model. A API amplia contratos existentes sem aceitar `resellerId` externo.

## Delivery Sequence

1. Consolidar contratos de overview, lista, versão, prévia, histórico e lote na API.
2. Criar modelos, presenter, query state, testes e acessibilidade base.
3. Entregar overview e edição segura do preço/compra direta.
4. Entregar CRUD compatível, filtros e listagem responsiva de pacotes.
5. Entregar histórico e ações em lote.
6. Validar estados, responsividade, temas, acessibilidade, testes e builds.

## Complexity Tracking

Nenhuma violação constitucional identificada.
