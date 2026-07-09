import { CrmRecord } from "../schemas/crm-record.schema.js";

export interface RawCsvRow {
  rowIndex: number;
  data: Record<string, string>;
}

export interface SkippedRecord {
  rowIndex: number;
  reason: string;
  rawData: Record<string, string>;
}

export interface ImportResult {
  imported: CrmRecord[];
  skipped: SkippedRecord[];
  totalImported: number;
  totalSkipped: number;
  totalRows: number;
}