export function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 text-xs text-zinc-600">
      <span className="w-28 shrink-0 truncate" title={label}>{label}</span>
      <div className="h-2 flex-1 rounded-full bg-zinc-200">
        <div className="h-2 rounded-full bg-black" style={{ width: `${value}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right">{value}%</span>
    </div>
  );
}
