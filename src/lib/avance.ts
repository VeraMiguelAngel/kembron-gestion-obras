import { Prisma } from "@/generated/prisma/client";

type ItemConAvance = {
  cantidad: Prisma.Decimal;
  registrosAvance: { cantidad: Prisma.Decimal }[];
};

export function cantidadAvanzadaItem(item: ItemConAvance): Prisma.Decimal {
  return item.registrosAvance.reduce(
    (acumulado, registro) => acumulado.plus(registro.cantidad),
    new Prisma.Decimal(0)
  );
}

export function porcentajeAvanceItem(item: ItemConAvance): Prisma.Decimal {
  if (item.cantidad.isZero()) {
    return new Prisma.Decimal(0);
  }
  const porcentaje = cantidadAvanzadaItem(item)
    .dividedBy(item.cantidad)
    .times(100);
  return porcentaje.greaterThan(100) ? new Prisma.Decimal(100) : porcentaje;
}

export function porcentajeAvancePromedio(
  porcentajes: Prisma.Decimal[]
): Prisma.Decimal {
  if (porcentajes.length === 0) {
    return new Prisma.Decimal(0);
  }
  const suma = porcentajes.reduce(
    (acumulado, porcentaje) => acumulado.plus(porcentaje),
    new Prisma.Decimal(0)
  );
  return suma.dividedBy(porcentajes.length);
}

export function porcentajeAvanceObra(
  titulos: { items: ItemConAvance[] }[]
): Prisma.Decimal {
  return porcentajeAvancePromedio(
    titulos.flatMap((titulo) => titulo.items.map(porcentajeAvanceItem))
  );
}
