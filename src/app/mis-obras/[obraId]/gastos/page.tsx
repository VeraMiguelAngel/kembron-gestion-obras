import { requireObraAccess } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { createGasto } from "@/lib/actions/gastos";
import { GastoForm } from "@/app/obras/[id]/presupuesto/gastos/gasto-form";

export default async function CargarGastoPage({
  params,
}: {
  params: Promise<{ obraId: string }>;
}) {
  const { obraId } = await params;
  await requireObraAccess(obraId);

  const items = await prisma.item.findMany({
    where: { titulo: { obraId } },
    orderBy: [{ titulo: { orden: "asc" } }, { orden: "asc" }],
    include: { titulo: { select: { nombre: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Registrar gasto</h2>
      <GastoForm
        action={createGasto.bind(null, obraId)}
        items={items.map((item) => ({
          id: item.id,
          nombre: item.nombre,
          tituloNombre: item.titulo.nombre,
        }))}
      />
    </div>
  );
}
