import { exec } from "child_process";
import path from "path";
import { DOWNLOAD_FOLDER_PATH, YOUTUBE_CHANNEL_ID } from "../../settings";

interface VideoMetadata {
  videoId: string;
  title: string;
  publishedAt: string;
}

class YoutubeService {
  async downloadAudioFromYouTube(videoUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputFilePath = path.join(DOWNLOAD_FOLDER_PATH, `audio.mp3`);
  
      const command = `yt-dlp -f bestaudio --extract-audio --audio-format mp3 -o "${outputFilePath}" ${videoUrl}`;
  
      console.info("🔄 Baixando áudio do YouTube...");
      exec(command, (error) => {
        if (error) {
          console.error("❌ Erro ao baixar áudio:", error);
          reject(error);
        } else {
          console.info("✅ Download concluído:", outputFilePath);
          resolve(outputFilePath);
        }
      });
    });
  }

  async getYouTubeMetadata(videoUrl: string): Promise<{ title: string; description: string; pubDate: string }> {
    return new Promise((resolve, reject) => {
      const command = `yt-dlp --print "%(title)s|%(description)s|%(upload_date)s" ${videoUrl}`;
  
      exec(command, (error, stdout) => {
        if (error) {
          reject(`Erro ao obter metadados: ${error.message}`);
        } else {
          const data = stdout.trim().split("|");
          const [title, description] = data;
          const pubDate = stdout.trim().split("|")[data.length - 1];
          resolve({
            title,
            description,
            pubDate: `${pubDate.slice(0, 4)}-${pubDate.slice(4, 6)}-${pubDate.slice(6, 8)}T00:00:00Z`,
          });
        }
      });
    });
  }

  extractChannelIdentifier(channelUrl: string): string {
    if (!channelUrl) return "";
    if (!channelUrl.includes("youtube.com") && !channelUrl.includes("youtu.be")) {
      return channelUrl;
    }

    const regexPatterns = [
      /youtube\.com\/channel\/([^\/\?]+)/,
      /youtube\.com\/c\/([^\/\?]+)/,
      /youtube\.com\/@([^\/\?]+)/
    ];
    
    for (const regex of regexPatterns) {
      const match = channelUrl.match(regex);
      if (match && match[1]) {
        return match[1];
      }
    }

    return channelUrl;
  }

  async getLatestLiveFromChannel(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (!YOUTUBE_CHANNEL_ID) {
        reject("ID do canal do YouTube não configurado");
        return;
      }

      const channelIdentifier = this.extractChannelIdentifier(YOUTUBE_CHANNEL_ID);

      let channelUrl;
      if (channelIdentifier.startsWith("UC")) {
        channelUrl = `https://www.youtube.com/channel/${channelIdentifier}`;
      } else if (channelIdentifier.startsWith("@")) {
        channelUrl = `https://www.youtube.com/${channelIdentifier}`;
      } else {
        channelUrl = `https://www.youtube.com/c/${channelIdentifier}`;
      }

      const command = `yt-dlp --flat-playlist --playlist-end 5 --get-id "${channelUrl}/videos"`;
      
      console.info("🔍 Buscando últimos vídeos do canal...");
      console.info("🔗 URL do canal:", channelUrl);
      
      exec(command, (error, stdout) => {
        if (error) {
          console.error("❌ Erro ao buscar vídeos do canal:", error);
          reject(error);
          return;
        }
        
        const videoIds = stdout.trim().split("\n").filter(id => id);
        if (videoIds.length === 0) {
          console.info("❌ Nenhum vídeo encontrado no canal");
          resolve(null);
          return;
        }

        const latestVideoId = videoIds[0];
        const videoUrl = `https://www.youtube.com/watch?v=${latestVideoId}`;
        console.info("✅ Último vídeo encontrado:", videoUrl);
        resolve(videoUrl);
      });
    });
  }

  async getChannelVideos(channelIdentifier: string): Promise<VideoMetadata[]> {
    return new Promise((resolve, reject) => {
      const channelUrl = `https://www.youtube.com/${channelIdentifier}/videos`;
      const command = `yt-dlp --flat-playlist --print "%(id)s|%(title)s|%(upload_date)s" "${channelUrl}"`;
      
      exec(command, (error, stdout) => {
        if (error) {
          console.error("❌ Erro ao buscar vídeos do canal:", error);
          reject(error);
          return;
        }
        
        const videos = stdout.trim().split("\n")
          .filter(line => line)
          .map(line => {
            const [videoId, title, uploadDate] = line.split("|");
            return {
              videoId,
              title,
              publishedAt: `${uploadDate.slice(0, 4)}-${uploadDate.slice(4, 6)}-${uploadDate.slice(6, 8)}T00:00:00Z`
            };
          });
        
        resolve(videos);
      });
    });
  }
}

export default new YoutubeService(); 