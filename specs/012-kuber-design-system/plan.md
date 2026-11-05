# Implementation Plan: Design system inspirado no Kuber

**Branch**: `012-kuber-design-system` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-kuber-design-system/spec.md`

## Summary

Mapear a linguagem visual do Kuber e traduzi-la para tokens CSS/Tailwind, shell administrativo e componentes compartilhados do Angular existente. A implementação preserva comportamento e dependências, evitando importar Bootstrap ou copiar a arquitetura inteira do template.

## Technical Context

**Language/Version**: TypeScript 6, Angular 22, SCSS/CSS

**Primary Dependencies**: Tailwind CSS 4, Angular Material 22, Lucide Angular

**Storage**: LocalStorage apenas para preferência de tema já existente

**Testing**: Angular unit test runner, build SSR de produção e inspeção responsiva

**Target Platform**: Navegadores modernos, desktop e mobile, renderização SSR na Vercel

**Project Type**: Aplicação web Angular standalone

**Performance Goals**: Sem nova dependência visual pesada; transições limitadas a transform/opacity/color; orçamento atual de bundle preservado

**Constraints**: Sem alteração funcional; sem Bootstrap; compatível com temas claro/escuro e redução de movimento

**Scale/Scope**: Tokens globais, shell, navegação e seis padrões compartilhados usados por dezenas de páginas

## Constitution Check

A constituição contém placeholders e não define gates executáveis. Aplicam-se os gates operacionais do repositório: preservar o stack, acessibilidade, SSR, testes e mudanças focadas. **PASS**.

## Project Structure

### Documentation (this feature)

```text
specs/012-kuber-design-system/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/design-system-contract.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code

```text
src/
├── styles.scss
└── app/
    ├── layouts/admin-layout/admin-layout.ts
    └── shared/
        ├── components/{sidebar,header,card,button,table,stats-card}/
        └── ui/{button,card,badge}/
```

**Structure Decision**: Evoluir a fundação e os componentes existentes; páginas continuam consumindo as mesmas classes e seletores.

## Complexity Tracking

Nenhuma violação. Não serão adicionados framework visual, pacote de ícones ou segunda camada de tema.

## Post-Design Constitution Check

**PASS**. O contrato mantém tokens semânticos, compatibilidade de API dos componentes e verificação automatizada.
