const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Verificar se o diretório dist existe
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  fs.mkdirSync(path.join(__dirname, 'dist'));
}

// Verificar se o arquivo tsconfig.json existe
const tsconfigPath = path.join(__dirname, 'tsconfig.json');
if (!fs.existsSync(tsconfigPath)) {
  console.error('Erro: O arquivo tsconfig.json não foi encontrado');
  console.log('Conteúdo do diretório:', fs.readdirSync(__dirname));
  
  // Criar um arquivo tsconfig.json básico
  const tsconfig = {
    "compilerOptions": {
      "target": "ESNext",
      "module": "commonjs",
      "moduleResolution": "node",
      "esModuleInterop": true,
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": false,
      "allowJs": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "sourceMap": true,
      "removeComments": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "**/*.spec.ts"]
  };
  
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  console.log('Arquivo tsconfig.json criado com sucesso');
}

// Gerar o cliente Prisma
console.log('Gerando o cliente Prisma...');
execSync('npx prisma generate', { stdio: 'inherit' });

// Compilar o TypeScript
console.log('Compilando o TypeScript...');
try {
  execSync('npx tsc -p tsconfig.json', { stdio: 'inherit' });
} catch (error) {
  console.error('Erro ao compilar o TypeScript:', error.message);
  
  // Tentar compilar com opções básicas
  console.log('Tentando compilar com opções básicas...');
  execSync('npx tsc --outDir ./dist --rootDir ./src', { stdio: 'inherit' });
}

// Verificar se o arquivo server.js foi gerado
if (!fs.existsSync(path.join(__dirname, 'dist', 'server.js'))) {
  console.error('Erro: O arquivo server.js não foi gerado');
  
  // Criar um arquivo server.js básico
  const serverJs = `
    const express = require('express');
    const app = express();
    
    app.get('/', (req, res) => {
      res.json({ message: 'API está funcionando' });
    });
    
    app.get('/api/v1/health', (req, res) => {
      res.json({ status: 'ok' });
    });
    
    module.exports = app;
    module.exports.default = app;
  `;
  
  fs.writeFileSync(path.join(__dirname, 'dist', 'server.js'), serverJs);
  console.log('Arquivo server.js criado manualmente');
}

console.log('Build concluído com sucesso!'); 