import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp, INTER, MONO } from "../estilo";
import { DATASHEET_2N2222A, MARCAS, TEXTOS } from "../guion";
import { Camara } from "../three/Camara";
import { Placa, TransistorAutopsia, type CapaAutopsia } from "../three/componentes";
import { Estudio } from "../three/Estudio";
import { marcaFrame } from "../tiempo";
import type { EscenaProps } from "../Video";

export const Autopsia: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS[idioma];
  const M = MARCAS[idioma];

  const abrirF = marcaFrame(plan, M.abrimos, 18);
  const silicioF = marcaFrame(plan, M.silicio, Math.round(plan.frames * 0.28));
  const hilosF = marcaFrame(plan, M.hilos, Math.round(plan.frames * 0.58));
  const barreraF = marcaFrame(plan, M.barrera, Math.round(plan.frames * 0.75));

  const apertura = spring({ frame: frame - abrirF, fps, config: { damping: 18, stiffness: 85 } });
  const sSilicio = spring({ frame: frame - silicioF, fps, config: { damping: 16 } });
  const sHilos = spring({ frame: frame - hilosF, fps, config: { damping: 16 } });
  const sBarrera = spring({ frame: frame - barreraF, fps, config: { damping: 16 } });

  const avance = frame / plan.frames;
  const pulso = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 3);

  let resaltar: CapaAutopsia = "todas";
  if (frame >= barreraF) resaltar = "base";
  else if (frame >= hilosF) resaltar = "hilos";
  else if (frame >= silicioF) resaltar = "emisor";

  const capas = [
    { txt: T.capaEmisor, color: C.cian, s: sSilicio },
    { txt: T.capaBase, color: C.ambar, s: sBarrera > 0.1 ? sBarrera : sSilicio },
    { txt: T.capaColector, color: "#2b95ff", s: sSilicio },
    { txt: T.capaHilos, color: "#ffd166", s: sHilos },
  ];

  return (
    <AbsoluteFill>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        dpr={1}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <Camara
          angulo={interpolate(avance, [0, 1], [-0.42, 0.38])}
          radio={esVertical ? interpolate(apertura, [0, 1], [8.5, 6.8]) : interpolate(apertura, [0, 1], [6.8, 5.5])}
          altura={interpolate(apertura, [0, 1], [2.8, 2.35])}
          objetivo={[esVertical ? 0 : -0.45, esVertical ? 2.1 : 2.35, 0]}
          fov={esVertical ? 38 : 32}
        />
        <Estudio bloom={1.35} />
        <Placa ancho={10} fondo={8} />
        <TransistorAutopsia
          posicion={[0, 0.08, 0]}
          escala={0.44}
          apertura={apertura}
          resaltar={resaltar}
          pulsoCorriente={pulso}
        />
      </ThreeCanvas>

      {/* Encabezado Técnico */}
      <AbsoluteFill
        style={{
          padding: esVertical ? "70px 48px" : "48px 70px",
          justifyContent: "space-between",
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div
              style={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: esVertical ? 22 : 20,
                letterSpacing: 3,
                color: C.cian,
                textTransform: "uppercase",
              }}
            >
              {T.autopsiaSub}
            </div>
            <div
              style={{
                fontFamily: INTER,
                fontWeight: 800,
                fontSize: esVertical ? 46 : 52,
                color: C.texto,
                marginTop: 4,
                textShadow: "0 8px 30px rgba(0,0,0,0.8)",
              }}
            >
              {T.autopsiaTitulo}
            </div>
          </div>

          {/* Ficha Datasheet */}
          {!esVertical && (
            <div
              style={{
                padding: "14px 22px",
                borderRadius: 14,
                background: "rgba(7,11,18,0.82)",
                border: "1px solid rgba(61,224,255,0.3)",
                fontFamily: MONO,
                fontSize: 18,
                color: C.texto,
                lineHeight: 1.5,
              }}
            >
              <div style={{ color: C.ambar, fontWeight: 700 }}>{DATASHEET_2N2222A.modelo}</div>
              <div>V_BE(on): {DATASHEET_2N2222A.vbeSat}</div>
              <div>f_T: {DATASHEET_2N2222A.ft}</div>
            </div>
          )}
        </div>

        {/* Leyenda de Capas del Cristal de Silicio */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignSelf: esVertical ? "stretch" : "flex-end",
            marginBottom: esVertical ? 210 : 110,
            maxWidth: esVertical ? "100%" : 560,
          }}
        >
          {capas.map(({ txt, color, s }) => (
            <div
              key={txt}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: esVertical ? "12px 18px" : "12px 20px",
                borderRadius: 14,
                background: "rgba(7,11,18,0.82)",
                border: `1px solid ${color}66`,
                fontFamily: INTER,
                fontWeight: 600,
                fontSize: esVertical ? 25 : 24,
                color: C.texto,
                opacity: interpolate(s, [0, 1], [0, 1], clamp),
                transform: `translateX(${(1 - s) * 35}px)`,
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  background: color,
                  boxShadow: `0 0 14px ${color}`,
                  flexShrink: 0,
                }}
              />
              <span>{txt}</span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
