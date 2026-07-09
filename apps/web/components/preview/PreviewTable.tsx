import type { ParsedCsvPreview } from "../../lib/type";
import { VirtualizedTable } from "./VirtualizedTable";

interface PreviewTableProps {
  preview: ParsedCsvPreview;
  title?: string;
}

export function PreviewTable({
  preview,
  title = "Uploaded CSV Preview",
}: PreviewTableProps) {
  if (preview.rows.length > 12) {
    return (
      <VirtualizedTable
        headers={preview.headers}
        rows={preview.rows}
        title={title}
        subtitle={`Showing ${preview.rows.length} of ${preview.totalRows} rows`}
      />
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          Showing {preview.rows.length} of {preview.totalRows} rows
        </p>
      </div>

      <div className="max-h-[420px] overflow-auto rounded-2xl border border-[var(--border)]">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-10 bg-[var(--surface-2)]">
            <tr>
              {preview.headers.map((header) => (
                <th
                  key={header}
                  className="border-b border-[var(--border)] px-4 py-3 text-left font-medium whitespace-nowrap text-[var(--foreground)]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row, rowIndex) => (
              <tr key={`${rowIndex}-${Object.values(row).join("-")}`}>
                {preview.headers.map((header) => (
                  <td
                    key={`${rowIndex}-${header}`}
                    className="max-w-[240px] border-b border-[var(--border-subtle)] px-4 py-3 align-top text-[var(--muted-foreground)]"
                  >
                    <div className="truncate" title={row[header] ?? ""}>
                      {row[header] || "—"}
                    </div>
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