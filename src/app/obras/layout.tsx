import { getUser } from "@/lib/dal";
import { AppShell } from "@/components/app-shell";

export default async function ObrasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return <AppShell user={user}>{children}</AppShell>;
}
