# Data Model: Configuração de Meios de Pagamento

## PaymentMethodPolicy

- `id`: identificador imutável
- `providerCode`: código único do adaptador
- `methodType`: `MANUAL | PIX | PROVIDER`
- `displayName`: nome apresentado
- `platformEnabled`: autorizado para configurações da plataforma
- `resellerEnabled`: autorizado para configurações de revenda
- `capabilities`: mapa somente leitura das capacidades do adaptador
- `createdAt`, `updatedAt`: auditoria temporal

Uma política possui zero ou mais configurações. Revendas só podem criar usando políticas com `resellerEnabled`.

## PaymentConfiguration

- `id`: identificador imutável
- `ownerType`: `PLATFORM | RESELLER`
- `resellerId`: preenchido apenas no escopo revenda
- `policyId`: política selecionada
- `policy`: resumo da política retornado pela listagem
- `name`: nome operacional, mínimo de dois caracteres
- `status`: `DRAFT | ACTIVE | SUSPENDED | INACTIVE | INVALID`
- `priority`: inteiro não negativo; menor valor aparece antes
- `currency`: código de três caracteres, criado como `BRL` por padrão
- `publicConfig`: objeto não secreto enviado ao comprador
- `credentialsVersion`: versão opaca das credenciais
- `hasCredentials`: indica presença sem expor conteúdo
- `validatedAt`, `validatedById`: validação atual
- `createdById`, `updatedById`, `createdAt`, `updatedAt`: auditoria

### State transitions

```text
criação -> DRAFT
DRAFT --validar--> DRAFT validado
DRAFT validado --ativar--> ACTIVE
ACTIVE --editar--> DRAFT não validado
ACTIVE --suspender (plataforma)--> SUSPENDED
SUSPENDED --validar/ativar--> ACTIVE
```

A API pode devolver `INACTIVE` ou `INVALID`; a página os representa, mas não inventa transições ausentes.

## PaymentConfigurationDraft

- `policyId`, `name`, `priority`, `currency`
- `publicConfig`: objeto obrigatório
- `credentials`: objeto opcional e somente escrita

Na atualização, `policyId` e `currency` não são alteráveis pelo contrato atual. Credenciais vazias são omitidas.
