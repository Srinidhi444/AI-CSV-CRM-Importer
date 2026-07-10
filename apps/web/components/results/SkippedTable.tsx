import type { SkippedRecord } from "../../lib/type";

interface SkippedTableProps {
  records: SkippedRecord[];
}

function stringifyRawData(rawData: Record<string, string>): string {
  return Object.entries(rawData)
    .map(([key, value]) => `${key}: ${value || "—"}`)
    .join(" | ");
}

export function SkippedTable({ records }: SkippedTableProps) {
  if (!records.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Skipped Records
          </h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            {records.length} record{records.length > 1 ? "s" : ""} skipped
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
              <th className="px-6 py-3">Row Index</th>
              <th className="px-6 py-3">Reason</th>
              <th className="px-6 py-3">Raw Data</th>
            </tr>
          </thead>

          <tbody>
            {records.map((record) => (
              <tr
                key={`${record.rowIndex}-${record.reason}`}
                className="border-t border-[var(--border-subtle)]"
              >
                <td className="px-6 py-4 align-top font-medium text-[var(--foreground)] whitespace-nowrap">
                  {record.rowIndex}
                </td>

                <td
                  className="max-w-[260px] px-6 py-4 align-top text-[var(--muted-foreground)]"
                  title={record.reason}
                >
                  {record.reason}
                </td>

                <td
                  className="max-w-[640px] px-6 py-4 align-top text-[var(--muted-foreground)]"
                  title={JSON.stringify(record.rawData, null, 2)}
                >
                  <div className="line-clamp-3 break-words leading-6">
                    {stringifyRawData(record.rawData)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}