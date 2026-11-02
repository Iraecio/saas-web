# Feature Specification: Painel Administrativo Completo de Pedidos

**Feature Branch**: `008-order-admin`

**Created**: 2026-08-16

**Status**: Draft

**Input**: Modernizar o painel de pedidos do superadmin com visão global, gerenciamento completo, responsividade, acessibilidade, filtros persistentes e estados de interface abrangentes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar todos os pedidos (Priority: P1)

Como superadmin, quero consultar pedidos de todos os clientes em uma visão global para localizar rapidamente casos que exigem acompanhamento.

**Why this priority**: A visão global, pesquisável e confiável é a base operacional do módulo e entrega valor mesmo antes das mutações administrativas.

**Independent Test**: Autenticar como superadmin, acessar Pedidos e localizar um pedido de qualquer cliente combinando busca, filtros, ordenação e paginação, tanto no desktop quanto no smartphone.

**Acceptance Scenarios**:

1. **Given** pedidos de clientes e revendas diferentes, **When** o superadmin abre a listagem, **Then** vê uma visão global paginada com identificação do pedido, cliente, profissional, tipo, valor, origem, status, prazo e atualização.
2. **Given** uma lista extensa, **When** combina busca por identificador ou pessoa com filtros de status, tipo, origem, cliente, profissional e período, **Then** recebe somente os registros correspondentes e vê os filtros ativos.
3. **Given** filtros, ordenação, página e densidade selecionados, **When** atualiza a página ou compartilha a URL, **Then** o contexto da consulta é restaurado.
4. **Given** um smartphone, **When** consulta os mesmos pedidos, **Then** vê cards priorizados sem rolagem horizontal e acessa filtros em drawer.
5. **Given** zero resultados para a consulta, **When** a carga termina, **Then** vê um estado vazio contextual com opção de limpar filtros.

---

### User Story 2 - Examinar o pedido em profundidade (Priority: P1)

Como superadmin, quero uma visão completa de cada pedido para compreender pessoas, itens, valores, prazos, arquivos, histórico e ocorrências antes de agir.

**Why this priority**: Decisões administrativas seguras dependem de contexto integral e rastreável.

**Independent Test**: Abrir um pedido com múltiplos itens, alterações e entregas e conferir resumo, participantes, composição financeira, briefing, arquivos, linha do tempo e auditoria.

**Acceptance Scenarios**:

1. **Given** um pedido existente, **When** abre o detalhe, **Then** vê resumo prioritário e seções de cliente, profissionais, itens, valores, prazos, briefing, entregas, disputa e histórico, conforme aplicável.
2. **Given** uma seção que falha isoladamente, **When** as demais carregam, **Then** o conteúdo disponível permanece utilizável e a seção com erro oferece nova tentativa.
3. **Given** um pedido atualizado por outro usuário, **When** o superadmin tenta agir com dados antigos, **Then** é informado do conflito, pode revisar o estado atual e nenhuma alteração é sobrescrita silenciosamente.
4. **Given** um arquivo ou áudio, **When** o superadmin solicita acesso, **Then** recebe feedback de carregamento, erro ou indisponibilidade e os controles possuem nomes acessíveis.

---

### User Story 3 - Executar ações administrativas seguras (Priority: P2)

Como superadmin, quero executar as ações permitidas para o estado atual do pedido com prévia, justificativa e confirmação para resolver exceções sem perder rastreabilidade.

**Why this priority**: Transforma a consulta em gerenciamento completo, mas depende da visão confiável entregue nas histórias anteriores.

**Independent Test**: Em um pedido elegível, abrir uma ação crítica, revisar impacto, informar justificativa, confirmar e verificar o novo estado e o evento de auditoria.

**Acceptance Scenarios**:

1. **Given** um pedido, **When** o menu de ações é aberto, **Then** somente ações compatíveis com seu estado e permissões são habilitadas, com motivo visível para indisponibilidades relevantes.
2. **Given** uma ação crítica, **When** o superadmin a inicia, **Then** vê impacto, registros afetados e consequências antes de confirmar.
3. **Given** confirmação válida com justificativa quando exigida, **When** a ação é enviada, **Then** os controles ficam protegidos contra envio duplicado e o resultado é anunciado visualmente e por leitor de tela.
4. **Given** erro de validação, permissão, sessão, conexão ou conflito, **When** a ação falha, **Then** os dados informados são preservados quando seguro e a recuperação adequada é oferecida.

