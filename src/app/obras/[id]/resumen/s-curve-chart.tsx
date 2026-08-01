"use client";

import { useState } from "react";

type Serie = {
  label: string;
  color: string;
  valores: number[];
};

type Hover = {
  serieLabel: string;
  color: string;
  xLabel: string;
  valorTexto: string;
  xPct: number;
  yPct: number;
};

const formatCompacto = new Intl.NumberFormat("es-AR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatExacto = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function SCurveChart({
  series,
  xLabels,
  xTooltipLabels = xLabels,
}: {
  series: Serie[];
  xLabels: string[];
  xTooltipLabels?: string[];
}) {
  const [hover, setHover] = useState<Hover | null>(null);

  const width = 640;
  const height = 240;
  const paddingLeft = 56;
  const paddingRight = 16;
  const paddingTop = 16;
  const paddingBottom = 28;
  const cantidadPuntos = Math.max(...series.map((serie) => serie.valores.length));
  const maxY = Math.max(1, ...series.flatMap((serie) => serie.valores));

  const x = (indice: number) =>
    paddingLeft +
    (cantidadPuntos > 1 ? indice / (cantidadPuntos - 1) : 0) *
      (width - paddingLeft - paddingRight);
  const y = (valor: number) =>
    height - paddingBottom - (valor / maxY) * (height - paddingTop - paddingBottom);

  const puntos = (valores: number[]) =>
    valores.map((valor, indice) => `${x(indice)},${y(valor)}`).join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((fraccion) => maxY * fraccion);

  const cantidadEtiquetasX = Math.min(6, cantidadPuntos);
  const indicesEtiquetasX = Array.from({ length: cantidadEtiquetasX }, (_, indice) =>
    cantidadEtiquetasX > 1
      ? Math.round((indice * (cantidadPuntos - 1)) / (cantidadEtiquetasX - 1))
      : 0
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-full max-w-2xl">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          onMouseLeave={() => setHover(null)}
        >
          {yTicks.map((valor) => (
            <g key={valor}>
              <line
                x1={paddingLeft}
                y1={y(valor)}
                x2={width - paddingRight}
                y2={y(valor)}
                stroke="#e4e4e7"
              />
              <text
                x={paddingLeft - 8}
                y={y(valor)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={10}
                fill="#71717a"
              >
                {formatCompacto.format(valor)}
              </text>
            </g>
          ))}

          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="#a1a1aa"
          />
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={height - paddingBottom}
            stroke="#a1a1aa"
          />

          {indicesEtiquetasX.map((indice) => (
            <text
              key={indice}
              x={x(indice)}
              y={height - paddingBottom + 16}
              textAnchor="middle"
              fontSize={9}
              fill="#71717a"
            >
              {xLabels[indice]}
            </text>
          ))}

          {series.map((serie) => (
            <g key={serie.label}>
              <polyline
                points={puntos(serie.valores)}
                fill="none"
                stroke={serie.color}
                strokeWidth={2}
              />
              {serie.valores.map((valor, indice) => {
                const activo =
                  hover?.serieLabel === serie.label &&
                  hover.xLabel === xTooltipLabels[indice];
                return (
                  <g
                    key={indice}
                    className="cursor-pointer"
                    onMouseEnter={() =>
                      setHover({
                        serieLabel: serie.label,
                        color: serie.color,
                        xLabel: xTooltipLabels[indice],
                        valorTexto: formatExacto.format(valor),
                        xPct: (x(indice) / width) * 100,
                        yPct: (y(valor) / height) * 100,
                      })
                    }
                  >
                    <circle cx={x(indice)} cy={y(valor)} r={8} fill="transparent" />
                    <circle
                      cx={x(indice)}
                      cy={y(valor)}
                      r={activo ? 4 : 2.5}
                      fill={serie.color}
                      pointerEvents="none"
                    />
                  </g>
                );
              })}
            </g>
          ))}
        </svg>

        {hover && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs text-white shadow-lg"
            style={{ left: `${hover.xPct}%`, top: `${hover.yPct}%`, marginTop: -8 }}
          >
            <div className="flex items-center gap-1.5 font-medium">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: hover.color }}
              />
              {hover.serieLabel}: {hover.valorTexto}
            </div>
            <div className="text-zinc-400">{hover.xLabel}</div>
          </div>
        )}
      </div>
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
