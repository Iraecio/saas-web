# Quickstart: Validar o Painel Administrativo de Pedidos

## Pré-condições

- Contas `SUPER_ADMIN` e de papel não autorizado.
- Pedidos de múltiplos clientes, revendas, tipos e estados, incluindo sem profissional, atrasado, disputado e com múltiplos itens.
- API com contratos de `contracts/order-admin-api.md` e conjunto suficiente para paginação.

## Cenário 1 — Consulta global

1. Entrar como `SUPER_ADMIN` e abrir `/admin/orders/manage`.
2. Confirmar tabela desktop, totais e ausência de pedidos fora da autorização apenas quando aplicável.
3. Buscar por código, cliente e profissional; combinar status, origem e período.
4. Ordenar, mudar página e recarregar; confirmar restauração pela URL.
5. Usar voltar/avançar e abrir URL em nova aba; confirmar a mesma consulta.

## Cenário 2 — Breakpoints e temas

1. Validar 1440, 1024, 768, 390 e 320 px nos temas claro e escuro.
2. Confirmar tabela no desktop, redução no tablet e cards/drawer no smartphone.
3. Confirmar ausência de rolagem horizontal da página, truncamento destrutivo e sobreposição da barra de lote.
4. Ativar redução de movimento e confirmar que o feedback permanece compreensível.

## Cenário 3 — Detalhe e falhas parciais

1. Abrir pedido completo e conferir todas as seções e ações disponíveis.
2. Simular falha em auditoria ou mídia; confirmar que o resumo continua utilizável e a seção permite retry.
3. Abrir pedido sem profissional/prazo/disputa e conferir estados de ausência.

## Cenário 4 — Ação e conflito

1. Iniciar ação crítica, conferir prévia, elegibilidade, impacto e justificativa.
2. Confirmar bloqueio de envio duplicado e atualização após sucesso.
3. Em outra sessão, alterar o pedido entre prévia e execução.
4. Confirmar 409, apresentação do estado atual e exigência de nova decisão.

## Cenário 5 — Lote e exportação

1. Selecionar registros da página e depois todos os resultados filtrados; conferir diferença de escopo.
2. Executar prévia com elegíveis e inelegíveis; validar os motivos.
3. Simular sucesso parcial e conferir resultado individual.
4. Exportar consulta e acompanhar preparação sem bloquear a listagem.

## Cenário 6 — Acessibilidade e resiliência

1. Concluir busca, filtros, detalhe e ação usando apenas teclado.
2. Conferir foco ao abrir/fechar menus, drawer e diálogo e associação de erros aos campos.
3. Usar leitor de tela para status, ordenação, seleção e progresso.
4. Simular offline, erro 503, acesso negado e sessão expirada.
5. Confirmar preservação segura do contexto e que mutações não são repetidas após login.

## Verificações automatizadas

```bash
npm test -- --watch=false
npm run format:check
npm run build
```

Na API irmã, executar os testes do módulo order para autorização, consulta, prévia, lote, auditoria e concorrência antes do build.
