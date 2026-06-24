"use client";

export function DeleteItemForm({
  action,
  nombre,
}: {
  action: () => Promise<void>;
  nombre: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm(`¿Eliminar el ítem "${nombre}"?`)) {
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
