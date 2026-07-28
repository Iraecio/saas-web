# Implementation Plan: Dashboard Administrativo com Dados Oficiais

**Branch**: `003-official-admin-dashboard` | **Date**: 2026-07-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-official-admin-dashboard/spec.md`

## Summary

Alinhar o `saas-web` aos contratos vigentes da `saas-api` em cinco entregas sequenciais: carteira unificada/admin, pedidos compostos por `lineItems`, comércio de créditos da revenda, resumo administrativo agregado e limpeza de navegação/relatórios. A API existente permanece a fonte de verdade; será adicionado apenas um módulo de leitura `admin-dashboard` para agregações que hoje exigiriam múltiplas consultas e cálculos no navegador. O frontend manterá features standalone, signals e serviços por domínio, com modelos explícitos, estados de carregamento/erro/vazio e nenhuma informação fictícia.

## Technical Context

**Language/Version**: TypeScript 5.9 no frontend; TypeScript 6.0 e Node.js no backend

**Primary Dependencies**: Angular 21.2 standalone + SSR, RxJS 7.8, PrimeNG 21/Tailwind CSS 4; NestJS 11, Prisma 7, PostgreSQL, class-validator, Swagger

**Storage**: PostgreSQL via Prisma na API; tokens de sessão no armazenamento do navegador por meio dos serviços existentes; nenhum novo armazenamento no frontend

**Testing**: Vitest/Angular component tests e build SSR no frontend; Jest unitário, integração HTTP e cobertura no backend

**Target Platform**: Navegadores modernos + Angular SSR; API REST Linux sob `/v1`

**Project Type**: Aplicação web em dois repositórios irmãos (`saas-web` e `saas-api`)

**Performance Goals**: Dashboard útil em até 2s; listagens paginadas sem over-fetch; uma requisição agregada para o dashboard; consultas de agregação sem N+1

**Constraints**: Sem nova dependência de runtime; envelope global `{ success, data, timestamp, requestId }`; JWT/RBAC e isolamento por revenda; valores monetários em centavos; compatibilidade SSR; preservar alterações locais não relacionadas

**Scale/Scope**: 7 papéis; 5 jornadas; cerca de 30 telas/serviços existentes afetados; 1 módulo de leitura novo na API; sem migração de banco prevista

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

A constitution do projeto contém apenas placeholders e não define gates executáveis. Aplicam-se os padrões documentados dos dois repositórios: autenticação/RBAC global, isolamento multi-tenant, envelope uniforme, testes proporcionais ao risco, Angular SSR e ausência de novas dependências de runtime.

| Gate operacional | Avaliação | Resultado |
|---|---|---|
| Fonte oficial e segurança | A API continua fonte de verdade; dashboard novo é somente leitura e ADMIN/SUPER_ADMIN | PASS |
| Compatibilidade | Rotas frontend obsoletas serão substituídas pelos contratos já vigentes; não há mudança destrutiva do banco | PASS |
| Testabilidade | Contratos, serviços e cálculos agregados terão testes unitários/integração; jornadas críticas terão validação ponta a ponta | PASS |
| Performance | Agregação ocorre no servidor com consultas em lote; paginação respeita cursor, offset ou page conforme domínio | PASS |
| Complexidade | Um módulo agregado evita lógica duplicada e várias chamadas no cliente; nenhum novo framework ou infraestrutura | PASS |

**Gate result**: PASS.

**Post-design re-evaluation**: PASS. Os contratos mantêm RBAC e envelope existentes, o modelo do dashboard é somente leitura, e a matriz de paginação evita uma abstração genérica incorreta entre cursor, offset e página.

## Project Structure

### Documentation (this feature)

```text
specs/003-official-admin-dashboard/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── admin-dashboard-api.md
│   ├── integration-matrix.md
│   └── ui-contracts.md
├── checklists/
│   └── requirements.md
└── tasks.md                       # criado por /speckit-tasks
```

### Source Code

```text
../saas-api/src/modules/
├── admin-dashboard/               # novo: agregação somente leitura
│   ├── admin-dashboard.module.ts
│   ├── admin-dashboard.controller.ts
│   ├── admin-dashboard.service.ts
│   └── dto/responses/admin-dashboard-response.dto.ts
├── wallet/                        # fonte existente
├── order/                         # fonte existente
├── credit-trade/                  # fonte existente
├── user/                          # fonte existente
├── professional-status/           # fonte existente
├── withdrawal/                    # fonte existente
└── role-requests/                  # fonte existente

