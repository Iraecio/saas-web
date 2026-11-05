# Research: Design system do Kuber

## Decisão: traduzir, não importar

**Rationale**: Kuber usa Bootstrap, Angular Material e SCSS extenso; o produto já usa Tailwind 4 e Material. Importar tudo duplicaria resets, utilitários e componentes.

**Alternatives considered**: copiar `style.scss` completo; instalar Bootstrap; substituir o shell. Rejeitadas por risco de conflito, bundle e regressão.

## Mapa visual extraído

| Categoria  | Kuber claro                   | Kuber escuro            | Aplicação          |
| ---------- | ----------------------------- | ----------------------- | ------------------ |
| Canvas     | `#ecf0f4`                     | `#232b3e`               | `--ui-background`  |
| Superfície | `#ffffff`                     | `#1a202e`               | `--ui-surface`     |
| Primária   | `#005cbb`                     | azul claro de interação | `--ui-primary`     |
| Texto      | `#555`, `#5b626b`             | `#96a2b4`               | foreground/muted   |
| Borda      | `#f2f4f9`, `#dadada`          | transparência clara     | border/strong      |
| Card       | raio 10 px, sombra azul-cinza | sombra preta leve       | radius/shadow card |
| Densidade  | base 14 px, cabeçalho 17 px   | igual                   | escala compacta    |

## Decisão: preservar Outfit

**Rationale**: A marca atual já usa Outfit e a fonte melhora legibilidade; a equivalência virá de densidade, peso e escala do Kuber.

## Decisão: shell e primitives primeiro

**Rationale**: Tokens, sidebar, header, botões, cards, badges e tabelas propagam a mudança pela maior parte das páginas com baixo risco.
