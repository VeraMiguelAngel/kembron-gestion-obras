import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.userId, rol: session.rol };
});

export const requireAdmin = cache(async () => {
  const session = await verifySession();

  if (session.rol !== "ADMIN") {
    redirect("/dashboard");
  }

  return session;
});

export const getUser = cache(async () => {
  const session = await verifySession();

  return prisma.usuario.findUnique({
    where: { id: session.userId },
    select: { id: true, nombre: true, email: true, rol: true },
  });
});

// Para acciones que tanto ADMIN como SUPERVISOR pueden ejecutar (cargar
// avance/gasto): ADMIN siempre pasa, SUPERVISOR solo si está asignado a esa
// obra puntual vía AsignacionObraSupervisor.
export const requireObraAccess = cache(async (obraId: string) => {
  const session = await verifySession();

  if (session.rol === "ADMIN") {
    return session;
  }

  const asignacion = await prisma.asignacionObraSupervisor.findUnique({
    where: { usuarioId_obraId: { usuarioId: session.userId, obraId } },
  });

  if (!asignacion) {
    redirect("/dashboard");
  }

  return session;
});
