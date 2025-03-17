// Este arquivo é para testar se a API está funcionando corretamente

export default function handler(req, res) {
  return res.status(200).json({
    message: "API está funcionando corretamente via serverless function",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
} 