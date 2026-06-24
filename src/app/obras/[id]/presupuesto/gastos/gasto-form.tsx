"use client";

import { useActionState } from "react";
import type { GastoFormState } from "@/lib/definitions";

type ItemOpcion = { id: string; nombre: string; tituloNombre: string };

const CATEGORIAS = [
  { value: "MANO_DE_OBRA", label: "Mano de obra" },
  { value: "MATERIAL", label: "Material" },
  { value: "EQUIPO", label: "Equipo" },
  { value: "SUBCONTRATO", label: "Subcontrato" },
  { value: "OTROS", label: "Otros" },
];

type GastoFormProps = {
  action: (
    state: GastoFormState,
    formData: FormData
  ) => Promise<GastoFormState>;
  items: ItemOpcion[];
  initialValues?: {
    descripcion?: string;
    categoria?: string;
    fecha?: string;
    monto?: string;
    itemId?: string;
  };
};

export function GastoForm({ action, items, initialValues }: GastoFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  const values = {
    descripcion: state?.values?.descripcion ?? initialValues?.descripcion,
    categoria:
      state?.values?.categoria ?? initialValues?.categoria ?? "MATERIAL",
    fecha: state?.values?.fecha ?? initialValues?.fecha,
    monto: state?.values?.monto ?? initialValues?.monto,
    itemId: state?.values?.itemId ?? initialValues?.itemId,
  };

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <label htmlFor="descripcion" className="text-sm font-medium">
          Descripción
        </label>
        <input
          id="descripcion"
          name="descripcion"
          defaultValue={values.descripcion}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        {state?.errors?.descripcion && (
          <p className="text-sm text-red-600">{state.errors.descripcion[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="categoria" className="text-sm font-medium">
          Categoría
        </label>
        <select
          key={values.categoria}
          id="categoria"
          name="categoria"
          defaultValue={values.categoria}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          {CATEGORIAS.map((categoria) => (
            <option key={categoria.value} value={categoria.value}>
              {categoria.label}
            </option>
          ))}
        </select>
        {state?.errors?.categoria && (
          <p className="text-sm text-red-600">{state.errors.categoria[0]}</p>
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
        <label htmlFor="monto" className="text-sm font-medium">
          Monto
        </label>
        <input
          id="monto"
          name="monto"
          type="number"
          min="0"
          step="0.0001"
          defaultValue={values.monto}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        {state?.errors?.monto && (
          <p className="text-sm text-red-600">{state.errors.monto[0]}</p>
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
