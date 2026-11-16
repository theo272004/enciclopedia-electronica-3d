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
import { DATASHEET_IRFZ44N, MARCAS_MOSFET, TEXTOS_MOSFET } from "./guion-mosfet";
import { Camara } from "./three/Camara";
import {
  Bateria,
  Cable,
  crearRuta,
  Electrones,
  EncapsuladoKiCad,
  Led,
  MosfetAutopsia,
  Pad,
  Pista,
  Placa,
  Pulsador,
  Resistencia,
  Serigrafia,
  type CapaMosfet,
  type P2,
} from "./three/componentes";
import { Estudio } from "./three/Estudio";
import { marcaFrame, PRE, TRANS } from "./tiempo";
import type { EscenaProps, VideoProps } from "./Video";

// ---------- ESCENA 1: INTRO COMPARATIVA TO-220 (BJT vs MOSFET IRFZ44N) ----------
const PISTAS_INTRO_MOSFET: P2[][] = [
  [[-2.2, 0], [-2.2, -3.2], [-5.2, -3.2]],
  [[2.2, 0], [2.2, -3.2], [5.2, -3.2]],
  [[-2.2, 0], [-2.2, 3.2], [-4.8, 3.2]],
  [[2.2, 0], [2.2, 3.2], [4.8, 3.2]],
];

const IntroMosfet: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_MOSFET[idioma];
  const t = frame / fps;

  const entrada = interpolate(frame, [0, 35], [0, 1], clamp);
  const corriente = interpolate(frame, [25, 65], [0, 1], clamp);
  const tituloF = marcaFrame(plan, MARCAS_MOSFET[idioma].titulo, plan.frames - 90) - 12;
  const titulo = spring({ frame: frame - tituloF, fps, config: { damping: 16, stiffness: 110 } });
  const avance = frame / plan.frames;
  const rutas = useMemo(() => PISTAS_INTRO_MOSFET.map((p) => crearRuta(p)), []);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: entrada }}>
        <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
          <Camara
            angulo={interpolate(avance, [0, 1], [-0.55, 0.42])}
            radio={esVertical ? interpolate(avance, [0, 1], [11.2, 8.8]) : interpolate(avance, [0, 1], [8.5, 6.4])}
            altura={interpolate(avance, [0, 1], [3.2, 4.0])}
            objetivo={[0, 1.4, 0]}
            fov={esVertical ? 38 : 34}
          />
          <Estudio bloom={1.3} />
          <Placa ancho={14} fondo={10} />
          {PISTAS_INTRO_MOSFET.map((p, i) => (
            <Pista key={i} puntos={p} ancho={0.22} />
          ))}
          {PISTAS_INTRO_MOSFET.flatMap((p, i) => [
            <Pad key={`a${i}`} p={p[0]} r={0.2} />,
            <Pad key={`b${i}`} p={p[p.length - 1]} r={0.2} />,
          ])}
          <Serigrafia texto="Q1 TIP31C (BJT)" p={[-2.2, 2.2]} tam={0.32} />
          <Serigrafia texto="Q2 IRFZ44N (MOSFET)" p={[2.2, 2.2]} tam={0.32} />
          {rutas.map((r, i) => (
            <Electrones
              key={i}
              ruta={r}
              n={8}
              t={t + i * 0.3}
              velocidad={2.4}
              color={i % 2 === 0 ? C.ambar : C.cian}
              radio={0.055}
              visible={corriente}
            />
          ))}
          <EncapsuladoKiCad tipo="to220" posicion={[-2.2, 0.08, 0]} escala={0.2} />
          <EncapsuladoKiCad tipo="to220" posicion={[2.2, 0.08, 0]} escala={0.2} />
        </ThreeCanvas>
      </AbsoluteFill>

      <AbsoluteFill style={{ padding: esVertical ? "68px 46px" : "46px 64px", pointerEvents: "none" }}>
        <div
          style={{
            alignSelf: "flex-start",
            display: "flex",
            gap: 18,
            padding: "12px 22px",
            borderRadius: 14,
            background: "rgba(7,11,18,0.8)",
            border: "1px solid rgba(61,224,255,0.28)",
            fontFamily: MONO,
            fontSize: esVertical ? 19 : 18,
            color: C.texto,
            opacity: corriente,
          }}
        >
          <span style={{ color: C.ambar, fontWeight: 700 }}>{DATASHEET_IRFZ44N.modelo}</span>
          <span>I_D: {DATASHEET_IRFZ44N.idMax}</span>
          {!esVertical && <span>R_DS(on): {DATASHEET_IRFZ44N.rdsOn}</span>}
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
              fontSize: esVertical ? 22 : 25,
              letterSpacing: 4,
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

