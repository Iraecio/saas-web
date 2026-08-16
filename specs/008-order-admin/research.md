# Research: Painel Administrativo Completo de Pedidos

## R-001 — Separação da experiência global

**Decision**: Criar rotas `orders/manage` e páginas administrativas próprias, reutilizando modelos de domínio e componentes de mídia quando seguros.

**Rationale**: A lista existente é contextual ao papel e contém criação para clientes. Separar a experiência impede vazamento acidental de controles globais e mantém o fluxo atual estável.

**Alternatives considered**: Condicionar toda a página atual por papel; rejeitada pelo acoplamento e pela crescente matriz de estados.

## R-002 — Consulta persistida e compartilhável

**Decision**: Representar busca, filtros, ordenação, página e tamanho em query parameters canônicos; armazenar somente colunas e densidade por usuário.

**Rationale**: Permite atualizar, voltar e compartilhar contexto sem persistir dados sensíveis ou criar estado duplicado.

**Alternatives considered**: Session storage para tudo; rejeitado por não ser compartilhável. Estado apenas em signals; rejeitado por se perder na navegação.

## R-003 — Estratégia responsiva

**Decision**: Tabela semântica a partir do breakpoint desktop, tabela reduzida ou cards no tablet conforme espaço e cards no smartphone; filtros inline no desktop e drawer nos demais tamanhos.

**Rationale**: Pedidos possuem muitos atributos comparáveis no desktop, mas a tabela completa força rolagem horizontal e alvos pequenos no mobile.

**Alternatives considered**: Uma tabela responsiva única com scroll horizontal; rejeitada pelos requisitos de toque e priorização.

## R-004 — Paginação e agregação server-side

**Decision**: Busca, filtros, ordenação, totalizadores e paginação serão executados pela API, com respostas estáveis e desempate por identificador.

**Rationale**: O volume alvo de 100 mil pedidos inviabiliza filtragem no cliente e resultados inconsistentes entre páginas.

**Alternatives considered**: Carregar todos os pedidos; rejeitada por memória, latência e segurança. Scroll infinito; rejeitado como padrão por navegação, acessibilidade e retorno posicional, podendo ser reavaliado futuramente.

## R-005 — Seleção e lote

**Decision**: Modelar seleção como IDs explícitos da página ou expressão de consulta com exclusões. Sempre executar prévia no servidor antes do comando.

**Rationale**: Permite “todos os resultados” sem transportar milhares de IDs e revalida elegibilidade contra alterações concorrentes.

**Alternatives considered**: IDs apenas; rejeitada para consultas grandes. Executar diretamente; rejeitado pelo risco operacional.

## R-006 — Concorrência e idempotência

**Decision**: Consultas e prévias retornam `version`; comandos enviam versão esperada e chave de idempotência. Conflitos retornam estado corrente e alvos afetados.

**Rationale**: Pedidos mudam por clientes, profissionais e administradores; confirmação baseada em estado antigo não pode sobrescrever trabalho recente.

**Alternatives considered**: Last-write-wins; rejeitada. Bloqueio pessimista de longa duração; rejeitado pela experiência e complexidade operacional.

## R-007 — Estado e feedback

**Decision**: Usar skeleton estrutural na primeira carga, stale-while-refresh visual nas atualizações seguras, erros locais por seção e mensagens persistentes além de notificações transitórias.

**Rationale**: Mantém contexto, reduz saltos e torna sucesso/erro perceptível para tecnologias assistivas.

**Alternatives considered**: Spinner central e toast; rejeitados por apagar contexto e oferecer feedback insuficiente.

## R-008 — Acessibilidade e movimento

**Decision**: Manter uma árvore de foco coerente entre tabela/cards/dialogs, usar live regions apenas para mudanças assíncronas relevantes, alvos mínimos de toque e desativar transições não essenciais com `prefers-reduced-motion`.

**Rationale**: O módulo combina navegação densa, drawers, menus, diálogos e atualizações assíncronas, exigindo tratamento explícito.

**Alternatives considered**: ARIA generalizada; rejeitada porque semântica nativa é mais robusta e excesso de anúncios prejudica leitores de tela.

## R-009 — Exportação

**Decision**: A API cria exportação assíncrona vinculada à consulta/seleção e fornece status e acesso temporário ao arquivo.

**Rationale**: Exportações grandes não devem bloquear request, interface ou memória do navegador.

**Alternatives considered**: Gerar CSV no cliente; rejeitado por volume, segurança e inconsistência com paginação.

## R-010 — Dependências visuais

**Decision**: Reutilizar Angular CDK, Tailwind, Lucide e componentes do design system existentes; não adicionar grid ou state manager.

**Rationale**: Os recursos necessários já existem e serviços puros com signals/RxJS cobrem o estado da feature.

**Alternatives considered**: Biblioteca de data grid; rejeitada pelo custo, peso e risco de inconsistência visual.
