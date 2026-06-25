# Kembron — Gestión de Obras

Aplicación web para el seguimiento de obras de construcción: presupuesto (ítems, adicionales/deductivos, gastos), programación semanal y avance real, con un dashboard para administradores y una vista mobile para supervisores de obra.

## Demo en vivo

https://kembron-gestion-obras.vercel.app/

## Stack tecnológico

- [Next.js](https://nextjs.org) 16 (App Router, Server Actions)
- React 19, TypeScript
- [Prisma](https://www.prisma.io) 7 (`prisma-client` + `@prisma/adapter-pg`) sobre PostgreSQL ([Neon](https://neon.tech))
- Tailwind CSS 4
- Autenticación con sesión en cookie httpOnly firmada (JWT vía [`jose`](https://github.com/panva/jose)) y contraseñas hasheadas con `bcryptjs`
- Validación de formularios con [Zod](https://zod.dev)

## Correr en local

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear un archivo `.env` en la raíz con las siguientes variables:

   | Variable | Descripción |
   |---|---|
   | `DATABASE_URL` | Connection string de PostgreSQL (en este proyecto se usa una base de Neon). |
   | `SESSION_SECRET` | Clave secreta para firmar las cookies de sesión (JWT). Puede generarse con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |

3. Aplicar las migraciones:

   ```bash
   npx prisma migrate deploy
   ```

4. Cargar datos de ejemplo:

   ```bash
   npm run seed
   ```

5. Levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   La app queda disponible en [http://localhost:3000](http://localhost:3000).

## Credenciales de prueba

Creadas por `npm run seed`:

| Email | Password | Rol |
|---|---|---|
| `admin@kembron.com` | `Admin123!` | ADMIN |
| `juan@kembron.com` | `Juan1234` | SUPERVISOR |
| `laura@kembron.com` | `Laura1234` | SUPERVISOR |

## Roles

- **ADMIN**: acceso completo. Gestiona usuarios y obras, define presupuesto (títulos, ítems, adicionales/deductivos), programación semanal, gastos y registros de avance de cualquier obra, y ve el dashboard global con métricas y curvas de todas las obras.
- **SUPERVISOR**: ve únicamente las obras que tiene asignadas (vista mobile, "Mis obras"). Puede cargar gastos y registros de avance sobre esas obras, pero no editarlos ni eliminarlos, ni acceder a obras ajenas o a las secciones de administración.

## Troubleshooting

**Error `P1001: Can't reach database server` con Neon en Windows**: en algunas redes, la resolución DNS del host de Neon devuelve un registro IPv6 no enrutable, y las herramientas de Prisma (migraciones, etc.) intentan conectar por IPv6 antes de probar IPv4, agotando el timeout. Si aparece este error, una solución es fijar la IP v4 del endpoint en el hosts file de Windows (`C:\Windows\System32\drivers\etc\hosts`, requiere permisos de administrador):

```
<IP_v4_del_endpoint> <host_de_neon_de_tu_DATABASE_URL>
```

La IP v4 actual se puede obtener con `nslookup <host>`. Este workaround solo es necesario si aparece ese error puntual — no es un requisito general para correr el proyecto.
