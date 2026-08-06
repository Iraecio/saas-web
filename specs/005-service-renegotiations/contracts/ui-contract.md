# UI Contract: Catálogo administrativo

## Rota e abas

- Rota base: `/admin/services`.
- `?tab=services` é o padrão; `?tab=renegotiations` abre a fila.
- Filtros ficam em query parameters e são limpos por aba para evitar combinações inválidas.
- A contagem de pendências aparece no rótulo da aba sem depender apenas de cor.

## Aba Serviços

- Cabeçalho com título, descrição contextual e ação primária autorizada.
- Resumo: total, ativos, inativos, locução e produção.
- Busca e filtros: tipo, escopo e estado.
- Desktop: tabela com cabeçalho persistente e menu de ações por linha.
- Mobile: cards com dados essenciais e ações no mesmo fluxo de leitura.
- Criar/editar preserva as rotas existentes; auditoria permanece acessível por serviço.
- Ações destrutivas ou de impacto exigem confirmação contextual.

## Aba Renegociações

- Resumo: aguardando gestor, aguardando profissional e finalizadas.
- Filtros: busca, status, tipo profissional, serviço e período.
- Ordem padrão: solicitações que aguardam gestor, da mais antiga para a mais recente; demais por atualização recente.
- Cada item mostra profissional, função, serviço, preço vigente, proposta, variação, nota, tempo e próximo ator.
- Ações rápidas aparecem apenas em `PENDING + PROFESSIONAL + nextActor MANAGER`.

## Painel de detalhes

- Abre sem abandonar a fila e tem título associado ao profissional/serviço.
- Move foco para o título ao abrir, prende foco enquanto modal em mobile e devolve foco ao acionador ao fechar.
- Mostra resumo comercial, oferta ativa/inativa e linha do tempo cronológica.
- Aceitar exige confirmação; negar exige motivo; contrapor exige valor positivo e confirma unidade monetária.
- Durante envio, apenas a negociação atual fica bloqueada e o botão comunica progresso.
- Após sucesso, atualiza resumo, linha do tempo, fila e contadores.

## Estados

- Loading: skeletons com a forma do resumo, filtros e resultados.
- Empty: mensagem específica para ausência total ou filtros sem resultado, com ação de limpar filtros.
- Error: mensagem inline com tentativa novamente; uma aba com erro não impede abrir a outra.
- Conflict: avisa que a solicitação mudou, fecha ações inválidas e recarrega o estado oficial.
- Permission: ação omitida preventivamente; `403` recebido resulta em mensagem direta e retorno seguro à lista.

## Acessibilidade e temas

- Abas usam semântica `tablist`, `tab`, `tabpanel`, `aria-selected` e navegação por setas.
- Menus, painel e confirmações têm nome acessível e ordem de foco previsível.
- Status incluem texto/ícone; nenhuma informação depende apenas de cor.
- Alvos de toque têm no mínimo 44×44 px em telas estreitas.
- Temas claro e escuro usam tokens globais de canvas, surface, foreground, muted, border, brand, danger e warning.
- Movimentos respeitam `prefers-reduced-motion`.
