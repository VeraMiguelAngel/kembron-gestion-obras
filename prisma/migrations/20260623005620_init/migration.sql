-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "EstadoObra" AS ENUM ('EN_EJECUCION', 'FINALIZADA', 'PAUSADA');

-- CreateEnum
CREATE TYPE "TipoAdicionalDeductivo" AS ENUM ('ADICIONAL', 'DEDUCTIVO');

-- CreateEnum
CREATE TYPE "CategoriaGasto" AS ENUM ('MANO_DE_OBRA', 'MATERIAL', 'EQUIPO', 'SUBCONTRATO', 'OTROS');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Obra" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "estado" "EstadoObra" NOT NULL DEFAULT 'EN_EJECUCION',
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFinTeorica" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Obra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsignacionObraSupervisor" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AsignacionObraSupervisor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unidad" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Unidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Titulo" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Titulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "tituloId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cantidad" DECIMAL(18,4) NOT NULL,
    "unidadId" TEXT NOT NULL,
    "valorUnitario" DECIMAL(18,4) NOT NULL,
    "orden" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdicionalDeductivo" (
    "id" TEXT NOT NULL,
    "tipo" "TipoAdicionalDeductivo" NOT NULL,
    "nombre" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "monto" DECIMAL(18,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdicionalDeductivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gasto" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" "CategoriaGasto" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "monto" DECIMAL(18,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramacionSemanal" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "numeroSemana" INTEGER NOT NULL,
    "cantidadProgramada" DECIMAL(18,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgramacionSemanal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroAvance" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "cantidad" DECIMAL(18,4) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroAvance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AsignacionObraSupervisor_usuarioId_obraId_key" ON "AsignacionObraSupervisor"("usuarioId", "obraId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramacionSemanal_itemId_numeroSemana_key" ON "ProgramacionSemanal"("itemId", "numeroSemana");

-- AddForeignKey
ALTER TABLE "AsignacionObraSupervisor" ADD CONSTRAINT "AsignacionObraSupervisor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionObraSupervisor" ADD CONSTRAINT "AsignacionObraSupervisor_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Titulo" ADD CONSTRAINT "Titulo_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_tituloId_fkey" FOREIGN KEY ("tituloId") REFERENCES "Titulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "Unidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdicionalDeductivo" ADD CONSTRAINT "AdicionalDeductivo_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramacionSemanal" ADD CONSTRAINT "ProgramacionSemanal_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAvance" ADD CONSTRAINT "RegistroAvance_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAvance" ADD CONSTRAINT "RegistroAvance_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
