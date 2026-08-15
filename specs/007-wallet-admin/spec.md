# Feature Specification: Administração completa de carteiras

**Feature Branch**: `007-wallet-admin`

**Created**: 2026-08-15

**Status**: Draft

**Input**: User description: "Modernizar o painel administrativo de carteiras do superadmin, permitindo visualização completa e gerenciamento das carteiras de todos os papéis, com listagens, filtros, responsividade, acessibilidade e tratamento abrangente dos estados da interface."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Localizar e compreender qualquer carteira (Priority: P1)

Como superadmin, quero consultar todas as carteiras em uma listagem rica e abrir uma visão consolidada de cada uma para entender rapidamente o saldo, o proprietário, a origem dos créditos, reservas, expirações e riscos operacionais.

**Why this priority**: A visão global e confiável é a base para qualquer investigação ou ação administrativa e elimina consultas fragmentadas em diferentes módulos.

**Independent Test**: Pode ser validada listando carteiras de usuários com papéis distintos, combinando busca, filtros, ordenação e paginação, e abrindo um detalhe completo sem executar alterações.

**Acceptance Scenarios**:

1. **Given** carteiras de clientes, revendedores, gestores, profissionais e administradores, **When** o superadmin acessa o painel, **Then** vê indicadores globais e uma listagem paginada com proprietário, papel, escopo, saldos disponível/reservado/expirando, situação e última movimentação.
2. **Given** uma lista extensa, **When** o superadmin pesquisa por nome, e-mail ou identificador e combina papel, situação, faixa de saldo, origem e período, **Then** os resultados, a contagem e os totais refletem os filtros aplicados.
3. **Given** filtros e ordenação ativos, **When** o superadmin navega para um detalhe e retorna, recarrega a página ou compartilha a URL, **Then** o contexto da listagem é preservado.
4. **Given** uma carteira selecionada, **When** o detalhe é aberto, **Then** resumo, composição do saldo, movimentações, reservas, créditos, disputas, estornos e auditoria ficam acessíveis em seções claras, com falhas independentes por seção.

---

### User Story 2 - Executar ações administrativas seguras (Priority: P2)

Como superadmin, quero emitir, cancelar, ajustar, congelar ou liberar créditos e tratar pendências da carteira com confirmação e rastreabilidade para corrigir situações operacionais sem comprometer a integridade financeira.

**Why this priority**: Depois de localizar e diagnosticar uma carteira, o superadmin precisa resolver o problema no mesmo fluxo, com proteções proporcionais ao risco.

**Independent Test**: Pode ser validada executando cada ação sobre uma carteira de teste, verificando confirmação, motivo obrigatório, feedback, atualização de saldos e registro de auditoria; também deve rejeitar versões desatualizadas.

**Acceptance Scenarios**:

1. **Given** uma carteira válida, **When** o superadmin inicia uma ação crítica, **Then** vê o impacto estimado, informa um motivo e confirma explicitamente antes da execução.
2. **Given** uma ação concluída, **When** a resposta é recebida, **Then** o painel anuncia o sucesso, atualiza apenas os dados afetados e disponibiliza o identificador da operação para auditoria.
3. **Given** que a carteira mudou após ser carregada, **When** o superadmin confirma uma ação com versão antiga, **Then** a alteração é recusada, os dados atuais são apresentados e nenhuma mutação parcial ocorre.
4. **Given** uma disputa, estorno ou divergência pendente, **When** o superadmin toma uma decisão, **Then** o resultado, as observações, o ator, a data e os efeitos financeiros ficam registrados.

---

### User Story 3 - Operar várias carteiras com eficiência (Priority: P3)

Como superadmin, quero selecionar carteiras e aplicar ações em lote permitidas para reduzir trabalho repetitivo em operações de revisão, exportação e manutenção.

**Why this priority**: Ações em lote aumentam a eficiência em grandes volumes, mas dependem da listagem e das salvaguardas das ações individuais.

**Independent Test**: Pode ser validada selecionando resultados em páginas diferentes, revisando o resumo do lote, executando uma ação permitida e conferindo resultados individuais, inclusive falhas parciais.

**Acceptance Scenarios**:

1. **Given** uma listagem filtrada, **When** o superadmin seleciona registros visíveis ou todos os resultados elegíveis, **Then** a interface informa claramente quantidade, escopo da seleção e ações disponíveis.
2. **Given** uma ação em lote confirmada, **When** alguns registros não são elegíveis ou sofrem conflito, **Then** cada resultado é reportado separadamente e os demais registros válidos seguem a política transacional definida para a ação.
3. **Given** uma seleção ativa, **When** filtros incompatíveis mudam ou a sessão expira, **Then** a seleção é limpa e o superadmin recebe uma explicação acessível.

---

### User Story 4 - Acompanhar saúde e anomalias das carteiras (Priority: P4)

Como superadmin, quero visualizar indicadores, tendências e alertas acionáveis para priorizar carteiras com saldo inconsistente, reservas antigas, créditos próximos do vencimento ou volume atípico.

