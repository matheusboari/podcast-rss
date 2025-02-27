import { Episode, PrismaClient } from "@prisma/client";

import audioUploaderService from "./audioUploader.service";
import youtubeService from "./youtube.service";
import { deleteFile } from "../utils/helper";

const prisma = new PrismaClient();

class PodcastService {
  async addPodcast(videoUrl: string): Promise<Episode> {
    try {
      const audioPath = await youtubeService.downloadAudioFromYouTube(videoUrl);
      const audioUrl = await audioUploaderService.uploadAudioToCloudinary(audioPath);
      const { title, description, pubDate } = await youtubeService.getYouTubeMetadata(videoUrl);

      const episode = await prisma.episode.create({
        data: { title, videoUrl, description, audioUrl, pubDate },
      });

      deleteFile(audioPath);

      return episode;
    } catch(error) {
      throw error;
    }
  }
}

export default new PodcastService();
