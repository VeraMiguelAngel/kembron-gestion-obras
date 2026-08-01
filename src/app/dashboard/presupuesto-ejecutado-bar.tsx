import { formatNumero } from "@/lib/presupuesto";
import { Prisma } from "@/generated/prisma/client";

export function PresupuestoEjecutadoBar({
  label,
  presupuestado,
  ejecutado,
  maximo,
}: {
  label: string;
  presupuestado: Prisma.Decimal;
  ejecutado: Prisma.Decimal;
  maximo: Prisma.Decimal;
}) {
  const pctPresupuestado = maximo.isZero()
    ? 0
    : Number(presupuestado.dividedBy(maximo).times(100));
  const pctEjecutado = maximo.isZero()
    ? 0
    : Number(ejecutado.dividedBy(maximo).times(100));

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-zinc-600">{label}</span>
      <div className="flex items-center gap-3 text-xs text-zinc-600">
        <span className="w-28 shrink-0 truncate" title="Presupuestado">
          Presupuestado
        </span>
        <div className="h-2 flex-1 rounded-full bg-zinc-100">
          <div
            className="h-2 rounded-full bg-zinc-400"
            style={{ width: `${pctPresupuestado}%` }}
          />
        </div>
        <span className="w-24 shrink-0 text-right">
          {formatNumero(presupuestado)}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-zinc-600">
        <span className="w-28 shrink-0 truncate" title="Ejecutado">
          Ejecutado
        </span>
        <div className="h-2 flex-1 rounded-full bg-zinc-100">
          <div
            className="h-2 rounded-full bg-black"
            style={{ width: `${pctEjecutado}%` }}
          />
        </div>
        <span className="w-24 shrink-0 text-right">
          {formatNumero(ejecutado)}
        </span>
      </div>
    </div>
  );
}
