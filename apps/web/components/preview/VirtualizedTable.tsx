"use client";

import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface VirtualizedTableProps {
  headers: string[];
  rows: Record<string, string>[];
  title: string;
  subtitle?: string;
  maxHeight?: number;
}

export function VirtualizedTable({
  headers,
  rows,
  title,
  subtitle,
  maxHeight = 480,
}: VirtualizedTableProps) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 8,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  const columnTemplate = useMemo(
    () => `repeat(${headers.length}, minmax(180px, 1fr))`,
    [headers.length],
  );

  return (
    <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
        {subtitle ? (
          <p className="text-sm text-[var(--muted-foreground)]">{subtitle}</p>
        ) : null}
      </div>

      <div className="overflow-auto rounded-2xl border border-[var(--border)]">
        <div
          className="min-w-max"
          style={{ minWidth: Math.max(headers.length * 180, 900) }}
        >
          <div
            className="sticky top-0 z-20 grid border-b border-[var(--border)] bg-[var(--surface-2)]"
            style={{ gridTemplateColumns: columnTemplate }}
          >
            {headers.map((header) => (
              <div
                key={header}
                className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap text-[var(--foreground)]"
              >
                {header}
              </div>
            ))}
          </div>

          <div
            ref={parentRef}
            className="overflow-auto"
            style={{ height: maxHeight }}
          >
            <div
              className="relative"
              style={{ height: rowVirtualizer.getTotalSize() }}
            >
              {virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index];

                return (
                  <div
                    key={virtualRow.key}
                    className="absolute left-0 top-0 grid w-full border-b border-[var(--border-subtle)] bg-[var(--surface)]"
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                      gridTemplateColumns: columnTemplate,
                      height: virtualRow.size,
                    }}
                  >
                    {headers.map((header) => (
                      <div
                        key={`${virtualRow.index}-${header}`}
                        className="truncate px-4 py-3 text-sm text-[var(--muted-foreground)]"
                        title={row?.[header] ?? ""}
                      >
                        {row?.[header] || "—"}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}