import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { updateRegistroAvance } from "@/lib/actions/avance";
import { linkBack } from "@/lib/ui";
import { RegistroAvanceForm } from "../../registro-avance-form";

function toDateInputValue(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

export default async function EditarRegistroAvancePage({
  params,
}: {
  params: Promise<{ id: string; registroId: string }>;
}) {
  await requireAdmin();
  const { id: obraId, registroId } = await params;

  const [registro, items] = await Promise.all([
    prisma.registroAvance.findUnique({
      where: { id: registroId },
      include: { item: { include: { titulo: { select: { obraId: true } } } } },
    }),
    prisma.item.findMany({
      where: { titulo: { obraId } },
      orderBy: [{ titulo: { orden: "asc" } }, { orden: "asc" }],
      include: { titulo: { select: { nombre: true } } },
    }),
  ]);

  if (!registro || registro.item.titulo.obraId !== obraId) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="w-full max-w-sm">
        <Link href={`/obras/${obraId}/avance/registro`} className={linkBack}>
          ← Volver a Registro de avance
        </Link>
      </div>
      <h2 className="text-xl font-semibold">Editar registro de avance</h2>
      <RegistroAvanceForm
        action={updateRegistroAvance.bind(null, registro.id, obraId)}
        items={items.map((item) => ({
          id: item.id,
          nombre: item.nombre,
          tituloNombre: item.titulo.nombre,
        }))}
        initialValues={{
          cantidad: registro.cantidad.toString(),
          fecha: toDateInputValue(registro.fecha),
          itemId: registro.itemId,
        }}
      />
    </div>
  );
}
