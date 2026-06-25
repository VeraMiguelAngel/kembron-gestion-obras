import { SubTabNav } from "./sub-tab-nav";

export default async function AvanceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: obraId } = await params;

  return (
    <div className="flex flex-col gap-4">
      <SubTabNav obraId={obraId} />
      {children}
    </div>
  );
}
