"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SubTabNav({ obraId }: { obraId: string }) {
  const pathname = usePathname();

  const tabs = [
    {
      href: `/obras/${obraId}/presupuesto/titulos-items`,
      label: "Títulos e ítems",
    },
    {
      href: `/obras/${obraId}/presupuesto/adicionales-deductivos`,
      label: "Adicionales y deductivos",
    },
    {
      href: `/obras/${obraId}/presupuesto/gastos`,
      label: "Gastos",
    },
  ];

  return (
    <nav className="flex gap-2 text-sm">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
            pathname === tab.href
              ? "bg-red-600 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