---

### User Story 4 - Operar pedidos em lote (Priority: P2)

Como superadmin, quero selecionar pedidos e aplicar operações compatíveis em lote para reduzir trabalho repetitivo.

**Why this priority**: Aumenta produtividade operacional sem comprometer a segurança das ações individuais.

**Independent Test**: Selecionar pedidos da página ou de toda a consulta, solicitar uma ação, revisar elegíveis e ignorados, confirmar e acompanhar o resultado por registro.

**Acceptance Scenarios**:

1. **Given** uma consulta, **When** seleciona registros visíveis ou todos os resultados filtrados, **Then** a interface diferencia claramente os dois escopos e informa a quantidade.
2. **Given** pedidos em estados distintos, **When** escolhe uma ação em lote, **Then** uma prévia separa elegíveis de inelegíveis e explica os motivos.
3. **Given** uma ação em andamento, **When** parte dos registros falha, **Then** o relatório final apresenta sucessos e falhas individualmente, sem declarar sucesso total.
4. **Given** alteração dos filtros ou saída da tela, **When** há seleção ativa, **Then** a interface solicita confirmação antes de descartá-la.

---

### User Story 5 - Personalizar e exportar a visão (Priority: P3)

Como superadmin, quero ajustar colunas e exportar o conjunto filtrado para adequar a tela à tarefa e apoiar análises externas.

**Why this priority**: Melhora eficiência e análise, sem bloquear os fluxos essenciais de consulta e gestão.

**Independent Test**: Reordenar ou ocultar colunas, restaurar a visualização após novo acesso e exportar a consulta respeitando filtros e permissão.

**Acceptance Scenarios**:

1. **Given** a tabela desktop, **When** escolhe colunas e densidade, **Then** a preferência é restaurada no próximo acesso do mesmo usuário.
2. **Given** uma consulta filtrada, **When** exporta, **Then** o arquivo representa o escopo informado e a interface comunica preparação, sucesso ou falha.
3. **Given** uma exportação grande, **When** o processamento não é imediato, **Then** o superadmin pode continuar usando a listagem e acompanhar o estado da exportação.

### Edge Cases

