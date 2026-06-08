# Feature Specification: Marketplace de Pedidos, Catálogo de Serviços e Escopo de Profissionais no Frontend

**Feature Branch**: `002-marketplace-orders-catalog`

**Created**: 2026-06-08

**Status**: Draft

**Origem (saas-api)**: specs `004-dual-scope-dual-wallet`, `005-order-flow`, `006-service-catalog` + módulos `service-type`, `withdrawal`, `professional` (escopo) e `reseller` (emissão de créditos).

---

## Visão Geral

A saas-api evoluiu de um SaaS de gestão de usuários para um **marketplace de áudio** (plataforma VozHub): clientes contratam locutores e produtores, pagando com créditos de duas carteiras distintas (PLATFORM e RESELLER); profissionais entregam áudio dentro de um fluxo de pedido com aceite, revisão, disputa e saque; e tanto a plataforma quanto as revendas mantêm catálogos de serviços precificados em créditos.

O frontend (saas-web, Angular 21) ainda **não cobre nenhum desses fluxos novos**. As features atuais (`auth`, `users`, `resellers`, `role-requests`, `custom-domains`, `wallet`, `wallet-admin`, `storage`, `profile`, `settings`, `dashboard`, `reports`) cobrem a base entregue no spec `001-full-api-coverage`. Esta spec adiciona a camada de marketplace, mapeando cada novo endpoint a uma interface de usuário organizada por papel.

**Escopo desta spec — o que será construído no frontend:**

1. **Catálogo de Serviços** (`/v1/services`) — CRUD com auditoria; ADMIN cria/edita serviços GLOBAIS, RESELLER cria/edita serviços PARTICULARES, listagem pública filtrada por papel.
2. **Pedidos / Order Flow** (`/v1/orders`) — criação (VOICE/PRODUCTION), listagem e detalhe com ciclo de vida completo, segmentado por papel (cliente, profissional, admin/revenda).
3. **Profissionais por Escopo** (`/v1/professionals`) — listagem de locutores e produtores e atribuição de escopo (GLOBAL/PARTICULAR).
4. **Saques** (`/v1/withdrawals`) — solicitação pelo profissional global e processamento pelo admin.
5. **Emissão de Créditos RESELLER** (`/v1/reseller/credits`) — emissão pela revenda e relatório de emissões.
6. **Dupla Carteira** (`/v1/wallet/platform`, `/v1/wallet/reseller`) — evolução da feature `wallet` existente para exibir as duas carteiras separadas.

**Fora de escopo:** mudanças no backend; processamento de pagamento real de saque (apenas registro da confirmação); job de expiração automática de pedidos; integração de notificações por e-mail/push (notificações são eventos internos consumidos via polling/refresh).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Catálogo de Serviços da Plataforma (ADMIN) (Priority: P1)

Um administrador da plataforma gerencia o catálogo de serviços GLOBAIS (locução e produção) que serão oferecidos a todos os clientes que contratam profissionais globais.

**Why this priority**: Sem serviços ativos, nenhum pedido com profissional GLOBAL pode ser criado. É a base de precificação de todo o fluxo de pedido.

**Independent Test**: Logar como ADMIN, criar um serviço VOICE_ACTOR GLOBAL informando custo em créditos, repasse, prazo e revisões, e verificar que ele aparece na listagem pública e no histórico de auditoria.

**Acceptance Scenarios**:

1. **Given** um ADMIN autenticado, **When** acessa a tela de catálogo de serviços, **Then** vê todos os serviços (GLOBAIS e PARTICULARES de todas as revendas, ativos e inativos) com filtro por `professionalRole`, por `ownerId` e por incluir inativos.
2. **Given** um ADMIN na tela de criação, **When** preenche nome, `professionalRole` (VOICE_ACTOR/PRODUCER), escopo GLOBAL, `creditCost`, `professionalPayout`, `defaultDeliveryHours`, `maxRevisions` e opcionalmente `maxDurationSeconds`, **Then** o serviço é criado e exibido como GLOBAL/PLATFORM ativo.
3. **Given** um ADMIN editando o `creditCost`, `defaultDeliveryHours` ou `maxRevisions` de um serviço ativo, **When** salva, **Then** a interface exibe um aviso de impacto e exige confirmação explícita antes de reenviar com `confirmImpact: true`.
4. **Given** um ADMIN, **When** inativa um serviço ativo, **Then** ele deixa de aparecer para novos pedidos e mostra o estado "inativo"; o ADMIN pode reativá-lo.
5. **Given** um ADMIN, **When** abre o histórico de um serviço, **Then** vê a lista cronológica de ações (CREATED, UPDATED, DEACTIVATED, REACTIVATED) com ator, papel, campos alterados (valor anterior → novo) e data/hora.
6. **Given** um ADMIN, **When** tenta criar um serviço com `creditCost` zero/negativo ou nome duplicado no mesmo catálogo, **Then** a interface exibe a mensagem de erro retornada pela API.

