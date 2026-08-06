# Feature Specification: Gestão de serviços e renegociações

**Feature Branch**: `005-service-renegotiations`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "Modernizar o painel administrativo do catálogo de serviços para superadmins e revendas, separar serviços e renegociações em abas, permitir gestão completa dos serviços e conduzir propostas e contrapropostas de locutores e produtores até a finalização, com boa UX responsiva e temas claro e escuro."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gerenciar o catálogo em um painel moderno (Priority: P1)

Como superadmin ou gestor de revenda, quero localizar, analisar, criar, editar, ativar e inativar serviços em uma área administrativa clara para manter o catálogo sob meu escopo sem navegar por telas desconectadas.

**Why this priority**: O catálogo é a base operacional das ofertas e precisa continuar útil mesmo antes da implantação do fluxo de renegociação.

**Independent Test**: Um gestor autorizado consegue abrir a aba de serviços, filtrar os registros, consultar seus indicadores, criar ou editar um serviço e alterar seu estado sem acessar dados fora do próprio escopo.

**Acceptance Scenarios**:

1. **Given** um superadmin autenticado, **When** abre a aba de serviços, **Then** visualiza serviços globais e particulares com busca, filtros, indicadores, estado e ações compatíveis com sua permissão.
2. **Given** um gestor de revenda autenticado, **When** abre a mesma aba, **Then** visualiza os serviços disponíveis e gerencia somente os serviços particulares pertencentes à sua revenda.
3. **Given** um serviço encontrado, **When** o gestor cria, edita, ativa ou inativa o registro, **Then** recebe confirmação contextual e a lista reflete o novo estado sem recarregar toda a aplicação.
4. **Given** uma tela estreita, **When** o gestor consulta o catálogo, **Then** os dados e ações permanecem legíveis e operáveis sem rolagem horizontal obrigatória.

---

### User Story 2 - Analisar e decidir renegociações pendentes (Priority: P1)

Como superadmin ou gestor de revenda, quero uma fila de renegociações com os dados do profissional, serviço, preço atual, valor solicitado, justificativa e prazo de espera para decidir rapidamente entre aprovar, negar ou contrapor.

**Why this priority**: Solicitações pendentes afetam remuneração e disponibilidade do profissional; ocultá-las em históricos individuais cria atraso operacional e risco financeiro.

**Independent Test**: Com solicitações pendentes de locutores e produtores, o gestor filtra a fila, abre uma solicitação e executa uma decisão válida, observando a atualização imediata do status e dos indicadores.

**Acceptance Scenarios**:

1. **Given** renegociações sob o escopo do gestor, **When** ele abre a aba de renegociações, **Then** visualiza uma fila priorizada com profissional, função, serviço, valores, variação percentual, justificativa, data e status.
2. **Given** uma proposta pendente iniciada por profissional, **When** o gestor aprova, **Then** a negociação é finalizada como aceita e o novo valor passa a ser identificado como vigente.
3. **Given** uma proposta pendente, **When** o gestor nega com um motivo, **Then** a negociação é finalizada como recusada, o preço vigente é mantido e a decisão fica registrada.
4. **Given** uma proposta fora do orçamento, **When** o gestor envia uma contraproposta válida, **Then** a proposta original é encerrada como contraposta e uma nova etapa pendente do profissional aparece na linha do tempo.
5. **Given** um gestor de revenda, **When** consulta ou decide uma negociação, **Then** nunca acessa profissionais globais ou pertencentes a outra revenda.

---

### User Story 3 - Acompanhar propostas e contrapropostas até o desfecho (Priority: P2)

Como gestor, quero consultar a conversa financeira completa de cada oferta profissional e entender quem precisa agir para acompanhar propostas e contrapropostas até a aceitação ou recusa final.

**Why this priority**: O histórico completo reduz decisões duplicadas, dúvidas sobre o preço vigente e contatos paralelos fora da plataforma.

**Independent Test**: Ao abrir uma negociação com múltiplas rodadas, o gestor identifica a sequência, valores, autores, observações, decisões e responsável pela próxima ação sem consultar outra tela.

**Acceptance Scenarios**:

1. **Given** uma negociação com contrapropostas, **When** o gestor abre seus detalhes, **Then** visualiza uma linha do tempo cronológica ligando todas as rodadas e destacando a etapa vigente.
2. **Given** uma contraproposta do gestor aguardando o profissional, **When** ele consulta a negociação, **Then** as ações administrativas ficam indisponíveis e o painel indica claramente que a resposta depende do profissional.
3. **Given** uma negociação finalizada, **When** o gestor consulta o histórico, **Then** encontra resultado, preço anterior, preço final, participantes, notas e datas preservados.

