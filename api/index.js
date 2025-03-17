// Este arquivo serve como ponto de entrada para a API na Vercel
const path = require('path');
const fs = require('fs');

let app;

try {
  // Tentar importar o servidor compilado
  app = require('../dist/server');
  
  if (!app) {
    throw new Error('O servidor não foi importado corretamente');
  }
} catch (error) {
  console.error('Erro ao importar o servidor:', error.message);
  
  try {
    // Tentar importar o servidor fallback
    app = require('./server');
    console.log('Usando servidor fallback');
  } catch (fallbackError) {
    console.error('Erro ao importar o servidor fallback:', fallbackError.message);
    
    // Criar um servidor Express básico
    const express = require('express');
    app = express();
    
    app.get('/', (req, res) => {
      res.json({ 
        message: 'API está funcionando (fallback de emergência)',
        error: error.message,
        fallbackError: fallbackError.message
      });
    });
    
    app.get('/api/v1/health', (req, res) => {
      res.json({ status: 'ok' });
    });
  }
}

// Exportar o app para ser usado pela Vercel
module.exports = app; 