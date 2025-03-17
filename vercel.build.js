const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Verificar se o diretório dist existe
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  fs.mkdirSync(path.join(__dirname, 'dist'));
}

// Gerar o cliente Prisma
console.log('Gerando o cliente Prisma...');
execSync('npx prisma generate', { stdio: 'inherit' });

// Compilar o TypeScript
console.log('Compilando o TypeScript...');
execSync('npx tsc -p tsconfig.json', { stdio: 'inherit' });

// Verificar se o arquivo server.js foi gerado
if (!fs.existsSync(path.join(__dirname, 'dist', 'server.js'))) {
  console.error('Erro: O arquivo server.js não foi gerado');
  process.exit(1);
}

console.log('Build concluído com sucesso!'); 