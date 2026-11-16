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
import { DATASHEET_G5LE, MARCAS_RELE, TEXTOS_RELE } from "./guion-rele";
import { Camara } from "./three/Camara";
import {
  Bateria,
  Cable,
  crearRuta,
  DiodoFlyback,
  Electrones,
  EncapsuladoKiCad,
  Led,
  Pad,
  Pista,
  Placa,
  Pulsador,
  ReleAutopsia,
  Resistencia,
  Serigrafia,
  Transistor,
  type CapaRele,
  type P2,
} from "./three/componentes";
import { Estudio } from "./three/Estudio";
import { marcaFrame, PRE, TRANS } from "./tiempo";
import type { EscenaProps, VideoProps } from "./Video";

// ---------- ESCENA 1: INTRO RELÉ OMRON G5LE-1 ----------
const PISTAS_INTRO_RELE: P2[][] = [
  [[-1.8, -1.2], [-1.8, -3.5], [-4.5, -3.5]],
  [[1.8, -1.2], [1.8, -3.5], [4.5, -3.5]],
  [[0, 1.4], [0, 3.8], [-3.8, 3.8]],
  [[-1.8, 1.4], [-4.8, 1.4], [-4.8, -1.2]],
  [[1.8, 1.4], [4.8, 1.4], [4.8, 3.6]],
];

const IntroRele: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_RELE[idioma];
  const t = frame / fps;

  const entrada = interpolate(frame, [0, 35], [0, 1], clamp);
  const corriente = interpolate(frame, [25, 65], [0, 1], clamp);
  const tituloF = marcaFrame(plan, MARCAS_RELE[idioma].titulo, plan.frames - 90) - 12;
  const titulo = spring({ frame: frame - tituloF, fps, config: { damping: 16, stiffness: 110 } });
  const avance = frame / plan.frames;
  const rutas = useMemo(() => PISTAS_INTRO_RELE.map((p) => crearRuta(p)), []);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: entrada }}>
        <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
          <Camara
            angulo={interpolate(avance, [0, 1], [-0.65, 0.42])}
            radio={esVertical ? interpolate(avance, [0, 1], [11.5, 9.2]) : interpolate(avance, [0, 1], [9.0, 6.8])}
            altura={interpolate(avance, [0, 1], [3.4, 4.2])}
            objetivo={[0, 1.3, 0]}
            fov={esVertical ? 38 : 34}
          />
          <Estudio bloom={1.3} />
          <Placa ancho={14} fondo={10} />
          {PISTAS_INTRO_RELE.map((p, i) => (
            <Pista key={i} puntos={p} ancho={0.18} />
          ))}
          {PISTAS_INTRO_RELE.flatMap((p, i) => [
            <Pad key={`a${i}`} p={p[0]} r={0.18} />,
            <Pad key={`b${i}`} p={p[p.length - 1]} r={0.18} />,
          ])}
          <Serigrafia texto="K1 G5LE-1" p={[-2.2, 2.5]} tam={0.34} />
          {rutas.map((r, i) => (
            <Electrones
              key={i}
              ruta={r}
              n={6}
              t={t + i * 0.35}
              velocidad={1.8}
              color={i % 2 === 0 ? C.ambar : C.cian}
              radio={0.05}
              visible={corriente}
            />
          ))}
          <EncapsuladoKiCad tipo="rele_spdt" posicion={[0, 0.08, 0]} escala={0.16} />
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
          <span style={{ color: C.ambar, fontWeight: 700 }}>{DATASHEET_G5LE.modelo}</span>
          <span>Bobina: {DATASHEET_G5LE.bobina}</span>
          {!esVertical && <span>Contactos: {DATASHEET_G5LE.contactos}</span>}
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

