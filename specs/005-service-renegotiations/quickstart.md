# Quickstart: Gestão de serviços e renegociações

## Prerequisites

- `saas-api` local com catálogo e precificação profissional disponíveis.
- Endpoint agregado definido em `contracts/admin-negotiations-api.md` implementado antes da integração final.
- Usuários de teste: superadmin, revendedor, gerente de revenda, locutor e produtor; ao menos duas revendas para validar isolamento.

## Run

```bash
npm install
npm run start:local
```

Abrir `/admin/services` autenticado como superadmin ou gestor de revenda.

## Validation scenarios

1. Abrir `?tab=services`, pesquisar por nome, combinar filtros e confirmar resumo/lista.
2. Criar e editar um serviço autorizado; confirmar impacto quando houver mudança comercial.
3. Alternar ativo/inativo e verificar atualização sem recarga total.
4. Abrir `?tab=renegotiations`, filtrar locutor/produtor e selecionar uma pendência.
5. Aceitar uma proposta do profissional e confirmar preço/contadores atualizados.
6. Negar outra proposta com motivo e confirmar preço preservado.
7. Enviar contraproposta; confirmar linha do tempo e estado "aguardando profissional".
8. Simular decisão concorrente e verificar atualização do estado oficial.
9. Como revendedor, tentar URL de negociação de outra rede e confirmar bloqueio sem vazamento de dados.
10. Repetir jornadas em 320, 768 e 1440 px, temas claro/escuro e somente teclado.

## Automated checks

```bash
npm test -- --watch=false
npm run build
npm run format:check
```

## Expected result

- Serviços e renegociações funcionam como incrementos independentes.
- Nenhuma mutação envia `resellerId` ou valor decimal.
- Estados pendentes oferecem ações somente ao decisor correto.
- A build SSR conclui sem erro e as rotas podem ser prerenderizadas com estado inicial seguro.
