import multer, { type FileFilterCallback } from "multer";
import path from "node:path";
import { env } from "../config/env.js";

const allowedMimeTypes = new Set([
  "text/csv",
  "application/csv",
  "text/plain",
  "application/vnd.ms-excel",
]);

function csvFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) {
  const ext = path.extname(file.originalname).toLowerCase();
  const hasValidExtension = ext === ".csv";
  const hasValidMimeType = allowedMimeTypes.has(file.mimetype);

  if (!hasValidExtension || !hasValidMimeType) {
    return cb(new Error("Only valid CSV files are allowed"));
  }

  cb(null, true);
}

export const uploadCsv = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1,
  },
  fileFilter: csvFileFilter,
}).single("file");