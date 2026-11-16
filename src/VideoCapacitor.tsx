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
import { DATASHEET_CAPACITOR, MARCAS_CAPACITOR, TEXTOS_CAPACITOR } from "./guion-capacitor";
import { Camara } from "./three/Camara";
import {
  Bateria,
  Cable,
  CapAutopsia,
  crearRuta,
  Electrones,
  EncapsuladoKiCad,
  Led,
  Pad,
  Pista,
  Placa,
  Pulsador,
  Resistencia,
  Serigrafia,
  type P2,
} from "./three/componentes";
import { Estudio } from "./three/Estudio";
import { marcaFrame, PRE, TRANS } from "./tiempo";
import type { EscenaProps, VideoProps } from "./Video";

// ---------- ESCENA 1: INTRO CAPACITOR ELECTROLÍTICO + CERÁMICO MLCC ----------
const PISTAS_INTRO_CAP: P2[][] = [
  [[-1.8, 0], [-1.8, -3.2], [-4.8, -3.2]],
  [[1.8, 0], [1.8, -3.2], [4.8, -3.2]],
  [[-1.8, 0], [-1.8, 3.2], [-4.6, 3.2]],
  [[1.8, 0], [1.8, 3.2], [4.6, 3.2]],
];

const IntroCapacitor: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_CAPACITOR[idioma];
  const t = frame / fps;

  const entrada = interpolate(frame, [0, 35], [0, 1], clamp);
  const corriente = interpolate(frame, [25, 65], [0, 1], clamp);
  const tituloF = marcaFrame(plan, MARCAS_CAPACITOR[idioma].titulo, plan.frames - 90) - 12;
  const titulo = spring({ frame: frame - tituloF, fps, config: { damping: 16, stiffness: 110 } });
  const avance = frame / plan.frames;
  const rutas = useMemo(() => PISTAS_INTRO_CAP.map((p) => crearRuta(p)), []);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: entrada }}>
        <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
          <Camara
            angulo={interpolate(avance, [0, 1], [-0.55, 0.42])}
            radio={esVertical ? interpolate(avance, [0, 1], [10.5, 8.2]) : interpolate(avance, [0, 1], [8.2, 6.2])}
            altura={interpolate(avance, [0, 1], [3.2, 4.0])}
            objetivo={[0, 1.3, 0]}
            fov={esVertical ? 38 : 34}
          />
          <Estudio bloom={1.3} />
          <Placa ancho={14} fondo={10} />
          {PISTAS_INTRO_CAP.map((p, i) => (
            <Pista key={i} puntos={p} ancho={0.2} />
          ))}
          {PISTAS_INTRO_CAP.flatMap((p, i) => [
            <Pad key={`a${i}`} p={p[0]} r={0.18} />,
            <Pad key={`b${i}`} p={p[p.length - 1]} r={0.18} />,
          ])}
          <Serigrafia texto="C1 100µF 25V" p={[-1.8, 2.2]} tam={0.32} />
          <Serigrafia texto="C2 100nF MLCC" p={[2.2, 2.2]} tam={0.32} />
          {rutas.map((r, i) => (
            <Electrones
              key={i}
              ruta={r}
              n={7}
              t={t + i * 0.3}
              velocidad={2.2}
              color={i % 2 === 0 ? C.cian : C.ambar}
              radio={0.05}
              visible={corriente}
            />
          ))}
          <EncapsuladoKiCad tipo="cap_electrolitico" posicion={[-1.5, 0.08, 0]} escala={0.22} />
          <EncapsuladoKiCad tipo="cap_ceramico" posicion={[1.8, 0.08, 0]} escala={0.65} />
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
          <span style={{ color: C.ambar, fontWeight: 700 }}>{DATASHEET_CAPACITOR.modelo}</span>
          {!esVertical && <span>{DATASHEET_CAPACITOR.ecuacion}</span>}
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

