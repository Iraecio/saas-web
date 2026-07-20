# Contract: UI States and Navigation

## Async state

Toda página alterada possui exatamente um estado primário: `loading`, `ready`, `empty`, `error` ou `forbidden`. Mutação possui `idle`, `submitting`, `success` ou `error`. Valores anteriores podem permanecer visíveis durante refresh, mas nunca são substituídos por mocks.

## Formatting

- Centavos: moeda BRL localizada; créditos: inteiro + rótulo “créditos”.
- Datas: timezone do usuário, com valor ISO preservado no modelo.
- Variação sem baseline: “Sem base de comparação”; nunca infinito.
- Estados: badge derivado de enum oficial.

## Navigation matrix

- ADMIN/SUPER_ADMIN: dashboard, usuários, solicitações, pedidos, catálogo, profissionais, saques, revendedores, carteira admin, compras de créditos, relatórios oficiais, armazenamento e configurações conforme RBAC.
- RESELLER/RESELLER_MANAGER: pedidos, catálogo, profissionais, preço/pacotes, compras, estoque, vendas, carteira, armazenamento e configurações conforme permissão.
- VOICE_ACTOR/PRODUCER: pedidos por item, saques, carteira, armazenamento e configurações.
- CLIENT: novo pedido, pedidos, profissionais, carteira e configurações; cliente direto mantém solicitações de papel quando aplicável.

Nenhum menu pode apontar para rota inexistente. Acesso negado é explícito; o wildcard não serve como tratamento de autorização.

## Dashboard cards

Cada cartão mostra rótulo, valor, unidade, período, comparação ou “sem base”, loading skeleton e erro com retry. Pedidos e pendências têm links existentes. Estado vazio é factual.

## Reports

Somente “Movimentação de créditos” para admin e “Vendas e margem” para revenda são exibidos na primeira entrega. Filtros aplicados aparecem na URL ou no estado da página e permanecem ao paginar.