**Why this priority**: A camada analítica ajuda a antecipar incidentes e direciona o superadmin para as situações de maior impacto.

**Independent Test**: Pode ser validada com um conjunto conhecido de carteiras contendo anomalias, confirmando indicadores, filtros temporais, atalhos para listas filtradas e estados sem dados.

**Acceptance Scenarios**:

1. **Given** dados de carteiras no período selecionado, **When** o painel carrega, **Then** apresenta totais, distribuição por papel e situação, créditos emitidos/consumidos/reservados/expirados e pendências de conciliação.
2. **Given** um alerta ou indicador, **When** o superadmin o ativa, **Then** navega para a listagem já filtrada pelos registros correspondentes.

### Edge Cases

- Carteira ainda não criada para um usuário elegível deve ser distinguida de saldo zero e oferecer apenas ações válidas.
- Saldos muito altos, zero, negativos por inconsistência histórica e valores com unidades diferentes não podem ser truncados ou confundidos.
- Usuário bloqueado ou removido mantém histórico visível, mas ações incompatíveis ficam desabilitadas com justificativa.
- Créditos parcialmente consumidos, reservados, vencidos ou em disputa devem apresentar composição sem dupla contagem.
- Mudança de papel ou revenda durante a consulta deve gerar atualização ou conflito explícito.
- Falha em uma seção do detalhe não deve ocultar as demais seções já carregadas.
- Perda de conexão durante uma mutação deve manter estado indeterminado até consulta segura do resultado, evitando repetição acidental.
- Resultados podem mudar entre páginas; seleção em lote deve usar identificadores estáveis e revalidar elegibilidade no momento da ação.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST restringir o painel e todas as ações administrativas desta feature ao papel superadmin.
- **FR-002**: O sistema MUST listar carteiras de todos os papéis de usuário, incluindo clientes, revendedores, gestores, locutores, produtores, administradores e superadmins.
- **FR-003**: A listagem MUST apresentar proprietário, e-mail, papel, revenda/escopo, situação da conta e da carteira, saldo total, disponível, reservado, a expirar e data da última movimentação.
- **FR-004**: O superadmin MUST poder buscar por nome, e-mail, identificador de usuário ou carteira.
- **FR-005**: O superadmin MUST poder filtrar por papel, revenda/escopo, situação, faixa de saldo, existência de reservas, créditos próximos do vencimento, divergência, origem de crédito e período de movimentação.
- **FR-006**: O superadmin MUST poder ordenar por proprietário, saldo, valor reservado, valor a expirar, criação e última movimentação.
- **FR-007**: A listagem MUST usar paginação no servidor, informar total de resultados e manter filtros, busca, ordenação e página na URL.
- **FR-008**: A versão desktop MUST usar tabela configurada para leitura comparativa; a versão smartphone MUST usar cards sem rolagem horizontal; tablet MUST adaptar densidade e ações ao espaço disponível.
- **FR-009**: Cada registro MUST oferecer acesso ao detalhe e apenas as ações que forem válidas para seu estado e permissões.
- **FR-010**: O detalhe MUST apresentar resumo, composição do saldo, lotes/créditos, movimentações, reservas, disputas, estornos, conciliação e auditoria em seções navegáveis.
- **FR-011**: O sistema MUST carregar o resumo do detalhe em uma operação e permitir carregamento, repetição e erro independentes para seções secundárias.
- **FR-012**: O superadmin MUST poder emitir créditos com tipo, origem, quantidade/valor, expiração opcional e motivo.
- **FR-013**: O superadmin MUST poder cancelar créditos elegíveis, ajustar saldo mediante operação compensatória, congelar/liberar valores elegíveis e decidir disputas, estornos e correções de conciliação.
- **FR-014**: Toda ação financeira ou irreversível MUST exibir resumo do impacto, exigir motivo, pedir confirmação explícita e impedir duplo envio.
- **FR-015**: Toda mutação MUST registrar ator, motivo, antes/depois, data, carteira, registros afetados e identificador correlacionável.
- **FR-016**: Mutações MUST usar a versão corrente da carteira; conflitos MUST recarregar dados e explicar que outro usuário ou processo alterou o registro.
- **FR-017**: O superadmin MUST poder selecionar registros visíveis ou todos os resultados elegíveis do filtro para ações em lote de exportação, revisão/reconciliação e outras operações explicitamente permitidas.
- **FR-018**: Ações em lote MUST mostrar prévia, quantidade, impacto agregado, elegibilidade e resultado por registro, sem ocultar falhas parciais.
- **FR-019**: O painel MUST apresentar indicadores globais e do conjunto filtrado, incluindo saldos, reservas, expirações, emissão, consumo, divergências e distribuição por papel.
- **FR-020**: Indicadores e alertas MUST funcionar como atalhos para a listagem com filtros correspondentes.
- **FR-021**: Toda listagem e seção MUST tratar carregamento com skeleton, dados, vazio, erro recuperável, ausência de conexão e atualização manual.
- **FR-022**: Toda ação MUST apresentar estados em andamento, sucesso, erro de validação, erro operacional e resultado indeterminado por perda de conexão.
- **FR-023**: A interface MUST tratar acesso negado, sessão expirada e redirecionamento seguro sem expor dados previamente carregados a usuários não autorizados.
- **FR-024**: Controles MUST ser operáveis por teclado, ter foco visível, nomes acessíveis, labels e mensagens de erro associadas; estados não podem depender apenas de cor.
- **FR-025**: Mensagens dinâmicas relevantes MUST ser anunciadas a leitores de tela e componentes complexos MUST usar semântica ou ARIA apropriadas.
- **FR-026**: O painel MUST manter contraste adequado nos temas claro e escuro e respeitar a preferência de redução de movimento.
- **FR-027**: Alvos de toque e ações principais MUST permanecer acessíveis em smartphones, com filtros em drawer e ações secundárias em menu claramente rotulado.
- **FR-028**: O sistema MUST preservar unidades financeiras/créditos sem arredondamento silencioso e apresentar formatação consistente com a origem do valor.
- **FR-029**: O sistema MUST oferecer exportação do conjunto filtrado com identificação dos filtros, horário de geração e colunas compatíveis com a permissão do superadmin.
- **FR-030**: Alterações de filtros, paginação e seções MUST evitar perda de trabalho em formulários ou confirmações abertas.

