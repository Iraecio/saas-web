# Research: Endurecimento das Fronteiras de Segurança

## Decisão: PostgREST deny-by-default

- **Decision**: Habilitar RLS em toda tabela `public` exposta; tabelas sem uso direto pelo navegador permanecem sem policy.
- **Rationale**: O frontend atual usa a API NestJS, portanto não há fluxo legítimo que dependa de acesso PostgREST direto.
- **Alternatives considered**: Criar policies amplas por revenda para todas as tabelas foi rejeitado porque aumenta a superfície e exige semântica específica por domínio.

## Decisão: faixa de locução estruturada

- **Decision**: Persistir `maxDurationSeconds` e validar briefing/faixa na API.
- **Rationale**: Descrições e posição na lista não são contratos confiáveis.
- **Alternatives considered**: Repetir a regex do frontend na API perpetuaria dados ambíguos.

## Decisão: cookie de refresh e access token em memória

- **Decision**: Cookie `HttpOnly`, `Secure` em produção, `SameSite` configurável com padrão seguro, path restrito e cabeçalho anti-CSRF; access token permanece em memória.
- **Rationale**: Remove a credencial persistente do alcance de scripts sem reescrever toda a autenticação bearer existente.
- **Alternatives considered**: Cookie para access token exigiria CSRF em todos os endpoints e mudança mais ampla; IndexedDB continua acessível a scripts.

## Decisão: segredos locais por ambiente

- **Decision**: Compose referencia variáveis obrigatórias e `.env.example` usa placeholders não funcionais.
- **Rationale**: Evita que uma chave administrativa válida seja copiada para ambientes compartilhados.
- **Alternatives considered**: Chaves determinísticas versionadas são convenientes, mas tornam reutilização acidental provável.
