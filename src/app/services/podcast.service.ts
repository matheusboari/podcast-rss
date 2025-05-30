import Episode from '../../models/Episode';
import audioUploaderService from "./audioUploader.service";
import youtubeService from "./youtube.service";
import { deleteFile } from "../utils/helper";

class PodcastService {
  async addPodcast(videoUrl: string) {
    const normalizedUrl = this.normalizeYouTubeUrl(videoUrl);
    const videoId = this.extractVideoId(normalizedUrl);

    const existingEpisode = await Episode.findOne({ videoUrl: normalizedUrl });
    if (existingEpisode) {
      console.info("⚠️ Episódio já existe no banco de dados");
      return existingEpisode;
    }

    const audioPath = await youtubeService.downloadAudioFromYouTube(normalizedUrl);
    const audioUrl = await audioUploaderService.uploadAudioToCloudinary(audioPath);
    const { title, description, pubDate } = await youtubeService.getYouTubeMetadata(normalizedUrl);

    const episode = await Episode.create({
      id: videoId,
      title,
      videoUrl: normalizedUrl,
      description,
      audioUrl,
      pubDate
    });

    deleteFile(audioPath);

    return episode;
  }

  extractVideoId(url: string): string {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : "";
  }

  normalizeYouTubeUrl(url: string): string {
    const videoId = this.extractVideoId(url);
    if (!videoId) return url;
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  async findEpisodeByVideoId(videoId: string) {
    if (!videoId) return null;
    const normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`;
    return Episode.findOne({ videoUrl: normalizedUrl });
  }

  async findEpisodeByVideoUrl(videoUrl: string) {
    const videoId = this.extractVideoId(videoUrl);
    return this.findEpisodeByVideoId(videoId);
  }

  async fetchAndAddLatestEpisode() {
    try {
      console.info("🔄 Iniciando busca pelo último episódio...");
      const latestVideoUrl = await youtubeService.getLatestLiveFromChannel();
      
      if (!latestVideoUrl) {
        console.info("❌ Nenhum vídeo encontrado para adicionar");
        return null;
      }
      const normalizedUrl = this.normalizeYouTubeUrl(latestVideoUrl);
      const videoId = this.extractVideoId(normalizedUrl);
      
      const existingEpisode = await this.findEpisodeByVideoId(videoId);
      if (existingEpisode) {
        console.info("⚠️ Último episódio já existe no banco de dados");
        return existingEpisode;
      }
      console.info("✅ Adicionando novo episódio:", normalizedUrl);
      return this.addPodcast(normalizedUrl);
    } catch (error) {
      console.error("❌ Erro ao buscar e adicionar último episódio:", error);
      throw error;
    }
  }

  async listAllEpisodes() {
    return Episode.find().sort({ pubDate: -1 });
  }
}

export default new PodcastService();
