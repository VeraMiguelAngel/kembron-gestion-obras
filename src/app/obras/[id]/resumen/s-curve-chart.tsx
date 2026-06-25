type Serie = {
  label: string;
  color: string;
  valores: number[];
};

export function SCurveChart({ series }: { series: Serie[] }) {
  const width = 600;
  const height = 220;
  const padding = 32;
  const cantidadPuntos = Math.max(...series.map((serie) => serie.valores.length));
  const maxY = Math.max(1, ...series.flatMap((serie) => serie.valores));

  const x = (indice: number) =>
    padding +
    (cantidadPuntos > 1 ? indice / (cantidadPuntos - 1) : 0) *
      (width - padding * 2);
  const y = (valor: number) =>
    height - padding - (valor / maxY) * (height - padding * 2);

  const puntos = (valores: number[]) =>
    valores.map((valor, indice) => `${x(indice)},${y(valor)}`).join(" ");

  return (
    <div className="flex flex-col gap-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-2xl">
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#d4d4d8"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#d4d4d8"
        />
        {series.map((serie) => (
          <polyline
            key={serie.label}
            points={puntos(serie.valores)}
            fill="none"
            stroke={serie.color}
            strokeWidth={2}
          />
        ))}
      </svg>
      <div className="flex gap-4 text-xs text-zinc-600">
        {series.map((serie) => (
          <span key={serie.label} className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: serie.color }}
            />
            {serie.label}
          </span>
        ))}
      </div>
    </div>
  );
}
