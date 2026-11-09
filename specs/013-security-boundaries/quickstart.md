# Quickstart: verificação de segurança

1. Configure segredos locais reais fora do Git e suba o stack.
2. Aplique migrations Prisma em banco limpo e em banco já migrado.
3. Faça login e confirme que a resposta não contém `refreshToken` e que o cookie é HttpOnly.
4. Renove a sessão com credenciais e cabeçalho anti-CSRF; repita o token antigo e confirme rejeição.
5. Crie pedido de voz compatível e depois envie manualmente um `serviceId` de faixa inferior; confirme `422`.
6. Consulte tabelas `public` via anon/authenticated e confirme deny-by-default.
7. Tente inserir, alterar e apagar objetos Storage como anônimo e como outro usuário; confirme negação.
8. Execute testes e builds dos dois projetos.

## Resultado da implementação (2026-11-09)

- Web: build de produção aprovado; 21 arquivos e 79 testes aprovados.
- API: build aprovado; schema Prisma válido; 5 suítes focadas aprovadas, com 36 testes relevantes aprovados.
- Compose: configuração validada com credenciais de teste fornecidas por ambiente; nenhum segredo administrativo literal foi reintroduzido.
- Migrations: duração, bloqueio do schema `public` e policies de Storage permanecem em três migrations independentes.
- Revisão estática: `git diff --check` aprovado nos dois repositórios; busca por formatos de segredos encontrou apenas nomes de papéis e placeholders declarados nos arquivos de exemplo.

A suíte completa da API ainda contém falhas preexistentes em mocks de transação (`PrismaService.$transaction`) e outros mocks antigos. As verificações focadas desta correção e os builds passaram; nenhuma proteção foi relaxada para acomodar esses testes legados.
