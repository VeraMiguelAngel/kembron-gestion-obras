"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SubTabNav({ obraId }: { obraId: string }) {
  const pathname = usePathname();

  const tabs = [
    {
      href: `/obras/${obraId}/avance/programacion-semanal`,
      label: "Programación semanal",
    },
    {
      href: `/obras/${obraId}/avance/registro`,
      label: "Registro de avance",
    },
    {
      href: `/obras/${obraId}/avance/gantt`,
      label: "Gantt",
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
