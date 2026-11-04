# Research: Remediação do Toolchain Vercel

## Classificação do achado

**Decision**: Classificar a cadeia como vulnerabilidade de tooling/build confirmada pelo audit, com explorabilidade HTTP direta não comprovada.

**Rationale**: `@vercel/node@3.2.29` é devDependency direta. Seus transitivos vulneráveis são usados por build, tracing, configuração e dev server; o bundle SSR não importa o pacote. Ainda assim, builds de entrega não devem depender de tooling com vulnerabilidades altas/críticas conhecidas.

**Alternatives considered**: Tratar toda severidade npm como exploração remota seria impreciso; ignorar o audit manteria a cadeia vulnerável.

## Estratégia de remediação

**Decision**: Remover `@vercel/node` e usar `IncomingMessage`/`ServerResponse` de `node:http`.

**Rationale**: O único uso no repositório é `import { VercelRequest, VercelResponse }` em `api/handler.ts`, exclusivamente para tipagem. A função apenas repassa os objetos ao `reqHandler` Angular. A documentação Vercel confirma suporte ao runtime Node e aos objetos Request/Response; não é necessário carregar o pacote de build no runtime da aplicação.

**Alternatives considered**: Atualizar para 29.0.1 mantém `undici@5.28.4` e `path-to-regexp@6.1.0` segundo metadados do pacote, sem garantia de audit limpo. Usar `npm audit fix --force` faria uma mudança principal sem resolver o princípio de dependência desnecessária.

## Contrato e teste

**Decision**: Extrair uma função de delegação com loader injetável e manter o export default usado pela Vercel.

**Rationale**: Permite testar sucesso, retorno assíncrono e propagação de erro sem credenciais ou deploy, enquanto o loader padrão continua importando o bundle SSR real.

**Alternatives considered**: Testar apenas build não executa `api/handler.ts`; deploy preview exigiria mutação externa e autenticação.
