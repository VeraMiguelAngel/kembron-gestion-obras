"use client";

export function ToggleActivaForm({
  action,
  activa,
}: {
  action: () => Promise<void>;
  activa: boolean;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        className={`cursor-pointer rounded-md border px-3 py-1 text-sm font-medium transition-colors ${
          activa
            ? "border-red-300 text-red-600 hover:bg-red-50"
            : "border-green-300 text-green-700 hover:bg-green-50"
        }`}
      >
        {activa ? "Desactivar" : "Activar"}
      </button>
    </form>
  );
}
