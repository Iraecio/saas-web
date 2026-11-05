# UI Contract: Kuber design system

## Tokens obrigatórios

Canvas, foreground, surface, surface-subtle, muted, border, border-strong, brand, brand-hover, brand-foreground, danger, warning, focus, raios e sombras devem existir nos temas claro e escuro.

## Compatibilidade

- Classes públicas `btn-*`, `card`, `form-*`, `table-cell`, `badge`, `sidebar-item` permanecem disponíveis.
- Inputs e outputs dos componentes Angular compartilhados não mudam.
- Rotas, permissões e conteúdo dos menus permanecem iguais.

## Acessibilidade

- Foco visível em todo controle.
- Contraste legível nos dois temas.
- Alvos interativos com altura mínima de 40 px, exceto ações compactas explicitamente rotuladas.
- Movimento reduzido respeitado.
