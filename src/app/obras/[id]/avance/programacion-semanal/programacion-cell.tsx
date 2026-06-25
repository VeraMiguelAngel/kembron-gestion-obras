"use client";

import { useActionState } from "react";
import type { ProgramacionSemanalFormState } from "@/lib/definitions";

type ProgramacionCellProps = {
  action: (
    state: ProgramacionSemanalFormState,
    formData: FormData
  ) => Promise<ProgramacionSemanalFormState>;
  initialValue: string;
};

export function ProgramacionCell({ action, initialValue }: ProgramacionCellProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  const valor = state?.values?.cantidadProgramada ?? initialValue;

  return (
    <form action={formAction} className="flex flex-col items-center gap-1">
      <input
        key={valor}
        type="number"
        name="cantidadProgramada"
        min="0"
        step="0.0001"
        defaultValue={valor}
        disabled={pending}
        onBlur={(event) => event.currentTarget.form?.requestSubmit()}
        className="w-20 rounded-md border border-transparent bg-zinc-100 px-2 py-1.5 text-right text-sm text-zinc-700 transition-colors hover:bg-zinc-200/70 focus:border-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-400 disabled:opacity-50"
      />
      {state?.errors?.cantidadProgramada && (
        <p className="w-24 text-center text-xs text-red-600">
          {state.errors.cantidadProgramada[0]}
        </p>
      )}
    </form>
  );
}