- O pedido pode não possuir profissional atribuído, prazo, revenda, entrega ou disputa; a ausência deve ser indicada sem quebrar a composição.
- Datas inicial e final inválidas, limites invertidos e termos excessivamente longos devem produzir erros associados aos campos.
- Mudança de página, ordenação ou filtro deve cancelar ou ignorar respostas antigas para impedir dados fora de contexto.
- Registros podem mudar ou desaparecer entre seleção, prévia e execução em lote; a confirmação deve usar o estado atual.
- Um pedido pode conter múltiplos itens com estados diferentes; status e ações do pedido não podem ocultar divergências dos itens.
- Perda de conexão deve preservar filtros e formulários não sensíveis e oferecer nova tentativa após reconexão.
- Sessão expirada deve interromper mutações, conduzir à autenticação e restaurar a rota segura após novo login.
- Acesso direto por URL sem papel `SUPER_ADMIN` deve resultar em acesso negado, sem revelar dados.
- Conteúdo longo, identificadores, nomes e traduções não podem causar rolagem horizontal da página.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE restringir rota, consultas, exportações e mutações administrativas de pedidos ao papel `SUPER_ADMIN`.
- **FR-002**: A listagem DEVE abranger pedidos de todos os clientes autorizados, sem depender do contexto de uma revenda.
- **FR-003**: No desktop, a listagem DEVE usar tabela com: seleção, pedido, cliente, profissional/responsável, tipo/itens, origem, créditos/valor, prazo, status, atualização e ações.
- **FR-004**: A busca DEVE localizar por identificador do pedido, nome ou e-mail do cliente e nome do profissional, com acionamento explícito ou atraso controlado.
- **FR-005**: Os filtros DEVEM incluir status, tipo, origem/escopo, cliente, profissional, revenda, período de criação, prazo e situação de atraso.
- **FR-006**: A listagem DEVE permitir ordenação por criação, atualização, prazo e valor, indicando campo e direção.
- **FR-007**: A paginação DEVE ocorrer no servidor, permitir tamanhos configurados e informar intervalo e total quando disponível.
- **FR-008**: Busca, filtros, ordenação e página DEVEM ser persistidos em parâmetros de URL; preferências pessoais de colunas e densidade DEVEM ser persistidas separadamente.
- **FR-009**: No smartphone, a listagem DEVE usar cards sem rolagem horizontal, exibindo primeiro pedido, cliente, status, valor, prazo e principal ação; filtros DEVEM abrir em drawer.
- **FR-010**: No tablet, a interface DEVE adaptar densidade e colunas, movendo filtros para painel recolhível quando necessário.
- **FR-011**: Cada registro DEVE oferecer acesso ao detalhe e às ações permitidas sem exigir navegação desnecessária.
- **FR-012**: O detalhe DEVE consolidar resumo, participantes, itens, valores, carteira/origem, prazos, briefing, pronunciamentos, entregas, disputa, histórico e auditoria conforme disponibilidade.
- **FR-013**: A interface DEVE derivar ações do papel, estado do pedido e estado de seus itens e DEVE explicar ações indisponíveis quando isso ajudar a decisão.
- **FR-014**: Ações críticas DEVEM exigir prévia de impacto, confirmação explícita e justificativa quando houver efeito financeiro, cancelamento, disputa, reatribuição ou alteração excepcional.
- **FR-015**: Mutações DEVEM impedir envio duplicado, apresentar progresso e atualizar lista, detalhe, contadores e auditoria após conclusão.
- **FR-016**: O sistema DEVE detectar conflito de atualização e apresentar o estado atual antes de permitir nova tentativa, sem sobrescrita silenciosa.
- **FR-017**: A seleção em lote DEVE suportar página atual e todos os resultados filtrados, mantendo a distinção de escopo visível.
- **FR-018**: Antes de executar um lote, o sistema DEVE apresentar total, elegíveis, inelegíveis, impacto e justificativa; ao final, DEVE fornecer resultado por registro.
- **FR-019**: A exportação DEVE respeitar filtros, ordenação, escopo de acesso e seleção declarada, sem incluir dados não exibíveis ao superadmin.
- **FR-020**: A listagem e o detalhe DEVEM possuir estados distintos para carregando, carregado, vazio, erro recuperável, sem conexão, acesso negado e sessão expirada.
- **FR-021**: Formulários e ações DEVEM representar erro de validação, ação em andamento, sucesso, falha e conflito, preservando entradas quando seguro.
- **FR-022**: Carregamentos iniciais DEVEM usar skeleton estrutural; atualizações subsequentes DEVEM manter conteúdo anterior quando isso não induzir a erro e indicar atualização em curso.
- **FR-023**: Feedback transitório DEVE ser acompanhado por mudança persistente no conteúdo ou mensagem consultável, não apenas por toast.
- **FR-024**: Toda funcionalidade DEVE operar nos temas claro e escuro com contraste adequado e status identificados também por texto e ícone.
- **FR-025**: Todos os controles DEVEM ser navegáveis por teclado, possuir foco visível, nome acessível, ordem lógica e áreas de toque adequadas.
- **FR-026**: Tabelas DEVEM usar cabeçalhos semânticos; drawers, diálogos, menus e anúncios DEVEM usar semântica e ARIA somente quando necessário.
- **FR-027**: Erros de formulário DEVEM ser associados aos respectivos campos e anunciados; o foco DEVE ir ao primeiro erro após submissão inválida.
- **FR-028**: Animações DEVEM respeitar a preferência de redução de movimento, sem remover feedback essencial.
- **FR-029**: Ações e filtros principais DEVEM permanecer acessíveis no mobile sem cobrir conteúdo nem depender de hover.
- **FR-030**: O sistema DEVE registrar no histórico administrativo ator, data, ação, justificativa e resultado de cada mutação individual ou em lote.

### Interface State Contract

