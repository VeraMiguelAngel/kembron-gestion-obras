import * as z from "zod";
import {
  CategoriaGasto,
  EstadoObra,
  RolUsuario,
  TipoAdicionalDeductivo,
} from "@/generated/prisma/client";

export const LoginFormSchema = z.object({
  email: z.email({ error: "Ingresá un email válido." }).trim(),
  password: z
    .string()
    .min(1, { error: "La contraseña es obligatoria." })
    .trim(),
});

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

const nombreField = z
  .string()
  .min(2, { error: "El nombre debe tener al menos 2 caracteres." })
  .trim();

const emailField = z.email({ error: "Ingresá un email válido." }).trim();

const rolField = z.enum(Object.values(RolUsuario) as [string, ...string[]], {
  error: "Seleccioná un rol válido.",
});

const passwordField = z
  .string()
  .min(8, { error: "Debe tener al menos 8 caracteres." })
  .regex(/[a-zA-Z]/, { error: "Debe contener al menos una letra." })
  .regex(/[0-9]/, { error: "Debe contener al menos un número." });

export const CreateUsuarioSchema = z.object({
  nombre: nombreField,
  email: emailField,
  password: passwordField,
  rol: rolField,
});

export const UpdateUsuarioSchema = z.object({
  nombre: nombreField,
  email: emailField,
  rol: rolField,
  password: z.union([passwordField, z.literal("")]),
});

export type UsuarioFormState =
  | {
      errors?: {
        nombre?: string[];
        email?: string[];
        password?: string[];
        rol?: string[];
      };
      message?: string;
      // Valores enviados (sin password) para repoblar el form tras un error.
      // React resetea los inputs no controlados luego de cada Server Action,
      // así que hay que devolverlos explícitamente como nuevo defaultValue.
      values?: { nombre?: string; email?: string; rol?: string };
    }
  | undefined;

const estadoObraField = z.enum(Object.values(EstadoObra) as [string, ...string[]], {
  error: "Seleccioná un estado válido.",
});

export const ObraFormSchema = z
  .object({
    nombre: z
      .string()
      .min(2, { error: "El nombre debe tener al menos 2 caracteres." })
      .trim(),
    ubicacion: z
      .string()
      .min(2, { error: "La ubicación debe tener al menos 2 caracteres." })
      .trim(),
    cliente: z
      .string()
      .min(2, { error: "El cliente debe tener al menos 2 caracteres." })
      .trim(),
    estado: estadoObraField,
    fechaInicio: z.coerce.date({ error: "Ingresá una fecha de inicio válida." }),
    fechaFinTeorica: z.coerce.date({
      error: "Ingresá una fecha de fin teórica válida.",
    }),
  })
  .refine((data) => data.fechaFinTeorica >= data.fechaInicio, {
    error: "La fecha de fin teórica no puede ser anterior a la de inicio.",
    path: ["fechaFinTeorica"],
  });

export type ObraFormState =
  | {
      errors?: {
        nombre?: string[];
        ubicacion?: string[];
        cliente?: string[];
        estado?: string[];
        fechaInicio?: string[];
        fechaFinTeorica?: string[];
      };
      message?: string;
      // Valores enviados para repoblar el form tras un error (ver nota en UsuarioFormState).
      values?: {
        nombre?: string;
        ubicacion?: string;
        cliente?: string;
        estado?: string;
        fechaInicio?: string;
        fechaFinTeorica?: string;
        supervisorIds?: string[];
      };
    }
  | undefined;

const ordenField = z.coerce
  .number({ error: "Ingresá un orden válido." })
  .int({ error: "El orden debe ser un número entero." })
  .min(1, { error: "El orden debe ser mayor a 0." });

export const TituloFormSchema = z.object({
  nombre: z
    .string()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres." })
    .trim(),
  orden: ordenField,
});

export type TituloFormState =
  | {
      errors?: { nombre?: string[]; orden?: string[] };
      message?: string;
      values?: { nombre?: string; orden?: string };
    }
  | undefined;

