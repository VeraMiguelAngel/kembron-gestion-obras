"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireObraAccess } from "@/lib/dal";
import { GastoFormSchema, type GastoFormState } from "@/lib/definitions";

function valoresEnviados(formData: FormData) {
  return {
    descripcion: String(formData.get("descripcion") ?? ""),
    categoria: String(formData.get("categoria") ?? ""),
    fecha: String(formData.get("fecha") ?? ""),
    monto: String(formData.get("monto") ?? ""),
    itemId: String(formData.get("itemId") ?? ""),
  };
}

function revalidatePresupuesto(obraId: string) {
  revalidatePath(`/obras/${obraId}/presupuesto/titulos-items`);
  revalidatePath(`/obras/${obraId}/presupuesto/gastos`);
}

function pathGastos(obraId: string) {
  return `/obras/${obraId}/presupuesto/gastos`;
}

export async function createGasto(
  obraId: string,
  _state: GastoFormState,
  formData: FormData
): Promise<GastoFormState> {
  const session = await requireObraAccess(obraId);

  const validatedFields = GastoFormSchema.safeParse({
    descripcion: formData.get("descripcion"),
    categoria: formData.get("categoria"),
    fecha: formData.get("fecha"),
    monto: formData.get("monto"),
    itemId: formData.get("itemId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: valoresEnviados(formData),
    };
  }

  const item = await prisma.item.findFirst({
    where: { id: validatedFields.data.itemId, titulo: { obraId } },
    select: { id: true },
  });
  if (!item) {
    return {
      errors: { itemId: ["El ítem seleccionado no es válido."] },
      values: valoresEnviados(formData),
    };
  }

  await prisma.gasto.create({
    data: { ...validatedFields.data, usuarioId: session.userId },
  });

  revalidatePresupuesto(obraId);

  if (session.rol === "SUPERVISOR") {
    redirect(`/mis-obras/${obraId}`);
  }
  redirect(pathGastos(obraId));
}

export async function updateGasto(
  id: string,
  obraId: string,
  _state: GastoFormState,
  formData: FormData
): Promise<GastoFormState> {
  await requireAdmin();

  const validatedFields = GastoFormSchema.safeParse({
    descripcion: formData.get("descripcion"),
    categoria: formData.get("categoria"),
    fecha: formData.get("fecha"),
    monto: formData.get("monto"),
    itemId: formData.get("itemId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: valoresEnviados(formData),
    };
  }

  const item = await prisma.item.findFirst({
    where: { id: validatedFields.data.itemId, titulo: { obraId } },
    select: { id: true },
  });
  if (!item) {
    return {
      errors: { itemId: ["El ítem seleccionado no es válido."] },
      values: valoresEnviados(formData),
    };
  }

  await prisma.gasto.update({ where: { id }, data: validatedFields.data });

  revalidatePresupuesto(obraId);
  redirect(pathGastos(obraId));
}

export async function deleteGasto(id: string, obraId: string) {
  await requireAdmin();
  await prisma.gasto.delete({ where: { id } });
  revalidatePresupuesto(obraId);
}