---

### User Story 2 — Catálogo de Serviços da Revenda (RESELLER) (Priority: P1)

Uma revenda gerencia seu próprio catálogo de serviços PARTICULARES, precificados em créditos RESELLER, visíveis apenas para os clientes da sua rede.

**Why this priority**: Habilita o escoamento de créditos RESELLER — sem serviços PARTICULARES, clientes da revenda não conseguem contratar profissionais particulares.

**Independent Test**: Logar como RESELLER, criar um serviço PRODUCER PARTICULAR e verificar que ele aparece somente para clientes daquela revenda, nunca para outras revendas.

**Acceptance Scenarios**:

1. **Given** um RESELLER autenticado, **When** acessa o catálogo, **Then** vê apenas os seus próprios serviços PARTICULARES (ativos e inativos), sem serviços de outras revendas.
2. **Given** um RESELLER na criação, **When** informa nome, `professionalRole`, `creditCost`, prazo e revisões, **Then** o serviço é criado com escopo PARTICULAR inferido automaticamente, `creditType` RESELLER e `ownerId` da própria revenda — sem campo de escopo manual na tela.
3. **Given** um RESELLER, **When** o `professionalPayout` é exibido, **Then** ele é apresentado como opcional (informativo).
4. **Given** um RESELLER, **When** tenta editar ou inativar um serviço GLOBAL ou de outra revenda, **Then** a ação não está disponível na interface e a API rejeita com erro de autorização tratado.

---

### User Story 3 — Cliente Cria um Pedido de Locução ou Produção (Priority: P1)

Um cliente seleciona um profissional disponível, escolhe um serviço compatível e cria um pedido — enviando o script (VOICE) ou o arquivo de áudio bruto (PRODUCTION) — com reserva imediata de créditos.

**Why this priority**: É o fluxo central do marketplace. Toda a monetização depende da criação de pedido funcionar.

**Independent Test**: Logar como CLIENT com saldo PLATFORM suficiente, escolher um locutor GLOBAL, selecionar um serviço, enviar o script e confirmar que o pedido é criado em PENDING e o saldo disponível foi reduzido pela reserva.

**Acceptance Scenarios**:

1. **Given** um CLIENT autenticado, **When** abre a criação de pedido, **Then** pode escolher um profissional (locutor ou produtor) entre os visíveis ao seu contexto e a interface lista somente os serviços compatíveis com o escopo e o tipo do profissional selecionado.
2. **Given** um pedido VOICE, **When** o cliente informa o `briefingText` (script) obrigatório e envia, **Then** o pedido é criado com status PENDING e a tela exibe a reserva de créditos e o saldo atualizado.
3. **Given** um pedido PRODUCTION, **When** o cliente faz upload do arquivo de áudio bruto (mp3/wav/ogg/m4a/flac, até 100 MB) com instruções, **Then** o upload mostra progresso e o pedido é criado com a primeira versão do briefing.
4. **Given** saldo insuficiente na carteira correspondente, **When** o cliente tenta criar o pedido, **Then** a interface exibe o saldo atual, a quantidade necessária e impede o envio (sem reservar créditos).
5. **Given** um pedido VOICE sem script, ou PRODUCTION sem arquivo, **When** o cliente tenta enviar, **Then** a validação do formulário bloqueia e indica o campo obrigatório.
6. **Given** que o profissional é PARTICULAR, **When** o cliente seleciona o serviço, **Then** a carteira RESELLER é usada; quando GLOBAL, a carteira PLATFORM — a interface deixa claro qual carteira/crédito será debitado.

---

### User Story 4 — Profissional Gerencia seus Pedidos Recebidos (Priority: P1)

Um locutor ou produtor visualiza os pedidos a ele destinados e age sobre cada um: pede revisão do briefing, aceita, recusa, entrega o áudio e re-entrega quando necessário.

**Why this priority**: Sem a ação do profissional o fluxo não avança da criação para a entrega.

**Independent Test**: Logar como VOICE_ACTOR, abrir um pedido PENDING destinado a ele, aceitar, e verificar que o status muda para IN_PROGRESS com prazo de entrega definido.

**Acceptance Scenarios**:

