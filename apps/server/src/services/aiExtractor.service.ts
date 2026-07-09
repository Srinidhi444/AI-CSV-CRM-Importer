import { GoogleGenAI, Type } from "@google/genai";
import { aiConfig } from "../config/ai.config.js";
import { env } from "../config/env.js";
import {
  CRM_STATUS_VALUES,
  DATA_SOURCE_VALUES,
} from "../schemas/enums.js";
import {
  ExtractionResultSchema,
  type ExtractionResult,
} from "../schemas/crm-record.schema.js";
import type { RawCsvRow } from "../types/crm.types.js";
import { withRetry } from "../utils/retry.js";

const genAI = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

const extractionResponseSchema = {
  type: Type.OBJECT,
  properties: {
    records: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          row_index: { type: Type.INTEGER },
          skip: { type: Type.BOOLEAN },
          skip_reason: { type: Type.STRING, nullable: true },
          data: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
              created_at: { type: Type.STRING, nullable: true },
              name: { type: Type.STRING, nullable: true },
              email: { type: Type.STRING, nullable: true },
              country_code: { type: Type.STRING, nullable: true },
              mobile_without_country_code: { type: Type.STRING, nullable: true },
              company: { type: Type.STRING, nullable: true },
              city: { type: Type.STRING, nullable: true },
              state: { type: Type.STRING, nullable: true },
              country: { type: Type.STRING, nullable: true },
              lead_owner: { type: Type.STRING, nullable: true },
              crm_status: {
                type: Type.STRING,
                nullable: true,
                enum: [...CRM_STATUS_VALUES],
              },
              crm_note: { type: Type.STRING, nullable: true },
              data_source: {
                type: Type.STRING,
                nullable: true,
                enum: [...DATA_SOURCE_VALUES],
              },
              possession_time: { type: Type.STRING, nullable: true },
              description: { type: Type.STRING, nullable: true },
            },
            required: [
              "created_at",
              "name",
              "email",
              "country_code",
              "mobile_without_country_code",
              "company",
              "city",
              "state",
              "country",
              "lead_owner",
              "crm_status",
              "crm_note",
              "data_source",
              "possession_time",
              "description",
            ],
            propertyOrdering: [
              "created_at",
              "name",
              "email",
              "country_code",
              "mobile_without_country_code",
              "company",
              "city",
              "state",
              "country",
              "lead_owner",
              "crm_status",
              "crm_note",
              "data_source",
              "possession_time",
              "description",
            ],
          },
        },
        required: ["row_index", "skip", "skip_reason", "data"],
        propertyOrdering: ["row_index", "skip", "skip_reason", "data"],
      },
    },
  },
  required: ["records"],
  propertyOrdering: ["records"],
};

function buildSystemInstruction(): string {
  return [
    "You extract CRM lead records from arbitrary CSV rows into the GrowEasy CRM schema.",
    "Never assume fixed column names.",
    "Infer mapping from header names, value shapes, and row context.",
    "",
    "Rules:",
    "1. Use only these crm_status values:",
    ...CRM_STATUS_VALUES.map((value) => `- ${value}`),
    "2. Use only these data_source values:",
    ...DATA_SOURCE_VALUES.map((value) => `- ${value}`),
    "If data_source is not confidently one of these, return null.",
    "3. created_at must be parseable by JavaScript new Date(created_at). If unclear, return null.",
    "4. Put remarks, follow-up notes, extra phone numbers, extra email addresses, and leftover useful context into crm_note.",
    "5. If multiple emails exist, use the first email and append the rest into crm_note as plain text.",
    "6. If multiple phone numbers exist, use the first mobile_without_country_code and append the rest into crm_note as plain text.",
    "7. If a row has neither email nor mobile number, set skip=true, set a concise skip_reason, and set data=null.",
    "8. Do not invent facts. Prefer null when uncertain.",
    "9. Keep values single-line safe. Avoid raw line breaks inside string fields.",
    "10. Return one output object per input row, preserving row_index exactly.",
    "11. All output fields must be plain text JSON values only.",
    "12. Never use markdown, links, bullets, HTML, or formatting in any string field.",
    "13. Do not infer country_code unless it is explicitly present in the source value or clearly separable from the phone number.",
  ].join("\n");
}

function buildUserPrompt(batch: RawCsvRow[]): string {
  const headers = Array.from(new Set(batch.flatMap((row) => Object.keys(row.data))));

  const payload = batch.map((row) => ({
    row_index: row.rowIndex,
    row: row.data,
  }));

  return [
    "Detected CSV headers:",
    JSON.stringify(headers, null, 2),
    "",
    "Rows to transform:",
    JSON.stringify(payload, null, 2),
    "",
    "Return the JSON object exactly matching the required schema.",
  ].join("\n");
}

