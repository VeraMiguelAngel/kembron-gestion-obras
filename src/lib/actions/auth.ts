"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { LoginFormSchema, type LoginFormState } from "@/lib/definitions";

// Hash de un password arbitrario, usado cuando el email no existe para que
// bcrypt.compare tarde lo mismo que con un usuario real (evita timing attacks).
const DUMMY_HASH = bcrypt.hashSync("dummy-password-no-existe", 10);

export async function login(
  _state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;

  const usuario = await prisma.usuario.findUnique({ where: { email } });

  // Se compara siempre contra un hash (real o "dummy") para no filtrar
  // por tiempo de respuesta si el email existe o no.
  const passwordValida = await bcrypt.compare(
    password,
    usuario?.password ?? DUMMY_HASH
  );

  if (!usuario || !passwordValida) {
    return { message: "Email o contraseña incorrectos." };
  }

  await createSession(usuario.id, usuario.rol);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
