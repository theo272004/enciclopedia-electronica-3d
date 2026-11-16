import { Audio } from "@remotion/media";
import { evolvePath } from "@remotion/paths";
import { ThreeCanvas } from "@remotion/three";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Fondo } from "./componentes/Fondo";
import { Subtitulos } from "./componentes/Subtitulos";
import { C, clamp, INTER, MONO } from "./estilo";
import type { EscenaId } from "./guion";
import { DATASHEET_DIODO, MARCAS_DIODO, TEXTOS_DIODO } from "./guion-diodo";
import { Camara } from "./three/Camara";
import {
  crearRuta,
  DiodoAutopsia,
  DiodoFlyback,
  Electrones,
  EncapsuladoKiCad,
  Led,
  Pad,
  Pista,
  Placa,
  Resistencia,
  Serigrafia,
  type P2,
} from "./three/componentes";
import { Estudio } from "./three/Estudio";
import { marcaFrame, PRE, TRANS } from "./tiempo";
import type { EscenaProps, VideoProps } from "./Video";

// ---------- ESCENA 1: INTRO DIODO 1N4007 + ZENER DO-35 ----------
const PISTAS_INTRO_DIODO: P2[][] = [
  [[-3.8, -1.2], [3.8, -1.2]],
  [[-3.8, 1.2], [3.8, 1.2]],
];

const IntroDiodo: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_DIODO[idioma];
  const t = frame / fps;

  const entrada = interpolate(frame, [0, 35], [0, 1], clamp);
  const corriente = interpolate(frame, [25, 65], [0, 1], clamp);
  const tituloF = marcaFrame(plan, MARCAS_DIODO[idioma].titulo, plan.frames - 90) - 12;
  const titulo = spring({ frame: frame - tituloF, fps, config: { damping: 16, stiffness: 110 } });
  const avance = frame / plan.frames;
  const ruta = useMemo(() => crearRuta(PISTAS_INTRO_DIODO[0]), []);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: entrada }}>
        <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
          <Camara
            angulo={interpolate(avance, [0, 1], [-0.55, 0.42])}
            radio={esVertical ? interpolate(avance, [0, 1], [10.2, 8.0]) : interpolate(avance, [0, 1], [7.8, 5.8])}
            altura={interpolate(avance, [0, 1], [3.0, 3.6])}
            objetivo={[0, 0.8, 0]}
            fov={esVertical ? 38 : 32}
          />
          <Estudio bloom={1.3} />
          <Placa ancho={14} fondo={10} />
          {PISTAS_INTRO_DIODO.map((p, i) => (
            <Pista key={i} puntos={p} ancho={0.2} />
          ))}
          <Pad p={[-3.8, -1.2]} r={0.18} />
          <Pad p={[3.8, -1.2]} r={0.18} />
          <Pad p={[-3.8, 1.2]} r={0.18} />
          <Pad p={[3.8, 1.2]} r={0.18} />
          <Serigrafia texto="D1 1N4007 (DO-41)" p={[0, -2.2]} tam={0.32} />
          <Serigrafia texto="DZ1 1N4733A (DO-35)" p={[0, 2.2]} tam={0.32} />
          <Electrones ruta={ruta} n={12} t={t} velocidad={2.5} color={C.cian} radio={0.06} visible={corriente} />
          <DiodoFlyback desde={[-1.8, -1.2]} hasta={[1.8, -1.2]} pulso={corriente * 0.4} />
          <EncapsuladoKiCad tipo="diodo_zener" posicion={[0, 0.08, 1.2]} escala={0.35} />
        </ThreeCanvas>
      </AbsoluteFill>

      <AbsoluteFill style={{ padding: esVertical ? "68px 46px" : "46px 64px", pointerEvents: "none" }}>
        <div style={{ alignSelf: "flex-start", display: "flex", gap: 18, padding: "12px 22px", borderRadius: 14, background: "rgba(7,11,18,0.8)", border: "1px solid rgba(61,224,255,0.28)", fontFamily: MONO, fontSize: esVertical ? 19 : 18, color: C.texto, opacity: corriente }}>
          <span style={{ color: C.ambar, fontWeight: 700 }}>{DATASHEET_DIODO.modelo}</span>
          {!esVertical && <span>V_RRM: {DATASHEET_DIODO.vrrm1n4007}</span>}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: esVertical ? 1180 : 620, textAlign: "center", opacity: titulo, transform: `translateY(${(1 - titulo) * 50}px)`, padding: "0 32px" }}>
          <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: esVertical ? 96 : 124, letterSpacing: -4, color: C.texto, textShadow: "0 10px 40px rgba(0,0,0,0.8)" }}>
            {T.titulo}
          </div>
          <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: esVertical ? 22 : 25, letterSpacing: 4, textTransform: "uppercase", color: C.cian, marginTop: 8 }}>
            {T.subtitulo}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 2: AUTOPSIA 3D DEL DIODO DO-41 1N4007 EN BLENDER 5.0 ----------