---

### User Story 4 - Operar com acessibilidade em temas claro e escuro (Priority: P3)

Como gestor que usa diferentes dispositivos e preferências visuais, quero operar as duas abas com navegação por teclado, estados claros e contraste adequado nos temas claro e escuro.

**Why this priority**: A qualidade visual não pode comprometer acessibilidade, responsividade ou eficiência operacional.

**Independent Test**: As jornadas principais são concluídas em desktop e celular, nos dois temas e apenas com teclado, sem perda de informação ou ação.

**Acceptance Scenarios**:

1. **Given** qualquer um dos temas suportados, **When** o gestor percorre abas, filtros, linhas, painéis e ações, **Then** texto, foco, status e controles mantêm contraste e identificação adequados.
2. **Given** navegação somente por teclado, **When** o gestor alterna abas e decide uma solicitação, **Then** a ordem de foco é lógica e todo controle exibe foco visível.
3. **Given** carregamento, ausência de resultados ou falha, **When** qualquer aba entra nesses estados, **Then** apresenta conteúdo contextual com próximo passo claro sem bloquear a outra aba.

### Edge Cases

- Uma negociação pode mudar de estado enquanto o gestor está com o painel de decisão aberto; a ação deve ser rejeitada com mensagem contextual e os dados devem ser atualizados.
- Apenas uma etapa pendente pode existir por combinação de profissional e serviço; solicitações duplicadas devem aparecer como conflito, nunca como duas decisões simultâneas.
- Uma oferta inativa mantém seu histórico, mas não aceita mudança de preço até ser reativada.
- A aprovação pode alterar o preço vigente, mas nunca preços já congelados em pedidos anteriores.
- Valores inválidos, iguais ou inferiores a zero devem ser bloqueados antes do envio; a interface deve evidenciar a unidade monetária.
- Notas longas devem ser truncadas na fila e exibidas integralmente nos detalhes sem quebrar o layout.
- Quando não houver foto do profissional, o painel deve usar uma identificação textual consistente, sem perder nome e função.
- Se uma ação falhar por conexão, a solicitação permanece no estado anterior e pode ser reenviada com segurança.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O painel MUST apresentar duas abas principais, "Serviços" e "Renegociações", preservando a aba selecionada durante a navegação dentro da área.
- **FR-002**: A aba de serviços MUST exibir indicadores de total, ativos, inativos e divisão entre locução e produção conforme o escopo autorizado.
- **FR-003**: Gestores MUST be able to buscar serviços por nome e filtrar por tipo profissional, escopo e estado.
- **FR-004**: O painel MUST permitir criar, consultar, editar, ativar e inativar serviços quando a função e a propriedade do registro autorizarem a ação.
- **FR-005**: O superadmin MUST poder administrar serviços globais; gestores de revenda MUST administrar somente serviços particulares de sua própria revenda.
- **FR-006**: A lista de serviços MUST apresentar nome, descrição resumida, tipo profissional, escopo, custo, repasse padrão, revisões, estado e ações disponíveis.
- **FR-007**: Alterações com impacto em novas contratações MUST exigir confirmação explícita e explicar o que não será alterado retroativamente.
- **FR-008**: A aba de renegociações MUST apresentar contadores de pendentes, aguardando profissional e finalizadas, além de filtros por status, tipo profissional, serviço e período.
- **FR-009**: Cada item de renegociação MUST apresentar nome e identificação visual do profissional, função, serviço, escopo, preço vigente, valor proposto, variação, justificativa, autor, data e responsável pela próxima ação.
- **FR-010**: Gestores MUST be able to aprovar ou negar propostas pendentes iniciadas por profissionais dentro do seu escopo.
- **FR-011**: A negação MUST solicitar uma justificativa e preservar o preço vigente.
- **FR-012**: Gestores MUST be able to enviar contraproposta com valor positivo e nota opcional para uma proposta pendente iniciada pelo profissional.
- **FR-013**: Cada contraproposta MUST encerrar a etapa anterior, criar uma nova etapa vinculada e transferir a próxima ação ao profissional.
- **FR-014**: O painel MUST impedir ações administrativas sobre uma contraproposta que aguarda decisão do profissional.
- **FR-015**: O detalhe da renegociação MUST apresentar uma linha do tempo completa de propostas, contrapropostas, decisões, participantes, valores, notas e datas.
- **FR-016**: Quando uma proposta for aceita, o painel MUST atualizar o preço vigente e o estado da fila sem recarregar toda a aplicação.
- **FR-017**: O painel MUST preservar e permitir consultar negociações aceitas, recusadas, contrapostas e alterações aplicadas diretamente pelo gestor.
- **FR-018**: O sistema MUST restringir dados e ações ao escopo do usuário autenticado, inclusive em acesso direto a detalhes.
- **FR-019**: Toda ação financeira MUST exigir confirmação, bloquear envio duplicado enquanto processa e informar o resultado junto ao item afetado.
- **FR-020**: As duas abas MUST oferecer estados de carregamento estruturais, vazio contextual, erro recuperável e atualização manual.
- **FR-021**: A experiência MUST funcionar em larguras a partir de 320 pixels; tabelas extensas MUST adotar uma apresentação alternativa adequada em telas estreitas.
- **FR-022**: Todos os controles interativos MUST ser acessíveis por teclado, ter rótulo compreensível, foco visível e não depender somente de cor.
- **FR-023**: Temas claro e escuro MUST preservar hierarquia, legibilidade, contraste, estados de interação e significado dos status.
- **FR-024**: A seleção de aba, filtros relevantes e contexto aberto MUST ser representáveis na navegação para permitir retorno, recarregamento e compartilhamento do estado.

