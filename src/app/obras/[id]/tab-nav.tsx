"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TabNav({ obraId }: { obraId: string }) {
  const pathname = usePathname();

  const resumenHref = `/obras/${obraId}/resumen`;
  const datosGeneralesHref = `/obras/${obraId}`;
  const presupuestoHref = `/obras/${obraId}/presupuesto/titulos-items`;
  const avanceHref = `/obras/${obraId}/avance/programacion-semanal`;

  const tabs = [
    {
      href: resumenHref,
      label: "Resumen",
      active: pathname === resumenHref,
    },
    {
      href: datosGeneralesHref,
      label: "Datos generales",
      active: pathname === datosGeneralesHref,
    },
    {
      href: presupuestoHref,
      label: "Presupuesto",
      active: pathname.startsWith(`/obras/${obraId}/presupuesto`),
    },
    {
      href: avanceHref,
      label: "Avance",
      active: pathname.startsWith(`/obras/${obraId}/avance`),
    },
  ];

  return (
    <nav className="flex gap-6 border-b border-zinc-200">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`-mb-px border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
            tab.active
              ? "border-red-600 text-red-600"
              : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
