import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp, INTER, MONO } from "../estilo";
import { MARCAS, TEXTOS } from "../guion";
import { Camara } from "../three/Camara";
import {
  Bateria,
  Cable,
  crearRuta,
  Electrones,
  Led,
  Pad,
  Pista,
  Placa,
  Pulsador,
  Resistencia,
  Serigrafia,
  Transistor,
  type P2,
} from "../three/componentes";
import { Estudio } from "../three/Estudio";
import { marcaFrame } from "../tiempo";
import type { EscenaProps } from "../Video";

// Layout de la PCB (x, z). Q1 en (3, 0.5) con patas C=2.4, B=3.0, E=3.6.
const COLECTOR: P2[] = [[-4.8, -1.6], [-4.8, -3.8], [2.4, -3.8], [2.4, 0.5]];
const EMISOR: P2[] = [[3.6, 0.5], [3.6, 3.8], [-4.8, 3.8], [-4.8, 1.6]];
const BASE: P2[] = [[-2.5, -3.8], [-2.5, 2.2], [3.0, 2.2], [3.0, 0.5]];
const MALLA = crearRuta([...COLECTOR, ...EMISOR]);
const RAMA_BASE = crearRuta(BASE);
const CABLE_ROJO: [number, number, number][] = [[-5.55, 1.15, -0.55], [-5.0, 1.0, -0.9], [-4.85, 0.4, -1.5], [-4.8, 0.12, -1.6]];
const CABLE_NEGRO: [number, number, number][] = [[-5.55, 1.15, 0.55], [-5.0, 1.0, 0.9], [-4.85, 0.4, 1.5], [-4.8, 0.12, 1.6]];

export const Circuito: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS[idioma];
  const t = frame / fps;

  const onF = marcaFrame(plan, MARCAS[idioma].baseOn, plan.frames / 2);
  const on = spring({ frame: frame - onF, fps, config: { damping: 20 } });
  const fuerte = spring({ frame: frame - onF - 25, fps, config: { damping: 18 } });
  const avance = frame / plan.frames;

  // Plano general → acercamiento al LED y al transistor cuando circula la corriente
  const objetivo: [number, number, number] = [
    interpolate(fuerte, [0, 1], [-0.6, 1.6]),
    0,
    interpolate(fuerte, [0, 1], [0.9, -0.6]),
  ];

  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Camara
          angulo={interpolate(avance, [0, 1], [-0.32, 0.22])}
          radio={esVertical ? interpolate(fuerte, [0, 1], [15.5, 11.2]) : interpolate(fuerte, [0, 1], [11.5, 8])}
          altura={esVertical ? interpolate(fuerte, [0, 1], [13.5, 9.2]) : interpolate(fuerte, [0, 1], [11, 7])}
          objetivo={objetivo}
          fov={esVertical ? 42 : 38}
        />
        <Estudio bloom={1.2} sombraTam={10} />
        <Placa ancho={16} fondo={10.5} x={-0.9} />
        <Pista puntos={COLECTOR} />
        <Pista puntos={EMISOR} />
        <Pista puntos={BASE} />
        {[...COLECTOR, ...EMISOR, ...BASE].map((p, i) => (
          <Pad key={i} p={p} r={0.17} />
        ))}

        <Bateria posicion={[-6.95, 0.08, 0]} />
        <Cable puntos={CABLE_ROJO} color="#c62828" />
        <Cable puntos={CABLE_NEGRO} color="#15171b" />
        <Led posicion={[2.4, 0, -2.4]} encendido={fuerte} />
        <Resistencia desde={[-1.7, 2.2]} hasta={[0.3, 2.2]} />
        <Pulsador p={[-2.5, -0.8]} presion={on} />
        <Transistor posicion={[3, 0, 0.5]} />

        <Serigrafia texto="+9V" p={[-4.0, -2.4]} tam={0.36} />
        <Serigrafia texto="D1 LED" p={[1.2, -2.4]} tam={0.34} />
        <Serigrafia texto="SW1" p={[-1.5, -0.8]} tam={0.36} />
        <Serigrafia texto="R1 1kΩ" p={[-0.7, 2.85]} tam={0.36} />
        <Serigrafia texto="Q1 2N2222A" p={[4.7, 1.2]} tam={0.32} />

        <Electrones ruta={RAMA_BASE} n={10} t={t} velocidad={2.2} color={C.cian} radio={0.07} visible={on} />
        <Electrones ruta={MALLA} n={42} t={t} velocidad={4.2} color={C.ambar} radio={0.1} visible={fuerte} />
      </ThreeCanvas>

      <AbsoluteFill style={{ padding: esVertical ? "68px 46px" : 60, gap: 14, alignItems: "flex-start", pointerEvents: "none" }}>
        {[
          { txt: T.ib, color: C.cian, s: on, mono: false },
          { txt: T.ic, color: C.ambar, s: fuerte, mono: false },
          { txt: T.vbe, color: "#a5f3fc", s: fuerte, mono: true },
        ].map(({ txt, color, s, mono }) => (
          <div
            key={txt}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 22px",
              borderRadius: 14,
              background: "rgba(7,11,18,0.78)",
              border: `1px solid ${color}55`,
              fontFamily: mono ? MONO : INTER,
              fontWeight: 700,
              fontSize: mono ? 24 : esVertical ? 30 : 32,
              color,
              opacity: interpolate(s, [0, 1], [0, 1], clamp),
              transform: `translateX(${(1 - s) * -30}px)`,
            }}
          >
            <span style={{ width: 14, height: 14, borderRadius: 7, background: color, boxShadow: `0 0 16px ${color}` }} />
            {txt}
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
