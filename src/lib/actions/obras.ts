"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { ObraFormSchema, type ObraFormState } from "@/lib/definitions";

async function supervisorIdsValidos(formData: FormData) {
  const enviados = formData.getAll("supervisorIds").map(String).filter(Boolean);
  if (enviados.length === 0) return [];

  const supervisores = await prisma.usuario.findMany({
    where: { id: { in: enviados }, rol: "SUPERVISOR" },
    select: { id: true },
  });
  return supervisores.map((s) => s.id);
}

function valoresEnviados(formData: FormData) {
  return {
    nombre: String(formData.get("nombre") ?? ""),
    ubicacion: String(formData.get("ubicacion") ?? ""),
    cliente: String(formData.get("cliente") ?? ""),
    estado: String(formData.get("estado") ?? ""),
    fechaInicio: String(formData.get("fechaInicio") ?? ""),
    fechaFinTeorica: String(formData.get("fechaFinTeorica") ?? ""),
    supervisorIds: formData.getAll("supervisorIds").map(String),
  };
}

export async function createObra(
  _state: ObraFormState,
  formData: FormData
): Promise<ObraFormState> {
  await requireAdmin();

  const validatedFields = ObraFormSchema.safeParse({
    nombre: formData.get("nombre"),
    ubicacion: formData.get("ubicacion"),
    cliente: formData.get("cliente"),
    estado: formData.get("estado"),
    fechaInicio: formData.get("fechaInicio"),
    fechaFinTeorica: formData.get("fechaFinTeorica"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: valoresEnviados(formData),
    };
  }

  const supervisorIds = await supervisorIdsValidos(formData);

  await prisma.obra.create({
    data: {
      ...validatedFields.data,
      asignaciones: {
        create: supervisorIds.map((usuarioId) => ({ usuarioId })),
      },
    },
  });

  revalidatePath("/obras");
  redirect("/obras");
}

export async function updateObra(
  id: string,
  _state: ObraFormState,
  formData: FormData
): Promise<ObraFormState> {
  await requireAdmin();

  const validatedFields = ObraFormSchema.safeParse({
    nombre: formData.get("nombre"),
    ubicacion: formData.get("ubicacion"),
    cliente: formData.get("cliente"),
    estado: formData.get("estado"),
    fechaInicio: formData.get("fechaInicio"),
    fechaFinTeorica: formData.get("fechaFinTeorica"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: valoresEnviados(formData),
    };
  }

  const supervisorIds = await supervisorIdsValidos(formData);

  await prisma.$transaction([
    prisma.obra.update({ where: { id }, data: validatedFields.data }),
    prisma.asignacionObraSupervisor.deleteMany({
      where: { obraId: id, usuarioId: { notIn: supervisorIds } },
    }),
    ...supervisorIds.map((usuarioId) =>
      prisma.asignacionObraSupervisor.upsert({
        where: { usuarioId_obraId: { usuarioId, obraId: id } },
        create: { usuarioId, obraId: id },
        update: {},
      })
    ),
  ]);

  revalidatePath("/obras");
  redirect("/obras");
}

export async function toggleObraActiva(id: string, activaActual: boolean) {
  await requireAdmin();

  await prisma.obra.update({
    where: { id },
    data: { activa: !activaActual },
  });

  revalidatePath("/obras");
}