1. **Given** um profissional autenticado, **When** acessa "Meus Pedidos", **Then** vê apenas os pedidos destinados a ele, filtráveis por status e tipo, com indicação de prazo (`deadlineAt`).
2. **Given** um pedido PENDING com briefing incompleto, **When** o profissional solicita revisão informando o motivo, **Then** o status muda para AWAITING_BRIEF e a interface reflete a espera pelo cliente.
3. **Given** um pedido PENDING, **When** o profissional aceita, **Then** o status muda para IN_PROGRESS e a tela exibe o prazo de entrega calculado; **When** recusa informando motivo, **Then** o status muda para CANCELLED.
4. **Given** um pedido IN_PROGRESS, **When** o profissional faz upload do áudio com notas de entrega, **Then** o pedido vai para REVIEW; **When** já está em REVIEW e re-entrega, **Then** informa o motivo do reenvio obrigatório e o status permanece REVIEW.
5. **Given** um profissional autenticado em qualquer perfil de profissional, **When** abre o detalhe do pedido/serviço, **Then** vê o `professionalPayout` (repasse), oculto de clientes.
6. **Given** o profissional tenta agir sobre um pedido que não lhe pertence, **When** a ação é tentada, **Then** a interface não oferece a ação e erros de autorização da API são tratados.

---

### User Story 5 — Cliente Revisa a Entrega: Aprovar, Revisar ou Disputar (Priority: P1)

Após receber a entrega, o cliente aprova (débito definitivo), solicita revisão de áudio (dentro do limite) ou abre disputa.

**Why this priority**: É a etapa central do ciclo financeiro — o débito definitivo e o repasse ao profissional só ocorrem aqui.

**Independent Test**: Logar como CLIENT em um pedido REVIEW, aprovar e verificar que o status vai para COMPLETED e os créditos reservados foram debitados.

**Acceptance Scenarios**:

1. **Given** um pedido em REVIEW, **When** o cliente reproduz/baixa o áudio entregue e aprova, **Then** os créditos reservados são debitados, o status vai para COMPLETED e o saldo é atualizado.
2. **Given** um pedido em REVIEW com `revisionCount < maxRevisions`, **When** o cliente solicita revisão com instruções, **Then** o pedido volta para IN_PROGRESS, o contador de revisões aumenta e um novo prazo é exibido.
3. **Given** um pedido em REVIEW com limite de revisões atingido, **When** o cliente tenta solicitar revisão, **Then** a interface informa o limite e oferece apenas aprovar ou abrir disputa.
4. **Given** um pedido em REVIEW, **When** o cliente abre disputa com justificativa, **Then** o status vai para DISPUTED e a interface indica que aguarda análise de um administrador/revenda.

---

### User Story 6 — Administrador/Revenda Resolve Disputas (Priority: P2)

Um ADMIN (qualquer pedido) ou RESELLER (pedidos PARTICULARES da sua rede) analisa pedidos em disputa, examina briefing e entregas, e decide a favor do cliente ou do profissional.

**Why this priority**: Sem resolução, créditos ficam bloqueados indefinidamente. Depende dos fluxos P1 de pedido.

**Independent Test**: Logar como ADMIN, abrir um pedido DISPUTED, decidir FAVOR_CLIENT e verificar que créditos voltam ao cliente e o status vira CANCELLED.

**Acceptance Scenarios**:

1. **Given** um ADMIN/RESELLER autorizado, **When** acessa a fila de pedidos em DISPUTED, **Then** vê os pedidos disputados do seu escopo com briefing, todas as versões de entrega e a justificativa do cliente.
2. **Given** um pedido DISPUTED, **When** resolve FAVOR_CLIENT com notas, **Then** créditos liberados ao cliente, status CANCELLED, e a decisão fica registrada no histórico.
3. **Given** um pedido DISPUTED, **When** resolve FAVOR_PROFESSIONAL com notas, **Then** créditos debitados, profissional GLOBAL acumula, status COMPLETED.
4. **Given** um RESELLER, **When** tenta resolver disputa de pedido de outra revenda, **Then** a interface não oferece a ação.

---

### User Story 7 — Histórico e Auditoria do Pedido (Priority: P3)

Cliente, profissional e administradores consultam o histórico completo de transições de status de um pedido, além das versões de briefing e de entrega.

**Why this priority**: Essencial para rastreabilidade e suporte a disputas, mas não bloqueia o fluxo principal.

**Independent Test**: Abrir um pedido que passou por várias transições e verificar que cada uma aparece com status anterior/novo, ator, papel e data.

**Acceptance Scenarios**:

