import fs from "node:fs";
import path from "node:path";
import { construirEscenas, FPS, TRANS, type Manifest } from "../src/tiempo";

function formatearTiempoYT(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos));
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function leerManifest(carpetaVoz: string, idioma: "es" | "en"): Manifest | null {
  const ruta = path.resolve(`public/${carpetaVoz}/${idioma}/manifest.json`);
  return fs.existsSync(ruta) ? JSON.parse(fs.readFileSync(ruta, "utf8")) : null;
}

function formatearCapitulos(
  escenas: { id: string; frames: number }[],
  nombres: Record<string, string>,
): string {
  let frameAcumulado = 0;
  const lineas: string[] = [];
  for (const [i, esc] of escenas.entries()) {
    const seg = i === 0 ? 0 : frameAcumulado / FPS;
    const titulo = nombres[esc.id] ?? esc.id;
    lineas.push(`${formatearTiempoYT(seg)} ${titulo}`);
    frameAcumulado += esc.frames - TRANS;
  }
  return lineas.join("\n");
}

const capEp01 = formatearCapitulos(construirEscenas("es", leerManifest("voz", "es"), "16:9"), {
  intro: "El componente que controla el mundo (Transistor 2N2222A)",
  autopsia: "Autopsia 3D: Cristal de silicio N-P-N, hilos de oro y barrera de 0.7 V",
  partes: "Símbolo esquemático, terminales (Base, Colector, Emisor) y ganancia Beta",
  circuito: "Circuito real en PCB: Resistencia de base, corrientes I_B / I_C y saturación",
  regiones: "Curvas del Datasheet (I_C vs V_CE): Corte, Saturación y Región Activa (625 mW)",
  cierre: "Encapsulados reales (TO-92, SOT-23 SMD, TO-220) y escala de procesadores",
});

const capEp02 = formatearCapitulos(construirEscenas("es", leerManifest("voz-rele", "es"), "16:9"), {
  intro: "Aislamiento galvánico de 2,000 VAC: Relé Omron G5LE-1 y Diodo 1N4007",
  autopsia: "Autopsia 3D: Carcasa transparente, bobina de cobre, yugo en L y contactos AgSnO2",
  partes: "Pinout SPDT de 5 terminales (Bobina A1-A2, COM, NC, NO) y etapa 2N2222A",
  circuito: "El peligro del pico inductivo (-320 V) y cómo el diodo flyback 1N4007 salva tu circuito",
  regiones: "Osciloscopio: Curva V_CE(t) sin diodo vs con diodo 1N4007 y rebote mecánico (10 ms)",
  cierre: "Variaciones industriales en KiCad 9.0: SPDT G5LE, DPDT Finder 40.52 y Micro-Relé SMD G6K",
});

const capEp03 = formatearCapitulos(construirEscenas("es", leerManifest("voz-mosfet", "es"), "16:9"), {
  intro: "BJT vs MOSFET de Potencia (IRFZ44N): 49 A con resistencia R_DS(on) de 17.5 mΩ",
  autopsia: "Autopsia 3D TO-220: Sustrato Drain, celdas HEXFET, óxido SiO2 y cinta Source",
  partes: "Símbolo de Canal N, terminales Gate-Drain-Source y el diodo parásito (Body Diode)",
  circuito: "Conmutación fría en PCB: P = I² · R_DS(on) (0.16 W vs 1.2 W en BJT) y resistencia R_GS",
  regiones: "El mito de V_GS(th) vs 10 V reales: Por qué 3.3 V recalienta un IRFZ44N estándar",
  cierre: "Encapsulados de potencia reales: TO-220 Vertical, SMD DPAK / SOT-223 y Disipador de Aluminio",
});

const capEp04 = formatearCapitulos(construirEscenas("es", leerManifest("voz-capacitor", "es"), "16:9"), {
  intro: "El pulmón electrostático de toda placa PCB: Nichicon 100 µF + Murata MLCC 100 nF",
  autopsia: "Autopsia 3D: Rollo concéntrico de aluminio grabado, óxido Al2O3, papel electrolítico y válvula K",
  partes: "Símbolo polarizado vs cerámico, constante de tiempo RC (τ = R · C) y riesgo de inversión",
  circuito: "Desacoplo en equipo: Electrolítico (reserva de energía) + MLCC 100 nF (filtrado de MHz)",
  regiones: "Curva de Impedancia |Z| vs Frecuencia: ESR, inductancia ESL y resonancia propia",
  cierre: "Los 3 reyes en KiCad 9.0: Electrolítico Radial, Cerámico SMD 0805 y Tántalo Kemet Case-A",
});