// ---------- ESCENA 2: AUTOPSIA 3D DEL CAPACITOR ELECTROLÍTICO EN BLENDER 5.0 ----------
const AutopsiaCapacitor: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_CAPACITOR[idioma];
  const M = MARCAS_CAPACITOR[idioma];

  const abrirF = marcaFrame(plan, M.abrimos, 16);
  const alumF = marcaFrame(plan, M.aluminio, Math.round(plan.frames * 0.25));
  const oxidoF = marcaFrame(plan, M.oxido, Math.round(plan.frames * 0.52));
  const valvF = marcaFrame(plan, M.valvula, Math.round(plan.frames * 0.78));

  const apertura = spring({ frame: frame - abrirF, fps, config: { damping: 18, stiffness: 85 } });
  const sAlum = spring({ frame: frame - alumF, fps, config: { damping: 16 } });
  const sOxido = spring({ frame: frame - oxidoF, fps, config: { damping: 16 } });
  const sValv = spring({ frame: frame - valvF, fps, config: { damping: 16 } });

  const capas = [
    { txt: T.capaAnodo, color: "#cbd5e1", s: sAlum },
    { txt: T.capaOxido, color: C.cian, s: sOxido },
    { txt: T.capaPapel, color: C.ambar, s: sOxido },
    { txt: T.capaValvula, color: "#ff5c5c", s: sValv },
  ];

  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Camara
          angulo={interpolate(frame / plan.frames, [0, 1], [-0.42, 0.36])}
          radio={esVertical ? interpolate(apertura, [0, 1], [10.5, 8.6]) : interpolate(apertura, [0, 1], [8.2, 6.4])}
          altura={interpolate(apertura, [0, 1], [3.6, 2.9])}
          objetivo={[esVertical ? 0 : -0.45, 2.0, 0]}
          fov={esVertical ? 38 : 32}
        />
        <Estudio bloom={1.35} />
        <Placa ancho={12} fondo={9} />
        <CapAutopsia posicion={[0, 0.08, 0]} escala={0.32} apertura={apertura} voltaje={sOxido} />
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
              <div style={{ color: C.ambar, fontWeight: 700 }}>Nichicon 100 µF 25 V</div>
              <div>ESR: {DATASHEET_CAPACITOR.esrTipica}</div>
              <div>Temp: {DATASHEET_CAPACITOR.limiteTemperatura}</div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignSelf: esVertical ? "stretch" : "flex-end", marginBottom: esVertical ? 210 : 110, maxWidth: esVertical ? "100%" : 610 }}>
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

