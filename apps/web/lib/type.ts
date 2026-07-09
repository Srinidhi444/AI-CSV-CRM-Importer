export interface CsvPreviewResponse {
  headers: string[];
  previewRows: Record<string, string>[];
  totalRows: number;
}

export interface CrmRecord {
  created_at: string | null;
  name: string | null;
  email: string | null;
  country_code: string | null;
  mobile_without_country_code: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  lead_owner: string | null;
  crm_status:
    | "GOOD_LEAD_FOLLOW_UP"
    | "DID_NOT_CONNECT"
    | "BAD_LEAD"
    | "SALE_DONE"
    | null;
  crm_note: string | null;
  data_source:
    | "leads_on_demand"
    | "meridian_tower"
    | "eden_park"
    | "varah_swamy"
    | "sarjapur_plots"
    | null;
  possession_time: string | null;
  description: string | null;
}

export interface SkippedRecord {
  rowIndex: number;
  reason: string;
  rawData: Record<string, string>;
}

export interface ProcessCsvResponse {
  headers: string[];
  previewRows: Record<string, string>[];
  imported: CrmRecord[];
  skipped: SkippedRecord[];
  totalImported: number;
  totalSkipped: number;
  totalRows: number;
}

export interface ParsedCsvPreview {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export type ImportStage =
  | "idle"
  | "selected"
  | "preview"
  | "processing"
  | "completed"
  | "error";