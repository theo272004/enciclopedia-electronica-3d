import { Audio } from "@remotion/media";
import { evolvePath } from "@remotion/paths";
import { ThreeCanvas } from "@remotion/three";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Fondo } from "./componentes/Fondo";
import { AnalogiaFisica, CotaSenal, MultimetroVivo } from "./componentes/HudIngenieria";
import { Subtitulos } from "./componentes/Subtitulos";
import { C, clamp, INTER, MONO } from "./estilo";
import type { EscenaId } from "./guion";
import { DATASHEET_PUENTE_H, MARCAS_PUENTE_H, TEXTOS_PUENTE_H } from "./guion-puente-h";
import { Camara } from "./three/Camara";
import {
  EncapsuladoKiCad,
  MotorDC3D,
  Pad,
  Pista,
  Placa,
  PuenteHAutopsia,
  Serigrafia,
  type P2,
} from "./three/componentes";
import { Estudio } from "./three/Estudio";
import { FlechasFlujo3D } from "./three/Flujo3D";
import { marcaFrame, PRE, TRANS } from "./tiempo";
import type { EscenaProps, VideoProps } from "./Video";

// ---------- ESCENA 1: GANCHO DE CALOR Y PÉRDIDA EN L298N ----------
const PISTAS_INTRO_H: P2[][] = [
  [[-3.8, -0.8], [-1.2, -0.8], [-1.2, 0]],
  [[1.2, 0], [1.2, -0.8], [3.8, -0.8]],
  [[-3.8, 0.9], [0, 0.9], [0, 0]],
];

const IntroPuenteH: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_PUENTE_H[idioma];
  const M = MARCAS_PUENTE_H[idioma];

  const fCalor = marcaFrame(plan, M.calor, Math.round(plan.frames * 0.55));
  const enCalor = frame >= fCalor;
  const titulo = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 120 } });
  const anguloEje = frame * 0.14;

  // Corte rápido de cámara a mitad de escena (ritmo dinámico cada ~3-4s)
  const corteCam = spring({ frame: frame - Math.round(plan.frames * 0.45), fps, config: { damping: 15, stiffness: 140 } });
  const anguloCam = interpolate(corteCam, [0, 1], [-0.45, 0.38]) + interpolate(frame / plan.frames, [0, 1], [0, 0.14]);
  const radioCam = esVertical ? interpolate(corteCam, [0, 1], [11.4, 9.6]) : interpolate(corteCam, [0, 1], [9.4, 7.8]);

  return (
    <AbsoluteFill>
      {enCalor && (
        <Sequence from={fCalor} durationInFrames={24}>
          <Audio src={staticFile("sfx/chispa_electrica.wav")} volume={0.35} />
        </Sequence>
      )}
      <Sequence from={Math.round(plan.frames * 0.45)} durationInFrames={20}>
        <Audio src={staticFile("sfx/whoosh_camara.wav")} volume={0.28} />
      </Sequence>

      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Camara angulo={anguloCam} radio={radioCam} altura={interpolate(corteCam, [0, 1], [3.6, 2.5])} objetivo={[0, 1.3, 0]} fov={esVertical ? 38 : 30} />
        <Estudio bloom={0.55} />
        <Placa ancho={12} fondo={9} color="#0b3d24" />
        {PISTAS_INTRO_H.map((pts, i) => (
          <React.Fragment key={i}>
            <Pista puntos={pts} ancho={0.14} />
            <Pad p={pts[0]} />
          </React.Fragment>
        ))}

        <EncapsuladoKiCad tipo="l298n" posicion={[-1.4, 0.08, 0]} escala={0.16} />
        <EncapsuladoKiCad tipo="disipador_to220" posicion={[-1.4, 0.08, 0.55]} escala={0.15} />
        <MotorDC3D posicion={[2.2, 0.75, 0]} anguloEje={anguloEje} escala={1.25} />

        <FlechasFlujo3D
          puntos={[[-1.4, 0.6, 0], [0.2, 0.6, 0], [1.4, 0.75, 0]]}
          cantidad={4}
          velocidad={0.75}
          color={enCalor ? "#ff5c5c" : "#ffb547"}
          escala={0.075}
        />

        <Serigrafia texto="L298N BJT" p={[-1.4, 2.2]} />
        <Serigrafia texto="MOTOR DC" p={[2.2, 2.2]} />
      </ThreeCanvas>

      <AbsoluteFill style={{ padding: esVertical ? "68px 44px" : "44px 68px", justifyContent: "space-between", pointerEvents: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ padding: "10px 20px", borderRadius: 999, background: "rgba(7,11,18,0.86)", border: "1px solid rgba(255,181,71,0.4)", fontFamily: MONO, fontSize: esVertical ? 18 : 16, color: C.ambar }}>
            {T.badge}
          </div>
          {!esVertical && (
            <MultimetroVivo
              titulo="PÉRDIDA TÉRMICA L298N"
              lecturas={[
                { etiqueta: "V_batería", valor: "7.4", unidad: "V", color: C.texto },
                { etiqueta: "V_motor", valor: enCalor ? "4.9" : "5.4", unidad: "V", color: C.ambar },
                { etiqueta: "Calor IC", valor: enCalor ? "2.50" : "2.00", unidad: "W", alerta: enCalor },
              ]}
              desdeFrame={12}
            />
          )}
        </div>

        <div style={{ alignSelf: "flex-start", marginBottom: esVertical ? 190 : 32, opacity: interpolate(titulo, [0, 1], [0, 1], clamp), transform: `translateY(${(1 - titulo) * 28}px)` }}>
          <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: esVertical ? 74 : 84, lineHeight: 1, letterSpacing: -2.5, color: "#fff", textShadow: "0 12px 35px rgba(0,0,0,0.85)" }}>
            {T.titulo}
          </div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: esVertical ? 20 : 21, letterSpacing: 3, color: C.cian, marginTop: 10 }}>
            {T.subtitulo}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 2: AUTOPSIA 3D EN BLENDER 5.0 CON COTAS ANCLADAS ----------
