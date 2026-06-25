import { Fragment } from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formatNumero } from "@/lib/presupuesto";
import { calcularSemanasObra, formatRangoSemana } from "@/lib/programacion";
import { setProgramacionSemanal } from "@/lib/actions/programacion";
import { ProgramacionCell } from "./programacion-cell";

export default async function ProgramacionSemanalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id: obraId } = await params;

  const obra = await prisma.obra.findUnique({
    where: { id: obraId },
    select: { fechaInicio: true, fechaFinTeorica: true },
  });

  if (!obra) {
    notFound();
  }

  const semanas = calcularSemanasObra(obra.fechaInicio, obra.fechaFinTeorica);

  const titulos = await prisma.titulo.findMany({
    where: { obraId },
    orderBy: { orden: "asc" },
    include: {
      items: {
        orderBy: { orden: "asc" },
        include: {
          unidad: { select: { nombre: true } },
          programaciones: {
            select: { numeroSemana: true, cantidadProgramada: true },
          },
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Programación semanal</h2>

      {titulos.length === 0 && (
        <p className="text-sm text-zinc-500">
          Todavía no hay títulos ni ítems en esta obra. Creálos primero en la
          pestaña &quot;Presupuesto&quot;.
        </p>
      )}

      {titulos.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="sticky left-0 z-10 bg-zinc-50 px-3 py-2 pr-4">Ítem</th>
                <th className="px-3 py-2 pr-4">Cantidad</th>
                <th className="px-3 py-2 pr-4">Unidad</th>
                {semanas.map((semana) => (
                  <th key={semana.numero} className="px-2 py-2 text-center">
                    Semana {semana.numero}
                    <br />
                    <span className="text-[10px] font-normal normal-case text-zinc-400">
                      {formatRangoSemana(semana)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {titulos.map((titulo) => (
                <Fragment key={titulo.id}>
                  <tr className="bg-zinc-50">
                    <td
                      colSpan={3 + semanas.length}
                      className="sticky left-0 bg-zinc-50 px-3 py-2 font-semibold text-zinc-700"
                    >
                      {titulo.orden}. {titulo.nombre}
                    </td>
                  </tr>
                  {titulo.items.map((item) => {
                    const programadoPorSemana = new Map(
                      item.programaciones.map((p) => [
                        p.numeroSemana,
                        p.cantidadProgramada.toString(),
                      ])
                    );
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-zinc-100 transition-colors last:border-b-0 hover:bg-zinc-50"
                      >
                        <td className="sticky left-0 z-10 bg-white px-3 py-2 pr-4 font-medium text-zinc-900">
                          {item.nombre}
                        </td>
                        <td className="px-3 py-2 pr-4 text-zinc-600">{formatNumero(item.cantidad)}</td>
                        <td className="px-3 py-2 pr-4 text-zinc-600">{item.unidad.nombre}</td>
                        {semanas.map((semana) => (
                          <td key={semana.numero} className="px-1.5 py-1.5">
                            <ProgramacionCell
                              action={setProgramacionSemanal.bind(
                                null,
                                item.id,
                                semana.numero,
                                obraId
                              )}
                              initialValue={
                                programadoPorSemana.get(semana.numero) ?? "0"
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  {titulo.items.length === 0 && (
                    <tr>
                      <td
                        colSpan={3 + semanas.length}
                        className="px-3 py-2 text-sm text-zinc-500"
                      >
                        Este título todavía no tiene ítems.
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
