import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp, INTER, MONO } from "../estilo";
import { MARCAS, TEXTOS } from "../guion";
import { marcaFrame } from "../tiempo";
import type { EscenaProps } from "../Video";

// Símbolo NPN (viewBox 1000×700)
const BASE = "M 260 350 L 460 350";
const COLECTOR = "M 460 310 L 560 240 L 560 120";
const EMISOR = "M 460 390 L 560 460 L 560 580";
const FLUJO = "M 560 120 L 560 240 L 460 310 L 460 390 L 560 460 L 560 580";
const LARGO = getLength(FLUJO);

export const Partes: React.FC<EscenaProps> = ({ plan, idioma }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = TEXTOS[idioma];
  const M = MARCAS[idioma];

  const dibujo = interpolate(frame, [0, 50], [0, 1], clamp);
  const pop = (clave: string) => spring({ frame: frame - marcaFrame(plan, clave), fps, config: { damping: 14 } });
  const b = pop(M.base);
  const c = pop(M.colector);
  const e = pop(M.emisor);
  const llaveF = marcaFrame(plan, M.llave, plan.frames / 2);
  const flujo = interpolate(frame, [llaveF, llaveF + 30], [0, 1], clamp);
  const latido = 0.5 + 0.5 * Math.sin((frame - llaveF) / 6);

  const lead = (d: string, activo: number, color: string) => (
    <path
      d={d}
      fill="none"
      stroke={activo > 0.5 ? color : C.metal}
      strokeWidth={10}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: activo > 0.5 ? `drop-shadow(0 0 12px ${color})` : undefined }}
      {...evolvePath(dibujo, d)}
    />
  );

  const etiqueta = (x: number, y: number, letra: string, nombre: string, s: number, ancla: "start" | "end") => (
    <g opacity={s} transform={`translate(${x} ${y}) scale(${0.8 + 0.2 * s})`}>
      <text textAnchor={ancla} fontFamily={MONO} fontWeight={700} fontSize={56} fill={C.cian} y={-6}>
        {letra}
      </text>
      <text textAnchor={ancla} fontFamily={INTER} fontWeight={600} fontSize={30} fill={C.texto} y={34}>
        {nombre}
      </text>
    </g>
  );

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <svg width={1150} height={805} viewBox="0 0 1000 700" style={{ marginTop: -110 }}>
        <circle
          cx={510}
          cy={350}
          r={165}
          fill="rgba(61,224,255,0.04)"
          stroke={C.cable}
          strokeWidth={4}
          {...evolvePath(dibujo, "M 675 350 A 165 165 0 1 1 675 349.9")}
        />
        {lead(BASE, b * (1 - flujo) + flujo * latido, C.ambar)}
        <line x1={460} y1={265} x2={460} y2={435} stroke={C.metal} strokeWidth={16} opacity={dibujo} />
        {lead(COLECTOR, c, C.cian)}
        {lead(EMISOR, e, C.cian)}
        <polygon points="560,460 527,451 541,431" fill={e > 0.5 ? C.cian : C.metal} opacity={dibujo} />

        {/* corriente colector → emisor */}
        {Array.from({ length: 10 }).map((_, i) => {
          const p = getPointAtLength(FLUJO, (frame * 5 + (i * LARGO) / 10) % LARGO);
          if (!p) return null;
          return <circle key={i} cx={p.x} cy={p.y} r={7} fill={C.ambar} opacity={flujo * 0.95} style={{ filter: `drop-shadow(0 0 8px ${C.ambar})` }} />;
        })}

        {etiqueta(240, 350, "B", T.base, b, "end")}
        {etiqueta(590, 140, "C", T.colector, c, "start")}
        {etiqueta(590, 570, "E", T.emisor, e, "start")}
      </svg>
    </AbsoluteFill>
  );
};
