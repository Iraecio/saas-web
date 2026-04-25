# Solução: Production API URL Configuration

## 🔴 Problema em Produção

Frontend em Vercel estava chamando API errada:

```
❌ https://saas-web-five.vercel.app/v1/auth/login (erro 500)
✅ https://saas-api-82dwl.ondigitalocean.app/v1/auth/login (esperado)
```

## 🔍 Causa Raiz

**Angular não substituía o arquivo de environment em produção.**

O `angular.json` não tinha `fileReplacements` configurado, então:
- Build em qualquer modo usava `environment.ts`
- `environment.ts` tinha `apiUrl: '/v1'` (relativo)
- Em produção, isso virava `saas-web-five.vercel.app/v1`

## ✅ Solução

Adicionar `fileReplacements` no `angular.json`:

```json
{
  "build": {
    "configurations": {
      "production": {
        "fileReplacements": [
          {
            "replace": "src/environments/environment.ts",
            "with": "src/environments/environment.prod.ts"
          }
        ]
      }
    }
  }
}
```

### Como funciona:

```
Production Build
  ↓
Angular vê fileReplacements
  ↓
Substitui environment.ts com environment.prod.ts
  ↓
environment.prod.ts tem:
  apiUrl: 'https://saas-api-82dwl.ondigitalocean.app/v1'
  ↓
Build criado com API URL correto
  ↓
Deploy em Vercel
  ↓
Login chama API correta no DigitalOcean
  ↓
✅ Funciona em produção!
```

## 📋 Configuração de Environments

### Desenvolvimento (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: '/v1',  // Relativo, usa proxy local
};
```

### Produção (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://saas-api-82dwl.ondigitalocean.app/v1',
};
```

## 🚀 Deploy em Produção

1. **Build local para testar:**
```bash
npm run build --configuration=production
```

2. **Verificar que dist/saas-web contém URL correta**

3. **Deploy para Vercel:**
```bash
git push origin main
# Vercel detecta changes e faz deploy automático
```

4. **Ou manual:**
```bash
vercel --prod
```

## ✅ Verificação

Após deploy, abra DevTools (F12) e verifique Network tab:

```
✅ CORRETO: Request URL é https://saas-api-82dwl.ondigitalocean.app/v1/auth/login
❌ ERRADO: Request URL é https://saas-web-five.vercel.app/v1/auth/login
```

## 🔧 Se precisar mudar API em produção

Atualize apenas `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://novo-dominio.com/v1',
};
```

E faça deploy novamente.

## 📊 Comparação

| Antes | Depois |
|-------|--------|
| ❌ API URL errada em produção | ✅ API URL correta |
| ❌ Erro 500 em login | ✅ Login funciona |
| ❌ Frontend e API desacoplados | ✅ Devidamente configurados |

## 🎯 Estrutura Final

```
src/environments/
├── environment.ts          # Dev: /v1 (proxy)
└── environment.prod.ts     # Prod: https://api.com/v1

angular.json
└── configurations.production.fileReplacements
    └── environment.ts → environment.prod.ts
```

## 📚 Referências

- [Angular File Replacements](https://angular.io/guide/build#configuring-application-environments)
- [Build Configurations](https://angular.io/cli/build#options)
