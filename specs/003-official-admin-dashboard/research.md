# Research: Dashboard Administrativo com Dados Oficiais

## 1. Fonte de dados do dashboard

**Decision**: Criar uma leitura agregada protegida para ADMIN/SUPER_ADMIN, calculada sob demanda a partir das tabelas e serviços oficiais, sem nova tabela de resumo.

**Rationale**: Garante uma fotografia coerente, reduz chamadas do navegador e centraliza definições de período e pendência. O volume atual não justifica materialização.

**Alternatives considered**: Compor no frontend (latência e inconsistência); persistir snapshots (migração, sincronização e atraso); ampliar wallet analytics para dados não financeiros (acoplamento indevido).

## 2. Significado financeiro

**Decision**: O dashboard mostra movimentação em créditos (`issued`, `spent`, `refunded`, `expired`) e valores comerciais disponíveis em compras/vendas, sempre com unidade explícita. Não chama isso de receita contábil quando a fonte não sustenta esse conceito.

**Rationale**: A API não possui razão contábil ou integração completa de pagamentos. Rotular créditos como reais seria enganoso.

**Alternatives considered**: Inferir receita por créditos gastos; somar pedidos; manter o mock “Receita (mês)”. Todas foram rejeitadas por falta de definição oficial.

## 3. Períodos e comparação

**Decision**: Dashboard aceita `from` e `to` ISO; o padrão é o mês civil atual no fuso configurado da aplicação. O comparativo usa intervalo imediatamente anterior de mesma duração. Denominador zero resulta em `variationPercent: null` e `comparisonLabel: "NO_BASELINE"`.

**Rationale**: Evita infinito e torna comparações reproduzíveis.

**Alternatives considered**: Últimos 30 dias fixos; comparação anual; cálculo local no navegador.

## 4. Estratégias de paginação

**Decision**: Preservar a estratégia oficial por domínio: cursor para extrato de créditos; `limit/offset` para wallet-admin, refunds e auditoria; `page/limit` para usuários, compras e vendas.

**Rationale**: Uma abstração única hoje mascara parâmetros inválidos. Adaptadores de serviço podem expor um view model comum sem alterar o wire contract.

**Alternatives considered**: Padronizar toda a API nesta feature; continuar enviando `page` a endpoints de offset. A primeira amplia escopo e a segunda é incorreta.

## 5. Pedidos e arquivos

**Decision**: Criar pedidos em JSON com `items[]`. Arquivos são enviados pelo módulo de Storage e suas referências entram no briefing/entrega conforme os contratos vigentes; ações operam por `orderId + itemId`.

**Rationale**: O controller atual não recebe o multipart legado e todas as transições pertencem ao item.

**Alternatives considered**: Adaptar o backend ao multipart antigo; criar um pedido por serviço; manter ações no agregado. Todas contradizem o modelo composto.

## 6. Comércio de créditos da revenda

**Decision**: Remover a experiência `emit/emissions` e implementar preço/configuração/pacotes, compra, confirmação administrativa, estoque FIFO, venda e relatório de margem.

**Rationale**: Este é o ciclo vigente e já implementado na API.

**Alternatives considered**: Renomear emissão para venda sem estoque; chamar emissão manual do wallet admin. Ambas ignoram custo, lote e RBAC.

## 7. Estado e carregamento no frontend

**Decision**: Serviços retornam contratos tipados; páginas mantêm signals explícitos para `loading`, `data`, `error` e filtros. Dashboard recebe uma resposta agregada e permite retry total; seções opcionais carregam estados vazios sem dados substitutos.

**Rationale**: Compatível com Angular standalone/OnPush e SSR, sem nova store global.

**Alternatives considered**: Nova biblioteca de state management; múltiplas chamadas independentes no componente.

## 8. Relatórios iniciais

**Decision**: Disponibilizar somente analytics de créditos e vendas/margens da revenda, conforme papel. Auditoria permanece consulta operacional, não exportação. Botões sem fonte são removidos.

**Rationale**: Atende a regra “dados oficiais ou nada” e evita prometer exportações inexistentes.

**Alternatives considered**: Gerar CSV apenas no cliente; manter placeholders “em breve”; criar BI genérico.

## 9. Testes e rollout

**Decision**: Testar contratos nos serviços frontend, autorização/cálculos na API, componentes críticos e jornadas por papel. Entregar por fases A–E, mantendo cada fase compilável.

**Rationale**: Os maiores riscos são financeiros, RBAC e transições de estado; testes apenas de build não detectam endpoints divergentes.

**Alternatives considered**: Uma troca integral sem fases; apenas testes manuais.

## Clarifications

Nenhuma pendência. Todas as decisões necessárias foram resolvidas pela API atual, pela spec e pelas premissas registradas.
