# Quickstart: Dashboard Administrativo com Dados Oficiais

## Prerequisites

- API e frontend configurados conforme seus `.env`/`.env.local`.
- Banco migrado e populado com usuários dos papéis necessários.
- Node/npm nas versões aceitas pelos projetos.

## Start locally

```bash
cd ../saas-api
npm run start:local
npm run db:migrate:local
npm run db:seed:local

cd ../saas-web
npm run start:local
```

## Validation order

1. **Wallet**: login como ADMIN e SUPER_ADMIN; validar listas, offset, decisões e restrições. Login como usuário e validar carteira única, cursor, disputa e estorno.
2. **Orders**: login como CLIENT; criar pedido com dois itens. Atribuir um item como gestor, aceitar/entregar como profissional e aprovar como cliente. Confirmar que o outro item não mudou.
3. **Credit trade**: login como RESELLER; registrar compra. Confirmar como ADMIN, verificar estoque, vender ao cliente e conferir margem.
4. **Dashboard**: criar dados nos períodos atual/anterior; comparar cartões, pedidos recentes e pendências com as telas fonte. Testar período anterior zero.
5. **Navigation/reports**: percorrer menus dos sete papéis; nenhuma rota deve cair silenciosamente no wildcard. Relatórios visíveis devem carregar dados reais.

## Automated checks

```bash
cd ../saas-api
npm test
npm run build

cd ../saas-web
npm test -- --watch=false
npm run build
```

Executar também testes focados dos serviços/components alterados durante cada fase, sem aguardar a conclusão de todas as fases.

## Resultado da implementação

- API: 63 suítes e 718 testes aprovados; build Nest concluído.
- Frontend: 7 arquivos de teste e 22 testes aprovados; build production SSR e prerender de 55 rotas concluídos.
- Busca estática: nenhum endpoint legado abrangido pela matriz e nenhum gerador de dados mockados encontrado nas áreas administrativas alteradas.
- Avisos remanescentes do build são preexistentes e não bloqueantes: depreciação do `@import` Sass e orçamento CSS do componente `magic-cube`.

## Done checklist

- Nenhum endpoint removido permanece no código frontend.
- Nenhum valor estático/fictício permanece no dashboard, overview, revendedores ou relatórios abrangidos.
- Todos os paths/verbos correspondem à matriz de integração.
- Ações sensíveis são ocultadas e rejeitadas conforme papel.
- Loading, empty, error, forbidden e retry foram exercitados.
- Build SSR e suíte da API passam.
