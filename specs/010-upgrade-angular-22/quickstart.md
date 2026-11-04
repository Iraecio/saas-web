# Quickstart: Validar Angular 22

## Pré-requisitos

- Node.js `^22.22.3`, `^24.15.0` ou `^26.0.0`
- npm 11 ou outra versão suportada pelo Angular CLI 22

## Validação

```bash
npm ci
npm ls @angular/core @angular/cli @angular/ssr @angular/material primeng @lucide/angular typescript
npm test -- --watch=false
npm run build
npm run serve:ssr
```

Após iniciar o SSR, acessar a aplicação e validar login, rota administrativa, formulário, listagem e acesso direto a uma rota. O servidor deve responder sem erro de renderização e a página deve se tornar interativa no navegador.

## Evidências da migração (2026-11-03)

- Ambiente: Node 24.15.0 e npm 11.12.1.
- `npm ci`: concluído, 575 pacotes instalados a partir do lockfile.
- `npm ls`: Angular core 22.2.4; CLI/build/SSR/Material/CDK 22.2.5; PrimeNG 22.1.4; TypeScript 6.0.3; `@lucide/angular` 1.67.0; nenhum peer inválido.
- `npm test -- --watch=false`: 20 arquivos e 77 testes aprovados com Vitest 4.1.12.
- `npm run build`: aprovado sem avisos; 5 rotas pré-renderizadas e bundle SSR gerado em `dist/saas-web/server/server.mjs`.
- Smoke SSR: `/` redirecionou para `/admin/dashboard`, que respondeu HTTP 200 com 28.474 bytes de HTML.
- `git diff --check`: aprovado.
- Busca por `21.2` e `lucide-angular` nos manifests, README e código-fonte: nenhuma referência remanescente.

## Risco residual

- O aviso Sass foi eliminado ao substituir `@import 'tailwindcss'` por `@use 'tailwindcss'`.
- Os budgets de aviso foram calibrados para 525 kB no bundle inicial e 23 kB por estilo de componente, acima da baseline atual (512,41 kB e 22,42 kB) e abaixo dos limites de erro preservados (1 MB e 25 kB).
- `npm run format:check` passa em todo o código-fonte.
- `npm audit fix` reduziu o relatório de 19 para 9 vulnerabilidades: 3 moderadas, 5 altas e 1 crítica. Todas as restantes transitam por `@vercel/node@3.2.29`; a correção indicada pelo npm instala `@vercel/node@29.0.1`, uma mudança principal que requer migração e validação de deploy separadas. Não foi usado `npm audit fix --force`.
