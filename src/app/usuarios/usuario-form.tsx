"use client";

import { useActionState } from "react";
import type { UsuarioFormState } from "@/lib/definitions";

type UsuarioFormProps = {
  action: (
    state: UsuarioFormState,
    formData: FormData
  ) => Promise<UsuarioFormState>;
  initialValues?: { nombre: string; email: string; rol: string };
  mode: "create" | "edit";
};

export function UsuarioForm({ action, initialValues, mode }: UsuarioFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  // Ver nota equivalente en obra-form.tsx: hay que repoblar el form con lo
  // último enviado tras un error, porque React resetea los inputs no
  // controlados después de cada submit de una Server Action. El password
  // nunca se hace eco por seguridad.
  const values = {
    nombre: state?.values?.nombre ?? initialValues?.nombre,
    email: state?.values?.email ?? initialValues?.email,
    rol: state?.values?.rol ?? initialValues?.rol ?? "SUPERVISOR",
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
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={values.email}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        {state?.errors?.email && (
          <p className="text-sm text-red-600">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          {mode === "create" ? "Contraseña" : "Nueva contraseña (opcional)"}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required={mode === "create"}
          className="rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        {state?.errors?.password && (
          <p className="text-sm text-red-600">{state.errors.password[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="rol" className="text-sm font-medium">
          Rol
        </label>
        <select
          key={values.rol}
          id="rol"
          name="rol"
          defaultValue={values.rol}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          <option value="ADMIN">ADMIN</option>
          <option value="SUPERVISOR">SUPERVISOR</option>
        </select>
        {state?.errors?.rol && (
          <p className="text-sm text-red-600">{state.errors.rol[0]}</p>
        )}
      </div>

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? "Guardando..."
          : mode === "create"
            ? "Crear usuario"
            : "Guardar cambios"}
      </button>
    </form>
  );
}
