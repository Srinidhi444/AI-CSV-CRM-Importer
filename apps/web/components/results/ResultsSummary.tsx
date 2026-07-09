import type { ProcessCsvResponse } from "../../lib/type";

interface ResultsSummaryProps {
  result: ProcessCsvResponse;
}

const cards = [
  {
    key: "totalRows",
    label: "Total rows",
    valueKey: "totalRows",
    className: "bg-[var(--surface)]",
  },
  {
    key: "totalImported",
    label: "Imported",
    valueKey: "totalImported",
    className: "bg-[var(--success-soft)]",
  },
  {
    key: "totalSkipped",
    label: "Skipped",
    valueKey: "totalSkipped",
    className: "bg-[var(--warning-soft)]",
  },
] as const;

export function ResultsSummary({ result }: ResultsSummaryProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.key}
          className={`rounded-3xl border border-[var(--border)] p-5 shadow-sm ${card.className}`}
        >
          <p className="text-sm text-[var(--muted-foreground)]">{card.label}</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
            {result[card.valueKey]}
          </p>
        </div>
      ))}
    </section>
  );
}