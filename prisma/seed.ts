import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Prisma, CategoriaGasto } from "@/generated/prisma/client";
import { calcularSemanasObra, semanaActual } from "@/lib/programacion";

const MS_DIA = 24 * 60 * 60 * 1000;
const UNIDADES = ["m2", "m3", "m", "ml", "kg", "ton", "un", "gl", "hh", "hm"];

function utc(fecha: Date): Date {
  return new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
}

function sumarDias(fecha: Date, dias: number): Date {
  return new Date(fecha.getTime() + dias * MS_DIA);
}

// Reparte una cantidad total en `n` semanas siguiendo una curva de campana
// (poco trabajo al inicio y al final, pico en el medio) en vez de partes
// iguales, para que las curvas de avance de la demo no salgan como una recta.
function distribuirEnCampana(total: number, n: number): number[] {
  const pesos = Array.from({ length: n }, (_, i) => Math.sin((Math.PI * (i + 1)) / (n + 1)));
  const sumaPesos = pesos.reduce((a, b) => a + b, 0);
  const valores = pesos.map((peso) => Math.round(((total * peso) / sumaPesos) * 100) / 100);
  const sumaParcial = valores.slice(0, -1).reduce((a, b) => a + b, 0);
  valores[n - 1] = Math.round((total - sumaParcial) * 100) / 100;
  return valores;
}

const CATEGORIAS_GASTO: CategoriaGasto[] = [
  CategoriaGasto.MANO_DE_OBRA,
  CategoriaGasto.MATERIAL,
  CategoriaGasto.EQUIPO,
  CategoriaGasto.SUBCONTRATO,
  CategoriaGasto.OTROS,
];

const DESCRIPCION_GASTO: Record<CategoriaGasto, string> = {
  MANO_DE_OBRA: "Cuadrilla de oficiales y ayudantes",
  MATERIAL: "Compra de insumos para el ítem",
  EQUIPO: "Alquiler de equipo para la tarea",
  SUBCONTRATO: "Trabajo de subcontratista especializado",
  OTROS: "Gasto operativo asociado al ítem",
};

async function seedUnidades(): Promise<Map<string, string>> {
  const mapa = new Map<string, string>();
  for (const nombre of UNIDADES) {
    const existente = await prisma.unidad.findFirst({ where: { nombre } });
    const unidad = existente ?? (await prisma.unidad.create({ data: { nombre } }));
    mapa.set(nombre, unidad.id);
  }
  return mapa;
}

async function seedUsuarios() {
  const hash = (password: string) => bcrypt.hash(password, 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@kembron.com" },
    update: { nombre: "Administrador", password: await hash("Admin123!"), rol: "ADMIN" },
    create: {
      nombre: "Administrador",
      email: "admin@kembron.com",
      password: await hash("Admin123!"),
      rol: "ADMIN",
    },
  });

  const juan = await prisma.usuario.upsert({
    where: { email: "juan@kembron.com" },
    update: { nombre: "Juan Supervisor", password: await hash("Juan1234"), rol: "SUPERVISOR" },
    create: {
      nombre: "Juan Supervisor",
      email: "juan@kembron.com",
      password: await hash("Juan1234"),
      rol: "SUPERVISOR",
    },
  });

  const laura = await prisma.usuario.upsert({
    where: { email: "laura@kembron.com" },
    update: { nombre: "Laura Gómez", password: await hash("Laura1234"), rol: "SUPERVISOR" },
    create: {
      nombre: "Laura Gómez",
      email: "laura@kembron.com",
      password: await hash("Laura1234"),
      rol: "SUPERVISOR",
    },
  });

  return { admin, juan, laura };
}

type ItemPlan = {
  nombre: string;
  cantidad: number;
  unidad: string;
  valorUnitario: number;
};

type TituloPlan = {
  nombre: string;
  items: ItemPlan[];
};

