export function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-zinc-600">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-200">
        <div className="h-2 rounded-full bg-black" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