1. **Given** um pedido com múltiplas transições, **When** o usuário autorizado abre o histórico, **Then** vê a linha do tempo cronológica com `fromStatus`, `toStatus`, ator, papel e notas.
2. **Given** um pedido com revisões de briefing e re-entregas, **When** consulta o detalhe, **Then** vê a versão atual do briefing e a entrega mais recente, com acesso às versões anteriores em disputa.

---

### User Story 8 — Cancelamento pelo Cliente (Priority: P3)

O cliente cancela pedidos PENDING/AWAITING_BRIEF com reembolso imediato, ou pedidos IN_PROGRESS cujo prazo de entrega já expirou.

**Why this priority**: Suporte ao cliente; menos crítico que o fluxo principal.

**Acceptance Scenarios**:

1. **Given** um pedido PENDING ou AWAITING_BRIEF, **When** o cliente cancela, **Then** o status vai para CANCELLED e os créditos são liberados imediatamente.
2. **Given** um pedido IN_PROGRESS dentro do prazo, **When** o cliente tenta cancelar, **Then** a interface informa que o cancelamento direto não é possível antes do prazo.
3. **Given** um pedido IN_PROGRESS com prazo excedido, **When** o cliente cancela por atraso, **Then** o pedido é cancelado e os créditos liberados.

---

### User Story 9 — Profissionais por Escopo: Listagem e Classificação (Priority: P2)

ADMIN classifica profissionais como GLOBAL; RESELLER vincula profissionais como PARTICULAR da sua rede. Clientes/revendas veem a lista filtrada conforme escopo.

**Why this priority**: O escopo determina qual carteira é debitada e quem pode contratar cada profissional. Pré-requisito do roteamento financeiro dos pedidos.

**Independent Test**: Logar como ADMIN, definir o escopo de um locutor como GLOBAL e verificar que ele passa a aparecer para todas as revendas.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado, **When** lista locutores ou produtores, **Then** vê os profissionais visíveis ao seu contexto (GLOBAIS + PARTICULARES da própria revenda) com filtro por escopo.
2. **Given** um ADMIN, **When** define o escopo de um profissional como GLOBAL, **Then** o `resellerId` é nulo e o profissional fica visível para todos.
3. **Given** um RESELLER, **When** vincula um profissional como PARTICULAR, **Then** ele é associado à revenda e fica visível apenas para ela.
4. **Given** um profissional com pedidos ativos, **When** tenta alterar o escopo, **Then** a interface trata o erro 409 (não é possível alterar com pedidos em andamento).

---

### User Story 10 — Saques de Profissionais Globais (Priority: P2)

Um locutor/produtor GLOBAL com 300+ créditos acumulados solicita saque; o ADMIN processa, completa (com referência de pagamento) ou rejeita.

**Why this priority**: Retenção de profissionais globais; depende do fluxo de pedido concluído (acúmulo de créditos).

**Independent Test**: Logar como profissional GLOBAL com ≥300 créditos, solicitar saque e verificar a criação da solicitação PENDING; logar como ADMIN e completar.

**Acceptance Scenarios**:

1. **Given** um profissional GLOBAL com ≥300 créditos, **When** acessa a área de saque, **Then** vê o saldo acumulado e pode solicitar o saque (R$1,00/crédito).
2. **Given** um profissional GLOBAL com <300 créditos, **When** acessa a área de saque, **Then** vê quanto falta para o mínimo e o botão fica desabilitado.
3. **Given** uma solicitação já PENDING/PROCESSING, **When** o profissional tenta nova solicitação, **Then** a interface trata o erro 409.
4. **Given** um ADMIN, **When** acessa a fila de saques, **Then** pode processar, completar (informando `paymentReference`) ou rejeitar (informando motivo), com o status refletido.
5. **Given** um profissional PARTICULAR, **When** acessa a área de saque, **Then** a interface informa que saques são pagos diretamente pela revenda (fora da plataforma).

---

### User Story 11 — Emissão de Créditos RESELLER (Priority: P2)

Uma revenda emite créditos RESELLER para seus clientes e consulta o relatório de emissões e volume utilizado.

**Why this priority**: Alimenta a carteira RESELLER que sustenta os pedidos com profissionais particulares.

**Independent Test**: Logar como RESELLER, emitir 100 créditos para um cliente da rede e verificar que o saldo RESELLER do cliente aumenta e a emissão aparece no relatório.

**Acceptance Scenarios**:

