# Feature Specification: Dashboard Administrativo com Dados Oficiais

**Feature Branch**: `003-official-admin-dashboard`

**Created**: 2026-07-20

**Status**: Draft

**Input**: User description: "Desenvolver, na ordem recomendada, a correção dos contratos de carteira e paginação, a migração dos pedidos para itens, a substituição da emissão antiga pelo fluxo de compra, estoque e venda de créditos, a disponibilização de dados agregados do dashboard, a remoção de mocks e a correção de menus, rotas e relatórios."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Operações financeiras confiáveis (Priority: P1)

Como administrador ou superadministrador, quero consultar e executar operações de carteira usando os dados e comportamentos oficiais do sistema, para que saldos, créditos, disputas, estornos, reconciliações, auditorias, emissões e cancelamentos não falhem nem apresentem informações enganosas.

**Why this priority**: Operações financeiras incorretas têm o maior risco operacional e podem provocar decisões, saldos ou ações administrativas indevidas.

**Independent Test**: Um administrador pode percorrer todas as telas de carteira permitidas ao seu papel, consultar resultados paginados e concluir uma operação autorizada, observando o mesmo resultado após atualizar a página.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado, **When** ele consulta carteiras, créditos, disputas, estornos, reconciliações ou auditoria, **Then** a tela apresenta exclusivamente dados oficiais, com filtros e paginação coerentes com o total disponível.
2. **Given** uma disputa ou solicitação de estorno pendente, **When** um administrador executa uma decisão válida, **Then** o novo estado oficial é exibido e permanece após recarregar a tela.
3. **Given** um superadministrador autenticado, **When** ele emite ou cancela créditos com dados válidos, **Then** a operação é registrada e refletida no saldo, no extrato e na auditoria.
4. **Given** um administrador sem autorização para uma ação exclusiva de superadministrador, **When** ele acessa a área correspondente, **Then** a ação não é oferecida e nenhuma operação é enviada.

---

### User Story 2 - Pedidos compostos operacionais (Priority: P2)

Como cliente, profissional ou gestor, quero criar, acompanhar e movimentar cada item de um pedido conforme meu papel, para que pedidos com um ou vários serviços sigam o fluxo oficial sem depender do modelo antigo de pedido único.

**Why this priority**: Pedidos são o núcleo operacional do produto e o fluxo atual não representa a unidade real de trabalho.

**Independent Test**: Um cliente cria um pedido com itens e, para um item selecionado, os participantes autorizados conseguem realizar as transições até sua conclusão, consultando também seu histórico.

**Acceptance Scenarios**:

1. **Given** um cliente com saldo e dados válidos, **When** ele cria um pedido com um ou mais itens, **Then** cada item aparece com serviço, briefing, preço congelado, responsável e estado próprios.
2. **Given** um item aguardando atribuição, **When** um gestor autorizado seleciona um profissional elegível, **Then** a atribuição aparece no detalhe do item.
3. **Given** um item em um estado que permite determinada ação, **When** o participante autorizado executa essa ação, **Then** somente o item escolhido muda de estado e o histórico registra a transição.
4. **Given** um participante sem autorização ou um estado incompatível, **When** ele tenta executar uma ação, **Then** a interface não oferece a ação inválida e apresenta uma mensagem clara se a condição mudar durante a operação.

---

### User Story 3 - Ciclo comercial de créditos da revenda (Priority: P3)

Como revendedor, quero configurar preços e pacotes, comprar créditos da plataforma, acompanhar meu estoque e vender créditos aos meus clientes, para operar o ciclo comercial vigente com custos e margens reais.

**Why this priority**: O fluxo existente representa um modelo de emissão que não faz mais parte das regras de negócio oficiais.

**Independent Test**: Um revendedor consegue acompanhar o preço vigente, registrar uma compra, visualizar sua evolução até o estoque e realizar uma venda válida, consultando depois o relatório e a margem resultante.

**Acceptance Scenarios**:

1. **Given** um revendedor autenticado, **When** ele acessa a área de créditos, **Then** vê preço vigente, configuração comercial, pacotes, compras, estoque e vendas disponíveis ao seu papel.
2. **Given** uma compra registrada e confirmada administrativamente, **When** o revendedor consulta seu estoque, **Then** o lote correspondente aparece com quantidade, origem e custo oficiais.
3. **Given** estoque suficiente e um cliente elegível, **When** o revendedor realiza uma venda, **Then** o estoque é reduzido e a venda aparece no relatório com custo, receita e margem.
4. **Given** estoque insuficiente ou dados inválidos, **When** o revendedor tenta vender, **Then** nenhuma venda parcial ou enganosa é exibida e o motivo do impedimento é informado.

