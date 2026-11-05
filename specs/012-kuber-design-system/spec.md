# Feature Specification: Design system inspirado no Kuber

**Feature Branch**: `012-kuber-design-system`

**Created**: 2026-11-05

**Status**: Ready

**Input**: Mapear o design system do template Kuber em `.templates/main` e aplicar a mesma linguagem visual ao projeto.

## User Scenarios & Testing

### User Story 1 - Experiência visual coerente (Priority: P1)

Como usuário autenticado, quero que navegação, páginas, cards, tabelas, formulários e ações compartilhem a linguagem visual do Kuber para reconhecer hierarquia e padrões de interação em qualquer área do produto.

**Why this priority**: A fundação visual global entrega consistência a todas as personas sem alterar seus fluxos.

**Independent Test**: Acessar dashboard, listagem e formulário e confirmar que cores, tipografia, superfícies, espaçamentos e estados seguem o mesmo padrão.

**Acceptance Scenarios**:

1. **Given** uma página autenticada, **When** ela é exibida, **Then** o shell, fundo, superfícies e tipografia seguem os tokens mapeados do Kuber.
2. **Given** botões, campos, cards, badges e tabelas, **When** aparecem em páginas diferentes, **Then** mantêm aparência e estados equivalentes.
3. **Given** uma interação por mouse ou teclado, **When** o controle recebe hover, foco, pressionamento ou desabilitação, **Then** o estado é visível e consistente.

---

### User Story 2 - Navegação responsiva e reconhecível (Priority: P2)

Como usuário em desktop ou tela compacta, quero um cabeçalho e menu lateral no padrão Kuber para localizar a seção atual e acessar as funções sem perder contexto.

**Why this priority**: Navegação é a superfície mais recorrente do produto.

**Independent Test**: Alternar o menu, navegar entre rotas e redimensionar a janela, verificando seleção ativa, leitura dos rótulos e acesso ao conteúdo.

**Acceptance Scenarios**:

1. **Given** o menu expandido ou recolhido, **When** uma rota está ativa, **Then** seu item apresenta destaque azul e marcador visual.
2. **Given** uma tela compacta, **When** o menu é recolhido, **Then** o conteúdo continua acessível sem rolagem horizontal da página.
3. **Given** o cabeçalho, **When** menus e notificações são abertos, **Then** suas superfícies seguem o mesmo padrão de elevação e contraste.

---

### User Story 3 - Tema escuro equivalente (Priority: P3)

Como usuário que prefere tema escuro, quero a mesma hierarquia e legibilidade do tema claro sem flashes ou componentes desconectados.

**Why this priority**: O produto já oferece alternância de tema e precisa preservar essa capacidade.

**Independent Test**: Alternar o tema e percorrer dashboard, tabela, formulário e menus verificando contraste, bordas e estados.

**Acceptance Scenarios**:

1. **Given** o tema escuro, **When** qualquer componente compartilhado é exibido, **Then** usa superfícies azul-marinho e texto legível coerentes com o Kuber.
2. **Given** uma preferência salva, **When** a aplicação é recarregada, **Then** o tema permanece sem alterar a funcionalidade existente.

### Edge Cases

- Textos longos e e-mails não devem romper menu, cabeçalho, cards ou tabelas.
- Estados vazios, carregando, erro e desabilitado devem continuar legíveis nos dois temas.
- Componentes Angular Material devem receber os mesmos raios, cores e densidade visual.
- O design deve respeitar redução de movimento e foco visível.

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE centralizar cores, tipografia, espaçamento, raios, sombras e camadas em tokens semânticos.
- **FR-002**: O tema claro DEVE reproduzir a base Kuber: canvas `#ecf0f4`, superfícies brancas, azul `#005cbb` e texto cinza-azulado.
- **FR-003**: O tema escuro DEVE reproduzir a base Kuber: canvas `#232b3e`, superfícies `#1a202e` e texto `#96a2b4`.
- **FR-004**: O shell autenticado DEVE adotar cabeçalho fixo visual, menu lateral elevado e área de conteúdo com espaçamento responsivo.
- **FR-005**: Cards, botões, campos, badges, tabelas e menus DEVE usar os tokens e estados compartilhados.
- **FR-006**: A navegação DEVE destacar a rota ativa e preservar os menus por papel existentes.
- **FR-007**: O sistema DEVE manter tema claro/escuro, responsividade, foco de teclado e redução de movimento.
- **FR-008**: A mudança NÃO DEVE alterar rotas, permissões, chamadas de API ou regras de negócio.
- **FR-009**: A página de UI kit DEVE permitir inspeção dos componentes compartilhados após a migração.
- **FR-010**: O build SSR e os testes existentes DEVEM continuar aprovados.
- **FR-011**: As telas de autenticação DEVEM adotar o card dividido e responsivo do Kuber, com formulário e painel visual.
- **FR-012**: Páginas de listagem DEVEM adotar cabeçalho compacto, toolbar integrada, tabela densa, ações e paginação coerentes.
- **FR-013**: Formulários, estados vazios, carregamento e erro DEVEM compartilhar a mesma linguagem visual nas páginas existentes.

### Key Entities

- **Token visual**: valor semântico reutilizável para cor, superfície, texto, borda, raio, sombra, espaçamento, camada ou movimento.
- **Componente compartilhado**: padrão reutilizável de botão, card, badge, tabela, cabeçalho, menu ou estado.
- **Tema**: conjunto claro ou escuro de valores dos mesmos tokens semânticos.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% dos componentes compartilhados alterados usam tokens semânticos, sem novas cores estruturais isoladas.
- **SC-002**: Usuários identificam rota ativa, ação primária e agrupamento de conteúdo nas páginas verificadas em ambos os temas.
- **SC-003**: Dashboard, listagem, formulário e UI kit permanecem utilizáveis entre 320 px e 1440 px sem rolagem horizontal da página.
- **SC-004**: Todos os controles interativos alterados têm estados perceptíveis de hover, foco, pressionado e desabilitado.
- **SC-005**: Build de produção e suíte de testes terminam sem regressões.

## Assumptions

- A linguagem visual será reproduzida no Tailwind/CSS atual; Bootstrap e o pacote completo do template não serão adicionados.
- Outfit será mantida como tipografia do produto, com densidade e hierarquia aproximadas do Kuber.
- O primeiro incremento cobre a fundação global, o shell e os componentes compartilhados; páginas herdam o sistema sem reescrita funcional.
- Assets e código do Kuber servem como referência licenciada fornecida pelo usuário.
