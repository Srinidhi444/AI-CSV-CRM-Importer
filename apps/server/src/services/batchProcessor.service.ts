import type { ImportResult, RawCsvRow, SkippedRecord } from "../types/crm.types.js";
import { extractCrmRecordsFromBatch } from "./aiExtractor.service.js";
import { aiConfig } from "../config/ai.config.js";
import { CrmRecordSchema, type CrmRecord } from "../schemas/crm-record.schema.js";

function chunkRows(rows: RawCsvRow[], batchSize: number): RawCsvRow[][] {
  const chunks: RawCsvRow[][] = [];

  for (let index = 0; index < rows.length; index += batchSize) {
    chunks.push(rows.slice(index, index + batchSize));
  }

  return chunks;
}

function cleanNullableString(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeRecord(record: CrmRecord): CrmRecord {
  return {
    created_at: cleanNullableString(record.created_at),
    name: cleanNullableString(record.name),
    email: cleanNullableString(record.email)?.toLowerCase() ?? null,
    country_code: cleanNullableString(record.country_code),
    mobile_without_country_code: cleanNullableString(record.mobile_without_country_code),
    company: cleanNullableString(record.company),
    city: cleanNullableString(record.city),
    state: cleanNullableString(record.state),
    country: cleanNullableString(record.country),
    lead_owner: cleanNullableString(record.lead_owner),
    crm_status: record.crm_status,
    crm_note: cleanNullableString(record.crm_note),
    data_source: record.data_source,
    possession_time: cleanNullableString(record.possession_time),
    description: cleanNullableString(record.description),
  };
}

function hasPrimaryContact(record: CrmRecord): boolean {
  return Boolean(record.email || record.mobile_without_country_code);
}

export async function processCsvRowsInBatches(
  rows: RawCsvRow[],
): Promise<ImportResult> {
  const batches = chunkRows(rows, aiConfig.batchSize);

  const imported: CrmRecord[] = [];
  const skipped: SkippedRecord[] = [];

  for (const batch of batches) {
    const extraction = await extractCrmRecordsFromBatch(batch);

    for (const item of extraction.records) {
      const originalRow = batch.find((row) => row.rowIndex === item.row_index);

      if (!originalRow) {
        skipped.push({
          rowIndex: item.row_index,
          reason: "Original row not found after batch extraction",
          rawData: {},
        });
        continue;
      }

      if (item.skip || !item.data) {
        skipped.push({
          rowIndex: item.row_index,
          reason: item.skip_reason ?? "Skipped by AI due to missing required contact fields",
          rawData: originalRow.data,
        });
        continue;
      }

      const normalized = normalizeRecord(item.data);
      const validated = CrmRecordSchema.safeParse(normalized);

      if (!validated.success) {
        skipped.push({
          rowIndex: item.row_index,
          reason: "Structured record validation failed",
          rawData: originalRow.data,
        });
        continue;
      }

      if (!hasPrimaryContact(validated.data)) {
        skipped.push({
          rowIndex: item.row_index,
          reason: "Missing both email and mobile number",
          rawData: originalRow.data,
        });
        continue;
      }

      imported.push(validated.data);
    }
  }

  return {
    imported,
    skipped,
    totalImported: imported.length,
    totalSkipped: skipped.length,
    totalRows: rows.length,
  };
}