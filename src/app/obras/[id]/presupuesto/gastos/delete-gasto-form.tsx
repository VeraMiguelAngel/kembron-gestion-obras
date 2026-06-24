"use client";

export function DeleteGastoForm({
  action,
  descripcion,
}: {
  action: () => Promise<void>;
  descripcion: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm(`¿Eliminar el gasto "${descripcion}"?`)) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className="cursor-pointer text-sm font-medium text-red-600 transition-colors hover:text-red-700">
        Eliminar
      </button>
    </form>
  );
}
