import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp, INTER, MONO } from "../estilo";
import { MARCAS, TEXTOS } from "../guion";
import { Camara } from "../three/Camara";
import { EncapsuladoKiCad, Placa } from "../three/componentes";
import { Estudio } from "../three/Estudio";
import { marcaFrame } from "../tiempo";
import type { EscenaProps } from "../Video";

const Tarjeta: React.FC<{ titulo: string; s: number; compacta?: boolean; children: React.ReactNode }> = ({
  titulo,
  s,
  compacta = false,
  children,
}) => (
  <div
    style={{
      width: compacta ? 420 : 450,
      padding: compacta ? "22px 24px" : "26px 28px",
      borderRadius: 24,
      background: "linear-gradient(160deg, rgba(61,224,255,0.12), rgba(7,11,18,0.86))",
      border: "1px solid rgba(61,224,255,0.28)",
      boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
      opacity: s,
      transform: `translateY(${(1 - s) * 40}px) scale(${0.92 + 0.08 * s})`,
      textAlign: "center",
    }}
  >
    <svg width={200} height={92} viewBox="0 0 220 110">
      {children}
    </svg>
    <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: compacta ? 38 : 44, color: C.texto, marginTop: 6 }}>{titulo}</div>
  </div>
);

export const Cierre: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS[idioma];
  const M = MARCAS[idioma];

  const pop = (clave: string) => spring({ frame: frame - marcaFrame(plan, clave), fps, config: { damping: 15 } });
  const sw = pop(M.interruptor);
  const amp = pop(M.amplificador);
  const milesF = marcaFrame(plan, M.miles, plan.frames / 2);
  const chip = interpolate(frame, [milesF - 15, milesF + 20], [0, 1], clamp);
  const fase = (frame / fps) * Math.PI * 2;
  const giro = (frame / fps) * 0.65;

  const onda = (x0: number, ancho: number, a: number) =>
    Array.from({ length: 41 })
      .map((_, i) => {
        const x = x0 + (i / 40) * ancho;
        const y = 55 + a * Math.sin((i / 40) * Math.PI * 4 - fase);
        return `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

  const encapsulados = [
    { txt: T.pkgTo92, color: C.cian },
    { txt: T.pkgSot23, color: C.ambar },
    { txt: T.pkgTo220, color: "#a5f3fc" },
  ];

  return (
    <AbsoluteFill>
      {/* Escenario 3D con los 3 encapsulados reales de KiCad 9.0: TO-92, SOT-23 y TO-220 */}
      <AbsoluteFill style={{ opacity: interpolate(frame, [0, 30], [0, 1], clamp) }}>
        <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
          <Camara
            angulo={interpolate(frame / plan.frames, [0, 1], [-0.25, 0.25])}
            radio={esVertical ? 11.8 : 9.2}
            altura={esVertical ? 4.2 : 3.6}
            objetivo={[0, esVertical ? 1.4 : 1.7, 0]}
            fov={esVertical ? 38 : 34}
          />
          <Estudio bloom={1.2} />
          <Placa ancho={14} fondo={8} />
          {/* Izquierda: TO-92 (THT clásico) */}
          <EncapsuladoKiCad tipo="to92" posicion={[-3.2, 0.08, 0]} escala={0.28} rotacionY={giro} />
          {/* Centro: SOT-23 (SMD miniatura ampliado para inspección) */}
          <EncapsuladoKiCad tipo="sot23" posicion={[0, 0.08, 0.4]} escala={0.75} rotacionY={giro} />
          {/* Derecha: TO-220 (Potencia con disipador metálico) */}
          <EncapsuladoKiCad tipo="to220" posicion={[3.2, 0.08, 0]} escala={0.18} rotacionY={giro} />
        </ThreeCanvas>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "space-between",
          padding: esVertical ? "68px 36px 210px" : "48px 60px 140px",
          pointerEvents: "none",
        }}
      >
        {/* Tarjetas Superiores: Interruptor + Amplificador */}
        <div style={{ display: "flex", flexDirection: esVertical ? "column" : "row", gap: esVertical ? 22 : 48 }}>
          <Tarjeta titulo={T.interruptor} s={sw} compacta={esVertical}>
            <line x1={20} y1={70} x2={80} y2={70} stroke={C.cable} strokeWidth={6} strokeLinecap="round" />
            <line x1={140} y1={70} x2={200} y2={70} stroke={C.cable} strokeWidth={6} strokeLinecap="round" />
            <circle cx={80} cy={70} r={8} fill={C.cian} />
            <circle cx={140} cy={70} r={8} fill={C.cian} />
            <line
              x1={80}
              y1={70}
              x2={140}
              y2={70}
              stroke={C.cian}
              strokeWidth={6}
              strokeLinecap="round"
              transform={`rotate(${-30 * (0.5 + 0.5 * Math.sin(frame / 18))} 80 70)`}
            />
          </Tarjeta>
          <Tarjeta titulo={T.amplificador} s={amp} compacta={esVertical}>
            <path d={onda(5, 70, 8)} stroke={C.cian} strokeWidth={4} fill="none" />
            <polygon points="88,25 88,85 132,55" fill="none" stroke={C.metal} strokeWidth={4} strokeLinejoin="round" />
            <path d={onda(140, 75, 38)} stroke={C.ambar} strokeWidth={5} fill="none" />
          </Tarjeta>
        </div>

        {/* Etiquetas de los 3 Encapsulados Reales de KiCad */}
        <div style={{ textAlign: "center", opacity: chip, transform: `translateY(${(1 - chip) * 20}px)` }}>
          <div
            style={{
              display: "flex",
              flexDirection: esVertical ? "column" : "row",
              gap: 18,
              justifyContent: "center",
            }}
          >
            {encapsulados.map(({ txt, color }) => (
              <div
                key={txt}
                style={{
                  padding: "12px 22px",
                  borderRadius: 14,
                  background: "rgba(7,11,18,0.85)",
                  border: `1px solid ${color}66`,
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: esVertical ? 22 : 20,
                  color,
                }}
              >
                {txt}
              </div>
            ))}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontWeight: 600,
              fontSize: esVertical ? 22 : 24,
              letterSpacing: 4,
              color: C.texto,
              marginTop: 16,
              textTransform: "uppercase",
              textShadow: "0 4px 20px rgba(0,0,0,0.9)",
            }}
          >
            {T.chip}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
