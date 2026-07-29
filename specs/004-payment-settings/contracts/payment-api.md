# Payment Configuration API Contract

Todos os paths são relativos ao prefixo configurado da API. Respostas de sucesso chegam ao serviço frontend já sem o envelope global.

## Superadmin

| Método | Path | Entrada | Saída |
|---|---|---|---|
| GET | `/admin/payment-method-policies` | — | `PaymentMethodPolicy[]` |
| POST | `/admin/payment-method-policies` | política sem `id` | `PaymentMethodPolicy` |
| GET | `/admin/payment-configurations` | — | `PaymentConfiguration[]` |
| POST | `/admin/payment-configurations` | `CreatePaymentConfiguration` | `PaymentConfiguration` |
| PATCH | `/admin/payment-configurations/:id` | `UpdatePaymentConfiguration` | `PaymentConfiguration` |
| POST | `/admin/payment-configurations/:id/validate` | `{}` | `PaymentConfiguration` |
| POST | `/admin/payment-configurations/:id/activate` | `{}` | `PaymentConfiguration` |
| POST | `/admin/payment-configurations/:id/suspend` | `{ reason }` | `PaymentConfiguration` |

Somente `SUPER_ADMIN`.

## Revenda

| Método | Path | Entrada | Saída |
|---|---|---|---|
| GET | `/reseller/payment-method-policies` | — | `PaymentMethodPolicy[]` autorizadas |
| GET | `/reseller/payment-configurations` | — | `PaymentConfiguration[]` |
| POST | `/reseller/payment-configurations` | `CreatePaymentConfiguration` | `PaymentConfiguration` |
| PATCH | `/reseller/payment-configurations/:id` | `UpdatePaymentConfiguration` | `PaymentConfiguration` |
| POST | `/reseller/payment-configurations/:id/validate` | `{}` | `PaymentConfiguration` |
| POST | `/reseller/payment-configurations/:id/activate` | `{}` | `PaymentConfiguration` |

Somente `RESELLER` e `RESELLER_MANAGER`. O escopo deriva da identidade autenticada; o cliente não envia `resellerId`.

## Payloads

```ts
type CreatePaymentConfiguration = {
  policyId: string;
  name: string;
  priority?: number;
  currency?: string;
  publicConfig: Record<string, unknown>;
  credentials?: Record<string, unknown>;
};

type UpdatePaymentConfiguration = {
  name?: string;
  priority?: number;
  publicConfig?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
};
```

Credenciais nunca fazem parte da resposta. `hasCredentials` é a única indicação exposta.
