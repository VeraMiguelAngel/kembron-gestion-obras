import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { createAdicionalDeductivo } from "@/lib/actions/adicionales-deductivos";
import { linkBack } from "@/lib/ui";
import { AdicionalDeductivoForm } from "../adicional-deductivo-form";

export default async function NuevoAdicionalDeductivoPage({
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
        <Link href={`/obras/${obraId}/presupuesto/adicionales-deductivos`} className={linkBack}>
          ← Volver a Adicionales y deductivos
        </Link>
      </div>
      <h2 className="text-xl font-semibold">Nuevo adicional/deductivo</h2>
      <AdicionalDeductivoForm
        action={createAdicionalDeductivo.bind(null, obraId)}
        items={items.map((item) => ({
          id: item.id,
          nombre: item.nombre,
          tituloNombre: item.titulo.nombre,
        }))}
      />
    </div>
  );
}
