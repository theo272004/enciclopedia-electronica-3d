import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp, INTER, MONO } from "../estilo";
import { DATASHEET_2N2222A, MARCAS, TEXTOS } from "../guion";
import { Camara } from "../three/Camara";
import { crearRuta, Electrones, Pad, Pista, Placa, Serigrafia, Transistor, type P2 } from "../three/componentes";
import { Estudio } from "../three/Estudio";
import { marcaFrame } from "../tiempo";
import type { EscenaProps } from "../Video";

// Pistas decorativas que salen de las patas del transistor.
const PISTAS: P2[][] = [
  [[-0.6, 0], [-0.6, -1.2], [-3, -1.2], [-3, -3.5]],
  [[0, 0], [0, 1.4], [-2.5, 1.4], [-2.5, 3.5]],
  [[0.6, 0], [0.6, -1.6], [3.2, -1.6], [3.2, -3.8]],
  [[0.6, 0], [1.8, 0], [1.8, 1.6], [4.5, 1.6]],
  [[-0.6, 0], [-1.8, 0], [-1.8, 0.8], [-5, 0.8]],
  [[0, 1.4], [0, 2.8], [2.6, 2.8], [2.6, 4]],
  [[-4.2, -2.4], [-4.2, -0.6], [-6, -0.6]],
  [[4.2, -0.6], [5.6, -0.6], [5.6, 2.8]],
];

export const Intro: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS[idioma];
  const t = frame / fps;

  const entrada = interpolate(frame, [0, 40], [0, 1], clamp);
  const corriente = interpolate(frame, [30, 70], [0, 1], clamp);
  const tituloF = marcaFrame(plan, MARCAS[idioma].titulo, plan.frames - 90) - 12;
  const titulo = spring({ frame: frame - tituloF, fps, config: { damping: 16, stiffness: 110 } });
  const avance = frame / plan.frames;
  const rutas = useMemo(() => PISTAS.map((p) => crearRuta(p)), []);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: entrada }}>
        <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
          <Camara
            angulo={interpolate(avance, [0, 1], [-0.75, 0.45])}
            radio={esVertical ? interpolate(avance, [0, 1], [9.4, 7.2]) : interpolate(avance, [0, 1], [7.2, 5.4])}
            altura={interpolate(avance, [0, 1], [2.3, 3.3])}
            objetivo={[0, interpolate(titulo, [0, 1], [0.75, 0.2]), 0]}
            fov={esVertical ? 36 : 32}
          />
          <Estudio bloom={1.3} />
          <Placa ancho={14} fondo={10} />
          {PISTAS.map((p, i) => (
            <Pista key={i} puntos={p} ancho={0.16} />
          ))}
          {PISTAS.flatMap((p, i) => [<Pad key={`a${i}`} p={p[0]} r={0.16} />, <Pad key={`b${i}`} p={p[p.length - 1]} r={0.16} />])}
          <Serigrafia texto="Q1 2N2222A" p={[-1.55, 0.58]} tam={0.3} />
          {rutas.map((r, i) => (
            <Electrones
              key={i}
              ruta={r}
              n={6}
              t={t + i * 0.37}
              velocidad={1.6}
              color={i % 3 === 0 ? C.ambar : C.cian}
              radio={0.045}
              visible={corriente}
            />
          ))}
          <Transistor posicion={[0, 0, 0]} />
        </ThreeCanvas>
      </AbsoluteFill>

      {/* Ficha superior del Datasheet */}
      <AbsoluteFill style={{ padding: esVertical ? "68px 46px" : "46px 64px", pointerEvents: "none" }}>
        <div
          style={{
            alignSelf: "flex-start",
            display: "flex",
            gap: 18,
            padding: "12px 22px",
            borderRadius: 14,
            background: "rgba(7,11,18,0.78)",
            border: "1px solid rgba(61,224,255,0.28)",
            fontFamily: MONO,
            fontSize: esVertical ? 20 : 18,
            color: C.texto,
            opacity: corriente,
          }}
        >
          <span style={{ color: C.ambar, fontWeight: 700 }}>{DATASHEET_2N2222A.modelo}</span>
          <span>V_CEO: {DATASHEET_2N2222A.vceoMax}</span>
          <span>I_C: {DATASHEET_2N2222A.icMax}</span>
          {!esVertical && <span>P_D: {DATASHEET_2N2222A.pdMax}</span>}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            top: esVertical ? 1180 : 620,
            textAlign: "center",
            opacity: titulo,
            transform: `translateY(${(1 - titulo) * 50}px)`,
            padding: "0 32px",
          }}
        >
          <div
            style={{
              fontFamily: INTER,
              fontWeight: 800,
              fontSize: esVertical ? 96 : 124,
              letterSpacing: -4,
              color: C.texto,
              textShadow: "0 10px 40px rgba(0,0,0,0.8)",
            }}
          >
            {T.titulo}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontWeight: 600,
              fontSize: esVertical ? 24 : 26,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: C.cian,
              marginTop: 8,
            }}
          >
            {T.subtitulo}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
