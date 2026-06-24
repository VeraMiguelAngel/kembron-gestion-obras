import "server-only";

import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import type { RolUsuario } from "@/generated/prisma/client";

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error("Falta la variable de entorno SESSION_SECRET");
}
const encodedKey = new TextEncoder().encode(secretKey);

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const COOKIE_NAME = "session";

export type SessionPayload = {
  userId: string;
  rol: RolUsuario;
  expiresAt: Date;
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ ...payload, expiresAt: payload.expiresAt.toISOString() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as { userId: string; rol: RolUsuario; expiresAt: string };
  } catch {
    return null;
  }
}

export async function createSession(userId: string, rol: RolUsuario) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const session = await encrypt({ userId, rol, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
