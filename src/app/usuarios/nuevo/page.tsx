import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { createUsuario } from "@/lib/actions/usuarios";
import { linkBack } from "@/lib/ui";
import { UsuarioForm } from "../usuario-form";

export default async function NuevoUsuarioPage() {
  await requireAdmin();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
      <div className="w-full max-w-sm">
        <Link href="/usuarios" className={linkBack}>
          ← Volver a Usuarios
        </Link>
      </div>
      <h1 className="text-2xl font-semibold">Nuevo usuario</h1>
      <UsuarioForm action={createUsuario} mode="create" />
    </div>
  );
}
