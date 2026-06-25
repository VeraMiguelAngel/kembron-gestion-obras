import { getUser } from "@/lib/dal";
import { AppShell } from "@/components/app-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user || user.rol !== "ADMIN") {
    return <>{children}</>;
  }

  return <AppShell user={user}>{children}</AppShell>;
}
