# Feature Specification: Cobertura Completa da API no Frontend

**Feature Branch**: `001-full-api-coverage`

**Created**: 2026-05-23

**Status**: Draft

---

## Visão Geral

O frontend (saas-web) deve cobrir todos os cenários já disponíveis na API do backend (saas-api). A plataforma é um SaaS multi-tenant com suporte a revendedores, onde diferentes perfis de usuários (super admin, admin, revendedor, gerente de revenda, locutor, produtor e cliente) têm fluxos e telas específicos. O objetivo é garantir que cada endpoint disponível tenha uma interface de usuário correspondente, organizada por papel e contexto de acesso.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Autenticação e Gestão de Sessão (Priority: P1)

Qualquer visitante pode criar uma conta, fazer login, renovar sua sessão automaticamente e encerrar a sessão com segurança. Revendedores têm um fluxo de cadastro próprio que gera um subdomínio padrão para a sua revenda.

**Why this priority**: Sem autenticação nenhuma outra funcionalidade é acessível. É a porta de entrada para todos os outros fluxos.

**Independent Test**: Pode ser testado completamente abrindo o site sem autenticação, criando uma conta, fazendo login, e verificando que o acesso ao dashboard é liberado. Entrega valor imediato ao permitir o uso da plataforma.

**Acceptance Scenarios**:

1. **Given** um visitante sem conta, **When** preenche e envia o formulário de registro, **Then** a conta é criada e o usuário é redirecionado ao dashboard.
2. **Given** um visitante com conta, **When** preenche e-mail e senha válidos no login, **Then** acessa o dashboard e a sessão é iniciada.
3. **Given** um usuário com sessão ativa, **When** o token de acesso expira, **Then** a sessão é renovada automaticamente sem interrupção.
4. **Given** um usuário autenticado, **When** clica em "Sair", **Then** a sessão é encerrada e ele é redirecionado à tela de login.
5. **Given** um visitante que deseja criar uma revenda, **When** preenche o formulário de registro de revendedor, **Then** a conta revendedor é criada e um subdomínio padrão é exibido.
6. **Given** um usuário inativo, **When** tenta fazer login com credenciais corretas, **Then** recebe mensagem informando que a conta está inativa.
7. **Given** o sistema ainda sem super admin, **When** um administrador acessa a rota de bootstrap e envia os dados, **Then** o primeiro super admin é criado e o sistema fica operacional.

---

### User Story 2 — Perfil e Configurações do Próprio Usuário (Priority: P1)

Todo usuário autenticado pode visualizar e atualizar suas próprias informações de perfil. Perfis especializados (locutor, produtor, cliente) possuem campos adicionais relevantes ao seu papel.

**Why this priority**: Gestão do próprio perfil é necessidade universal; impacta diretamente a experiência de todos os papéis.

**Independent Test**: Acessar a página de perfil após login, editar um campo e confirmar que a alteração é salva e exibida corretamente.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado, **When** acessa a página de perfil, **Then** vê seus dados atuais (nome, e-mail, avatar, cargo, departamento).
2. **Given** um usuário autenticado, **When** edita e salva o perfil próprio, **Then** as alterações são refletidas imediatamente na interface.
3. **Given** um usuário com papel VOICE_ACTOR, **When** acessa a seção de perfil de locutor, **Then** pode visualizar e editar informações específicas de locutor.
4. **Given** um usuário com papel PRODUCER, **When** acessa o perfil de produtor, **Then** pode visualizar e editar informações específicas de produtor.
5. **Given** um usuário com papel CLIENT, **When** acessa o perfil de cliente, **Then** pode visualizar e editar informações específicas de cliente.
6. **Given** qualquer usuário autenticado, **When** acessa a seção de armazenamento do perfil, **Then** vê a cota utilizada e o limite disponível.

---

### User Story 3 — Gestão de Usuários pelo Admin (Priority: P2)

Administradores e super admins podem listar, visualizar, editar e desativar usuários da plataforma, além de conceder e revogar permissões granulares.

**Why this priority**: Controle de acesso e gestão de usuários são essenciais para a operação da plataforma; sem isso o admin não consegue gerenciar a base de usuários.

**Independent Test**: Fazer login como admin, acessar a lista de usuários, filtrar por papel, abrir o detalhe de um usuário, editar um campo e verificar que a alteração é salva.

