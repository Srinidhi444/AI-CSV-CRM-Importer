"use client";

import { useCallback, useState } from "react";
import Papa, { type ParseError, type ParseResult } from "papaparse";
import type { ParsedCsvPreview } from "../lib/type";

interface UseCsvParserReturn {
  parseFile: (file: File) => Promise<ParsedCsvPreview>;
  isParsing: boolean;
  parseError: string | null;
  clearParseError: () => void;
}

function normalizeCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

export function useCsvParser(): UseCsvParserReturn {
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const clearParseError = useCallback(() => {
    setParseError(null);
  }, []);

  const parseFile = useCallback((file: File) => {
    setIsParsing(true);
    setParseError(null);

    return new Promise<ParsedCsvPreview>((resolve, reject) => {
      Papa.parse<Record<string, unknown>>(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: (results: ParseResult<Record<string, unknown>>) => {
          setIsParsing(false);

          if (results.errors.length > 0) {
            const firstError = results.errors[0] as ParseError;
            const message = firstError.message || "Failed to parse CSV file";
            setParseError(message);
            reject(new Error(message));
            return;
          }

          const rows = results.data.map((row) =>
            Object.fromEntries(
              Object.entries(row).map(([key, value]) => [key.trim(), normalizeCellValue(value)]),
            ),
          );

          const headers = (results.meta.fields ?? []).map((field) => field.trim());

          resolve({
            headers,
            rows: rows.slice(0, 20),
            totalRows: rows.length,
          });
        },
        error: (error) => {
          setIsParsing(false);
          setParseError(error.message);
          reject(error);
        },
      });
    });
  }, []);

  return {
    parseFile,
    isParsing,
    parseError,
    clearParseError,
  };
}