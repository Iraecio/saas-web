# Research & Decisions: Marketplace de Pedidos, Catálogo e Escopo

**Branch**: `002-marketplace-orders-catalog` | **Date**: 2026-06-08

Decisões técnicas e resolução de ambiguidades antes da implementação. Cada item resolve uma incógnita levantada no `plan.md`.

---

## R-001 — Fonte autoritativa do contrato (divergência 004 vs 005/006)

**Contexto**: Os contratos da API divergem entre specs. O contract de `004-dual-scope-dual-wallet` usa `briefing`, `serviceTypeId`, `POST /orders/:id/reject`; já `005-order-flow`/`006-service-catalog` (mais recentes) e a tabela de endpoints de `saas-api/CLAUDE.md` usam `briefingText`, `serviceId`, `refuse`, `approve`, `request-revision`, `dispute`, `resolve`, `request-brief-revision`, `update-brief`.

**Decisão**: Seguir **005/006 + tabela de `saas-api/CLAUDE.md`** como fonte autoritativa. O modelo antigo `ServiceType`/`/v1/service-types` está **descontinuado** — usar somente `/v1/services`.

**Implicação**: Pedido referencia `serviceId` (não `serviceTypeId`) e campo de briefing é `briefingText`. As ações do profissional usam `refuse` (não `reject`).

**Validação**: Conferir o shape real na Phase 2 com uma chamada manual à API antes de congelar o `order.ts`.

---

## R-002 — Reutilização do ApiService central, sem novos métodos tipados

**Decisão**: Não adicionar métodos específicos ao `core/services/api.ts`. Cada feature-service injeta `ApiService` e usa os genéricos `get/post/put/patch/delete<T>(endpoint, ...)`, exatamente como `WalletService` já faz. Endpoints escritos **sem** prefixo `/v1` (o `environment.apiUrl` já é `/v1`).

**Racional**: Mantém o `ApiService` enxuto e evita acoplar o core a cada domínio. Consistente com o padrão observado.

---

## R-003 — Upload multipart com progresso (briefing PRODUCTION e entrega)

**Decisão**: Para `POST /orders` (PRODUCTION), `POST /orders/:id/deliver` e `POST /orders/:id/update-brief` (quando houver arquivo), montar `FormData` e usar `HttpClient.post` com `{ reportProgress: true, observe: 'events' }` diretamente no `order.ts` (não via `ApiService.post`, que assume JSON). Expor um `Observable` de progresso para a UI.

**Formatos/limite (validação client-side antes do envio)**: `mp3, wav, ogg, m4a, flac`; máximo 100 MB.

**Racional**: O `ApiService` genérico serializa JSON; upload precisa de `FormData` + eventos de progresso. Isolar no service do domínio evita poluir o core.

---

## R-004 — Matriz de ações por status × papel (núcleo do `order-actions`)

**Decisão**: Centralizar a lógica de "quais ações estão disponíveis" em uma função pura derivada de `(status, userRole, isOwnerClient, isAssignedProfessional)`. A UI nunca exibe ação inválida (cobre FR-020/SC-003). Tabela em `quickstart.md`.

**Racional**: Concentrar a regra em um único ponto testável evita divergência entre botões espalhados e facilita os testes de componente.

---

## R-005 — Filtro de serviços compatíveis na criação de pedido

**Decisão**: Ao selecionar o profissional, chamar `GET /v1/services?professionalRole={VOICE_ACTOR|PRODUCER}` e filtrar client-side por `scope` compatível com o escopo do profissional. A API já aplica visibilidade por papel (GLOBAIS + PARTICULARES da revenda do cliente).

**Aberto**: Confirmar se a API expõe filtro por profissional específico; caso não, o filtro client-side por `scope`/`ownerId` é suficiente.

---

## R-006 — Evolução da carteira (não recriação)

**Decisão**: A feature `wallet` existente (`/wallet/balance`, `/wallet/credits`...) é mantida; adiciona-se o consumo de `GET /v1/wallet/platform` e `GET /v1/wallet/reseller` para a visão de dupla carteira. Clientes sem `resellerId` recebem 403 na RESELLER — tratado como "carteira não aplicável", sem erro visível.

**Aberto**: Verificar se `/wallet/balance` (modelo antigo) coexiste com `/wallet/platform|reseller` ou se a página `balance` deve migrar inteiramente para o novo par de endpoints. Decidir na Phase 7 conforme resposta da API.

---

## R-007 — Player e download de áudio sem nova dependência

**Decisão**: Usar o elemento HTML nativo `<audio controls>` para reprodução e `<a download>` para baixar, com as URLs assinadas retornadas pela API. Nenhuma biblioteca de áudio é adicionada (atende FR-035).

---

## R-008 — Compatibilidade com SSR

**Decisão**: Componentes não acessam `window`/`localStorage` diretamente; qualquer acesso ao browser é guardado por `isPlatformBrowser`. Upload e `<audio>` só são exercidos em interação do usuário (client-side), portanto seguros sob SSR.

---

## Resumo das pendências a validar na integração

| # | Pendência | Fase de validação |
|---|---|---|
| R-001 | Nomes de campos/ações do pedido (`briefingText`/`serviceId`/`refuse`) | Phase 2 |
| R-002 | — (decidido) | — |
| R-005 | Filtro de serviços por profissional | Phase 2 |
| R-006 | Coexistência `/wallet/balance` vs `/wallet/platform|reseller` | Phase 7 |
| plan#2 | `orderType` explícito vs inferido | Phase 2 |
| plan#4 | Shape do produtor | Phase 4 |