**Acceptance Scenarios**:

1. **Given** um admin autenticado, **When** acessa o painel de usuários, **Then** vê a lista paginada de todos os usuários com opções de filtro por papel.
2. **Given** um admin, **When** busca um usuário específico por ID, **Then** vê o detalhe completo daquele usuário.
3. **Given** um admin, **When** edita dados de um usuário, **Then** as alterações são salvas com sucesso.
4. **Given** um super admin, **When** desativa um usuário, **Then** o usuário é marcado como inativo e não consegue mais fazer login.
5. **Given** um admin, **When** concede uma permissão específica a um usuário, **Then** a permissão aparece na lista de permissões do usuário.
6. **Given** um admin, **When** revoga uma permissão de um usuário, **Then** a permissão é removida e o usuário perde o acesso correspondente.
7. **Given** um admin, **When** filtra a lista de usuários por papel (ex: apenas REVENDEDORs), **Then** somente usuários daquele papel são exibidos.

---

### User Story 4 — Solicitações de Mudança de Papel (Priority: P2)

Usuários autenticados podem solicitar a mudança de seu papel na plataforma (ex: cliente querendo se tornar locutor). Admins podem revisar, aprovar ou rejeitar essas solicitações com justificativa.

**Why this priority**: Permite o crescimento orgânico da base de locutores e produtores sem intervenção manual constante do admin; já totalmente implementado na API.

**Independent Test**: Fazer login como CLIENT, criar uma solicitação para VOICE_ACTOR, fazer login como admin e aprovar a solicitação. Verificar que o papel do usuário foi alterado.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado, **When** acessa a área de solicitação de papel e envia uma solicitação com justificativa, **Then** a solicitação é criada com status "Pendente".
2. **Given** um usuário com solicitações ativas, **When** acessa "Minhas Solicitações", **Then** vê todas as suas solicitações com status atualizado.
3. **Given** um admin, **When** acessa o painel de solicitações de papel, **Then** vê todas as solicitações paginadas com opção de filtrar por status.
4. **Given** um admin, **When** abre uma solicitação específica, **Then** vê todos os detalhes incluindo portfólio, amostras de áudio e notas enviadas pelo solicitante.
5. **Given** um admin, **When** aprova uma solicitação, **Then** o papel do usuário é atualizado automaticamente e o status da solicitação muda para "Aprovado".
6. **Given** um admin, **When** rejeita uma solicitação com motivo, **Then** o status muda para "Rejeitado" e o motivo fica visível para o usuário.

---

### User Story 5 — Domínios Customizados do Revendedor (Priority: P2)

Revendedores e gerentes de revenda podem registrar domínios personalizados para a sua instância, listar domínios registrados e desativar domínios que não são mais necessários.

**Why this priority**: Permite que revendedores apresentem a plataforma sob sua própria marca, feature central do modelo multi-tenant.

**Independent Test**: Fazer login como RESELLER, registrar um novo domínio customizado, verificar que as instruções DNS são exibidas e listar os domínios da revenda.

**Acceptance Scenarios**:

1. **Given** um revendedor autenticado, **When** acessa a seção de domínios e registra um novo domínio, **Then** recebe as instruções de configuração de DNS para ativar o domínio.
2. **Given** um revendedor, **When** acessa a lista de domínios, **Then** vê todos os domínios registrados com seus status.
3. **Given** um revendedor, **When** desativa um domínio existente, **Then** o domínio é marcado como inativo.
4. **Given** um admin, **When** acessa domínios de qualquer revendedor, **Then** pode visualizar e gerenciar os domínios sem restrição de tenant.
5. **Given** um revendedor tentando gerenciar domínios de outro revendedor, **When** tenta acessar, **Then** recebe mensagem de acesso negado.

---

### User Story 6 — Gestão de Revendedores pelo Admin (Priority: P2)

Admins e super admins têm acesso a um painel que lista todos os revendedores cadastrados na plataforma, sem filtro de tenant.

**Why this priority**: Visibilidade global da base de revendedores é necessidade operacional para admins da plataforma.

**Independent Test**: Fazer login como admin, acessar o painel de revendedores e verificar que todos os revendedores da plataforma são listados.

**Acceptance Scenarios**:

