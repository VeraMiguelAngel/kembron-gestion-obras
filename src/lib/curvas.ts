import { Prisma } from "@/generated/prisma/client";
import { type SemanaObra, semanaDeFechaClamped } from "./programacion";

type ProgramacionPunto = {
  numeroSemana: number;
  cantidadProgramada: Prisma.Decimal;
};

type ItemConProgramacion = {
  programaciones: ProgramacionPunto[];
};

type ItemConProgramacionYValor = ItemConProgramacion & {
  valorUnitario: Prisma.Decimal;
};

function nuevaSerie(totalSemanas: number): Prisma.Decimal[] {
  return Array.from({ length: totalSemanas }, () => new Prisma.Decimal(0));
}

function acumular(serie: Prisma.Decimal[]): Prisma.Decimal[] {
  const acumulada: Prisma.Decimal[] = [];
  let corriendo = new Prisma.Decimal(0);
  for (const valor of serie) {
    corriendo = corriendo.plus(valor);
    acumulada.push(corriendo);
  }
  return acumulada;
}

export function curvaFisicaPlanificada(
  items: ItemConProgramacion[],
  totalSemanas: number
): Prisma.Decimal[] {
  const porSemana = nuevaSerie(totalSemanas);
  for (const item of items) {
    for (const punto of item.programaciones) {
      const indice = punto.numeroSemana - 1;
      if (indice >= 0 && indice < totalSemanas) {
        porSemana[indice] = porSemana[indice].plus(punto.cantidadProgramada);
      }
    }
  }
  return acumular(porSemana);
}

export function curvaFinancieraPlanificada(
  items: ItemConProgramacionYValor[],
  totalSemanas: number
): Prisma.Decimal[] {
  const porSemana = nuevaSerie(totalSemanas);
  for (const item of items) {
    for (const punto of item.programaciones) {
      const indice = punto.numeroSemana - 1;
      if (indice >= 0 && indice < totalSemanas) {
        porSemana[indice] = porSemana[indice].plus(
          punto.cantidadProgramada.times(item.valorUnitario)
        );
      }
    }
  }
  return acumular(porSemana);
}

export function curvaFisicaReal(
  registros: { cantidad: Prisma.Decimal; fecha: Date }[],
  semanas: SemanaObra[]
): Prisma.Decimal[] {
  const porSemana = nuevaSerie(semanas.length);
  for (const registro of registros) {
    const numeroSemana = semanaDeFechaClamped(semanas, registro.fecha);
    porSemana[numeroSemana - 1] = porSemana[numeroSemana - 1].plus(
      registro.cantidad
    );
  }
  return acumular(porSemana);
}

export function curvaFinancieraReal(
  gastos: { monto: Prisma.Decimal; fecha: Date }[],
  semanas: SemanaObra[]
): Prisma.Decimal[] {
  const porSemana = nuevaSerie(semanas.length);
  for (const gasto of gastos) {
    const numeroSemana = semanaDeFechaClamped(semanas, gasto.fecha);
    porSemana[numeroSemana - 1] = porSemana[numeroSemana - 1].plus(gasto.monto);
  }
  return acumular(porSemana);
}
