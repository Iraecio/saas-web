# Implementation Plan: Administração completa de profissionais

**Branch**: `006-professional-admin` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-professional-admin/spec.md`

## Summary

Substituir a lista simples de profissionais por um workspace administrativo exclusivo do superadmin: listagem paginada com filtros persistidos, ações individuais/em lote e detalhe 360º dividido em resumo, perfil, serviços, pedidos, carteira e auditoria. Contratos existentes de usuários, profissionais, pedidos e carteiras serão reutilizados; a API receberá agregados de leitura, bloqueio/reativação auditado, reset administrativo por link e impersonação temporária somente leitura. O frontend manterá tokens de inspeção separados da sessão original e exibirá um banner global com saída segura.

## Technical Context

**Language/Version**: TypeScript 5.9

**Primary Dependencies**: Angular 21.2 standalone + SSR, Angular Router, Reactive Forms, Signals, RxJS 7.8, Tailwind CSS 4, Angular CDK e Lucide Angular já instalados

**Storage**: PostgreSQL na `saas-api`; no frontend somente query parameters e armazenamento de sessão para contexto transitório, nunca senha

**Testing**: Vitest/Angular TestBed no frontend; Jest no NestJS; testes de autorização e contrato obrigatórios para impersonação e bloqueio; build SSR

**Target Platform**: Navegadores modernos, rotas autenticadas client-rendered, layouts a partir de 320 px

**Project Type**: Frontend Angular integrado à API REST NestJS em repositório irmão

**Performance Goals**: Lista utilizável em até 2 s; detalhe básico em uma requisição agregada e módulos secundários em paralelo; paginação server-side até dezenas de milhares de profissionais

**Constraints**: Sem dependências novas; somente `SUPER_ADMIN`; RBAC e bloqueio de mutações decididos no servidor; inspeção somente leitura e máximo 30 min; tokens administrativos nunca substituídos irreversivelmente; sem N+1; valores financeiros permanecem inteiros

**Scale/Scope**: Uma listagem, um detalhe com seis seções, drawer de filtros, ações críticas, ações em lote, banner global de inspeção, serviços/modelos/testes frontend e contratos aditivos na API

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

A constituição contém placeholders, portanto os gates operacionais abaixo refletem os padrões do projeto.

| Gate | Avaliação | Resultado |
|---|---|---|
| Autorização | Superadmin e inspeção são verificados na API; frontend só apresenta capacidades | PASS |
| Impersonação segura | Token separado, somente leitura, TTL curto, alvo restrito e auditoria | PASS |
| Credenciais | Reset usa link temporário; nenhuma senha trafega pelo painel | PASS |
| Integridade | Bloqueio revoga sessões e preserva dados; concorrência usa versão | PASS |
| Isolamento | Superadmin lê global/revendas; inspeção assume exatamente o escopo do alvo | PASS |
| Desempenho | Agregados paginados evitam N+1 | PASS |
| SSR | Rotas autenticadas permanecem client-rendered e restauram sessão antes dos guards | PASS |
| Dependências | Somente bibliotecas instaladas | PASS |

**Post-design re-evaluation**: PASS. Os contratos separam sessão administrativa de inspeção e bloqueiam mutações no servidor, inclusive chamadas diretas.

## Project Structure

### Documentation (this feature)

```text
specs/006-professional-admin/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── professional-admin-api.md
│   ├── impersonation-api.md
│   └── ui-contract.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/app/
├── core/
│   ├── interceptors/impersonation.interceptor.ts
│   ├── models/professional-admin.model.ts
│   └── services/impersonation.ts
├── layouts/admin-layout/admin-layout.ts
├── shared/components/impersonation-banner/impersonation-banner.ts
└── features/professionals/
    ├── components/
    │   ├── professional-list/professional-list.ts
    │   ├── professional-filters/professional-filters.ts
    │   ├── professional-actions/professional-actions.ts
    │   └── professional-detail-sections/*.ts
    ├── pages/
    │   ├── admin-list/admin-list.ts
    │   └── admin-detail/admin-detail.ts
    ├── services/professional-admin.ts
    └── professionals.routes.ts
```

**Structure Decision**: A gestão permanece em `features/professionals`. A inspeção é infraestrutura transversal em `core`, pois altera identidade efetiva de leitura e adiciona banner ao shell. Componentes de detalhe são separados por seção para carregamento e falha independentes.

## Delivery Sequence

1. Definir e implementar agregados administrativos, auditoria, bloqueio/reativação e reset seguro na API.
2. Implementar emissão, validação e encerramento de token de inspeção somente leitura na API.
3. Criar modelos, serviços e testes de contrato frontend.
4. Entregar listagem, filtros, paginação, cards mobile e ações em lote.
5. Entregar detalhe 360º com seções independentes.
6. Entregar ações críticas com confirmação, conflito e feedback.
7. Integrar inspeção, interceptor, banner global, expiração e restauração do superadmin.
8. Validar acessibilidade, temas, responsividade, offline, sessão e builds.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Token de inspeção separado | Preservar sessão original e impor somente leitura | Trocar o access token principal cria risco de perda de sessão e mutações indevidas |
| Agregado administrativo | Carregar visão 360º e indicadores com consistência | Compor no frontend gera N+1 e estados divergentes |
