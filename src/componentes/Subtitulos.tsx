import { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp, INTER } from "../estilo";
import type { Palabra } from "../tiempo";

// Agrupa palabras en frases cortas (máx. 7 palabras, corta en puntuación).
const agrupar = (palabras: Palabra[]) => {
  const grupos: Palabra[][] = [];
  let g: Palabra[] = [];
  for (const p of palabras) {
    g.push(p);
    if (g.length >= 7 || /[.,:;!?…]$/.test(p.texto)) {
      grupos.push(g);
      g = [];
    }
  }
  if (g.length) grupos.push(g);
  return grupos;
};

export const Subtitulos: React.FC<{ palabras: Palabra[]; desdeFrame: number }> = ({ palabras, desdeFrame }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const esVertical = height > width;
  const grupos = useMemo(() => agrupar(palabras), [palabras]);
  const t = (frame - desdeFrame) / fps;

  const idx = grupos.findIndex((g, i) => {
    const sig = grupos[i + 1];
    return t >= g[0].inicio - 0.05 && t < (sig ? sig[0].inicio - 0.05 : g[g.length - 1].fin + 0.6);
  });
  if (idx < 0) return null;
  const g = grupos[idx];
  const entrada = interpolate(t, [g[0].inicio - 0.05, g[0].inicio + 0.15], [0, 1], clamp);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: esVertical ? 110 : 60,
        paddingLeft: esVertical ? 40 : 0,
        paddingRight: esVertical ? 40 : 0,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: INTER,
          fontWeight: 600,
          fontSize: esVertical ? 40 : 42,
          lineHeight: 1.25,
          padding: "16px 30px",
          borderRadius: 18,
          background: "rgba(7,11,18,0.78)",
          border: "1px solid rgba(61,224,255,0.18)",
          backdropFilter: "blur(8px)",
          maxWidth: esVertical ? 960 : 1500,
          textAlign: "center",
          opacity: entrada,
          transform: `translateY(${(1 - entrada) * 12}px)`,
        }}
      >
        {g.map((p, i) => {
          const activa = t >= p.inicio && t <= p.fin + 0.08;
          const dicha = t > p.fin;
          return (
            <span
              key={i}
              style={{
                color: activa ? C.ambar : dicha ? C.texto : "rgba(232,241,255,0.45)",
                textShadow: activa ? "0 0 18px rgba(255,181,71,0.55)" : "none",
              }}
            >
              {p.texto}
              {i < g.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
