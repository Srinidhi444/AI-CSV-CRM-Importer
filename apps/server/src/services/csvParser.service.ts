
import { parse } from "csv-parse/sync";
import type { RawCsvRow } from "../types/crm.types.js";
import { env } from "../config/env.js";

export interface ParsedCsvResult {
  headers: string[];
  rows: RawCsvRow[];
  previewRows: Record<string, string>[];
  totalRows: number;
}

function normalizeHeader(header: string): string {
  return header
    .replace(/^\uFEFF/, "")
    .trim();
}

function normalizeCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).replace(/\r\n/g, "\n").trim();
}

function assertCsvBufferLooksSafe(buffer: Buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error("Uploaded CSV file is empty");
  }

  const text = buffer.toString("utf-8");

  if (!text.trim()) {
    throw new Error("Uploaded CSV file is empty");
  }

  return text;
}

export function parseCsvBuffer(buffer: Buffer): ParsedCsvResult {
  const csvText = assertCsvBufferLooksSafe(buffer);

  const rawRecords = parse(csvText, {
    columns: (headerRow: string[]) => headerRow.map(normalizeHeader),
    skip_empty_lines: true,
    bom: true,
    relax_column_count: true,
    trim: true,
  }) as Record<string, unknown>[];

  if (rawRecords.length === 0) {
    throw new Error("CSV contains no data rows");
  }

  if (rawRecords.length > env.MAX_ROWS) {
    throw new Error(`CSV exceeds maximum allowed rows (${env.MAX_ROWS})`);
  }

  const headers = Object.keys(rawRecords[0] ?? {}).map(normalizeHeader);

  const rows: RawCsvRow[] = rawRecords.map((record, index) => {
    const normalizedData = Object.fromEntries(
      Object.entries(record).map(([key, value]) => [
        normalizeHeader(key),
        normalizeCellValue(value),
      ]),
    );

    return {
      rowIndex: index,
      data: normalizedData,
    };
  });

  const previewRows = rows.slice(0, 10).map((row) => row.data);

  return {
    headers,
    rows,
    previewRows,
    totalRows: rows.length,
  };
}