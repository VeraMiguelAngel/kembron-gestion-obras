import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { createTitulo } from "@/lib/actions/titulos";
import { linkBack } from "@/lib/ui";
import { TituloForm } from "../titulo-form";

export default async function NuevoTituloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id: obraId } = await params;

  const siguienteOrden = (await prisma.titulo.count({ where: { obraId } })) + 1;

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="w-full max-w-sm">
        <Link href={`/obras/${obraId}/presupuesto/titulos-items`} className={linkBack}>
          ← Volver a Títulos e ítems
        </Link>
      </div>
      <h2 className="text-xl font-semibold">Nuevo título</h2>
      <TituloForm
        action={createTitulo.bind(null, obraId)}
        initialValues={{ orden: String(siguienteOrden) }}
      />
    </div>
  );
}
