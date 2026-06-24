import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { CategoriaGasto } from "@/generated/prisma/client";
import { formatNumero } from "@/lib/presupuesto";
import { deleteGasto } from "@/lib/actions/gastos";
import { DeleteGastoForm } from "./delete-gasto-form";
import { CategoriaFilter } from "./categoria-filter";

const CATEGORIA_LABEL: Record<string, string> = {
  MANO_DE_OBRA: "Mano de obra",
  MATERIAL: "Material",
  EQUIPO: "Equipo",
  SUBCONTRATO: "Subcontrato",
  OTROS: "Otros",
};

export default async function GastosPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ categoria?: string }>;
}) {
  await requireAdmin();
  const { id: obraId } = await params;
  const { categoria } = await searchParams;

  const categoriaValida =
    categoria && categoria in CategoriaGasto ? (categoria as CategoriaGasto) : undefined;

  const gastos = await prisma.gasto.findMany({
    where: {
      item: { titulo: { obraId } },
      ...(categoriaValida ? { categoria: categoriaValida } : {}),
    },
    orderBy: { fecha: "desc" },
    include: {
      item: { include: { titulo: { select: { nombre: true } } } },
      usuario: { select: { nombre: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Gastos</h2>
        <Link
          href={`/obras/${obraId}/presupuesto/gastos/nuevo`}
          className="rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
        >
          Nuevo gasto
        </Link>
      </div>

      <CategoriaFilter />

      {gastos.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Todavía no hay gastos registrados{categoriaValida ? " para esta categoría" : ""}.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Ítem</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Registrado por</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {gastos.map((gasto) => (
                <tr
                  key={gasto.id}
                  className="border-b border-zinc-100 transition-colors last:border-b-0 hover:bg-zinc-50"
                >
                  <td className="px-4 py-3 text-zinc-600">
                    {gasto.fecha.toLocaleDateString("es-AR", { timeZone: "UTC" })}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {gasto.descripcion}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                      {CATEGORIA_LABEL[gasto.categoria]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {gasto.item.titulo.nombre} → {gasto.item.nombre}
                  </td>
                  <td className="px-4 py-3 text-zinc-900">{formatNumero(gasto.monto)}</td>
                  <td className="px-4 py-3 text-zinc-600">{gasto.usuario.nombre}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link
                        href={`/obras/${obraId}/presupuesto/gastos/${gasto.id}/editar`}
                        className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
                      >
                        Editar
                      </Link>
                      <DeleteGastoForm
                        action={deleteGasto.bind(null, gasto.id, obraId)}
                        descripcion={gasto.descripcion}
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