// ---------- ESCENA 3: SÍMBOLO ESQUEMÁTICO POLARIZADO VS NO POLARIZADO ----------
const PartesCapacitor: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = TEXTOS_CAPACITOR[idioma];
  const M = MARCAS_CAPACITOR[idioma];

  const dibujo = interpolate(frame, [0, 45], [0, 1], clamp);
  const pop = (clave: string, def: number) => spring({ frame: frame - marcaFrame(plan, clave, def), fps, config: { damping: 15 } });
  const sPos = pop(M.positivo, 35);
  const sNeg = pop(M.negativo, 85);
  const sCer = pop(M.ceramico, 155);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <svg width={1520} height={780} viewBox="-160 0 1320 680" style={{ marginTop: -80 }}>
        {/* Símbolo Electrolítico Polarizado (Izquierda) */}
        <line x1={260} y1={140} x2={260} y2={300} stroke={C.ambar} strokeWidth={10} strokeLinecap="round" {...evolvePath(dibujo, "M 260 140 L 260 300")} />
        <line x1={180} y1={300} x2={340} y2={300} stroke={C.ambar} strokeWidth={12} strokeLinecap="round" opacity={dibujo} />
        <path d="M 180 365 Q 260 330 340 365" fill="none" stroke={C.cian} strokeWidth={12} strokeLinecap="round" opacity={dibujo} />
        <line x1={260} y1={350} x2={260} y2={520} stroke={C.cian} strokeWidth={10} strokeLinecap="round" opacity={dibujo} />
        <text x={150} y={285} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={48} fill={C.ambar} opacity={sPos}>+</text>

        <text x={260} y={95} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} fill={C.ambar} opacity={sPos}>
          {T.pinPos}
        </text>
        <text x={260} y={575} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} fill={C.cian} opacity={sNeg}>
          {T.pinNeg}
        </text>

        {/* Símbolo Cerámico No Polarizado (Derecha) */}
        <g opacity={sCer}>
          <line x1={760} y1={140} x2={760} y2={305} stroke="#2ee59d" strokeWidth={10} strokeLinecap="round" />
          <line x1={680} y1={305} x2={840} y2={305} stroke="#2ee59d" strokeWidth={12} strokeLinecap="round" />
          <line x1={680} y1={355} x2={840} y2={355} stroke="#2ee59d" strokeWidth={12} strokeLinecap="round" />
          <line x1={760} y1={355} x2={760} y2={520} stroke="#2ee59d" strokeWidth={10} strokeLinecap="round" />
          <text x={760} y={95} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} fill="#2ee59d">
            {T.pinNoPol}
          </text>
          <text x={760} y={575} textAnchor="middle" fontFamily={INTER} fontWeight={600} fontSize={26} fill={C.texto}>
            100 nF X7R · Filtrado de Alta Frecuencia
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 4: CIRCUITO DE DESACOPLO Y FILTRADO (100 µF + 100 nF EN PARALELO) ----------
const PISTA_POS: P2[] = [[-4.8, -1.6], [-4.8, -2.5], [4.2, -2.5]];
const PISTA_NEG: P2[] = [[-4.8, 1.6], [-4.8, 2.5], [4.2, 2.5]];
const RUTA_CARGA = crearRuta([...PISTA_POS, [4.2, 2.5], [-4.8, 2.5], [-4.8, 1.6]]);