1. **Given** um admin autenticado, **When** acessa o painel de revendedores, **Then** vê a lista completa de todos os revendedores da plataforma.
2. **Given** um usuário sem papel de admin, **When** tenta acessar o painel de revendedores, **Then** recebe mensagem de acesso negado (403).

---

### User Story 7 — Carteira do Usuário (Priority: P3)

Todo usuário autenticado pode consultar o saldo da sua carteira, listar seus créditos com histórico completo de eventos, solicitar reembolsos, abrir disputas e ver notificações relacionadas à carteira.

**Why this priority**: Gestão financeira pessoal é importante mas não bloqueia o uso básico da plataforma; pode ser entregue após os fluxos de autenticação e perfil.

**Independent Test**: Acessar a carteira do usuário, verificar saldo e histórico de créditos; simular uma solicitação de reembolso e verificar que aparece na lista de reembolsos.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado, **When** acessa a carteira, **Then** vê o saldo atual disponível.
2. **Given** um usuário, **When** lista os créditos, **Then** vê a listagem com paginação por cursor e pode filtrar por status e tipo.
3. **Given** um usuário, **When** abre um crédito específico, **Then** vê o ciclo de vida completo com todos os eventos e disputas.
4. **Given** um usuário, **When** reporta uma disputa sobre um crédito, **Then** a disputa é registrada e fica visível no histórico do crédito.
5. **Given** um usuário, **When** solicita reembolso de um crédito com justificativa, **Then** a solicitação é registrada com status "Solicitado".
6. **Given** um usuário, **When** lista seus reembolsos, **Then** vê todas as solicitações com status atualizado.
7. **Given** um usuário, **When** acessa as notificações da carteira, **Then** vê alertas sobre créditos prestes a vencer, congelados ou com ação pendente.

---

### User Story 8 — Painel Financeiro do Admin (Priority: P3)

Admins e super admins têm acesso a ferramentas completas de gestão financeira: listagem de carteiras, busca global de créditos, gestão de reembolsos, resolução de disputas, reconciliação de saldo, log de auditoria e analytics financeiros. Super admins podem emitir e cancelar créditos.

**Why this priority**: Controle financeiro é crítico para operação do SaaS mas pressupõe que usuários já estão usando a carteira; implementado após fluxos de usuário.

**Independent Test**: Fazer login como admin, acessar o painel financeiro, listar carteiras de usuários, visualizar analytics e aprovar um reembolso pendente.

**Acceptance Scenarios**:

1. **Given** um admin, **When** acessa o painel de carteiras, **Then** vê todas as carteiras de usuários com opção de busca por userId.
2. **Given** um admin, **When** acessa o detalhe de uma carteira, **Then** vê saldo, créditos e histórico do usuário.
3. **Given** um admin, **When** usa a busca global de créditos com filtros, **Then** vê somente créditos que correspondem aos critérios.
4. **Given** um admin, **When** lista as disputas abertas, **Then** pode filtrar por status e atualizar com notas de investigação e resolução.
5. **Given** um admin, **When** aprova um reembolso pendente, **Then** o status muda para "Aprovado" e o crédito é processado.
6. **Given** um admin, **When** rejeita um reembolso com motivo, **Then** o status muda para "Rejeitado" e o motivo é registrado.
7. **Given** um admin, **When** acessa o log de auditoria, **Then** pode filtrar por carteira, crédito, ação e ver o histórico completo para fins de conformidade.
8. **Given** um admin, **When** acessa os analytics financeiros com filtro de período, **Then** vê métricas agregadas de créditos, reembolsos e disputas.
9. **Given** um admin, **When** visualiza resultados de reconciliação, **Then** pode identificar divergências de saldo e encaminhá-las para correção.
10. **Given** um super admin, **When** identifica uma divergência de reconciliação, **Then** pode corrigir o saldo manualmente com justificativa.
11. **Given** um super admin, **When** emite créditos para um usuário com tipo, valor e origem, **Then** os créditos aparecem na carteira do usuário.
12. **Given** um super admin, **When** cancela créditos, **Then** os créditos são marcados como cancelados e o saldo é ajustado.

---

### User Story 9 — Armazenamento de Arquivos (Priority: P3)

Usuários autenticados podem fazer upload de arquivos (imagens, áudios, documentos), gerar links de acesso temporários para arquivos e deletar arquivos.

