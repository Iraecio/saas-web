# Implementation Plan: Cobertura Completa da API no Frontend

**Branch**: `001-full-api-coverage` | **Date**: 2026-05-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-full-api-coverage/spec.md`

---

## Summary

Implementar no frontend (saas-web, Angular 21) todos os fluxos de usuário correspondentes aos endpoints já disponíveis na saas-api. Isso envolve corrigir problemas no código existente (duplicação de serviço, endpoint errado de revendedores, mapeamento de roles incompleto) e adicionar três features completamente novas (Wallet, Storage, Domínios Customizados) além de completar features parcialmente existentes (perfis especializados, permissões granulares, registro de revendedor).

---

## Technical Context

**Language/Version**: TypeScript 5.9

**Primary Dependencies**: Angular 21.2 (standalone components, signals, SSR), PrimeNG 21, Tailwind CSS 4, RxJS 7.8

**Storage**: LocalStorage para tokens de sessão (`saas-web.accessToken`, `saas-web.refreshToken`)

**Testing**: Vitest 4.x (unit), Karma (componentes — arquivos `.spec.ts`)

**Target Platform**: Web (browser + Angular SSR via Express 5)

**Project Type**: Web application (SPA com SSR)

**Performance Goals**: Páginas de listagem carregam em menos de 2s; uploads mostram progresso contínuo; cursor pagination na Wallet evita over-fetching

**Constraints**: Sem novas dependências de runtime; compatível com Angular SSR (sem `localStorage` direto em componentes — usar `isPlatformBrowser`)

**Scale/Scope**: 7 papéis de usuário, ~50 rotas de API, ~20 páginas novas a criar

---

## Constitution Check

> A constitution do projeto está preenchida com template placeholder — sem princípios definidos formalmente.
> **Gates**: nenhum gate de violação a reportar. Prosseguir.

**Post-design re-evaluation**: A consolidação do `ApiService` e a estrutura de módulos estão alinhadas com os padrões já adotados no projeto. Nenhuma violação de arquitetura identificada.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-full-api-coverage/
├── plan.md              ← este arquivo
├── research.md          ← decisões e gaps identificados
├── data-model.md        ← interfaces TypeScript a criar/estender
├── quickstart.md        ← guia de ambiente e convenções
├── contracts/
│   └── api-contracts.md ← contratos HTTP frontend ↔ backend
├── checklists/
│   └── requirements.md  ← checklist de qualidade do spec
└── tasks.md             ← gerado por /speckit-tasks (ainda não criado)
```

### Source Code

```text
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts                    [existente]
│   │   │   ├── role.guard.ts                    [existente — expandir uso]
│   │   │   └── dashboard-redirect.guard.ts      [existente]
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts              [existente]
│   │   │   └── error.interceptor.ts             [existente]
│   │   ├── models/
│   │   │   ├── user.model.ts                    [existente — estender]
│   │   │   ├── role-request.model.ts            [existente]
│   │   │   ├── profile.model.ts                 [NOVO]
│   │   │   ├── custom-domain.model.ts           [NOVO]
│   │   │   ├── wallet.model.ts                  [NOVO]
│   │   │   └── storage.model.ts                 [NOVO]
│   │   └── services/
│   │       ├── api.service.ts                   [existente — consolidar + adicionar métodos]
│   │       ├── auth.ts                          [existente]
│   │       ├── app-state.ts                     [existente]
│   │       └── notification.ts                  [existente]
│   ├── features/
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   ├── login/                       [existente]
│   │   │   │   ├── register/                    [existente]
│   │   │   │   ├── bootstrap/                   [existente]
│   │   │   │   └── register-reseller/           [NOVO]
│   │   │   └── auth.routes.ts                   [existente — adicionar rota]
│   │   ├── users/
│   │   │   ├── pages/
│   │   │   │   ├── list/                        [existente]
│   │   │   │   ├── form/                        [existente]
│   │   │   │   └── permissions/                 [NOVO]
│   │   │   ├── services/
│   │   │   │   ├── user.ts                      [existente — corrigir roles]
│   │   │   │   └── profile.ts                   [NOVO]
│   │   │   └── users.routes.ts                  [existente — adicionar rota]
│   │   ├── profile/                             [NOVO — perfil do usuário logado]
│   │   │   ├── pages/
│   │   │   │   ├── overview/
│   │   │   │   ├── voice-profile/
│   │   │   │   ├── producer-profile/
│   │   │   │   └── client-profile/
│   │   │   ├── services/
│   │   │   │   └── my-profile.ts
│   │   │   └── profile.routes.ts
│   │   ├── resellers/
│   │   │   ├── pages/list/                      [existente — corrigir endpoint]
│   │   │   ├── services/reseller.ts             [existente — migrar para /admin/revendedores]
│   │   │   └── resellers.routes.ts              [existente]
│   │   ├── custom-domains/                      [NOVO]
│   │   │   ├── pages/list/
│   │   │   ├── services/custom-domain.ts
│   │   │   └── custom-domains.routes.ts
│   │   ├── wallet/                              [NOVO — usuário]
│   │   │   ├── pages/
│   │   │   │   ├── balance/
│   │   │   │   ├── credits/
│   │   │   │   ├── credit-detail/
│   │   │   │   └── refunds/
│   │   │   ├── services/wallet.ts
│   │   │   └── wallet.routes.ts
│   │   ├── wallet-admin/                        [NOVO — ADMIN/SUPER_ADMIN]
│   │   │   ├── pages/
│   │   │   │   ├── wallets/
│   │   │   │   ├── wallet-detail/
│   │   │   │   ├── credits/
│   │   │   │   ├── disputes/
│   │   │   │   ├── refunds/
│   │   │   │   ├── reconciliation/
│   │   │   │   ├── audit-log/
│   │   │   │   ├── analytics/
│   │   │   │   └── issue-credits/
│   │   │   ├── services/wallet-admin.ts
│   │   │   └── wallet-admin.routes.ts
│   │   ├── storage/                             [NOVO]
│   │   │   ├── pages/file-manager/
│   │   │   ├── services/storage.ts
│   │   │   └── storage.routes.ts
│   │   ├── role-requests/                       [existente — completo]
│   │   ├── dashboard/                           [existente]
│   │   └── settings/                            [existente]
│   ├── service/
│   │   └── api.service.ts                       [REMOVER após consolidação]
│   └── app.routes.ts                            [existente — adicionar novas rotas]
└── environments/
    ├── environment.ts                           [existente]
    └── environment.prod.ts                      [existente]
```

**Structure Decision**: Padrão existente de features standalone por domínio mantido. `wallet-admin` foi separado em módulo próprio para isolar claramente rotas que requerem ADMIN/SUPER_ADMIN. `profile` foi separado de `users` (gestão admin vs. perfil próprio).

---

## Complexity Tracking

> Nenhuma violação de constitution identificada. Seção não aplicável.