const AutopsiaPuenteH: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_PUENTE_H[idioma];
  const M = MARCAS_PUENTE_H[idioma];

  const apertura = spring({ frame: frame - 12, fps, config: { damping: 16, stiffness: 80 } });
  const zoomCorte = spring({ frame: frame - Math.round(plan.frames * 0.48), fps, config: { damping: 15, stiffness: 120 } });

  const fCuatro = marcaFrame(plan, M.cuatro, 45);
  const fCobre = marcaFrame(plan, M.cobre, 110);

  return (
    <AbsoluteFill>
      <Sequence from={fCuatro} durationInFrames={15}>
        <Audio src={staticFile("sfx/cota_pop.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={fCobre} durationInFrames={15}>
        <Audio src={staticFile("sfx/cota_pop.wav")} volume={0.3} />
      </Sequence>

      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Camara
          angulo={interpolate(zoomCorte, [0, 1], [-0.32, 0.28])}
          radio={esVertical ? interpolate(zoomCorte, [0, 1], [10.8, 8.2]) : interpolate(zoomCorte, [0, 1], [8.2, 5.8])}
          altura={interpolate(zoomCorte, [0, 1], [3.1, 2.7])}
          objetivo={[0, 2.3, 0]}
          fov={esVertical ? 36 : 30}
        />
        <Estudio bloom={0.55} />
        <Placa ancho={12} fondo={9} color="#0b3d24" />
        <PuenteHAutopsia posicion={[0, 0.08, 0]} escala={0.24} apertura={apertura} diagonalActiva={frame % 120 < 60 ? 1 : 2} />
      </ThreeCanvas>

      <AbsoluteFill style={{ padding: esVertical ? "68px 44px" : "44px 68px", pointerEvents: "none" }}>
        <div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: esVertical ? 20 : 18, letterSpacing: 2.8, color: C.cian }}>
            {T.autopsiaSub}
          </div>
          <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: esVertical ? 42 : 48, color: C.texto, marginTop: 4 }}>
            {T.autopsiaTitulo}
          </div>
        </div>

        {!esVertical && (
          <>
            <CotaSenal x={840} y={360} dx={-210} dy={-55} titulo={T.cotaAlta} detalle="Unión BJT V_CE(sat) ≈ 1.2 V" color="#ff7b29" desdeFrame={fCuatro} />
            <CotaSenal x={1020} y={535} dx={190} dy={-40} titulo={T.cotaBaja} detalle="Conmutación a GND (V_CE ≈ 1.3 V)" color={C.cian} desdeFrame={fCuatro + 18} />
            <CotaSenal x={960} y={450} dx={220} dy={85} titulo={T.cotaCobre} detalle="Disipador metálico trasero" color={C.ambar} desdeFrame={fCobre} />
          </>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 3: ANALOGÍA HIDRÁULICA DE LAS 4 VÁLVULAS EN CRUZ ----------
const PartesPuenteH: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_PUENTE_H[idioma];
  const M = MARCAS_PUENTE_H[idioma];

  const fInvierte = marcaFrame(plan, M.invierte, Math.round(plan.frames * 0.52));
  const reversa = frame >= fInvierte;
  const motorAngulo = reversa ? -(frame - fInvierte) * 0.2 : frame * 0.2;

  return (
    <AbsoluteFill>
      <Sequence from={fInvierte} durationInFrames={16}>
        <Audio src={staticFile("sfx/click_mecanico.wav")} volume={0.45} />
      </Sequence>

      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Camara angulo={reversa ? 0.35 : -0.35} radio={esVertical ? 10.5 : 7.8} altura={3.4} objetivo={[0, 1.4, 0]} fov={esVertical ? 38 : 30} />
        <Estudio bloom={0.5} />
        <Placa ancho={12} fondo={9} color="#0b3d24" />
        <PuenteHAutopsia posicion={[-1.5, 0.08, 0]} escala={0.21} apertura={1} diagonalActiva={reversa ? 2 : 1} />
        <MotorDC3D posicion={[2.0, 1.1, 0]} anguloEje={motorAngulo} escala={1.35} />

        {/* Flechas 3D cambiando de sentido según la diagonal activa */}
        <FlechasFlujo3D
          puntos={reversa ? [[2.0, 1.8, 0], [0.4, 1.8, 0], [-1.0, 1.8, 0]] : [[-1.0, 1.8, 0], [0.4, 1.8, 0], [2.0, 1.8, 0]]}
          cantidad={4}
          velocidad={0.85}
          color={reversa ? "#3de0ff" : "#43f09d"}
          escala={0.08}
        />
      </ThreeCanvas>

      <AbsoluteFill style={{ padding: esVertical ? "68px 44px" : "44px 68px", justifyContent: "space-between", pointerEvents: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <AnalogiaFisica
            conceptoElectrico={T.analogiaConcepto}
            equivalenteFisico={T.analogiaFisico}
            explicacion={T.analogiaDesc}
            desdeFrame={10}
          />
          {!esVertical && (
            <MultimetroVivo
              titulo="SENTIDO DEL MOTOR"
              lecturas={[
                { etiqueta: "Diagonales", valor: reversa ? "Q3 + Q4" : "Q1 + Q2", unidad: "", color: reversa ? C.cian : "#43f09d" },
                { etiqueta: "Polaridad", valor: reversa ? "-7.4" : "+7.4", unidad: "V", color: reversa ? C.cian : "#43f09d" },
                { etiqueta: "Giro Eje", valor: reversa ? "CCW ↺" : "CW ↻", unidad: "", color: C.ambar },
              ]}
              desdeFrame={Math.max(0, fInvierte - 25)}
            />
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 4: CIRCUITO REAL Y TRAMPA DEL CORTOCIRCUITO SHOOT-THROUGH ----------
const CircuitoPuenteH: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_PUENTE_H[idioma];
  const M = MARCAS_PUENTE_H[idioma];

  const fCorto = marcaFrame(plan, M.shootThrough, Math.round(plan.frames * 0.35));
  const enCorto = frame >= fCorto;

  return (
    <AbsoluteFill>
      <Sequence from={fCorto} durationInFrames={22}>
        <Audio src={staticFile("sfx/chispa_electrica.wav")} volume={0.48} />
      </Sequence>

      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Camara angulo={enCorto ? 0.15 : -0.28} radio={esVertical ? 10.2 : 7.2} altura={3.2} objetivo={[0, 1.8, 0]} fov={esVertical ? 38 : 30} />
        <Estudio bloom={enCorto ? 0.9 : 0.5} />
        <Placa ancho={12} fondo={9} color="#0b3d24" />
        <PuenteHAutopsia posicion={[0, 0.08, 0]} escala={0.25} apertura={1} diagonalActiva={enCorto ? 3 : 1} />

        {/* Flecha vertical roja directa VCC -> GND en shoot-through */}
        <FlechasFlujo3D
          puntos={[[-0.8, 3.2, -0.3], [-0.8, 1.9, -0.3], [-0.8, 0.4, -0.3]]}
          cantidad={5}
          velocidad={1.4}
          color="#ff3333"
          escala={0.095}
          activo={enCorto}
        />
      </ThreeCanvas>

      <AbsoluteFill style={{ padding: esVertical ? "68px 44px" : "44px 68px", justifyContent: "space-between", pointerEvents: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: esVertical ? 20 : 18, letterSpacing: 2.8, color: "#ff5c5c" }}>
              {T.circuitoSub}
            </div>
            <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: esVertical ? 40 : 46, color: C.texto, marginTop: 4 }}>
              {T.circuitoTitulo}
            </div>
          </div>

          {!esVertical && (
            <MultimetroVivo
              titulo="CORRIENTE DE RAMA"
              lecturas={[
                { etiqueta: "Estado", valor: enCorto ? "Q1 + Q4 ON" : "Q1 + Q2 ON", unidad: "", alerta: enCorto },
                { etiqueta: "Corriente", valor: enCorto ? "> 15.0" : "1.0", unidad: "A", alerta: enCorto },
                { etiqueta: "Riesgo", valor: enCorto ? "FUSIÓN" : "SEGURO", unidad: "", alerta: enCorto },
              ]}
              desdeFrame={8}
            />
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 5: COMPARATIVA DATASHEET L298N VS DRV8833 ----------
const RegionesPuenteH: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_PUENTE_H[idioma];
  const barProg = spring({ frame: frame - 18, fps, config: { damping: 16 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: esVertical ? "80px 44px" : "48px 70px" }}>
      <div style={{ width: "100%", maxWidth: 1180, background: "rgba(7,11,18,0.90)", border: "1px solid rgba(61,224,255,0.28)", borderRadius: 24, padding: esVertical ? 32 : 44 }}>
        <div style={{ fontFamily: MONO, fontSize: 18, color: C.cian, letterSpacing: 2.5, fontWeight: 700 }}>{T.regionesSub}</div>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: esVertical ? 36 : 44, color: "#fff", marginTop: 6, marginBottom: 32 }}>
          {T.regionesTitulo}
        </div>

        <div style={{ display: "grid", gap: 26 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 22, color: "#ff7b7b", marginBottom: 8 }}>
              <span>ST L298N (BJT Bipolar · Caída ~2.5 V @ 1 A)</span>
              <span>2.50 W en calor</span>
            </div>
            <div style={{ height: 34, borderRadius: 10, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ width: `${barProg * 88}%`, height: "100%", background: "linear-gradient(90deg, #ff5c5c, #ff8f3d)", borderRadius: 10 }} />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 22, color: "#43f09d", marginBottom: 8 }}>
              <span>TI DRV8833 (MOSFET · R_DS(on) 360 mΩ @ 1 A)</span>
              <span>0.36 W (7x menos calor)</span>
            </div>
            <div style={{ height: 34, borderRadius: 10, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ width: `${barProg * 14}%`, height: "100%", background: "linear-gradient(90deg, #3de0ff, #43f09d)", borderRadius: 10 }} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 28, fontFamily: MONO, fontSize: 17, color: C.tenue }}>
          Datasheet L298N: {DATASHEET_PUENTE_H.caidaL298N} · DRV8833: {DATASHEET_PUENTE_H.rdsOnDrv8833}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 6: CIERRE KICAD 9.0 (L298N VS DRV8833 HTSSOP-16) ----------
const CierrePuenteH: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const esVertical = height > width;
  const T = TEXTOS_PUENTE_H[idioma];
  const rot = interpolate(frame / plan.frames, [0, 1], [-0.3, 0.4]);

  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Camara angulo={rot} radio={esVertical ? 10.6 : 7.8} altura={3.1} objetivo={[0, 1.3, 0]} fov={esVertical ? 38 : 30} />
        <Estudio bloom={0.5} />
        <Placa ancho={12} fondo={9} color="#0b3d24" />
        <EncapsuladoKiCad tipo="l298n" posicion={[-2.1, 0.08, 0]} escala={0.18} />
        <EncapsuladoKiCad tipo="drv8833" posicion={[2.1, 0.08, 0]} escala={0.55} />
        <Serigrafia texto="L298N (12-35V)" p={[-2.1, 2.3]} />
        <Serigrafia texto="DRV8833 (BATERIA)" p={[2.1, 2.3]} />
      </ThreeCanvas>

      <AbsoluteFill style={{ padding: esVertical ? "68px 44px" : "44px 68px", justifyContent: "space-between", pointerEvents: "none" }}>
        <div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: esVertical ? 20 : 18, letterSpacing: 2.8, color: C.cian }}>
            {T.cierreSub}
          </div>
          <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: esVertical ? 40 : 48, color: C.texto, marginTop: 4 }}>
            {T.cierreTitulo}
          </div>
        </div>
        <div style={{ alignSelf: "center", marginBottom: esVertical ? 170 : 30, padding: "14px 28px", borderRadius: 999, background: "rgba(7,11,18,0.88)", border: "1px solid rgba(61,224,255,0.45)", fontFamily: MONO, fontSize: esVertical ? 20 : 19, color: C.texto }}>
          {T.cta}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- COMPOSICIÓN PRINCIPAL EPISODIO #07 (ANTI-IA / ALTO RITMO) ----------