const capEp05 = formatearCapitulos(construirEscenas("es", leerManifest("voz-diodo", "es"), "16:9"), {
  intro: "La válvula unidireccional de estado sólido: 1N4007, Schottky 1N5819 y Zener 1N4733A",
  autopsia: "Autopsia 3D DO-41: Cabezales térmicos de cobre, unión P-N y barrera de agotamiento (0.7 V)",
  partes: "Ánodo, Cátodo, banda plateada y rectificación de media onda a puente de Graetz",
  circuito: "Comparativa térmica en PCB: Caída de 0.7 V (1N4007) vs 0.32 V en barrera Schottky (1N5819)",
  regiones: "Curva I-V completa: Conducción directa (+0.7 V), bloqueo hasta 1,000 V y regulación Zener (-5.1 V)",
  cierre: "Encapsulados reales en KiCad 9.0: DO-41 Axial, DO-35 de Vidrio (Zener) y puente rectificador",
});

const capEp06 = formatearCapitulos(construirEscenas("es", leerManifest("voz-inductor", "es"), "16:9"), {
  intro: "Inercia magnética y conversión eficiente: Inductor Bourns SRR1260 (33 µH) y Buck Converter",
  autopsia: "Autopsia 3D: Escudo magnético de ferrita MnZn, devanado de cobre y líneas de flujo magnético",
  partes: "Ley de Faraday-Lenz V_L = L · (dI/dt), reactancia X_L = 2πfL y oposición al cambio brusco",
  circuito: "El corazón del Convertidor Buck (12 V a 5 V con 92% de eficiencia vs regulador lineal 7805)",
  regiones: "El peligro de la saturación magnética (I_sat = 3.5 A): Cuando la ferrita colapsa a un cable",
  cierre: "Familias de inductores en KiCad 9.0: Tambor Radial, Blindado SMD SRR1260 y Toroidal EPCOS",
});

