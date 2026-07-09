interface StatusBadgeProps {
  value: string | null;
}

const styles: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  DID_NOT_CONNECT:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  BAD_LEAD:
    "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  SALE_DONE:
    "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
};

export function StatusBadge({ value }: StatusBadgeProps) {
  if (!value) {
    return <span className="text-sm text-[var(--muted-foreground)]">—</span>;
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[value] ?? "bg-slate-100 text-slate-700"}`}
    >
      {value}
    </span>
  );
}