const CircuitoCapacitor: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_CAPACITOR[idioma];
  const M = MARCAS_CAPACITOR[idioma];
  const t = frame / fps;

  const tanqueF = marcaFrame(plan, M.tanque, 30);
  const picosF = marcaFrame(plan, M.picos, Math.round(plan.frames * 0.55));
  const sTanque = spring({ frame: frame - tanqueF, fps, config: { damping: 16 } });
  const sPicos = spring({ frame: frame - picosF, fps, config: { damping: 16 } });
  const on = interpolate(frame, [20, 55], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Camara
          angulo={interpolate(frame / plan.frames, [0, 1], [-0.3, 0.24])}
          radio={esVertical ? 13.5 : 10.2}
          altura={esVertical ? 11.5 : 8.2}
          objetivo={[0.2, 0.4, 0]}
          fov={esVertical ? 42 : 36}
        />
        <Estudio bloom={1.3} sombraTam={10} />
        <Placa ancho={16} fondo={10} x={-0.6} />
        <Pista puntos={PISTA_POS} ancho={0.24} />
        <Pista puntos={PISTA_NEG} ancho={0.24} />
        <Pista puntos={[[-0.8, -2.5], [-0.8, 2.5]]} ancho={0.2} />
        <Pista puntos={[[1.6, -2.5], [1.6, 2.5]]} ancho={0.18} />
        {[...PISTA_POS, ...PISTA_NEG, [-0.8, 0] as P2, [1.6, 0] as P2].map((p, i) => (
          <Pad key={i} p={p} r={0.18} />
        ))}

        <Bateria posicion={[-6.8, 0.08, 0]} />
        <Cable puntos={[[-5.4, 1.15, -0.55], [-4.9, 0.8, -1.1], [-4.8, 0.12, -1.6]]} color="#c62828" />
        <Cable puntos={[[-5.4, 1.15, 0.55], [-4.9, 0.8, 1.1], [-4.8, 0.12, 1.6]]} color="#15171b" />

        <EncapsuladoKiCad tipo="cap_electrolitico" posicion={[-0.8, 0.08, 0]} escala={0.22} />
        <EncapsuladoKiCad tipo="cap_ceramico" posicion={[1.6, 0.08, 0]} escala={0.62} />
        <Resistencia desde={[2.4, -2.5]} hasta={[4.0, -2.5]} />
        <Led posicion={[4.2, 0, 0]} encendido={on} />

        <Serigrafia texto="C1 100µF" p={[-2.1, 0]} tam={0.34} />
        <Serigrafia texto="C2 100nF" p={[0.45, 0]} tam={0.34} />
        <Serigrafia texto="CARGA" p={[4.2, 3.2]} tam={0.34} />

        <Electrones ruta={RUTA_CARGA} n={38} t={t} velocidad={3.6} color={C.cian} radio={0.095} visible={on} />
      </ThreeCanvas>

      <AbsoluteFill style={{ padding: esVertical ? "68px 46px" : 60, gap: 14, alignItems: "flex-start", pointerEvents: "none" }}>
        {[
          { txt: T.cBulk, color: C.ambar, s: sTanque },
          { txt: T.cDecouple, color: C.cian, s: sPicos },
          { txt: T.formulaRizado, color: "#2ee59d", s: sPicos },
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
              fontSize: esVertical ? 26 : 28,
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

// ---------- ESCENA 5: OSCILOSCOPIO DE RIZADO (ONDA PULSANTE VS FILTRADA) ----------
const RegionesCapacitor: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_CAPACITOR[idioma];
  const M = MARCAS_CAPACITOR[idioma];

  const rizadoF = marcaFrame(plan, M.rizado, 20);
  const contF = marcaFrame(plan, M.continua, Math.round(plan.frames * 0.55));
  const sRiz = spring({ frame: frame - rizadoF, fps, config: { damping: 16 } });
  const sCont = spring({ frame: frame - contF, fps, config: { damping: 16 } });
  const trazo = interpolate(frame, [0, 45], [0, 1], clamp);

  const ondaSinCap = Array.from({ length: 91 })
    .map((_, i) => {
      const u = (i / 90) * trazo;
      const x = 110 + u * 750;
      const y = 450 - Math.abs(Math.sin(u * Math.PI * 4)) * 340;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const ondaConCap = Array.from({ length: 91 })
    .map((_, i) => {
      const u = (i / 90) * trazo;
      const x = 110 + u * 750;
      const diente = ((u * 4) % 1);
      const y = 110 + diente * 42;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const tarjetas = [
    { titulo: T.regSinCap, desc: T.regSinCapDesc, color: "#ff5c5c", s: 1 },
    { titulo: T.regConElect, desc: T.regConElectDesc, color: C.ambar, s: sRiz },
    { titulo: T.regConMlcc, desc: T.regConMlccDesc, color: "#2ee59d", s: sCont },
  ];

  return (
    <AbsoluteFill style={{ padding: esVertical ? "68px 44px" : "52px 72px", flexDirection: esVertical ? "column" : "row", gap: 36, alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ flex: 1.35, width: "100%", padding: "26px 30px", borderRadius: 24, background: "rgba(7,11,18,0.86)", border: "1px solid rgba(61,224,255,0.25)", boxShadow: "0 24px 70px rgba(0,0,0,0.55)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: esVertical ? 28 : 32, color: C.texto }}>{T.oscTitulo}</div>
          <div style={{ fontFamily: MONO, fontSize: 18, color: C.cian }}>100 µF + 100 nF</div>
        </div>

        <svg width="100%" viewBox="0 0 920 520">
          {[110, 225, 340, 450].map((y, idx) => (
            <line key={idx} x1={110} y1={y} x2={860} y2={y} stroke={C.grid} strokeWidth={2} />
          ))}
          <line x1={110} y1={60} x2={110} y2={460} stroke={C.metal} strokeWidth={3} />
          <line x1={110} y1={460} x2={860} y2={460} stroke={C.metal} strokeWidth={3} />

          <text x={96} y={115} textAnchor="end" fontFamily={MONO} fontSize={18} fill="#2ee59d">12V</text>
          <text x={96} y={455} textAnchor="end" fontFamily={MONO} fontSize={18} fill="#ff5c5c">0V</text>

          <path d={ondaSinCap} fill="none" stroke="rgba(255,92,92,0.55)" strokeWidth={3.5} strokeDasharray="8 6" />
          <path d={ondaConCap} fill="none" stroke="#2ee59d" strokeWidth={5} style={{ filter: "drop-shadow(0 0 10px #2ee59d)" }} />
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

// ---------- ESCENA 6: VARIACIONES EN KICAD 9.0 (ELECTROLÍTICO, MLCC 0805 Y TÁNTALO SMD) ----------
const CierreCapacitor: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_CAPACITOR[idioma];
  const giro = (frame / fps) * 0.6;

  const encapsulados = [
    { txt: T.pkgElect, color: C.cian },
    { txt: T.pkgMlcc, color: C.ambar },
    { txt: T.pkgTantalo, color: "#2ee59d" },
  ];

  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Camara
          angulo={interpolate(frame / plan.frames, [0, 1], [-0.25, 0.25])}
          radio={esVertical ? 12.0 : 9.2}
          altura={esVertical ? 4.2 : 3.6}
          objetivo={[0, 1.4, 0]}
          fov={esVertical ? 38 : 34}
        />
        <Estudio bloom={1.25} />
        <Placa ancho={14} fondo={8} />
        <EncapsuladoKiCad tipo="cap_electrolitico" posicion={[-3.2, 0.08, 0]} escala={0.22} rotacionY={giro} />
        <EncapsuladoKiCad tipo="cap_ceramico" posicion={[0, 0.08, 0.4]} escala={0.75} rotacionY={giro} />
        <EncapsuladoKiCad tipo="cap_tantalo" posicion={[3.2, 0.08, 0.3]} escala={0.55} rotacionY={giro} />
      </ThreeCanvas>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "space-between", padding: esVertical ? "68px 36px 210px" : "48px 60px 140px", pointerEvents: "none" }}>
        <div style={{ display: "flex", flexDirection: esVertical ? "column" : "row", gap: 36 }}>
          {[
            { titulo: T.cardElectro, sub: "Gran capacidad (1 µF – 10,000 µF) · Polarizado", color: C.cian },
            { titulo: T.cardMlcc, sub: "Ultra-baja ESR (10 pF – 10 µF) · Sin polaridad", color: C.ambar },
          ].map((c) => (
            <div key={c.titulo} style={{ width: esVertical ? 450 : 500, padding: "24px 28px", borderRadius: 24, background: "rgba(7,11,18,0.85)", border: `1px solid ${c.color}66`, textAlign: "center" }}>
              <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 36, color: C.texto }}>{c.titulo}</div>
              <div style={{ fontFamily: MONO, fontSize: 18, color: c.color, marginTop: 8 }}>{c.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", flexDirection: esVertical ? "column" : "row", gap: 18, justifyContent: "center" }}>
            {encapsulados.map(({ txt, color }) => (
              <div key={txt} style={{ padding: "12px 22px", borderRadius: 14, background: "rgba(7,11,18,0.85)", border: `1px solid ${color}66`, fontFamily: MONO, fontWeight: 700, fontSize: esVertical ? 21 : 20, color }}>
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

const COMPONENTES_CAP: Record<EscenaId, React.FC<EscenaProps>> = {
  intro: IntroCapacitor,
  autopsia: AutopsiaCapacitor,
  partes: PartesCapacitor,
  circuito: CircuitoCapacitor,
  regiones: RegionesCapacitor,
  cierre: CierreCapacitor,
};

export const VideoCapacitor: React.FC<VideoProps> = ({ idioma, escenas }) => (
  <AbsoluteFill>
    <Fondo />
    <TransitionSeries>
      {escenas.map((plan, i) => {
        const Escena = COMPONENTES_CAP[plan.id];
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
