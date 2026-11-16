// Genera la narración con ElevenLabs + tiempos por palabra para sincronizar animaciones y subtítulos.
// Uso:  npm run voces               (todos los episodios y ambos idiomas)
//       npm run voces -- es rele    (solo español del episodio del relé)
import "dotenv/config";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { ESCENAS, GUION, type Idioma } from "../src/guion";
import { GUION_RELE } from "../src/guion-rele";
import type { EscenaAudio, Manifest, Palabra } from "../src/tiempo";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
if (!apiKey) {
  console.error("✖ Falta ELEVENLABS_API_KEY en el archivo .env");
  process.exit(1);
}

const MODELO = process.env.ELEVENLABS_MODEL?.trim() || "eleven_multilingual_v2";
const VOCES: Record<Idioma, string | undefined> = {
  es: process.env.VOICE_ID_ES?.trim(),
  en: process.env.VOICE_ID_EN?.trim(),
};
const AJUSTES = { stability: 0.5, similarityBoost: 0.75, style: 0.1, useSpeakerBoost: true };

const client = new ElevenLabsClient({ apiKey });
const idiomas = (process.argv[2] ? [process.argv[2]] : ["es", "en"]) as Idioma[];
const filtroEp = process.argv[3]; // opcional: "transistor" | "rele"

const EPISODIOS = [
  { clave: "transistor", carpeta: "voz", guion: GUION },
  { clave: "rele", carpeta: "voz-rele", guion: GUION_RELE },
];

const aPalabras = (a: {
  characters: string[];
  characterStartTimesSeconds: number[];
  characterEndTimesSeconds: number[];
}): Palabra[] => {
  const out: Palabra[] = [];
  let actual = "";
  let inicio = 0;
  let fin = 0;
  a.characters.forEach((c, k) => {
    if (/\s/.test(c)) {
      if (actual) out.push({ texto: actual, inicio, fin });
      actual = "";
    } else {
      if (!actual) inicio = a.characterStartTimesSeconds[k];
      actual += c;
      fin = a.characterEndTimesSeconds[k];
    }
  });
  if (actual) out.push({ texto: actual, inicio, fin });
  return out;
};

const duracionReal = (archivo: string) =>
  Number(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", archivo])
      .toString()
      .trim(),
  );

for (const ep of EPISODIOS) {
  if (filtroEp && ep.clave !== filtroEp) continue;

  for (const idioma of idiomas) {
    const voiceId = VOCES[idioma];
    if (!voiceId) {
      console.warn(`⚠ Sin VOICE_ID_${idioma.toUpperCase()} en .env — salto ${idioma}`);
      continue;
    }
    const dir = path.join("public", ep.carpeta, idioma);
    await fs.mkdir(dir, { recursive: true });
    const rutaManifest = path.join(dir, "manifest.json");
    const anterior: Manifest | null = await fs
      .readFile(rutaManifest, "utf8")
      .then((t) => JSON.parse(t) as Manifest)
      .catch(() => null);

    const escenas: EscenaAudio[] = [];
    for (const [i, id] of ESCENAS.entries()) {
      const texto = ep.guion[idioma][id];
      const hash = createHash("sha1").update(`${voiceId}|${MODELO}|${JSON.stringify(AJUSTES)}|${texto}`).digest("hex");
      const archivoLocal = path.join(dir, `${id}.mp3`);

      const cache = anterior?.escenas.find((e) => e.id === id && e.hash === hash);
      if (cache && (await fs.stat(archivoLocal).catch(() => null))) {
        console.log(`↺ [${ep.clave}] ${idioma}/${id} sin cambios (no gasta créditos)`);
        escenas.push(cache);
        continue;
      }

      console.log(`🎙  [${ep.clave}] ${idioma}/${id} generando…`);
      const res = await client.textToSpeech.convertWithTimestamps(voiceId, {
        text: texto,
        modelId: MODELO,
        outputFormat: "mp3_44100_128",
        voiceSettings: AJUSTES,
        previousText: i > 0 ? ep.guion[idioma][ESCENAS[i - 1]] : undefined,
        nextText: i < ESCENAS.length - 1 ? ep.guion[idioma][ESCENAS[i + 1]] : undefined,
        ...(MODELO.includes("multilingual_v2") ? {} : { languageCode: idioma }),
      });
      if (!res.alignment) throw new Error("ElevenLabs no devolvió tiempos por palabra");

      await fs.writeFile(archivoLocal, Buffer.from(res.audioBase64, "base64"));
      escenas.push({
        id,
        archivo: `${ep.carpeta}/${idioma}/${id}.mp3`,
        duracion: duracionReal(archivoLocal),
        hash,
        palabras: aPalabras(res.alignment),
      });
    }

    await fs.writeFile(rutaManifest, JSON.stringify({ idioma, escenas } satisfies Manifest, null, 2));
    console.log(`✔ [${ep.clave}] ${idioma}: ${escenas.length} escenas listas en ${dir}`);
  }
}