// ---------- ESCENA 2: AUTOPSIA 3D EN BLENDER 5.0 ----------
const AutopsiaRele: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_RELE[idioma];
  const M = MARCAS_RELE[idioma];

  const abrirF = marcaFrame(plan, M.abrimos, 16);
  const bobinaF = marcaFrame(plan, M.bobina, Math.round(plan.frames * 0.25));
  const armF = marcaFrame(plan, M.armadura, Math.round(plan.frames * 0.5));
  const contF = marcaFrame(plan, M.contactos, Math.round(plan.frames * 0.72));

  const apertura = spring({ frame: frame - abrirF, fps, config: { damping: 18, stiffness: 85 } });
  const activado = spring({ frame: frame - armF, fps, config: { damping: 14, stiffness: 120 } });
  const sBobina = spring({ frame: frame - bobinaF, fps, config: { damping: 16 } });
  const sArm = spring({ frame: frame - armF, fps, config: { damping: 16 } });
  const sCont = spring({ frame: frame - contF, fps, config: { damping: 16 } });

  let resaltar: CapaRele = "todas";
  if (frame >= contF) resaltar = "contactos";
  else if (frame >= armF) resaltar = "armadura";
  else if (frame >= bobinaF) resaltar = "bobina";

  const capas = [
    { txt: T.capaBobina, color: C.ambar, s: sBobina },
    { txt: T.capaNucleo, color: "#94a3b8", s: sBobina },
    { txt: T.capaArmadura, color: "#ffd166", s: sArm },
    { txt: T.capaContactos, color: C.cian, s: sCont },
  ];

  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Camara
          angulo={interpolate(frame / plan.frames, [0, 1], [-0.45, 0.35])}
          radio={esVertical ? interpolate(apertura, [0, 1], [11.2, 9.2]) : interpolate(apertura, [0, 1], [9.2, 7.6])}
          altura={interpolate(apertura, [0, 1], [3.6, 2.9])}
          objetivo={[esVertical ? 0 : -0.45, 1.85, 0]}
          fov={esVertical ? 38 : 32}
        />
        <Estudio bloom={1.35} />
        <Placa ancho={12} fondo={9} />
        <ReleAutopsia posicion={[0, 0.08, 0]} escala={0.135} apertura={apertura} activado={activado} resaltar={resaltar} />
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
              <div style={{ color: C.ambar, fontWeight: 700 }}>{DATASHEET_G5LE.modelo}</div>
              <div>Aislamiento: {DATASHEET_G5LE.aislamiento}</div>
              <div>Cierre: {DATASHEET_G5LE.tiempoOperacion}</div>
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
            maxWidth: esVertical ? "100%" : 580,
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
                fontSize: esVertical ? 24 : 23,
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

