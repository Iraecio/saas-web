# Implementation Plan: Gestão de serviços e renegociações

**Branch**: `005-service-renegotiations` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-service-renegotiations/spec.md`

## Summary

Modernizar a área administrativa de serviços para superadmins e revendas em uma página responsiva com abas orientadas pela URL: catálogo completo e fila de renegociações. O frontend reutilizará os contratos atuais de catálogo e preços profissionais, acrescentará modelos e serviço dedicados à negociação e consumirá uma visão administrativa agregada para listar solicitações sem N+1. Decisões serão executadas pelos endpoints existentes de aceitar, negar e contrapor, com atualização otimista conservadora, confirmação explícita e histórico em painel lateral.

## Technical Context

**Language/Version**: TypeScript 5.9

**Primary Dependencies**: Angular 21.2 standalone + SSR, Angular Router, Reactive Forms, Signals, RxJS 7.8, Tailwind CSS 4, Lucide Angular já instalado

**Storage**: Nenhum armazenamento local persistente novo; dados oficiais permanecem na PostgreSQL encapsulada pela `saas-api`; aba e filtros ficam em query parameters

**Testing**: Vitest via Angular TestBed para serviços, lógica de estado e componentes; build Angular SSR como gate de composição

**Target Platform**: Navegadores modernos, SSR e layouts responsivos a partir de 320 px

**Project Type**: Aplicação web frontend integrada a API REST em repositório irmão

**Performance Goals**: Primeira aba utilizável em até 2 s com até 500 serviços/1.000 negociações; no máximo duas requisições paralelas por carga inicial; ações atualizam apenas o item e indicadores afetados

**Constraints**: Sem dependências novas; preservar envelope removido pelo interceptor; JWT/RBAC existente; isolamento de revenda decidido pela API; compatível com temas claro/escuro e navegação por teclado; nenhum valor monetário em ponto flutuante no contrato

**Scale/Scope**: Uma área administrativa, duas abas, lista responsiva, formulários/painel lateral de decisão, modelos e serviços frontend; requer um endpoint agregado de leitura na API, mantendo endpoints atuais de mutação

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

A constituição do projeto contém apenas placeholders e não define gates executáveis. Aplicam-se os padrões estabelecidos no repositório e nos specs anteriores.

| Gate operacional | Avaliação | Resultado |
|---|---|---|
| Fonte oficial | Regras de autorização, estado e aplicação de preço continuam na API | PASS |
| Isolamento | O frontend não envia `resellerId`; a API deriva o escopo do JWT | PASS |
| Integridade financeira | Valores trafegam em centavos e decisões exigem confirmação | PASS |
| Compatibilidade SSR | URL, signals, formulários e HTTP não dependem de APIs exclusivas do navegador | PASS |
| Desempenho | Uma leitura agregada evita N+1 entre serviços, profissionais e históricos | PASS |
| Acessibilidade | Abas, lista, painel e diálogos seguem semântica, foco e estados não baseados apenas em cor | PASS |
| Compatibilidade | Endpoints atuais de serviço e decisão são preservados; novo contrato é aditivo | PASS |
| Dependências | A solução usa somente pacotes já instalados | PASS |

**Post-design re-evaluation**: PASS. O contrato agregado é somente leitura e preserva o isolamento da API; as mutações continuam nos endpoints oficiais já existentes.

## Project Structure

### Documentation (this feature)

```text
specs/005-service-renegotiations/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── admin-negotiations-api.md
│   └── ui-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/app/
├── core/models/
│   └── service-negotiation.model.ts
└── features/services/
    ├── components/
    │   ├── negotiation-detail/negotiation-detail.ts
    │   ├── negotiation-list/negotiation-list.ts
    │   ├── service-list/service-list.ts
    │   └── service-summary/service-summary.ts
    ├── pages/
    │   ├── catalog/catalog.ts
    │   ├── form/form.ts
    │   └── audit/audit.ts
    ├── services/
    │   ├── service-catalog.ts
    │   ├── service-catalog.spec.ts
    │   ├── service-negotiation.ts
    │   └── service-negotiation.spec.ts
    └── services.routes.ts
```

**Structure Decision**: A feature permanece em `features/services` e substitui a lista atual por uma página-orquestradora de catálogo. Componentes separam abas e painel de detalhes sem criar uma nova biblioteca ou duplicar rotas. Contratos compartilhados ficam em `core/models`; comunicação permanece em serviços feature-scoped.

## Delivery Sequence

1. Disponibilizar na API irmã a leitura administrativa agregada definida em `contracts/admin-negotiations-api.md`.
2. Criar modelos e serviço frontend para fila, histórico e decisões, com testes de contrato.
3. Refatorar a rota raiz do catálogo para uma página com abas e estado na URL.
4. Modernizar a aba de serviços, reaproveitando formulários, auditoria e ações existentes.
5. Implementar fila, filtros, cards/tabela responsiva e indicadores de renegociações.
6. Implementar detalhes, linha do tempo, aprovação, negação e contraproposta.
7. Validar RBAC, concorrência, temas, teclado, responsividade, testes e build SSR.

## Complexity Tracking

Nenhuma violação identificada. O único contrato aditivo é necessário para evitar uma consulta por serviço, seguida de uma consulta por profissional e outra por histórico.
