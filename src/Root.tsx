import { Composition, staticFile, type CalculateMetadataFunction } from "remotion";
import type { FormatoVideo, Idioma } from "./guion";
import { construirEscenas, duracionTotal, FPS, type Manifest } from "./tiempo";
import { Video, type VideoProps } from "./Video";

// Lee el manifest de voces (si existe) y ajusta la duración del video a la narración real.
const calcular: CalculateMetadataFunction<VideoProps> = async ({ props }) => {
  let manifest: Manifest | null = null;
  try {
    const r = await fetch(staticFile(`voz/${props.idioma}/manifest.json`));
    if (r.ok) manifest = await r.json();
  } catch {
    manifest = null;
  }
  const formato = props.formato ?? "16:9";
  const escenas = construirEscenas(props.idioma, manifest, formato);
  return { durationInFrames: duracionTotal(escenas), props: { ...props, formato, escenas } };
};

const composiciones: { id: string; idioma: Idioma; formato: FormatoVideo; width: number; height: number }[] = [
  { id: "Transistor-ES", idioma: "es", formato: "16:9", width: 1920, height: 1080 },
  { id: "Transistor-EN", idioma: "en", formato: "16:9", width: 1920, height: 1080 },
  { id: "Transistor-Short-ES", idioma: "es", formato: "9:16", width: 1080, height: 1920 },
  { id: "Transistor-Short-EN", idioma: "en", formato: "9:16", width: 1080, height: 1920 },
];

export const Root: React.FC = () => (
  <>
    {composiciones.map(({ id, idioma, formato, width, height }) => (
      <Composition
        key={id}
        id={id}
        component={Video}
        width={width}
        height={height}
        fps={FPS}
        durationInFrames={FPS * 60}
        defaultProps={{ idioma, formato, escenas: [] } satisfies VideoProps}
        calculateMetadata={calcular}
      />
    ))}
  </>
);
