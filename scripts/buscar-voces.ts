// Busca en la Voice Library pública de ElevenLabs las voces más usadas según filtros.
// Uso: npm run buscar-voces -- es male        (idioma, género)
import "dotenv/config";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
if (!apiKey) {
  console.error("✖ Falta ELEVENLABS_API_KEY en el archivo .env");
  process.exit(1);
}
const [idioma = "es", genero = "male"] = process.argv.slice(2);
const client = new ElevenLabsClient({ apiKey });

for (const useCases of ["informative_educational", "narrative_story"]) {
  const { voices } = await client.voices.getShared({
    language: idioma,
    gender: genero,
    useCases,
    sort: "usage_character_count_1y",
    pageSize: 12,
  });
  console.log(`\n=== ${useCases} ===`);
  for (const v of voices) {
    const r = v as unknown as Record<string, unknown>;
    console.log(
      [
        r.voiceId,
        String(r.name).slice(0, 40).padEnd(40),
        r.accent,
        r.age,
        r.locale,
        `uso1a=${r.usageCharacterCount1Y}`,
        `clon=${r.clonedByCount}`,
        `owner=${r.publicOwnerId}`,
        `preview=${r.previewUrl}`,
      ].join(" | "),
    );
  }
}
