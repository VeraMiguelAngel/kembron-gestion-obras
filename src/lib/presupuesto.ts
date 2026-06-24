import { Prisma } from "@/generated/prisma/client";

type ItemConMontos = {
  cantidad: Prisma.Decimal;
  valorUnitario: Prisma.Decimal;
};

type AdicionalDeductivoConMonto = {
  tipo: "ADICIONAL" | "DEDUCTIVO";
  monto: Prisma.Decimal;
};

type ItemConAjustes = ItemConMontos & {
  adicionalesDeductivos: AdicionalDeductivoConMonto[];
};

type GastoConMonto = {
  monto: Prisma.Decimal;
};

type ItemConGastos = {
  gastos: GastoConMonto[];
};

export function presupuestoItem(item: ItemConMontos): Prisma.Decimal {
  return item.cantidad.times(item.valorUnitario);
}

export function presupuestoTitulo(items: ItemConMontos[]): Prisma.Decimal {
  return items.reduce(
    (acumulado, item) => acumulado.plus(presupuestoItem(item)),
    new Prisma.Decimal(0)
  );
}

export function ajustePorAdicionalesDeductivos(
  adicionalesDeductivos: AdicionalDeductivoConMonto[]
): Prisma.Decimal {
  return adicionalesDeductivos.reduce(
    (acumulado, ad) =>
      ad.tipo === "ADICIONAL"
        ? acumulado.plus(ad.monto)
        : acumulado.minus(ad.monto),
    new Prisma.Decimal(0)
  );
}

export function presupuestoRealItem(item: ItemConAjustes): Prisma.Decimal {
  return presupuestoItem(item).plus(
    ajustePorAdicionalesDeductivos(item.adicionalesDeductivos)
  );
}

export function presupuestoRealTitulo(items: ItemConAjustes[]): Prisma.Decimal {
  return items.reduce(
    (acumulado, item) => acumulado.plus(presupuestoRealItem(item)),
    new Prisma.Decimal(0)
  );
}

export function ejecutadoItem(item: ItemConGastos): Prisma.Decimal {
  return item.gastos.reduce(
    (acumulado, gasto) => acumulado.plus(gasto.monto),
    new Prisma.Decimal(0)
  );
}

export function ejecutadoTitulo(items: ItemConGastos[]): Prisma.Decimal {
  return items.reduce(
    (acumulado, item) => acumulado.plus(ejecutadoItem(item)),
    new Prisma.Decimal(0)
  );
}

export function presupuestoRealObra(
  titulos: { items: ItemConAjustes[] }[]
): Prisma.Decimal {
  return titulos.reduce(
    (acumulado, titulo) => acumulado.plus(presupuestoRealTitulo(titulo.items)),
    new Prisma.Decimal(0)
  );
}

export function ejecutadoObra(
  titulos: { items: ItemConGastos[] }[]
): Prisma.Decimal {
  return titulos.reduce(
    (acumulado, titulo) => acumulado.plus(ejecutadoTitulo(titulo.items)),
    new Prisma.Decimal(0)
  );
}

export function formatNumero(valor: Prisma.Decimal | number | string): string {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(valor));
}
