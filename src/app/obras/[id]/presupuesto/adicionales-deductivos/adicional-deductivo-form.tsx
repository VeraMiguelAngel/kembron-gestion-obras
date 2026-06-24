"use client";

import { useActionState } from "react";
import type { AdicionalDeductivoFormState } from "@/lib/definitions";

type ItemOpcion = { id: string; nombre: string; tituloNombre: string };

type AdicionalDeductivoFormProps = {
  action: (
    state: AdicionalDeductivoFormState,
    formData: FormData
  ) => Promise<AdicionalDeductivoFormState>;
  items: ItemOpcion[];
  initialValues?: {
    tipo?: string;
    nombre?: string;
    itemId?: string;
    monto?: string;
  };
};

export function AdicionalDeductivoForm({
  action,
  items,
  initialValues,
}: AdicionalDeductivoFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  const values = {
    tipo: state?.values?.tipo ?? initialValues?.tipo ?? "ADICIONAL",
    nombre: state?.values?.nombre ?? initialValues?.nombre,
    itemId: state?.values?.itemId ?? initialValues?.itemId,
    monto: state?.values?.monto ?? initialValues?.monto,
  };

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <label htmlFor="tipo" className="text-sm font-medium">
          Tipo
        </label>
        <select
          key={values.tipo}
          id="tipo"
          name="tipo"
          defaultValue={values.tipo}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          <option value="ADICIONAL">Adicional</option>
          <option value="DEDUCTIVO">Deductivo</option>
        </select>
        {state?.errors?.tipo && (
          <p className="text-sm text-red-600">{state.errors.tipo[0]}</p>
        )}
      </div>

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
