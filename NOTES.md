# Notas de progreso — Kembron Prueba Técnica

## Día 1 — Hecho

- Proyecto Next.js inicializado con TypeScript, Tailwind CSS y App Router (`src/`, alias `@/*`).
- Prisma instalado y configurado (`prisma.config.ts`, requiere `dotenv` como dev dependency para cargar `.env`).
- `prisma/schema.prisma` creado con las 10 entidades del modelo de datos (Usuario, Obra, AsignacionObraSupervisor, Unidad, Titulo, Item, AdicionalDeductivo, Gasto, ProgramacionSemanal, RegistroAvance) y sus relaciones:
  - IDs: `String @id @default(cuid())` en todos los modelos.
  - `onDelete: Cascade` en la jerarquía Obra → Titulo → Item → (AdicionalDeductivo / Gasto / ProgramacionSemanal / RegistroAvance) y en AsignacionObraSupervisor.
  - `onDelete: Restrict` en las FK hacia Usuario (Gasto, RegistroAvance) y hacia Unidad (Item), para preservar integridad/historial.
  - Campos monetarios y de cantidad como `Decimal @db.Decimal(18, 4)`.
  - Constraints extra agregadas (no pedidas explícitamente, aprobadas): `@@unique([usuarioId, obraId])` en AsignacionObraSupervisor y `@@unique([itemId, numeroSemana])` en ProgramacionSemanal.
- Base de datos PostgreSQL creada en Neon (`neondb`, región `sa-east-1`).
- Migración inicial aplicada con éxito: `prisma/migrations/20260623005620_init`. Las 10 tablas existen en Neon y `prisma migrate status` confirma el schema sincronizado.
- Repo git inicializado con `.gitignore` apropiado (excluye `node_modules`, `.env*`, `.next`, `/src/generated/prisma`).
- Commit checkpoint hecho: `checkpoint: setup inicial + schema Prisma + migración a Neon funcionando`.

## Día 2 — Sigue

- Autenticación con login usuario + contraseña.
- Hash de password con bcrypt.
- CRUD de Usuarios.
- CRUD de Obras.

## Datos importantes para recordar

- **Problema de conectividad IPv6 con Neon**: en esta máquina, la resolución DNS del host de Neon devuelve registros IPv6 que no son enrutables en esta red. El binario nativo de Prisma para migraciones (`schema-engine`) intenta conectar por IPv6 primero, agota el timeout, y nunca llega a probar la IPv4 que sí funciona (`NODE_OPTIONS=--dns-result-order=ipv4first` no soluciona esto porque ese binario no lo respeta, al no ser un proceso Node).
- **Workaround aplicado**: se agregó una línea al hosts file de Windows (`C:\Windows\System32\drivers\etc\hosts`, requiere permisos de administrador) fijando la IP v4 del endpoint de Neon:

  ```
  18.230.255.48 ep-silent-block-ach5nlvw.sa-east-1.aws.neon.tech # added by Claude Code - force IPv4 for Neon (Kembron prueba tecnica)
  ```

- **Si se repite en otra sesión o en otra máquina** (o si el endpoint de Neon cambia de IP) y vuelve a aparecer el error `P1001: Can't reach database server`, hay que repetir este workaround: resolver la IP v4 actual del host (`nslookup <host>` y tomar una dirección IPv4) y agregar una línea equivalente al hosts file.
- El `.env` con `DATABASE_URL` (connection string de Neon) NO está en el repo (está en `.gitignore`); si se clona el proyecto en otra máquina, hay que volver a crear el `.env` a mano con la connection string real.
