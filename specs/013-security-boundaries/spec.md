# Feature Specification: Endurecimento das Fronteiras de Segurança

**Feature Branch**: `013-security-boundaries`

**Created**: 2026-11-09

**Status**: Ready

**Input**: Corrigir regras de negócio no navegador, segredos versionados, isolamento do banco, seleção de faixa de locução e armazenamento de tokens, preservando as proteções existentes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Operações financeiras confiáveis (Priority: P1)

Como operador ou cliente, quero que preços, totais, limites e permissões sejam decididos pelo serviço confiável, para que alterações feitas no navegador não mudem o resultado financeiro ou concedam capacidades extras.

**Why this priority**: Valores e autorizações adulteráveis geram perda financeira e escalada de privilégio.

**Independent Test**: Enviar requisições adulteradas diretamente, sem usar a interface, e confirmar que o resultado usa os dados vigentes do servidor ou é rejeitado.

**Acceptance Scenarios**:

1. **Given** um pedido de locução e um texto informado, **When** o cliente envia uma faixa de serviço incompatível ou mais barata, **Then** o sistema rejeita a combinação ou seleciona a faixa calculada pelo servidor.
2. **Given** um preço, papel, limite ou status alterado no navegador, **When** a operação chega ao servidor, **Then** o valor não confiável é ignorado e a regra vigente é aplicada.

---

### User Story 2 - Dados isolados por identidade (Priority: P1)

Como usuário, quero que o acesso direto ao banco e aos arquivos respeite minha identidade e meu escopo, para que usuários anônimos ou de outra conta não leiam nem alterem meus dados.

**Why this priority**: Policies amplas permitem comprometimento transversal de dados e arquivos.

**Independent Test**: Executar operações de leitura e escrita como anônimo, usuário A, usuário B e serviço administrativo, confirmando negação por padrão e acesso mínimo esperado.

**Acceptance Scenarios**:

1. **Given** uma sessão anônima, **When** ela tenta gravar ou apagar objetos, **Then** a operação é negada.
2. **Given** dois usuários distintos, **When** um tenta acessar a linha ou objeto do outro, **Then** a operação é negada.
3. **Given** uma tabela sem acesso direto necessário, **When** qualquer papel de cliente consulta a tabela, **Then** nenhuma linha fica acessível.

---

### User Story 3 - Credenciais fora do código e do navegador (Priority: P1)

Como responsável pela plataforma, quero que credenciais administrativas nunca sejam versionadas ou entregues ao navegador, e que sessões persistentes não possam ser lidas por scripts, para reduzir o impacto de vazamentos e scripts comprometidos.

**Why this priority**: Credenciais administrativas contornam o isolamento e refresh tokens prolongam o comprometimento de sessão.

**Independent Test**: Inspecionar bundle, armazenamento do navegador e repositório; nenhuma chave administrativa ou refresh token deve estar acessível.

**Acceptance Scenarios**:

1. **Given** o código versionado, **When** ele é pesquisado por credenciais administrativas, **Then** somente referências a variáveis protegidas são encontradas.
2. **Given** uma sessão autenticada, **When** scripts consultam os armazenamentos do navegador, **Then** o refresh token não é legível.
3. **Given** um refresh token reutilizado depois de rotacionado, **When** ocorre nova tentativa de renovação, **Then** a sessão é rejeitada e revogada conforme a política.

### Edge Cases

