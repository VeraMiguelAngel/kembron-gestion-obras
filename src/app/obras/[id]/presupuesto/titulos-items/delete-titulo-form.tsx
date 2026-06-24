"use client";

export function DeleteTituloForm({
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
        if (
          !confirm(`¿Eliminar el título "${nombre}" y todos sus ítems?`)
        ) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className="cursor-pointer text-sm font-medium text-red-600 transition-colors hover:text-red-700">
        Eliminar título
      </button>
    </form>
  );
}
