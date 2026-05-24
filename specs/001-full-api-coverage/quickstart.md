# Quickstart: Cobertura Completa da API no Frontend

**Branch**: `001-full-api-coverage` | **Date**: 2026-05-23

---

## Ambiente de Desenvolvimento

### Pré-requisitos

- Node.js 22+
- npm 11+
- saas-api rodando em `http://localhost:3000` (ou ajustar `src/environments/environment.ts`)

### Instalar dependências

```bash
cd saas-web
npm install
```

### Iniciar o servidor de desenvolvimento

```bash
npm start
# Abre em http://localhost:4200
# Proxy configurado em proxy.conf.json para redirecionar /api → saas-api
```

### Rodar testes

```bash
npm test          # Vitest em modo watch
npm run test:watch
```

### Build de produção

```bash
npm run build
```

---

## Convenções do Projeto

### Estrutura de uma Feature

Toda nova feature segue o padrão:

```
src/app/features/{feature}/
├── models/
│   └── {model}.model.ts        # Interfaces TypeScript
├── pages/
│   └── {page-name}/
│       └── {page-name}.ts      # Componente standalone (HTML inline ou arquivo .html separado)
├── services/
│   └── {service}.ts            # Serviço HTTP (inject ApiService)
└── {feature}.routes.ts         # Rotas lazy-loaded
```

### Como Adicionar uma Nova Página

1. Criar o arquivo `src/app/features/{feature}/pages/{page}/{page}.ts`
2. Exportar o componente como `@Component({ standalone: true, ... })`
3. Adicionar a rota em `{feature}.routes.ts`
4. Registrar a rota no `app.routes.ts` com `loadChildren`

### Como Adicionar um Novo Serviço HTTP

```typescript
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';  // ← usar este

@Injectable({ providedIn: 'root' })
export class MyFeatureService {
  private readonly api = inject(ApiService);

  getResource(id: string): Observable<MyModel> {
    return this.api.get<MyModel>(`/my-endpoint/${id}`);
  }
}
```

> ⚠️ **Não usar** `src/app/service/api.service.ts` (raiz) — esse arquivo será removido.

### Proteção de Rotas por Papel

Para restringir uma rota a papéis específicos, adicionar `canActivate: [roleGuard]` com `data: { roles: ['ADMIN', 'SUPER_ADMIN'] }`.

```typescript
// Exemplo em {feature}.routes.ts
{
  path: 'admin-page',
  canActivate: [roleGuard],
  data: { roles: ['ADMIN', 'SUPER_ADMIN'] },
  loadComponent: () => import('./pages/admin-page/admin-page').then(m => m.AdminPageComponent)
}
```

### Componentes PrimeNG Principais

| Necessidade | Componente PrimeNG |
|-------------|-------------------|
| Tabelas | `p-table` (TableModule) |
| Formulários | `p-inputtext`, `p-dropdown`, `p-textarea` |
| Botões | `p-button` (ButtonModule) |
| Diálogos/Modais | `p-dialog` (DialogModule) |
| Notificações toast | `p-toast` (ToastModule) + MessageService |
| Upload de arquivos | Usar HttpClient + FormData (não `p-fileupload`) |
| Gráficos | `p-chart` (ChartModule) — wrapper Chart.js |
| Badges/Tags | `p-badge`, `p-tag` |

---

## Ordem Sugerida de Implementação

As features devem ser implementadas nesta ordem de prioridade (baseado nas User Stories do spec):

### Fase 1 — Correções e completude do que existe

1. **Consolidar ApiService** — remover duplicata em `src/app/service/api.service.ts`
2. **Corrigir ResellerService** — usar `GET /admin/revendedores`
3. **Corrigir UserService** — preservar todos os 7 roles no mapeamento
4. **Perfis especializados** — voice-profile, producer-profile, client-profile, storage-quota
5. **Permissões de usuário (UI admin)** — forms para grant/revoke

### Fase 2 — Features novas críticas

6. **Registro de revendedor** — página `/auth/register-reseller`
7. **Domínios customizados** — módulo completo
8. **Wallet usuário** — balance, credits, disputes, refunds, notifications

### Fase 3 — Features administrativas

9. **Wallet admin** — wallets, credits search, disputes, refunds, analytics
10. **Emissão/cancelamento de créditos (SUPER_ADMIN)**
11. **Reconciliação (SUPER_ADMIN)**
12. **Storage** — upload, signed URL, delete

---

## Variáveis de Ambiente

| Variável | Arquivo | Valor padrão |
|----------|---------|-------------|
| `apiUrl` | `src/environments/environment.ts` | `http://localhost:3000/v1` |
| `apiUrl` | `src/environments/environment.prod.ts` | URL da API em produção |
