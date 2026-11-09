# Security Contract

## POST /v1/auth/login

- Aceita credenciais existentes.
- Responde `{ user, accessToken }`.
- Define cookie de refresh `HttpOnly`; nunca devolve refresh token no JSON.

## POST /v1/auth/refresh

- Lê refresh token somente do cookie.
- Exige `X-CSRF-Protection: 1` e origem permitida.
- Responde `{ accessToken }` e substitui o cookie por token rotacionado.

## POST /v1/auth/logout

- Revoga tokens do usuário e limpa o cookie mesmo quando a resposta é vazia.

## POST /v1/orders

- Para item de voz, calcula duração do briefing no servidor.
- Rejeita serviço sem limite estruturado ou com limite menor que a duração estimada.
- Ignora qualquer preço, revisão, papel ou duração enviado pelo cliente.

## Database

- Toda tabela exposta possui RLS habilitado.
- Ausência de policy explícita resulta em zero acesso para `anon`/`authenticated`.
- Storage não aceita escrita anônima e vincula operações autenticadas ao proprietário.
