import { notFound } from "next/navigation";
import Link from "next/link";
import { requireObraAccess } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { linkBack } from "@/lib/ui";

export default async function MiObraLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ obraId: string }>;
}) {
  const { obraId } = await params;
  await requireObraAccess(obraId);

  const obra = await prisma.obra.findUnique({
    where: { id: obraId },
    select: { id: true, nombre: true, ubicacion: true },
  });

  if (!obra) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-4">
      <Link href="/dashboard" className={linkBack}>
        ← Mis obras
      </Link>
      <div>
        <h1 className="text-xl font-semibold">{obra.nombre}</h1>
        <p className="text-sm text-zinc-600">{obra.ubicacion}</p>
      </div>
      {children}
    </div>
  );
}
