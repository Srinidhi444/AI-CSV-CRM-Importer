import type { CrmRecord } from "../../lib/type";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface ImportedTableProps {
  records: CrmRecord[];
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatContact(record: CrmRecord): string {
  if (!record.mobile_without_country_code) return "—";
  return record.country_code
    ? `+${record.country_code} ${record.mobile_without_country_code}`
    : record.mobile_without_country_code;
}

export function ImportedTable({ records }: ImportedTableProps) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Imported Leads
          </h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            {records.length} records
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
              <th className="px-6 py-3">Lead Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Date Created</th>
              <th className="px-6 py-3">Company</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">CRM Note</th>
              <th className="px-6 py-3">Data Source</th>
              <th className="px-6 py-3">Lead Owner</th>
            </tr>
          </thead>

          <tbody>
            {records.map((record, index) => (
              <tr
                key={`${record.email ?? record.mobile_without_country_code ?? index}`}
                className="border-t border-[var(--border-subtle)]"
              >
                <td className="px-6 py-4 font-medium whitespace-nowrap text-[var(--foreground)]">
                  {record.name || "—"}
                </td>

                <td
                  className="max-w-[220px] truncate px-6 py-4 text-[var(--muted-foreground)]"
                  title={record.email ?? ""}
                >
                  {record.email || "—"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-[var(--muted-foreground)]">
                  {formatContact(record)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-[var(--muted-foreground)]">
                  {formatDate(record.created_at)}
                </td>

                <td
                  className="max-w-[180px] truncate px-6 py-4 text-[var(--muted-foreground)]"
                  title={record.company ?? ""}
                >
                  {record.company || "—"}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge value={record.crm_status} />
                </td>

                <td
                  className="max-w-[320px] truncate px-6 py-4 text-[var(--muted-foreground)]"
                  title={record.crm_note ?? ""}
                >
                  {record.crm_note || "—"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-[var(--muted-foreground)]">
                  {record.data_source || "—"}
                </td>

                <td
                  className="max-w-[200px] truncate px-6 py-4 text-[var(--muted-foreground)]"
                  title={record.lead_owner ?? ""}
                >
                  {record.lead_owner || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}