# UI Contract: Administração de profissionais

## List route

`/admin/professionals` com filtros em query parameters. Desktop usa tabela; abaixo do breakpoint tablet usa cards. Cabeçalho inclui indicadores e ação de filtros. Filtros mobile abrem em drawer com contagem ativa, aplicar e limpar.

Colunas: seleção, profissional, função/escopo, revenda, verificação, conta, pedidos ativos, carteira, último acesso e ações. Ordenação em nome, último acesso, pedidos e carteira.

Ações por registro: abrir, editar, alterar escopo, bloquear/reativar, resetar senha e inspecionar. Ações em lote: bloquear/reativar e verificação quando elegível.

## Detail route

`/admin/professionals/:userId?section=overview|profile|services|orders|wallet|audit`. Cabeçalho fixo contextual com identidade, status e ações. Seções carregam independentemente e exibem skeleton/empty/error próprios.

## Critical actions

Confirmação mostra alvo, consequência e campo de motivo. Botão destrutivo começa desabilitado até validação. Em `409`, apresentar registro atualizado e opções recarregar/cancelar; nunca sobrescrever automaticamente.

## Inspection

Antes de iniciar, confirmação explica somente leitura, duração e auditoria. Durante inspeção, banner global contrastante mostra alvo, papel, contagem regressiva e “Voltar ao superadmin”. Banner não pode ser fechado sem encerrar. Ações mutáveis aparecem desabilitadas com explicação.

## States

- Loading: skeleton com geometria final.
- Empty: contextual, com limpar filtros quando aplicável.
- Error/offline: preserva dados anteriores, oferece tentar novamente.
- Access denied/session expired: mensagem direta e rota segura.
- Processing/success: feedback junto ao registro e anúncio acessível.
- Conflict: comparação e recarga.
- Partial bulk result: resumo + lista de falhas.

## Accessibility/responsiveness

Tabela semântica, cards com títulos, drawer/dialog com foco preso e retorno, menus por teclado, `aria-live` para resultados. Alvos de toque ≥44 px. Status usa texto/ícone além de cor. Respeitar `prefers-reduced-motion` e tokens light/dark existentes.
