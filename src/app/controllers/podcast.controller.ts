import podcastService from "../services/podcast.service";
import rssService from "../services/rss.service";
import schedulerService from "../services/scheduler.service";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    try {
      const episode = await schedulerService.runJobManually();
      if (episode) {
        res.json({ message: "Episódio adicionado com sucesso!", episode });
      } else {
        res.json({ message: "Nenhum novo episódio encontrado." });
      }
    } catch (error) {
      res.status(500).json({ error: `Erro ao atualizar episódios. ${error}` });
    }
  }

  async listEpisodes(_: Request, res: Response) {
    try {
      const episodes = await prisma.episode.findMany({
        orderBy: {
          pubDate: 'desc'
        }
      });
      
      res.json({ 
        total: episodes.length,
        episodes: episodes.map(episode => ({
          id: episode.id,
          title: episode.title,
          videoUrl: episode.videoUrl,
          audioUrl: episode.audioUrl,
          pubDate: episode.pubDate,
          videoId: podcastService.extractVideoId(episode.videoUrl)
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
