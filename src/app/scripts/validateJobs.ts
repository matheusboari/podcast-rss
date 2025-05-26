import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

const prisma = new PrismaClient();

async function validateJobs() {
  try {
    // Validação do banco de dados
    await prisma.$connect();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso');

    // Validação das configurações do cron
    const cronExpressions = [
      '0 */6 * * *', // Exemplo de expressão cron
    ];

    cronExpressions.forEach(expression => {
      if (!cron.validate(expression)) {
        throw new Error(`Expressão cron inválida: ${expression}`);
      }
    });
    console.log('✅ Expressões cron validadas com sucesso');

    // Validação das variáveis de ambiente necessárias
    const requiredEnvVars = [
      'DATABASE_URL',
      'CLOUD_NAME',
      'API_KEY',
      'API_SECRET',
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
      throw new Error(`Variáveis de ambiente ausentes: ${missingEnvVars.join(', ')}`);
    }
    console.log('✅ Variáveis de ambiente validadas com sucesso');

    console.log('✅ Todos os jobs foram validados com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na validação dos jobs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

validateJobs();
