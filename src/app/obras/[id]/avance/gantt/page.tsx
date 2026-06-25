import { Fragment } from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formatNumero } from "@/lib/presupuesto";
import { porcentajeAvanceItem, porcentajeAvancePromedio } from "@/lib/avance";
import {
  calcularSemanasObra,
  formatRangoSemana,
  semanaActual,
} from "@/lib/programacion";

export default async function GanttPage({
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
  const semanaHoy = semanaActual(semanas);
  const totalSemanas = semanas.length;

  const titulos = await prisma.titulo.findMany({
    where: { obraId },
    orderBy: { orden: "asc" },
    include: {
      items: {
        orderBy: { orden: "asc" },
        include: {
          registrosAvance: { select: { cantidad: true } },
          programaciones: { select: { numeroSemana: true } },
        },
      },
    },
  });

  const gridTemplateColumns = `220px repeat(${totalSemanas}, minmax(18px, 1fr))`;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Gantt de avance</h2>

      {titulos.length === 0 && (
        <p className="text-sm text-zinc-500">
          Todavía no hay títulos ni ítems en esta obra. Creálos primero en la
          pestaña &quot;Presupuesto&quot;.
        </p>
      )}

      {titulos.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div
            className="relative grid items-center"
            style={{ gridTemplateColumns }}
          >
            <div className="sticky left-0 z-10 bg-white py-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Título / Ítem
            </div>
            {semanas.map((semana) => (
              <div
                key={semana.numero}
                title={formatRangoSemana(semana)}
                className={`border-l border-zinc-100 py-1 text-center text-[10px] ${
                  semana.numero === semanaHoy
                    ? "font-semibold text-red-600"
                    : "text-zinc-400"
                }`}
              >
                S{semana.numero}
              </div>
            ))}

            {titulos.map((titulo) => {
              const porcentajeTitulo = porcentajeAvancePromedio(
                titulo.items.map((item) => porcentajeAvanceItem(item))
              );
              return (
                <Fragment key={titulo.id}>
                  <div
                    className="sticky left-0 bg-zinc-50 py-1 text-sm font-semibold"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    {titulo.orden}. {titulo.nombre} —{" "}
                    {formatNumero(porcentajeTitulo)}%
                  </div>

                  {titulo.items.map((item) => {
                    const porcentajeItem = porcentajeAvanceItem(item);
                    const semanasProgramadas = item.programaciones.map(
                      (p) => p.numeroSemana
                    );
                    const tieneProgramacion = semanasProgramadas.length > 0;
                    const primeraSemana = tieneProgramacion
                      ? Math.min(...semanasProgramadas)
                      : null;
                    const ultimaSemana = tieneProgramacion
                      ? Math.max(...semanasProgramadas)
                      : null;
                    const leftPct =
                      primeraSemana !== null
                        ? ((primeraSemana - 1) / totalSemanas) * 100
                        : 0;
                    const widthPct =
                      primeraSemana !== null && ultimaSemana !== null
                        ? ((ultimaSemana - primeraSemana + 1) / totalSemanas) *
                          100
                        : 0;

                    return (
                      <Fragment key={item.id}>
                        <div className="sticky left-0 bg-white py-1 pr-2 text-sm">
                          {item.nombre}{" "}
                          <span className="text-xs text-zinc-400">
                            ({formatNumero(porcentajeItem)}%)
                          </span>
                        </div>
                        <div
                          className="relative h-5 rounded bg-zinc-100"
                          style={{ gridColumn: "2 / -1" }}
                        >
                          {tieneProgramacion ? (
                            <div
                              className="absolute top-0 h-5 overflow-hidden rounded border border-zinc-300 bg-white"
                              style={{
                                left: `${leftPct}%`,
                                width: `${widthPct}%`,
                              }}
                              title={`Semana ${primeraSemana} a ${ultimaSemana} — ${formatNumero(
                                porcentajeItem
                              )}% de avance`}
                            >
                              <div
                                className="h-full bg-black"
                                style={{ width: `${Number(porcentajeItem)}%` }}
                              />
                            </div>
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-400">
                              Sin programación
                            </span>
                          )}
                        </div>
                      </Fragment>
                    );
                  })}
                </Fragment>
              );
            })}

            {semanaHoy && (
              <div
                className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-red-500/70"
                style={{
                  left: `calc(220px + (100% - 220px) * ${
                    (semanaHoy - 0.5) / totalSemanas
                  })`,
                }}
                title={`Semana actual: ${semanaHoy}`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
