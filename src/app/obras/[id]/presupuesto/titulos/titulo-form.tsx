"use client";

import { useActionState } from "react";
import type { TituloFormState } from "@/lib/definitions";

type TituloFormProps = {
  action: (
    state: TituloFormState,
    formData: FormData
  ) => Promise<TituloFormState>;
  initialValues?: { nombre?: string; orden?: string };
};

export function TituloForm({ action, initialValues }: TituloFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  const values = {
    nombre: state?.values?.nombre ?? initialValues?.nombre,
    orden: state?.values?.orden ?? initialValues?.orden,
  };

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
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
        <label htmlFor="orden" className="text-sm font-medium">
          Orden
        </label>
        <input
          id="orden"
          name="orden"
          type="number"
          min="1"
          step="1"
          defaultValue={values.orden}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        {state?.errors?.orden && (
          <p className="text-sm text-red-600">{state.errors.orden[0]}</p>
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
