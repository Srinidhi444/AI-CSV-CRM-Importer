import type { SkippedRecord } from "../../lib/type";

interface SkippedTableProps {
  records: SkippedRecord[];
}

export function SkippedTable({ records }: SkippedTableProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Skipped Records</h3>
        <p className="text-sm text-slate-500">
          {records.length} records were skipped
        </p>
      </div>

      <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-200">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              <th className="border-b border-slate-200 px-4 py-3 text-left font-medium whitespace-nowrap text-slate-700">
                Row Index
              </th>
              <th className="border-b border-slate-200 px-4 py-3 text-left font-medium whitespace-nowrap text-slate-700">
                Reason
              </th>
              <th className="border-b border-slate-200 px-4 py-3 text-left font-medium whitespace-nowrap text-slate-700">
                Raw Data
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={`${record.rowIndex}-${record.reason}`}>
                <td className="border-b border-slate-100 px-4 py-3 align-top text-slate-600">
                  {record.rowIndex}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 align-top text-slate-600">
                  {record.reason}
                </td>
                <td className="max-w-[420px] border-b border-slate-100 px-4 py-3 align-top text-slate-600">
                  <pre className="overflow-auto whitespace-pre-wrap break-words text-xs">
                    {JSON.stringify(record.rawData, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}