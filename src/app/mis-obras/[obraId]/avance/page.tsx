import { requireObraAccess } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { createRegistroAvance } from "@/lib/actions/avance";
import { RegistroAvanceForm } from "@/app/obras/[id]/avance/registro/registro-avance-form";

export default async function CargarAvancePage({
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
      <h2 className="text-lg font-semibold">Cargar avance</h2>
      <RegistroAvanceForm
        action={createRegistroAvance.bind(null, obraId)}
        items={items.map((item) => ({
          id: item.id,
          nombre: item.nombre,
          tituloNombre: item.titulo.nombre,
        }))}
      />
    </div>
  );
}