const contenidoMd = `# Plan de Publicación en YouTube y Kit SEO Completo (6 Episodios · 12 Videos MP4)

> [!IMPORTANT]
> **Estrategia Dual para Crecimiento y Monetización (\`16:9\` + Short \`9:16\`):**
> 1. **Sube primero el Video Principal Horizontal (\`16:9\`, 60 fps)** con sus capítulos automáticos, descripción con parámetros reales de datasheet y enlace a la **Enciclopedia 3D Interactiva**.
> 2. **Sube el YouTube Short (\`9:16\`, < 60 s, 60 fps)** unas 2 a 4 horas después y en YouTube Studio vincula el campo **"Video relacionado" (Related Video)** apuntando al video horizontal \`16:9\`.
> 3. **Claridad Mejorada en el Relé (Episodio #02):** El modelo \`rele_autopsia.glb\` fue reconstruido siguiendo fielmente la fotografía de referencia de un relé real de cubierta transparente: carcasa de policarbonato cristalino, base negra, bobina derecha con las espiras de alambre de cobre visibles sobre carrete negro, núcleo de hierro, yugo en L, armadura superior y las 3 láminas verticales paralelas de latón (\`NC\`, \`COM\`, \`NO\`) a la izquierda con sus remaches redondos de plata enfrentados.

---

## EPISODIO #01: El Transistor BJT (\`2N2222A\`)
- **Video Horizontal \`16:9\`:** \`out/transistor-es.mp4\` (\`1920x1080\`, 60 fps)
- **YouTube Short \`9:16\`:** \`out/transistor-short-es.mp4\` (\`1080x1920\`, 60 fps, 59.6 s)
- **Título Recomendado:** \`Cómo Funciona REALMENTE un Transistor por Dentro (Autopsia 3D y Datasheet 2N2222A)\`

\`\`\`text
Abordamos el transistor bipolar NPN (2N2222A) desde su física interna de semiconductores hasta el cálculo real en placa PCB, respaldado por la hoja de datos oficial de ON Semiconductor.

🔬 ENCICLOPEDIA 3D INTERACTIVA, SIMULADOR Y DESCARGAS CAD (KiCad 9, STEP, GLB, STL, LTspice, Arduino):
👉 https://theo272004.github.io/enciclopedia-electronica-3d/

⏱️ CAPÍTULOS DEL VIDEO:
${capEp01}
\`\`\`

---

## EPISODIO #02: El Relé Electromecánico (\`Omron G5LE-1\`) + Diodo Flyback (\`1N4007\`)
- **Video Horizontal \`16:9\`:** \`out/rele-es.mp4\` (\`1920x1080\`, 60 fps)
- **YouTube Short \`9:16\`:** \`out/rele-short-es.mp4\` (\`1080x1920\`, 60 fps, 59.6 s)
- **Título Recomendado:** \`Cómo Funciona un Relé por Dentro y Por Qué el Diodo Flyback Salva tu Circuito (Omron G5LE-1)\`

\`\`\`text
Inspeccionamos un relé electromecánico SPDT con cubierta transparente (bobina de cobre, yugo en L y láminas de contacto NC/COM/NO de aleación de plata) y demostramos cómo el pico inductivo de -320 V destruye tu transistor si olvidas el diodo flyback 1N4007.

🔬 ENCICLOPEDIA 3D INTERACTIVA Y MODELOS CAD:
👉 https://theo272004.github.io/enciclopedia-electronica-3d/

⏱️ CAPÍTULOS DEL VIDEO:
${capEp02}
\`\`\`

---

## EPISODIO #03: BJT vs. MOSFET de Potencia (\`IRFZ44N\`)
- **Video Horizontal \`16:9\`:** \`out/mosfet-es.mp4\` (\`1920x1080\`, 60 fps)
- **YouTube Short \`9:16\`:** \`out/mosfet-short-es.mp4\` (\`1080x1920\`, 60 fps, 59.6 s)
- **Título Recomendado:** \`BJT vs MOSFET de Potencia: Cómo Conmutar 49 A Sin Calentar tu Placa (Autopsia 3D IRFZ44N)\`

\`\`\`text
Comparamos el transistor bipolar BJT frente al MOSFET de potencia IRFZ44N (celdas HEXFET verticales, óxido aislante SiO2 y resistencia R_DS(on) de 17.5 mΩ) y explicamos el error clásico de alimentar la compuerta con 3.3 V en lugar de 10 V.

🔬 ENCICLOPEDIA 3D INTERACTIVA Y MODELOS CAD:
👉 https://theo272004.github.io/enciclopedia-electronica-3d/

⏱️ CAPÍTULOS DEL VIDEO:
${capEp03}
\`\`\`

---

## EPISODIO #04: El Capacitor — Electrolítico, Cerámico MLCC y Tántalo
- **Video Horizontal \`16:9\`:** \`out/capacitor-es.mp4\` (\`1920x1080\`, 60 fps)
- **YouTube Short \`9:16\`:** \`out/capacitor-short-es.mp4\` (\`1080x1920\`, 60 fps, 59.6 s)
- **Título Recomendado:** \`Cómo Funciona un Capacitor por Dentro: Electrolítico vs Cerámico MLCC y ESR (Autopsia 3D)\`

\`\`\`text
Abrimos un capacitor electrolítico radial Nichicon de 100 µF (láminas de aluminio grabado, óxido dieléctrico Al2O3, papel impregnado en electrolito y válvula de alivio en K) y explicamos por qué siempre trabaja en equipo con un capacitor cerámico MLCC de 100 nF.

🔬 ENCICLOPEDIA 3D INTERACTIVA Y MODELOS CAD:
👉 https://theo272004.github.io/enciclopedia-electronica-3d/

⏱️ CAPÍTULOS DEL VIDEO:
${capEp04}
\`\`\`

---

## EPISODIO #05: El Diodo Semiconductor — Rectificador \`1N4007\`, Schottky \`1N5819\` y Zener \`1N4733A\`
- **Video Horizontal \`16:9\`:** \`out/diodo-es.mp4\` (\`1920x1080\`, 60 fps)
- **YouTube Short \`9:16\`:** \`out/diodo-short-es.mp4\` (\`1080x1920\`, 60 fps, 59.6 s)
- **Título Recomendado:** \`Diodo Rectificador, Schottky y Zener Explicados en 3D (1N4007 vs 1N5819 vs 1N4733A)\`

\`\`\`text
Realizamos la autopsia 3D de un diodo DO-41 (cabezales térmicos de cobre, unión P-N y zona de agotamiento) y comparamos las 3 familias esenciales: rectificador 1N4007 (1,000 V), barrera Schottky 1N5819 (0.32 V) y regulador Zener 1N4733A (5.1 V).

🔬 ENCICLOPEDIA 3D INTERACTIVA Y MODELOS CAD:
👉 https://theo272004.github.io/enciclopedia-electronica-3d/

⏱️ CAPÍTULOS DEL VIDEO:
${capEp05}
\`\`\`

---

## EPISODIO #06: El Inductor de Potencia y el Convertidor Buck (\`Bourns SRR1260\`)
- **Video Horizontal \`16:9\`:** \`out/inductor-es.mp4\` (\`1920x1080\`, 60 fps)
- **YouTube Short \`9:16\`:** \`out/inductor-short-es.mp4\` (\`1080x1920\`, 60 fps, 59.6 s)
- **Título Recomendado:** \`Cómo Funciona un Inductor y un Convertidor Buck por Dentro (Autopsia 3D y Saturación Magnética)\`

\`\`\`text
Cortamos en 3D un inductor blindado Bourns SRR1260 de 33 µH (núcleo de ferrita MnZn, devanado de cobre y flujo magnético toroidal), explicamos cómo una fuente conmutada Buck logra 92% de eficiencia y qué ocurre cuando superas la corriente de saturación I_sat = 3.5 A.

🔬 ENCICLOPEDIA 3D INTERACTIVA Y MODELOS CAD:
👉 https://theo272004.github.io/enciclopedia-electronica-3d/

⏱️ CAPÍTULOS DEL VIDEO:
${capEp06}
\`\`\`
`;

fs.mkdirSync(path.resolve("out/youtube"), { recursive: true });
fs.writeFileSync(path.resolve("out/youtube/plan-publicacion-youtube.md"), contenidoMd, "utf8");
console.log("✔ Plan de publicación y kit SEO generado para los 6 episodios en out/youtube/plan-publicacion-youtube.md");
