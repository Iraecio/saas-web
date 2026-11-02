# Quickstart: Validar Configuração de Preços do Revendedor

## Pré-condições

- Usuários `RESELLER`, `RESELLER_MANAGER` e papel não autorizado.
- Revenda com preço da plataforma, configuração vigente e pacotes ativos/inativos.
- Segunda sessão da mesma revenda para conflito.

## Cenário 1 — Preço e margem

1. Abrir `/admin/reseller-credits/pricing`.
2. Conferir custo, preço, margem e compra direta.
3. Informar novo preço e validar prévia imediata.
4. Confirmar impacto e conferir atualização persistente.
5. Testar valor inválido, abaixo do limite e ausência de custo.

## Cenário 2 — Compra direta e concorrência

1. Ativar e suspender compra direta, conferindo consequências no dialog.
2. Alterar a configuração em outra sessão entre prévia e confirmação.
3. Confirmar 409, estado atual e necessidade de nova decisão.

## Cenário 3 — Pacotes e consulta

1. Criar pacote e conferir preço efetivo/margem.
2. Buscar, filtrar, ordenar e paginar; recarregar e usar voltar/avançar.
3. Desativar pacote com confirmação e verificar preservação no histórico.
4. Selecionar página e todos os filtrados; validar prévia e sucesso parcial.

## Cenário 4 — Responsividade e temas

1. Validar 320, 390, 768, 1024 e 1440 px em claro/escuro.
2. Confirmar tabela desktop, densidade tablet e cards/drawer mobile.
3. Confirmar ausência de overflow e sobreposição.
4. Ativar redução de movimento.

## Cenário 5 — Acessibilidade e falhas

1. Concluir configuração e pacote somente por teclado.
2. Conferir foco, labels, erros, status e anúncios com leitor de tela.
3. Simular vazio, 401, 403, 409, 422, 503 e offline.
4. Confirmar preservação segura e ausência de repetição automática de comandos.

## Automação

```bash
npm test -- --watch=false
npm run format:check
npm run build
```

Na API irmã, executar testes de `credit-pricing` e `credit-trade`, seguidos de `npm run build`.