export const ItemFormSchema = z.object({
  nombre: z
    .string()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres." })
    .trim(),
  cantidad: z.coerce
    .number({ error: "Ingresá una cantidad válida." })
    .positive({ error: "La cantidad debe ser mayor a 0." }),
  unidadId: z.string().min(1, { error: "Seleccioná una unidad." }),
  valorUnitario: z.coerce
    .number({ error: "Ingresá un valor unitario válido." })
    .nonnegative({ error: "El valor unitario no puede ser negativo." }),
  orden: ordenField,
});

export type ItemFormState =
  | {
      errors?: {
        nombre?: string[];
        cantidad?: string[];
        unidadId?: string[];
        valorUnitario?: string[];
        orden?: string[];
      };
      message?: string;
      values?: {
        nombre?: string;
        cantidad?: string;
        unidadId?: string;
        valorUnitario?: string;
        orden?: string;
      };
    }
  | undefined;

export const AdicionalDeductivoFormSchema = z.object({
  tipo: z.enum(Object.values(TipoAdicionalDeductivo) as [string, ...string[]], {
    error: "Seleccioná un tipo válido.",
  }),
  nombre: z
    .string()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres." })
    .trim(),
  itemId: z.string().min(1, { error: "Seleccioná un ítem." }),
  monto: z.coerce
    .number({ error: "Ingresá un monto válido." })
    .positive({ error: "El monto debe ser mayor a 0." }),
});

export type AdicionalDeductivoFormState =
  | {
      errors?: {
        tipo?: string[];
        nombre?: string[];
        itemId?: string[];
        monto?: string[];
      };
      message?: string;
      values?: {
        tipo?: string;
        nombre?: string;
        itemId?: string;
        monto?: string;
      };
    }
  | undefined;

export const GastoFormSchema = z.object({
  descripcion: z
    .string()
    .min(2, { error: "La descripción debe tener al menos 2 caracteres." })
    .trim(),
  categoria: z.enum(Object.values(CategoriaGasto) as [string, ...string[]], {
    error: "Seleccioná una categoría válida.",
  }),
  fecha: z.coerce.date({ error: "Ingresá una fecha válida." }),
  monto: z.coerce
    .number({ error: "Ingresá un monto válido." })
    .positive({ error: "El monto debe ser mayor a 0." }),
  itemId: z.string().min(1, { error: "Seleccioná un ítem." }),
});

export const ProgramacionSemanalFormSchema = z.object({
  cantidadProgramada: z.coerce
    .number({ error: "Ingresá una cantidad válida." })
    .nonnegative({ error: "La cantidad no puede ser negativa." }),
});

export type ProgramacionSemanalFormState =
  | {
      errors?: { cantidadProgramada?: string[] };
      message?: string;
      values?: { cantidadProgramada?: string };
    }
  | undefined;

export type GastoFormState =
  | {
      errors?: {
        descripcion?: string[];
        categoria?: string[];
        fecha?: string[];
        monto?: string[];
        itemId?: string[];
      };
      message?: string;
      values?: {
        descripcion?: string;
        categoria?: string;
        fecha?: string;
        monto?: string;
        itemId?: string;
      };
    }
  | undefined;

export const RegistroAvanceFormSchema = z.object({
  cantidad: z.coerce
    .number({ error: "Ingresá una cantidad válida." })
    .positive({ error: "La cantidad debe ser mayor a 0." }),
  fecha: z.coerce.date({ error: "Ingresá una fecha válida." }),
  itemId: z.string().min(1, { error: "Seleccioná un ítem." }),
});

export type RegistroAvanceFormState =
  | {
      errors?: {
        cantidad?: string[];
        fecha?: string[];
        itemId?: string[];
      };
      message?: string;
      values?: {
        cantidad?: string;
        fecha?: string;
        itemId?: string;
      };
    }
  | undefined;
