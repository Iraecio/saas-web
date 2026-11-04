# Feature Specification: Atualização Segura do Runtime Vercel

**Feature Branch**: `011-upgrade-vercel-node`

**Created**: 2026-11-04

**Status**: Draft

**Input**: User description: "Migrar @vercel/node 3 para 29, eliminar vulnerabilidades transitivas e validar build, SSR e handler Vercel"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Entregar sem dependências vulneráveis conhecidas (Priority: P1)

Como responsável técnico, quero remover as vulnerabilidades conhecidas herdadas da integração Vercel, para que a cadeia de build e execução não dependa de versões afetadas por falhas publicadas.

**Why this priority**: A remediação de riscos altos e críticos é o motivo principal da feature.

**Independent Test**: Instalar o projeto a partir do lockfile e executar a auditoria de dependências, confirmando que os achados atribuídos à versão anterior da integração não aparecem mais.

**Acceptance Scenarios**:

1. **Given** o lockfile atualizado, **When** uma instalação limpa e a auditoria são executadas, **Then** não há vulnerabilidade alta ou crítica atribuída à integração Vercel ou às dependências substituídas.
2. **Given** a versão atualizada, **When** a árvore de dependências é inspecionada, **Then** não permanece cópia ativa da versão anterior da integração.

---

### User Story 2 - Preservar o handler de produção (Priority: P2)

Como responsável pela operação, quero que o handler serverless continue encaminhando requisições ao servidor da aplicação, para que o deploy permaneça funcional após a atualização.

**Why this priority**: Eliminar vulnerabilidades não pode interromper a entrada HTTP usada em produção.

**Independent Test**: Carregar o handler no ambiente de teste, enviar requisições representativas e verificar status, cabeçalhos, redirecionamentos e conteúdo retornado.

**Acceptance Scenarios**:

1. **Given** o artefato SSR gerado, **When** o handler recebe uma requisição válida, **Then** encaminha a resposta da aplicação com status e conteúdo preservados.
2. **Given** uma rota inexistente ou uma requisição rejeitada pela aplicação, **When** passa pelo handler, **Then** o erro ou status correspondente é propagado sem travamento do processo.

---

### User Story 3 - Manter a entrega reproduzível (Priority: P3)

Como pessoa desenvolvedora, quero testar e gerar o projeto com a nova integração, para continuar entregando mudanças com confiança.

**Why this priority**: A atualização precisa permanecer sustentável em CI e em instalações limpas.

**Independent Test**: Executar formatação, testes, build SSR e validação do handler a partir de uma instalação limpa.

**Acceptance Scenarios**:

1. **Given** uma cópia limpa do projeto, **When** os comandos documentados são executados, **Then** instalação, testes e build terminam com sucesso.
2. **Given** a integração atualizada, **When** o formato da configuração Vercel é validado, **Then** não existem opções removidas ou contratos incompatíveis.

### Edge Cases

- A nova versão deixa de exportar tipos de requisição e resposta usados pelo handler atual: o handler deve adotar contrato suportado sem alterar comportamento HTTP.
- O pacote atualizado muda o empacotamento ou resolução do bundle SSR: o teste deve carregar o mesmo artefato produzido pelo build.
- A auditoria encontra vulnerabilidades não relacionadas à integração Vercel: elas devem ser separadas do critério desta feature e documentadas.
- O host da requisição não está permitido: a proteção SSR deve continuar rejeitando-o conforme a configuração existente.
- O ambiente não possui credenciais ou projeto Vercel conectado: testes locais devem cobrir o contrato sem exigir deploy externo.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: O projeto MUST remover a dependência da versão 3 da integração Node da Vercel ou substituí-la por uma versão atual somente se ela for necessária em runtime e remover os achados conhecidos associados à cadeia anterior.
- **FR-002**: A instalação MUST resolver sem conflitos de dependência e sem flags que ignorem compatibilidade.
- **FR-003**: A árvore instalada MUST conter uma única linha ativa e suportada da integração Vercel usada pelo projeto.
- **FR-004**: O handler serverless MUST continuar aceitando as requisições e respostas suportadas pela plataforma.
- **FR-005**: O handler MUST continuar carregando o bundle SSR gerado e delegando requisições à aplicação.
- **FR-006**: A configuração de função MUST permanecer válida para o runtime Node suportado e preservar a duração máxima configurada.
- **FR-007**: A proteção de hosts do servidor MUST permanecer ativa e configurável por ambiente.
- **FR-008**: A suíte automatizada existente MUST permanecer aprovada.
- **FR-009**: O build de produção cliente e servidor MUST concluir e gerar o artefato esperado.
- **FR-010**: A entrega MUST incluir testes focados do handler para resposta válida e propagação de erro/status.
- **FR-011**: A auditoria final MUST comprovar a ausência dos achados altos e críticos originados pela integração anterior.
- **FR-012**: Mudanças de plataforma, domínio, API de negócio ou interface de usuário MUST permanecer fora do escopo.
- **FR-013**: A validação MUST ser executável localmente sem credenciais ou mutações em projeto Vercel remoto.
- **FR-014**: Riscos residuais não corrigíveis dentro da atualização MUST ser documentados com pacote, severidade e caminho de dependência.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A auditoria registra zero vulnerabilidades altas ou críticas originadas na integração Vercel atualizada.
- **SC-002**: 100% dos testes existentes e dos novos testes do handler são aprovados.
- **SC-003**: Uma instalação limpa, a verificação de formato e o build de produção terminam com sucesso em uma execução completa.
- **SC-004**: O smoke test do handler retorna a resposta esperada em 100% dos cenários válidos e de erro definidos.
- **SC-005**: O artefato SSR é gerado e carregado sem erro de importação ou incompatibilidade de runtime.
- **SC-006**: Nenhuma mudança funcional é observada nas rotas e respostas verificadas antes e depois da atualização.

## Assumptions

- O ponto de partida é `@vercel/node@3.2.29` após a migração Angular 22.
- A versão indicada pelo registro no momento da implementação é `@vercel/node@29.0.1`, mas a dependência será removida se a investigação comprovar que ela é usada apenas para tipagem e que a assinatura nativa é compatível.
- O deploy remoto não faz parte desta feature; serão usados build e testes locais do contrato serverless.
- A aplicação continuará usando Node.js e o bundle SSR existente.
- A API de negócio e o repositório irmão não precisam de alterações.
