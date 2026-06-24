import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { deleteUsuario } from "@/lib/actions/usuarios";
import { DeleteUsuarioForm } from "./delete-usuario-form";

export default async function UsuariosPage() {
  const session = await requireAdmin();

  const usuarios = await prisma.usuario.findMany({
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true, email: true, rol: true },
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <Link
          href="/usuarios/nuevo"
          className="rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
        >
          Nuevo usuario
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr
                key={usuario.id}
                className="border-b border-zinc-100 transition-colors last:border-b-0 hover:bg-zinc-50"
              >
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {usuario.nombre}
                </td>
                <td className="px-4 py-3 text-zinc-600">{usuario.email}</td>
                <td className="px-4 py-3 text-zinc-600">{usuario.rol}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link
                      href={`/usuarios/${usuario.id}/editar`}
                      className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
                    >
                      Editar
                    </Link>
                    {usuario.id !== session.userId && (
                      <DeleteUsuarioForm
                        action={deleteUsuario.bind(null, usuario.id)}
                        nombre={usuario.nombre}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
