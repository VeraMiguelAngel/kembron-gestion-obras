import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { updateObra } from "@/lib/actions/obras";
import { ObraForm } from "../obra-form";

function toDateInputValue(fecha: Date) {
  return fecha.toISOString().slice(0, 10);
}

export default async function ObraDatosGeneralesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [obra, supervisores] = await Promise.all([
    prisma.obra.findUnique({
      where: { id },
      include: { asignaciones: { select: { usuarioId: true } } },
    }),
    prisma.usuario.findMany({
      where: { rol: "SUPERVISOR" },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true, email: true },
    }),
  ]);

  if (!obra) {
    notFound();
  }

  return (
    <ObraForm
      action={updateObra.bind(null, obra.id)}
      supervisores={supervisores}
      mode="edit"
      initialValues={{
        nombre: obra.nombre,
        ubicacion: obra.ubicacion,
        cliente: obra.cliente,
        estado: obra.estado,
        fechaInicio: toDateInputValue(obra.fechaInicio),
        fechaFinTeorica: toDateInputValue(obra.fechaFinTeorica),
        supervisorIds: obra.asignaciones.map((a) => a.usuarioId),
      }}
    />
  );
}
