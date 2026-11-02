# UI Contract: Administração completa de carteiras

## Navegação

- `/admin/wallet-admin`: overview com indicadores e alertas.
- `/admin/wallet-admin/wallets`: listagem com estado integral nos query parameters.
- `/admin/wallet-admin/wallets/:walletId`: detalhe 360°; seção ativa em query parameter.
- URLs legadas de créditos, disputas, estornos, conciliação, auditoria e analytics permanecem funcionais e redirecionam ou reutilizam filtros equivalentes.
- A rota inteira exige `SUPER_ADMIN`; links não aparecem para outros papéis.

## Listagem

### Desktop

Tabela com seleção, proprietário, papel/escopo, disponível, reservado/congelado, a expirar, situação, última movimentação e ações. Cabeçalho de ordenação tem nome acessível e estado anunciado.

### Tablet

Mantém tabela compacta com proprietário, papel, saldo, alertas e ações; dados secundários migram para expansão por linha ou detalhe.

### Smartphone

Cards apresentam proprietário/papel, saldo disponível, reservado/a expirar, status e alerta principal. Ação primária abre detalhe; ações secundárias ficam em menu rotulado. Não há scroll horizontal.

Filtros usam painel lateral no desktop e drawer modal no mobile, com aplicar, limpar e contagem. Busca possui debounce, botão de limpar e envio imediato por Enter.

## Estados

- **Loading**: skeleton preserva geometria da região; não anuncia cada item.
- **Ready**: conteúdo e total são anunciados de forma sucinta após atualização.
- **Empty**: diferencia ausência global de ausência causada por filtros e oferece ação adequada.
- **Error**: mantém dados anteriores quando seguros, descreve o problema e oferece repetição local.
- **Validation error**: foco vai ao resumo; cada erro fica associado ao controle.
- **Action pending**: alvo e confirmação ficam bloqueados contra duplo envio, com progresso textual.
- **Success**: região `status`, atualização focal e link para operação/auditoria.
- **Forbidden**: nenhum dado administrativo é exibido; navegação volta a área permitida.
- **Session expired**: dados em memória são limpos e retorno pós-login não repete mutação.
- **Offline**: leitura anterior pode ser marcada como desatualizada; mutações permanecem indisponíveis.
- **Conflict/stale**: dialog apresenta resumo do que mudou e opções de revisar/cancelar; nunca confirma automaticamente.
- **Unknown result**: consulta idempotente em andamento antes de permitir nova tentativa.

## Ações críticas

Fluxo: ação → formulário validado → prévia de antes/delta/depois → confirmação explícita → execução → resultado. Motivo é obrigatório; confirmação destrutiva nomeia a ação e o alvo. O foco retorna ao acionador ou ao primeiro resultado relevante.

## Ações em lote

Barra fixa informa quantidade e modo da seleção. “Todos os resultados” explicita que inclui páginas não visíveis. Prévia separa elegíveis e inelegíveis. Resultado oferece contagens, filtros de falha e exportação do relatório.

## Acessibilidade

- Ordem de foco acompanha a ordem visual; skip link alcança conteúdo e regiões principais têm headings.
- Controles nativos são preferidos; ARIA complementa drawers, dialogs, menus, tabs, live regions e tabelas ordenáveis.
- Status usa ícone, texto e cor; contraste mínimo aplicável é mantido nos dois temas.
- Alvos interativos têm pelo menos 44 × 44 px no touch.
- Animações não essenciais são removidas com `prefers-reduced-motion`.
- Alterações de rota, total, erro, conflito e conclusão são anunciadas sem excesso.
