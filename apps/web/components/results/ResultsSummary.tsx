import type { ProcessCsvResponse } from "../../lib/type";

interface ResultsSummaryProps {
  result: ProcessCsvResponse;
}

const cards = [
  { key: "totalRows", label: "Total rows" },
  { key: "totalImported", label: "Imported" },
  { key: "totalSkipped", label: "Skipped" },
] as const;

export function ResultsSummary({ result }: ResultsSummaryProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
        >
          <p className="text-xs font-medium tracking-wide text-[var(--muted-foreground)] uppercase">
            {card.label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {result[card.key]}
          </p>
        </div>
      ))}
    </section>
  );
}