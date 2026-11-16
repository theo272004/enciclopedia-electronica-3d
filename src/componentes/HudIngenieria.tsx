import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp, INTER, MONO } from "../estilo";

/**
 * Cota técnica animada estilo "Mentalidad de Ingeniería" / "Branch Education":
 * Punto anclado sobre el componente 3D + línea de cota en codo + tarjeta con dato de datasheet.
 */
export const CotaSenal: React.FC<{
  x: number;
  y: number;
  dx?: number;
  dy?: number;
  titulo: string;
  detalle?: string;
  color?: string;
  desdeFrame?: number;
}> = ({ x, y, dx = 90, dy = -55, titulo, detalle, color = C.cian, desdeFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - desdeFrame, fps, config: { damping: 16, stiffness: 130 } });
  const trazo = interpolate(p, [0, 0.7], [0, 1], clamp);
  const tarjeta = interpolate(p, [0.35, 1], [0, 1], clamp);

  const codoX = x + dx * 0.45;
  const finX = x + dx;
  const finY = y + dy;
  const haciaIzq = dx < 0;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <circle cx={x} cy={y} r={6 * p} fill={color} />
        <circle cx={x} cy={y} r={13 * p} fill="none" stroke={color} strokeWidth={1.5} opacity={0.45 * p} />
        <polyline
          points={`${x},${y} ${codoX},${finY} ${finX},${finY}`}
          fill="none"
          stroke={color}
          strokeWidth={2.2}
          strokeDasharray={320}
          strokeDashoffset={(1 - trazo) * 320}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div
        style={{
          position: "absolute",
          left: haciaIzq ? undefined : finX + 8,
          right: haciaIzq ? `calc(100% - ${finX - 8}px)` : undefined,
          top: finY - 22,
          padding: "8px 14px",
          borderRadius: 10,
          background: "rgba(7, 11, 18, 0.88)",
          border: `1px solid ${color}77`,
          boxShadow: `0 8px 24px rgba(0,0,0,0.45)`,
          opacity: tarjeta,
          transform: `translateY(${(1 - tarjeta) * 6}px)`,
          maxWidth: 340,
        }}
      >
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 18, color: C.texto, lineHeight: 1.2 }}>{titulo}</div>
        {detalle && (
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 14, color, marginTop: 3 }}>{detalle}</div>
        )}
      </div>
    </div>
  );
};

/**
 * Multímetro digital en vivo estilo Fluke / laboratorio GreatScott! para mostrar
 * tensión, corriente y potencia térmica en tiempo real mientras conmuta el circuito.
 */
export const MultimetroVivo: React.FC<{
  titulo?: string;
  lecturas: { etiqueta: string; valor: string; unidad: string; color?: string; alerta?: boolean }[];
  desdeFrame?: number;
}> = ({ titulo = "MULTÍMETRO DE BANCO · EN VIVO", lecturas, desdeFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrada = spring({ frame: frame - desdeFrame, fps, config: { damping: 16 } });

  return (
    <div
      style={{
        padding: "16px 20px",
        borderRadius: 16,
        background: "rgba(7, 11, 18, 0.90)",
        border: "1px solid rgba(61, 224, 255, 0.32)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
        opacity: interpolate(entrada, [0, 1], [0, 1], clamp),
        transform: `translateY(${(1 - entrada) * 18}px)`,
        minWidth: 290,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1.8,
          color: C.tenue,
          marginBottom: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{titulo}</span>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: "#43f09d", boxShadow: "0 0 10px #43f09d" }} />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {lecturas.map((l) => {
          const col = l.alerta ? "#ff5c5c" : l.color ?? C.cian;
          return (
            <div
              key={l.etiqueta}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: "6px 10px",
                borderRadius: 8,
                background: l.alerta ? "rgba(255, 92, 92, 0.14)" : "rgba(255, 255, 255, 0.03)",
                border: l.alerta ? "1px solid rgba(255, 92, 92, 0.45)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 15, color: C.tenue }}>{l.etiqueta}</span>
              <span style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: col }}>
                {l.valor} <small style={{ fontSize: 14, fontWeight: 500 }}>{l.unidad}</small>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Tarjeta de analogía física intuitiva estilo "Mentalidad de Ingeniería"
 * (Presión = Voltaje, Caudal = Corriente, Tanque = Capacitor, Volante = Inductor).
 */
export const AnalogiaFisica: React.FC<{
  conceptoElectrico: string;
  equivalenteFisico: string;
  explicacion: string;
  color?: string;
  desdeFrame?: number;
}> = ({ conceptoElectrico, equivalenteFisico, explicacion, color = C.ambar, desdeFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - desdeFrame, fps, config: { damping: 15 } });

  return (
    <div
      style={{
        padding: "16px 22px",
        borderRadius: 16,
        background: "rgba(7, 11, 18, 0.88)",
        border: `1px solid ${color}55`,
        maxWidth: 520,
        opacity: interpolate(s, [0, 1], [0, 1], clamp),
        transform: `translateX(${(1 - s) * -24}px)`,
      }}
    >
      <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: 2, color, textTransform: "uppercase", fontWeight: 700 }}>
        INTUICIÓN FÍSICA · {conceptoElectrico} ≈ {equivalenteFisico}
      </div>
      <div style={{ fontFamily: INTER, fontSize: 19, color: C.texto, marginTop: 6, lineHeight: 1.38 }}>{explicacion}</div>
    </div>
  );
};
