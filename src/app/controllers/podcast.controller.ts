import podcastService from "../services/podcast.service";
import rssService from "../services/rss.service";
import { Request, Response } from "express";
import { YOUTUBE_CHANNEL_ID } from "../../settings";
import youtubeService from "../services/youtube.service";

class PodcastController {
  async addEpisode(req: Request, res: Response) {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: "É necessário fornecer uma URL do YouTube." });
    }

    try {
      const episode = await podcastService.addPodcast(videoUrl);
      res.json({ message: "Episódio adicionado!", episode });
    } catch (error) {
      res.status(500).json({ error: `Erro ao adicionar episódio. ${error}` });
    }
  }

  async updateEpisodes(_: Request, res: Response) {
    console.log('🚀 Iniciando o download de todos os episódios desde 28/01/2024...');

    if (!YOUTUBE_CHANNEL_ID) {
      return res.status(500).json({ error: 'ID do canal do YouTube não configurado no arquivo .env' });
    }

    const targetDate = new Date('2024-01-28T00:00:00Z');
    console.log(`📅 Data alvo: ${targetDate.toISOString()}`);
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

      // Buscar todos os vídeos do canal usando a API do YouTube
      console.log('🔍 Obtendo vídeos do canal...');
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
      const existingEpisodes = await podcastService.listAllEpisodes();
      const existingVideoIds = existingEpisodes
        .filter(ep => ep.videoUrl)
        .map(ep => podcastService.extractVideoId(ep.videoUrl!));
      
      // Filtrar apenas os vídeos que não existem no banco
      const newVideos = filteredVideos.filter(video => 
        !existingVideoIds.includes(video.videoId)
      );
      
      console.log(`⏳ ${newVideos.length} novas livestreams para processar`);
      
      // Processar cada vídeo
      const results = {
        success: [] as any[],
        errors: [] as any[]
      };
      
      for (const [index, video] of newVideos.entries()) {
        try {
          console.log(`\n📼 Processando livestream ${index + 1}/${newVideos.length}: ${video.title}`);
          const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
          
          const episode = await podcastService.addPodcast(videoUrl);
          
          console.log(`✅ Episódio adicionado com sucesso: ${episode.title}`);
          results.success.push(episode);
        } catch (error) {
          console.error(`❌ Erro ao processar livestream: ${video.title}`, error);
          results.errors.push({ video, error });
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      res.json({
        message: 'Atualização de episódios concluída',
        summary: {
          totalProcessed: newVideos.length,
          successCount: results.success.length,
          errorCount: results.errors.length
        },
        results
      });
      
    } catch (error) {
      console.error('❌ Erro ao executar a atualização:', error);
      res.status(500).json({ error: `Erro ao atualizar episódios: ${error}` });
    }
  }

  async listEpisodes(_: Request, res: Response) {
    try {
      const episodes = await podcastService.listAllEpisodes();
      res.json({ 
        total: episodes.length,
        episodes: episodes.map(episode => ({
          id: episode.id,
          title: episode.title,
          videoUrl: episode.videoUrl,
          audioUrl: episode.audioUrl,
          pubDate: episode.pubDate,
          videoId: episode.id
        }))
      });
    } catch (error) {
      res.status(500).json({ error: `Erro ao listar episódios. ${error}` });
    }
  }

  async getRss(_: Request, res: Response) {
    try {
      const rssFeed = await rssService.fetchRSSFeed();
      
      res.set("Content-Type", "application/rss+xml");
      res.send(rssFeed);
    } catch (error) {
      res.status(500).json({ error: `Erro ao gerar feed RSS. ${error}` });
    }
  }
}

export default new PodcastController();
