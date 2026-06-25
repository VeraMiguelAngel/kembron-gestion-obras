import Link from "next/link";
import { getUser } from "@/lib/dal";
import { logout } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { presupuestoRealObra, ejecutadoObra, formatNumero } from "@/lib/presupuesto";
import { porcentajeAvanceObra, porcentajeAvancePromedio } from "@/lib/avance";
import { ProgressBar } from "@/app/obras/progress-bar";
import { StatCard } from "./stat-card";
import { PresupuestoEjecutadoBar } from "./presupuesto-ejecutado-bar";

const ESTADO_LABELS: Record<string, string> = {
  EN_EJECUCION: "En ejecución",
  FINALIZADA: "Finalizada",
  PAUSADA: "Pausada",
};

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  if (user.rol !== "ADMIN") {
    const asignaciones = await prisma.asignacionObraSupervisor.findMany({
      where: { usuarioId: user.id },
      include: { obra: { select: { id: true, nombre: true, ubicacion: true, estado: true } } },
      orderBy: { obra: { nombre: "asc" } },
    });

    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Hola, {user.nombre}</h1>
            <p className="text-xs text-zinc-500">Mis obras</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="cursor-pointer rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            >
              Salir
            </button>
          </form>
        </div>

        {asignaciones.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Todavía no tenés obras asignadas.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {asignaciones.map(({ obra }) => (
              <Link
                key={obra.id}
                href={`/mis-obras/${obra.id}`}
                className="flex flex-col gap-1 rounded-lg border border-zinc-200 p-4 active:bg-zinc-50"
              >
                <span className="text-base font-semibold">{obra.nombre}</span>
                <span className="text-sm text-zinc-600">{obra.ubicacion}</span>
                <span className="text-xs text-zinc-500">
                  {ESTADO_LABELS[obra.estado] ?? obra.estado}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const obras = await prisma.obra.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      titulos: {
        include: {
          items: {
            include: {
              adicionalesDeductivos: { select: { tipo: true, monto: true } },
              gastos: { select: { monto: true } },
              registrosAvance: { select: { cantidad: true } },
            },
          },
        },
      },
    },
  });

  const obrasConCalculos = obras.map((obra) => ({
    id: obra.id,
    nombre: obra.nombre,
    activa: obra.activa,
    presupuestado: presupuestoRealObra(obra.titulos),
    ejecutado: ejecutadoObra(obra.titulos),
    avanceFisico: porcentajeAvanceObra(obra.titulos),
  }));

  const obrasActivas = obrasConCalculos.filter((obra) => obra.activa).length;
  const obrasDesactivadas = obrasConCalculos.filter(
    (obra) => !obra.activa
  ).length;
  const presupuestoTotal = obrasConCalculos.reduce(
    (acumulado, obra) => acumulado.plus(obra.presupuestado),
    new Prisma.Decimal(0)
  );
  const avancePromedio = porcentajeAvancePromedio(
    obrasConCalculos.map((obra) => obra.avanceFisico)
  );

  const maximoPresupuestoEjecutado = obrasConCalculos.reduce(
    (maximo, obra) => {
      const candidato = obra.presupuestado.greaterThan(obra.ejecutado)
        ? obra.presupuestado
        : obra.ejecutado;
      return candidato.greaterThan(maximo) ? candidato : maximo;
    },
    new Prisma.Decimal(0)
  );

  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Hola, {user.nombre}
        </h1>
        <p className="text-sm text-zinc-600">
          Email: {user.email} — Rol: {user.rol}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Obras activas" value={obrasActivas} />
        <StatCard label="Proyectos desactivados" value={obrasDesactivadas} />
        <StatCard
          label="Presupuesto total"
          value={formatNumero(presupuestoTotal)}
        />
        <StatCard
          label="Avance promedio"
          value={`${formatNumero(avancePromedio)}%`}
        />
      </div>

      {obrasConCalculos.length === 0 ? (
        <p className="text-sm text-zinc-500">Todavía no hay obras creadas.</p>
      ) : (
        <>
          <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              Avance físico por obra
            </h2>
            <div className="flex flex-col gap-3">
              {obrasConCalculos.map((obra) => (
                <ProgressBar
                  key={obra.id}
                  label={obra.nombre}
                  value={Math.round(Number(obra.avanceFisico))}
                />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                Presupuestado vs. ejecutado por obra
              </h2>
              <div className="flex items-center gap-3 text-xs text-zinc-600">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-zinc-400" />
                  Presupuestado
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-black" />
                  Ejecutado
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {obrasConCalculos.map((obra) => (
                <PresupuestoEjecutadoBar
                  key={obra.id}
                  label={obra.nombre}
                  presupuestado={obra.presupuestado}
                  ejecutado={obra.ejecutado}
                  maximo={maximoPresupuestoEjecutado}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
