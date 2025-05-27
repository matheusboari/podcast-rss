import { exec } from 'child_process';
import { YOUTUBE_CHANNEL_ID } from '../../settings';
import podcastService from '../services/podcast.service';
import youtubeService from '../services/youtube.service';
import mongoose from 'mongoose';
import Episode from '../../models/Episode';

/**
 * Script para baixar todos os episódios de um canal do YouTube
 * a partir de uma data específica (28/01/2024)
 */
async function downloadAllEpisodes() {
  await mongoose.connect(process.env.MONGO_URL as string);
  console.log('🚀 Iniciando o download de todos os episódios desde 28/01/2024...');

  if (!YOUTUBE_CHANNEL_ID) {
    console.error('❌ ID do canal do YouTube não configurado no arquivo .env');
    process.exit(1);
  }

  const targetDate = new Date('2024-01-28T00:00:00Z');
  console.log(`📅 Data alvo: ${targetDate.toISOString()}`);
  console.log(`🎬 Canal alvo: ${YOUTUBE_CHANNEL_ID}`);

  try {
    // Buscar vídeos do canal
    const channelIdentifier = YOUTUBE_CHANNEL_ID;
    const videos = await youtubeService.getChannelVideos(channelIdentifier);
    console.log(`✅ Encontrados ${videos.length} vídeos no canal`);

    // Filtrar vídeos pela data
    const filteredVideos = videos
      .filter(video => {
        try {
          const videoDate = new Date(video.publishedAt);
          return videoDate >= targetDate;
        } catch (error) {
          console.warn(`⚠️ Data inválida para vídeo ${video.videoId}: ${video.publishedAt}`);
          return false;
        }
      })
      .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());

    console.log(`🎯 Encontrados ${filteredVideos.length} livestreams desde ${targetDate.toDateString()}`);

    // Verificar quais vídeos já existem no banco
    const existingEpisodes = await Episode.find();
    const existingVideoIds = existingEpisodes.map(ep => 
      podcastService.extractVideoId(ep.videoUrl)
    );

    // Filtrar apenas os vídeos que não existem no banco
    const newVideos = filteredVideos.filter(video => 
      !existingVideoIds.includes(video.videoId)
    );

    console.log(`⏳ ${newVideos.length} novas livestreams para processar`);

    // Processar cada vídeo
    let successCount = 0;
    let errorCount = 0;

    for (const [index, video] of newVideos.entries()) {
      try {
        console.log(`\n📼 Processando livestream ${index + 1}/${newVideos.length}: ${video.title}`);
        const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

        // Usando o mesmo fluxo da rota /add-episode
        const episode = await podcastService.addPodcast(videoUrl);

        console.log(`✅ Episódio adicionado com sucesso: ${episode.title}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Erro ao processar livestream: ${video.title}`, error);
        errorCount++;
      }

      // Pequena pausa para evitar sobrecarga nas APIs
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n📊 Resumo da operação:');
    console.log(`✅ Episódios adicionados: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`🏁 Total de livestreams processadas: ${newVideos.length}`);
  } catch (error) {
    console.error('❌ Erro ao executar o script:', error);
  } finally {
    await mongoose.disconnect();
  }
}

/**
 * Função para obter IDs de vídeos de um canal do YouTube
 */
function getVideoIdsFromChannel(channelUrl: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    // Comando para extrair apenas os IDs dos vídeos
    const command = `yt-dlp --flat-playlist --get-id "${channelUrl}"`;
    
    exec(command, (error, stdout) => {
      if (error) {
        console.error('❌ Erro ao buscar IDs de vídeos do canal:', error);
        reject(error);
        return;
      }
      
      const videoIds = stdout.trim().split('\n').filter(id => id);
      resolve(videoIds);
    });
  });
}

// Auto-executa o script quando chamado diretamente
if (require.main === module) {
  downloadAllEpisodes()
    .then(() => {
      console.log('🏁 Script finalizado com sucesso!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

export default downloadAllEpisodes;
