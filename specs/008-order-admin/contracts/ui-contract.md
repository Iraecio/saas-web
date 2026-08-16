# UI Contract: Painel Administrativo de Pedidos

## Rotas e autorização

- `/admin/orders/manage`: lista global; guard `SUPER_ADMIN`.
- `/admin/orders/manage/:id`: detalhe global; guard `SUPER_ADMIN`.
- Rotas devem preceder `:id` em `orders.routes.ts`.
- Usuário autenticado sem papel vê acesso negado; sessão ausente/expirada segue o fluxo central de autenticação.

## Desktop (>= 1024 px)

- Cabeçalho com título, resumo operacional e exportação.
- Barra de busca e filtros frequentes visíveis; filtros adicionais em popover/painel.
- Tabela semântica com colunas padrão: seleção, pedido, cliente, profissional, tipo/itens, origem, valor, prazo, status, atualização e ações.
- Cabeçalho de ordenação comunica campo/direção. Linha inteira não substitui link ou botão nomeado.
- Barra de lote fixa dentro da área de conteúdo somente durante seleção.

## Tablet (768–1023 px)

- Busca permanece visível; filtros migram para painel recolhível.
- Colunas secundárias são ocultadas em ordem: atualização, origem, tipo detalhado e profissional; dados continuam no detalhe rápido.
- Ações ficam em menu com principal ação visível quando houver espaço.

## Smartphone (< 768 px)

- Um card por pedido, sem tabela nem rolagem horizontal.
- Ordem do card: código + status; cliente; valor + origem; prazo/atraso; profissional/tipo; ação principal + menu.
- Busca ocupa largura disponível; filtros abrem drawer de tela quase inteira com Aplicar e Limpar persistentes.
- Seleção usa checkbox nomeado no card; barra de lote respeita safe area e não cobre a última linha.

## Estados

- Primeira carga: skeleton com dimensões próximas ao conteúdo final.
- Refetch: conteúdo existente permanece com indicador `Atualizando`; resultados antigos nunca substituem consulta nova.
- Vazio sem filtros: explicar ausência de pedidos. Vazio filtrado: mostrar chips e `Limpar filtros`.
- Erro: painel no escopo afetado, mensagem, identificador de suporte quando existir e `Tentar novamente`.
- Offline: banner persistente; mutações indisponíveis; formulários seguros preservados.
- Conflito: diálogo não destrutivo resume mudanças, oferece `Ver dados atuais`; repetir ação exige nova prévia.

## Interação e acessibilidade

- Alvos de toque com pelo menos 44 × 44 CSS px quando isolados.
- Foco retorna ao acionador ao fechar drawer/menu/dialog; ao remover linha, vai ao próximo alvo lógico.
- Dialog crítico tem título, descrição de impacto, campo de justificativa e botões semanticamente ordenados.
- Mudanças de resultado e progresso usam região `aria-live="polite"`; falhas impeditivas usam alerta sem repetição excessiva.
- Status combina texto, ícone/forma e cor. Prazo atrasado inclui texto `Atrasado`.
- Respeitar `prefers-reduced-motion`; skeleton não pulsa nessa preferência.

## Persistência

- URL: `q`, filtros, `sort`, `direction`, `page`, `pageSize`.
- Preferência por usuário: colunas, ordem e densidade, com versão de schema.
- Seleção não sobrevive a reload; tentativa de mudar consulta com seleção solicita descarte.
