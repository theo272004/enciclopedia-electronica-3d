import { Composition, staticFile, type CalculateMetadataFunction } from "remotion";
import { GUION, type FormatoVideo, type Idioma } from "./guion";
import { GUION_MOSFET } from "./guion-mosfet";
import { GUION_RELE } from "./guion-rele";
import { construirEscenas, duracionTotal, FPS, type Manifest } from "./tiempo";
import { Video, type VideoProps } from "./Video";
import { VideoMosfet } from "./VideoMosfet";
import { VideoRele } from "./VideoRele";

const crearCalculador =
  (carpetaVoz: string, guion: typeof GUION): CalculateMetadataFunction<VideoProps> =>
  async ({ props }) => {
    let manifest: Manifest | null = null;
    try {
      const r = await fetch(staticFile(`${carpetaVoz}/${props.idioma}/manifest.json`));
      if (r.ok) manifest = await r.json();
    } catch {
      manifest = null;
    }
    const formato = props.formato ?? "16:9";
    const escenas = construirEscenas(props.idioma, manifest, formato, guion);
    return { durationInFrames: duracionTotal(escenas), props: { ...props, formato, escenas } };
  };

const calcularTransistor = crearCalculador("voz", GUION);
const calcularRele = crearCalculador("voz-rele", GUION_RELE);
const calcularMosfet = crearCalculador("voz-mosfet", GUION_MOSFET);

const composiciones: {
  id: string;
  idioma: Idioma;
  formato: FormatoVideo;
  width: number;
  height: number;
  component: React.FC<VideoProps>;
  calculateMetadata: CalculateMetadataFunction<VideoProps>;
}[] = [
  // Episodio 01: El Transistor BJT (2N2222A)
  { id: "Transistor-ES", idioma: "es", formato: "16:9", width: 1920, height: 1080, component: Video, calculateMetadata: calcularTransistor },
  { id: "Transistor-EN", idioma: "en", formato: "16:9", width: 1920, height: 1080, component: Video, calculateMetadata: calcularTransistor },
  { id: "Transistor-Short-ES", idioma: "es", formato: "9:16", width: 1080, height: 1920, component: Video, calculateMetadata: calcularTransistor },
  { id: "Transistor-Short-EN", idioma: "en", formato: "9:16", width: 1080, height: 1920, component: Video, calculateMetadata: calcularTransistor },
  // Episodio 02: El Relé Electromecánico vs. SSR (+ Diodo Flyback 1N4007)
  { id: "Rele-ES", idioma: "es", formato: "16:9", width: 1920, height: 1080, component: VideoRele, calculateMetadata: calcularRele },
  { id: "Rele-EN", idioma: "en", formato: "16:9", width: 1920, height: 1080, component: VideoRele, calculateMetadata: calcularRele },
  { id: "Rele-Short-ES", idioma: "es", formato: "9:16", width: 1080, height: 1920, component: VideoRele, calculateMetadata: calcularRele },
  { id: "Rele-Short-EN", idioma: "en", formato: "9:16", width: 1080, height: 1920, component: VideoRele, calculateMetadata: calcularRele },
  // Episodio 03: BJT vs. MOSFET de Potencia (IRFZ44N)
  { id: "Mosfet-ES", idioma: "es", formato: "16:9", width: 1920, height: 1080, component: VideoMosfet, calculateMetadata: calcularMosfet },
  { id: "Mosfet-EN", idioma: "en", formato: "16:9", width: 1920, height: 1080, component: VideoMosfet, calculateMetadata: calcularMosfet },
  { id: "Mosfet-Short-ES", idioma: "es", formato: "9:16", width: 1080, height: 1920, component: VideoMosfet, calculateMetadata: calcularMosfet },
  { id: "Mosfet-Short-EN", idioma: "en", formato: "9:16", width: 1080, height: 1920, component: VideoMosfet, calculateMetadata: calcularMosfet },
];

export const Root: React.FC = () => (
  <>
    {composiciones.map(({ id, idioma, formato, width, height, component, calculateMetadata }) => (
      <Composition
        key={id}
        id={id}
        component={component}
        width={width}
        height={height}
        fps={FPS}
        durationInFrames={FPS * 60}
        defaultProps={{ idioma, formato, escenas: [] } satisfies VideoProps}
        calculateMetadata={calculateMetadata}
      />
    ))}
  </>
);