const ESCENA_COMP: Record<EscenaId, React.FC<EscenaProps>> = {
  intro: IntroPuenteH,
  autopsia: AutopsiaPuenteH,
  partes: PartesPuenteH,
  circuito: CircuitoPuenteH,
  regiones: RegionesPuenteH,
  cierre: CierrePuenteH,
};

export const VideoPuenteH: React.FC<VideoProps> = ({ idioma, formato, escenas }) => {
  const esVertical = formato === "9:16";
  const trans = linearTiming({ durationInFrames: TRANS });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Fondo />
      <TransitionSeries>
        {escenas.map((esc, i) => {
          const Comp = ESCENA_COMP[esc.id];
          return (
            <React.Fragment key={esc.id}>
              {i > 0 && <TransitionSeries.Transition presentation={fade()} timing={trans} />}
              <TransitionSeries.Sequence durationInFrames={esc.frames}>
                <AbsoluteFill>
                  <Comp plan={esc} idioma={idioma} />
                  {esc.audio && (
                    <Sequence from={PRE}>
                      <Audio src={staticFile(esc.audio)} />
                    </Sequence>
                  )}
                  {/* En 16:9 omitimos subtítulos karaoke genéricos para mantener estética documental real; los Shorts 9:16 los conservan para scroll móvil */}
                  {esVertical && <Subtitulos palabras={esc.palabras} desdeFrame={PRE} />}
                </AbsoluteFill>
              </TransitionSeries.Sequence>
            </React.Fragment>
          );
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
