"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import {
  AdicionalDeductivoFormSchema,
  type AdicionalDeductivoFormState,
} from "@/lib/definitions";

function valoresEnviados(formData: FormData) {
  return {
    tipo: String(formData.get("tipo") ?? ""),
    nombre: String(formData.get("nombre") ?? ""),
    itemId: String(formData.get("itemId") ?? ""),
    monto: String(formData.get("monto") ?? ""),
  };
}

function revalidatePresupuesto(obraId: string) {
  revalidatePath(`/obras/${obraId}/presupuesto/titulos-items`);
  revalidatePath(`/obras/${obraId}/presupuesto/adicionales-deductivos`);
}

function pathAdicionalesDeductivos(obraId: string) {
  return `/obras/${obraId}/presupuesto/adicionales-deductivos`;
}

export async function createAdicionalDeductivo(
  obraId: string,
  _state: AdicionalDeductivoFormState,
  formData: FormData
): Promise<AdicionalDeductivoFormState> {
  await requireAdmin();

  const validatedFields = AdicionalDeductivoFormSchema.safeParse({
    tipo: formData.get("tipo"),
    nombre: formData.get("nombre"),
    itemId: formData.get("itemId"),
    monto: formData.get("monto"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: valoresEnviados(formData),
    };
  }

  // El ítem debe pertenecer a esta obra: no confiar en lo que mande el form.
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

  await prisma.adicionalDeductivo.create({ data: validatedFields.data });

  revalidatePresupuesto(obraId);
  redirect(pathAdicionalesDeductivos(obraId));
}

export async function updateAdicionalDeductivo(
  id: string,
  obraId: string,
  _state: AdicionalDeductivoFormState,
  formData: FormData
): Promise<AdicionalDeductivoFormState> {
  await requireAdmin();

  const validatedFields = AdicionalDeductivoFormSchema.safeParse({
    tipo: formData.get("tipo"),
    nombre: formData.get("nombre"),
    itemId: formData.get("itemId"),
    monto: formData.get("monto"),
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

  await prisma.adicionalDeductivo.update({
    where: { id },
    data: validatedFields.data,
  });

  revalidatePresupuesto(obraId);
  redirect(pathAdicionalesDeductivos(obraId));
}

export async function deleteAdicionalDeductivo(id: string, obraId: string) {
  await requireAdmin();
  await prisma.adicionalDeductivo.delete({ where: { id } });
  revalidatePresupuesto(obraId);
}
