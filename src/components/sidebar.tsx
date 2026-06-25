"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Panel" },
  { href: "/obras", label: "Obras" },
  { href: "/usuarios", label: "Usuarios" },
];

type SidebarUser = {
  nombre: string;
  email: string;
  rol: string;
};

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-zinc-900">
      <div className="flex items-center gap-2 px-5 py-6">
        <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
        <span className="text-sm font-semibold tracking-wide text-white">
          Gestor de Obras
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-red-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 px-3 py-4">
        <p className="truncate px-3 text-sm font-medium text-zinc-100">
          {user.nombre}
        </p>
        <p className="truncate px-3 text-xs text-zinc-500">{user.email}</p>
        <form action={logout} className="mt-3">
          <button
            type="submit"
            className="w-full cursor-pointer rounded-md border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