1. **Given** um RESELLER autenticado, **When** seleciona um cliente da sua rede, informa quantidade e valor unitário, **Then** os créditos são emitidos e a interface mostra o novo saldo da carteira RESELLER do cliente.
2. **Given** um cliente fora da rede, **When** o RESELLER tenta emitir, **Then** a interface trata o erro 403.
3. **Given** um RESELLER/ADMIN, **When** abre o relatório de emissões, **Then** vê a lista com data, quantidade, valor e cliente, com filtros por período e cliente e o resumo (total emitido, total utilizado).

---

### User Story 12 — Dupla Carteira do Cliente (Priority: P2)

O cliente visualiza suas duas carteiras separadas — PLATFORM e RESELLER — com saldos disponível e congelado, sem qualquer mecanismo de transferência entre elas.

**Why this priority**: Transparência financeira; complementa o fluxo de pedidos (qual carteira paga qual profissional). Evolui a feature `wallet` existente.

**Independent Test**: Logar como CLIENT de uma revenda e verificar que ambas as carteiras aparecem com seus respectivos saldos; clientes sem revenda veem apenas a PLATFORM.

**Acceptance Scenarios**:

1. **Given** um CLIENT com `resellerId`, **When** abre a carteira, **Then** vê as duas carteiras (PLATFORM e RESELLER) com `availableCredits` e `frozenCredits` de cada.
2. **Given** um CLIENT sem `resellerId`, **When** abre a carteira, **Then** vê apenas a carteira PLATFORM (a chamada RESELLER que retorna 403 é tratada graciosamente).
3. **Given** ambas as carteiras, **When** o cliente as visualiza, **Then** não há opção de transferência ou conversão entre elas.

---

### Edge Cases

- Upload de arquivo de áudio falha (briefing PRODUCTION ou entrega): o pedido/ação não é concluído, créditos não são reservados, e o usuário recebe erro com opção de tentar novamente.
- Profissional reclassificado (GLOBAL ↔ PARTICULAR) com pedidos ativos: a interface bloqueia a ação e trata o 409 da API.
- Cliente com créditos RESELLER de mais de uma revenda: só pode contratar profissionais PARTICULARES da revenda emissora correspondente; serviços incompatíveis não aparecem.
- Serviço inativado enquanto há pedidos em andamento: pedidos existentes seguem com os valores copiados na criação; o serviço some das opções de novos pedidos.
- Sessão expira durante upload longo: o interceptor de auth renova o token; o upload é retomado/reportado sem perda silenciosa.
- Listagem vazia de serviços compatíveis: a tela de criação de pedido informa que não há serviço disponível para o profissional selecionado.
- Resposta envelopada da API (`{ success, data }`): o frontend sempre desembrulha `data` antes de renderizar (consistente com `001`).

---

## Requirements *(mandatory)*

### Functional Requirements

**Catálogo de Serviços (feature `services`):**

- **FR-001**: O frontend DEVE listar serviços via `GET /v1/services` com filtros por `professionalRole`, `ownerId` (ADMIN) e `includeInactive` (ADMIN/RESELLER), respeitando a visibilidade por papel retornada pela API.
- **FR-002**: ADMIN DEVE poder criar serviços GLOBAIS (`POST /v1/services`) com `professionalRole`, `creditCost`, `professionalPayout` (obrigatório), `defaultDeliveryHours`, `maxRevisions` e `maxDurationSeconds` (opcional).
- **FR-003**: RESELLER DEVE poder criar serviços PARTICULARES sem campo de escopo (inferido), com `professionalPayout` opcional.
- **FR-004**: Ao editar `creditCost`, `defaultDeliveryHours` ou `maxRevisions` de um serviço ativo, a interface DEVE exibir aviso de impacto e reenviar com `confirmImpact: true`; o erro 422 sem confirmação DEVE ser tratado pedindo confirmação.
- **FR-005**: O frontend DEVE permitir inativar (`DELETE /v1/services/:id`) e reativar (`PATCH /v1/services/:id/activate`) serviços do próprio dono.
- **FR-006**: O frontend DEVE exibir o histórico de auditoria (`GET /v1/services/:id/audit`) com ação, ator, papel, campos alterados (from→to) e data.
- **FR-007**: A interface DEVE ocultar ações de edição/inativação para serviços que o usuário não possui (RESELLER não edita GLOBAL nem de outra revenda; ADMIN não edita PARTICULAR).
- **FR-008**: O `professionalPayout` DEVE ser exibido apenas em contextos de profissional/admin, nunca em listagens públicas para cliente.

**Pedidos (feature `orders`):**

