#!/bin/bash

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null
then
    echo "Vercel CLI não está instalado. Instalando..."
    npm install -g vercel
fi

# Construir o projeto
echo "Construindo o projeto..."
yarn build

# Fazer o deploy na Vercel
echo "Fazendo o deploy na Vercel..."
vercel --prod

echo "Deploy concluído!" 