async function crearObraConPlan(opts: {
  nombre: string;
  ubicacion: string;
  cliente: string;
  estado: "EN_EJECUCION" | "FINALIZADA" | "PAUSADA";
  activa: boolean;
  fechaInicio: Date;
  fechaFinTeorica: Date;
  titulos: TituloPlan[];
  unidadIds: Map<string, string>;
}) {
  // Idempotencia: si ya existe una obra con este nombre de una corrida
  // anterior del seed, se borra (el cascade limpia títulos/ítems/gastos/etc.)
  // y se recrea desde cero, en vez de intentar fusionar datos.
  await prisma.obra.deleteMany({ where: { nombre: opts.nombre } });

  const obra = await prisma.obra.create({
    data: {
      nombre: opts.nombre,
      ubicacion: opts.ubicacion,
      cliente: opts.cliente,
      estado: opts.estado,
      activa: opts.activa,
      fechaInicio: opts.fechaInicio,
      fechaFinTeorica: opts.fechaFinTeorica,
    },
  });

  const items: { id: string; nombre: string; cantidad: number; valorUnitario: number }[] = [];

  for (const [tituloIndex, tituloPlan] of opts.titulos.entries()) {
    const titulo = await prisma.titulo.create({
      data: { obraId: obra.id, nombre: tituloPlan.nombre, orden: tituloIndex + 1 },
    });

    for (const [itemIndex, itemPlan] of tituloPlan.items.entries()) {
      const unidadId = opts.unidadIds.get(itemPlan.unidad);
      if (!unidadId) throw new Error(`Unidad desconocida: ${itemPlan.unidad}`);

      const item = await prisma.item.create({
        data: {
          tituloId: titulo.id,
          nombre: itemPlan.nombre,
          cantidad: new Prisma.Decimal(itemPlan.cantidad),
          unidadId,
          valorUnitario: new Prisma.Decimal(itemPlan.valorUnitario),
          orden: itemIndex + 1,
        },
      });
      items.push({
        id: item.id,
        nombre: item.nombre,
        cantidad: itemPlan.cantidad,
        valorUnitario: itemPlan.valorUnitario,
      });
    }
  }

  return { obra, items };
}

