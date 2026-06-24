import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { createItem } from "@/lib/actions/items";
import { linkBack } from "@/lib/ui";
import { ItemForm } from "../../item-form";

export default async function NuevoItemPage({
  params,
}: {
  params: Promise<{ id: string; tituloId: string }>;
}) {
  await requireAdmin();
  const { id: obraId, tituloId } = await params;

  const [unidades, siguienteOrden] = await Promise.all([
    prisma.unidad.findMany({ orderBy: { nombre: "asc" } }),
    prisma.item.count({ where: { tituloId } }).then((n) => n + 1),
  ]);

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="w-full max-w-sm">
        <Link href={`/obras/${obraId}/presupuesto/titulos-items`} className={linkBack}>
          ← Volver a Títulos e ítems
        </Link>
      </div>
      <h2 className="text-xl font-semibold">Nuevo ítem</h2>
      <ItemForm
        action={createItem.bind(null, tituloId, obraId)}
        unidades={unidades}
        initialValues={{ orden: String(siguienteOrden) }}
      />
    </div>
  );
}
