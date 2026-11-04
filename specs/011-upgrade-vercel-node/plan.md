# Implementation Plan: Remediação do Toolchain Vercel

**Branch**: `011-upgrade-vercel-node` | **Date**: 2026-11-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-upgrade-vercel-node/spec.md`

## Summary

Eliminar as nove vulnerabilidades residuais originadas em `@vercel/node@3.2.29`. A investigação mostrou que o pacote é usado apenas como fonte de tipos em `api/handler.ts`; não participa do bundle SSR nem do caminho de requisição. Como `@vercel/node@29.0.1` ainda declara dependências vulneráveis, a estratégia mínima é remover o pacote, usar tipos nativos de HTTP do Node e adicionar testes do adaptador que comprovem delegação, resposta e propagação de falhas.

## Technical Context

**Language/Version**: TypeScript 6.0; Node.js 24.15

**Primary Dependencies**: Angular 22.2 SSR, Express 5, tipos nativos `node:http`; Vercel Node Functions

**Storage**: N/A

**Testing**: Vitest/Angular TestBed, teste unitário do adaptador serverless, npm audit, build Angular SSR e smoke HTTP

**Target Platform**: Vercel Functions em Node.js 24 e execução SSR local

**Project Type**: Aplicação web Angular SSR com handler serverless

**Performance Goals**: Sem aumento material no tempo de build ou no caminho de delegação do handler

**Constraints**: Zero flags de compatibilidade; zero vulnerabilidades altas/críticas originadas na antiga dependência; sem deploy remoto; preservar status, cabeçalhos e corpo

**Scale/Scope**: Um handler, um manifest/lockfile, testes focados e documentação Spec Kit

## Constitution Check

| Gate             | Avaliação                                                           | Resultado |
| ---------------- | ------------------------------------------------------------------- | --------- |
| Segurança        | Remove toda a cadeia vulnerável em vez de silenciar audit           | PASS      |
| Compatibilidade  | Mantém objetos Node request/response esperados pelo handler Angular | PASS      |
| Escopo mínimo    | Alteração restrita ao adaptador, dependência e testes               | PASS      |
| Testabilidade    | Audit, unitário, build e smoke SSR cobrem os limites                | PASS      |
| Operação externa | Nenhum deploy ou mutação remota é necessário                        | PASS      |

**Post-design re-evaluation**: PASS. Tipos nativos são estruturais e o runtime Vercel fornece objetos Node compatíveis; o carregamento do SSR permanece lazy.

## Project Structure

### Documentation (this feature)

```text
specs/011-upgrade-vercel-node/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/handler-contract.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code

```text
api/
└── handler.ts
src/app/core/serverless/
└── vercel-handler.spec.ts
package.json
package-lock.json
vercel.json
```

**Structure Decision**: O handler continua em `api/handler.ts`. O teste fica no escopo descoberto pelo runner Angular e importa o adaptador com um loader injetável, evitando depender de artefato pré-gerado no teste unitário.

## Complexity Tracking

Nenhuma violação identificada.
