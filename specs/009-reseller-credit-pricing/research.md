# Research: Configuração de Preços de Créditos do Revendedor

## R-001 — Evoluir o módulo existente

**Decision**: Preservar `/admin/reseller-credits/pricing`, `ResellerCreditService` e os contratos `/reseller/pricing`.

**Rationale**: Preço unitário, compra direta e pacotes já existem; a demanda é de completude e UX, não de novo domínio.

**Alternatives considered**: Criar feature em settings; rejeitada por duplicar navegação e estado.

## R-002 — Dinheiro em centavos

**Decision**: Formulários exibem moeda localizada, mas convertem para centavos inteiros antes do contrato; cálculos de margem usam inteiros e arredondamento somente na apresentação.

**Rationale**: Evita erro de ponto flutuante e segue modelos atuais.

**Alternatives considered**: Persistir decimal digitado; rejeitado por inconsistência monetária.

## R-003 — Prévia no servidor

**Decision**: Alterações críticas solicitam prévia que inclui custo vigente, preço/margem anterior e nova, avisos e versão.

**Rationale**: O custo da plataforma pode mudar enquanto o formulário está aberto; cálculo client-side é informativo, não autoritativo.

**Alternatives considered**: Confirmação somente visual; rejeitada por concorrência e regras comerciais.

## R-004 — Versão e idempotência

**Decision**: Configuração e pacotes carregam `version`; comandos exigem versão e chave de idempotência.

**Rationale**: RESELLER e RESELLER_MANAGER podem editar simultaneamente.

**Alternatives considered**: Last-write-wins; rejeitada por sobrescrever decisões recentes.

## R-005 — Tabela e cards

**Decision**: Tabela semântica no desktop, redução de colunas no tablet e cards no smartphone; filtros inline no desktop e drawer no mobile.

**Rationale**: Comparação de margens favorece tabela, enquanto cards evitam scroll horizontal e alvos pequenos.

**Alternatives considered**: Tabela com scroll em todos os tamanhos; rejeitada pelos requisitos mobile.

## R-006 — Query state

**Decision**: Busca, filtros, ordenação, página e tamanho ficam na URL; seleção é transitória.

**Rationale**: Permite reload, voltar e compartilhamento sem persistir dados sensíveis.

**Alternatives considered**: Local storage para consulta; rejeitado por gerar estado oculto.

## R-007 — Histórico imutável

**Decision**: Alterações de preço criam nova versão/evento; pacotes desativados permanecem consultáveis e vendas mantêm snapshots.

**Rationale**: Rastreabilidade comercial e financeira exige preservar valores anteriores.

**Alternatives considered**: Atualizar valores sem trilha; rejeitado por auditoria.

## R-008 — Lote por consulta

**Decision**: Seleção pode conter IDs ou query fingerprint com exclusões, seguida de prévia no servidor.

**Rationale**: Suporta muitos pacotes sem transportar todos os IDs e revalida elegibilidade.

**Alternatives considered**: IDs somente; aceitável para página, insuficiente para todos os resultados.

## R-009 — Estados e acessibilidade

**Decision**: Skeleton inicial, conteúdo preservado no refetch, erros locais, live regions moderadas, foco restaurado e redução de movimento.

**Rationale**: Configuração combina formulário, lista, drawer e dialogs com feedback assíncrono.

**Alternatives considered**: Spinner central e toast; rejeitados por remover contexto e oferecer feedback efêmero.
