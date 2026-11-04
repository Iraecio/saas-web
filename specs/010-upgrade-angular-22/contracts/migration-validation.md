# Contract: Validação da migração Angular 22

## Instalação

- `npm ci` conclui sem `--force` e sem `--legacy-peer-deps`.
- `npm ls` não relata peers inválidos para Angular, TypeScript, PrimeNG, Material/CDK ou Lucide.

## Testes e build

- `npm test -- --watch=false` conclui com sucesso.
- `npm run build` conclui com sucesso e gera `dist/saas-web/server/server.mjs`.
- O bundle SSR inicia com o script documentado e responde à rota inicial.

## Compatibilidade funcional

- Imports de ícones continuam renderizando os mesmos nomes e tamanhos.
- Rotas, guards, formulários, hidratação e contratos HTTP não mudam.
- Não permanecem referências de runtime ou desenvolvimento ao Angular 21.
