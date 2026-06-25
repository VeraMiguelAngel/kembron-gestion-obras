// Clases de Tailwind compartidas para mantener consistencia visual en toda la
// app (botones, cards, tablas, badges). Centralizar estos strings evita que
// cada página repita su propia variante ligeramente distinta.

export const btnPrimary =
  "inline-flex cursor-pointer items-center justify-center rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50";

export const btnSecondary =
  "inline-flex cursor-pointer items-center justify-center rounded-md border border-zinc-300 px-4 py-2 font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50";

export const linkAction =
  "cursor-pointer text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900";

export const linkDanger =
  "cursor-pointer text-sm font-medium text-red-600 transition-colors hover:text-red-700";

export const linkBack =
  "inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800";

export const card =
  "rounded-lg border border-zinc-200 bg-white p-4 shadow-sm";

export const input =
  "rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500";

export const tableHeaderRow =
  "border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500";

export const tableRow =
  "border-b border-zinc-100 transition-colors hover:bg-zinc-50";
