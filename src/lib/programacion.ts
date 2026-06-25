export type SemanaObra = {
  numero: number;
  desde: Date;
  hasta: Date;
};

const MS_DIA = 24 * 60 * 60 * 1000;

export function calcularSemanasObra(
  fechaInicio: Date,
  fechaFinTeorica: Date
): SemanaObra[] {
  const totalDias =
    Math.floor((fechaFinTeorica.getTime() - fechaInicio.getTime()) / MS_DIA) + 1;
  const totalSemanas = Math.max(1, Math.ceil(totalDias / 7));

  const semanas: SemanaObra[] = [];
  for (let numero = 1; numero <= totalSemanas; numero++) {
    const desde = new Date(fechaInicio.getTime() + (numero - 1) * 7 * MS_DIA);
    const hastaCandidata = new Date(
      fechaInicio.getTime() + (numero * 7 - 1) * MS_DIA
    );
    const hasta =
      hastaCandidata.getTime() > fechaFinTeorica.getTime()
        ? fechaFinTeorica
        : hastaCandidata;
    semanas.push({ numero, desde, hasta });
  }
  return semanas;
}

// Convierte el "ahora" (un instante real, en la zona horaria local del
// servidor) a medianoche UTC del día calendario de hoy. SOLO debe usarse con
// `new Date()` / "hoy" en vivo. Las fechas que ya vienen de la base (fechaInicio,
// fechaFinTeorica, Gasto.fecha, RegistroAvance.fecha) YA son medianoche UTC
// (vienen de un <input type="date"> vía z.coerce.date()) — re-derivarlas con
// getFullYear/getMonth/getDate (locales) las correría un día para atrás en
// cualquier huso horario negativo respecto a UTC. Por eso las funciones de
// abajo solo normalizan el parámetro "hoy", nunca una fecha ya almacenada.
function normalizarHoyUtc(hoy: Date): Date {
  return new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()));
}

export function semanaDeFecha(
  semanas: SemanaObra[],
  fechaUtc: Date
): number | null {
  const encontrada = semanas.find(
    (semana) =>
      fechaUtc.getTime() >= semana.desde.getTime() &&
      fechaUtc.getTime() <= semana.hasta.getTime()
  );
  return encontrada ? encontrada.numero : null;
}

export function semanaActual(
  semanas: SemanaObra[],
  hoy: Date = new Date()
): number | null {
  return semanaDeFecha(semanas, normalizarHoyUtc(hoy));
}

export function semanaDeFechaClamped(
  semanas: SemanaObra[],
  fechaUtc: Date
): number {
  const encontrada = semanaDeFecha(semanas, fechaUtc);
  if (encontrada !== null) {
    return encontrada;
  }
  if (fechaUtc.getTime() < semanas[0].desde.getTime()) {
    return semanas[0].numero;
  }
  return semanas[semanas.length - 1].numero;
}

export function diasTranscurridos(fechaInicio: Date, hoy: Date = new Date()): number {
  const hoyUtc = normalizarHoyUtc(hoy);
  const dias = Math.floor((hoyUtc.getTime() - fechaInicio.getTime()) / MS_DIA);
  return Math.max(0, dias);
}

export function porcentajeTiempoTranscurrido(
  fechaInicio: Date,
  fechaFinTeorica: Date,
  hoy: Date = new Date()
): number {
  const duracionTotal =
    Math.floor((fechaFinTeorica.getTime() - fechaInicio.getTime()) / MS_DIA) + 1;
  if (duracionTotal <= 0) {
    return 0;
  }
  const transcurridos = diasTranscurridos(fechaInicio, hoy);
  return Math.min(100, (transcurridos / duracionTotal) * 100);
}

export function formatRangoSemana(semana: SemanaObra): string {
  const opciones: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  };
  const desde = semana.desde.toLocaleDateString("es-AR", opciones);
  const hasta = semana.hasta.toLocaleDateString("es-AR", opciones);
  return `${desde}–${hasta}`;
}