async function main() {
  console.log("Limpiando y recreando datos de seed...");

  const unidadIds = await seedUnidades();
  const { juan, laura } = await seedUsuarios();

  const hoy = utc(new Date());

  // --- Torre Norte: obra activa con datos completos y variados ---
  const inicioTorreNorte = sumarDias(hoy, -11 * 7);
  const finTorreNorte = sumarDias(hoy, 14 * 7);

  const { obra: torreNorte, items: itemsTorreNorte } = await crearObraConPlan({
    nombre: "Torre Norte",
    ubicacion: "Av. Siempre Viva 123",
    cliente: "Constructora ABC S.A.",
    estado: "EN_EJECUCION",
    activa: true,
    fechaInicio: inicioTorreNorte,
    fechaFinTeorica: finTorreNorte,
    unidadIds,
    titulos: [
      {
        nombre: "Movimiento de suelos",
        items: [
          { nombre: "Excavación", cantidad: 500, unidad: "m3", valorUnitario: 1200 },
          { nombre: "Relleno", cantidad: 300, unidad: "m3", valorUnitario: 900 },
        ],
      },
      {
        nombre: "Estructura",
        items: [
          { nombre: "Hormigón armado", cantidad: 200, unidad: "m3", valorUnitario: 25000 },
          { nombre: "Acero de refuerzo", cantidad: 15000, unidad: "kg", valorUnitario: 1800 },
          { nombre: "Encofrado", cantidad: 1200, unidad: "m2", valorUnitario: 3500 },
        ],
      },
      {
        nombre: "Terminaciones",
        items: [
          { nombre: "Revoque", cantidad: 800, unidad: "m2", valorUnitario: 4200 },
          { nombre: "Pintura", cantidad: 800, unidad: "m2", valorUnitario: 2800 },
          { nombre: "Piso cerámico", cantidad: 600, unidad: "m2", valorUnitario: 6500 },
        ],
      },
    ],
  });

  const semanasTorreNorte = calcularSemanasObra(inicioTorreNorte, finTorreNorte);
  const semanaActualTorreNorte = semanaActual(semanasTorreNorte, hoy) ?? 1;
  const semanasProgramadas = Math.min(semanaActualTorreNorte + 2, semanasTorreNorte.length);

  // Factor de desempeño real vs. programado por ítem: algunos van adelantados,
  // otros atrasados, para que las curvas S y las barras de la demo se vean
  // variadas en vez de calcadas al plan.
  const factoresDesempeno = [1.05, 0.8, 1.0, 0.7, 0.95, 1.1, 0.6, 1.2];

  for (const [index, item] of itemsTorreNorte.entries()) {
    const programacion = distribuirEnCampana(item.cantidad, semanasProgramadas);
    const factor = factoresDesempeno[index % factoresDesempeno.length];

    for (let i = 0; i < semanasProgramadas; i++) {
      const numeroSemana = i + 1;
      const cantidadProgramada = programacion[i];

      await prisma.programacionSemanal.create({
        data: {
          itemId: item.id,
          numeroSemana,
          cantidadProgramada: new Prisma.Decimal(cantidadProgramada),
        },
      });

      if (numeroSemana <= semanaActualTorreNorte) {
        const cantidadReal = Math.max(0, Math.round(cantidadProgramada * factor * 100) / 100);
        if (cantidadReal > 0) {
          const semana = semanasTorreNorte[numeroSemana - 1];
          await prisma.registroAvance.create({
            data: {
              itemId: item.id,
              usuarioId: index % 2 === 0 ? juan.id : laura.id,
              cantidad: new Prisma.Decimal(cantidadReal),
              fecha: sumarDias(semana.desde, 3),
            },
          });

          // El gasto real sigue al avance físico pero no en proporción exacta
          // (sobre/sub-costo leve por semana), para que la curva económica no
          // sea una copia lineal de la curva física.
          const variacionCosto = 0.9 + (0.2 * ((index * 7 + numeroSemana * 3) % 5)) / 4;
          const montoGasto = Math.round(cantidadReal * item.valorUnitario * variacionCosto * 100) / 100;
          const categoria = CATEGORIAS_GASTO[(index + numeroSemana) % CATEGORIAS_GASTO.length];
          await prisma.gasto.create({
            data: {
              itemId: item.id,
              usuarioId: index % 2 === 0 ? juan.id : laura.id,
              descripcion: DESCRIPCION_GASTO[categoria],
              categoria,
              fecha: sumarDias(semana.desde, 4),
              monto: new Prisma.Decimal(montoGasto),
            },
          });
        }
      }
    }
  }

  const itemPisoCeramico = itemsTorreNorte.find((i) => i.nombre === "Piso cerámico")!;
  const itemPintura = itemsTorreNorte.find((i) => i.nombre === "Pintura")!;

  await prisma.adicionalDeductivo.create({
    data: {
      tipo: "ADICIONAL",
      nombre: "Cambio de especificación de piso a porcelanato",
      itemId: itemPisoCeramico.id,
      monto: new Prisma.Decimal(180000),
    },
  });

  await prisma.adicionalDeductivo.create({
    data: {
      tipo: "DEDUCTIVO",
      nombre: "Ajuste por menor superficie a pintar",
      itemId: itemPintura.id,
      monto: new Prisma.Decimal(45000),
    },
  });

  // --- Edificio Belgrano: obra activa, más simple ---
  const inicioBelgrano = sumarDias(hoy, -4 * 7);
  const finBelgrano = sumarDias(hoy, 10 * 7);

  const { items: itemsBelgrano } = await crearObraConPlan({
    nombre: "Edificio Belgrano",
    ubicacion: "Av. Belgrano 980",
    cliente: "Inversiones del Plata S.R.L.",
    estado: "EN_EJECUCION",
    activa: true,
    fechaInicio: inicioBelgrano,
    fechaFinTeorica: finBelgrano,
    unidadIds,
    titulos: [
      {
        nombre: "Cimientos",
        items: [
          { nombre: "Excavación de zapatas", cantidad: 120, unidad: "m3", valorUnitario: 1300 },
          { nombre: "Hormigón de fundación", cantidad: 80, unidad: "m3", valorUnitario: 24000 },
        ],
      },
      {
        nombre: "Mampostería",
        items: [{ nombre: "Levante de muros", cantidad: 400, unidad: "m2", valorUnitario: 3800 }],
      },
    ],
  });

  const semanasBelgrano = calcularSemanasObra(inicioBelgrano, finBelgrano);
  const semanaActualBelgrano = semanaActual(semanasBelgrano, hoy) ?? 1;
  const semanasProgramadasBelgrano = Math.min(semanaActualBelgrano + 1, semanasBelgrano.length);

  for (const item of itemsBelgrano) {
    const programacion = distribuirEnCampana(item.cantidad, semanasProgramadasBelgrano);
    for (let i = 0; i < semanasProgramadasBelgrano; i++) {
      const numeroSemana = i + 1;
      await prisma.programacionSemanal.create({
        data: {
          itemId: item.id,
          numeroSemana,
          cantidadProgramada: new Prisma.Decimal(programacion[i]),
        },
      });

      if (numeroSemana <= semanaActualBelgrano) {
        const semana = semanasBelgrano[numeroSemana - 1];
        const cantidadReal = Math.round(programacion[i] * 0.9 * 100) / 100;
        await prisma.registroAvance.create({
          data: {
            itemId: item.id,
            usuarioId: laura.id,
            cantidad: new Prisma.Decimal(cantidadReal),
            fecha: sumarDias(semana.desde, 2),
          },
        });

        const categoria = CATEGORIAS_GASTO[numeroSemana % CATEGORIAS_GASTO.length];
        const montoGasto = Math.round(cantidadReal * item.valorUnitario * 0.95 * 100) / 100;
        await prisma.gasto.create({
          data: {
            itemId: item.id,
            usuarioId: laura.id,
            descripcion: DESCRIPCION_GASTO[categoria],
            categoria,
            fecha: sumarDias(semana.desde, 3),
            monto: new Prisma.Decimal(montoGasto),
          },
        });
      }
    }
  }

  // --- Planta Industrial Sur: obra desactivada, datos mínimos ---
  const inicioPlanta = sumarDias(hoy, -20 * 7);
  const finPlanta = sumarDias(hoy, -2 * 7);

  await crearObraConPlan({
    nombre: "Planta Industrial Sur",
    ubicacion: "Parque Industrial Sur, Lote 14",
    cliente: "Logística del Sur S.A.",
    estado: "PAUSADA",
    activa: false,
    fechaInicio: inicioPlanta,
    fechaFinTeorica: finPlanta,
    unidadIds,
    titulos: [
      {
        nombre: "Obra preliminar",
        items: [
          { nombre: "Limpieza y nivelación de terreno", cantidad: 5000, unidad: "m2", valorUnitario: 350 },
          { nombre: "Cerco perimetral", cantidad: 600, unidad: "ml", valorUnitario: 2200 },
        ],
      },
    ],
  });

  // --- Asignaciones de supervisores a obras ---
  await prisma.asignacionObraSupervisor.createMany({
    data: [
      { usuarioId: juan.id, obraId: torreNorte.id },
      { usuarioId: laura.id, obraId: torreNorte.id },
    ],
    skipDuplicates: true,
  });

  const belgrano = await prisma.obra.findFirstOrThrow({ where: { nombre: "Edificio Belgrano" } });
  await prisma.asignacionObraSupervisor.createMany({
    data: [{ usuarioId: laura.id, obraId: belgrano.id }],
    skipDuplicates: true,
  });

  console.log("Seed completo.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
