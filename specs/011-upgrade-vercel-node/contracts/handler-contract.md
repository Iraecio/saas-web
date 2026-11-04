# Contract: Handler serverless

- Entrada: objetos Node compatíveis com requisição e resposta HTTP.
- Loader padrão: importa `dist/saas-web/server/server.mjs` sob demanda.
- Delegação: chama `reqHandler(req, res)` exatamente uma vez e devolve seu resultado.
- Erros: falhas de importação ou execução são rejeitadas ao chamador sem serem silenciadas.
- Configuração: `api/handler.ts` continua sendo a função de destino em `vercel.json`, com `maxDuration` preservado.