- **FR-009**: CLIENT DEVE poder criar pedido (`POST /v1/orders`) escolhendo profissional + serviço compatível; pedidos VOICE como JSON com `briefingText`, pedidos PRODUCTION como `multipart/form-data` com arquivo + `briefingText`.
- **FR-010**: A criação DEVE validar no cliente: `briefingText` obrigatório (ambos), arquivo obrigatório para PRODUCTION (formatos mp3/wav/ogg/m4a/flac, ≤100 MB), e exibir progresso de upload.
- **FR-011**: A tela de criação DEVE listar apenas serviços compatíveis com o escopo (GLOBAL/PARTICULAR) e `professionalRole` do profissional selecionado, e indicar a carteira/crédito a debitar.
- **FR-012**: O frontend DEVE tratar os erros de criação: 400 (campos), 402 (saldo insuficiente, exibindo saldo e necessário), 403 (profissional de outra revenda) e 422 (incompatibilidade serviço/profissional).
- **FR-013**: O frontend DEVE listar pedidos (`GET /v1/orders`) segmentados por papel, com filtros por `status`, `orderType` e período, e paginação.
- **FR-014**: O detalhe do pedido (`GET /v1/orders/:id`) DEVE exibir status, tipo, serviço, créditos, prazo, `revisionCount`/`maxRevisions`, briefing atual e entrega atual (com player/download de áudio).
- **FR-015**: O frontend DEVE expor as ações do profissional conforme o status: `request-brief-revision` (PENDING), `accept`/`refuse` (PENDING), `deliver` (IN_PROGRESS/REVIEW, com `redeliveryReason` obrigatório em re-entrega).
- **FR-016**: O frontend DEVE expor as ações do cliente conforme o status: `update-brief` (AWAITING_BRIEF), `approve` (REVIEW), `request-revision` (REVIEW, dentro do limite), `dispute` (REVIEW), `cancel` (PENDING/AWAITING_BRIEF, ou IN_PROGRESS com prazo excedido).
- **FR-017**: O frontend DEVE expor a resolução de disputa (`POST /v1/orders/:id/resolve`) para ADMIN (qualquer) e RESELLER (PARTICULARES da rede), com decisão FAVOR_CLIENT/FAVOR_PROFESSIONAL e notas.
- **FR-018**: O frontend DEVE exibir o histórico de transições (`GET /v1/orders/:id/history`) em linha do tempo.
- **FR-019**: Cada ação DEVE refletir o novo status e saldo na interface imediatamente após a resposta, e tratar 403/422 com mensagens claras.
- **FR-020**: A interface DEVE oferecer somente as ações válidas para o status atual e o papel do usuário (transições inválidas não são apresentadas).

**Profissionais por Escopo (feature `professionals`):**

- **FR-021**: O frontend DEVE listar locutores (`GET /v1/professionals/voice-actors`) e produtores (`GET /v1/professionals/producers`) com filtro por `scope` e paginação.
- **FR-022**: ADMIN DEVE poder definir escopo GLOBAL e RESELLER vincular como PARTICULAR (`PUT /v1/professionals/{voice-actors|producers}/:id/scope`), com validação (`resellerId` obrigatório apenas para PARTICULAR) e tratamento do 409.

**Saques (feature `withdrawals`):**

- **FR-023**: Profissional GLOBAL DEVE poder solicitar saque (`POST /v1/withdrawals`) quando atingir 300 créditos, com a interface exibindo o acumulado e o quanto falta abaixo do mínimo.
- **FR-024**: O frontend DEVE listar saques (`GET /v1/withdrawals`) — profissional vê os seus, ADMIN vê todos — com filtro por status.
- **FR-025**: ADMIN DEVE poder processar (`/process`), completar (`/complete` com `paymentReference`) e rejeitar (`/reject` com motivo) saques, refletindo o status.
- **FR-026**: A interface DEVE informar profissionais PARTICULARES que o saque é externo (sem botão de solicitação).

**Emissão de Créditos RESELLER (feature `reseller-credits` ou estendendo `resellers`):**

- **FR-027**: RESELLER DEVE poder emitir créditos (`POST /v1/reseller/credits/emit`) para um cliente da rede, informando `creditAmount` e `unitValueCents`, exibindo o novo saldo.
- **FR-028**: O frontend DEVE exibir o relatório de emissões (`GET /v1/reseller/credits/emissions`) com filtros (período, cliente), paginação e o resumo (total emitido/utilizado).

**Dupla Carteira (feature `wallet` — evolução):**

