# Quickstart: validar a remediação Vercel

```bash
npm ci
npm ls @vercel/node
npm audit
npm run format:check
npm test -- --watch=false
npm run build
```

Depois do build, iniciar `npm run serve:ssr` e validar `/`, `/v1/resellers`, `/v1/resellers/1` e `/v1/resellers/inexistente`.

## Evidências de validação (2026-11-04)

- `npm ci`: 436 pacotes instalados; 0 vulnerabilidades.
- `npm ls @vercel/node --all`: árvore vazia, confirmando a remoção da dependência direta e transitiva.
- `npm audit --json`: 0 vulnerabilidades em todos os níveis.
- Teste focado do adaptador: 1 arquivo e 2 testes aprovados.
- Suíte completa: 21 arquivos e 79 testes aprovados.
- `npm run build`: bundle browser/SSR de produção gerado e 5 rotas prerenderizadas.
- Smoke SSR: `/` 200, `/v1/resellers` 200, `/v1/resellers/1` 200, `/v1/resellers/inexistente` 404 e asset JavaScript 200.
- `vercel.json`: JSON válido; `api/handler.ts`: typecheck isolado aprovado.
- Prettier da feature, `npm run format:check` e `git diff --check`: aprovados.

## Risco residual

O deploy remoto não faz parte desta validação local. O teste de contrato cobre a fronteira Vercel/SSR e o smoke usa o mesmo bundle produzido para execução em Node; um preview deployment continua recomendado antes da promoção para produção.