function stripMarkdownLinks(value: string): string {
  return value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
}

function stripMarkdownFormatting(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1");
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function sanitizeString(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const sanitized = normalizeWhitespace(
    stripMarkdownFormatting(stripMarkdownLinks(value)),
  );

  return sanitized.length > 0 ? sanitized : null;
}

function sanitizeCountryCode(value: string | null): string | null {
  const sanitized = sanitizeString(value);

  if (!sanitized) {
    return null;
  }

  const normalized = sanitized.replace(/^\+/, "");

  if (!/^\d{1,4}$/.test(normalized)) {
    return null;
  }

  return normalized;
}

function sanitizeMobile(value: string | null): string | null {
  const sanitized = sanitizeString(value);

  if (!sanitized) {
    return null;
  }

  const digitsOnly = sanitized.replace(/[^\d]/g, "");

  return digitsOnly.length > 0 ? digitsOnly : null;
}

function sanitizeEmail(value: string | null): string | null {
  const sanitized = sanitizeString(value);

  if (!sanitized) {
    return null;
  }

  const firstEmail = sanitized.split(/[;,]/)[0]?.trim() ?? "";
  return firstEmail || null;
}

function sanitizeImportedRecord(record: Record<string, unknown>) {
  return {
    created_at: sanitizeString((record.created_at as string | null) ?? null),
    name: sanitizeString((record.name as string | null) ?? null),
    email: sanitizeEmail((record.email as string | null) ?? null),
    country_code: sanitizeCountryCode((record.country_code as string | null) ?? null),
    mobile_without_country_code: sanitizeMobile(
      (record.mobile_without_country_code as string | null) ?? null,
    ),
    company: sanitizeString((record.company as string | null) ?? null),
    city: sanitizeString((record.city as string | null) ?? null),
    state: sanitizeString((record.state as string | null) ?? null),
    country: sanitizeString((record.country as string | null) ?? null),
    lead_owner: sanitizeString((record.lead_owner as string | null) ?? null),
    crm_status: record.crm_status ?? null,
    crm_note: sanitizeString((record.crm_note as string | null) ?? null),
    data_source: record.data_source ?? null,
    possession_time: sanitizeString((record.possession_time as string | null) ?? null),
    description: sanitizeString((record.description as string | null) ?? null),
  };
}

function sanitizeExtractionResult(payload: unknown): unknown {
  if (
    !payload ||
    typeof payload !== "object" ||
    !("records" in payload) ||
    !Array.isArray((payload as { records: unknown[] }).records)
  ) {
    return payload;
  }

  return {
    records: (payload as { records: unknown[] }).records.map((record) => {
      if (!record || typeof record !== "object") {
        return record;
      }

      const typedRecord = record as {
        row_index?: unknown;
        skip?: unknown;
        skip_reason?: unknown;
        data?: unknown;
      };

      return {
        row_index: typedRecord.row_index,
        skip: typedRecord.skip,
        skip_reason: sanitizeString((typedRecord.skip_reason as string | null) ?? null),
        data:
          typedRecord.data && typeof typedRecord.data === "object"
            ? sanitizeImportedRecord(typedRecord.data as Record<string, unknown>)
            : typedRecord.data,
      };
    }),
  };
}

export async function extractCrmRecordsFromBatch(
  batch: RawCsvRow[],
): Promise<ExtractionResult> {
  return withRetry(
    async () => {
      const response = await genAI.models.generateContent({
        model: aiConfig.model,
        contents: buildUserPrompt(batch),
        config: {
          temperature: aiConfig.temperature,
          systemInstruction: buildSystemInstruction(),
          responseMimeType: "application/json",
          responseSchema: extractionResponseSchema,
        },
      });

      const text = response.text;

      if (!text) {
        throw new Error("Gemini returned an empty response");
      }

      let parsedJson: unknown;

      try {
        parsedJson = JSON.parse(text);
      } catch {
        throw new Error("Gemini returned invalid JSON");
      }

      const sanitizedJson = sanitizeExtractionResult(parsedJson);
      const validated = ExtractionResultSchema.safeParse(sanitizedJson);

      if (!validated.success) {
        throw new Error("Gemini response failed schema validation");
      }

      return validated.data;
    },
    {
      maxAttempts: aiConfig.maxRetries,
      baseDelayMs: aiConfig.retryBaseDelayMs,
    },
  );
}