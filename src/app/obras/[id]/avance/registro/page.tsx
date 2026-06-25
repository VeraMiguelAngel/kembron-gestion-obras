import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formatNumero } from "@/lib/presupuesto";
import {
  cantidadAvanzadaItem,
  porcentajeAvanceItem,
  porcentajeAvanceObra,
  porcentajeAvancePromedio,
} from "@/lib/avance";
import { deleteRegistroAvance } from "@/lib/actions/avance";
import { DeleteRegistroAvanceForm } from "./delete-registro-avance-form";

export default async function RegistroAvancePage({
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
          registrosAvance: {
            orderBy: { fecha: "desc" },
            include: { usuario: { select: { nombre: true } } },
          },
        },
      },
    },
  });

  const porcentajeObra = porcentajeAvanceObra(titulos);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Registro de avance</h2>
        <Link
          href={`/obras/${obraId}/avance/registro/nuevo`}
          className="rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
        >
          Nuevo registro
        </Link>
      </div>

      <p className="text-lg font-semibold text-zinc-900">
        Avance físico de la obra: {formatNumero(porcentajeObra)}%
      </p>

      {titulos.length === 0 && (
        <p className="text-sm text-zinc-500">
          Todavía no hay títulos ni ítems en esta obra. Creálos primero en la
          pestaña &quot;Presupuesto&quot;.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {titulos.map((titulo) => {
          const porcentajeTitulo = porcentajeAvancePromedio(
            titulo.items.map((item) => porcentajeAvanceItem(item))
          );
          return (
            <details
              key={titulo.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <summary className="cursor-pointer font-semibold text-zinc-900">
                {titulo.orden}. {titulo.nombre} —{" "}
                {formatNumero(porcentajeTitulo)}%
              </summary>

              <div className="mt-3 flex flex-col gap-2 pl-4">
                {titulo.items.length === 0 && (
                  <p className="text-sm text-zinc-500">
                    Este título todavía no tiene ítems.
                  </p>
                )}
                {titulo.items.map((item) => {
                  const porcentajeItem = porcentajeAvanceItem(item);
                  const avanzado = cantidadAvanzadaItem(item);
                  return (
                    <details
                      key={item.id}
                      className="rounded-md border border-zinc-200 p-3"
                    >
                      <summary className="cursor-pointer text-sm text-zinc-700">
                        {item.nombre} — {formatNumero(porcentajeItem)}% (
                        {formatNumero(avanzado)} / {formatNumero(item.cantidad)}{" "}
                        {item.unidad.nombre})
                      </summary>

                      <div className="mt-2">
                        {item.registrosAvance.length === 0 ? (
                          <p className="text-sm text-zinc-500">
                            Sin registros de avance todavía.
                          </p>
                        ) : (
                          <div className="overflow-hidden rounded-md border border-zinc-200">
                            <table className="w-full text-left text-sm">
                              <thead>
                                <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                  <th className="px-3 py-2">Fecha</th>
                                  <th className="px-3 py-2">Cantidad</th>
                                  <th className="px-3 py-2">Usuario</th>
                                  <th className="px-3 py-2">Acciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.registrosAvance.map((registro) => (
                                  <tr
                                    key={registro.id}
                                    className="border-b border-zinc-100 transition-colors last:border-b-0 hover:bg-zinc-50"
                                  >
                                    <td className="px-3 py-2 text-zinc-600">
                                      {registro.fecha.toLocaleDateString("es-AR", {
                                        timeZone: "UTC",
                                      })}
                                    </td>
                                    <td className="px-3 py-2 text-zinc-900">
                                      {formatNumero(registro.cantidad)}
                                    </td>
                                    <td className="px-3 py-2 text-zinc-600">
                                      {registro.usuario.nombre}
                                    </td>
                                    <td className="px-3 py-2">
                                      <div className="flex gap-3">
                                        <Link
                                          href={`/obras/${obraId}/avance/registro/${registro.id}/editar`}
                                          className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
                                        >
                                          Editar
                                        </Link>
                                        <DeleteRegistroAvanceForm
                                          action={deleteRegistroAvance.bind(
                                            null,
                                            registro.id,
                                            obraId
                                          )}
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
                    </details>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