// ---------- ESCENA 3: SÍMBOLO ESQUEMÁTICO SPDT Y 5 PINES ----------
const PartesRele: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = TEXTOS_RELE[idioma];
  const M = MARCAS_RELE[idioma];

  const dibujo = interpolate(frame, [0, 45], [0, 1], clamp);
  const pop = (clave: string, def: number) => spring({ frame: frame - marcaFrame(plan, clave, def), fps, config: { damping: 15 } });
  const sCom = pop(M.comun, 60);
  const sNc = pop(M.cerrado, 110);
  const sNo = pop(M.abierto, 160);
  const conmuta = interpolate(frame, [160, 195], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <svg width={1520} height={780} viewBox="-160 0 1320 680" style={{ marginTop: -80 }}>
        {/* Caja del Relé */}
        <rect
          x={260}
          y={110}
          width={480}
          height={440}
          rx={24}
          fill="rgba(61,224,255,0.04)"
          stroke={C.cable}
          strokeWidth={4}
          strokeDasharray="12 10"
          opacity={dibujo}
        />

        {/* Bobina A1 - A2 (Izquierda) */}
        <line x1={160} y1={210} x2={340} y2={210} stroke={C.ambar} strokeWidth={8} strokeLinecap="round" {...evolvePath(dibujo, "M 160 210 L 340 210")} />
        <rect x={300} y={210} width={80} height={240} rx={12} fill="rgba(255,181,71,0.12)" stroke={C.ambar} strokeWidth={6} opacity={dibujo} />
        <line x1={300} y1={370} x2={380} y2={290} stroke={C.ambar} strokeWidth={5} opacity={dibujo} />
        <line x1={160} y1={450} x2={340} y2={450} stroke={C.ambar} strokeWidth={8} strokeLinecap="round" {...evolvePath(dibujo, "M 160 450 L 340 450")} />

        {/* Línea de acoplamiento magnético */}
        <line x1={405} y1={330} x2={545} y2={330} stroke={C.cian} strokeWidth={4} strokeDasharray="10 8" opacity={dibujo} />

        {/* Contactos SPDT (Derecha): COM, NC, NO */}
        <line x1={590} y1={470} x2={830} y2={470} stroke={C.cian} strokeWidth={8} strokeLinecap="round" />
        <circle cx={590} cy={470} r={11} fill={C.cian} />

        {/* NC (Arriba izquierda del contacto) */}
        <line x1={540} y1={210} x2={830} y2={210} stroke={sNc > 0.5 ? C.cian : C.metal} strokeWidth={8} strokeLinecap="round" />
        <circle cx={540} cy={210} r={11} fill={sNc > 0.5 ? C.cian : C.metal} />

        {/* NO (Arriba derecha del contacto) */}
        <line x1={640} y1={290} x2={830} y2={290} stroke={sNo > 0.5 ? C.ambar : C.metal} strokeWidth={8} strokeLinecap="round" />
        <circle cx={640} cy={290} r={11} fill={sNo > 0.5 ? C.ambar : C.metal} />

        {/* Palanca móvil COM */}
        <line
          x1={590}
          y1={470}
          x2={interpolate(conmuta, [0, 1], [542, 638])}
          y2={interpolate(conmuta, [0, 1], [220, 290])}
          stroke={conmuta > 0.5 ? C.ambar : C.cian}
          strokeWidth={10}
          strokeLinecap="round"
        />

        {/* Etiquetas */}
        <text x={140} y={205} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={32} fill={C.ambar}>
          {T.pinBobina}
        </text>
        <text x={140} y={242} textAnchor="end" fontFamily={INTER} fontWeight={600} fontSize={24} fill={C.texto}>
          5 V · 70 Ω (71.4 mA)
        </text>

        <text x={850} y={218} textAnchor="start" fontFamily={MONO} fontWeight={700} fontSize={32} fill={C.cian} opacity={sNc}>
          {T.pinNc}
        </text>
        <text x={850} y={298} textAnchor="start" fontFamily={MONO} fontWeight={700} fontSize={32} fill={C.ambar} opacity={sNo}>
          {T.pinNo}
        </text>
        <text x={850} y={478} textAnchor="start" fontFamily={MONO} fontWeight={700} fontSize={32} fill={C.cian} opacity={sCom}>
          {T.pinCom}
        </text>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 4: CIRCUITO REAL + DIODO FLYBACK 1N4007 ----------
const PISTA_BOBINA: P2[] = [[-4.8, -1.6], [-4.8, -3.6], [2.4, -3.6], [2.4, 0.5]];
const PISTA_GND: P2[] = [[3.6, 0.5], [3.6, 3.8], [-4.8, 3.8], [-4.8, 1.6]];
const PISTA_BASE: P2[] = [[-2.5, -3.6], [-2.5, 2.2], [3.0, 2.2], [3.0, 0.5]];
const LAZO_FLYBACK: P2[] = [[2.4, -1.4], [0.2, -1.4], [0.2, -3.6], [2.4, -3.6], [2.4, -1.4]];

const RUTA_BOBINA = crearRuta([...PISTA_BOBINA, ...PISTA_GND]);
const RUTA_BASE = crearRuta(PISTA_BASE);
const RUTA_FLYBACK = crearRuta(LAZO_FLYBACK);

const CircuitoRele: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_RELE[idioma];
  const M = MARCAS_RELE[idioma];
  const t = frame / fps;

  const apagaF = marcaFrame(plan, M.apaga, Math.round(plan.frames * 0.35));
  const diodoF = marcaFrame(plan, M.diodo, Math.round(plan.frames * 0.62));

  // El relé empieza encendido y en apagaF se corta la base, disparando el pulso flyback por el diodo 1N4007
  const encendido = frame < apagaF ? interpolate(frame, [15, 45], [0, 1], clamp) : interpolate(frame, [apagaF, apagaF + 18], [1, 0], clamp);
  const pulsoFlyback = frame >= apagaF ? interpolate(frame, [apagaF, apagaF + 15, plan.frames - 20], [0, 1, 0.25], clamp) : 0;
  const sApaga = spring({ frame: frame - apagaF, fps, config: { damping: 16 } });
  const sDiodo = spring({ frame: frame - diodoF, fps, config: { damping: 16 } });

  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Camara
          angulo={interpolate(frame / plan.frames, [0, 1], [-0.3, 0.24])}
          radio={esVertical ? 13.5 : 10.2}
          altura={esVertical ? 11.5 : 8.5}
          objetivo={[0.5, 0.4, -0.5]}
          fov={esVertical ? 42 : 36}
        />
        <Estudio bloom={1.3} sombraTam={10} />
        <Placa ancho={16} fondo={10.5} x={-0.9} />
        <Pista puntos={PISTA_BOBINA} />
        <Pista puntos={PISTA_GND} />
        <Pista puntos={PISTA_BASE} />
        <Pista puntos={LAZO_FLYBACK} />
        {[...PISTA_BOBINA, ...PISTA_GND, ...PISTA_BASE, ...LAZO_FLYBACK].map((p, i) => (
          <Pad key={i} p={p} r={0.17} />
        ))}

        <Bateria posicion={[-6.95, 0.08, 0]} />
        <Cable puntos={[[-5.55, 1.15, -0.55], [-5.0, 1.0, -0.9], [-4.8, 0.12, -1.6]]} color="#c62828" />
        <Cable puntos={[[-5.55, 1.15, 0.55], [-5.0, 1.0, 0.9], [-4.8, 0.12, 1.6]]} color="#15171b" />

        {/* Relé Omron G5LE-1 + Diodo Flyback 1N4007 en antiparalelo + Transistor impulsor 2N2222A */}
        <EncapsuladoKiCad tipo="rele_spdt" posicion={[2.4, 0.08, -2.5]} escala={0.13} />
        <DiodoFlyback desde={[0.2, -3.2]} hasta={[0.2, -1.2]} pulso={pulsoFlyback} />
        <Resistencia desde={[-1.7, 2.2]} hasta={[0.3, 2.2]} />
        <Pulsador p={[-2.5, -0.8]} presion={encendido} />
        <Transistor posicion={[3, 0, 0.5]} />
        <Led posicion={[4.6, 0, -2.5]} encendido={encendido} />

        <Serigrafia texto="K1 G5LE" p={[2.4, -4.2]} tam={0.34} />
        <Serigrafia texto="D1 1N4007" p={[-1.2, -2.2]} tam={0.34} />
        <Serigrafia texto="Q1 2N2222A" p={[4.7, 1.2]} tam={0.32} />
        <Serigrafia texto="R1 1kΩ" p={[-0.7, 2.85]} tam={0.34} />

        <Electrones ruta={RUTA_BASE} n={10} t={t} velocidad={2.2} color={C.cian} radio={0.07} visible={encendido} />
        <Electrones ruta={RUTA_BOBINA} n={36} t={t} velocidad={3.8} color={C.ambar} radio={0.09} visible={encendido} />
        {/* Corriente de recirculación por el diodo Flyback 1N4007 al apagar la bobina */}
        <Electrones ruta={RUTA_FLYBACK} n={18} t={t} velocidad={3.2} color="#2ee59d" radio={0.095} visible={pulsoFlyback} />
      </ThreeCanvas>

      <AbsoluteFill style={{ padding: esVertical ? "68px 46px" : 60, gap: 14, alignItems: "flex-start", pointerEvents: "none" }}>
        {[
          { txt: T.icBobina, color: C.ambar, s: 1 },
          { txt: T.picoSinDiodo, color: "#ff5c5c", s: sApaga },
          { txt: T.clampConDiodo, color: "#2ee59d", s: sDiodo },
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
              fontSize: esVertical ? 28 : 30,
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

// ---------- ESCENA 5: OSCILOSCOPIO DE PICO INDUCTIVO (-320V VS CLAMP 5.7V) ----------
const RegionesRele: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_RELE[idioma];
  const M = MARCAS_RELE[idioma];

  const picoF = marcaFrame(plan, M.pico, 20);
  const clampF = marcaFrame(plan, M.frenado, Math.round(plan.frames * 0.52));

  const sPico = spring({ frame: frame - picoF, fps, config: { damping: 16 } });
  const sClamp = spring({ frame: frame - clampF, fps, config: { damping: 16 } });
  const trazo = interpolate(frame, [0, 50], [0, 1], clamp);

  // Curva roja: sin diodo flyback (sube de 0.3V a un pico letal de 320V en t=30%)
  const curvaSinDiodo = Array.from({ length: 81 })
    .map((_, i) => {
      const u = (i / 80) * trazo;
      const x = 110 + u * 750;
      let y = 410; // 5V base
      if (u < 0.28) y = 445; // saturado a 0.3V
      else if (u < 0.36) {
        const p = Math.sin(((u - 0.28) / 0.08) * Math.PI);
        y = 445 - p * 365; // Pico hasta 320V!
      } else {
        y = 410 - Math.exp(-(u - 0.36) * 14) * 40 * Math.cos((u - 0.36) * 50);
      }
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  // Curva verde/cian: con diodo 1N4007 (clampeada a 5.7V)
  const curvaConDiodo = Array.from({ length: 81 })
    .map((_, i) => {
      const u = (i / 80) * trazo;
      const x = 110 + u * 750;
      let y = 410;
      if (u < 0.28) y = 445;
      else if (u < 0.52) y = 398; // Clampeado plano a 5.7V mientras el diodo conduce
      else y = 410;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const tarjetas = [
    { titulo: T.regSin, desc: T.regSinDesc, color: "#ff5c5c", s: sPico },
    { titulo: T.regCon, desc: T.regConDesc, color: "#2ee59d", s: sClamp },
    { titulo: T.regBounce, desc: T.regBounceDesc, color: C.ambar, s: sClamp },
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
          <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: esVertical ? 28 : 32, color: C.texto }}>{T.oscTitulo}</div>
          <div style={{ fontFamily: MONO, fontSize: 18, color: C.cian }}>D1 = 1N4007 (V_RRM 1000V)</div>
        </div>

        <svg width="100%" viewBox="0 0 920 520">
          {/* Cuadrícula */}
          {[80, 180, 280, 380, 460].map((y, idx) => (
            <line key={idx} x1={110} y1={y} x2={860} y2={y} stroke={C.grid} strokeWidth={2} />
          ))}
          {/* Límite de ruptura V_CEO = 40V del 2N2222A */}
          <line x1={110} y1={340} x2={860} y2={340} stroke="#ff5c5c" strokeWidth={2.5} strokeDasharray="8 6" />
          <text x={850} y={330} textAnchor="end" fontFamily={MONO} fontSize={16} fill="#ff5c5c">
            Límite V_CEO = 40 V (Ruptura Q1)
          </text>

          {/* Ejes */}
          <line x1={110} y1={60} x2={110} y2={460} stroke={C.metal} strokeWidth={3} />
          <line x1={110} y1={460} x2={860} y2={460} stroke={C.metal} strokeWidth={3} />

          <text x={96} y={88} textAnchor="end" fontFamily={MONO} fontSize={18} fill="#ff5c5c">320V</text>
          <text x={96} y={345} textAnchor="end" fontFamily={MONO} fontSize={18} fill="#ff5c5c">40V</text>
          <text x={96} y={405} textAnchor="end" fontFamily={MONO} fontSize={18} fill="#2ee59d">5.7V</text>
          <text x={96} y={455} textAnchor="end" fontFamily={MONO} fontSize={18} fill={C.tenue}>0V</text>

          {/* Trazo Rojo: Pico Inductivo sin Diodo */}
          <path d={curvaSinDiodo} fill="none" stroke="#ff5c5c" strokeWidth={4} style={{ filter: "drop-shadow(0 0 10px #ff5c5c)" }} />
          {/* Trazo Verde: Con Diodo Flyback 1N4007 */}
          <path d={curvaConDiodo} fill="none" stroke="#2ee59d" strokeWidth={4.5} opacity={sClamp} style={{ filter: "drop-shadow(0 0 10px #2ee59d)" }} />

          <circle cx={350} cy={80} r={10} fill="#ff5c5c" opacity={sPico} />
          <text x={370} y={86} fontFamily={MONO} fontWeight={700} fontSize={20} fill="#ff5c5c" opacity={sPico}>
            Pico Inductivo: +320 V (Sin Diodo)
          </text>

          <text x={450} y={384} fontFamily={MONO} fontWeight={700} fontSize={20} fill="#2ee59d" opacity={sClamp}>
            Clamping con 1N4007: 5.7 V
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
            <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 25, color }}>{titulo}</div>
            <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 19, color: C.texto, marginTop: 6 }}>{desc}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 6: VARIACIONES EN KICAD 9.0 (SPDT, DPDT FINDER, SMD Y SSR) ----------
const CierreRele: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_RELE[idioma];
  const giro = (frame / fps) * 0.6;

  const encapsulados = [
    { txt: T.pkgSpdt, color: C.cian },
    { txt: T.pkgDpdt, color: C.ambar },
    { txt: T.pkgSmd, color: "#2ee59d" },
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
        <EncapsuladoKiCad tipo="rele_spdt" posicion={[-3.4, 0.08, 0]} escala={0.13} rotacionY={giro} />
        <EncapsuladoKiCad tipo="rele_dpdt" posicion={[0, 0.08, 0]} escala={0.11} rotacionY={giro} />
        <EncapsuladoKiCad tipo="rele_smd" posicion={[3.4, 0.08, 0.3]} escala={0.28} rotacionY={giro} />
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
            { titulo: T.emec, sub: "Aislamiento 2,000 V · Cero caída V_CE · ≤ 10 ms", color: C.cian },
            { titulo: T.ssr, sub: "Optotriac sin partes móviles · Conmutación silenciosa", color: C.ambar },
          ].map((c) => (
            <div
              key={c.titulo}
              style={{
                width: esVertical ? 440 : 480,
                padding: "24px 28px",
                borderRadius: 24,
                background: "rgba(7,11,18,0.85)",
                border: `1px solid ${c.color}66`,
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 40, color: C.texto }}>{c.titulo}</div>
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

const COMPONENTES_RELE: Record<EscenaId, React.FC<EscenaProps>> = {
  intro: IntroRele,
  autopsia: AutopsiaRele,
  partes: PartesRele,
  circuito: CircuitoRele,
  regiones: RegionesRele,
  cierre: CierreRele,
};

export const VideoRele: React.FC<VideoProps> = ({ idioma, escenas }) => (
  <AbsoluteFill>
    <Fondo />
    <TransitionSeries>
      {escenas.map((plan, i) => {
        const Escena = COMPONENTES_RELE[plan.id];
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
