import type { NextFunction, Request, Response } from "express";
import multer from "multer";

function getStatusCode(error: unknown): number {
  if (error instanceof multer.MulterError) {
    return 400;
  }

  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("csv")) {
      return 400;
    }

    if (error.message.toLowerCase().includes("validation")) {
      return 400;
    }
  }

  return 500;
}

function getClientMessage(error: unknown): string {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return "Uploaded file exceeds the maximum allowed size";
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message || "Internal server error";
  }

  return "Internal server error";
}

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = getStatusCode(error);
  const message = getClientMessage(error);

  if (statusCode >= 500) {
    console.error("Unhandled server error:", error);
  }

  res.status(statusCode).json({
    message,
  });
}