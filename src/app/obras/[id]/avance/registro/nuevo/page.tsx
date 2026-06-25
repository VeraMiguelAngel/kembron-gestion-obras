import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { createRegistroAvance } from "@/lib/actions/avance";
import { linkBack } from "@/lib/ui";
import { RegistroAvanceForm } from "../registro-avance-form";

export default async function NuevoRegistroAvancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id: obraId } = await params;

  const items = await prisma.item.findMany({
    where: { titulo: { obraId } },
    orderBy: [{ titulo: { orden: "asc" } }, { orden: "asc" }],
    include: { titulo: { select: { nombre: true } } },
  });

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="w-full max-w-sm">
        <Link href={`/obras/${obraId}/avance/registro`} className={linkBack}>
          ← Volver a Registro de avance
        </Link>
      </div>
      <h2 className="text-xl font-semibold">Nuevo registro de avance</h2>
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