---

### User Story 4 - Visão administrativa oficial (Priority: P4)

Como administrador, quero abrir o dashboard e visualizar indicadores, tendências, pedidos recentes e pendências calculados a partir dos registros oficiais, para priorizar o trabalho sem consultar várias telas ou interpretar números fictícios.

**Why this priority**: A visão consolidada gera valor somente depois que os domínios financeiros e operacionais usados como fonte estão confiáveis.

**Independent Test**: Após criar dados controlados no período atual e anterior, o administrador abre o dashboard e confere que todos os cartões, comparações, listas e alertas correspondem aos registros de origem.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado, **When** ele abre o dashboard, **Then** vê usuários ativos, pedidos do dia, resultado financeiro definido, profissionais disponíveis, comparação com o período anterior e horário da última atualização.
2. **Given** pedidos e pendências administrativas existentes, **When** o dashboard é carregado, **Then** os itens mais recentes ou prioritários são exibidos com links para seus detalhes.
3. **Given** que não existem registros para um indicador, **When** o dashboard é carregado, **Then** o valor oficial zero ou um estado vazio é exibido, nunca um valor de demonstração.
4. **Given** falha temporária ao obter parte dos dados, **When** o dashboard é carregado, **Then** as áreas disponíveis continuam utilizáveis e a área indisponível indica falha e oferece nova tentativa.

---

### User Story 5 - Navegação e relatórios consistentes (Priority: P5)

Como usuário autenticado, quero visualizar apenas opções permitidas e funcionais, para navegar sem cair em rotas inexistentes ou encontrar relatórios e botões sem ação.

**Why this priority**: A limpeza final evita que recursos corrigidos permaneçam inacessíveis e remove promessas de funcionalidade que o produto não entrega.

**Independent Test**: Para cada papel existente, todas as opções visíveis do menu e do acesso rápido abrem uma página autorizada e funcional; relatórios exibem dados oficiais ou deixam explícito que não estão disponíveis.

**Acceptance Scenarios**:

1. **Given** qualquer papel autenticado, **When** seu menu é exibido, **Then** somente destinos existentes e autorizados aparecem.
2. **Given** um administrador no dashboard, **When** ele usa um acesso rápido, **Then** chega à listagem ou operação correspondente sem redirecionamento silencioso.
3. **Given** um relatório suportado pelos dados oficiais, **When** o usuário o solicita, **Then** vê filtros, resultados reais e estados de carregamento, vazio e erro.
4. **Given** um relatório ainda não suportado, **When** a área de relatórios é exibida, **Then** não há botão que simule geração ou sugira uma entrega inexistente.

### Edge Cases