// ---------- ESCENA 2: AUTOPSIA 3D DEL MOSFET HEXFET IRFZ44N EN BLENDER 5.0 ----------
const AutopsiaMosfet: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_MOSFET[idioma];
  const M = MARCAS_MOSFET[idioma];

  const abrirF = marcaFrame(plan, M.abrimos, 16);
  const oxidoF = marcaFrame(plan, M.oxido, Math.round(plan.frames * 0.28));
  const canalF = marcaFrame(plan, M.canal, Math.round(plan.frames * 0.55));
  const mohmF = marcaFrame(plan, M.miliohmios, Math.round(plan.frames * 0.76));

  const apertura = spring({ frame: frame - abrirF, fps, config: { damping: 18, stiffness: 85 } });
  const campoGate = spring({ frame: frame - canalF, fps, config: { damping: 16 } });
  const sOxido = spring({ frame: frame - oxidoF, fps, config: { damping: 16 } });
  const sCanal = spring({ frame: frame - canalF, fps, config: { damping: 16 } });
  const sMohm = spring({ frame: frame - mohmF, fps, config: { damping: 16 } });

  let resaltar: CapaMosfet = "todas";
  if (frame >= mohmF) resaltar = "drenador";
  else if (frame >= canalF) resaltar = "canal";
  else if (frame >= oxidoF) resaltar = "oxido";

  const capas = [
    { txt: T.capaOxido, color: "#a855f7", s: sOxido },
    { txt: T.capaCanal, color: C.ambar, s: sCanal },
    { txt: T.capaDrenador, color: C.cian, s: sMohm },
    { txt: T.capaFuente, color: "#2ee59d", s: sMohm },
  ];

  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Camara
          angulo={interpolate(frame / plan.frames, [0, 1], [-0.42, 0.35])}
          radio={esVertical ? interpolate(apertura, [0, 1], [10.5, 8.6]) : interpolate(apertura, [0, 1], [8.5, 6.8])}
          altura={interpolate(apertura, [0, 1], [3.6, 3.0])}
          objetivo={[esVertical ? 0 : -0.5, 2.0, 0]}
          fov={esVertical ? 38 : 32}
        />
        <Estudio bloom={1.35} />
        <Placa ancho={12} fondo={9} />
        <MosfetAutopsia posicion={[0, 0.08, 0]} escala={0.22} apertura={apertura} campoGate={campoGate} resaltar={resaltar} />
      </ThreeCanvas>

      <AbsoluteFill
        style={{
          padding: esVertical ? "70px 48px" : "48px 70px",
          justifyContent: "space-between",
          pointerEvents: "none",
        }}
      >
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
            <div
              style={{
                padding: "14px 22px",
                borderRadius: 14,
                background: "rgba(7,11,18,0.82)",
                border: "1px solid rgba(61,224,255,0.3)",
                fontFamily: MONO,
                fontSize: 17,
                color: C.texto,
                lineHeight: 1.5,
              }}
            >
              <div style={{ color: C.ambar, fontWeight: 700 }}>{DATASHEET_IRFZ44N.modelo}</div>
              <div>R_DS(on): {DATASHEET_IRFZ44N.rdsOn}</div>
              <div>C_iss: {DATASHEET_IRFZ44N.ciss}</div>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignSelf: esVertical ? "stretch" : "flex-end",
            marginBottom: esVertical ? 210 : 110,
            maxWidth: esVertical ? "100%" : 610,
          }}
        >
          {capas.map(({ txt, color, s }) => (
            <div
              key={txt}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 20px",
                borderRadius: 14,
                background: "rgba(7,11,18,0.84)",
                border: `1px solid ${color}66`,
                fontFamily: INTER,
                fontWeight: 600,
                fontSize: esVertical ? 23 : 22,
                color: C.texto,
                opacity: interpolate(s, [0, 1], [0, 1], clamp),
                transform: `translateX(${(1 - s) * 35}px)`,
              }}
            >
              <span style={{ width: 14, height: 14, borderRadius: 7, background: color, boxShadow: `0 0 14px ${color}`, flexShrink: 0 }} />
              <span>{txt}</span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 3: SÍMBOLO ESQUEMÁTICO MOSFET CANAL N Y LA TRAMPA DE V_GS(th) ----------
const PartesMosfet: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = TEXTOS_MOSFET[idioma];
  const M = MARCAS_MOSFET[idioma];

  const dibujo = interpolate(frame, [0, 45], [0, 1], clamp);
  const pop = (clave: string, def: number) => spring({ frame: frame - marcaFrame(plan, clave, def), fps, config: { damping: 15 } });
  const sG = pop(M.compuerta, 35);
  const sD = pop(M.drenador, 75);
  const sS = pop(M.fuente, 115);
  const sDiez = pop(M.diez, 220);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <svg width={1520} height={780} viewBox="-160 0 1320 680" style={{ marginTop: -80 }}>
        <circle cx={510} cy={350} r={175} fill="rgba(61,224,255,0.04)" stroke={C.cable} strokeWidth={4} opacity={dibujo} />

        {/* Compuerta aislada (Gate) */}
        <path
          d="M 240 430 L 420 430 L 420 270"
          fill="none"
          stroke={sG > 0.5 ? "#a855f7" : C.metal}
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...evolvePath(dibujo, "M 240 430 L 420 430 L 420 270")}
        />

        {/* Los 3 segmentos del canal (Enhancement Mode N-Channel) */}
        <line x1={460} y1={255} x2={460} y2={295} stroke={C.cian} strokeWidth={12} strokeLinecap="round" opacity={dibujo} />
        <line x1={460} y1={330} x2={460} y2={370} stroke={C.cian} strokeWidth={12} strokeLinecap="round" opacity={dibujo} />
        <line x1={460} y1={405} x2={460} y2={445} stroke={C.cian} strokeWidth={12} strokeLinecap="round" opacity={dibujo} />

        {/* Drenador (Drain) y Fuente (Source) */}
        <path d="M 460 275 L 570 275 L 570 130" fill="none" stroke={sD > 0.5 ? C.ambar : C.metal} strokeWidth={10} strokeLinecap="round" />
        <path d="M 460 350 L 570 350 L 570 570" fill="none" stroke={sS > 0.5 ? "#2ee59d" : C.metal} strokeWidth={10} strokeLinecap="round" />
        <line x1={460} y1={425} x2={570} y2={425} stroke={sS > 0.5 ? "#2ee59d" : C.metal} strokeWidth={10} strokeLinecap="round" />

        {/* Etiquetas */}
        <text x={215} y={425} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={44} fill="#a855f7" opacity={sG}>
          {T.pinG}
        </text>
        <text x={215} y={465} textAnchor="end" fontFamily={INTER} fontWeight={600} fontSize={26} fill={C.texto} opacity={sG}>
          Aislada por SiO2 (I_G = 0 A)
        </text>

        <text x={600} y={155} textAnchor="start" fontFamily={MONO} fontWeight={700} fontSize={44} fill={C.ambar} opacity={sD}>
          {T.pinD}
        </text>
        <text x={600} y={555} textAnchor="start" fontFamily={MONO} fontWeight={700} fontSize={44} fill="#2ee59d" opacity={sS}>
          {T.pinS}
        </text>

        {/* Alerta de la trampa de V_GS(th) vs V_GS = 10V */}
        <g opacity={sDiez} transform={`translate(620 310)`}>
          <rect x={0} y={0} width={545} height={115} rx={16} fill="rgba(7,11,18,0.9)" stroke={C.ambar} strokeWidth={2.5} />
          <text x={24} y={44} fontFamily={MONO} fontWeight={700} fontSize={24} fill="#ff5c5c">
            V_GS(th) = 2–4 V → Solo 250 µA
          </text>
          <text x={24} y={84} fontFamily={MONO} fontWeight={700} fontSize={24} fill="#2ee59d">
            V_GS = 10 V → Canal 100% (17.5 mΩ)
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 4: CIRCUITO DE CONMUTACIÓN MOSFET + RESISTENCIA PULL-DOWN ----------
const PISTA_DRENADOR: P2[] = [[-4.8, -1.6], [-4.8, -3.6], [2.4, -3.6], [2.4, 0.5]];
const PISTA_FUENTE: P2[] = [[3.6, 0.5], [3.6, 3.8], [-4.8, 3.8], [-4.8, 1.6]];
const PISTA_GATE: P2[] = [[-2.5, -3.6], [-2.5, 2.2], [1.8, 2.2], [1.8, 0.5]];
const PISTA_PULLDOWN: P2[] = [[1.2, 2.2], [1.2, 3.8]];