- **FR-029**: O frontend DEVE consumir `GET /v1/wallet/platform` e `GET /v1/wallet/reseller` e exibir as duas carteiras separadas com `availableCredits`, `frozenCredits` e `currency`.
- **FR-030**: Para usuários sem `resellerId`, a interface DEVE exibir apenas a carteira PLATFORM, tratando o 403 da carteira RESELLER sem erro visível ao usuário.
- **FR-031**: A interface NÃO DEVE oferecer transferência/conversão entre as carteiras.

**Transversais:**

- **FR-032**: Todas as chamadas DEVEM desembrulhar o envelope `{ success, data }` e usar o interceptor de erro/auth existentes.
- **FR-033**: Novas rotas DEVEM ser protegidas por `authGuard` e `roleGuard` conforme o papel mínimo de cada fluxo, e os itens de menu DEVEM aparecer apenas para papéis com acesso.
- **FR-034**: Componentes DEVEM ser compatíveis com SSR (sem acesso direto a `localStorage`/`window` fora de `isPlatformBrowser`).
- **FR-035**: Nenhuma nova dependência de runtime DEVE ser adicionada; uploads/áudio usam recursos já presentes (PrimeNG/Angular).

### Key Entities (modelos TypeScript a criar/estender em `core/models`)

- **Service**: `id, name, description, professionalRole (VOICE_ACTOR|PRODUCER), scope (GLOBAL|PARTICULAR), ownerId|null, creditCost, creditType (PLATFORM|RESELLER), professionalPayout?, maxDurationSeconds?, defaultDeliveryHours, maxRevisions, isActive, createdById?, createdAt, updatedAt`.
- **ServiceAuditLog**: `id, serviceId, actorId, actorRole, action (CREATED|UPDATED|DEACTIVATED|REACTIVATED), changedFields, createdAt`.
- **Order**: `id, orderType (VOICE|PRODUCTION), status (PENDING|AWAITING_BRIEF|IN_PROGRESS|REVIEW|COMPLETED|CANCELLED|DISPUTED), clientId, professionalId, serviceId, creditCost, creditType, revisionCount, maxRevisions, deadlineAt, currentBrief, currentDelivery, createdAt`.
- **OrderBriefVersion**: `versionNumber, briefingText, briefingFileUrl?, revisionReason?, submittedAt`.
- **OrderDelivery**: `versionNumber, audioUrl, deliveryNotes, redeliveryReason?, deliveredAt`.
- **OrderStatusHistory**: `fromStatus|null, toStatus, actorId, actorRole, notes?, createdAt`.
- **OrderDisputeResolution**: `resolvedById, decision (FAVOR_CLIENT|FAVOR_PROFESSIONAL), notes, createdAt`.
- **Professional**: `id, userId, scope (GLOBAL|PARTICULAR), resellerId|null, name, verificationStatus` + campos específicos (locutor: `accent`; produtor: conforme API).
- **WithdrawalRequest**: `id, status (PENDING|PROCESSING|COMPLETED|REJECTED), creditAmount, amountCents, requestedAt, paymentReference?, reason?`.
- **ResellerCreditEmission**: `emissionId, clientId, creditAmount, unitValueCents, totalValueCents, emittedAt`.
- **Wallet** (estender existente): `id, walletType (PLATFORM|RESELLER), availableCredits, frozenCredits, currency`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um cliente consegue criar um pedido (selecionar profissional → serviço → briefing → enviar) em até 4 passos, com a carteira correta debitada em 100% dos casos.
- **SC-002**: Um profissional consegue aceitar/recusar/entregar um pedido a partir da listagem em até 2 cliques por ação, com o status refletido em menos de 2 segundos após a resposta da API.
- **SC-003**: 100% das ações de pedido apresentadas na interface correspondem a transições válidas para o status e papel atuais — zero ações inválidas oferecidas.
- **SC-004**: Páginas de listagem (pedidos, serviços, profissionais, emissões, saques) carregam em menos de 2 segundos com paginação.
- **SC-005**: Uploads de áudio (briefing PRODUCTION e entrega) exibem progresso contínuo e tratam falhas sem deixar o usuário sem feedback.
- **SC-006**: Um ADMIN cria/edita um serviço GLOBAL, com confirmação de impacto nos campos críticos, sem erro de validação não tratado.
- **SC-007**: A dupla carteira exibe os saldos corretos das duas carteiras (ou apenas PLATFORM para clientes sem revenda) sem expor erro de 403.
- **SC-008**: Itens de menu e rotas só são acessíveis aos papéis autorizados — zero rotas de marketplace acessíveis a papéis sem permissão.

---

## API Surface — Mapeamento Frontend ↔ Backend

