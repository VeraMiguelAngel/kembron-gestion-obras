"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { ItemFormSchema, type ItemFormState } from "@/lib/definitions";

function valoresEnviados(formData: FormData) {
  return {
    nombre: String(formData.get("nombre") ?? ""),
    cantidad: String(formData.get("cantidad") ?? ""),
    unidadId: String(formData.get("unidadId") ?? ""),
    valorUnitario: String(formData.get("valorUnitario") ?? ""),
    orden: String(formData.get("orden") ?? ""),
  };
}

function pathTitulosItems(obraId: string) {
  return `/obras/${obraId}/presupuesto/titulos-items`;
}

export async function createItem(
  tituloId: string,
  obraId: string,
  _state: ItemFormState,
  formData: FormData
): Promise<ItemFormState> {
  await requireAdmin();

  const validatedFields = ItemFormSchema.safeParse({
    nombre: formData.get("nombre"),
    cantidad: formData.get("cantidad"),
    unidadId: formData.get("unidadId"),
    valorUnitario: formData.get("valorUnitario"),
    orden: formData.get("orden"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: valoresEnviados(formData),
    };
  }

  await prisma.item.create({
    data: { ...validatedFields.data, tituloId },
  });

  revalidatePath(pathTitulosItems(obraId));
  redirect(pathTitulosItems(obraId));
}

export async function updateItem(
  id: string,
  obraId: string,
  _state: ItemFormState,
  formData: FormData
): Promise<ItemFormState> {
  await requireAdmin();

  const validatedFields = ItemFormSchema.safeParse({
    nombre: formData.get("nombre"),
    cantidad: formData.get("cantidad"),
    unidadId: formData.get("unidadId"),
    valorUnitario: formData.get("valorUnitario"),
    orden: formData.get("orden"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: valoresEnviados(formData),
    };
  }

  await prisma.item.update({ where: { id }, data: validatedFields.data });

  revalidatePath(pathTitulosItems(obraId));
  redirect(pathTitulosItems(obraId));
}

export async function deleteItem(id: string, obraId: string) {
  await requireAdmin();
  await prisma.item.delete({ where: { id } });
  revalidatePath(pathTitulosItems(obraId));
}
