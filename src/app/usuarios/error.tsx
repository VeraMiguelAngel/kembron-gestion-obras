"use client";

export default function UsuariosError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
      <h2 className="text-xl font-semibold">No se pudo completar la acción</h2>
      <p className="text-zinc-600">{error.message}</p>
      <button
        onClick={() => unstable_retry()}
        className="cursor-pointer rounded-md border border-zinc-300 px-4 py-2 font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
      >
        Volver a intentar
      </button>
    </div>
  );
}
