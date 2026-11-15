import { ESCENAS_LARGO, ESCENAS_SHORT, GUION, type EscenaId, type FormatoVideo, type Idioma } from "./guion";

export const FPS = 60;
export const PRE = 12; // frames antes de que empiece la voz en cada escena
export const POST = 30; // frames de respiro al final de cada escena
export const TRANS = 18; // duración de la transición entre escenas

export type Palabra = { texto: string; inicio: number; fin: number };
export type EscenaAudio = {
  id: EscenaId;
  archivo: string;
  duracion: number;
  hash: string;
  palabras: Palabra[];
};
export type Manifest = { idioma: Idioma; escenas: EscenaAudio[] };

export type EscenaPlan = {
  id: EscenaId;
  frames: number;
  audio: string | null;
  palabras: Palabra[];
};

// Sin voz generada aún: estimamos tiempos para poder previsualizar el video.
const estimarPalabras = (texto: string): { duracion: number; palabras: Palabra[] } => {
  const tokens = texto.split(/\s+/).filter(Boolean);
  const porPalabra = 1 / 2.6;
  return {
    duracion: tokens.length * porPalabra,
    palabras: tokens.map((t, i) => ({
      texto: t,
      inicio: i * porPalabra,
      fin: (i + 1) * porPalabra - 0.05,
    })),
  };
};

// Respiro adicional al final de escenas donde la imagen debe quedarse en pantalla.
const EXTRA_LARGO: Partial<Record<EscenaId, number>> = {
  intro: 60,
  autopsia: 45,
  circuito: 45,
  regiones: 45,
  cierre: 60,
};

// En formato Short (9:16), reducimos las pausas muertas para máxima retención (< 58 s).
const EXTRA_SHORT: Partial<Record<EscenaId, number>> = {
  intro: 20,
  autopsia: 20,
  circuito: 20,
  cierre: 24,
};

export const construirEscenas = (
  idioma: Idioma,
  manifest: Manifest | null,
  formato: FormatoVideo = "16:9",
): EscenaPlan[] => {
  const lista = formato === "9:16" ? ESCENAS_SHORT : ESCENAS_LARGO;
  const extra = formato === "9:16" ? EXTRA_SHORT : EXTRA_LARGO;
  const postFrames = formato === "9:16" ? 16 : POST;

  return lista.map((id) => {
    const real = manifest?.escenas.find((e) => e.id === id);
    const { duracion, palabras } = real ?? estimarPalabras(GUION[idioma][id]);
    return {
      id,
      frames: PRE + Math.ceil(duracion * FPS) + postFrames + (extra[id] ?? 0),
      audio: real ? real.archivo : null,
      palabras,
    };
  });
};

export const duracionTotal = (escenas: EscenaPlan[]) =>
  escenas.reduce((s, e) => s + e.frames, 0) - TRANS * Math.max(0, escenas.length - 1);

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]/g, "");

// Frame (dentro de la escena) en el que el narrador dice `clave`.
export const marcaFrame = (plan: EscenaPlan, clave: string, porDefecto = 30) => {
  const objetivo = normalizar(clave);
  const p = plan.palabras.find((w) => normalizar(w.texto).startsWith(objetivo));
  return p ? PRE + Math.round(p.inicio * FPS) : porDefecto;
};