### Key Entities

- **Carteira administrativa**: Visão da carteira associada ao usuário, incluindo identidade do proprietário, papel, escopo, situação, saldos agregados, versão e datas relevantes.
- **Componente de saldo**: Parcela disponível, reservada, congelada, consumida, vencida ou próxima do vencimento, sem dupla contagem.
- **Crédito/lote**: Unidade rastreável de crédito com origem, tipo, valor inicial e restante, vigência, situação e vínculos operacionais.
- **Movimentação**: Evento financeiro ou operacional que altera ou explica a composição da carteira, com valores, origem, referência e data.
- **Ação administrativa**: Solicitação individual ou em lote com tipo, motivo, impacto previsto, ator, versão esperada e resultado.
- **Pendência**: Disputa, estorno, reserva, divergência de conciliação ou anomalia que exige acompanhamento ou decisão.
- **Registro de auditoria**: Evidência imutável de leitura crítica ou mutação, incluindo contexto, antes/depois e correlação.
- **Consulta de carteiras**: Busca, filtros, ordenação, paginação e seleção persistidos que definem o conjunto exibido ou exportado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste de usabilidade, pelo menos 90% dos superadmins localizam uma carteira específica e identificam sua composição de saldo em até 60 segundos, sem assistência.
- **SC-002**: Busca, filtro, ordenação e troca de página exibem resposta ou feedback de carregamento em até 1 segundo e resultados utilizáveis em até 2 segundos para até 100 mil carteiras.
- **SC-003**: 100% das ações críticas apresentam impacto, motivo e confirmação antes da execução e deixam registro de auditoria consultável.
- **SC-004**: 100% dos conflitos de versão impedem sobrescrita silenciosa e orientam o superadmin a revisar os dados atuais.
- **SC-005**: As jornadas de localizar, detalhar e agir sobre uma carteira podem ser concluídas em desktop, tablet e smartphone sem rolagem horizontal da página.
- **SC-006**: Todas as funções principais são concluídas apenas por teclado e os fluxos críticos passam por avaliação automatizada e manual de acessibilidade sem barreiras de severidade alta.
- **SC-007**: Uma falha em módulo secundário do detalhe não impede o acesso ao resumo nem a repetição isolada da seção afetada.
- **SC-008**: Ações em lote com até 1.000 carteiras apresentam prévia e relatório individual de resultados, sem perda de seleção não explicitamente descartada.
- **SC-009**: Estados de carregamento, vazio, erro, offline, acesso negado, sessão expirada, conflito e sucesso são reproduzíveis e possuem orientação acionável.

## Assumptions

- A carteira é única por usuário, independentemente do papel, e valores continuam armazenados na menor unidade inteira aplicável.
- A primeira entrega é exclusiva do superadmin; administradores comuns não herdam acesso automaticamente.
- Emissão, cancelamento, disputas, estornos, conciliação, analytics e auditoria existentes serão reutilizados e ampliados de forma compatível.
- Ajustes de saldo serão sempre compensatórios e auditáveis; não haverá edição direta de saldo ou exclusão de histórico.
- Ações em lote financeiras serão limitadas às operações explicitamente aprovadas pelo servidor e revalidarão cada carteira.
- Exportações serão assíncronas quando o conjunto ultrapassar o limite seguro de geração imediata.
- A feature não altera regras de compra, venda, saque ou expiração de créditos; apenas oferece administração e visibilidade sobre seus efeitos.
