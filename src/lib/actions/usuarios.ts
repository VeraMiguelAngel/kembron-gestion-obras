"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import {
  CreateUsuarioSchema,
  UpdateUsuarioSchema,
  type UsuarioFormState,
} from "@/lib/definitions";
import { Prisma } from "@/generated/prisma/client";

function valoresEnviados(formData: FormData) {
  return {
    nombre: String(formData.get("nombre") ?? ""),
    email: String(formData.get("email") ?? ""),
    rol: String(formData.get("rol") ?? ""),
  };
}

export async function createUsuario(
  _state: UsuarioFormState,
  formData: FormData
): Promise<UsuarioFormState> {
  await requireAdmin();

  const validatedFields = CreateUsuarioSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
    rol: formData.get("rol"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: valoresEnviados(formData),
    };
  }

  const { nombre, email, password, rol } = validatedFields.data;

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    return {
      errors: { email: ["Ya existe un usuario con ese email."] },
      values: valoresEnviados(formData),
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.usuario.create({
    data: { nombre, email, password: hashedPassword, rol },
  });

  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function updateUsuario(
  id: string,
  _state: UsuarioFormState,
  formData: FormData
): Promise<UsuarioFormState> {
  await requireAdmin();

  const validatedFields = UpdateUsuarioSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    rol: formData.get("rol"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: valoresEnviados(formData),
    };
  }

  const { nombre, email, rol, password } = validatedFields.data;

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente && existente.id !== id) {
    return {
      errors: { email: ["Ya existe otro usuario con ese email."] },
      values: valoresEnviados(formData),
    };
  }

  await prisma.usuario.update({
    where: { id },
    data: {
      nombre,
      email,
      rol,
      ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
    },
  });

  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function deleteUsuario(id: string) {
  const session = await requireAdmin();

  if (session.userId === id) {
    throw new Error("No podés eliminar tu propio usuario.");
  }

  try {
    await prisma.usuario.delete({ where: { id } });
  } catch (error) {
    if (isForeignKeyRestrictError(error)) {
      throw new Error(
        "No se puede eliminar: el usuario tiene gastos o avances registrados."
      );
    }
    throw error;
  }

  revalidatePath("/usuarios");
}

// Con el generador `prisma-client` + driver adapters (@prisma/adapter-pg), los
// errores de la base llegan envueltos en `DriverAdapterError`, no en el
// `PrismaClientKnownRequestError`/código P2003 "clásico". El adapter no mapea
// el SQLSTATE de restricción ON DELETE RESTRICT (23001, "restrict_violation")
// a un `kind` propio: llega como `cause.kind === "postgres"` con ese código.
// Se chequean ambas formas (la "clásica" y la del driver adapter) por las dudas.
const FOREIGN_KEY_SQLSTATE_CODES = new Set(["23001", "23503"]);

function isForeignKeyRestrictError(error: unknown): boolean {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  ) {
    return true;
  }

  if (!(error instanceof Error) || error.name !== "DriverAdapterError") {
    return false;
  }

  const cause = (error as { cause?: { kind?: string; code?: string } }).cause;
  return (
    cause?.kind === "ForeignKeyConstraintViolation" ||
    (cause?.kind === "postgres" &&
      !!cause.code &&
      FOREIGN_KEY_SQLSTATE_CODES.has(cause.code))
  );
}
