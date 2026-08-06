# Quickstart: Administração completa de profissionais

## Prerequisites

- Superadmin, admin comum, locutor/produtor global, locutor/produtor de duas revendas e usuário bloqueado.
- Pedidos, serviços, carteira e histórico para ao menos um profissional.
- API com os contratos de `contracts/` implementados.

## Automated validation

```bash
npm test -- --watch=false
npm run build
npm run format:check
```

Na API irmã: executar testes de user/auth/admin-professional/impersonation e build.

## Manual scenarios

1. Buscar, filtrar, ordenar e paginar; abrir detalhe e voltar preservando contexto.
2. Validar tabela desktop e cards/drawer em 320, 768 e 1440 px.
3. Abrir todas as seis seções e simular falha parcial.
4. Editar com versão válida e simular `409` concorrente.
5. Bloquear com motivo, confirmar revogação de sessão e reativar.
6. Solicitar reset e confirmar que nenhuma senha/token aparece.
7. Executar lote misto e validar resultado individual.
8. Inspecionar locutor e produtor; validar banner, visibilidade e F5.
9. Tentar POST/PATCH/DELETE durante inspeção e confirmar bloqueio no servidor.
10. Encerrar e expirar inspeção; confirmar retorno à sessão/rota administrativa.
11. Tentar inspeção como ADMIN e contra administrador/inativo.
12. Repetir principais jornadas por teclado, leitor de tela e nos dois temas.
