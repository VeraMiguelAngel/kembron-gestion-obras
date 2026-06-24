import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { updateItem } from "@/lib/actions/items";
import { linkBack } from "@/lib/ui";
import { ItemForm } from "../../../item-form";

export default async function EditarItemPage({
  params,
}: {
  params: Promise<{ id: string; tituloId: string; itemId: string }>;
}) {
  await requireAdmin();
  const { id: obraId, tituloId, itemId } = await params;

  const [item, unidades] = await Promise.all([
    prisma.item.findUnique({ where: { id: itemId } }),
    prisma.unidad.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  if (!item || item.tituloId !== tituloId) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="w-full max-w-sm">
        <Link href={`/obras/${obraId}/presupuesto/titulos-items`} className={linkBack}>
          ← Volver a Títulos e ítems
        </Link>
      </div>
      <h2 className="text-xl font-semibold">Editar ítem</h2>
      <ItemForm
        action={updateItem.bind(null, item.id, obraId)}
        unidades={unidades}
        initialValues={{
          nombre: item.nombre,
          cantidad: item.cantidad.toString(),
          unidadId: item.unidadId,
          valorUnitario: item.valorUnitario.toString(),
          orden: String(item.orden),
        }}
      />
    </div>
  );
}
