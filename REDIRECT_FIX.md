# Correção: Redirect após autenticação

## 🔴 Problema

Login/Register/Bootstrap retornava sucesso, mas **não redirecionava** o usuário para o dashboard.

## 🔍 Causa Raiz

Havia **double navigation** (duas navegações simultâneas):

```
1. LoginComponent.submit() 
   └─ router.navigate(['/admin/dashboard'])
      └─ DashboardRedirectComponent.ngOnInit()
         └─ router.navigate(['/admin/dashboard/admin'])
```

Quando DashboardRedirectComponent tentava fazer outro navigate, causava "transition skipped".

## ✅ Solução

**Navegar diretamente ao dashboard correto** baseado no role do usuário:

### Antes (Incorreto)
```typescript
this.router.navigate(['/admin/dashboard']);
// Redireciona para componente redirect que faz OUTRO navigate
```

### Depois (Correto)
```typescript
const user = this.appState.user();
const dashboardPath = user?.role ? this.roleDashboardMap[user.role] : 'client';
this.router.navigate(['/admin/dashboard', dashboardPath]);
// Navega diretamente à destinação final, nenhum redirect adicional
```

## 📋 Role → Dashboard Map

```typescript
const roleDashboardMap: Record<UserRole, string> = {
  SUPER_ADMIN:      'admin',           // /admin/dashboard/admin
  ADMIN:            'admin',           // /admin/dashboard/admin
  RESELLER:         'reseller',        // /admin/dashboard/reseller
  RESELLER_MANAGER: 'reseller',        // /admin/dashboard/reseller
  VOICE_ACTOR:      'voice-actor',     // /admin/dashboard/voice-actor
  PRODUCER:         'producer',        // /admin/dashboard/producer
  CLIENT:           'client',          // /admin/dashboard/client
};
```

## 📝 Componentes Corrigidos

- ✅ `login.ts` - Navega ao dashboard correto após login
- ✅ `register.ts` - Navega ao dashboard correto após registro
- ✅ `bootstrap.ts` - Navega ao dashboard correto após bootstrap

## 🔧 Implementação

### 1. Injetar AppStateService
```typescript
private readonly appState = inject(AppStateService);
```

### 2. Adicionar mapa de roles
```typescript
private readonly roleDashboardMap: Record<UserRole, string> = {
  SUPER_ADMIN: 'admin',
  ADMIN: 'admin',
  // ... outros roles
};
```

### 3. Navegar ao dashboard correto
```typescript
const user = this.appState.user();
const dashboardPath = user?.role ? this.roleDashboardMap[user.role] : 'client';
this.router.navigate(['/admin/dashboard', dashboardPath]).catch((err) => {
  console.error('[Component] Erro ao navegar:', err);
  this.error.set('Erro ao redirecionar. Tente novamente.');
});
```

## 📊 Bundle Impact

Tamanho dos chunks após correção:
- login: 9.75 kB (+0.37 kB para AppStateService)
- register: 9.95 kB (+0.38 kB para AppStateService)
- bootstrap: 9.32 kB (+0.38 kB para AppStateService)

Impacto minimal para funcionalidade completa.

## ✅ Testes Realizados

- [x] Login como SUPER_ADMIN → `/admin/dashboard/admin`
- [x] Login como RESELLER → `/admin/dashboard/reseller`
- [x] Login como CLIENT → `/admin/dashboard/client`
- [x] Register como novo usuário → dashboard correto
- [x] Bootstrap como SUPER_ADMIN → `/admin/dashboard/admin`
- [x] Build sucesso
- [x] Sem erros TypeScript
- [x] Sem race conditions

## 🎯 Fluxo Final

```
1. User submete formulário (login/register/bootstrap)
   ↓
2. AuthService.login/register/bootstrap() faz POST
   ↓
3. Resposta bem-sucedida recebida
   ↓
4. AppState.setUser() atualiza user
   ↓
5. LoginComponent obtém role via AppState
   ↓
6. Navega diretamente a /admin/dashboard/{role}
   ↓
7. ✅ Dashboard carrega, sem redirects adicionais
```

## 📚 Referências

- [Angular Router Navigation](https://angular.io/guide/router#router-imports)
- [Prevent Race Conditions](https://angular.io/guide/router#resolve-guard)
- [Signal Subscriptions](https://angular.io/guide/signals)
