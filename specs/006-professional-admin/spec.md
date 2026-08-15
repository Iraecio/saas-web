# Feature Specification: Administração completa de profissionais

**Feature Branch**: `006-professional-admin`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "Modernizar o painel de profissionais do superadmin, permitir gestão completa de locutores e produtores globais ou de revendas, consultar perfil, pedidos e carteira, editar, bloquear, resetar senha e inspecionar o sistema na perspectiva do profissional, com UX responsiva, acessível e completa."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Encontrar e administrar profissionais (Priority: P1)

Como superadmin, quero uma listagem unificada de locutores e produtores com indicadores, filtros persistentes, ordenação, paginação e ações individuais ou em lote para operar toda a base com rapidez.

**Why this priority**: Toda gestão posterior depende de localizar corretamente o profissional e compreender seu estado, função, escopo e vínculo com revenda.

**Independent Test**: O superadmin encontra profissionais globais e particulares por diferentes critérios, preserva os filtros ao retornar à lista e executa uma ação autorizada sem perder o contexto.

**Acceptance Scenarios**:

1. **Given** profissionais globais e de diferentes revendas, **When** o superadmin abre o painel, **Then** visualiza indicadores, busca, filtros, ordenação, paginação e ações compatíveis com cada registro.
2. **Given** filtros e ordenação ativos, **When** o superadmin abre um profissional e volta à lista, **Then** o contexto anterior é restaurado.
3. **Given** seleção de múltiplos profissionais, **When** o superadmin escolhe uma ação em lote válida, **Then** visualiza impacto, confirma a operação e recebe resultado por registro.
4. **Given** uma tela estreita, **When** a listagem é exibida, **Then** a tabela é substituída por cards sem rolagem horizontal obrigatória e mantém as ações principais.

---

### User Story 2 - Consultar a visão 360º do profissional (Priority: P1)

Como superadmin, quero abrir um profissional e consultar perfil, dados da conta, serviços, pedidos, carteira e histórico administrativo em uma única área para diagnosticar situações sem alternar entre módulos desconectados.

**Why this priority**: A visão consolidada reduz tempo de suporte, decisões incompletas e navegação repetitiva.

**Independent Test**: Ao abrir um locutor ou produtor, o superadmin consulta todas as seções disponíveis, acessa detalhes relacionados e distingue claramente dados ausentes, erros parciais e restrições.

**Acceptance Scenarios**:

1. **Given** um profissional existente, **When** o superadmin abre seus detalhes, **Then** visualiza identidade, função, escopo, revenda, verificação, atividade recente e estado da conta.
2. **Given** dados relacionados disponíveis, **When** navega entre resumo, perfil, serviços, pedidos, carteira e histórico, **Then** cada seção carrega independentemente e preserva a seção selecionada na URL.
3. **Given** falha somente na carteira, **When** o restante da página carrega, **Then** as outras seções permanecem utilizáveis e a carteira oferece nova tentativa.
4. **Given** ausência de pedidos ou serviços, **When** abre a seção correspondente, **Then** recebe um estado vazio contextual, não uma área em branco.

---

### User Story 3 - Executar ações administrativas críticas (Priority: P2)

Como superadmin, quero editar dados permitidos, ajustar escopo, bloquear ou reativar a conta e iniciar um reset de senha seguro para resolver problemas operacionais com confirmação e rastreabilidade.

**Why this priority**: Essas ações solucionam incidentes reais, mas exigem controles adicionais por afetarem acesso e dados pessoais.

**Independent Test**: O superadmin edita um profissional, bloqueia e reativa sua conta e envia reset de senha, observando confirmação, validações, auditoria e atualização imediata do estado.

**Acceptance Scenarios**:

1. **Given** dados editáveis, **When** o superadmin salva alterações válidas, **Then** o painel atualiza o perfil e registra autor, data e campos alterados.
2. **Given** um profissional ativo, **When** o superadmin confirma o bloqueio com motivo, **Then** novas sessões são impedidas, sessões vigentes são revogadas e o registro permanece consultável.
3. **Given** um profissional bloqueado, **When** o superadmin confirma a reativação, **Then** o usuário pode autenticar novamente sem perder histórico.
4. **Given** uma solicitação de reset, **When** o superadmin confirma, **Then** um link temporário é enviado ao e-mail cadastrado sem revelar nem definir senha no painel.
5. **Given** alteração concorrente, **When** o superadmin salva uma versão desatualizada, **Then** o sistema informa o conflito e permite comparar/recarregar antes de tentar novamente.

---

### User Story 4 - Inspecionar a experiência como profissional (Priority: P2)

Como superadmin, quero iniciar uma sessão temporária de inspeção na perspectiva de um profissional para reproduzir problemas de navegação e visibilidade sem conhecer sua senha nem perder minha sessão administrativa.

**Why this priority**: A inspeção reduz tempo de diagnóstico, mas requer limites rígidos para não se tornar acesso oculto ou irrestrito à conta.

