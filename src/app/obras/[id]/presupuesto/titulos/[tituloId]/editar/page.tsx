import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { updateTitulo } from "@/lib/actions/titulos";
import { linkBack } from "@/lib/ui";
import { TituloForm } from "../../titulo-form";

export default async function EditarTituloPage({
  params,
}: {
  params: Promise<{ id: string; tituloId: string }>;
}) {
  await requireAdmin();
  const { id: obraId, tituloId } = await params;

  const titulo = await prisma.titulo.findUnique({ where: { id: tituloId } });

  if (!titulo || titulo.obraId !== obraId) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="w-full max-w-sm">
        <Link href={`/obras/${obraId}/presupuesto/titulos-items`} className={linkBack}>
          ← Volver a Títulos e ítems
        </Link>
      </div>
      <h2 className="text-xl font-semibold">Editar título</h2>
      <TituloForm
        action={updateTitulo.bind(null, titulo.id, obraId)}
        initialValues={{ nombre: titulo.nombre, orden: String(titulo.orden) }}
      />
    </div>
  );
}
