# Research: Administração completa de carteiras

## Workspace em vez de telas isoladas

**Decision**: Organizar o módulo como workspace com overview acionável, listagem principal e detalhe 360°, mantendo disputas, estornos, conciliação e auditoria acessíveis por filtros e seções contextuais.

**Rationale**: O módulo atual fragmenta tarefas e força navegação repetida. O workspace reduz cliques sem remover URLs especializadas existentes.

**Alternatives considered**: Manter páginas independentes sem contexto compartilhado; concentrar tudo em um único dashboard longo. A primeira mantém fragmentação; a segunda prejudica foco, carregamento e navegação móvel.

## Tabela no desktop e cards no mobile

**Decision**: Usar tabela comparativa a partir do desktop, reduzir colunas e mover ações no tablet, e usar cards sem rolagem horizontal no smartphone.

**Rationale**: Carteiras exigem comparação de valores no desktop, mas tabelas extensas sacrificam leitura e toque em telas estreitas.

**Alternatives considered**: Tabela responsiva com scroll horizontal; cards em todos os breakpoints. Scroll oculta contexto e ações; cards no desktop reduzem densidade e comparação.

## Estado de consulta compartilhável

**Decision**: Manter busca, filtros, ordenação, página, tamanho e período nos query parameters; manter seleção em lote e rascunhos críticos apenas durante a sessão.

**Rationale**: URLs restauráveis suportam voltar do detalhe, recarregar e compartilhar investigações sem persistir dados sensíveis ou seleções obsoletas.

**Alternatives considered**: Estado apenas em memória; persistência total local. O primeiro perde contexto; o segundo pode restaurar seleções perigosas ou desatualizadas.

## Carregamento e falha independentes

**Decision**: Carregar overview/lista e resumo do detalhe de forma prioritária, com módulos secundários em paralelo e repetição isolada.

**Rationale**: Uma falha em auditoria ou disputas não deve impedir leitura do saldo e identidade da carteira.

**Alternatives considered**: Uma requisição monolítica; muitas requisições por linha. A primeira amplia impacto de falha; a segunda cria N+1.

## Mutações compensatórias e concorrência otimista

**Decision**: Proibir edição direta do saldo. Toda mudança usa operação explícita, motivo, prévia, chave idempotente e versão esperada; conflito retorna snapshot atual.

**Rationale**: Carteiras são domínio financeiro e exigem trilha imutável, prevenção de duplo envio e proteção contra sobrescrita concorrente.

**Alternatives considered**: Campo editável de saldo; bloqueio pessimista prolongado. Edição destrói rastreabilidade; locks longos prejudicam operação e recuperação.

## Seleção e lote

**Decision**: Suportar seleção explícita por IDs e seleção lógica de todos os resultados do filtro, sempre com prévia e revalidação no servidor.

**Rationale**: Selecionar somente a página limita eficiência; enviar milhares de IDs é frágil. Um snapshot lógico do filtro permite escala e auditoria.

**Alternatives considered**: Seleção apenas da página; ação imediata sem prévia. Ambas elevam erro operacional.

## Acessibilidade e feedback

**Decision**: Usar HTML semântico, foco restaurado após dialogs/drawers, regiões de status, descrição textual de estados, alvos de toque adequados e animações desativáveis.

**Rationale**: Ações administrativas complexas precisam permanecer compreensíveis por teclado, leitor de tela e em situações de baixa visão ou mobilidade.

**Alternatives considered**: Adicionar ARIA indiscriminadamente; comunicar status apenas por cor/toast. ARIA excessiva conflita com semântica nativa e toasts isolados podem não ser percebidos.
