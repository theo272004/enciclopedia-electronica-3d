// Lista las voces de tu cuenta con su ID, para copiarlo a VOICE_ID_ES / VOICE_ID_EN en .env
// Uso: npm run listar-voces
import "dotenv/config";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
if (!apiKey) {
  console.error("✖ Falta ELEVENLABS_API_KEY en el archivo .env");
  process.exit(1);
}
const client = new ElevenLabsClient({ apiKey });
const { voices } = await client.voices.search({ pageSize: 100 });
for (const v of voices) {
  const l = v.labels ?? {};
  console.log(
    `${v.voiceId}  ${v.name?.padEnd(28)}  ${[l.language, l.accent, l.gender, l.use_case ?? l.descriptive]
      .filter(Boolean)
      .join(" · ")}`,
  );
}
