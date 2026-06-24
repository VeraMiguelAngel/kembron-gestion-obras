import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { updateUsuario } from "@/lib/actions/usuarios";
import { linkBack } from "@/lib/ui";
import { UsuarioForm } from "../../usuario-form";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: { id: true, nombre: true, email: true, rol: true },
  });

  if (!usuario) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
      <div className="w-full max-w-sm">
        <Link href="/usuarios" className={linkBack}>
          ← Volver a Usuarios
        </Link>
      </div>
      <h1 className="text-2xl font-semibold">Editar usuario</h1>
      <UsuarioForm
        action={updateUsuario.bind(null, usuario.id)}
        initialValues={usuario}
        mode="edit"
      />
    </div>
  );
}