**Why this priority**: Armazenamento é funcionalidade de suporte para outros fluxos (ex: portfolio de locutor); não é bloqueante para uso básico.

**Independent Test**: Fazer login, acessar a área de upload, enviar um arquivo de imagem, gerar um link assinado e verificar que o arquivo é acessível pelo link.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado, **When** faz upload de um arquivo (até 50MB) selecionando o bucket correto (imagens, áudios ou documentos), **Then** o arquivo é armazenado e um identificador de caminho é retornado.
2. **Given** um usuário, **When** solicita um link de acesso temporário para um arquivo com tempo de expiração, **Then** recebe uma URL que permite acesso ao arquivo durante o período definido.
3. **Given** um usuário, **When** deleta um arquivo informando bucket e caminho, **Then** o arquivo é removido permanentemente.
4. **Given** um usuário tentando fazer upload de arquivo maior que 50MB, **When** confirma o envio, **Then** recebe mensagem de erro informando o limite excedido.

---

### Edge Cases

- O que acontece quando um usuário tenta acessar uma página de papel diferente do seu (ex: CLIENT tentando acessar painel de admin)? → Deve ser redirecionado ou receber mensagem de acesso negado.
- O que acontece quando o refresh token expira e não é possível renovar a sessão? → Usuário deve ser redirecionado à tela de login.
- O que acontece quando o sistema de bootstrap é chamado novamente após já ter sido inicializado? → Deve exibir mensagem de erro informando que o sistema já está configurado (HTTP 409).
- O que acontece quando um revendedor tenta registrar um domínio já existente? → Deve receber mensagem de conflito (domínio já registrado).
- O que acontece quando a lista de créditos chega ao fim durante scroll infinito/paginação? → Deve exibir mensagem "nenhum crédito adicional" e parar de carregar.
- O que acontece quando admin tenta desativar um super admin? → Deve receber erro de permissão insuficiente.
- O que acontece quando um usuário faz upload de tipo de arquivo não suportado para um bucket específico? → Deve receber validação de erro antes do upload.

---

## Requirements *(mandatory)*

### Functional Requirements

**Autenticação**

- **FR-001**: O sistema DEVE permitir que visitantes criem contas com e-mail e senha.
- **FR-002**: O sistema DEVE vincular automaticamente novos usuários ao revendedor quando o cadastro é feito a partir do domínio de um revendedor.
- **FR-003**: O sistema DEVE permitir que visitantes façam login com e-mail e senha, recebendo tokens de acesso e renovação.
- **FR-004**: O sistema DEVE renovar tokens de acesso automaticamente utilizando o token de renovação, sem interromper a sessão do usuário.
- **FR-005**: O sistema DEVE revogar todos os tokens ativos ao encerrar a sessão do usuário.
- **FR-006**: O sistema DEVE bloquear o login de usuários inativos com mensagem explicativa.
- **FR-007**: O sistema DEVE permitir que um novo revendedor se cadastre e receba automaticamente um subdomínio padrão.
- **FR-008**: O sistema DEVE permitir a criação do primeiro super admin via rota de bootstrap quando o sistema ainda não foi inicializado.

**Perfil do Usuário**

- **FR-009**: O sistema DEVE exibir o perfil completo do usuário autenticado.
- **FR-010**: O sistema DEVE permitir que o usuário atualize seus próprios dados de perfil.
- **FR-011**: O sistema DEVE exibir e permitir edição do perfil especializado de locutor para usuários com papel VOICE_ACTOR.
- **FR-012**: O sistema DEVE exibir e permitir edição do perfil especializado de produtor para usuários com papel PRODUCER.
- **FR-013**: O sistema DEVE exibir e permitir edição do perfil especializado de cliente para usuários com papel CLIENT.
- **FR-014**: O sistema DEVE exibir a cota de armazenamento utilizada e o limite disponível para o usuário.

**Gestão de Usuários (Admin)**

- **FR-015**: O sistema DEVE listar todos os usuários de forma paginada para admins, com filtro por papel.
- **FR-016**: O sistema DEVE permitir que admins visualizem o detalhe de qualquer usuário.
- **FR-017**: O sistema DEVE permitir que admins editem dados de qualquer usuário.
- **FR-018**: O sistema DEVE permitir que apenas super admins desativem usuários.
- **FR-019**: O sistema DEVE permitir que admins concedam permissões granulares a usuários com data de expiração opcional.
- **FR-020**: O sistema DEVE permitir que admins revoguem permissões de usuários.

