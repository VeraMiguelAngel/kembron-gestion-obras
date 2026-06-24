import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  presupuestoItem,
  presupuestoRealItem,
  presupuestoTitulo,
  presupuestoRealTitulo,
  presupuestoRealObra,
  ejecutadoItem,
  ejecutadoTitulo,
  ejecutadoObra,
  formatNumero,
} from "@/lib/presupuesto";
import { deleteTitulo } from "@/lib/actions/titulos";
import { deleteItem } from "@/lib/actions/items";
import { DeleteTituloForm } from "./delete-titulo-form";
import { DeleteItemForm } from "./delete-item-form";

export default async function TitulosItemsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id: obraId } = await params;

  const titulos = await prisma.titulo.findMany({
    where: { obraId },
    orderBy: { orden: "asc" },
    include: {
      items: {
        orderBy: { orden: "asc" },
        include: {
          unidad: { select: { nombre: true } },
          adicionalesDeductivos: { select: { tipo: true, monto: true } },
          gastos: { select: { monto: true } },
        },
      },
    },
  });

  const totalTeorico = titulos.reduce(
    (acumulado, titulo) => acumulado.plus(presupuestoTitulo(titulo.items)),
    new Prisma.Decimal(0)
  );
  const totalReal = presupuestoRealObra(titulos);
  const totalEjecutado = ejecutadoObra(titulos);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Títulos e ítems</h2>
        <div className="text-right">
          <p className="text-sm text-zinc-600">
            Teórico: {formatNumero(totalTeorico)}
          </p>
          <p className="text-lg font-semibold">
            Real: {formatNumero(totalReal)}
          </p>
          <p className="text-sm text-zinc-600">
            Ejecutado: {formatNumero(totalEjecutado)}
          </p>
        </div>
      </div>

      <Link
        href={`/obras/${obraId}/presupuesto/titulos/nuevo`}
        className="self-start rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
      >
        Nuevo título
      </Link>

      {titulos.length === 0 && (
        <p className="text-sm text-zinc-500">
          Todavía no hay títulos en esta obra.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {titulos.map((titulo) => {
          const subtotalTeorico = presupuestoTitulo(titulo.items);
          const subtotalReal = presupuestoRealTitulo(titulo.items);
          const subtotalEjecutado = ejecutadoTitulo(titulo.items);
          return (
            <div
              key={titulo.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {titulo.orden}. {titulo.nombre}
                </h3>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">
                    Teórico: {formatNumero(subtotalTeorico)}
                  </p>
                  <p className="font-medium">
                    Real: {formatNumero(subtotalReal)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Ejecutado: {formatNumero(subtotalEjecutado)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3 text-sm">
                <Link
                  href={`/obras/${obraId}/presupuesto/titulos/${titulo.id}/editar`}
                  className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
                >
                  Editar título
                </Link>
                <DeleteTituloForm
                  action={deleteTitulo.bind(null, titulo.id, obraId)}
                  nombre={titulo.nombre}
                />
                <Link
                  href={`/obras/${obraId}/presupuesto/titulos/${titulo.id}/items/nuevo`}
                  className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
                >
                  + Ítem
                </Link>
              </div>

              {titulo.items.length > 0 && (
                <div className="mt-3 overflow-hidden rounded-md border border-zinc-200">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        <th className="px-3 py-2">Ítem</th>
                        <th className="px-3 py-2">Cantidad</th>
                        <th className="px-3 py-2">Unidad</th>
                        <th className="px-3 py-2">Valor unitario</th>
                        <th className="px-3 py-2">Presupuesto teórico</th>
                        <th className="px-3 py-2">Presupuesto real</th>
                        <th className="px-3 py-2">Ejecutado</th>
                        <th className="px-3 py-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {titulo.items.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-zinc-100 transition-colors last:border-b-0 hover:bg-zinc-50"
                        >
                          <td className="px-3 py-2 font-medium text-zinc-900">
                            {item.nombre}
                          </td>
                          <td className="px-3 py-2 text-zinc-600">{formatNumero(item.cantidad)}</td>
                          <td className="px-3 py-2 text-zinc-600">{item.unidad.nombre}</td>
                          <td className="px-3 py-2 text-zinc-600">{formatNumero(item.valorUnitario)}</td>
                          <td className="px-3 py-2 text-zinc-600">{formatNumero(presupuestoItem(item))}</td>
                          <td className="px-3 py-2 text-zinc-600">{formatNumero(presupuestoRealItem(item))}</td>
                          <td className="px-3 py-2 text-zinc-600">{formatNumero(ejecutadoItem(item))}</td>
                          <td className="px-3 py-2">
                            <div className="flex gap-3">
                              <Link
                                href={`/obras/${obraId}/presupuesto/titulos/${titulo.id}/items/${item.id}/editar`}
                                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
                              >
                                Editar
                              </Link>
                              <DeleteItemForm
                                action={deleteItem.bind(null, item.id, obraId)}
                                nombre={item.nombre}
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
        })}
      </div>
    </div>
  );
}