### Key Entities

- **Serviço**: Oferta configurada pela plataforma ou revenda, associada a locutores ou produtores, contendo condições comerciais, revisões, escopo e estado.
- **Oferta profissional**: Associação entre profissional e serviço com preço vigente, estado de disponibilidade e eventual renegociação pendente.
- **Profissional**: Locutor ou produtor identificado por nome, função, imagem opcional e pertencimento global ou a uma revenda.
- **Renegociação**: Etapa registrada de uma conversa de preço, com valor anterior, valor proposto, autor, notas, estado, decisão e vínculo com a etapa anterior.
- **Linha de negociação**: Sequência de renegociações relacionadas para a mesma oferta profissional, desde a solicitação inicial até seu desfecho.
- **Decisão**: Ação autorizada de aceitar, negar ou contrapor uma etapa pendente, com responsável, data e observação.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pelo menos 90% dos gestores conseguem localizar e alterar um serviço em menos de 2 minutos na primeira tentativa.
- **SC-002**: Pelo menos 90% dos gestores conseguem identificar quem deve agir e decidir uma proposta pendente em menos de 90 segundos.
- **SC-003**: A fila e seus indicadores iniciais ficam utilizáveis em até 2 segundos para conjuntos de até 500 serviços e 1.000 renegociações sob condições normais.
- **SC-004**: 100% das decisões exibidas no histórico permitem identificar autor, data, valor anterior, valor proposto e resultado.
- **SC-005**: Nenhum teste de autorização permite que gestor de revenda consulte ou altere dados de outra revenda ou do escopo global.
- **SC-006**: As jornadas principais são concluídas sem rolagem horizontal obrigatória em 320, 768 e 1440 pixels.
- **SC-007**: 100% dos controles das jornadas principais podem ser operados por teclado e apresentam foco visível nos temas claro e escuro.
- **SC-008**: Em validação de usabilidade, pelo menos 4 de 5 participantes classificam a organização em abas, filtros e estados das negociações como clara.

## Assumptions

- A autenticação, os papéis existentes e a associação do gestor à revenda continuam sendo a fonte oficial de autorização.
- Superadmin e admin compartilham a gestão do escopo global; revendedor e gerente de revenda compartilham a gestão do escopo particular da própria rede.
- Locutores e produtores iniciam solicitações em suas experiências próprias; esta feature cobre a experiência administrativa de análise e decisão.
- Uma contraproposta administrativa é respondida pelo profissional fora deste painel, e volta à fila administrativa apenas se houver nova ação válida para o gestor.
- O preço é armazenado e comunicado em centavos, mas apresentado ao gestor em formato monetário local.
- Pedidos anteriores preservam os valores contratados, independentemente de alterações posteriores no catálogo ou nas ofertas profissionais.
- A exclusão definitiva de serviços ou históricos não faz parte desta entrega; o ciclo usa ativação e inativação para preservar rastreabilidade.
- O backend existente é a fonte oficial dos estados de serviço, oferta e negociação; qualquer visão administrativa agregada necessária deve manter o mesmo isolamento por escopo.
