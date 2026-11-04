# Implementation Plan: Atualização para Angular 22

**Branch**: `010-upgrade-angular-22` | **Date**: 2026-11-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-upgrade-angular-22/spec.md`

## Summary

Atualizar a aplicação Angular 21.2 para a linha estável 22.2, alinhando framework, CLI, build, SSR, Material/CDK, PrimeNG, TypeScript e a integração oficial Lucide. Executar as migrações oficiais, manter a arquitetura standalone/SSR e validar instalação limpa, testes, build de produção e resolução de peers sem alterar os fluxos do produto.

## Technical Context

**Language/Version**: TypeScript 6.0; Node.js 24.15.0 (compatível também com ^22.22.3 e ^26)

**Primary Dependencies**: Angular 22.2, Angular CLI/build/SSR 22.2, Angular Material/CDK 22.2, PrimeNG 22.1, RxJS 7.8, `@lucide/angular` 1.67, Tailwind CSS 4

**Storage**: N/A; atualização não altera persistência nem contratos de dados

**Testing**: Vitest via Angular TestBed; build Angular SSR; inspeção de dependências com npm

**Target Platform**: Navegadores no Baseline 2026-05-07; servidor Node.js suportado pelo Angular 22

**Project Type**: Aplicação web standalone com SSR

**Performance Goals**: Nenhuma piora superior a 10% na linha de base dos fluxos críticos e apresentação inicial

**Constraints**: Preservar SSR, hidratação, rotas, autenticação, responsividade e acessibilidade; não adicionar funcionalidade; instalação sem conflito de peers

**Scale/Scope**: Um workspace Angular, sete consumidores Lucide, configuração de build/teste/SSR e documentação operacional

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

A constituição contém somente placeholders. Aplicam-se gates operacionais consolidados no projeto.

| Gate | Avaliação | Resultado |
|---|---|---|
| Compatibilidade oficial | Versões seguem a matriz publicada para Angular 22 | PASS |
| Atualização incremental | Migração ocorre diretamente de 21 para 22 com schematics oficiais | PASS |
| SSR e hidratação | Arquitetura e contratos existentes são preservados | PASS |
| Dependências | Todos os peers devem resolver sem `--force` ou `--legacy-peer-deps` | PASS |
| Regressão | Testes, build e smoke tests são gates de conclusão | PASS |
| Escopo | Sem redesign, mudança de API ou nova funcionalidade | PASS |

**Post-design re-evaluation**: PASS. A substituição de `lucide-angular` por `@lucide/angular` elimina um peer incompatível mantendo o componente e os ícones existentes; não há mudança de dados ou API.

## Project Structure

### Documentation (this feature)

```text
specs/010-upgrade-angular-22/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/migration-validation.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
package.json
package-lock.json
README.md
angular.json
tsconfig.json
src/
├── server.ts
└── app/                       # imports Lucide e testes existentes
```

**Structure Decision**: Manter o workspace e a aplicação existentes. Mudanças ficam limitadas a manifests, migrações oficiais, imports do pacote Lucide e documentação; arquivos de produto só mudam quando exigido pelo compilador ou por peers compatíveis.

## Complexity Tracking

Nenhuma violação constitucional identificada.
