import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  presupuestoRealObra,
  ejecutadoObra,
  formatNumero,
} from "@/lib/presupuesto";
import { porcentajeAvanceItem, porcentajeAvancePromedio } from "@/lib/avance";
import {
  calcularSemanasObra,
  diasTranscurridos,
  porcentajeTiempoTranscurrido,
} from "@/lib/programacion";
import {
  curvaFisicaPlanificada,
  curvaFinancieraPlanificada,
  curvaFisicaReal,
  curvaFinancieraReal,
} from "@/lib/curvas";
import { StatCard } from "@/app/dashboard/stat-card";
import { SCurveChart } from "./s-curve-chart";

export default async function ResumenPage({
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

  const titulos = await prisma.titulo.findMany({
    where: { obraId },
    orderBy: { orden: "asc" },
    include: {
      items: {
        orderBy: { orden: "asc" },
        include: {
          adicionalesDeductivos: { select: { tipo: true, monto: true } },
          gastos: { select: { monto: true, fecha: true } },
          registrosAvance: { select: { cantidad: true, fecha: true } },
          programaciones: {
            select: { numeroSemana: true, cantidadProgramada: true },
          },
        },
      },
    },
  });

  const semanas = calcularSemanasObra(obra.fechaInicio, obra.fechaFinTeorica);
  const todosLosItems = titulos.flatMap((titulo) => titulo.items);

  const avanceFisico = porcentajeAvancePromedio(
    todosLosItems.map((item) => porcentajeAvanceItem(item))
  );
  const presupuestoReal = presupuestoRealObra(titulos);
  const ejecutado = ejecutadoObra(titulos);
  const avanceEconomico = presupuestoReal.isZero()
    ? new Prisma.Decimal(0)
    : ejecutado.dividedBy(presupuestoReal).times(100);

  const dias = diasTranscurridos(obra.fechaInicio);
  const pctTiempo = porcentajeTiempoTranscurrido(
    obra.fechaInicio,
    obra.fechaFinTeorica
  );

  const curvaFisicaPlan = curvaFisicaPlanificada(todosLosItems, semanas.length);
  const curvaFisicaRealSerie = curvaFisicaReal(
    todosLosItems.flatMap((item) => item.registrosAvance),
    semanas
  );
  const curvaFinPlan = curvaFinancieraPlanificada(
    todosLosItems,
    semanas.length
  );
  const curvaFinRealSerie = curvaFinancieraReal(
    todosLosItems.flatMap((item) => item.gastos),
    semanas
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Avance físico"
          value={`${formatNumero(avanceFisico)}%`}
        />
        <StatCard
          label="Avance económico"
          value={`${formatNumero(avanceEconomico)}%`}
        />
        <StatCard label="Días transcurridos" value={dias} />
        <StatCard
          label="Tiempo transcurrido"
          value={`${formatNumero(pctTiempo)}%`}
        />
      </div>

      {titulos.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Todavía no hay títulos ni ítems en esta obra. Creálos primero en la
          pestaña &quot;Presupuesto&quot;.
        </p>
      ) : (
        <>
          <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              Curva física: planificado vs. real
            </h2>
            <SCurveChart
              series={[
                {
                  label: "Planificado",
                  color: "#a1a1aa",
                  valores: curvaFisicaPlan.map((valor) => Number(valor)),
                },
                {
                  label: "Real",
                  color: "#dc2626",
                  valores: curvaFisicaRealSerie.map((valor) => Number(valor)),
                },
              ]}
            />
          </section>

          <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              Curva financiera: presupuestado vs. ejecutado
            </h2>
            <SCurveChart
              series={[
                {
                  label: "Presupuestado",
                  color: "#a1a1aa",
                  valores: curvaFinPlan.map((valor) => Number(valor)),
                },
                {
                  label: "Ejecutado",
                  color: "#dc2626",
                  valores: curvaFinRealSerie.map((valor) => Number(valor)),
                },
              ]}
            />
          </section>

          <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Avance por título</h2>
            <div className="flex flex-col gap-2">
              {titulos.map((titulo) => {
                const porcentajeTitulo = porcentajeAvancePromedio(
                  titulo.items.map((item) => porcentajeAvanceItem(item))
                );
                return (
                  <div
                    key={titulo.id}
                    className="flex items-center justify-between rounded-md border border-zinc-100 px-3 py-2 text-sm"
                  >
                    <span className="text-zinc-700">
                      {titulo.orden}. {titulo.nombre}
                    </span>
                    <span className="font-medium text-zinc-900">
                      {formatNumero(porcentajeTitulo)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