const AutopsiaDiodo: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_DIODO[idioma];
  const M = MARCAS_DIODO[idioma];

  const abrirF = marcaFrame(plan, M.abrimos, 16);
  const agotF = marcaFrame(plan, M.agotamiento, Math.round(plan.frames * 0.35));
  const barF = marcaFrame(plan, M.barrera, Math.round(plan.frames * 0.65));

  const apertura = spring({ frame: frame - abrirF, fps, config: { damping: 18, stiffness: 85 } });
  const sAgot = spring({ frame: frame - agotF, fps, config: { damping: 16 } });
  const sBar = spring({ frame: frame - barF, fps, config: { damping: 16 } });

  const capas = [
    { txt: T.capaAnodo, color: C.ambar, s: apertura },
    { txt: T.capaBarrera, color: "#ff5c5c", s: sAgot },
    { txt: T.capaCatodo, color: C.cian, s: sAgot },
    { txt: T.capaBanda, color: "#2ee59d", s: sBar },
  ];

  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Camara
          angulo={interpolate(frame / plan.frames, [0, 1], [-0.38, 0.32])}
          radio={esVertical ? interpolate(apertura, [0, 1], [10.0, 8.2]) : interpolate(apertura, [0, 1], [7.6, 5.8])}
          altura={interpolate(apertura, [0, 1], [3.2, 2.5])}
          objetivo={[esVertical ? 0 : -0.4, 1.3, 0]}
          fov={esVertical ? 38 : 32}
        />
        <Estudio bloom={1.35} />
        <Placa ancho={12} fondo={9} />
        <DiodoAutopsia posicion={[0, 0.2, 0]} escala={0.68} apertura={apertura} polarizacion={sBar} />
      </ThreeCanvas>

      <AbsoluteFill style={{ padding: esVertical ? "70px 48px" : "48px 70px", justifyContent: "space-between", pointerEvents: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: esVertical ? 21 : 19, letterSpacing: 3, color: C.cian, textTransform: "uppercase" }}>
              {T.autopsiaSub}
            </div>
            <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: esVertical ? 44 : 50, color: C.texto, marginTop: 4, textShadow: "0 8px 30px rgba(0,0,0,0.8)" }}>
              {T.autopsiaTitulo}
            </div>
          </div>

          {!esVertical && (
            <div style={{ padding: "14px 22px", borderRadius: 14, background: "rgba(7,11,18,0.82)", border: "1px solid rgba(61,224,255,0.3)", fontFamily: MONO, fontSize: 17, color: C.texto, lineHeight: 1.5 }}>
              <div style={{ color: C.ambar, fontWeight: 700 }}>Vishay 1N4007 (DO-41)</div>
              <div>V_F: {DATASHEET_DIODO.vfSilicio}</div>
              <div>V_RRM: {DATASHEET_DIODO.vrrm1n4007}</div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignSelf: esVertical ? "stretch" : "flex-end", marginBottom: esVertical ? 210 : 110, maxWidth: esVertical ? "100%" : 610 }}>
          {capas.map(({ txt, color, s }) => (
            <div key={txt} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderRadius: 14, background: "rgba(7,11,18,0.84)", border: `1px solid ${color}66`, fontFamily: INTER, fontWeight: 600, fontSize: esVertical ? 23 : 22, color: C.texto, opacity: interpolate(s, [0, 1], [0, 1], clamp), transform: `translateX(${(1 - s) * 35}px)` }}>
              <span style={{ width: 14, height: 14, borderRadius: 7, background: color, boxShadow: `0 0 14px ${color}`, flexShrink: 0 }} />
              <span>{txt}</span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 3: SÍMBOLO ESQUEMÁTICO ÁNODO → CÁTODO ----------
const PartesDiodo: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = TEXTOS_DIODO[idioma];
  const M = MARCAS_DIODO[idioma];

  const dibujo = interpolate(frame, [0, 45], [0, 1], clamp);
  const pop = (clave: string, def: number) => spring({ frame: frame - marcaFrame(plan, clave, def), fps, config: { damping: 15 } });
  const sA = pop(M.anodo, 35);
  const sK = pop(M.catodo, 85);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <svg width={1520} height={780} viewBox="-160 0 1320 680" style={{ marginTop: -80 }}>
        <line x1={180} y1={340} x2={420} y2={340} stroke={C.ambar} strokeWidth={12} strokeLinecap="round" {...evolvePath(dibujo, "M 180 340 L 420 340")} />
        <polygon points="420,230 420,450 610,340" fill="rgba(255,181,71,0.18)" stroke={C.ambar} strokeWidth={12} strokeLinejoin="round" opacity={dibujo} />
        <line x1={610} y1={225} x2={610} y2={455} stroke={C.cian} strokeWidth={16} strokeLinecap="round" opacity={dibujo} />
        <line x1={610} y1={340} x2={840} y2={340} stroke={C.cian} strokeWidth={12} strokeLinecap="round" opacity={dibujo} />

        <text x={280} y={200} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={44} fill={C.ambar} opacity={sA}>
          {T.pinA}
        </text>
        <text x={730} y={200} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={44} fill={C.cian} opacity={sK}>
          {T.pinK}
        </text>
        <text x={510} y={550} textAnchor="middle" fontFamily={MONO} fontWeight={600} fontSize={28} fill="#2ee59d" opacity={sK}>
          {T.vfTxt}
        </text>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 4: PUENTE RECTIFICADOR DE GRAETZ (4 × 1N4007) ----------
const RUTA_PUENTE = crearRuta([[-4.2, -2.2], [-1.5, -2.2], [1.5, -2.2], [4.2, -2.2], [4.2, 2.2], [-4.2, 2.2]]);

const CircuitoDiodo: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_DIODO[idioma];
  const t = frame / fps;
  const on = interpolate(frame, [20, 55], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Camara
          angulo={interpolate(frame / plan.frames, [0, 1], [-0.3, 0.24])}
          radio={esVertical ? 13.5 : 10.2}
          altura={esVertical ? 11.5 : 8.2}
          objetivo={[0, 0.4, 0]}
          fov={esVertical ? 42 : 36}
        />
        <Estudio bloom={1.3} sombraTam={10} />
        <Placa ancho={15} fondo={10} />
        <Pista puntos={[[-4.2, -2.2], [4.2, -2.2]]} ancho={0.22} />
        <Pista puntos={[[-4.2, 2.2], [4.2, 2.2]]} ancho={0.22} />
        <Pista puntos={[[4.2, -2.2], [4.2, 2.2]]} ancho={0.22} />

        {/* Los 4 diodos 1N4007 del Puente Rectificador + Capacitor de Filtro + LED */}
        <DiodoFlyback desde={[-3.2, -2.2]} hasta={[-0.6, -2.2]} pulso={on * 0.5} />
        <DiodoFlyback desde={[-0.2, -2.2]} hasta={[2.4, -2.2]} pulso={on * 0.5} />
        <DiodoFlyback desde={[-3.2, 2.2]} hasta={[-0.6, 2.2]} pulso={on * 0.5} />
        <DiodoFlyback desde={[-0.2, 2.2]} hasta={[2.4, 2.2]} pulso={on * 0.5} />
        <EncapsuladoKiCad tipo="cap_electrolitico" posicion={[3.2, 0.08, 0]} escala={0.2} />
        <Resistencia desde={[4.2, -1.8]} hasta={[4.2, 0.2]} />
        <Led posicion={[4.2, 0, 1.4]} encendido={on} />

        <Serigrafia texto="D1..D4 PUENTE GRAETZ" p={[-0.5, 0]} tam={0.34} />
        <Electrones ruta={RUTA_PUENTE} n={36} t={t} velocidad={3.6} color={C.cian} radio={0.09} visible={on} />
      </ThreeCanvas>

      <AbsoluteFill style={{ padding: esVertical ? "68px 46px" : 60, gap: 14, alignItems: "flex-start", pointerEvents: "none" }}>
        {[
          { txt: T.puenteTxt, color: C.cian, s: on },
          { txt: T.caidaPuente, color: C.ambar, s: on },
        ].map(({ txt, color, s }) => (
          <div key={txt} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 22px", borderRadius: 14, background: "rgba(7,11,18,0.82)", border: `1px solid ${color}66`, fontFamily: INTER, fontWeight: 700, fontSize: esVertical ? 26 : 28, color, opacity: s }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, background: color, boxShadow: `0 0 16px ${color}` }} />
            {txt}
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 5: CURVA V-I COMPLETA (SILICIO 0.7V VS SCHOTTKY 0.25V VS ZENER -5.1V) ----------
const RegionesDiodo: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_DIODO[idioma];
  const M = MARCAS_DIODO[idioma];

  const schF = marcaFrame(plan, M.schottky, Math.round(plan.frames * 0.35));
  const zenF = marcaFrame(plan, M.zener, Math.round(plan.frames * 0.65));
  const sSch = spring({ frame: frame - schF, fps, config: { damping: 16 } });
  const sZen = spring({ frame: frame - zenF, fps, config: { damping: 16 } });

  const tarjetas = [
    { titulo: T.regSilicio, desc: T.regSilicioDesc, color: C.cian, s: 1 },
    { titulo: T.regSchottky, desc: T.regSchottkyDesc, color: "#2ee59d", s: sSch },
    { titulo: T.regZener, desc: T.regZenerDesc, color: C.ambar, s: sZen },
  ];

  return (
    <AbsoluteFill style={{ padding: esVertical ? "68px 44px" : "52px 72px", flexDirection: esVertical ? "column" : "row", gap: 36, alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ flex: 1.35, width: "100%", padding: "26px 30px", borderRadius: 24, background: "rgba(7,11,18,0.86)", border: "1px solid rgba(61,224,255,0.25)", boxShadow: "0 24px 70px rgba(0,0,0,0.55)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: esVertical ? 28 : 32, color: C.texto }}>{T.curvaTitulo}</div>
          <div style={{ fontFamily: MONO, fontSize: 18, color: C.cian }}>I_D(V_D)</div>
        </div>

        <svg width="100%" viewBox="0 0 920 520">
          {/* Ejes cruzados en el centro (460, 280) */}
          <line x1={80} y1={280} x2={860} y2={280} stroke={C.metal} strokeWidth={3} />
          <line x1={460} y1={50} x2={460} y2={480} stroke={C.metal} strokeWidth={3} />

          {/* Curva Directa Silicio 1N4007 (0.7V) */}
          <path d="M 460 280 L 660 280 Q 710 278 730 70" fill="none" stroke={C.cian} strokeWidth={4.5} />
          <text x={740} y={95} fontFamily={MONO} fontWeight={700} fontSize={18} fill={C.cian}>1N4007 (0.7V)</text>

          {/* Curva Directa Schottky 1N5819 (0.25V) */}
          <path d="M 460 280 L 540 280 Q 575 278 595 70" fill="none" stroke="#2ee59d" strokeWidth={4.5} opacity={sSch} />
          <text x={515} y={65} fontFamily={MONO} fontWeight={700} fontSize={18} fill="#2ee59d" opacity={sSch}>Schottky (0.25V)</text>

          {/* Curva Inversa Zener (-5.1V) */}
          <path d="M 460 280 L 210 280 Q 185 282 175 470" fill="none" stroke={C.ambar} strokeWidth={4.5} opacity={sZen} />
          <text x={110} y={450} fontFamily={MONO} fontWeight={700} fontSize={18} fill={C.ambar} opacity={sZen}>Zener V_Z = −5.1V</text>
        </svg>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18, width: "100%", marginBottom: esVertical ? 190 : 60 }}>
        {tarjetas.map(({ titulo, desc, color, s }) => (
          <div key={titulo} style={{ padding: "20px 24px", borderRadius: 18, background: "rgba(7,11,18,0.85)", border: `1.5px solid ${color}88`, opacity: interpolate(s, [0, 1], [0.15, 1], clamp), transform: `translateX(${(1 - s) * 30}px)` }}>
            <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 24, color }}>{titulo}</div>
            <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 18.5, color: C.texto, marginTop: 6 }}>{desc}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 6: VARIACIONES EN KICAD 9.0 (DO-41 Y DO-35 ZENER) ----------
const CierreDiodo: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_DIODO[idioma];
  const giro = (frame / fps) * 0.6;

  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Camara
          angulo={interpolate(frame / plan.frames, [0, 1], [-0.25, 0.25])}
          radio={esVertical ? 11.5 : 8.8}
          altura={esVertical ? 4.0 : 3.4}
          objetivo={[0, 1.2, 0]}
          fov={esVertical ? 38 : 34}
        />
        <Estudio bloom={1.25} />
        <Placa ancho={14} fondo={8} />
        <EncapsuladoKiCad tipo="diodo_1n4007" posicion={[-2.6, 0.4, 0]} escala={0.42} rotacionY={giro} />
        <EncapsuladoKiCad tipo="diodo_zener" posicion={[2.6, 0.4, 0]} escala={0.42} rotacionY={giro} />
      </ThreeCanvas>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "space-between", padding: esVertical ? "68px 36px 210px" : "48px 60px 140px", pointerEvents: "none" }}>
        <div style={{ display: "flex", flexDirection: esVertical ? "column" : "row", gap: 36 }}>
          {[
            { titulo: T.cardRect, sub: "1N4007 (1000 V) · 1N5819 Schottky (0.25 V)", color: C.cian },
            { titulo: T.cardZener, sub: "1N4733A (5.1 V) · Regulación y Clamping en Inversa", color: C.ambar },
          ].map((c) => (
            <div key={c.titulo} style={{ width: esVertical ? 450 : 500, padding: "24px 28px", borderRadius: 24, background: "rgba(7,11,18,0.85)", border: `1px solid ${c.color}66`, textAlign: "center" }}>
              <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 36, color: C.texto }}>{c.titulo}</div>
              <div style={{ fontFamily: MONO, fontSize: 18, color: c.color, marginTop: 8 }}>{c.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 22, letterSpacing: 4, color: C.texto, textTransform: "uppercase" }}>
          {T.chip}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const COMPONENTES_DIODO: Record<EscenaId, React.FC<EscenaProps>> = {
  intro: IntroDiodo,
  autopsia: AutopsiaDiodo,
  partes: PartesDiodo,
  circuito: CircuitoDiodo,
  regiones: RegionesDiodo,
  cierre: CierreDiodo,
};

export const VideoDiodo: React.FC<VideoProps> = ({ idioma, escenas }) => (
  <AbsoluteFill>
    <Fondo />
    <TransitionSeries>
      {escenas.map((plan, i) => {
        const Escena = COMPONENTES_DIODO[plan.id];
        return (
          <React.Fragment key={plan.id}>
            {i > 0 && <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANS })} />}
            <TransitionSeries.Sequence durationInFrames={plan.frames}>
              <Escena plan={plan} idioma={idioma} />
              {plan.audio && (
                <Sequence from={PRE}>
                  <Audio src={staticFile(plan.audio)} />
                </Sequence>
              )}
              <Subtitulos palabras={plan.palabras} desdeFrame={PRE} />
            </TransitionSeries.Sequence>
          </React.Fragment>
        );
      })}
    </TransitionSeries>
  </AbsoluteFill>
);
