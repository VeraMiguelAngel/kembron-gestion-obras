import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formatNumero } from "@/lib/presupuesto";
import { deleteAdicionalDeductivo } from "@/lib/actions/adicionales-deductivos";
import { DeleteAdicionalDeductivoForm } from "./delete-adicional-deductivo-form";

export default async function AdicionalesDeductivosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id: obraId } = await params;

  const registros = await prisma.adicionalDeductivo.findMany({
    where: { item: { titulo: { obraId } } },
    orderBy: { createdAt: "desc" },
    include: { item: { include: { titulo: { select: { nombre: true } } } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Adicionales y deductivos</h2>
        <Link
          href={`/obras/${obraId}/presupuesto/adicionales-deductivos/nuevo`}
          className="rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
        >
          Nuevo adicional/deductivo
        </Link>
      </div>

      {registros.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Todavía no hay adicionales ni deductivos registrados. Si necesitás
          un adicional para un ítem que no existe, primero creálo en la
          pestaña &quot;Títulos e ítems&quot;.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Ítem</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((registro) => (
                <tr
                  key={registro.id}
                  className="border-b border-zinc-100 transition-colors last:border-b-0 hover:bg-zinc-50"
                >
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        registro.tipo === "ADICIONAL"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {registro.tipo === "ADICIONAL" ? "Adicional" : "Deductivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {registro.nombre}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {registro.item.titulo.nombre} → {registro.item.nombre}
                  </td>
                  <td className="px-4 py-3 text-zinc-900">{formatNumero(registro.monto)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link
                        href={`/obras/${obraId}/presupuesto/adicionales-deductivos/${registro.id}/editar`}
                        className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
                      >
                        Editar
                      </Link>
                      <DeleteAdicionalDeductivoForm
                        action={deleteAdicionalDeductivo.bind(
                          null,
                          registro.id,
                          obraId
                        )}
                        nombre={registro.nombre}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