| Feature (web) | Endpoint (saas-api) | Método | Papel mínimo |
|---|---|---|---|
| services | `/v1/services` | GET | público / JWT |
| services | `/v1/services/:id` | GET | público / JWT |
| services | `/v1/services` | POST | ADMIN / RESELLER |
| services | `/v1/services/:id` | PUT | dono (ADMIN/RESELLER) |
| services | `/v1/services/:id` | DELETE | dono |
| services | `/v1/services/:id/activate` | PATCH | dono |
| services | `/v1/services/:id/audit` | GET | dono / ADMIN |
| orders | `/v1/orders` | POST | CLIENT |
| orders | `/v1/orders` | GET | JWT |
| orders | `/v1/orders/:id` | GET | partes / ADMIN / RESELLER |
| orders | `/v1/orders/:id/history` | GET | partes / ADMIN / RESELLER |
| orders | `/v1/orders/:id/request-brief-revision` | POST | profissional |
| orders | `/v1/orders/:id/update-brief` | POST | CLIENT |
| orders | `/v1/orders/:id/accept` | POST | profissional |
| orders | `/v1/orders/:id/refuse` | POST | profissional |
| orders | `/v1/orders/:id/deliver` | POST | profissional |
| orders | `/v1/orders/:id/approve` | POST | CLIENT |
| orders | `/v1/orders/:id/request-revision` | POST | CLIENT |
| orders | `/v1/orders/:id/dispute` | POST | CLIENT |
| orders | `/v1/orders/:id/resolve` | POST | ADMIN / RESELLER |
| orders | `/v1/orders/:id/cancel` | POST | CLIENT |
| professionals | `/v1/professionals/voice-actors` | GET | JWT |
| professionals | `/v1/professionals/producers` | GET | JWT |
| professionals | `/v1/professionals/{type}/:id/scope` | PUT | ADMIN / RESELLER |
| withdrawals | `/v1/withdrawals` | POST | VOICE_ACTOR / PRODUCER (GLOBAL) |
| withdrawals | `/v1/withdrawals` | GET | JWT |
| withdrawals | `/v1/withdrawals/:id/process` | POST | ADMIN+ |
| withdrawals | `/v1/withdrawals/:id/complete` | POST | ADMIN+ |
| withdrawals | `/v1/withdrawals/:id/reject` | POST | ADMIN+ |
| reseller-credits | `/v1/reseller/credits/emit` | POST | RESELLER+ |
| reseller-credits | `/v1/reseller/credits/emissions` | GET | RESELLER+ / ADMIN |
| wallet | `/v1/wallet/platform` | GET | JWT |
| wallet | `/v1/wallet/reseller` | GET | JWT (com resellerId) |

> **Nota de descontinuação**: `GET/POST/PUT/DELETE /v1/service-types` foi substituído por `/v1/services`. O frontend NÃO deve consumir `/v1/service-types` — usar somente o catálogo `services`.

---

## Assumptions

- **A-001**: A fonte autoritativa do contrato é a tabela de endpoints em `saas-api/CLAUDE.md` somada aos `contracts/api-contracts.md` das specs 004/005/006. Onde houver divergência (ex.: `briefing` vs `briefingText`, `serviceTypeId` vs `serviceId`), prevalece o contrato mais recente (005/006: `serviceId`, `briefingText`).
- **A-002**: O escopo desta spec é o frontend (saas-web). O backend já implementa os endpoints listados.
- **A-003**: Estrutura por feature standalone por domínio é mantida (mesma convenção de `001-full-api-coverage`): `services`, `orders`, `professionals`, `withdrawals`, `reseller-credits`, e evolução de `wallet`.
- **A-004**: Notificações são consumidas via refresh/polling da listagem e detalhe — não há WebSocket nesta spec.
- **A-005**: URLs de áudio retornadas pela API já são URLs assinadas/acessíveis; o frontend apenas as consome em player/download.
- **A-006**: O número máximo de revisões é informado pelo próprio pedido (`maxRevisions`), copiado do serviço na criação.
- **A-007**: Clientes sem `resellerId` só têm carteira PLATFORM; a chamada de carteira RESELLER retornando 403 é esperada e tratada silenciosamente.

---

## Próximos Passos (Speckit)

1. `/speckit-plan` — gerar `plan.md`, `research.md`, `data-model.md` e `quickstart.md` desta feature.
2. `/speckit-tasks` — derivar `tasks.md` por user story (P1 → P3).
3. Implementar na ordem de prioridade: catálogo de serviços e criação/gestão de pedidos (P1) primeiro, depois escopo de profissionais, saques, emissões e dupla carteira (P2/P3).
