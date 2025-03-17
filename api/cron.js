// Este arquivo é necessário para o cron job da Vercel
// Ele redireciona para a rota /api/v1/api/cron do nosso servidor Express

export default async function handler(req, res) {
  try {
    // Redirecionar para a rota interna
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/v1/api/cron`);
    const data = await response.json();
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao executar cron job:', error);
    return res.status(500).json({ error: 'Erro ao executar cron job' });
  }
} 