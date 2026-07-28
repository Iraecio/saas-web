# Contract: UI States and Navigation

## Async state

Toda página alterada possui exatamente um estado primário: `loading`, `ready`, `empty`, `error` ou `forbidden`. Mutação possui `idle`, `submitting`, `success` ou `error`. Valores anteriores podem permanecer visíveis durante refresh, mas nunca são substituídos por mocks.

## Formatting

- Centavos: moeda BRL localizada; créditos: inteiro + rótulo “créditos”.
- Datas: timezone do usuário, com valor ISO preservado no modelo.
- Variação sem baseline: “Sem base de comparação”; nunca infinito.
- Estados: badge derivado de enum oficial.

## Navigation matrix

- SUPER_ADMIN: dashboard, usuários, solicitações, pedidos, catálogo, profissionais, saques, revendedores, carteira admin, compras de créditos, relatórios oficiais, armazenamento global e configurações conforme RBAC.
- ADMIN: dashboard, usuários, solicitações, pedidos, catálogo, profissionais, saques, revendedores, carteira admin, compras de créditos, relatórios oficiais e configurações conforme RBAC; sem armazenamento.
- RESELLER/RESELLER_MANAGER: pedidos, catálogo, profissionais, preço/pacotes, compras, estoque, vendas, carteira e configurações conforme permissão; sem armazenamento.
- VOICE_ACTOR/PRODUCER: pedidos por item, saques, carteira e configurações; sem armazenamento.
- CLIENT: novo pedido, pedidos, profissionais, carteira e configurações; cliente direto mantém solicitações de papel quando aplicável.

A rota e o menu de armazenamento são exclusivos de SUPER_ADMIN. A visão corresponde ao consumo global gerado por pedidos e pelas demais funcionalidades do SaaS, não a cotas ou arquivos pessoais dos usuários.

Nenhum menu pode apontar para rota inexistente. Acesso negado é explícito; o wildcard não serve como tratamento de autorização.

## Dashboard cards

Cada cartão mostra rótulo, valor, unidade, período, comparação ou “sem base”, loading skeleton e erro com retry. Pedidos e pendências têm links existentes. Estado vazio é factual.

## Reports

Somente “Movimentação de créditos” para admin e “Vendas e margem” para revenda são exibidos na primeira entrega. Filtros aplicados aparecem na URL ou no estado da página e permanecem ao paginar.
