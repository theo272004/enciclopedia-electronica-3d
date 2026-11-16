import fs from "node:fs";
import path from "node:path";
import { construirEscenas, FPS, TRANS, type Manifest } from "../src/tiempo";

function formatearTiempoYT(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos));
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

const NOMBRES_CAPITULOS_EP01: Record<string, { es: string; en: string }> = {
  intro: {
    es: "El componente que controla el mundo (Transistor 2N2222A)",
    en: "The component that controls the modern world (2N2222A)",
  },
  autopsia: {
    es: "Autopsia 3D: Cristal de silicio N-P-N, hilos de oro y barrera de 0.7 V",
    en: "3D Autopsy: N-P-N silicon die, gold bond wires & 0.7 V barrier",
  },
  partes: {
    es: "Símbolo esquemático, terminales (Base, Colector, Emisor) y ganancia Beta",
    en: "Schematic symbol, terminals (Base, Collector, Emitter) & Beta gain",
  },
  circuito: {
    es: "Circuito real en PCB: Resistencia de base, corrientes I_B / I_C y saturación",
    en: "Real PCB circuit: Base resistor, I_B / I_C currents & saturation",
  },
  regiones: {
    es: "Curvas del Datasheet (I_C vs V_CE): Corte, Saturación y Región Activa (625 mW)",
    en: "Datasheet curves (I_C vs V_CE): Cutoff, Saturation & Active Region (625 mW)",
  },
  cierre: {
    es: "Encapsulados reales (TO-92, SOT-23 SMD, TO-220) y escala de procesadores",
    en: "Real packages (TO-92, SOT-23 SMD, TO-220) & processor scale",
  },
};

function calcularCapitulos(idioma: "es" | "en") {
  const ruta = path.resolve(`public/voz/${idioma}/manifest.json`);
  const manifest: Manifest | null = fs.existsSync(ruta) ? JSON.parse(fs.readFileSync(ruta, "utf8")) : null;
  const escenas = construirEscenas(idioma, manifest, "16:9");

  let frameAcumulado = 0;
  const lineas: string[] = [];

  for (const [i, esc] of escenas.entries()) {
    const seg = i === 0 ? 0 : frameAcumulado / FPS;
    const titulo = NOMBRES_CAPITULOS_EP01[esc.id]?.[idioma] ?? esc.id;
    lineas.push(`${formatearTiempoYT(seg)} ${titulo}`);
    frameAcumulado += esc.frames - TRANS;
  }

  return lineas.join("\n");
}

const capEs = calcularCapitulos("es");
const capEn = calcularCapitulos("en");

