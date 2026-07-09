import { z } from "zod";
import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from "./enums.js";

export const CrmRecordSchema = z.object({
  created_at: z.string().nullable().describe("ISO-8601 date string, parseable by new Date()"),
  name: z.string().nullable(),
  email: z.string().nullable(),
  country_code: z.string().nullable(),
  mobile_without_country_code: z.string().nullable(),
  company: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string().nullable(),
  lead_owner: z.string().nullable(),
  crm_status: z.enum(CRM_STATUS_VALUES).nullable(),
  crm_note: z.string().nullable(),
  data_source: z.enum(DATA_SOURCE_VALUES).nullable(),
  possession_time: z.string().nullable(),
  description: z.string().nullable(),
});

export const ExtractionResultSchema = z.object({
  records: z.array(
    z.object({
      row_index: z.number().describe("Original index of this row within the batch"),
      skip: z.boolean().describe("True if record has neither email nor mobile"),
      skip_reason: z.string().nullable(),
      data: CrmRecordSchema.nullable().describe("Null if skip is true"),
    })
  ),
});

export type CrmRecord = z.infer<typeof CrmRecordSchema>;
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;