const RUTA_POTENCIA = crearRuta([...PISTA_DRENADOR, ...PISTA_FUENTE]);
const RUTA_CARGA_GATE = crearRuta(PISTA_GATE);

const CircuitoMosfet: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_MOSFET[idioma];
  const M = MARCAS_MOSFET[idioma];
  const t = frame / fps;

  const capF = marcaFrame(plan, M.capacitor, 30);
  const pdF = marcaFrame(plan, M.pulldown, Math.round(plan.frames * 0.65));

  const sCap = spring({ frame: frame - capF, fps, config: { damping: 16 } });
  const sPd = spring({ frame: frame - pdF, fps, config: { damping: 16 } });
  const on = interpolate(frame, [40, 75], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Camara
          angulo={interpolate(frame / plan.frames, [0, 1], [-0.3, 0.24])}
          radio={esVertical ? 13.5 : 10.2}
          altura={esVertical ? 11.5 : 8.5}
          objetivo={[0.5, 0.4, -0.4]}
          fov={esVertical ? 42 : 36}
        />
        <Estudio bloom={1.3} sombraTam={10} />
        <Placa ancho={16} fondo={10.5} x={-0.9} />
        <Pista puntos={PISTA_DRENADOR} ancho={0.26} />
        <Pista puntos={PISTA_FUENTE} ancho={0.26} />
        <Pista puntos={PISTA_GATE} ancho={0.18} />
        <Pista puntos={PISTA_PULLDOWN} ancho={0.16} />
        {[...PISTA_DRENADOR, ...PISTA_FUENTE, ...PISTA_GATE, ...PISTA_PULLDOWN].map((p, i) => (
          <Pad key={i} p={p} r={0.18} />
        ))}

        <Bateria posicion={[-6.95, 0.08, 0]} />
        <Cable puntos={[[-5.55, 1.15, -0.55], [-5.0, 1.0, -0.9], [-4.8, 0.12, -1.6]]} color="#c62828" />
        <Cable puntos={[[-5.55, 1.15, 0.55], [-5.0, 1.0, 0.9], [-4.8, 0.12, 1.6]]} color="#15171b" />

        {/* MOSFET IRFZ44N TO-220 + R_Gate 22Ω + R_PullDown 10kΩ + Carga */}
        <EncapsuladoKiCad tipo="to220" posicion={[2.6, 0.08, 0.5]} escala={0.2} />
        <Resistencia desde={[-1.6, 2.2]} hasta={[0.4, 2.2]} />
        <Resistencia desde={[1.2, 2.2]} hasta={[1.2, 3.8]} />
        <Pulsador p={[-2.5, -0.8]} presion={on} />
        <Led posicion={[2.4, 0, -2.4]} encendido={on} />

        <Serigrafia texto="Q1 IRFZ44N" p={[4.5, 0.8]} tam={0.34} />
        <Serigrafia texto="R_G 22Ω" p={[-0.6, 1.55]} tam={0.32} />
        <Serigrafia texto="R_PD 10kΩ" p={[2.5, 3.1]} tam={0.32} />

        <Electrones ruta={RUTA_CARGA_GATE} n={8} t={t} velocidad={2.5} color="#a855f7" radio={0.07} visible={on} />
        <Electrones ruta={RUTA_POTENCIA} n={44} t={t} velocidad={4.8} color={C.cian} radio={0.11} visible={on} />
      </ThreeCanvas>

      <AbsoluteFill style={{ padding: esVertical ? "68px 46px" : 60, gap: 14, alignItems: "flex-start", pointerEvents: "none" }}>
        {[
          { txt: T.ciss, color: "#a855f7", s: sCap },
          { txt: T.rg, color: C.cian, s: sPd },
          { txt: T.vgs, color: "#2ee59d", s: on },
        ].map(({ txt, color, s }) => (
          <div
            key={txt}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 22px",
              borderRadius: 14,
              background: "rgba(7,11,18,0.82)",
              border: `1px solid ${color}66`,
              fontFamily: INTER,
              fontWeight: 700,
              fontSize: esVertical ? 27 : 29,
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

// ---------- ESCENA 5: COMPARATIVA TÉRMICA A 10 AMPERIOS (BJT 12 W VS MOSFET 1.75 W) ----------
const RegionesMosfet: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_MOSFET[idioma];
  const M = MARCAS_MOSFET[idioma];

  const doceF = marcaFrame(plan, M.doce, 20);
  const ohmF = marcaFrame(plan, M.ohmica, Math.round(plan.frames * 0.5));

  const sBjt = spring({ frame: frame - doceF, fps, config: { damping: 16 } });
  const sMos = spring({ frame: frame - ohmF, fps, config: { damping: 16 } });
  const trazo = interpolate(frame, [0, 45], [0, 1], clamp);

  const tarjetas = [
    { titulo: T.regBjt, desc: T.regBjtDesc, color: "#ff5c5c", s: sBjt },
    { titulo: T.regMosfet, desc: T.regMosfetDesc, color: "#2ee59d", s: sMos },
    { titulo: T.regTrampa, desc: T.regTrampaDesc, color: C.ambar, s: sMos },
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
          <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: esVertical ? 28 : 32, color: C.texto }}>{T.termicoTitulo}</div>
          <div style={{ fontFamily: MONO, fontSize: 18, color: C.cian }}>P_D = I² · R_DS(on)</div>
        </div>

        <svg width="100%" viewBox="0 0 920 520">
          {[80, 175, 270, 365, 460].map((y, idx) => (
            <line key={idx} x1={110} y1={y} x2={860} y2={y} stroke={C.grid} strokeWidth={2} />
          ))}
          <line x1={110} y1={60} x2={110} y2={460} stroke={C.metal} strokeWidth={3} />
          <line x1={110} y1={460} x2={860} y2={460} stroke={C.metal} strokeWidth={3} />

          <text x={96} y={88} textAnchor="end" fontFamily={MONO} fontSize={18} fill="#ff5c5c">12.0W</text>
          <text x={96} y={275} textAnchor="end" fontFamily={MONO} fontSize={18} fill={C.tenue}>6.0W</text>
          <text x={96} y={405} textAnchor="end" fontFamily={MONO} fontSize={18} fill="#2ee59d">1.75W</text>
          <text x={96} y={455} textAnchor="end" fontFamily={MONO} fontSize={18} fill={C.tenue}>0W</text>

          {/* Barra / Curva de Calor BJT (P = 1.2V * I) */}
          <rect
            x={210}
            y={460 - 372 * trazo}
            width={180}
            height={372 * trazo}
            rx={12}
            fill="rgba(255,92,92,0.28)"
            stroke="#ff5c5c"
            strokeWidth={3.5}
          />
          <text x={300} y={495} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={20} fill="#ff5c5c">
            BJT TIP31C (10 A)
          </text>
          <text x={300} y={460 - 372 * trazo - 16} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={24} fill="#ff5c5c">
            12.0 W (Calor)
          </text>

          {/* Barra / Curva de Calor MOSFET IRFZ44N (P = I^2 * 0.0175 = 1.75W) */}
          <rect
            x={530}
            y={460 - 58 * trazo}
            width={180}
            height={58 * trazo}
            rx={12}
            fill="rgba(46,229,157,0.28)"
            stroke="#2ee59d"
            strokeWidth={3.5}
          />
          <text x={620} y={495} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={20} fill="#2ee59d">
            MOSFET IRFZ44N (10 A)
          </text>
          <text x={620} y={460 - 58 * trazo - 16} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={24} fill="#2ee59d">
            1.75 W (−85% Calor)
          </text>
        </svg>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18, width: "100%", marginBottom: esVertical ? 190 : 60 }}>
        {tarjetas.map(({ titulo, desc, color, s }) => (
          <div
            key={titulo}
            style={{
              padding: "20px 24px",
              borderRadius: 18,
              background: "rgba(7,11,18,0.85)",
              border: `1.5px solid ${color}88`,
              opacity: interpolate(s, [0, 1], [0.15, 1], clamp),
              transform: `translateX(${(1 - s) * 30}px)`,
            }}
          >
            <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 24, color }}>{titulo}</div>
            <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 18.5, color: C.texto, marginTop: 6 }}>{desc}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 6: VARIACIONES EN KICAD 9.0 (TO-220, SOT-223 SMD Y DISIPADOR) ----------
