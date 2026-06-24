import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { porcentajeAvanceObra } from "@/lib/avance";
import { presupuestoRealObra, ejecutadoObra } from "@/lib/presupuesto";
import { ObraCard } from "./obra-card";

export default async function ObrasPage() {
  await requireAdmin();

  const obras = await prisma.obra.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      asignaciones: { include: { usuario: { select: { nombre: true } } } },
      titulos: {
        include: {
          items: {
            select: {
              cantidad: true,
              valorUnitario: true,
              adicionalesDeductivos: { select: { tipo: true, monto: true } },
              gastos: { select: { monto: true } },
              registrosAvance: { select: { cantidad: true } },
            },
          },
        },
      },
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Obras</h1>
        <Link
          href="/obras/nueva"
          className="rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
        >
          Nueva obra
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {obras.map((obra) => {
          const porcentajeAvanceFisico = porcentajeAvanceObra(obra.titulos);
          const presupuestoReal = presupuestoRealObra(obra.titulos);
          const ejecutado = ejecutadoObra(obra.titulos);
          const porcentajeAvanceEconomico = presupuestoReal.isZero()
            ? 0
            : Number(ejecutado.dividedBy(presupuestoReal).times(100));
          return (
            <ObraCard
              key={obra.id}
              obra={obra}
              avanceFisico={Number(porcentajeAvanceFisico)}
              avanceEconomico={porcentajeAvanceEconomico}
            />
          );
        })}
      </div>
    </div>
  );
}
