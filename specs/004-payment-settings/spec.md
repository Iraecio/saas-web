# Feature Specification: Configuração de Meios de Pagamento

**Feature Branch**: `004-payment-settings`

**Created**: 2026-07-29

**Status**: Ready

**Input**: User description: "Analisar a implementação de pagamentos da saas-api e criar páginas de configuração para o superadmin e para o revendedor."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Superadmin configura pagamentos da plataforma (Priority: P1)

Como superadmin, quero administrar as opções de pagamento recebidas pela plataforma para disponibilizar às revendas somente meios válidos e operacionais.

**Why this priority**: As opções da plataforma governam como a revenda paga suas compras de créditos e quais modalidades podem ser usadas pelas próprias revendas.

**Independent Test**: Um superadmin consegue acessar Configurações > Pagamento, cadastrar ou alterar políticas, criar uma configuração, validá-la, ativá-la e suspendê-la.

**Acceptance Scenarios**:

1. **Given** um superadmin autenticado, **When** acessa Pagamento, **Then** visualiza políticas globais e configurações da plataforma com modalidade, situação, prioridade e validação.
2. **Given** uma política suportada, **When** o superadmin salva uma configuração completa, valida e ativa, **Then** ela aparece ativa sem revelar credenciais.
3. **Given** uma configuração ativa, **When** o superadmin informa uma justificativa e a suspende, **Then** a configuração deixa de receber novas operações e a justificativa é registrada.
4. **Given** uma política global, **When** o superadmin altera a disponibilidade para plataforma ou revendas, **Then** a tela apresenta o resultado persistido e as configurações incompatíveis não podem ser ativadas.

---

### User Story 2 - Revendedor configura pagamentos dos clientes (Priority: P1)

Como responsável por uma revenda, quero definir meus próprios meios de recebimento para vender créditos aos meus clientes usando apenas modalidades autorizadas pela plataforma.

**Why this priority**: Sem uma configuração de recebimento própria, o revendedor não consegue concluir a venda de créditos aos clientes.

**Independent Test**: Um revendedor ou gerente acessa Configurações > Pagamento, vê apenas políticas autorizadas, cria ou edita uma configuração própria, valida e ativa o meio.

**Acceptance Scenarios**:

1. **Given** um responsável de revenda autenticado, **When** acessa Pagamento, **Then** visualiza somente suas configurações e as modalidades autorizadas para revendas.
2. **Given** uma modalidade autorizada, **When** salva dados públicos e credenciais válidos, **Then** consegue validar e ativar o meio para seus clientes.
3. **Given** uma configuração de outra revenda ou uma modalidade não autorizada, **When** tenta operá-la, **Then** o acesso é negado e nenhum dado de terceiros é mostrado.
4. **Given** uma configuração já salva com credencial, **When** o revendedor a edita sem preencher nova credencial, **Then** a credencial existente não é exibida nem apagada.

---

### User Story 3 - Operador entende e recupera falhas de configuração (Priority: P2)

Como operador autorizado, quero receber orientações claras durante carregamento, validação e salvamento para corrigir uma configuração sem criar duplicidades.

**Why this priority**: Configurações financeiras incorretas impedem vendas e exigem retorno claro e seguro.

**Independent Test**: Simular respostas vazias e falhas de listagem, salvamento, validação e ativação, confirmando estados compreensíveis e tentativa novamente.

**Acceptance Scenarios**:

1. **Given** uma falha ao carregar, **When** a página recebe o erro, **Then** apresenta a mensagem e permite tentar novamente.
2. **Given** dados obrigatórios ausentes ou JSON inválido, **When** o operador tenta salvar, **Then** a tela bloqueia o envio e identifica o campo a corrigir.
3. **Given** uma operação em andamento, **When** o operador aciona novamente o mesmo comando, **Then** a tela evita envio duplicado.

### Edge Cases

