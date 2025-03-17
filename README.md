# Podcast RSS

Serviço para gerar feed RSS de podcast a partir de vídeos do YouTube.

## Migração do Railway para Vercel e Supabase

### Configuração do Supabase

1. Crie uma conta no [Supabase](https://supabase.com/)
2. Crie um novo projeto
3. Vá para a seção SQL Editor e execute o seguinte comando para criar a tabela:

```sql
CREATE TABLE "Episode" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "videoUrl" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "audioUrl" TEXT NOT NULL,
  "pubDate" TIMESTAMP NOT NULL
);
```

4. Vá para Project Settings > Database para obter a URL de conexão

### Configuração da Vercel

1. Crie uma conta na [Vercel](https://vercel.com/)
2. Importe o repositório do GitHub
3. Configure as seguintes variáveis de ambiente:

```
ENV=production
PORT=3000
JWT_SECRET=seu-jwt-secret
DATABASE_URL=postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO-ID].supabase.co:5432/postgres
CLOUD_NAME=seu-cloud-name
API_KEY=sua-api-key
API_SECRET=seu-api-secret
YOUTUBE_CHANNEL_ID=https://www.youtube.com/@Pastoralissons
RSS_TITLE=Devocionalmente Podcast
RSS_DESCRIPTION=Podcast Devocionalmente
RSS_LINK=https://devocionalmente.com.br
RSS_LANGUAGE=pt-br
```

4. Deploy o projeto usando o script `deploy.sh` ou diretamente pelo dashboard da Vercel

### Solução para o erro 404 nas rotas

Se você estiver enfrentando erro 404 em todas as rotas, siga estas etapas:

1. Certifique-se de que o arquivo `vercel.json` está configurado corretamente:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/"
       }
     ]
   }
   ```

2. Verifique se o arquivo `index.js` na raiz do projeto está configurado corretamente:
   ```javascript
   // Este arquivo serve como ponto de entrada alternativo
   const app = require('./dist/server');

   // Exportar o app para ser usado pelo Vercel
   module.exports = app;
   ```

3. Certifique-se de que o arquivo `package.json` está configurado corretamente:
   ```json
   {
     "name": "podcast-rss",
     "version": "1.0.0",
     "main": "index.js",
     "engines": {
       "node": "18.x"
     },
     "scripts": {
       "dev": "ts-node-dev --inspect=0.0.0.0:5859 --respawn --transpile-only --project tsconfig.json --exit-child ./src/server.ts",
       "build": "tsc",
       "prestart": "yarn build",
       "start": "node index.js",
       "lint": "yarn eslint \"./**/*.ts\" --max-warnings=0",
       "db:deploy": "npx prisma migrate deploy && npx prisma generate",
       "vercel-build": "prisma generate && tsc"
     }
   }
   ```

4. Certifique-se de que o arquivo `src/server.ts` está exportando o app corretamente:
   ```typescript
   // Exportar o app para ser usado pelo Vercel
   module.exports = app;
   ```

5. Após fazer essas alterações, faça o deploy novamente na Vercel.

6. Se o problema persistir, tente as seguintes soluções:
   - Remova o projeto da Vercel e importe novamente
   - Verifique se o build está sendo gerado corretamente nos logs da Vercel
   - Tente usar o comando `vercel --prod` para fazer o deploy diretamente pelo CLI

### Solução para o erro 401 (Unauthorized)

Se você estiver enfrentando erro 401 ao acessar as rotas, verifique os seguintes pontos:

1. As rotas POST (`/add-episode` e `/update-episodes`) requerem autenticação
   - Para fins de teste, o middleware de autenticação foi configurado para permitir acesso sem autenticação
   - Em produção, você deve implementar uma autenticação adequada

2. As rotas GET (`/episodes`, `/rss`, `/api/cron`, `/health`, `/test`) são públicas e não requerem autenticação

3. Se você estiver usando o Postman, certifique-se de que está usando o método HTTP correto (GET ou POST)

### Configuração do Cron Job

O projeto está configurado para executar um cron job diariamente às 00:00 UTC para buscar novos episódios. Isso é feito através da configuração no arquivo `vercel.json` e do endpoint `/api/cron`.

## Desenvolvimento Local

1. Clone o repositório
2. Instale as dependências: `yarn install`
3. Crie um arquivo `.env` baseado no `.env.example`
4. Execute o projeto: `yarn dev` 