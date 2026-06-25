import Link from "next/link";

export default async function MiObraPage({
  params,
}: {
  params: Promise<{ obraId: string }>;
}) {
  const { obraId } = await params;

  return (
    <div className="flex flex-col gap-3">
      <Link
        href={`/mis-obras/${obraId}/avance`}
        className="flex items-center justify-center rounded-lg bg-red-600 px-4 py-4 text-base font-medium text-white transition-colors active:bg-red-700"
      >
        Cargar avance
      </Link>
      <Link
        href={`/mis-obras/${obraId}/gastos`}
        className="flex items-center justify-center rounded-lg border border-zinc-300 px-4 py-4 text-base font-medium text-zinc-700 transition-colors active:bg-zinc-50"
      >
        Registrar gasto
      </Link>
    </div>
  );
}
