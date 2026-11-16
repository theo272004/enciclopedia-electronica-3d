// Genera efectos de sonido (SFX) táctiles en WAV por síntesis procedural (cero dependencias externas)
// para dar ritmo físico y diseño sonoro de taller real a los videos (anti-estilo IA genérico).
import fs from "node:fs";
import path from "node:path";

const SAMPLE_RATE = 44100;
const OUT_DIR = path.resolve("public/sfx");
fs.mkdirSync(OUT_DIR, { recursive: true });

function escribirWav(nombre: string, muestras: Float32Array) {
  const numSamples = muestras.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // PCM
  buffer.writeUInt16LE(1, 20); // AudioFormat
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, muestras[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  const dest = path.join(OUT_DIR, nombre);
  fs.writeFileSync(dest, buffer);
  console.log(`✔ SFX generado: ${dest}`);
}

// 1. Click mecánico seco (Relé / Pulsador / Corte de cámara)
function genClickMecanico() {
  const dur = 0.09;
  const n = Math.floor(SAMPLE_RATE * dur);
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 95);
    const transitorio = Math.sin(2 * Math.PI * 1900 * t) * Math.exp(-t * 160);
    const cuerpo = Math.sin(2 * Math.PI * 340 * t) * env;
    const ruido = (Math.random() * 2 - 1) * Math.exp(-t * 220) * 0.45;
    buf[i] = (transitorio * 0.55 + cuerpo * 0.4 + ruido) * 0.85;
  }
  escribirWav("click_mecanico.wav", buf);
}

// 2. Pop sutil de cota técnica / UI de laboratorio
function genCotaPop() {
  const dur = 0.11;
  const n = Math.floor(SAMPLE_RATE * dur);
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const f = 520 + 480 * Math.min(1, t / 0.04);
    const env = Math.exp(-t * 48) * (1 - Math.exp(-t * 400));
    buf[i] = Math.sin(2 * Math.PI * f * t) * env * 0.5;
  }
  escribirWav("cota_pop.wav", buf);
}

// 3. Whoosh limpio de transición de cámara macro
function genWhoosh() {
  const dur = 0.28;
  const n = Math.floor(SAMPLE_RATE * dur);
  const buf = new Float32Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.sin((Math.PI * t) / dur) ** 1.6;
    const white = Math.random() * 2 - 1;
    lp = lp * 0.86 + white * 0.14;
    buf[i] = lp * env * 0.55;
  }
  escribirWav("whoosh_camara.wav", buf);
}

// 4. Chispa / Pico inductivo corto (para ganchos de fallo eléctrico)
function genChispa() {
  const dur = 0.22;
  const n = Math.floor(SAMPLE_RATE * dur);
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 22);
    const zumbido = Math.sin(2 * Math.PI * 120 * t) * 0.35 + Math.sin(2 * Math.PI * 240 * t) * 0.2;
    const crackle = (Math.random() > 0.72 ? (Math.random() * 2 - 1) : 0) * 0.85;
    buf[i] = (zumbido + crackle) * env * 0.7;
  }
  escribirWav("chispa_electrica.wav", buf);
}

// 5. Corte láser / mecánico limpio al abrir la autopsia 3D
function genCorteLaser() {
  const dur = 0.32;
  const n = Math.floor(SAMPLE_RATE * dur);
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const f = 1400 - 950 * Math.min(1, t / 0.18);
    const env = Math.exp(-t * 14) * (1 - Math.exp(-t * 260));
    const aire = (Math.random() * 2 - 1) * Math.exp(-t * 22) * 0.25;
    buf[i] = (Math.sin(2 * Math.PI * f * t) * 0.5 + aire) * env * 0.65;
  }
  escribirWav("corte_laser.wav", buf);
}

// 6. Zumbido eléctrico grave sutil (hum de 60/120 Hz al energizar el circuito)
function genHumElectrico() {
  const dur = 1.2;
  const n = Math.floor(SAMPLE_RATE * dur);
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const fade = Math.min(1, t / 0.12) * Math.min(1, (dur - t) / 0.25);
    const sig = Math.sin(2 * Math.PI * 60 * t) * 0.45 + Math.sin(2 * Math.PI * 120 * t) * 0.35 + Math.sin(2 * Math.PI * 180 * t) * 0.15;
    buf[i] = sig * fade * 0.28;
  }
  escribirWav("hum_electrico.wav", buf);
}

genClickMecanico();
genCotaPop();
genWhoosh();
genChispa();
genCorteLaser();
genHumElectrico();
