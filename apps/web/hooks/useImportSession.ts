"use client";

import { useCallback, useMemo, useState } from "react";
import { processCsvFile } from "@/lib/api-client";
import type {
  ImportStage,
  ParsedCsvPreview,
  ProcessCsvResponse,
} from "../lib/type";

interface UseImportSessionReturn {
  file: File | null;
  preview: ParsedCsvPreview | null;
  result: ProcessCsvResponse | null;
  stage: ImportStage;
  error: string | null;
  setSelectedFile: (file: File | null) => void;
  setPreviewData: (preview: ParsedCsvPreview | null) => void;
  clearSession: () => void;
  processImport: () => Promise<void>;
  isReadyForPreview: boolean;
  isReadyForImport: boolean;
  isProcessing: boolean;
}

export function useImportSession(): UseImportSessionReturn {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedCsvPreview | null>(null);
  const [result, setResult] = useState<ProcessCsvResponse | null>(null);
  const [stage, setStage] = useState<ImportStage>("idle");
  const [error, setError] = useState<string | null>(null);

  const setSelectedFile = useCallback((selectedFile: File | null) => {
    setFile(selectedFile);
    setPreview(null);
    setResult(null);
    setError(null);
    setStage(selectedFile ? "selected" : "idle");
  }, []);

  const setPreviewData = useCallback((previewData: ParsedCsvPreview | null) => {
    setPreview(previewData);
    setResult(null);
    setError(null);
    setStage(previewData ? "preview" : file ? "selected" : "idle");
  }, [file]);

  const clearSession = useCallback(() => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setStage("idle");
  }, []);

  const processImport = useCallback(async () => {
    if (!file) {
      setError("Please select a CSV file first");
      setStage("error");
      return;
    }

    try {
      setError(null);
      setStage("processing");
      const response = await processCsvFile(file);
      setResult(response);
      setStage("completed");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to process CSV file";
      setError(message);
      setStage("error");
    }
  }, [file]);

  const isReadyForPreview = useMemo(() => Boolean(file), [file]);
  const isReadyForImport = useMemo(() => Boolean(file && preview), [file, preview]);
  const isProcessing = stage === "processing";

  return {
    file,
    preview,
    result,
    stage,
    error,
    setSelectedFile,
    setPreviewData,
    clearSession,
    processImport,
    isReadyForPreview,
    isReadyForImport,
    isProcessing,
  };
}