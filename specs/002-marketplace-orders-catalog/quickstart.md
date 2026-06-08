# Quickstart: Marketplace de Pedidos, Catálogo e Escopo

**Branch**: `002-marketplace-orders-catalog` | **Date**: 2026-06-08

Guia de ambiente e convenções para implementar esta feature no saas-web.

---

## Ambiente

```bash
npm install            # caso necessário
npm start              # dev server (Angular)
npm test               # Vitest (unit/component)
npm run build          # build SSR
```

API base: `environment.apiUrl = '/v1'`. Em dev, o proxy/ambiente já direciona para a saas-api. Os feature-services escrevem endpoints **sem** o prefixo `/v1` (ex.: `api.get('/orders')`).

---

## Convenções do projeto (observadas no código existente)

- **Componentes standalone** com `ChangeDetectionStrategy.OnPush`, `signal()` para estado, `inject()` para DI, `takeUntilDestroyed()` para unsubscribe.
- **Templates inline** (string no decorator) com Tailwind 4; suportar dark mode (`dark:` classes).
- **Páginas** nomeadas `XxxPage` em `pages/<rota>/<rota>.ts`; rotas via `loadComponent`.
- **Services** `@Injectable({ providedIn: 'root' })` injetando `ApiService`; retornam `Observable<T>`.
- **Modelos** em `core/models/*.model.ts`; enums como union de string literais.
- **Respostas** já chegam desembrulhadas de `{ success, data }` (interceptor) — o tipo genérico do `ApiService` descreve o `data`.
- **SSR**: nada de `window`/`localStorage` direto fora de `isPlatformBrowser`.

---

## Esqueleto de um feature-service

```typescript
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import { Order, OrderListFilters } from '../../../core/models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);

  list(filters?: OrderListFilters): Observable<Order[]> {
    return this.api.get<Order[]>('/orders', filters as Record<string, string | number>);
  }

  getById(id: string): Observable<Order> {
    return this.api.get<Order>(`/orders/${id}`);
  }

  accept(id: string): Observable<Order> {
    return this.api.post<Order>(`/orders/${id}/accept`, {});
  }

  // ... refuse, deliver (multipart), approve, requestRevision, dispute, resolve, cancel
}
```

### Upload multipart (criação PRODUCTION / entrega)

```typescript
import { HttpClient, HttpEventType } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

create(dto: CreateOrderDto): Observable<HttpEvent<Order>> {
  const form = new FormData();
  form.append('professionalId', dto.professionalId);
  form.append('serviceId', dto.serviceId);
  form.append('orderType', dto.orderType);
  form.append('briefingText', dto.briefingText);
  if (dto.file) form.append('file', dto.file);
  return this.http.post<Order>(`${environment.apiUrl}/orders`, form, {
    reportProgress: true,
    observe: 'events',
  });
}
```

Validar antes de enviar: extensão em `mp3/wav/ogg/m4a/flac` e tamanho ≤ 100 MB.

---

## Matriz de ações do pedido (status × papel)

Fonte única de verdade para o componente `order-actions`. A UI só exibe ações desta tabela.

| Status | CLIENT (dono) | Profissional (atribuído) | ADMIN / RESELLER autorizado |
|---|---|---|---|
| `PENDING` | cancel | request-brief-revision, accept, refuse | — |
| `AWAITING_BRIEF` | update-brief, cancel | — | — |
| `IN_PROGRESS` | cancel (só se prazo excedido) | deliver | — |
| `REVIEW` | approve, request-revision¹, dispute | deliver (re-entrega, `redeliveryReason`) | — |
| `DISPUTED` | — | — | resolve (FAVOR_CLIENT / FAVOR_PROFESSIONAL) |
| `COMPLETED` | — | — | — |
| `CANCELLED` | — | — | — |

¹ `request-revision` só habilitado quando `revisionCount < maxRevisions`; ao atingir o limite, exibir apenas approve/dispute.

---

## Tratamento de erros esperados

| Código | Cenário | UI |
|---|---|---|
| 400 | Campos obrigatórios ausentes | Validação de formulário + mensagem da API |
| 402 | Saldo insuficiente na carteira | Exibir saldo atual e necessário; bloquear envio |
| 403 | Profissional/serviço de outra revenda; carteira RESELLER sem `resellerId` | Mensagem de autorização (RESELLER de carteira: silencioso) |
| 409 | Alterar escopo de profissional com pedidos ativos; saque já PENDING/PROCESSING | Mensagem explicativa |
| 422 | Incompatibilidade serviço↔profissional; `confirmImpact` ausente; limite de revisões | Diálogo de confirmação (impact) ou mensagem |

---

## Ordem de implementação sugerida

1. **Phase 0** — modelos em `core/models/`.
2. **Phase 1** — `services` (catálogo) — desbloqueia criação de pedido.
3. **Phase 2/3** — `orders` (criação → ciclo de vida completo).
4. **Phase 4** — `professionals` (escopo).
5. **Phase 5** — `withdrawals`.
6. **Phase 6** — `reseller-credits`.
7. **Phase 7** — `wallet` (dupla carteira).

Registrar cada feature em `app.routes.ts` com `roleGuard` (ver tabela em `plan.md` › Navigation & Routing) e adicionar os itens de menu na sidebar conforme o papel.
