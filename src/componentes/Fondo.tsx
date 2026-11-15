import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../estilo";

// Fondo tipo PCB: rejilla que deriva lentamente + viñeta.
export const Fondo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          backgroundPosition: `${frame * 0.25}px ${frame * 0.12}px`,
          opacity: 0.55,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 38%, rgba(61,224,255,0.10), transparent 55%), radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.75) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
