"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { Prisma } from "@/generated/prisma/client";
import {
  ProgramacionSemanalFormSchema,
  type ProgramacionSemanalFormState,
} from "@/lib/definitions";

export async function setProgramacionSemanal(
  itemId: string,
  numeroSemana: number,
  obraId: string,
  _state: ProgramacionSemanalFormState,
  formData: FormData
): Promise<ProgramacionSemanalFormState> {
  await requireAdmin();

  const validatedFields = ProgramacionSemanalFormSchema.safeParse({
    cantidadProgramada: formData.get("cantidadProgramada"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: {
        cantidadProgramada: String(formData.get("cantidadProgramada") ?? ""),
      },
    };
  }

  const item = await prisma.item.findFirst({
    where: { id: itemId, titulo: { obraId } },
    select: {
      cantidad: true,
      programaciones: {
        where: { numeroSemana: { not: numeroSemana } },
        select: { cantidadProgramada: true },
      },
    },
  });

  if (!item) {
    return {
      errors: { cantidadProgramada: ["El ítem no es válido."] },
      values: {
        cantidadProgramada: String(formData.get("cantidadProgramada") ?? ""),
      },
    };
  }

  const nuevaCantidad = new Prisma.Decimal(validatedFields.data.cantidadProgramada);
  const programadoOtrasSemanas = item.programaciones.reduce(
    (acumulado, p) => acumulado.plus(p.cantidadProgramada),
    new Prisma.Decimal(0)
  );
  const totalProgramado = programadoOtrasSemanas.plus(nuevaCantidad);

  if (totalProgramado.greaterThan(item.cantidad)) {
    return {
      errors: {
        cantidadProgramada: [
          "La suma programada de todas las semanas no puede superar la cantidad del ítem.",
        ],
      },
      values: {
        cantidadProgramada: String(formData.get("cantidadProgramada") ?? ""),
      },
    };
  }

  if (nuevaCantidad.isZero()) {
    await prisma.programacionSemanal.deleteMany({
      where: { itemId, numeroSemana },
    });
  } else {
    await prisma.programacionSemanal.upsert({
      where: { itemId_numeroSemana: { itemId, numeroSemana } },
      create: { itemId, numeroSemana, cantidadProgramada: nuevaCantidad },
      update: { cantidadProgramada: nuevaCantidad },
    });
  }

  revalidatePath(`/obras/${obraId}/avance/programacion-semanal`);
  return { values: { cantidadProgramada: nuevaCantidad.toString() } };
}
