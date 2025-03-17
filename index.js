// Este arquivo serve como ponto de entrada alternativo
try {
  // Tentar importar o servidor compilado
  const app = require('./dist/server');
  
  // Verificar se o app foi importado corretamente
  if (!app) {
    console.error('Erro: O servidor não foi importado corretamente');
    process.exit(1);
  }
  
  // Iniciar o servidor se estiver em produção
  if (process.env.NODE_ENV === 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor iniciado na porta ${PORT}`);
    });
  }
  
  // Exportar o app para ser usado pelo Vercel
  module.exports = app;
} catch (error) {
  console.error('Erro ao importar o servidor:', error);
  process.exit(1);
} 