**Solicitações de Papel**

- **FR-021**: O sistema DEVE permitir que qualquer usuário autenticado crie uma solicitação de mudança de papel com justificativa, amostras e notas de portfólio.
- **FR-022**: O sistema DEVE listar as solicitações de papel do próprio usuário.
- **FR-023**: O sistema DEVE listar todas as solicitações para admins com filtro por status e paginação.
- **FR-024**: O sistema DEVE permitir que admins aprovem solicitações, atualizando automaticamente o papel do usuário.
- **FR-025**: O sistema DEVE permitir que admins rejeitem solicitações com motivo obrigatório.

**Domínios Customizados**

- **FR-026**: O sistema DEVE permitir que revendedores registrem domínios customizados e recebam instruções de configuração DNS.
- **FR-027**: O sistema DEVE listar todos os domínios customizados de um revendedor.
- **FR-028**: O sistema DEVE permitir que revendedores desativem domínios customizados.
- **FR-029**: O sistema DEVE impedir que um revendedor gerencie domínios de outro revendedor.

**Painel de Revendedores (Admin)**

- **FR-030**: O sistema DEVE listar todos os revendedores da plataforma para admins, sem filtro de tenant.

**Carteira — Usuário**

- **FR-031**: O sistema DEVE exibir o saldo atual da carteira do usuário autenticado.
- **FR-032**: O sistema DEVE listar os créditos do usuário com paginação por cursor e filtros por status e tipo.
- **FR-033**: O sistema DEVE exibir o ciclo de vida completo de um crédito com todos os eventos e disputas associados.
- **FR-034**: O sistema DEVE permitir que o usuário reporte uma disputa sobre um crédito com motivo.
- **FR-035**: O sistema DEVE permitir que o usuário solicite reembolso de um crédito com justificativa.
- **FR-036**: O sistema DEVE listar as solicitações de reembolso do usuário com filtro por status.
- **FR-037**: O sistema DEVE exibir notificações da carteira (créditos vencendo, congelados, com pendências).

**Carteira — Admin**

- **FR-038**: O sistema DEVE listar todas as carteiras de usuários para admins, com busca por userId.
- **FR-039**: O sistema DEVE exibir o detalhe da carteira de qualquer usuário para admins.
- **FR-040**: O sistema DEVE permitir busca global de créditos com filtros por status, tipo, usuário e origem.
- **FR-041**: O sistema DEVE listar resultados de reconciliação de saldo para admins.
- **FR-042**: O sistema DEVE permitir que super admins corrijam divergências de saldo identificadas na reconciliação.
- **FR-043**: O sistema DEVE listar todas as disputas com filtro por status e permitir atualização com notas e resolução.
- **FR-044**: O sistema DEVE listar todas as solicitações de reembolso para admins com filtro por status.
- **FR-045**: O sistema DEVE permitir que admins aprovem solicitações de reembolso.
- **FR-046**: O sistema DEVE permitir que admins rejeitem solicitações de reembolso com motivo.
- **FR-047**: O sistema DEVE exibir o log de auditoria financeira para conformidade (LGPD), filtrável por carteira, crédito e ação.
- **FR-048**: O sistema DEVE exibir analytics financeiros com filtro de período (de / até).
- **FR-049**: O sistema DEVE permitir que super admins emitam créditos para usuários definindo tipo, valor e origem.
- **FR-050**: O sistema DEVE permitir que super admins cancelem créditos.

**Armazenamento**

- **FR-051**: O sistema DEVE permitir upload de arquivos nos buckets de imagens, áudios e documentos com limite de 50MB por arquivo.
- **FR-052**: O sistema DEVE gerar URLs de acesso temporárias (assinadas) para arquivos, com tempo de expiração configurável.
- **FR-053**: O sistema DEVE permitir a exclusão de arquivos por bucket e caminho.

### Key Entities *(include if feature involves data)*

