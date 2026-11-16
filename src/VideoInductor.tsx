import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Fondo } from "./componentes/Fondo";
import { Subtitulos } from "./componentes/Subtitulos";
import { C, clamp, INTER, MONO } from "./estilo";
import type { EscenaId } from "./guion";
import { DATASHEET_INDUCTOR, MARCAS_INDUCTOR, TEXTOS_INDUCTOR } from "./guion-inductor";
import { Camara } from "./three/Camara";
import {
  crearRuta,
  DiodoFlyback,
  Electrones,
  EncapsuladoKiCad,
  InductorAutopsia,
  Led,
  Pad,
  Pista,
  Placa,
  Serigrafia,
  type P2,
} from "./three/componentes";
import { Estudio } from "./three/Estudio";
import { marcaFrame, PRE, TRANS } from "./tiempo";
import type { EscenaProps, VideoProps } from "./Video";

// ---------- ESCENA 1: INTRO INDUCTORES REALES EN KICAD 9.0 ----------
const PISTAS_INTRO_IND: P2[][] = [
  [[-3.8, 0], [3.8, 0]],
  [[-3.8, -2.5], [3.8, -2.5]],
];

const IntroInductor: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_INDUCTOR[idioma];
  const t = frame / fps;

  const entrada = interpolate(frame, [0, 35], [0, 1], clamp);
  const corriente = interpolate(frame, [25, 65], [0, 1], clamp);
  const tituloF = marcaFrame(plan, MARCAS_INDUCTOR[idioma].titulo, plan.frames - 90) - 12;
  const titulo = spring({ frame: frame - tituloF, fps, config: { damping: 16, stiffness: 110 } });
  const avance = frame / plan.frames;
  const ruta = useMemo(() => crearRuta(PISTAS_INTRO_IND[0]), []);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: entrada }}>
        <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
          <Camara
            angulo={interpolate(avance, [0, 1], [-0.55, 0.42])}
            radio={esVertical ? interpolate(avance, [0, 1], [10.8, 8.6]) : interpolate(avance, [0, 1], [8.4, 6.4])}
            altura={interpolate(avance, [0, 1], [3.4, 4.0])}
            objetivo={[0, 1.2, 0]}
            fov={esVertical ? 38 : 34}
          />
          <Estudio bloom={1.3} />
          <Placa ancho={14} fondo={10} />
          {PISTAS_INTRO_IND.map((p, i) => (
            <Pista key={i} puntos={p} ancho={0.22} />
          ))}
          <Pad p={[-3.8, 0]} r={0.2} />
          <Pad p={[3.8, 0]} r={0.2} />
          <Serigrafia texto="L1 33µH BOURNS SRR1260" p={[0, 2.5]} tam={0.32} />
          <Electrones ruta={ruta} n={14} t={t} velocidad={2.6} color={C.cian} radio={0.06} visible={corriente} />
          <EncapsuladoKiCad tipo="inductor_smd" posicion={[0, 0.08, 0]} escala={0.28} />
        </ThreeCanvas>
      </AbsoluteFill>

      <AbsoluteFill style={{ padding: esVertical ? "68px 46px" : "46px 64px", pointerEvents: "none" }}>
        <div style={{ alignSelf: "flex-start", display: "flex", gap: 18, padding: "12px 22px", borderRadius: 14, background: "rgba(7,11,18,0.8)", border: "1px solid rgba(61,224,255,0.28)", fontFamily: MONO, fontSize: esVertical ? 19 : 18, color: C.texto, opacity: corriente }}>
          <span style={{ color: C.ambar, fontWeight: 700 }}>{DATASHEET_INDUCTOR.modelo}</span>
          {!esVertical && <span>{DATASHEET_INDUCTOR.ecuacion}</span>}
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

// ---------- ESCENA 2: AUTOPSIA 3D DEL INDUCTOR BOURNS SRR1260 EN BLENDER 5.0 ----------
const AutopsiaInductor: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_INDUCTOR[idioma];
  const M = MARCAS_INDUCTOR[idioma];

  const abrirF = marcaFrame(plan, M.abrimos, 16);
  const ferrF = marcaFrame(plan, M.ferrita, Math.round(plan.frames * 0.3));
  const flujoF = marcaFrame(plan, M.flujo, Math.round(plan.frames * 0.58));

  const apertura = spring({ frame: frame - abrirF, fps, config: { damping: 18, stiffness: 85 } });
  const sFerr = spring({ frame: frame - ferrF, fps, config: { damping: 16 } });
  const sFlujo = spring({ frame: frame - flujoF, fps, config: { damping: 16 } });
  const pulso = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 3);

  const capas = [
    { txt: T.capaFerrita, color: "#94a3b8", s: sFerr },
    { txt: T.capaCobre, color: C.ambar, s: sFerr },
    { txt: T.capaFlujo, color: C.cian, s: sFlujo },
    { txt: T.capaEscudo, color: "#2ee59d", s: sFlujo },
  ];

  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Camara
          angulo={interpolate(frame / plan.frames, [0, 1], [-0.42, 0.36])}
          radio={esVertical ? interpolate(apertura, [0, 1], [10.5, 8.6]) : interpolate(apertura, [0, 1], [8.2, 6.4])}
          altura={interpolate(apertura, [0, 1], [3.6, 2.9])}
          objetivo={[esVertical ? 0 : -0.45, 1.5, 0]}
          fov={esVertical ? 38 : 32}
        />
        <Estudio bloom={1.35} />
        <Placa ancho={12} fondo={9} />
        <InductorAutopsia posicion={[0, 0.08, 0]} escala={0.34} apertura={apertura} corriente={sFlujo * pulso} />
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
              <div style={{ color: C.ambar, fontWeight: 700 }}>Bourns SRR1260-330M</div>
              <div>L: {DATASHEET_INDUCTOR.inductancia}</div>
              <div>DCR: {DATASHEET_INDUCTOR.dcr}</div>
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

