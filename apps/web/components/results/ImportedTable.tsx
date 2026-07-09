import type { CrmRecord } from "../../lib/type";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface ImportedTableProps {
  records: CrmRecord[];
}

const columns: Array<keyof CrmRecord> = [
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
];

export function ImportedTable({ records }: ImportedTableProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          Successfully Parsed Records
        </h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          {records.length} records ready
        </p>
      </div>

      <div className="max-h-[480px] overflow-auto rounded-2xl border border-[var(--border)]">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-10 bg-[var(--surface-2)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="border-b border-[var(--border)] px-4 py-3 text-left font-medium whitespace-nowrap text-[var(--foreground)]"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record, rowIndex) => (
              <tr key={`${record.email ?? record.mobile_without_country_code ?? rowIndex}`}>
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column}`}
                    className="max-w-[260px] border-b border-[var(--border-subtle)] px-4 py-3 align-top text-[var(--muted-foreground)]"
                  >
                    {column === "crm_status" ? (
                      <StatusBadge value={record.crm_status} />
                    ) : (
                      <div className="truncate" title={record[column] ?? ""}>
                        {record[column] || "—"}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}