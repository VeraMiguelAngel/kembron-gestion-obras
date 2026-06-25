"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireObraAccess } from "@/lib/dal";
import {
  RegistroAvanceFormSchema,
  type RegistroAvanceFormState,
} from "@/lib/definitions";

function valoresEnviados(formData: FormData) {
  return {
    cantidad: String(formData.get("cantidad") ?? ""),
    fecha: String(formData.get("fecha") ?? ""),
    itemId: String(formData.get("itemId") ?? ""),
  };
}

export async function createRegistroAvance(
  obraId: string,
  _state: RegistroAvanceFormState,
  formData: FormData
): Promise<RegistroAvanceFormState> {
  const session = await requireObraAccess(obraId);

  const validatedFields = RegistroAvanceFormSchema.safeParse({
    cantidad: formData.get("cantidad"),
    fecha: formData.get("fecha"),
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

  await prisma.registroAvance.create({
    data: { ...validatedFields.data, usuarioId: session.userId },
  });

  revalidatePath(`/obras/${obraId}/avance/registro`);
  revalidatePath("/obras");

  if (session.rol === "SUPERVISOR") {
    redirect(`/mis-obras/${obraId}`);
  }
  redirect(`/obras/${obraId}/avance/registro`);
}

export async function updateRegistroAvance(
  id: string,
  obraId: string,
  _state: RegistroAvanceFormState,
  formData: FormData
): Promise<RegistroAvanceFormState> {
  await requireAdmin();

  const validatedFields = RegistroAvanceFormSchema.safeParse({
    cantidad: formData.get("cantidad"),
    fecha: formData.get("fecha"),
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

  await prisma.registroAvance.update({
    where: { id },
    data: validatedFields.data,
  });

  revalidatePath(`/obras/${obraId}/avance/registro`);
  revalidatePath("/obras");
  redirect(`/obras/${obraId}/avance/registro`);
}

export async function deleteRegistroAvance(id: string, obraId: string) {
  await requireAdmin();
  await prisma.registroAvance.delete({ where: { id } });
  revalidatePath(`/obras/${obraId}/avance/registro`);
  revalidatePath("/obras");
}