- **Usuário**: Representa uma pessoa na plataforma. Possui papel único (SUPER_ADMIN, ADMIN, RESELLER, RESELLER_MANAGER, VOICE_ACTOR, PRODUCER, CLIENT), status de ativação, vínculo opcional com revendedor e perfil especializado conforme o papel.
- **Revendedor**: Instância de revenda da plataforma. Possui domínios customizados, usuários vinculados e contexto de isolamento de dados.
- **Domínio Customizado**: Domínio registrado por um revendedor para apresentar a plataforma sob sua marca. Possui status ativo/inativo e instruções de configuração DNS.
- **Solicitação de Papel**: Pedido de mudança de papel enviado por um usuário. Inclui justificativa, portfólio, amostras e status (PENDING / APPROVED / REJECTED).
- **Permissão**: Capacidade granular concedida a um usuário por um admin. Pode ter data de expiração.
- **Carteira**: Conta financeira de créditos de um usuário. Possui saldo calculado a partir dos créditos ativos.
- **Crédito**: Unidade financeira na carteira. Possui tipo (PAID, PROMOTIONAL, EARNED, BONUS), status (AVAILABLE, FROZEN, SPENT, CANCELLED, REFUNDED, EXPIRED), origem e histórico de eventos.
- **Disputa**: Contestação aberta pelo usuário sobre um crédito. Possui status (OPENED, INVESTIGATING, RESOLVED, CHARGEBACK_FILED) e notas de investigação.
- **Reembolso**: Solicitação de devolução de crédito. Possui status (REQUESTED, APPROVED, PROCESSING, COMPLETED, REJECTED, CANCELLED) e notas.
- **Arquivo**: Recurso armazenado em um dos três buckets (images, audios, documents). Associado a um usuário e opcionalmente a um revendedor.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Todos os 7 papéis de usuário têm telas e fluxos correspondentes 100% funcionais no frontend.
- **SC-002**: 100% dos endpoints disponíveis na API têm pelo menos uma interface de usuário correspondente no frontend.
- **SC-003**: Usuários conseguem completar o fluxo completo de autenticação (registro → login → uso → logout) em menos de 2 minutos.
- **SC-004**: Admins conseguem revisar e decidir sobre uma solicitação de papel (aprovar ou rejeitar) em menos de 1 minuto a partir do painel de admin.
- **SC-005**: Operações financeiras do admin (emissão de créditos, aprovação de reembolso, resolução de disputa) podem ser concluídas em no máximo 3 cliques a partir do painel.
- **SC-006**: Páginas protegidas por papel redirecionam usuários sem permissão corretamente em 100% dos casos — nenhuma tela restrita é acessível por papel não autorizado.
- **SC-007**: Uploads de arquivos dentro do limite de 50MB são concluídos com indicador de progresso visível, e arquivos acima do limite exibem erro antes do envio.
- **SC-008**: O frontend exibe mensagens de erro claras e acionáveis para todos os casos de falha da API (credenciais inválidas, acesso negado, conflito de recurso).

---

## Assumptions

- A autenticação é baseada em JWT com par de tokens (access + refresh); o frontend armazena os tokens de forma segura e realiza a renovação automática.
- O acesso a rotas protegidas é controlado por papel de usuário; o frontend valida o papel antes de renderizar telas restritas.
- Cada revendedor tem seu próprio contexto de tenant; usuários vinculados a revendedores veem apenas dados do seu revendedor.
- O fluxo de bootstrap é uma rota de uso único, acessível apenas quando o sistema ainda não possui nenhum super admin.
- A listagem de créditos da carteira usa cursor pagination (não offset); o frontend implementa scroll ou botão "carregar mais" baseado no cursor retornado.
- Uploads de arquivos são feitos diretamente para o backend via multipart/form-data; o feedback de progresso é apresentado ao usuário durante o upload.
- Todas as operações destrutivas (desativar usuário, cancelar créditos, deletar arquivo) exigem confirmação explícita do usuário antes de serem executadas.
- Os papéis RESELLER_MANAGER têm as mesmas telas de gestão de domínios e dados do revendedor que o próprio RESELLER, respeitando suas permissões granulares.
- As páginas de analytics financeiros e log de auditoria são exclusivas de ADMIN e SUPER_ADMIN.
- A tela de emissão e cancelamento de créditos é exclusiva de SUPER_ADMIN.
- A tela de correção de reconciliação é exclusiva de SUPER_ADMIN.