const CierreMosfet: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_MOSFET[idioma];
  const giro = (frame / fps) * 0.6;

  const encapsulados = [
    { txt: T.pkgTo220, color: C.cian },
    { txt: T.pkgDpak, color: C.ambar },
    { txt: T.pkgHeatsink, color: "#2ee59d" },
  ];

  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Camara
          angulo={interpolate(frame / plan.frames, [0, 1], [-0.25, 0.25])}
          radio={esVertical ? 12.5 : 9.6}
          altura={esVertical ? 4.4 : 3.8}
          objetivo={[0, 1.5, 0]}
          fov={esVertical ? 38 : 34}
        />
        <Estudio bloom={1.25} />
        <Placa ancho={14} fondo={8} />
        <EncapsuladoKiCad tipo="to220" posicion={[-3.4, 0.08, 0]} escala={0.18} rotacionY={giro} />
        <EncapsuladoKiCad tipo="dpak" posicion={[0, 0.08, 0.4]} escala={0.42} rotacionY={giro} />
        <EncapsuladoKiCad tipo="disipador_to220" posicion={[3.4, 0.08, 0]} escala={0.12} rotacionY={giro} />
      </ThreeCanvas>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "space-between",
          padding: esVertical ? "68px 36px 210px" : "48px 60px 140px",
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", flexDirection: esVertical ? "column" : "row", gap: 36 }}>
          {[
            { titulo: T.bjtCard, sub: "Control por corriente I_B · Bajo costo en señal pequeña", color: C.ambar },
            { titulo: T.mosfetCard, sub: "Control por voltaje V_GS · R_DS(on) = 17.5 mΩ en potencia", color: C.cian },
          ].map((c) => (
            <div
              key={c.titulo}
              style={{
                width: esVertical ? 450 : 500,
                padding: "24px 28px",
                borderRadius: 24,
                background: "rgba(7,11,18,0.85)",
                border: `1px solid ${c.color}66`,
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 38, color: C.texto }}>{c.titulo}</div>
              <div style={{ fontFamily: MONO, fontSize: 18, color: c.color, marginTop: 8 }}>{c.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", flexDirection: esVertical ? "column" : "row", gap: 18, justifyContent: "center" }}>
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
                  fontSize: esVertical ? 21 : 20,
                  color,
                }}
              >
                {txt}
              </div>
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 22, letterSpacing: 4, color: C.texto, marginTop: 16, textTransform: "uppercase" }}>
            {T.chip}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const COMPONENTES_MOSFET: Record<EscenaId, React.FC<EscenaProps>> = {
  intro: IntroMosfet,
  autopsia: AutopsiaMosfet,
  partes: PartesMosfet,
  circuito: CircuitoMosfet,
  regiones: RegionesMosfet,
  cierre: CierreMosfet,
};

export const VideoMosfet: React.FC<VideoProps> = ({ idioma, escenas }) => (
  <AbsoluteFill>
    <Fondo />
    <TransitionSeries>
      {escenas.map((plan, i) => {
        const Escena = COMPONENTES_MOSFET[plan.id];
        return (
          <React.Fragment key={plan.id}>
            {i > 0 && (
              <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANS })} />
            )}
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
