"use client";

import { useActionState } from "react";
import type { RegistroAvanceFormState } from "@/lib/definitions";

type ItemOpcion = { id: string; nombre: string; tituloNombre: string };

type RegistroAvanceFormProps = {
  action: (
    state: RegistroAvanceFormState,
    formData: FormData
  ) => Promise<RegistroAvanceFormState>;
  items: ItemOpcion[];
  initialValues?: {
    cantidad?: string;
    fecha?: string;
    itemId?: string;
  };
};

export function RegistroAvanceForm({
  action,
  items,
  initialValues,
}: RegistroAvanceFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  const values = {
    cantidad: state?.values?.cantidad ?? initialValues?.cantidad,
    fecha: state?.values?.fecha ?? initialValues?.fecha,
    itemId: state?.values?.itemId ?? initialValues?.itemId,
  };

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <label htmlFor="itemId" className="text-sm font-medium">
          Ítem
        </label>
        <select
          key={values.itemId ?? ""}
          id="itemId"
          name="itemId"
          defaultValue={values.itemId ?? ""}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          <option value="" disabled>
            Seleccioná un ítem
          </option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.tituloNombre} → {item.nombre}
            </option>
          ))}
        </select>
        {items.length === 0 && (
          <p className="text-sm text-zinc-500">
            No hay ítems en esta obra todavía. Creá uno primero en
            &quot;Títulos e ítems&quot;.
          </p>
        )}
        {state?.errors?.itemId && (
          <p className="text-sm text-red-600">{state.errors.itemId[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="cantidad" className="text-sm font-medium">
          Cantidad avanzada
        </label>
        <input
          id="cantidad"
          name="cantidad"
          type="number"
          min="0"
          step="0.0001"
          defaultValue={values.cantidad}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        {state?.errors?.cantidad && (
          <p className="text-sm text-red-600">{state.errors.cantidad[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="fecha" className="text-sm font-medium">
          Fecha
        </label>
        <input
          id="fecha"
          name="fecha"
          type="date"
          defaultValue={values.fecha}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        {state?.errors?.fecha && (
          <p className="text-sm text-red-600">{state.errors.fecha[0]}</p>
        )}
      </div>

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
