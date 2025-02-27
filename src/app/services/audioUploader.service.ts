import cloudinary from "cloudinary";
import { API_KEY, API_SECRET, CLOUD_NAME } from "../../settings";

cloudinary.v2.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

class AudioUploaderService {
  async uploadAudioToCloudinary(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload(
        filePath,
        { resource_type: "video" },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result?.secure_url || "");
          }
        }
      );
    });
  }
}

export default new AudioUploaderService();
