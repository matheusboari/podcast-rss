import cron from 'node-cron';
import podcastService from './podcast.service';

class SchedulerService {
  private job: cron.ScheduledTask | null = null;

  startDailyJob() {
    this.job = cron.schedule('0 10 * * *', async () => {
      console.info('🕙 Iniciando job diário para buscar novo episódio...');
      try {
        const episode = await podcastService.fetchAndAddLatestEpisode();
        if (episode) {
          console.info('✅ Episódio adicionado com sucesso:', episode.title);
        } else {
          console.info('⚠️ Nenhum novo episódio encontrado');
        }
      } catch (error) {
        console.error('❌ Erro ao executar job diário:', error);
      }
    });

    console.info('✅ Job diário agendado para rodar às 10:00 AM');
    return this.job;
  }

  stopJob() {
    if (this.job) {
      this.job.stop();
      this.job = null;
      console.info('⏹️ Job diário parado');
    }
  }

  async runJobManually() {
    console.info('🔄 Executando job manualmente...');
    try {
      const episode = await podcastService.fetchAndAddLatestEpisode();
      if (episode) {
        console.info('✅ Episódio adicionado com sucesso:', episode.title);
        return episode;
      } else {
        console.info('⚠️ Nenhum novo episódio encontrado');
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao executar job manualmente:', error);
      throw error;
    }
  }
}

export default new SchedulerService(); 