import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CotaSenal } from "../componentes/HudIngenieria";
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

  const apertura = spring({ frame: frame - abrirF, fps, config: { damping: 16, stiffness: 95 } });
  const zoomSilicio = spring({ frame: frame - silicioF, fps, config: { damping: 16, stiffness: 110 } });
  const zoomBarrera = spring({ frame: frame - barreraF, fps, config: { damping: 15, stiffness: 120 } });
  const sSilicio = spring({ frame: frame - silicioF, fps, config: { damping: 16 } });
  const sHilos = spring({ frame: frame - hilosF, fps, config: { damping: 16 } });
  const sBarrera = spring({ frame: frame - barreraF, fps, config: { damping: 16 } });

  const avance = frame / plan.frames;
  // Antes de 0.7V la barrera P está gruesa bloqueando (pulso ~0.05); tras barreraF se encoge y avalancha!
  const pulso = frame >= barreraF ? 0.65 + 0.35 * Math.sin((frame / fps) * Math.PI * 6) : 0.05;

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

  const radioBase = esVertical ? 8.5 : 6.8;
  const radioCam = radioBase - zoomSilicio * 1.4 - zoomBarrera * 0.9;

  return (
    <AbsoluteFill>
      <Sequence from={abrirF} durationInFrames={22}>
        <Audio src={staticFile("sfx/corte_laser.wav")} volume={0.38} />
      </Sequence>
      <Sequence from={silicioF} durationInFrames={18}>
        <Audio src={staticFile("sfx/whoosh_camara.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={hilosF} durationInFrames={14}>
        <Audio src={staticFile("sfx/cota_pop.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={barreraF} durationInFrames={14}>
        <Audio src={staticFile("sfx/cota_pop.wav")} volume={0.32} />
      </Sequence>

      <ThreeCanvas
        width={width}
        height={height}
        shadows
        dpr={1}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <Camara
          angulo={interpolate(avance, [0, 1], [-0.46, 0.42])}
          radio={radioCam}
          altura={interpolate(zoomSilicio, [0, 1], [2.9, 2.25])}
          objetivo={[esVertical ? 0 : -0.15, esVertical ? 2.1 : 2.35, 0]}
          fov={esVertical ? 36 : 30}
        />
        <Estudio bloom={0.6} />
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

        {/* En 16:9: Cotas ancladas directamente al 3D (estilo Mentalidad de Ingeniería); en 9:16 compacto */}
        {!esVertical ? (
          <>
            <CotaSenal x={985} y={485} dx={220} dy={-70} titulo="Cristal N⁺ – P – N" detalle="Barrera Base P: 0.7 V (1 µm)" color={C.ambar} desdeFrame={silicioF} />
            <CotaSenal x={935} y={440} dx={-240} dy={-55} titulo="Hilos Au 25 µm" detalle="Conexión a Base y Emisor" color="#ffd166" desdeFrame={hilosF} />
            <CotaSenal x={965} y={540} dx={230} dy={75} titulo="Paleta Colector (Cu)" detalle="Disipación térmica 625 mW" color="#2b95ff" desdeFrame={barreraF} />
          </>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              alignSelf: "stretch",
              marginBottom: 210,
            }}
          >
            {capas.map(({ txt, color, s }) => (
              <div
                key={txt}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  borderRadius: 12,
                  background: "rgba(7,11,18,0.84)",
                  border: `1px solid ${color}66`,
                  fontFamily: INTER,
                  fontWeight: 600,
                  fontSize: 23,
                  color: C.texto,
                  opacity: interpolate(s, [0, 1], [0, 1], clamp),
                  transform: `translateX(${(1 - s) * 35}px)`,
                }}
              >
                <span style={{ width: 12, height: 12, borderRadius: 6, background: color, flexShrink: 0 }} />
                <span>{txt}</span>
              </div>
            ))}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
