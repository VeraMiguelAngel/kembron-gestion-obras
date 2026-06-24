"use client";

import { useActionState } from "react";
import type { ObraFormState } from "@/lib/definitions";

type Supervisor = { id: string; nombre: string; email: string };

type ObraFormProps = {
  action: (state: ObraFormState, formData: FormData) => Promise<ObraFormState>;
  supervisores: Supervisor[];
  initialValues?: {
    nombre: string;
    ubicacion: string;
    cliente: string;
    estado: string;
    fechaInicio: string;
    fechaFinTeorica: string;
    supervisorIds: string[];
  };
  mode: "create" | "edit";
};

export function ObraForm({
  action,
  supervisores,
  initialValues,
  mode,
}: ObraFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  // React resetea los inputs no controlados tras cada submit de una Server
  // Action; para repoblar el form en caso de error hay que pasarle como
  // defaultValue lo último enviado (state.values), no solo el valor inicial.
  const values = {
    nombre: state?.values?.nombre ?? initialValues?.nombre,
    ubicacion: state?.values?.ubicacion ?? initialValues?.ubicacion,
    cliente: state?.values?.cliente ?? initialValues?.cliente,
    estado: state?.values?.estado ?? initialValues?.estado ?? "EN_EJECUCION",
    fechaInicio: state?.values?.fechaInicio ?? initialValues?.fechaInicio,
    fechaFinTeorica:
      state?.values?.fechaFinTeorica ?? initialValues?.fechaFinTeorica,
    supervisorIds:
      state?.values?.supervisorIds ?? initialValues?.supervisorIds ?? [],
  };

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <label htmlFor="nombre" className="text-sm font-medium">
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          defaultValue={values.nombre}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        {state?.errors?.nombre && (
          <p className="text-sm text-red-600">{state.errors.nombre[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="ubicacion" className="text-sm font-medium">
          Ubicación
        </label>
        <input
          id="ubicacion"
          name="ubicacion"
          defaultValue={values.ubicacion}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        {state?.errors?.ubicacion && (
          <p className="text-sm text-red-600">{state.errors.ubicacion[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="cliente" className="text-sm font-medium">
          Cliente
        </label>
        <input
          id="cliente"
          name="cliente"
          defaultValue={values.cliente}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        {state?.errors?.cliente && (
          <p className="text-sm text-red-600">{state.errors.cliente[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="estado" className="text-sm font-medium">
          Estado
        </label>
        <select
          key={values.estado}
          id="estado"
          name="estado"
          defaultValue={values.estado}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          <option value="EN_EJECUCION">En ejecución</option>
          <option value="PAUSADA">Pausada</option>
          <option value="FINALIZADA">Finalizada</option>
        </select>
        {state?.errors?.estado && (
          <p className="text-sm text-red-600">{state.errors.estado[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="fechaInicio" className="text-sm font-medium">
          Fecha de inicio
        </label>
        <input
          id="fechaInicio"
          name="fechaInicio"
          type="date"
          defaultValue={values.fechaInicio}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        {state?.errors?.fechaInicio && (
          <p className="text-sm text-red-600">{state.errors.fechaInicio[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="fechaFinTeorica" className="text-sm font-medium">
          Fecha de fin teórica
        </label>
        <input
          id="fechaFinTeorica"
          name="fechaFinTeorica"
          type="date"
          defaultValue={values.fechaFinTeorica}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        {state?.errors?.fechaFinTeorica && (
          <p className="text-sm text-red-600">
            {state.errors.fechaFinTeorica[0]}
          </p>
        )}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Supervisores asignados</legend>
        {supervisores.length === 0 && (
          <p className="text-sm text-zinc-500">
            No hay usuarios con rol SUPERVISOR todavía.
          </p>
        )}
        {supervisores.map((supervisor) => (
          <label key={supervisor.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="supervisorIds"
              value={supervisor.id}
              defaultChecked={values.supervisorIds.includes(supervisor.id)}
            />
            {supervisor.nombre} ({supervisor.email})
          </label>
        ))}
      </fieldset>

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? "Guardando..."
          : mode === "create"
            ? "Crear obra"
            : "Guardar cambios"}
      </button>
    </form>
  );
}
