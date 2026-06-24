"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { TituloFormSchema, type TituloFormState } from "@/lib/definitions";

function valoresEnviados(formData: FormData) {
  return {
    nombre: String(formData.get("nombre") ?? ""),
    orden: String(formData.get("orden") ?? ""),
  };
}

function pathTitulosItems(obraId: string) {
  return `/obras/${obraId}/presupuesto/titulos-items`;
}

export async function createTitulo(
  obraId: string,
  _state: TituloFormState,
  formData: FormData
): Promise<TituloFormState> {
  await requireAdmin();

  const validatedFields = TituloFormSchema.safeParse({
    nombre: formData.get("nombre"),
    orden: formData.get("orden"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: valoresEnviados(formData),
    };
  }

  await prisma.titulo.create({
    data: { ...validatedFields.data, obraId },
  });

  revalidatePath(pathTitulosItems(obraId));
  redirect(pathTitulosItems(obraId));
}

export async function updateTitulo(
  id: string,
  obraId: string,
  _state: TituloFormState,
  formData: FormData
): Promise<TituloFormState> {
  await requireAdmin();

  const validatedFields = TituloFormSchema.safeParse({
    nombre: formData.get("nombre"),
    orden: formData.get("orden"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: valoresEnviados(formData),
    };
  }

  await prisma.titulo.update({ where: { id }, data: validatedFields.data });

  revalidatePath(pathTitulosItems(obraId));
  redirect(pathTitulosItems(obraId));
}

export async function deleteTitulo(id: string, obraId: string) {
  await requireAdmin();
  await prisma.titulo.delete({ where: { id } });
  revalidatePath(pathTitulosItems(obraId));
}
