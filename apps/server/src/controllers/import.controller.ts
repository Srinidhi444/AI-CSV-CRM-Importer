import type { Request, Response, NextFunction } from "express";
import { parseCsvBuffer } from "../services/csvParser.service.js";
import { processCsvRowsInBatches } from "../services/batchProcessor.service.js";

export async function importCsvController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        message: "CSV file is required",
      });
      return;
    }

    const parsedCsv = parseCsvBuffer(req.file.buffer);
    const result = await processCsvRowsInBatches(parsedCsv.rows);

    res.status(200).json({
      headers: parsedCsv.headers,
      previewRows: parsedCsv.previewRows,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function previewCsvController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        message: "CSV file is required",
      });
      return;
    }

    const parsedCsv = parseCsvBuffer(req.file.buffer);

    res.status(200).json({
      headers: parsedCsv.headers,
      previewRows: parsedCsv.previewRows,
      totalRows: parsedCsv.totalRows,
    });
  } catch (error) {
    next(error);
  }
}