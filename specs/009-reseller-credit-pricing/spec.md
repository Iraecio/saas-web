# Feature Specification: Configuração de Preços de Créditos do Revendedor

**Feature Branch**: `009-reseller-credit-pricing`

**Created**: 2026-08-16

**Status**: Draft

**Input**: Modernizar o painel do revendedor para configurar o preço de revenda dos créditos, com experiência responsiva, acessível, segura e consistente com o sistema.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configurar preço unitário de revenda (Priority: P1)

Como revendedor, quero definir quanto meus clientes pagam por crédito e visualizar custo e margem antes de confirmar, para operar com preço sustentável.

**Why this priority**: O preço unitário é a configuração mínima para vender créditos diretamente.

**Independent Test**: Entrar como revendedor, informar preço válido, revisar custo, margem e impacto, confirmar a alteração e verificar o novo preço vigente.

**Acceptance Scenarios**:

1. **Given** um revendedor com preço da plataforma disponível, **When** abre a configuração, **Then** vê custo atual, preço de venda, margem unitária, percentual de margem e situação da compra direta.
2. **Given** um novo preço válido, **When** altera o valor, **Then** a prévia financeira é atualizada antes de qualquer gravação.
3. **Given** um preço abaixo do custo ou fora dos limites permitidos, **When** tenta salvar, **Then** vê erro associado ao campo e nenhuma alteração é aplicada.
4. **Given** uma alteração válida, **When** confirma explicitamente o impacto, **Then** o novo preço passa a valer para vendas futuras e o sucesso permanece visível na página.
5. **Given** uma alteração concorrente, **When** tenta salvar uma versão antiga, **Then** recebe o estado atual e precisa revisar antes de tentar novamente.

---

### User Story 2 - Controlar compra direta (Priority: P1)

Como revendedor, quero ativar ou suspender compras diretas dos clientes para controlar quando o canal de vendas estará disponível.

**Why this priority**: O preço configurado só produz o comportamento esperado se a disponibilidade de compra estiver clara e segura.

**Independent Test**: Alternar a compra direta, revisar a consequência, confirmar e verificar status atualizado para os clientes.

**Acceptance Scenarios**:

1. **Given** compra direta desativada, **When** o revendedor solicita ativação com preço válido, **Then** vê confirmação e o canal passa a ser exibido como ativo.
2. **Given** compra direta ativa, **When** solicita suspensão, **Then** é avisado de que novas compras serão bloqueadas, mas operações existentes não serão apagadas.
3. **Given** ausência de preço válido ou outra dependência obrigatória, **When** tenta ativar, **Then** a ação é bloqueada com orientação de correção.

---

### User Story 3 - Gerenciar pacotes de créditos (Priority: P2)

Como revendedor, quero criar, consultar, editar disponibilidade e organizar pacotes para oferecer quantidades e preços comerciais diferentes do valor unitário.

**Why this priority**: Pacotes aumentam flexibilidade comercial, mas dependem da configuração básica de preço.

**Independent Test**: Criar um pacote, encontrá-lo na listagem, verificar preço por crédito/margem e desativá-lo com confirmação.

**Acceptance Scenarios**:

1. **Given** dados válidos, **When** cria um pacote com quantidade e preço total, **Then** vê preço efetivo por crédito, margem estimada e pacote na lista.
2. **Given** pacotes existentes, **When** busca, filtra por status, ordena ou pagina, **Then** a lista preserva a consulta selecionada.
3. **Given** desktop, **When** consulta pacotes, **Then** vê tabela com seleção, nome/identificação, créditos, preço total, preço unitário, margem, status, atualização e ações.
4. **Given** smartphone, **When** consulta pacotes, **Then** vê cards priorizados sem rolagem horizontal e filtros em drawer.
5. **Given** um pacote ativo, **When** solicita desativação, **Then** confirma o impacto e vendas futuras deixam de oferecê-lo sem alterar vendas anteriores.

---

### User Story 4 - Revisar histórico e aplicar ações em lote (Priority: P3)

Como revendedor, quero consultar alterações e ativar ou desativar pacotes em lote para manter rastreabilidade e reduzir trabalho repetitivo.

**Why this priority**: Auditoria e produtividade completam a operação, sem bloquear a primeira configuração.

