"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const CATEGORIAS = [
  { value: "MANO_DE_OBRA", label: "Mano de obra" },
  { value: "MATERIAL", label: "Material" },
  { value: "EQUIPO", label: "Equipo" },
  { value: "SUBCONTRATO", label: "Subcontrato" },
  { value: "OTROS", label: "Otros" },
];

export function CategoriaFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoriaActual = searchParams.get("categoria") ?? "";

  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor="categoria-filter" className="font-medium">
        Filtrar por categoría
      </label>
      <select
        id="categoria-filter"
        defaultValue={categoriaActual}
        onChange={(event) => {
          const valor = event.target.value;
          router.push(valor ? `${pathname}?categoria=${valor}` : pathname);
        }}
        className="rounded-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
      >
        <option value="">Todas</option>
        {CATEGORIAS.map((categoria) => (
          <option key={categoria.value} value={categoria.value}>
            {categoria.label}
          </option>
        ))}
      </select>
    </div>
  );
}