const contenidoMd = `# Plan de Publicación en YouTube y Kit SEO (Por Episodio)

> [!IMPORTANT]
> **Estrategia Dual para Crecimiento y Monetización (16:9 + Short 9:16):**
> 1. **Sube primero el Video Principal Horizontal (\`16:9\`)** con sus capítulos automáticos, descripción con datos reales de datasheet y enlace a la **Enciclopedia 3D Interactiva**.
> 2. **Sube el YouTube Short (\`9:16\`, 59.6 s)** unas 2 a 4 horas después y en YouTube Studio vincula el campo **"Video relacionado" (Related Video)** apuntando al video horizontal \`16:9\`. Así el algoritmo de Shorts inyectará suscriptores nuevos y tráfico directo al video largo monetizable.

---

## EPISODIO #01: El Transistor BJT (\`2N2222A\`)

### Archivos de Video Listos en \`out/\`
- **Video Principal 16:9 (ES):** [out/transistor-es.mp4](file:///c:/Users/NICOLAS/Documents/videos%20electronica/out/transistor-es.mp4) (\`1920x1080\`, 60 fps, 1:36 min)
- **YouTube Short 9:16 (ES):** [out/transistor-short-es.mp4](file:///c:/Users/NICOLAS/Documents/videos%20electronica/out/transistor-short-es.mp4) (\`1080x1920\`, 60 fps, 59.6 s)

### Opciones de Título (Alto CTR Técnico)
1. **Opción A (Recomendada — Curiosidad + Ingeniería):** \`Cómo Funciona REALMENTE un Transistor por Dentro (Autopsia 3D y Datasheet 2N2222A)\`
2. **Opción B (Enfoque Diseño Práctico):** \`El Transistor Explicado con Física Real: Silicio N-P-N, Saturación y Curvas del Datasheet\`
3. **Opción C (Directo y Enciclopédico):** \`El Transistor BJT (2N2222A): De la Barrera de 0.7 V al Diseño de Circuitos en PCB\`

### Descripción Lista para Copiar y Pegar (Español — \`16:9\`)
\`\`\`text
Abordamos el transistor bipolar NPN (2N2222A) desde su física interna de semiconductores hasta el cálculo real en placa PCB, sin simplificaciones falsas y respaldado por la hoja de datos oficial de ON Semiconductor.

🔬 ENCICLOPEDIA 3D INTERACTIVA, SIMULADOR Y DESCARGAS CAD (KiCad 9, STEP, GLB, STL, LTspice, Arduino):
👉 https://theo272004.github.io/enciclopedia-electronica-3d/

📦 REPOSITORIO ABIERTO EN GITHUB:
👉 https://github.com/theo272004/enciclopedia-electronica-3d

⏱️ CAPÍTULOS DEL VIDEO:
${capEs}

📐 FICHA TÉCNICA DE REFERENCIA (Datasheet ON Semiconductor 2N2222A / P2N2222A):
• Arquitectura: Silicio Planar Epitaxial NPN
• Tensión máxima Colector-Emisor (V_CEO): 40 V
• Corriente continua máxima de Colector (I_C): 800 mA
• Disipación térmica máxima en TO-92 (P_D): 625 mW @ 25 °C (SOT-23 MMBT2222A: 350 mW)
• Ganancia de corriente DC (h_FE / Beta): 100 – 300 (en Región Activa)
• Tensión de saturación (V_CE(sat)): ~0.3 V (con I_C = 150 mA, I_B = 15 mA)
• Frecuencia de transición (f_T): 300 MHz

🛠️ HERRAMIENTAS DE INGENIERÍA USADAS EN ESTE EPISODIO:
• Modelos métricos CAD: KiCad 9.0
• Corte booleano de autopsia 3D: Blender 5.0 (Python API)
• Motor de renderizado a 60 fps: Remotion + Three.js / WebGL

#Electronica #IngenieriaElectronica #Transistor #2N2222A #PCB #KiCad #Arduino #ESP32 #Hardware
\`\`\`

### Ficha para el YouTube Short / Reels / TikTok (\`9:16\`)
- **Título del Short:** \`¿Qué hay DENTRO de un Transistor 2N2222A? (Autopsia 3D) #Shorts #Electronica\`
- **Video Relacionado en YouTube Studio:** Vincular a \`Cómo Funciona REALMENTE un Transistor por Dentro (Autopsia 3D y Datasheet 2N2222A)\`
- **Comentario Fijado (Pinned Comment):**
  \`\`\`text
  🔬 Inspecciona el modelo 3D abierto en tu navegador, prueba el simulador de saturación y descarga los archivos para KiCad, Blender, LTspice y Arduino gratis aquí:
  👉 https://theo272004.github.io/enciclopedia-electronica-3d/
  \`\`\`

---

## EPISODIO #02: El Relé Electromecánico vs. SSR (+ El Diodo Flyback que Salva tu Circuito)

### Enfoque Técnico y Gancho Visual (Sin Relleno)
- **El problema real:** ¿Cómo puede un microcontrolador frágil de \`3.3 V\` o \`5 V\` encender un motor o lámpara de \`220 V AC / 10 A\` sin electrocutarse? Y más importante: ¿por qué al apagar un relé su bobina genera un **latigazo inductivo de más de -300 V** que destruye tu transistor si olvidas un diodo de 2 centavos (\`1N4007\`)?
- **Datasheets Reales Usados:**
  1. **Omron \`G5LE-1\` (Relé SPDT de 5 pines):** Bobina de \`5 VDC\` (\`70 Ω\`, \`71.4 mA\`, \`360 mW\`), contactos de aleación de plata \`AgSnO2\` (\`10 A @ 250 VAC\`), tiempo de cierre \`10 ms\` máx., aislamiento dieléctrico \`2,000 VAC\` entre bobina y contactos.
  2. **Vishay \`1N4007\` (Diodo Rectificador DO-41):** Tensión inversa pico repetitiva \`V_RRM = 1,000 V\`, corriente directa \`I_F(AV) = 1.0 A\`, pico de sobrecorriente \`30 A\`.

### Estructura de las 6 Escenas del Episodio #02
1. **\`00:00\` Intro:** Aislamiento galvánico de \`2,000 V\` y el sonido mecánico más famoso de la electrónica (\`Omron G5LE-1\` en PCB).
2. **\`00:13\` Autopsia 3D en Blender 5.0:** Abriendo la carcasa del \`Omron G5LE-1\`: bobina de cobre esmaltado, núcleo de hierro dulce, yugo magnético en L, resorte de retorno y armadura móvil conmutando entre \`NC\` y \`NO\`.
3. **\`00:32\` Partes y Pinout SPDT:** Los 5 terminales reales (\`Bobina A1-A2\`, \`COM\`, \`NC\`, \`NO\`) y por qué \`71.4 mA\` exige etapa impulsora con transistor \`2N2222A\`.
4. **\`00:46\` Circuito Real y el Peligro Inductivo:** Qué pasa cuando el transistor corta la corriente de la bobina ($V = -L \\cdot di/dt$) y cómo el diodo *flyback* \`1N4007\` en antiparalelo recircula la corriente magnética.
5. **\`01:04\` Osciloscopio y Tiempos del Datasheet:** Comparativa de la curva $V_{CE}(t)$ sin diodo (pico letal de \`-320 V\` que perfora los \`40 V\` del \`2N2222A\`) vs. con diodo \`1N4007\` (clampeado seguro a \`5.7 V\`), más el tiempo de rebote mecánico (*contact bounce* de \`10 ms\`).
6. **\`01:22\` Cierre y Variaciones Reales en KiCad 9.0:** Relé \`SPDT Omron G5LE\`, Relé Industrial \`DPDT Finder 40.52\`, Micro-Relé \`SMD Omron G6K\` y cuándo pasar a un **Relé de Estado Sólido (SSR)** para conmutación silenciosa sin desgaste mecánico.
`;

fs.mkdirSync(path.resolve("out/youtube"), { recursive: true });
fs.writeFileSync(path.resolve("out/youtube/plan-publicacion-youtube.md"), contenidoMd, "utf8");
console.log("✔ Plan de publicación y kit SEO generado en out/youtube/plan-publicacion-youtube.md");
