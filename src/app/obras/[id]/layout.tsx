import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { linkBack } from "@/lib/ui";
import { TabNav } from "./tab-nav";

export default async function ObraDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const obra = await prisma.obra.findUnique({
    where: { id },
    select: { id: true, nombre: true },
  });

  if (!obra) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex flex-col gap-2">
        <Link href="/obras" className={linkBack}>
          ← Volver a obras
        </Link>
        <h1 className="text-2xl font-semibold">{obra.nombre}</h1>
      </div>
      <TabNav obraId={obra.id} />
      {children}
    </div>
  );
}