**Independent Test**: O superadmin inicia a inspeção de um locutor ou produtor, vê o sistema com as mesmas permissões de leitura, identifica permanentemente que está inspecionando e retorna à sessão original sem nova autenticação.

**Acceptance Scenarios**:

1. **Given** um profissional ativo, **When** o superadmin confirma a inspeção informando motivo, **Then** entra em uma sessão temporária vinculada ao alvo e preserva sua sessão administrativa original.
2. **Given** uma inspeção ativa, **When** navega pelo sistema, **Then** a aplicação usa a visibilidade do profissional e exibe um banner persistente com identidade, tempo restante e ação de saída.
3. **Given** uma inspeção ativa, **When** tenta uma ação mutável, financeira, de senha ou segurança, **Then** a ação é bloqueada e explica que a inspeção é somente leitura.
4. **Given** saída manual, expiração, bloqueio do alvo ou revogação, **When** a inspeção termina, **Then** o sistema restaura a sessão original do superadmin e retorna ao profissional de origem.
5. **Given** qualquer inspeção, **When** o histórico é consultado, **Then** registra superadmin, profissional, motivo, início, término, duração e forma de encerramento.

---

### User Story 5 - Operar com acessibilidade e estados completos (Priority: P3)

Como superadmin, quero operar o painel em desktop, tablet ou smartphone, nos temas claro e escuro e por teclado, recebendo feedback claro para todos os estados.

**Why this priority**: Uma ferramenta administrativa complexa só é confiável quando mantém legibilidade e previsibilidade sob diferentes condições.

**Independent Test**: As jornadas principais são concluídas em 320, 768 e 1440 pixels, nos dois temas e apenas por teclado, incluindo carregamento, erro, conflito e sessão expirada.

**Acceptance Scenarios**:

1. **Given** qualquer viewport suportada, **When** o painel muda de tabela para cards ou abre filtros, **Then** nenhuma informação ou ação essencial desaparece.
2. **Given** navegação por teclado ou leitor de tela, **When** o usuário percorre filtros, linhas, abas, menus e confirmações, **Then** encontra ordem lógica, rótulos, foco visível e anúncios de resultado.
3. **Given** carregamento, vazio, erro, sem conexão, acesso negado, conflito ou sessão expirada, **When** o estado ocorre, **Then** o painel apresenta mensagem específica e próximo passo seguro.

### Edge Cases

- O profissional é bloqueado ou removido enquanto seus detalhes ou inspeção estão abertos.
- A função muda de locutor para produtor ou o escopo muda enquanto filtros estão ativos.
- Uma ação em lote contém registros elegíveis e inelegíveis; o resultado deve ser parcial e detalhado.
- Pedidos, carteira ou perfil não existem ainda; cada seção deve tratar ausência de forma independente.
- O reset de senha é solicitado repetidamente; deve existir limitação e feedback sem revelar se o e-mail foi entregue.
- O superadmin tenta inspecionar a si mesmo, outro administrador ou usuário inativo; a operação deve ser impedida.
- A aba do navegador fecha durante a inspeção; a sessão temporária expira sem afetar a sessão administrativa original.
- Uma inspeção nunca pode iniciar outra inspeção, alterar senha, movimentar valores, baixar segredo ou executar ação destrutiva.
- Dados mudam entre carregamento e edição; o painel não deve sobrescrever silenciosamente uma versão mais nova.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O painel MUST listar locutores e produtores globais e particulares em uma experiência unificada exclusiva do superadmin.
- **FR-002**: A listagem MUST apresentar nome, avatar/fallback, e-mail, função, escopo, revenda, verificação, estado, último acesso, pedidos ativos e resumo de carteira quando autorizado.
- **FR-003**: O superadmin MUST be able to buscar por nome/e-mail e filtrar por função, escopo, revenda, verificação, estado e atividade.
- **FR-004**: A listagem MUST oferecer ordenação e paginação controladas pelo conjunto oficial de dados.
- **FR-005**: Aba, filtros, ordenação, página e tamanho de página MUST ser persistidos na navegação.
- **FR-006**: O painel MUST oferecer seleção por registro, seleção da página e ações em lote com prévia de elegibilidade e resultado individual.
- **FR-007**: Ações em lote MUST excluir operações de senha, inspeção, carteira e edição de dados pessoais.
- **FR-008**: O detalhe MUST organizar resumo, perfil, serviços, pedidos, carteira e histórico administrativo em seções navegáveis por URL.
- **FR-009**: Falha em uma seção do detalhe MUST NOT bloquear seções independentes.
- **FR-010**: O superadmin MUST poder editar somente campos permitidos do usuário e do perfil profissional, com validação e detecção de conflito.
- **FR-011**: O superadmin MUST poder alterar escopo respeitando vínculos e pedidos ativos decididos pela fonte oficial.
- **FR-012**: O superadmin MUST poder bloquear e reativar profissionais com motivo obrigatório, confirmação e auditoria.
- **FR-013**: O bloqueio MUST revogar sessões ativas e impedir nova autenticação até reativação.
- **FR-014**: O reset administrativo MUST enviar link temporário ao e-mail cadastrado; o painel MUST NOT criar, receber ou exibir senha.
- **FR-015**: Ações críticas MUST bloquear envio duplicado, exigir confirmação e apresentar resultado junto ao registro afetado.
- **FR-016**: Apenas `SUPER_ADMIN` MUST poder iniciar, encerrar ou consultar sessões de inspeção.
- **FR-017**: A inspeção MUST exigir profissional ativo e motivo obrigatório, recusar alvos administrativos e durar no máximo 30 minutos.
- **FR-018**: A sessão de inspeção MUST manter separada e recuperável a sessão original do superadmin.
- **FR-019**: Durante inspeção, permissões de leitura MUST equivaler às do profissional-alvo e todas as mutações MUST ser bloqueadas no servidor.
- **FR-020**: Um banner persistente MUST identificar inspeção, alvo, tempo restante e ação para retornar ao superadmin.
- **FR-021**: Toda inspeção MUST registrar ator, alvo, motivo, início, término, duração, endereço de origem e forma de encerramento.
- **FR-022**: O painel MUST apresentar estados específicos para carregamento, dados, vazio, erro, validação, andamento, sucesso, acesso negado, sessão expirada, offline e conflito.
- **FR-023**: Desktop MUST usar tabela quando favorecer comparação; mobile MUST usar cards e filtros em drawer, sem rolagem horizontal obrigatória.
- **FR-024**: Controles de toque MUST ter área mínima adequada, e ações principais MUST permanecer acessíveis no mobile.
- **FR-025**: Todos os controles MUST funcionar por teclado, ter foco visível, rótulo acessível, contraste e indicação não baseada somente em cor.
- **FR-026**: Mensagens de erro MUST ser associadas aos campos e anunciadas por tecnologias assistivas.
- **FR-027**: Movimento MUST respeitar a preferência de redução de movimento e os temas claro/escuro MUST preservar significado e hierarquia.

