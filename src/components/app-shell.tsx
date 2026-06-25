import { Sidebar } from "./sidebar";

export function AppShell({
  user,
  children,
}: {
  user: { nombre: string; email: string; rol: string };
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar user={user} />
      <div className="flex-1 overflow-y-auto bg-zinc-50">{children}</div>
    </div>
  );
}