- O período atual ou anterior não possui registros, inclusive em comparações percentuais cujo denominador é zero.
- Uma entidade é alterada ou removida entre o carregamento da lista e a ação do usuário.
- Resultados paginados mudam enquanto o usuário avança ou retorna entre páginas.
- Uma resposta parcial do dashboard fica indisponível enquanto as demais fontes continuam operacionais.
- O papel ou as permissões do usuário mudam durante uma sessão ativa.
- Um pedido contém vários itens em estados diferentes e com profissionais diferentes.
- Um arquivo associado a briefing ou entrega falha, expira ou não está mais disponível.
- Uma compra de créditos permanece pendente, é cancelada ou é confirmada mais de uma vez.
- Uma venda é solicitada simultaneamente com outra operação que consome o mesmo estoque.
- Datas, valores monetários e quantidades de crédito incluem zero, limites máximos e mudanças de fuso horário.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST obter saldos, carteiras, créditos, disputas, estornos, reconciliações, auditorias e analytics exclusivamente das fontes oficiais vigentes.
- **FR-002**: O sistema MUST aplicar em todas as listagens o modelo oficial de paginação de cada domínio, preservando filtros ao navegar e sem duplicar ou omitir registros.
- **FR-003**: O sistema MUST permitir decisões sobre disputas e estornos somente aos papéis autorizados e refletir imediatamente o estado confirmado.
- **FR-004**: O sistema MUST restringir correções de reconciliação, emissão manual e cancelamento de créditos aos papéis autorizados.
- **FR-005**: O sistema MUST registrar e exibir feedback claro para sucesso, validação, conflito, autorização negada e indisponibilidade nas operações financeiras.
- **FR-006**: O sistema MUST substituir referências ao modelo de carteiras separadas pela carteira oficial única do usuário.
- **FR-007**: O sistema MUST representar pedidos como agregados de um ou mais itens, mantendo estado, preço, briefing, atribuição, entrega, disputa e histórico por item.
- **FR-008**: Clientes MUST be able to criar pedidos com um ou mais itens válidos e adicionar itens quando a regra de negócio permitir.
- **FR-009**: Gestores MUST be able to atribuir profissionais elegíveis a itens que aguardam atribuição.
- **FR-010**: Clientes, profissionais e gestores MUST be able to executar apenas as transições de item permitidas ao seu papel e ao estado vigente.
- **FR-011**: O sistema MUST preservar e apresentar o histórico oficial de cada item do pedido em ordem cronológica.
- **FR-012**: O sistema MUST suportar briefing, revisão de briefing, entrega, reentrega e revisão de áudio por item, incluindo arquivos quando aplicável.
- **FR-013**: O sistema MUST remover do produto o fluxo antigo de emissão direta de créditos por revendedor.
- **FR-014**: Revendedores MUST be able to consultar o preço vigente, configurar preço de venda e compra direta e administrar pacotes de créditos.
- **FR-015**: Revendedores MUST be able to registrar e consultar compras de créditos, acompanhar seu estado e visualizar os lotes disponíveis em estoque.
- **FR-016**: Administradores MUST be able to consultar compras de revendedores e confirmar ou cancelar as que estejam elegíveis.
- **FR-017**: Revendedores MUST be able to vender créditos a clientes elegíveis quando houver estoque, e consultar vendas com custo, receita e margem.
- **FR-018**: O dashboard administrativo MUST exibir dados oficiais consolidados para usuários ativos, pedidos do dia, resultado financeiro, profissionais disponíveis, pedidos recentes e pendências operacionais.
- **FR-019**: Cada indicador comparativo MUST informar período atual, período anterior e regra de tratamento quando o período anterior for zero.
- **FR-020**: O dashboard MUST identificar quando os dados foram atualizados e permitir nova tentativa após falha.
- **FR-021**: O dashboard MUST distinguir carregamento, ausência real de registros, acesso negado e falha de obtenção de dados.
- **FR-022**: Alertas administrativos MUST derivar de condições oficiais e acionáveis; mensagens de demonstração, backup fictício ou eventos sem fonte oficial MUST NOT ser exibidos.
- **FR-023**: Menus, ações rápidas e links contextuais MUST considerar papel e permissões e apontar apenas para destinos existentes.
- **FR-024**: O sistema MUST remover ou substituir valores fixos, entidades fictícias e totais preenchidos artificialmente nas áreas abrangidas por esta feature.
- **FR-025**: Relatórios oferecidos ao usuário MUST possuir dados oficiais, filtros funcionais e estados de carregamento, vazio e erro.
- **FR-026**: Opções de relatório sem fonte oficial MUST ser removidas da interface até que possam produzir resultados reais.
- **FR-027**: A solução MUST manter os fluxos oficiais já funcionais de autenticação, usuários, perfis, catálogo, profissionais, armazenamento, domínios, solicitações de papel e saques.
- **FR-028**: Todos os valores monetários, quantidades de crédito, datas e estados MUST ser exibidos com unidade e significado inequívocos.
- **FR-029**: Somente o papel SUPER_ADMIN MUST visualizar no menu, acessar ou executar operações na área administrativa de armazenamento; todos os demais papéis MUST ter o destino e os atalhos ocultos e o acesso direto negado.
- **FR-030**: A área de armazenamento MUST representar o consumo global do SaaS para acompanhamento administrativo, incluindo arquivos e dados gerados por pedidos e pelas demais funcionalidades, sem apresentar cotas ou gerenciadores pessoais aos outros papéis.

### Key Entities

