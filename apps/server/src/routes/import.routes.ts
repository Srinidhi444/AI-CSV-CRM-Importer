import { Router } from "express";
import {
  importCsvController,
  previewCsvController,
} from "../controllers/import.controller.js";
import { uploadCsv } from "../middleware/upload.middleware.js";

export const importRouter = Router();

importRouter.post("/preview", uploadCsv, previewCsvController);
importRouter.post("/process", uploadCsv, importCsvController);