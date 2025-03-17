// Este arquivo serve como fallback caso o build falhe
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ 
    message: 'API está funcionando (fallback)',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/v1/test', (req, res) => {
  res.json({ 
    message: 'Teste bem-sucedido',
    timestamp: new Date().toISOString()
  });
});

// Exportar o app para ser usado pela Vercel
module.exports = app; 