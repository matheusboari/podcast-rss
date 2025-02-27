import fs from "fs-extra";

export const deleteFile = (filePath: string) => {
  fs.unlink(filePath)
    .then(() => console.info(`🗑️ Arquivo deletado: ${filePath}`))
    .catch((err) => console.error("❌ Erro ao deletar arquivo:", err));
}
