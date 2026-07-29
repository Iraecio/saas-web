# Implementation Plan: Configuração de Meios de Pagamento

**Branch**: `004-payment-settings` | **Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-payment-settings/spec.md`

## Summary

Adicionar uma página única em Configurações > Pagamento, adaptada ao papel autenticado. O frontend consumirá diretamente os contratos existentes do módulo `payment` da `saas-api`: o superadmin administra políticas globais e configurações da plataforma; revendedores e gerentes administram apenas configurações da própria revenda. Modelos tipados, um serviço por domínio, formulários reativos e testes de serviço manterão rotas, payloads, validações e proteção de credenciais explícitos.

## Technical Context

**Language/Version**: TypeScript 5.9

**Primary Dependencies**: Angular 21.2 standalone + SSR, RxJS 7.8, Tailwind CSS 4

**Storage**: Nenhum armazenamento novo; PostgreSQL permanece encapsulado pela `saas-api`

**Testing**: Vitest via Angular TestBed e build Angular SSR

**Target Platform**: Navegadores modernos e renderização SSR

**Project Type**: Aplicação web com API REST em repositório irmão

**Performance Goals**: Página interativa após no máximo duas requisições paralelas; operações atualizam a lista sem recarregar toda a aplicação

**Constraints**: Sem dependência nova; envelope da API já desembrulhado pelo interceptor; JWT/RBAC existente; segredos nunca lidos da API; acesso direto protegido por guard; preservar contrato existente

**Scale/Scope**: Uma rota, uma página responsiva, um serviço, modelos do domínio e testes; três políticas/adaptadores atuais (`MANUAL`, `PIX_MANUAL`, `GENERIC_WEBHOOK`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

A constituição contém somente placeholders, portanto não define gates executáveis. Aplicam-se os padrões já usados no repositório.

| Gate operacional | Avaliação | Resultado |
|---|---|---|
| Fonte oficial | Nenhuma regra financeira será reimplementada; a API decide autorização, validação e estado | PASS |
| Segurança | Guards espelham os papéis da API e credenciais são somente escrita | PASS |
| Isolamento | O frontend usa endpoints por escopo; não recebe `resellerId` arbitrário | PASS |
| Compatibilidade SSR | Signals, formulários e HTTP não acessam APIs exclusivas do navegador | PASS |
| Testabilidade | Serviço coberto por contrato de paths/payloads e build valida a composição | PASS |
| Simplicidade | Uma página orientada ao papel e um serviço evitam duplicação entre plataforma e revenda | PASS |

**Post-design re-evaluation**: PASS. Os contratos documentados preservam as fronteiras da API, e o modelo de formulário não persiste nem reexibe segredos.

## Project Structure

### Documentation (this feature)

```text
specs/004-payment-settings/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── payment-api.md
│   └── ui-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/app/
├── core/models/
│   └── payment-settings.model.ts
└── features/settings/
    ├── services/
    │   ├── payment-settings.ts
    │   └── payment-settings.spec.ts
    ├── pages/
    │   ├── general/general.ts
    │   └── payment/payment.ts
    └── settings.routes.ts
```

**Structure Decision**: A funcionalidade permanece dentro de `settings`, pois é acessada pela navegação de configurações e compartilha o shell existente. O contrato é centralizado em `core/models`; toda comunicação fica em um serviço feature-scoped.

## Delivery Sequence

1. Definir modelos e serviço com seleção de prefixo pelo papel.
2. Cobrir paths, payloads e ações do serviço.
3. Criar a página com listagem, editor e ações de estado.
4. Integrar aba e rota com guards.
5. Formatar, testar e executar build de produção.

## Complexity Tracking

Nenhuma violação identificada.
