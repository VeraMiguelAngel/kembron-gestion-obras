import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { createObra } from "@/lib/actions/obras";
import { linkBack } from "@/lib/ui";
import { ObraForm } from "../obra-form";

export default async function NuevaObraPage() {
  await requireAdmin();

  const supervisores = await prisma.usuario.findMany({
    where: { rol: "SUPERVISOR" },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true, email: true },
  });

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-8">
      <div className="w-full max-w-md">
        <Link href="/obras" className={linkBack}>
          ← Volver a Obras
        </Link>
      </div>
      <h1 className="text-2xl font-semibold">Nueva obra</h1>
      <ObraForm action={createObra} supervisores={supervisores} mode="create" />
    </div>
  );
}