**Independent Test**: Filtrar o histórico, identificar ator e valores anterior/novo e desativar múltiplos pacotes após uma prévia de elegibilidade.

**Acceptance Scenarios**:

1. **Given** alterações de preço e disponibilidade, **When** abre o histórico, **Then** vê data, ator, ação, valor anterior, valor novo e justificativa quando houver.
2. **Given** pacotes selecionados, **When** inicia ação em lote, **Then** a prévia separa elegíveis e inelegíveis antes da confirmação.
3. **Given** sucesso parcial em lote, **When** a execução termina, **Then** o resultado apresenta sucesso ou falha por pacote.

### Edge Cases

- O preço de custo da plataforma pode estar ausente ou mudar durante a edição; salvar deve exigir uma nova revisão.
- Conversão monetária deve usar centavos inteiros e nunca ponto flutuante como valor persistido.
- Preço igual ao custo produz margem zero claramente identificada; preço abaixo do custo segue a política de validação do servidor.
- Quantidade ou preço total do pacote pode gerar preço unitário fracionário somente para exibição; o total persistido continua em centavos.
- Pacote pode ser alterado por outro gerente da mesma revenda durante a edição.
- Uma resposta antiga de busca não pode substituir resultados de filtros mais recentes.
- Perda de conexão deve preservar formulário não sensível e filtros, sem repetir mutações automaticamente.
- Usuários de outra revenda ou papéis não autorizados não podem visualizar nem alterar a configuração.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O painel DEVE ser acessível somente a `RESELLER` e `RESELLER_MANAGER`, sempre limitado à revenda autenticada.
- **FR-002**: O resumo DEVE exibir custo vigente da plataforma, preço unitário de revenda, margem unitária, margem percentual, compra direta e quantidade de pacotes ativos.
- **FR-003**: O revendedor DEVE poder definir preço unitário em moeda, convertido e persistido em centavos inteiros.
- **FR-004**: O formulário DEVE validar obrigatoriedade, formato, limites comerciais e dependências retornadas pelo servidor, associando mensagens ao campo.
- **FR-005**: Antes de salvar preço, a interface DEVE apresentar preço anterior/novo, custo vigente, margem e efeito exclusivo sobre vendas futuras.
- **FR-006**: Alterações críticas DEVEM exigir confirmação explícita e impedir submissão duplicada.
- **FR-007**: O revendedor DEVE poder ativar ou suspender compra direta, com explicação das consequências e validação das dependências.
- **FR-008**: O revendedor DEVE poder criar pacotes informando identificação opcional, quantidade de créditos e preço total.
- **FR-009**: A listagem de pacotes DEVE suportar busca, status, faixa de quantidade/preço, ordenação e paginação server-side.
- **FR-010**: A tabela desktop DEVE conter seleção, pacote, créditos, preço total, preço efetivo por crédito, margem, status, atualização e ações.
- **FR-011**: No smartphone, pacotes DEVEM ser cards sem rolagem horizontal, priorizando créditos, preço, margem, status e ação principal; filtros DEVEM usar drawer.
- **FR-012**: No tablet, a tabela DEVE reduzir colunas ou alternar para cards conforme largura, mantendo ações essenciais acessíveis.
- **FR-013**: Busca, filtros, ordenação, página e tamanho DEVEM persistir na URL; preferências visuais podem persistir por usuário.
- **FR-014**: Ações por pacote DEVEM incluir ativar/desativar e acesso a detalhes; edição será permitida somente se o contrato de negócio preservar o histórico.
- **FR-015**: Seleção em lote DEVE aceitar página atual ou todos os resultados filtrados e diferenciar claramente esses escopos.
- **FR-016**: Ações em lote DEVEM apresentar prévia de elegibilidade e resultado por registro.
- **FR-017**: O histórico DEVE registrar alterações de preço, compra direta e pacotes com ator, data, valores e resultado.
- **FR-018**: O painel DEVE representar carregando, carregado, vazio, erro de carga, erro de validação, ação em andamento, sucesso, acesso negado, sessão expirada, offline e conflito.
- **FR-019**: A primeira carga DEVE usar skeleton estrutural; atualizações subsequentes DEVEM preservar conteúdo válido com indicação de atualização.
- **FR-020**: Erros recuperáveis DEVEM oferecer nova tentativa e preservar contexto seguro; sucesso DEVE atualizar resumo/lista e não depender apenas de toast.
- **FR-021**: Conflitos DEVEM exibir o estado atual, impedir sobrescrita silenciosa e exigir nova decisão.
- **FR-022**: Temas claro e escuro DEVEM preservar contraste; lucro, alerta e status DEVEM combinar texto/ícone com cor.
- **FR-023**: Todos os fluxos DEVEM operar por teclado com foco visível, ordem lógica e retorno de foco após dialogs/drawers.
- **FR-024**: Campos DEVEM possuir labels; erros DEVEM estar associados; tabelas, menus, dialogs e anúncios DEVEM usar semântica/ARIA adequada.
- **FR-025**: Alvos de toque DEVEM ser adequados para mobile e nenhuma ação pode depender apenas de hover.
- **FR-026**: Animações DEVEM respeitar redução de movimento sem remover feedback essencial.

