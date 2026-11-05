# Quickstart: validar o design system Kuber

1. Execute `npm test`.
2. Execute `npm run build`.
3. Inicie a aplicação e acesse `/admin/settings/ui-kit`.
4. Valide dashboard, listagem e formulário em temas claro e escuro.
5. Teste larguras de 320, 768, 1024 e 1440 px.
6. Navegue apenas por teclado e confirme foco, menu ativo e ações.

## Resultado da implementação

- `npm test -- --watch=false`: 21 arquivos e 79 testes aprovados.
- `npm run build`: build SSR aprovado; bundle inicial de 518,23 kB.
- Tokens claro/escuro e APIs dos componentes compartilhados preservados.
- Login migrado para card dividido; usuários, pedidos, serviços, profissionais e revendedores migrados para o padrão de listagem Kuber.
