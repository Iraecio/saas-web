# UI Contract: Configuração de Preços do Revendedor

## Rota e composição

- Rota preservada: `/admin/reseller-credits/pricing`.
- Guard: `RESELLER` e `RESELLER_MANAGER`.
- Ordem: cabeçalho e estado do canal; cards de custo/preço/margem; formulário; pacotes; histórico.

## Desktop

- Overview em quatro indicadores comparáveis.
- Formulário e prévia financeira lado a lado.
- Filtros de pacotes visíveis; tabela com seleção, nome, créditos, preço total, unitário, margem, status, atualização e ações.
- Barra de lote aparece somente com seleção.

## Tablet

- Overview em duas colunas; formulário empilhável.
- Filtros em painel recolhível; tabela reduz colunas secundárias.
- Ações principais mantêm alvo mínimo de toque.

## Smartphone

- Overview em duas colunas compactas; formulário em uma coluna.
- Pacotes em cards: créditos/preço, margem, status e ação principal.
- Filtros em drawer com `Aplicar` e `Limpar`; sem rolagem horizontal da página.
- Barra de seleção respeita safe area e não cobre o último card.

## Estados

- Skeleton estrutural na primeira carga; `Atualizando` preserva dados atuais.
- Vazio inicial convida a criar primeiro pacote; vazio filtrado oferece limpar filtros.
- Erros ficam no escopo afetado com retry; validação fica junto aos campos.
- Offline bloqueia mutações e preserva rascunho seguro.
- Conflito mostra preço/custo atuais e retorna ao formulário; repetir exige nova prévia.
- Sucesso atualiza overview/lista e permanece legível na página.

## Acessibilidade

- Inputs monetários têm label, ajuda, `inputmode=decimal` e erro associado.
- Dialog de confirmação possui título, impacto, valores anterior/novo e foco contido/restaurado.
- Status e margem usam texto/ícone além de cor.
- Tabela usa cabeçalhos e `aria-sort`; seleção possui nome com pacote/quantidade.
- Mudanças assíncronas relevantes usam `aria-live=polite` sem anúncios duplicados.
- `prefers-reduced-motion` remove animações não essenciais.

## Persistência

- URL: busca, filtros, ordenação, página e tamanho.
- Preferências por usuário: densidade e colunas, versionadas e SSR-safe.
- Rascunho de preço pode sobreviver à perda de conexão na sessão, mas nunca inclui tokens ou dados de pagamento.
