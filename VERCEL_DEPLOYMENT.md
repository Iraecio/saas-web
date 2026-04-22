# Deployment no Vercel

O projeto foi configurado para ser deployado no Vercel com suporte a Angular SSR (Server-Side Rendering).

## Arquivos de Configuração Adicionados

- **vercel.json** - Configuração do build e ambiente para Vercel
- **.vercelignore** - Arquivos ignorados durante o deploy
- **api/handler.ts** - Handler Node.js para processar requisições

## Passos para Deploy

### 1. Preparar o Repositório

```bash
git add .
git commit -m "chore: configure project for Vercel deployment"
git push origin main
```

### 2. Conectar ao Vercel

#### Opção A: Via Dashboard (Recomendado)
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta
3. Clique em "New Project"
4. Selecione o repositório GitHub/GitLab
5. Vercel detectará automaticamente as configurações do Angular
6. Clique em "Deploy"

#### Opção B: Via CLI
```bash
npm install -g vercel
vercel deploy
```

### 3. Variáveis de Ambiente (se necessário)

No dashboard do Vercel:
1. Vá para Settings → Environment Variables
2. Adicione quaisquer variáveis necessárias (se houver)

## Configuração Detalhada

### Build
- **Comando**: `npm run build`
- **Output Directory**: `dist/saas-web/browser`
- **Node.js Version**: 20.x (configurado no vercel.json)

### Serverless Function
- **Handler**: `api/handler.ts`
- **Runtime**: Node.js 20.x
- **Max Duration**: 60 segundos

### Rewrite Rules
Todas as requisições são roteadas para `api/handler` que renderiza a aplicação Angular.

## Verificar Deploy

Após o deploy:
1. Visite a URL fornecida pelo Vercel
2. Verifique se a aplicação Angular carrega corretamente
3. Teste a navegação e funcionalidades principais

## Troubleshooting

### Build falha
- Verifique se há erros no output: `npm run build` localmente
- Consulte os logs do Vercel no dashboard

### Aplicação não renderiza
- Verifique se `api/handler.ts` está importando corretamente
- Confirme se `dist/saas-web/server/server.mjs` foi gerado

### Performance
- Use `vercel analytics` para monitorar performance
- Verifique o tamanho dos bundles gerados

## Próximas Etapas

- Configurar domínio customizado (Settings → Domains)
- Ativar HTTPS automático (habilitado por padrão)
- Configurar CI/CD para fazer deploy automático em cada push
- Monitorar performance e erros via dashboard

## Referências

- [Vercel Angular Guide](https://vercel.com/docs/frameworks/angular)
- [Angular SSR Documentation](https://angular.dev/guide/ssr)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
