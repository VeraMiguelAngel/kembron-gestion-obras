import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { updateGasto } from "@/lib/actions/gastos";
import { linkBack } from "@/lib/ui";
import { GastoForm } from "../../gasto-form";

function toDateInputValue(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

export default async function EditarGastoPage({
  params,
}: {
  params: Promise<{ id: string; gastoId: string }>;
}) {
  await requireAdmin();
  const { id: obraId, gastoId } = await params;

  const [gasto, items] = await Promise.all([
    prisma.gasto.findUnique({
      where: { id: gastoId },
      include: { item: { include: { titulo: { select: { obraId: true } } } } },
    }),
    prisma.item.findMany({
      where: { titulo: { obraId } },
      orderBy: [{ titulo: { orden: "asc" } }, { orden: "asc" }],
      include: { titulo: { select: { nombre: true } } },
    }),
  ]);

  if (!gasto || gasto.item.titulo.obraId !== obraId) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="w-full max-w-sm">
        <Link href={`/obras/${obraId}/presupuesto/gastos`} className={linkBack}>
          ← Volver a Gastos
        </Link>
      </div>
      <h2 className="text-xl font-semibold">Editar gasto</h2>
      <GastoForm
        action={updateGasto.bind(null, gasto.id, obraId)}
        items={items.map((item) => ({
          id: item.id,
          nombre: item.nombre,
          tituloNombre: item.titulo.nombre,
        }))}
        initialValues={{
          descripcion: gasto.descripcion,
          categoria: gasto.categoria,
          fecha: toDateInputValue(gasto.fecha),
          monto: gasto.monto.toString(),
          itemId: gasto.itemId,
        }}
      />
    </div>
  );
}
