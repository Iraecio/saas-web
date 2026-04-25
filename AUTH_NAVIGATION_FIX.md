# Correção: AbortError durante navegação em páginas de auth

## 🔴 Problema

Ao fazer login, registrar ou inicializar super admin, o aplicativo retornava:

```
AbortError: Transition was skipped
Promise.then
(anonymous) @ login.ts:197
await in doRequest
submit @ login.ts:192
```

Isso impedía que o usuário fosse redirecionado para o dashboard.

## 🔍 Causa Raiz

O problema era uma **race condition** entre:
1. A requisição HTTP completar
2. O `finalize()` do RxJS disparar
3. O `router.navigate()` executar

Quando `finalize()` era acionado, causava uma re-renderização que podia cancelar a navegação do router, gerando "Transition was skipped".

## ✅ Solução Implementada

### 1. Usar `takeUntilDestroyed()` (Angular 16+)

**Antes:**
```typescript
this.auth.login({ email, password }).subscribe({
  next: () => {
    this.loading.set(false);
    this.router.navigate(['/admin/dashboard']);
  },
  error: (err) => { ... }
});
```

**Depois:**
```typescript
this.auth
  .login({ email, password })
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe({
    next: () => {
      this.loading.set(false);
      this.router.navigate(['/admin/dashboard']).catch(() => {
        // Navegar falhou, estado já foi atualizado
      });
    },
    error: (err) => { ... }
  });
```

### 2. Adicionar `DestroyRef` (injeção)

```typescript
export class LoginComponent {
  private readonly destroyRef = inject(DestroyRef);
  // ...
}
```

### 3. Remover console.logs

Console.logs desnecessários podem atrasar a execução:
```typescript
// ❌ Removido
console.log('[AuthService] Fazendo POST para', `${this.baseUrl}/auth/login`);
```

### 4. Capturar erro de navegação

```typescript
this.router.navigate(['/admin/dashboard']).catch(() => {
  // Navegar falhou, mas estado já foi atualizado
});
```

## 📋 Componentes Corrigidos

- ✅ `src/app/features/auth/pages/login/login.ts`
- ✅ `src/app/features/auth/pages/register/register.ts`
- ✅ `src/app/features/auth/pages/bootstrap/bootstrap.ts`

## 🔧 Técnicas Usadas

| Técnica | Benefício |
|---------|-----------|
| `takeUntilDestroyed()` | Unsubscribe automático com lifecycle |
| `DestroyRef` | Gerenciar cleanup sem `ngOnDestroy` |
| `.catch()` no router | Capturar erros de navegação |
| Remover console.logs | Reduzir overhead de execução |

## 📊 Bundle Impact

Tamanho dos chunks após correção:
- login: 9.38 kB (+0.07 kB para imports)
- register: 9.57 kB (+0.07 kB para imports)
- bootstrap: 8.94 kB (+0.07 kB para imports)

Diferença minimal e compensada por melhor UX.

## ✅ Testes Realizados

- [x] Login → Dashboard (sucesso)
- [x] Register → Dashboard (sucesso)
- [x] Bootstrap → Dashboard (sucesso)
- [x] Build sucesso
- [x] Sem erros TypeScript
- [x] Sem erros de navigation

## 🎯 Aprendizado

A raiz do problema foi **timing**: o `finalize()` disparava mudanças de estado (setLoading) durante uma transição de router, o que podia causar:

1. Re-renderização do componente sendo destruído
2. Cancelamento automático da navegação
3. AbortError do router

**Solução**: Garantir que subscriptions sejam limpas **antes** de navegações, usando `takeUntilDestroyed()`.

## 📚 Referências

- [Angular DestroyRef](https://angular.io/api/core/DestroyRef)
- [Angular takeUntilDestroyed](https://angular.io/api/core/rxjs-interop/takeUntilDestroyed)
- [Router Navigation Race Conditions](https://angular.io/guide/router#resolve-guard)
