# Research: Cobertura Completa da API no Frontend

**Branch**: `001-full-api-coverage` | **Date**: 2026-05-23

---

## 1. Estado Atual do Projeto

### O que já está implementado

| Feature | Páginas | Serviço | Status |
|---------|---------|---------|--------|
| Auth (login, register, bootstrap, refresh, logout) | ✅ | ✅ | Completo |
| Perfil próprio (GET/PUT /users/me) | ✅ (via fetchProfile) | ✅ | Completo |
| Listagem de usuários paginada | ✅ | ✅ | Completo |
| Detalhe/edição de usuário (admin) | ✅ | ✅ | Completo |
| Desativar usuário (SUPER_ADMIN) | ✅ | ✅ | Completo |
| Role Requests (criar, listar, aprovar, rejeitar) | ✅ | ✅ | Completo |
| Dashboard por papel (7 roles) | ✅ | n/a | Completo (shell) |
| Listagem de revendedores | ✅ | ✅ | Funcional mas endpoint errado |

### Problemas identificados no código existente

| Problema | Arquivo | Impacto | Decisão |
|----------|---------|---------|---------|
| Dois `ApiService` duplicados | `src/app/core/services/api.ts` e `src/app/service/api.service.ts` | Confusão de imports, divergência de lógica | Consolidar em `src/app/core/services/api.service.ts` mantendo os métodos de domínio do segundo |
| `ResellerService` usa `GET /users?role=RESELLER` | `src/app/features/resellers/services/reseller.ts` | Não usa o endpoint correto da admin API | Migrar para `GET /admin/revendedores` |
| `UserService.mapToListItem` simplifica roles para 'admin'/'user' | `src/app/features/users/services/user.ts` | Perde a distinção entre os 7 papéis | Atualizar o mapeamento para preservar todos os roles |
| `UserService.create` chama endpoint inexistente `/users` (POST) | `src/app/service/api.service.ts` | A API não expõe criação de usuário por admin | Remover ou substituir pelo fluxo correto (register-reseller para RESELLER) |

### O que está faltando

| Feature | Endpoints correspondentes | Prioridade |
|---------|--------------------------|-----------|
| Perfis especializados (voice, producer, client) | GET/PATCH `/users/:id/{voice,producer,client}-profile` | Alta |
| Cota de armazenamento | GET `/users/:id/storage-quota` | Média |
| Permissões granulares de usuário | POST/DELETE `/users/:id/permissions/:name` | Alta (admin) |
| Domínios customizados | POST/GET/DELETE `/resellers/:id/custom-domains` | Alta |
| Wallet — usuário | 7 endpoints | Alta |
| Wallet — admin | 14 endpoints | Alta |
| Storage | 3 endpoints | Média |
| Registro de revendedor | POST `/auth/register-reseller` | Média |

---

## 2. Decisões de Arquitetura

### 2.1 Consolidação de ApiService

**Decisão**: Manter apenas `src/app/core/services/api.service.ts` com os métodos genéricos (get/post/put/patch/delete) e os métodos de domínio de usuário.

**Rationale**: Elimina ambiguidade de imports e centraliza o tratamento de erros HTTP. O `src/app/service/api.service.ts` (raiz) será removido; os serviços de feature que o importavam serão atualizados.

**Alternativa rejeitada**: Manter ambos — criaria mais divergências ao adicionar os novos serviços de Wallet, Storage, etc.

---

### 2.2 Estrutura de Feature Modules

**Decisão**: Seguir o padrão já estabelecido:

```
src/app/features/{feature-name}/
├── models/          # Interfaces TypeScript do domínio
├── pages/           # Componentes de página (standalone)
│   └── {page-name}/
│       └── {page-name}.ts
├── services/        # Serviço HTTP do domínio
│   └── {service}.ts
└── {feature}.routes.ts
```

**Rationale**: Padrão já adotado em `auth`, `users`, `resellers`, `role-requests`. Consistência reduz curva de aprendizado.

---

### 2.3 Estado Reativo

**Decisão**: Usar Angular Signals (`signal`, `computed`, `effect`) para estado local de componente e `AppStateService` para estado global (usuário autenticado). Usar `Observable` + `async pipe` para dados carregados via HTTP.

**Rationale**: Já adotado no `AuthService`. Signals evitam gerenciamento manual de subscriptions.

**Alternativa rejeitada**: NgRx Store — overhead excessivo para o escopo atual.

---

### 2.4 Wallet — Cursor Pagination

**Decisão**: Para a listagem de créditos (`GET /wallet/credits`), implementar carregamento progressivo via cursor: carregar página inicial; botão "Carregar mais" / scroll infinito acumula itens; cursor retornado na resposta é passado na próxima requisição.

**Rationale**: A API expõe cursor pagination (não offset), o que é otimizado para listas longas e append-only. Implementar com `BehaviorSubject<Credit[]>` acumulador + signal de cursor.

---

### 2.5 Upload de Arquivos

**Decisão**: Usar `HttpClient` com `FormData` e `reportProgress: true` para exibir barra de progresso via `HttpEventType.UploadProgress`. Limitar feedback visual de progresso apenas ao browser (não SSR).

**Rationale**: PrimeNG possui componente `p-fileupload` mas ele gerencia o upload internamente; para controle total do progresso e headers de auth, é preferível usar upload manual com HttpClient.

---

### 2.6 Rotas e Guards

**Decisão**: Expandir o `role.guard.ts` existente para ser usado nas rotas de Wallet Admin, Storage e Custom Domains. A rota de correção de reconciliação e emissão de créditos exige `SUPER_ADMIN`.

**Rationale**: Guard já existe; apenas precisa ser aplicado nas novas rotas.

---

### 2.7 Registro de Revendedor

**Decisão**: Criar página separada `/auth/register-reseller` (fora do painel admin) que chama `POST /auth/register-reseller`. Após sucesso, exibir o `defaultDomain` retornado na confirmação antes de redirecionar ao login.

**Rationale**: O fluxo é público (sem JWT), similar ao register padrão; faz sentido estar no layout de auth.

---

## 3. Dependências Externas

| Dependência | Versão atual | Uso para novas features |
|-------------|-------------|------------------------|
| PrimeNG | 21.x | `p-table`, `p-chart`, `p-fileupload`, `p-dialog`, `p-badge`, `p-tag` |
| Tailwind CSS | 4.x | Layout e utilitários (já em uso) |
| RxJS | 7.8 | Operadores para streams de upload, pagination |

**Nenhuma nova dependência necessária.**

---

## 4. Gaps de Cobertura por Papel de Usuário

| Papel | Telas existentes | O que falta |
|-------|-----------------|-------------|
| SUPER_ADMIN | Dashboard (shell) | Emissão/cancelamento de créditos, correção de reconciliação, desativação de usuários |
| ADMIN | Usuários, Revendedores, Role Requests | Wallet admin (carteiras, créditos, disputas, reembolsos, analytics, auditoria), permissões de usuário |
| RESELLER | Dashboard (shell) | Domínios customizados, perfil revendedor |
| RESELLER_MANAGER | Dashboard (shell) | Domínios customizados, perfil próprio |
| VOICE_ACTOR | Dashboard (shell) | Perfil de locutor, storage, carteira |
| PRODUCER | Dashboard (shell) | Perfil de produtor, storage, carteira |
| CLIENT | Dashboard (shell), Role Request form | Perfil de cliente, carteira, storage |