// ---------- ESCENA 3: SÍMBOLO ESQUEMÁTICO Y LÍMITE DE SATURACIÓN ----------
const PartesInductor: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = TEXTOS_INDUCTOR[idioma];
  const M = MARCAS_INDUCTOR[idioma];

  const dibujo = interpolate(frame, [0, 45], [0, 1], clamp);
  const satF = marcaFrame(plan, M.saturacion, 120);
  const sSat = spring({ frame: frame - satF, fps, config: { damping: 15 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <svg width={1520} height={780} viewBox="-160 0 1320 680" style={{ marginTop: -80 }}>
        {/* Símbolo de Inductor con Núcleo de Ferrita */}
        <path
          d="M 160 350 L 280 350 A 45 45 0 0 1 370 350 A 45 45 0 0 1 460 350 A 45 45 0 0 1 550 350 A 45 45 0 0 1 640 350 L 760 350"
          fill="none"
          stroke={C.ambar}
          strokeWidth={12}
          strokeLinecap="round"
          opacity={dibujo}
        />
        <line x1={275} y1={275} x2={645} y2={275} stroke={C.cian} strokeWidth={8} strokeLinecap="round" opacity={dibujo} />
        <line x1={275} y1={250} x2={645} y2={250} stroke={C.cian} strokeWidth={8} strokeLinecap="round" opacity={dibujo} />

        <text x={460} y={195} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={42} fill={C.ambar} opacity={dibujo}>
          {T.pinL}
        </text>
        <text x={460} y={485} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={28} fill="#ff5c5c" opacity={sSat}>
          {T.isatTxt}
        </text>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 4: CONVERTIDOR BUCK EN 3D (12V → 5V CON INDUCTOR + SCHOTTKY + CAPACITOR) ----------
const RUTA_BUCK = crearRuta([[-4.5, -2.0], [0, -2.0], [3.8, -2.0], [3.8, 2.0], [-4.5, 2.0]]);

const CircuitoInductor: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_INDUCTOR[idioma];
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
        <Pista puntos={[[-4.5, -2.0], [3.8, -2.0]]} ancho={0.24} />
        <Pista puntos={[[-4.5, 2.0], [3.8, 2.0]]} ancho={0.24} />
        <Pista puntos={[[-1.8, -2.0], [-1.8, 2.0]]} ancho={0.2} />

        {/* MOSFET Conmutador + Diodo Schottky 1N5819 + Inductor Bourns 33µH + Capacitor Salida */}
        <EncapsuladoKiCad tipo="dpak" posicion={[-3.4, 0.08, -2.0]} escala={0.48} />
        <DiodoFlyback desde={[-1.8, 1.6]} hasta={[-1.8, -1.4]} pulso={on * 0.6} />
        <EncapsuladoKiCad tipo="inductor_smd" posicion={[0.6, 0.08, -2.0]} escala={0.22} />
        <EncapsuladoKiCad tipo="cap_electrolitico" posicion={[2.8, 0.08, 0]} escala={0.2} />
        <Led posicion={[3.8, 0, 0]} encendido={on} />

        <Serigrafia texto="BUCK 12V -> 5V (92%)" p={[0.4, 3.1]} tam={0.34} />
        <Electrones ruta={RUTA_BUCK} n={36} t={t} velocidad={3.8} color={C.cian} radio={0.095} visible={on} />
      </ThreeCanvas>

      <AbsoluteFill style={{ padding: esVertical ? "68px 46px" : 60, gap: 14, alignItems: "flex-start", pointerEvents: "none" }}>
        {[
          { txt: T.buckOn, color: C.cian, s: on },
          { txt: T.buckOff, color: C.ambar, s: on },
          { txt: T.eficienciaTxt, color: "#2ee59d", s: on },
        ].map(({ txt, color, s }) => (
          <div key={txt} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 22px", borderRadius: 14, background: "rgba(7,11,18,0.82)", border: `1px solid ${color}66`, fontFamily: INTER, fontWeight: 700, fontSize: esVertical ? 25 : 27, color, opacity: s }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, background: color, boxShadow: `0 0 16px ${color}` }} />
            {txt}
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 5: COMPARATIVA EFICIENCIA (LINEAL 7805 14W CALOR VS BUCK 92%) ----------
const RegionesInductor: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_INDUCTOR[idioma];
  const trazo = interpolate(frame, [0, 45], [0, 1], clamp);

  const tarjetas = [
    { titulo: T.regLineal, desc: T.regLinealDesc, color: "#ff5c5c", s: 1 },
    { titulo: T.regBuck, desc: T.regBuckDesc, color: "#2ee59d", s: trazo },
    { titulo: T.regSat, desc: T.regSatDesc, color: C.ambar, s: trazo },
  ];

  return (
    <AbsoluteFill style={{ padding: esVertical ? "68px 44px" : "52px 72px", flexDirection: esVertical ? "column" : "row", gap: 36, alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ flex: 1.35, width: "100%", padding: "26px 30px", borderRadius: 24, background: "rgba(7,11,18,0.86)", border: "1px solid rgba(61,224,255,0.25)", boxShadow: "0 24px 70px rgba(0,0,0,0.55)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: esVertical ? 27 : 30, color: C.texto }}>{T.oscTitulo}</div>
          <div style={{ fontFamily: MONO, fontSize: 18, color: "#2ee59d" }}>92% Eficiencia</div>
        </div>

        <svg width="100%" viewBox="0 0 920 520">
          <line x1={110} y1={60} x2={110} y2={460} stroke={C.metal} strokeWidth={3} />
          <line x1={110} y1={460} x2={860} y2={460} stroke={C.metal} strokeWidth={3} />

          <rect x={210} y={460 - 360 * trazo} width={180} height={360 * trazo} rx={12} fill="rgba(255,92,92,0.28)" stroke="#ff5c5c" strokeWidth={3.5} />
          <text x={300} y={495} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={20} fill="#ff5c5c">Lineal LM7805</text>
          <text x={300} y={460 - 360 * trazo - 16} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill="#ff5c5c">14.0 W Quemados</text>

          <rect x={530} y={460 - 38 * trazo} width={180} height={38 * trazo} rx={12} fill="rgba(46,229,157,0.28)" stroke="#2ee59d" strokeWidth={3.5} />
          <text x={620} y={495} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={20} fill="#2ee59d">Buck + Inductor</text>
          <text x={620} y={460 - 38 * trazo - 16} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill="#2ee59d">0.9 W (92% Efic.)</text>
        </svg>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18, width: "100%", marginBottom: esVertical ? 190 : 60 }}>
        {tarjetas.map(({ titulo, desc, color, s }) => (
          <div key={titulo} style={{ padding: "20px 24px", borderRadius: 18, background: "rgba(7,11,18,0.85)", border: `1.5px solid ${color}88`, opacity: s }}>
            <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 23, color }}>{titulo}</div>
            <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 18, color: C.texto, marginTop: 6 }}>{desc}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 6: VARIACIONES EN KICAD 9.0 (RADIAL, SMD BOURNS Y TOROIDE EPCOS) ----------
const CierreInductor: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_INDUCTOR[idioma];
  const giro = (frame / fps) * 0.6;

  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Camara
          angulo={interpolate(frame / plan.frames, [0, 1], [-0.25, 0.25])}
          radio={esVertical ? 12.5 : 9.6}
          altura={esVertical ? 4.4 : 3.8}
          objetivo={[0, 1.4, 0]}
          fov={esVertical ? 38 : 34}
        />
        <Estudio bloom={1.25} />
        <Placa ancho={14} fondo={8} />
        <EncapsuladoKiCad tipo="inductor_radial" posicion={[-3.4, 0.08, 0]} escala={0.22} rotacionY={giro} />
        <EncapsuladoKiCad tipo="inductor_smd" posicion={[0, 0.08, 0]} escala={0.22} rotacionY={giro} />
        <EncapsuladoKiCad tipo="inductor_toroidal" posicion={[3.4, 0.08, 0]} escala={0.14} rotacionY={giro} />
      </ThreeCanvas>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "space-between", padding: esVertical ? "68px 36px 210px" : "48px 60px 140px", pointerEvents: "none" }}>
        <div style={{ display: "flex", flexDirection: esVertical ? "column" : "row", gap: 36 }}>
          {[
            { titulo: T.cardRadial, sub: "Almacenamiento magnético en Convertidores DC-DC", color: C.cian },
            { titulo: T.cardChoke, sub: "Bloqueo de ruido de alta frecuencia (Filtro EMI)", color: C.ambar },
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

const COMPONENTES_INDUCTOR: Record<EscenaId, React.FC<EscenaProps>> = {
  intro: IntroInductor,
  autopsia: AutopsiaInductor,
  partes: PartesInductor,
  circuito: CircuitoInductor,
  regiones: RegionesInductor,
  cierre: CierreInductor,
};

export const VideoInductor: React.FC<VideoProps> = ({ idioma, escenas }) => (
  <AbsoluteFill>
    <Fondo />
    <TransitionSeries>
      {escenas.map((plan, i) => {
        const Escena = COMPONENTES_INDUCTOR[plan.id];
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