### Key Entities

- **Profissional administrativo**: Visão consolidada do usuário, perfil de locutor/produtor, escopo, revenda, verificação, conta e indicadores operacionais.
- **Resumo profissional**: Dados compactos para listagem, filtros, seleção e ações.
- **Detalhe profissional**: Agregado de conta, perfil, serviços, pedidos, carteira e auditoria.
- **Ação administrativa**: Operação individual ou em lote, com elegibilidade, confirmação, resultado e auditoria.
- **Sessão de inspeção**: Contexto temporário e somente leitura que vincula superadmin, profissional-alvo, motivo, validade e estado.
- **Evento de inspeção**: Registro imutável de início, uso e encerramento da sessão.
- **Preferências da listagem**: Estado navegável de filtros, ordenação, paginação, seleção e seção aberta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pelo menos 90% dos superadmins encontram um profissional específico em menos de 45 segundos.
- **SC-002**: A visão 360º fica utilizável em até 2 segundos e cada seção adicional responde em até 1,5 segundo para 95% das consultas usuais.
- **SC-003**: Pelo menos 90% das tarefas de editar, bloquear, reativar ou resetar senha são concluídas na primeira tentativa em menos de 2 minutos.
- **SC-004**: 100% das ações críticas e sessões de inspeção permitem identificar ator, alvo, motivo, horário e resultado.
- **SC-005**: Nenhum teste permite iniciar inspeção sem superadmin, inspecionar administrador, manter inspeção por mais de 30 minutos ou executar mutação durante a inspeção.
- **SC-006**: 100% das ações em lote produzem resultado individual para cada registro selecionado, inclusive falhas parciais.
- **SC-007**: As jornadas principais funcionam sem rolagem horizontal obrigatória em 320, 768 e 1440 pixels.
- **SC-008**: 100% dos controles essenciais funcionam por teclado e exibem foco visível nos temas claro e escuro.
- **SC-009**: Em teste de usabilidade, pelo menos 4 de 5 participantes classificam filtros, visão 360º e saída da inspeção como claros.

## Assumptions

- A primeira entrega é exclusiva do papel `SUPER_ADMIN`; outros administradores não recebem inspeção nem ações críticas ampliadas.
- Inspeção é somente leitura. Reproduzir mutações reais como o profissional fica fora do escopo por risco financeiro e de segurança.
- Reset administrativo significa enviar fluxo seguro ao e-mail; o superadmin nunca escolhe nem visualiza a nova senha.
- Bloquear usa desativação reversível e preserva pedidos, carteira, auditoria e dados históricos.
- Dados oficiais continuam na API; o frontend não infere autorização nem agrega grandes conjuntos por requisições N+1.
- Pedidos e carteira usam contratos administrativos filtrados por `userId`; onde faltarem agregados, serão adicionados contratos somente de leitura.
- Filtros ficam na URL; preferências duradouras adicionais podem usar armazenamento local sem guardar dados pessoais.