- **Resumo Administrativo**: Visão consolidada de indicadores, comparações, atividade recente, pendências e instante de atualização.
- **Indicador Administrativo**: Métrica oficial com valor atual, período, valor anterior, variação e regra de apresentação.
- **Pendência Operacional**: Item acionável, como disputa, estorno, reconciliação, saque, solicitação de papel ou compra de crédito, associado a tipo, prioridade, data e destino.
- **Pedido**: Solicitação de um cliente que agrupa um ou mais itens e mantém seus participantes e totais.
- **Item do Pedido**: Unidade operacional independente com serviço, briefing, preço congelado, profissional, estado, entregas, disputa e histórico.
- **Carteira**: Conta única de créditos de um usuário, com saldos disponível, congelado e expirado.
- **Crédito**: Unidade financeira rastreável com origem, tipo, estado, validade e eventos de ciclo de vida.
- **Compra de Créditos**: Aquisição feita por uma revenda, com quantidade, preço, estado de pagamento e eventual lote de estoque.
- **Lote de Estoque**: Quantidade disponível para venda, ligada à sua origem e custo.
- **Venda de Créditos**: Transferência comercial de créditos da revenda para um cliente, com custo, receita e margem.
- **Relatório Oficial**: Consulta filtrável baseada em registros reais e com origem e período identificáveis.
- **Resumo de Armazenamento**: Visão administrativa do consumo global do SaaS, atribuído aos pedidos e às demais funcionalidades que originam os dados armazenados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos números, pedidos, alertas e entidades exibidos no dashboard administrativo correspondem a registros oficiais verificáveis; nenhum dado de demonstração permanece.
- **SC-002**: Um administrador consegue abrir o dashboard e visualizar os indicadores principais e pedidos recentes em até 2 segundos em condições normais de operação.
- **SC-003**: 100% das operações de carteira cobertas pela interface usam o comportamento vigente e permanecem corretas após atualização da página.
- **SC-004**: Um pedido com até 10 itens pode ser criado e acompanhado, e cada transição válida afeta somente o item selecionado.
- **SC-005**: 100% das ações de pedido indisponíveis para um papel ou estado deixam de ser oferecidas antes da tentativa de execução.
- **SC-006**: Um revendedor consegue concluir o fluxo demonstrável de compra confirmada, entrada em estoque e venda ao cliente sem recorrer ao fluxo antigo de emissão.
- **SC-007**: Totais de estoque e margens apresentados coincidem com os registros oficiais em 100% dos cenários de aceitação financeira.
- **SC-008**: Para cada um dos sete papéis existentes, 100% dos itens visíveis no menu e nos acessos rápidos abrem destinos existentes e autorizados.
- **SC-009**: 100% dos relatórios visíveis produzem dados oficiais; nenhuma ação sem efeito permanece disponível.
- **SC-010**: Falhas parciais, estados vazios e acesso negado são distinguíveis pelo usuário em todas as áreas abrangidas, sem substituição por zero fictício.
- **SC-011**: Todos os cenários críticos de carteira, pedido composto, estoque e venda passam em validação automatizada e em uma jornada ponta a ponta por papel envolvido.
- **SC-012**: Nos sete papéis existentes, somente SUPER_ADMIN visualiza a opção de armazenamento e consegue abrir sua rota; 100% das tentativas diretas dos demais papéis são negadas.

## Assumptions

- A feature cobre tanto os ajustes necessários no produto web quanto a disponibilização dos dados oficiais ausentes no serviço de origem.
- A ordem de prioridade das histórias define a sequência recomendada de entrega, mas cada história deve permanecer demonstrável e validável isoladamente.
- “Resultado financeiro” no dashboard representa métricas oficiais do sistema de créditos; receita monetária contábil fora desse domínio não será inventada nem inferida.
- “Profissionais disponíveis” usa o estado profissional oficial; ausência de estado não será tratada automaticamente como online.
- Comparações do dashboard usam o mesmo intervalo imediatamente anterior ao período selecionado.
- Quando o período anterior for zero, a interface mostrará “sem base de comparação” em vez de uma porcentagem infinita ou enganosa.
- Os sete papéis existentes e suas regras atuais de autorização serão preservados.
- Armazenamento é uma capacidade administrativa global e não uma área pessoal; seus dados decorrem de pedidos e das demais funcionalidades do SaaS.
- Exportação de arquivos de relatório não faz parte da primeira entrega; a visualização filtrável oficial é suficiente.
- Eventos de infraestrutura, como conclusão de backup, ficam fora do dashboard enquanto não houver fonte oficial e acionável.
- Novas bibliotecas visuais e mudanças amplas de identidade visual estão fora do escopo.

## Scope Boundaries

### In Scope

- Correção dos fluxos financeiros e de paginação já representados no produto web.
- Migração integral da experiência de pedidos para itens independentes.
- Substituição do fluxo comercial antigo da revenda.
- Consolidação oficial do dashboard administrativo.
- Limpeza de navegação, acessos rápidos, números artificiais e relatórios sem função.
- Estados de carregamento, vazio, erro, autorização e nova tentativa nas áreas alteradas.

### Out of Scope

- Criação de indicadores contábeis sem fonte oficial.
- Monitoramento de infraestrutura e backup.
- Ferramenta genérica de inteligência de negócios ou construção livre de relatórios.
- Reformulação visual completa das demais áreas do produto.
- Alteração das regras de negócio financeiras, de autorização ou de transição de pedidos já vigentes.
- Integrações com meios externos de pagamento além do acompanhamento dos estados já existentes.