src/app/
├── core/models/
│   ├── wallet.model.ts             # alinhar carteira única/paginação
│   ├── order.model.ts              # pedido + line items
│   ├── reseller-credit.model.ts    # compra/estoque/venda
│   └── admin-dashboard.model.ts    # novo contrato agregado
├── features/
│   ├── wallet/                     # corrigir rotas do usuário
│   ├── wallet-admin/               # corrigir verbos, paths e offset
│   ├── orders/                     # migrar todas as ações para item
│   ├── reseller-credits/           # substituir emissão por comércio
│   ├── dashboard/                  # serviço + dashboard oficial
│   ├── reports/                    # somente relatórios oficiais
│   └── resellers/                  # remover totais artificiais
├── core/services/api.ts            # remover operação inexistente
├── app.routes.ts                   # destinos e guards válidos
└── shared/components/sidebar/      # menu por papel consistente
```

**Structure Decision**: Mudanças de domínio permanecem em suas features atuais. O único módulo novo é `admin-dashboard` na API e seu modelo/serviço correspondente no frontend. Ele não persiste dados nem replica regras; apenas agrega fontes existentes. Não será criada uma camada universal de paginação porque os contratos oficiais usam três estratégias distintas.

## Delivery Sequence

### Phase A — Carteira e paginação

1. Corrigir modelos para carteira única e respostas reais.
2. Ajustar paths e verbos de disputa, estorno, auditoria, reconciliação, emissão e cancelamento.
3. Aplicar cursor em extrato, offset nas listas wallet-admin/refunds e page nas compras/vendas.
4. Remover `platform`/`reseller` wallet e esconder ações SUPER_ADMIN para ADMIN.
5. Cobrir serviços, filtros e páginas com testes.

### Phase B — Pedidos por item

1. Remodelar `Order`, `OrderLineItem`, históricos, entregas e DTOs.
2. Criar pedido em JSON com `items[]`; upload antecede a associação via Storage quando necessário.
3. Adicionar detalhe/seleção de item e todas as transições em `/line-items/:itemId`.
4. Implementar atribuição e adição de item.
5. Remover endpoints e componentes do fluxo legado.

### Phase C — Comércio de créditos

1. Substituir emissão/emissões por preço, configuração, pacotes, compras, estoque, vendas e relatório.
2. Criar visão administrativa de compras pendentes com confirmar/cancelar.
3. Aplicar centavos, quantidades, margens e permissões explicitamente.
4. Atualizar navegação da revenda e do admin.

### Phase D — Dashboard oficial

1. Implementar agregação ADMIN/SUPER_ADMIN sem persistência.
2. Definir período atual e anterior, inclusive denominador zero.
3. Entregar métricas, pedidos recentes, pendências e `generatedAt` em uma resposta.
4. Consumir via serviço frontend com loading, erro parcial/total, vazio e retry.
5. Remover todos os arrays estáticos e links rápidos inválidos.

### Phase E — Navegação e relatórios

1. Auditar matriz de papel × rota × menu.
2. Remover destinos inexistentes e expor features oficiais autorizadas, mantendo armazenamento global visível e acessível somente para SUPER_ADMIN.
3. Usar wallet analytics e vendas de revenda como relatórios iniciais.
4. Remover botões de geração sem efeito e números artificiais em revendedores/overview.
5. Validar os sete papéis, build SSR e jornadas ponta a ponta.

## Complexity Tracking

Nenhuma violação constitucional identificada. A agregação nova é justificada por performance, consistência temporal e centralização de regras de cálculo; compor todas as fontes no navegador aumentaria latência, exposição de dados e divergência de resultados.
