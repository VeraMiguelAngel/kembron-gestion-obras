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
      <div className="flex justify-between text-xs text-zinc-600">
        <span>{label}</span>
        <span>
          Presupuestado: {formatNumero(presupuestado)} — Ejecutado:{" "}
          {formatNumero(ejecutado)}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-100">
        <div
          className="h-2 rounded-full bg-zinc-400"
          style={{ width: `${pctPresupuestado}%` }}
        />
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-100">
        <div
          className="h-2 rounded-full bg-black"
          style={{ width: `${pctEjecutado}%` }}
        />
      </div>
    </div>
  );
}