- A API não possui políticas cadastradas: a tela explica que nenhuma modalidade está disponível; somente o superadmin pode criar a primeira política.
- Uma política é desabilitada depois que uma configuração foi criada: a configuração permanece visível para auditoria, mas sua validação ou ativação pode ser recusada.
- Alterar dados públicos ou credenciais devolve a configuração ao estado de rascunho e exige nova validação.
- Credenciais nunca retornam em texto; a interface informa apenas se já existem.
- Uma configuração validada é alterada por outra sessão antes da ativação: o erro da fonte oficial é apresentado e os dados são recarregáveis.
- O usuário troca de rota durante uma requisição: atualizações tardias não devem modificar uma página destruída.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exibir a seção Pagamento em Configurações somente para superadmin, revendedor e gerente de revenda.
- **FR-002**: O superadmin MUST poder listar e salvar políticas globais, incluindo código do provedor, modalidade, nome e disponibilidade para plataforma e revendas.
- **FR-003**: O superadmin MUST poder listar, criar e editar configurações de recebimento da plataforma.
- **FR-004**: O superadmin MUST poder validar, ativar e suspender uma configuração da plataforma; a suspensão MUST exigir justificativa.
- **FR-005**: O revendedor e o gerente de revenda MUST poder listar, criar e editar somente configurações pertencentes à sua revenda.
- **FR-006**: O revendedor e o gerente de revenda MUST poder validar e ativar suas configurações.
- **FR-007**: A criação de configuração MUST permitir escolher uma política autorizada, definir nome, prioridade, moeda, dados públicos e, quando necessário, credenciais.
- **FR-008**: A edição MUST permitir alterar nome, prioridade, dados públicos e credenciais, preservando a credencial existente quando nenhuma substituição for informada.
- **FR-009**: A interface MUST representar claramente os estados rascunho, ativo, suspenso, inativo e inválido, além da data de validação.
- **FR-010**: A interface MUST ocultar valores secretos retornados ou informados depois do salvamento e MUST exibir apenas a existência de credenciais.
- **FR-011**: A interface MUST impedir ativação enquanto a configuração não estiver validada.
- **FR-012**: A interface MUST validar campos obrigatórios, moeda com três caracteres, prioridade não negativa e objetos de configuração em formato válido antes do envio.
- **FR-013**: A página MUST fornecer estados de carregamento, vazio, sucesso e erro, com opção de repetir o carregamento.
- **FR-014**: A página MUST impedir comandos duplicados enquanto uma operação estiver em andamento.
- **FR-015**: A navegação e as rotas MUST aplicar as mesmas permissões da página, inclusive em acesso direto por URL.
- **FR-016**: A solução MUST consumir os contratos existentes de pagamentos sem replicar no navegador regras de autorização, criptografia ou ativação.

### Key Entities

- **Política de Meio de Pagamento**: Modalidade global identificada por provedor, tipo e nome, com autorização independente para plataforma e revendas.
- **Configuração de Pagamento**: Meio de recebimento pertencente à plataforma ou a uma revenda, ligado a uma política, com nome, prioridade, moeda, dados públicos, estado e validação.
- **Credencial**: Dados secretos opcionais de uma configuração; nunca são recuperados em claro e podem ser substituídos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuário autorizado configura, valida e ativa um meio de pagamento em até 10 minutos quando possui os dados necessários.
- **SC-002**: 100% dos acessos diretos à página por papéis não autorizados são bloqueados.
- **SC-003**: 100% dos fluxos testados preservam credenciais existentes quando o campo de substituição não é preenchido.
- **SC-004**: 100% das configurações ativas exibidas foram previamente validadas.
- **SC-005**: Em testes de isolamento, nenhum responsável de revenda visualiza ou altera configurações de outra revenda.
- **SC-006**: Todos os erros simulados de carregamento e operação deixam uma orientação visível e uma forma segura de nova tentativa.

## Assumptions

- A API de pagamentos existente é a fonte de verdade e já aplica autenticação, autorização, isolamento e proteção de credenciais.
- O escopo desta feature é configuração de meios de pagamento; cobrança, comprovantes, transações e conciliação ficam fora desta página.
- Dados específicos de cada adaptador são informados como objetos estruturados, pois a API ainda não expõe um esquema de formulário por provedor.
- Somente a plataforma pode suspender configurações pelo contrato atual; a revenda pode criar, editar, validar e ativar.
- Revendedor e gerente de revenda compartilham as mesmas capacidades definidas pela API.
