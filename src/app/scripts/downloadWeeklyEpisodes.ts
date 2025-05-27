import { exec } from 'child_process';
import { YOUTUBE_CHANNEL_ID } from '../../settings';
import podcastService from '../services/podcast.service';
import youtubeService from '../services/youtube.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para baixar todos os episódios de um canal do YouTube
 * a partir do início da semana atual
 */
async function downloadWeeklyEpisodes() {
  console.log('🚀 Iniciando o download dos episódios da semana atual...');

  if (!YOUTUBE_CHANNEL_ID) {
    console.error('❌ ID do canal do YouTube não configurado no arquivo .env');
    process.exit(1);
  }

  // Calcula o início da semana atual (domingo)
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Volta para o domingo
  startOfWeek.setHours(0, 0, 0, 0);

  console.log(`📅 Data alvo: ${startOfWeek.toISOString()}`);
  console.log(`🎬 Canal alvo: ${YOUTUBE_CHANNEL_ID}`);

  try {
    // Extrair identificador do canal
    let channelIdentifier = YOUTUBE_CHANNEL_ID;
    if (YOUTUBE_CHANNEL_ID.includes('youtube.com')) {
      if (YOUTUBE_CHANNEL_ID.includes('/channel/')) {
        channelIdentifier = YOUTUBE_CHANNEL_ID.split('/channel/')[1].split('/')[0];
      } else if (YOUTUBE_CHANNEL_ID.includes('/c/')) {
        channelIdentifier = YOUTUBE_CHANNEL_ID.split('/c/')[1].split('/')[0];
      } else if (YOUTUBE_CHANNEL_ID.includes('/@')) {
        channelIdentifier = YOUTUBE_CHANNEL_ID.split('/@')[1].split('/')[0];
      }
    }

    // Construir URL do canal para streams
    let channelUrl;
    if (channelIdentifier.startsWith('UC')) {
      channelUrl = `https://www.youtube.com/channel/${channelIdentifier}/streams`;
    } else if (channelIdentifier.startsWith('@')) {
      channelUrl = `https://www.youtube.com/${channelIdentifier}/streams`;
    } else {
      channelUrl = `https://www.youtube.com/@${channelIdentifier}/streams`;
    }

    console.log(`🔗 URL do canal (streams): ${channelUrl}`);

    // Buscar todos os IDs de vídeos do canal
    console.log('🔍 Obtendo IDs de todas as livestreams...');
    const videoIds = await getVideoIdsFromChannel(channelUrl);
    console.log(`✅ Encontrados ${videoIds.length} vídeos no canal`);

    // Obter metadados completos para cada vídeo
    console.log('📋 Obtendo metadados completos para cada vídeo...');
    const videos = [];
    
    for (const [index, videoId] of videoIds.entries()) {
      try {
        console.log(`🔄 Processando metadados ${index + 1}/${videoIds.length}: ${videoId}`);
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // Obter metadados do vídeo usando o serviço de YouTube existente
        const metadata = await youtubeService.getYouTubeMetadata(videoUrl);
        
        videos.push({
          videoId,
          title: metadata.title,
          publishedAt: metadata.pubDate
        });

        // Pequena pausa para evitar sobrecarga
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Erro ao obter metadados do vídeo ${videoId}:`, error);
      }
    }
    
    // Filtrar vídeos pela data
    const filteredVideos = videos
      .filter(video => {
        try {
          const videoDate = new Date(video.publishedAt);
          return videoDate >= startOfWeek;
        } catch (error) {
          console.warn(`⚠️ Data inválida para vídeo ${video.videoId}: ${video.publishedAt}`);
          return false;
        }
      })
      .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());

    console.log(`🎯 Encontrados ${filteredVideos.length} livestreams desde ${startOfWeek.toDateString()}`);
    
    // Verificar quais vídeos já existem no banco
    const existingEpisodes = await prisma.episode.findMany();
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
    await prisma.$disconnect();
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
  downloadWeeklyEpisodes()
    .then(() => {
      console.log('🏁 Script finalizado com sucesso!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

export default downloadWeeklyEpisodes; 