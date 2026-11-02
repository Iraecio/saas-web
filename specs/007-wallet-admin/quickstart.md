# Quickstart: Administração completa de carteiras

## Pré-condições

1. API e frontend executando com dados de clientes, revendedores, gestores, profissionais, admins e superadmins.
2. Ao menos uma carteira com saldo zero, uma com reservas, uma com crédito a expirar, uma divergente e uma com disputa/estorno.
3. Sessões válidas de superadmin e de um papel sem permissão.

## Validação funcional

1. Acesse `/admin/wallet-admin` como superadmin e confirme indicadores, alertas e atalhos filtrados.
2. Abra a listagem, combine busca, papel, saldo, divergência e período; ordene e pagine; recarregue e confirme restauração pela URL.
3. Valide tabela no desktop, modo compacto no tablet e cards/drawer no smartphone a partir de 320 px, sem scroll horizontal.
4. Abra carteiras de cada papel e confirme resumo, composição e carregamento independente das seções.
5. Gere prévia de emissão, cancelamento, ajuste, congelamento/liberação e decisões pendentes; cancele sem mutar e depois conclua uma operação válida.
6. Altere a carteira em outra sessão e confirme que a versão antiga produz conflito sem sobrescrita.
7. Simule perda de conexão após confirmar e verifique consulta por idempotência antes de repetir.
8. Selecione registros visíveis e todos os resultados filtrados; valide prévia, inelegíveis, progresso e relatório de falha parcial.
9. Exporte o conjunto filtrado e confira filtros, data e colunas autorizadas.

## Validação de estados

- Reproduza skeleton, vazio global, vazio filtrado, erro por seção, offline, acesso negado, sessão expirada, conflito, resultado indeterminado e sucesso.
- Confirme que repetição de seção não reinicia toda a página e que dados administrativos são limpos ao perder autorização.

## Validação de acessibilidade

1. Conclua busca, filtros, detalhe e uma ação usando apenas teclado.
2. Verifique foco visível, retorno de foco, labels, nomes de ícones, mensagens associadas e anúncios de resultado.
3. Teste temas claro/escuro, zoom de 200%, contraste e redução de movimento.
4. Execute a suíte automatizada e uma leitura manual das jornadas prioritárias com leitor de tela.

## Comandos

```bash
npm test -- --watch=false
npm run build
```

Na API irmã:

```bash
npm run db:generate
npm test -- --runInBand
npm run build
```
