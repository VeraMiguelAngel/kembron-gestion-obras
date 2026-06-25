import Link from "next/link";
import { toggleObraActiva } from "@/lib/actions/obras";
import { ToggleActivaForm } from "./toggle-activa-form";
import { ProgressBar } from "./progress-bar";

const ESTADO_LABELS: Record<string, string> = {
  EN_EJECUCION: "En ejecución",
  FINALIZADA: "Finalizada",
  PAUSADA: "Pausada",
};

// Las fechas se guardan como medianoche UTC (vienen de un <input type="date">).
// Sin timeZone: "UTC", toLocaleDateString las corre al huso horario local y
// muestra el día anterior.
function formatFecha(fecha: Date) {
  return fecha.toLocaleDateString("es-AR", { timeZone: "UTC" });
}

type ObraCardData = {
  id: string;
  nombre: string;
  ubicacion: string;
  cliente: string;
  estado: string;
  activa: boolean;
  fechaInicio: Date;
  fechaFinTeorica: Date;
  asignaciones: { usuario: { nombre: string } }[];
};

export function ObraCard({
  obra,
  avanceFisico,
  avanceEconomico,
}: {
  obra: ObraCardData;
  avanceFisico: number;
  avanceEconomico: number;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            {obra.nombre}
          </h2>
          <p className="text-sm text-zinc-600">{obra.ubicacion}</p>
          <p className="text-sm text-zinc-600">Cliente: {obra.cliente}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
            obra.activa
              ? "bg-green-100 text-green-800"
              : "bg-zinc-200 text-zinc-600"
          }`}
        >
          {obra.activa ? "Activa" : "Inactiva"}
        </span>
      </div>

      <p className="text-sm text-zinc-600">
        Estado: {ESTADO_LABELS[obra.estado] ?? obra.estado}
      </p>
      <p className="text-sm text-zinc-600">
        Período: {formatFecha(obra.fechaInicio)} – {formatFecha(obra.fechaFinTeorica)}
      </p>

      <ProgressBar label="Avance físico" value={Math.round(avanceFisico)} />
      <ProgressBar label="Avance económico" value={Math.round(avanceEconomico)} />

      {obra.asignaciones.length > 0 && (
        <p className="text-sm text-zinc-600">
          Supervisores: {obra.asignaciones.map((a) => a.usuario.nombre).join(", ")}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <Link
          href={`/obras/${obra.id}`}
          className="cursor-pointer text-sm font-medium text-zinc-500 transition-colors hover:text-red-600"
        >
          Ver detalle →
        </Link>
        <ToggleActivaForm
          action={toggleObraActiva.bind(null, obra.id, obra.activa)}
          activa={obra.activa}
        />
      </div>
    </div>
  );
}