### Interface State Contract

| Estado | Comportamento esperado |
|---|---|
| Carregando | Skeleton do resumo, formulário e lista; ações indisponíveis. |
| Dados carregados | Configuração, margem, pacotes e contexto da consulta disponíveis. |
| Lista vazia | Explicação e ação para criar o primeiro pacote ou limpar filtros. |
| Erro de carregamento | Erro local com nova tentativa e referência útil quando disponível. |
| Erro de validação | Mensagem ligada ao campo e foco no primeiro erro. |
| Ação em andamento | Progresso e bloqueio contra duplicidade. |
| Ação concluída | Mensagem persistente e dados atualizados. |
| Acesso negado | Página segura sem revelar preços da revenda. |
| Sessão expirada | Login e retorno à rota sem repetir a mutação. |
| Sem conexão | Banner persistente, estado preservado e mutações bloqueadas. |
| Conflito | Dados atuais e opção de revisar; nova confirmação obrigatória. |
| Alterado por terceiro | Aviso com horário e ator quando autorizado. |

### Key Entities

- **Configuração de preço da revenda**: Preço unitário, compra direta, versão, revenda e datas de controle.
- **Referência de custo**: Preço vigente que a plataforma cobra do revendedor e sua vigência.
- **Pacote de créditos**: Identificação, quantidade, preço total, status, versão e métricas derivadas.
- **Consulta de pacotes**: Busca, filtros, ordenação e paginação persistíveis.
- **Prévia de alteração**: Estado anterior/novo, custo, margem, alertas e versão esperada.
- **Evento de histórico**: Ator, ação, alvo, valores, justificativa, resultado e data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pelo menos 90% dos revendedores configuram o primeiro preço válido em até 90 segundos sem assistência.
- **SC-002**: 100% das alterações críticas testadas apresentam custo, margem e impacto antes da confirmação.
- **SC-003**: Feedback inicial aparece em até 1 segundo e conteúdo utilizável em até 2 segundos no percentil 95 sob condições acordadas.
- **SC-004**: A listagem permanece utilizável sem rolagem horizontal de página entre 320 px e 1440 px.
- **SC-005**: Todos os fluxos essenciais podem ser concluídos somente por teclado e não apresentam violações críticas na auditoria automatizada de acessibilidade.
- **SC-006**: Nenhum teste de concorrência sobrescreve configuração mais recente sem informar conflito.
- **SC-007**: Recarregar ou compartilhar a URL restaura integralmente filtros, ordenação e paginação.
- **SC-008**: 100% dos sucessos parciais em lote discriminam o resultado de cada pacote.

## Assumptions

- O painel moderniza a rota existente `/admin/reseller-credits/pricing` e seus contratos, sem criar configuração paralela.
- O preço representa o valor cobrado pelo revendedor de seus clientes; o custo da plataforma é somente referência e limite de negócio.
- Preços e totais são armazenados em centavos inteiros; moeda inicial é BRL.
- Alterações afetam somente vendas futuras e preservam vendas/histórico anteriores.
- `RESELLER_MANAGER` compartilha a configuração da mesma revenda, sujeito às permissões existentes.
- A API pode receber contratos aditivos para histórico, paginação, prévia, versão e lote.

## Out of Scope

- Alterar o preço cobrado pela plataforma dos revendedores.
- Reprecificar vendas já concluídas ou alterar estoque existente.
- Configurar preços de serviços profissionais.
- Criar campanhas, cupons, impostos ou múltiplas moedas nesta entrega.
