interface ProgressBarProps {
  label?: string;
}

export function ProgressBar({ label = "Processing CSV with AI..." }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-slate-900" />
      </div>
    </div>
  );
}