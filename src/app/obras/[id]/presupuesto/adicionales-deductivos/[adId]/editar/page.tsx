import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { updateAdicionalDeductivo } from "@/lib/actions/adicionales-deductivos";
import { linkBack } from "@/lib/ui";
import { AdicionalDeductivoForm } from "../../adicional-deductivo-form";

export default async function EditarAdicionalDeductivoPage({
  params,
}: {
  params: Promise<{ id: string; adId: string }>;
}) {
  await requireAdmin();
  const { id: obraId, adId } = await params;

  const [registro, items] = await Promise.all([
    prisma.adicionalDeductivo.findUnique({
      where: { id: adId },
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
        <Link href={`/obras/${obraId}/presupuesto/adicionales-deductivos`} className={linkBack}>
          ← Volver a Adicionales y deductivos
        </Link>
      </div>
      <h2 className="text-xl font-semibold">Editar adicional/deductivo</h2>
      <AdicionalDeductivoForm
        action={updateAdicionalDeductivo.bind(null, registro.id, obraId)}
        items={items.map((item) => ({
          id: item.id,
          nombre: item.nombre,
          tituloNombre: item.titulo.nombre,
        }))}
        initialValues={{
          tipo: registro.tipo,
          nombre: registro.nombre,
          itemId: registro.itemId,
          monto: registro.monto.toString(),
        }}
      />
    </div>
  );
}
