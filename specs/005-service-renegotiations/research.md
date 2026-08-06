# Research: Gestão de serviços e renegociações

## Decisão 1 — Reutilizar o domínio existente

**Decision**: Manter `features/services`, `ServiceCatalogService`, os formulários e as rotas de auditoria; a nova página raiz apenas orquestra as duas abas.

**Rationale**: O projeto já contém CRUD, ativação, filtros básicos e auditoria. Uma migração de framework ou duplicação de feature aumentaria risco sem entregar valor.

**Alternatives considered**: Criar um módulo administrativo separado; reescrever toda a área. Rejeitados por duplicarem autorização, modelos e navegação.

## Decisão 2 — Abas orientadas pela URL

**Decision**: Representar aba e filtros importantes em query parameters (`tab`, `status`, `role`, `service`, `period`, `search`).

**Rationale**: Preserva contexto em recarga, histórico do navegador e links compartilháveis, além de permanecer compatível com SSR.

**Alternatives considered**: Estado somente em signals. Rejeitado porque desaparece ao voltar ou recarregar.

## Decisão 3 — Fila administrativa agregada

**Decision**: Adicionar à API uma leitura paginada de renegociações administrativas que já inclua profissional, serviço, oferta vigente, etapa atual e contadores.

**Rationale**: A API atual oferece histórico apenas por par profissional/serviço. Montar uma fila no frontend exigiria listar serviços, listar profissionais de cada serviço e buscar históricos individualmente, violando a meta de duas requisições e tornando paginação/ordenação inconsistentes.

**Alternatives considered**: Agregação N+1 no frontend; carregar somente IDs pendentes retornados por serviço. Rejeitados por custo, dados insuficientes e experiência incompleta.

## Decisão 4 — Reusar endpoints atuais para decisões

**Decision**: Aprovar, negar e contrapor continuam usando os endpoints por associação e negociação já implementados pela `saas-api`.

**Rationale**: Eles já concentram autorização, máquina de estados, transação e alteração do preço vigente.

**Alternatives considered**: Criar endpoints de mutação duplicados na fila administrativa. Rejeitado por risco de divergência das regras financeiras.

## Decisão 5 — Painel lateral para análise

**Decision**: Abrir o detalhe em painel lateral responsivo; em telas pequenas ele ocupa a viewport e mantém retorno explícito à lista.

**Rationale**: Mantém a fila como contexto, comporta linha do tempo e formulários sem sobrecarregar cada linha.

**Alternatives considered**: Modal central; página separada para toda decisão; ações inline completas. Modal limita conteúdo, página perde contexto e inline torna a lista densa.

## Decisão 6 — Atualização conservadora após mutação

**Decision**: Bloquear apenas a negociação em processamento, aplicar a resposta oficial ao detalhe/lista e revalidar contadores; em conflito de estado, recarregar o item.

**Rationale**: Evita duplo envio e mantém a interface responsiva sem simular um resultado financeiro antes da confirmação da API.

**Alternatives considered**: Otimismo integral antes da resposta; recarregar toda a página. Rejeitados por risco financeiro e perda de contexto.

## Decisão 7 — Responsividade por mudança de representação

**Decision**: Usar tabela densa em desktop e cards semânticos em telas estreitas, compartilhando o mesmo conjunto de ações e estados.

**Rationale**: Comprimir uma tabela financeira para 320 px prejudica leitura; cards permitem ordem informacional e alvos de toque adequados.

**Alternatives considered**: Rolagem horizontal obrigatória; ocultar colunas. Rejeitados por descoberta ruim e perda de informação essencial.

## Decisão 8 — Testes focados em risco

**Decision**: Cobrir paths/payloads no serviço, sincronização URL/estado, permissão de ações, máquina de apresentação e estados responsivos essenciais.

**Rationale**: Os maiores riscos são chamar o endpoint errado, habilitar decisão para ator incorreto e apresentar estado obsoleto.

**Alternatives considered**: Apenas snapshot visual ou somente build. Insuficientes para validar contratos e regras de interação.
