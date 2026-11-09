# Data Model: Endurecimento das Fronteiras de Segurança

## Service

- `maxDurationSeconds: Int?`: maior duração aceita pelo serviço de voz.
- Validação: positivo quando presente; obrigatório para novos serviços `VOICE_ACTOR` e para contratação de serviços de voz.
- Regra: `estimatedDurationSeconds <= maxDurationSeconds`.

## Session

- `accessToken`: JWT curto devolvido no corpo e mantido apenas em memória.
- `refreshToken`: JWT rotacionável armazenado no servidor e transportado em cookie HttpOnly.
- `tokenId`: identificador de rotação.
- Estados: ativo → consumido/revogado → substituído; replay de estado consumido é rejeitado.

## Isolated Resource

- Identificadores possíveis: `user_id`, `owner`, `reseller_id`.
- Campos sensíveis: papel, saldo, créditos, status financeiro, preço de custo, propriedade e auditoria.
- Regra: ausência de policy explícita equivale a negação.

## Storage Object

- `owner`: identidade autenticada que pode operar o objeto.
- `bucket_id`: finalidade do objeto.
- Transições: criar pelo proprietário; ler/alterar/apagar pelo proprietário; operação administrativa somente por serviço confiável.
