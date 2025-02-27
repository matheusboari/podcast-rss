import { exec } from "child_process";
import path from "path";

import { DOWNLOAD_FOLDER_PATH } from "../../settings";

class YoutubeService {
  async downloadAudioFromYouTube (videoUrl: string): Promise<string> {
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
  };

  async getYouTubeMetadata(videoUrl: string): Promise<{ title: string; description: string; pubDate: string }> {
    return new Promise((resolve, reject) => {
      const command = `yt-dlp --print "%(title)s|%(description)s|%(upload_date)s" ${videoUrl}`;
  
      exec(command, (error, stdout) => {
        if (error) {
          reject(`Erro ao obter metadados: ${error.message}`);
        } else {
          const data = stdout.trim().split("|");
          const [title, description] = data
          const pubDate = stdout.trim().split("|")[data.length - 1];
          resolve({
            title,
            description,
            pubDate: `${pubDate.slice(0, 4)}-${pubDate.slice(4, 6)}-${pubDate.slice(6, 8)}T00:00:00Z`,
          });
        }
      });
    })
  }
}

export default new YoutubeService();