- O banco existente contém linhas sem proprietário ou com vínculo de revenda nulo.
- Uma migration é aplicada mais de uma vez durante recuperação de ambiente.
- Um serviço de locução antigo não possui limite de duração estruturado.
- A sessão é renovada simultaneamente em duas abas.
- Cookies são enviados de uma origem não autorizada ou em requisição forjada.
- Ambientes locais precisam de credenciais determinísticas sem transformar esses valores em segredos reutilizáveis.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST tratar todo valor, papel, permissão e limite recebido do navegador como não confiável.
- **FR-002**: O sistema MUST calcular no servidor a duração estimada de locução e validar a faixa de serviço selecionada.
- **FR-003**: Serviços de locução MUST possuir limite de duração estruturado; descrições textuais não podem ser a fonte de autorização ou preço.
- **FR-004**: O servidor MUST buscar preço, custo, revisões, proprietário, papel e status vigentes antes de executar operações sensíveis.
- **FR-005**: Todas as tabelas em schemas expostos MUST ter isolamento de linha habilitado e negar acesso quando nenhuma policy explícita autorizar a operação.
- **FR-006**: Policies MUST ser separadas por operação e vincular acesso à identidade ou ao escopo de revenda verificável.
- **FR-007**: Campos de papel, saldo, crédito, preço de custo, status financeiro, propriedade e auditoria MUST ser alteráveis apenas pelo servidor autorizado.
- **FR-008**: Objetos de armazenamento MUST ser legíveis e mutáveis apenas conforme bucket, proprietário e finalidade; escrita anônima irrestrita é proibida.
- **FR-009**: Credenciais administrativas e segredos de assinatura MUST ser fornecidos por configuração protegida e nunca por valores versionados reutilizáveis.
- **FR-010**: A chave administrativa do banco MUST permanecer exclusiva do servidor e nunca integrar bundle ou resposta ao navegador.
- **FR-011**: Refresh tokens MUST ser armazenados em cookie inacessível a scripts, com transporte seguro, política de mesma origem e rotação.
- **FR-012**: Requisições autenticadas por cookie que alterem estado MUST possuir defesa contra falsificação entre sites.
- **FR-013**: O sistema MUST preservar login, logout, renovação de sessão e uso simultâneo legítimo sem expor o refresh token.
- **FR-014**: Cada grupo de policies MUST ser entregue em migration separada, reversível e testável.
- **FR-015**: Nenhuma correção pode desabilitar autenticação, autorização, isolamento ou validação existente.
- **FR-016**: Testes MUST cobrir adulteração de preço/faixa, acesso cruzado, acesso anônimo, rotação de sessão e fluxos legítimos.

### Key Entities

- **Faixa de Serviço**: Serviço contratável com papel profissional, custo em créditos, revisões e limite máximo de duração.
- **Sessão**: Relação autenticada com access token efêmero, refresh token rotacionável e metadados de revogação.
- **Recurso Isolado**: Linha ou objeto com proprietário, revenda e campos sensíveis sujeitos a autorização.
- **Credencial de Serviço**: Segredo administrativo usado apenas por processos confiáveis.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das tentativas testadas de adulterar faixa, preço, papel, saldo ou status são ignoradas ou rejeitadas pelo servidor.
- **SC-002**: 100% das tabelas dos schemas expostos possuem isolamento habilitado e comportamento de negação por padrão documentado.
- **SC-003**: Usuários anônimos não conseguem inserir, alterar ou apagar nenhum objeto de armazenamento.
- **SC-004**: Nenhum segredo administrativo ou refresh token aparece no bundle, no código versionado ou em armazenamento legível por scripts.
- **SC-005**: Login, renovação e logout legítimos continuam funcionando em todos os testes de regressão.
- **SC-006**: Todas as migrations de segurança podem ser aplicadas em banco limpo e banco atualizado sem perda de dados.

## Assumptions

- O acesso da aplicação ao banco continua ocorrendo pela API confiável; acesso PostgREST direto ao domínio principal não é requisito do frontend atual.
- Tabelas sem caso explícito de acesso direto ao cliente adotam negação por padrão.
- Credenciais locais podem ser geradas durante a inicialização, mas não serão reutilizadas em ambientes compartilhados.
- A estimativa inicial de locução continua usando 150 palavras por minuto até existir regra de negócio diferente, porém passa a ser calculada e validada no servidor.
- A mudança de cookies pode exigir configuração de domínio e CORS específica por ambiente, sem relaxar `Secure`, `HttpOnly` ou proteção CSRF em produção.
