interface StatusBadgeProps {
  value: string | null;
}

const config: Record<string, { bg: string; fg: string; label: string }> = {
  GOOD_LEAD_FOLLOW_UP: { bg: "var(--status-good-bg)", fg: "var(--status-good-fg)", label: "Good Lead" },
  DID_NOT_CONNECT: { bg: "var(--status-neutral-bg)", fg: "var(--status-neutral-fg)", label: "Not Connected" },
  BAD_LEAD: { bg: "var(--status-bad-bg)", fg: "var(--status-bad-fg)", label: "Bad Lead" },
  SALE_DONE: { bg: "var(--status-info-bg)", fg: "var(--status-info-fg)", label: "Sale Done" },
};

export function StatusBadge({ value }: StatusBadgeProps) {
  if (!value || !config[value]) {
    return <span className="text-sm text-[var(--muted-foreground)]">—</span>;
  }

  const { bg, fg, label } = config[value];

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: bg, color: fg }}
    >
      {label}
    </span>
  );
}