| Estado | Comportamento esperado |
|---|---|
| Carregando | Skeleton equivalente à tabela, cards ou seções; controles destrutivos indisponíveis. |
| Dados carregados | Conteúdo, total, contexto da consulta e última atualização disponíveis. |
| Lista vazia | Mensagem contextual, distinção entre ausência total e zero resultados, ação de recuperação. |
| Erro de carregamento | Mensagem no local afetado, referência útil e botão de tentar novamente. |
| Erro de validação | Resumo opcional, mensagem junto ao campo e foco no primeiro erro. |
| Ação em andamento | Controle com progresso, bloqueio contra duplicidade e conteúdo estável. |
| Ação concluída | Confirmação anunciada e dados afetados atualizados. |
| Acesso negado | Página dedicada sem dados sensíveis e caminho seguro de retorno. |
| Sessão expirada | Interrupção segura, autenticação e retorno à rota sem repetir mutação. |
| Sem conexão | Indicador persistente, preservação de estado local seguro e nova tentativa. |
| Conflito | Comparação ou resumo do estado atual, atualização dos dados e nova decisão explícita. |
| Alterado por terceiro | Identificação de que os dados mudaram e horário/ator quando autorizado. |

### Key Entities

- **Pedido administrativo**: Agregado global do pedido, seus participantes, origem, totais, status, prazos e datas de controle.
- **Item do pedido**: Unidade de serviço com profissional, tipo, custo, repasse, status, versões e prazo próprios.
- **Participante**: Cliente, profissional, revenda ou ator administrativo relacionado ao pedido.
- **Consulta de pedidos**: Busca, filtros, ordenação, paginação e preferências de apresentação.
- **Seleção em lote**: Escopo explícito por identificadores ou por consulta, exclusões e contagem corrente.
- **Prévia de ação**: Resultado não destrutivo com impacto, elegibilidade, alertas e versão dos registros.
- **Execução administrativa**: Ação individual ou em lote com justificativa, progresso, resultados e conflitos.
- **Evento de auditoria**: Registro imutável de ator, ação, alvo, justificativa, estado anterior/posterior e data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste de usabilidade, pelo menos 90% dos superadmins localizam um pedido específico e identificam seu estado em até 60 segundos na primeira tentativa.
- **SC-002**: Consultas com até 100 mil pedidos apresentam feedback em até 1 segundo e conteúdo utilizável em até 2 segundos no percentil 95, sob condições operacionais acordadas.
- **SC-003**: Pelo menos 95% das tarefas frequentes de filtrar, abrir detalhe e executar uma ação exigem no máximo três interações principais após entrar no módulo.
- **SC-004**: 100% das ações críticas testadas exibem impacto e exigem confirmação antes da execução.
- **SC-005**: 100% dos cenários de sucesso parcial em lote identificam corretamente cada registro bem-sucedido e cada falha.
- **SC-006**: A interface é utilizável sem rolagem horizontal de página entre 320 px e 1440 px, com tabela no desktop e cards no smartphone.
- **SC-007**: Os fluxos essenciais podem ser concluídos somente por teclado e não apresentam violações críticas nas verificações automatizadas de acessibilidade.
- **SC-008**: Claro, escuro e redução de movimento preservam legibilidade, foco e feedback em todos os estados definidos.
- **SC-009**: Recarregar ou compartilhar uma URL restaura integralmente a consulta; preferências pessoais são restauradas para o mesmo usuário.
- **SC-010**: Nenhum teste de concorrência sobrescreve uma alteração mais recente sem informar conflito e solicitar nova decisão.

## Assumptions

- O papel existente `SUPER_ADMIN` é o único autorizado à visão global nesta entrega.
- O módulo atual de pedidos e seus fluxos por papel serão preservados; a experiência administrativa será acrescentada sem ampliar permissões dos demais papéis.
- A API poderá receber contratos aditivos para busca global, agregados, paginação, prévias, lotes, exportação e controle de versão; nenhuma regra financeira será reproduzida apenas no frontend.
- “Gerenciamento total” significa disponibilizar todas as ações administrativas que as regras de negócio autorizarem, nunca edição arbitrária de saldo, histórico ou estado.
- Preferências visuais podem ser armazenadas por usuário; dados sensíveis e resultados completos não serão persistidos no navegador.
- O horário será apresentado no fuso do usuário, preservando a referência temporal original para auditoria.

## Out of Scope

- Alterar regras financeiras, limites de revisão ou máquina de estados sem contrato de negócio aprovado.
- Editar ou apagar eventos históricos e arquivos originais.
- Disponibilizar a visão global para ADMIN, RESELLER ou outros papéis.
- Comunicação externa automática por e-mail, SMS ou push.
- Analytics avançado além dos indicadores operacionais necessários à lista e ao detalhe.
