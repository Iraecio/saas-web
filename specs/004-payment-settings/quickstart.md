# Quickstart: Validar Configuração de Pagamentos

## Pré-requisitos

- `saas-api` com a migração da feature 014 aplicada
- Uma conta `SUPER_ADMIN`
- Uma conta `RESELLER` ou `RESELLER_MANAGER` vinculada a uma revenda

## Plataforma

1. Entrar como superadmin e abrir `/admin/settings/pagamento`.
2. Criar ou habilitar uma política `MANUAL`, `PIX_MANUAL` ou `GENERIC_WEBHOOK`.
3. Criar uma configuração usando JSON válido.
4. Confirmar que a credencial desaparece do editor e aparece apenas como “credencial configurada”.
5. Validar e ativar.
6. Suspender informando justificativa e confirmar o estado.

## Revenda

1. Habilitar `resellerEnabled` em uma política como superadmin.
2. Entrar como revendedor e abrir `/admin/settings/pagamento`.
3. Criar a configuração da revenda, validar e ativar.
4. Confirmar que políticas não autorizadas não podem ser escolhidas.
5. Editar sem informar credenciais e confirmar que `hasCredentials` permanece verdadeiro.

## Segurança e recuperação

1. Tentar abrir a URL como `ADMIN` ou `CLIENT` e confirmar bloqueio.
2. Interromper a API, abrir a página e confirmar erro com nova tentativa.
3. Informar JSON inválido e confirmar que nenhum request é enviado.

## Verificação automatizada

```bash
npm test -- --watch=false
npm run build
npm run format:check
```
