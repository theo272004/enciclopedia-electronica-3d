import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp, INTER, MONO } from "../estilo";
import { DATASHEET_2N2222A, MARCAS, TEXTOS } from "../guion";
import { marcaFrame } from "../tiempo";
import type { EscenaProps } from "../Video";

// Curva real de colector I_C(V_CE) con rodilla de saturación en V_CE(sat) ≈ 0.3 V y efecto Early suave
const calcularIc = (vce: number, ibMa: number, beta = 200) => {
  if (ibMa <= 0) return 0;
  const icSat = ibMa * beta;
  const rodilla = 1 - Math.exp(-vce / 0.14);
  const early = 1 + vce / 110;
  return icSat * rodilla * early;
};

export const Regiones: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS[idioma];
  const M = MARCAS[idioma];

  const corteF = marcaFrame(plan, M.corte, 18);
  const satF = marcaFrame(plan, M.saturacion, Math.round(plan.frames * 0.4));
  const actF = marcaFrame(plan, M.activa, Math.round(plan.frames * 0.7));

  const sCorte = spring({ frame: frame - corteF, fps, config: { damping: 16 } });
  const sSat = spring({ frame: frame - satF, fps, config: { damping: 16 } });
  const sAct = spring({ frame: frame - actF, fps, config: { damping: 16 } });
  const trazado = interpolate(frame, [0, 45], [0, 1], clamp);

  // Coordenadas del gráfico SVG (X: 0..40 V -> 110..860, Y: 0..200 mA -> 460..60)
  const xVce = (v: number) => 110 + (v / 40) * 750;
  const yIc = (ic: number) => 460 - (ic / 200) * 400;

  // Punto de operación Q animado según la región explicada
  const qVce =
    frame < satF
      ? 36
      : frame < actF
        ? interpolate(sSat, [0, 1], [36, 0.8])
        : interpolate(sAct, [0, 1], [0.8, 16]);
  const qIc =
    frame < satF
      ? 2
      : frame < actF
        ? interpolate(sSat, [0, 1], [2, 165])
        : interpolate(sAct, [0, 1], [165, 95]);

  const qColor = frame < satF ? "#ff5c5c" : frame < actF ? C.cian : C.ambar;

  const curvasIb = [0.2, 0.4, 0.6, 0.8, 1.0];

  const tarjetas = [
    { titulo: T.regCorte, desc: T.regCorteDesc, color: "#ff5c5c", s: sCorte },
    { titulo: T.regSat, desc: T.regSatDesc, color: C.cian, s: sSat },
    { titulo: T.regActiva, desc: T.regActivaDesc, color: C.ambar, s: sAct },
  ];

  return (
    <AbsoluteFill
      style={{
        padding: esVertical ? "68px 44px" : "52px 72px",
        flexDirection: esVertical ? "column" : "row",
        gap: 36,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Panel Izquierdo / Superior: Trazador de Curvas I_C vs V_CE */}
      <div
        style={{
          flex: 1.35,
          width: "100%",
          padding: "26px 30px",
          borderRadius: 24,
          background: "rgba(7,11,18,0.86)",
          border: "1px solid rgba(61,224,255,0.25)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.55)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: esVertical ? 30 : 34, color: C.texto }}>
            {T.regionesTitulo}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 18, color: C.cian }}>
            β = {DATASHEET_2N2222A.hfeRango} · P_D(max) = 625 mW
          </div>
        </div>

        <svg width="100%" viewBox="0 0 920 520" style={{ overflow: "visible" }}>
          {/* Zona sombreada de Saturación (V_CE < 1 V) */}
          <rect
            x={110}
            y={60}
            width={42}
            height={400}
            fill="rgba(61,224,255,0.12)"
            opacity={sSat}
          />
          {/* Zona sombreada de Corte (I_C ≈ 0) */}
          <rect
            x={110}
            y={442}
            width={750}
            height={22}
            fill="rgba(255,92,92,0.16)"
            opacity={sCorte}
          />

          {/* Cuadrícula */}
          {[0, 10, 20, 30, 40].map((v) => (
            <g key={`v${v}`}>
              <line x1={xVce(v)} y1={60} x2={xVce(v)} y2={460} stroke={C.grid} strokeWidth={2} />
              <text x={xVce(v)} y={492} textAnchor="middle" fontFamily={MONO} fontSize={18} fill={C.tenue}>
                {v}V
              </text>
            </g>
          ))}
          {[0, 50, 100, 150, 200].map((ic) => (
            <g key={`i${ic}`}>
              <line x1={110} y1={yIc(ic)} x2={860} y2={yIc(ic)} stroke={C.grid} strokeWidth={2} />
              <text x={96} y={yIc(ic) + 6} textAnchor="end" fontFamily={MONO} fontSize={18} fill={C.tenue}>
                {ic}mA
              </text>
            </g>
          ))}

          {/* Ejes */}
          <line x1={110} y1={60} x2={110} y2={460} stroke={C.metal} strokeWidth={3} />
          <line x1={110} y1={460} x2={860} y2={460} stroke={C.metal} strokeWidth={3} />

          {/* Recta de carga resistiva */}
          <line
            x1={xVce(0)}
            y1={yIc(180)}
            x2={xVce(36)}
            y2={yIc(0)}
            stroke="rgba(255,255,255,0.28)"
            strokeWidth={3}
            strokeDasharray="10 8"
          />

          {/* Familia de curvas de Colector para distintos I_B */}
          {curvasIb.map((ib) => {
            const pts = Array.from({ length: 61 })
              .map((_, k) => {
                const v = (k / 60) * 40 * trazado;
                const ic = Math.min(200, calcularIc(v, ib, 145));
                return `${k === 0 ? "M" : "L"} ${xVce(v).toFixed(1)} ${yIc(ic).toFixed(1)}`;
              })
              .join(" ");
            return (
              <g key={ib}>
                <path d={pts} fill="none" stroke={C.cian} strokeWidth={3.5} opacity={0.85} />
                <text
                  x={868}
                  y={yIc(Math.min(200, calcularIc(40, ib, 145))) + 5}
                  fontFamily={MONO}
                  fontSize={15}
                  fill={C.cian}
                  opacity={trazado}
                >
                  I_B={ib}mA
                </text>
              </g>
            );
          })}

          {/* Hipérbola de máxima potencia P_D = 625 mW */}
          <path
            d={Array.from({ length: 50 })
              .map((_, k) => {
                const v = 3.2 + (k / 49) * 36.8;
                const ic = Math.min(200, 625 / v);
                return `${k === 0 ? "M" : "L"} ${xVce(v).toFixed(1)} ${yIc(ic).toFixed(1)}`;
              })
              .join(" ")}
            fill="none"
            stroke="#ff5c5c"
            strokeWidth={2.5}
            strokeDasharray="6 6"
            opacity={0.75}
          />

          {/* Punto de Operación Q dinámico */}
          <circle
            cx={xVce(qVce)}
            cy={yIc(qIc)}
            r={13}
            fill={qColor}
            style={{ filter: `drop-shadow(0 0 14px ${qColor})` }}
          />
          <text
            x={xVce(qVce) + 18}
            y={yIc(qIc) - 12}
            fontFamily={MONO}
            fontWeight={700}
            fontSize={22}
            fill={qColor}
          >
            Q ({qVce.toFixed(1)}V, {Math.round(qIc)}mA)
          </text>
        </svg>
      </div>

      {/* Panel Derecho / Inferior: Tarjetas de las 3 Regiones */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          width: "100%",
          marginBottom: esVertical ? 190 : 60,
        }}
      >
        {tarjetas.map(({ titulo, desc, color, s }) => (
          <div
            key={titulo}
            style={{
              padding: "20px 24px",
              borderRadius: 18,
              background: "rgba(7,11,18,0.85)",
              border: `1.5px solid ${color}88`,
              boxShadow: `0 12px 32px rgba(0,0,0,0.45)`,
              opacity: interpolate(s, [0, 1], [0.15, 1], clamp),
              transform: `translateX(${(1 - s) * 30}px) scale(${0.96 + 0.04 * s})`,
            }}
          >
            <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 26, color }}>{titulo}</div>
            <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 20, color: C.texto, marginTop: 6 }}>{desc}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
