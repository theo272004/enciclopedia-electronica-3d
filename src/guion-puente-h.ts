import type { EscenaId, Idioma } from "./guion";

export const DATASHEET_PUENTE_H = {
  referenciaBjt: "ST L298N (Doble Puente H Bipolar)",
  referenciaMosfet: "TI DRV8833 (Doble Puente H MOSFET)",
  caidaL298N: "1.8 V a 3.2 V @ 1 A (hasta 4.9 V @ 2 A)",
  rdsOnDrv8833: "360 mΩ (HS + LS) → 0.36 V @ 1 A",
  corrienteMax: "2.0 A continuos por canal",
  trampaShootThrough: "Nunca activar Q1 + Q4 del mismo lado a la vez",
};

export const GUION_PUENTE_H: Record<Idioma, Record<EscenaId, string>> = {
  es: {
    intro:
      "Si alguna vez armaste un robot con este módulo rojo L298N y viste que el disipador arde mientras tus motores giran lento, aquí está la razón real: el L298N pierde hasta tres voltios completos en calor antes de llegar al motor.",
    autopsia:
      "Al abrir su encapsulado de potencia encontramos cuatro transistores bipolares dispuestos en forma de H sobre un sustrato de cobre. El problema es físico: cada transistor bipolar en conducción pierde más de un voltio en su unión colector-emisor.",
    partes:
      "Piénsalo como cuatro válvulas hidráulicas en cruz. Si abres la válvula superior izquierda y la inferior derecha, el agua gira la turbina hacia adelante. Cierras esas y abres la diagonal contraria: el flujo se invierte al instante.",
    circuito:
      "¿Y qué pasa si por un error de código activas los dos transistores del mismo lado a la vez? Creas un cortocircuito directo llamado shoot-through: la batería se descarga directo a tierra y destruye el silicio en milisegundos.",
    regiones:
      "Compara los números del datasheet con un puente H moderno de MOSFETs como el DRV8833. A un amperio, el L298N desperdicia dos coma cinco vatios en calor, mientras el DRV8833 apenas disipa cero coma treinta y seis vatios.",
    cierre:
      "Por eso, si usas baterías de litio o robots portátiles, cambia el L298N por un puente H MOSFET en HTSSOP-16 y guarda el L298N solo para cargas de doce a treinta y cinco voltios.",
  },
  en: {
    intro:
      "If you ever built a robot with this red L298N module and noticed the heatsink burning hot while your motors crawl, here is why: the L298N drops up to three full volts as pure heat before power even reaches the motor.",
    autopsia:
      "Slicing open its power package reveals four bipolar transistors arranged in an H matrix on a copper heatsink tab. The flaw is pure physics: every bipolar transistor drops over a volt across its collector-emitter junction.",
    partes:
      "Picture four hydraulic valves in a cross. Open the top-left and bottom-right valves, and fluid spins the turbine forward. Flip to the opposite diagonal, and current reverses direction instantly.",
    circuito:
      "What happens if a software bug turns on both transistors on the same side at once? You trigger shoot-through: a dead short straight from battery to ground that vaporizes the silicon in milliseconds.",
    regiones:
      "Compare the datasheet against a modern MOSFET H-bridge like the DRV8833. At one amp, the L298N wastes two point five watts as heat, while the DRV8833 dissipates just zero point three six watts.",
    cierre:
      "For battery-powered robots, ditch the L298N for a MOSFET H-bridge in HTSSOP-16, and save the L298N only for twelve to thirty-five volt motors.",
  },
};

export const MARCAS_PUENTE_H: Record<Idioma, Record<string, string>> = {
  es: {
    calor: "calor",
    cuatro: "cuatro",
    cobre: "cobre",
    adelante: "adelante",
    invierte: "invierte",
    shootThrough: "shoot-through",
    cortocircuito: "cortocircuito",
    drv8833: "DRV8833",
    vatios: "vatios",
  },
  en: {
    calor: "heat",
    cuatro: "four",
    cobre: "copper",
    adelante: "forward",
    invierte: "reverses",
    shootThrough: "shoot-through",
    cortocircuito: "short",
    drv8833: "DRV8833",
    vatios: "watts",
  },
};

export const TEXTOS_PUENTE_H: Record<Idioma, Record<string, string>> = {
  es: {
    titulo: "El Puente H",
    subtitulo: "L298N (BJT) VS. DRV8833 (MOSFET) · INVERSIÓN DE GIRO Y SHOOT-THROUGH",
    badge: "ST L298N: V_drop ≈ 2.5 V @ 1 A | TI DRV8833: R_DS(on) = 360 mΩ",
    autopsiaSub: "AUTOPSIA 3D BLENDER 5.0 · MATRIZ DE 4 TRANSISTORES DE POTENCIA",
    autopsiaTitulo: "Por Dentro del Driver Puente H (L298N)",
    cotaAlta: "High-Side Q1 / Q3 (+VCC)",
    cotaBaja: "Low-Side Q4 / Q2 (GND)",
    cotaCobre: "Sustrato Térmico (Disipación)",
    analogiaConcepto: "PUENTE H",
    analogiaFisico: "4 VÁLVULAS EN CRUZ",
    analogiaDesc: "Al activar diagonales opuestas (Q1+Q2 vs Q3+Q4) inviertes la polaridad del motor DC sin relés mecánicos.",
    circuitoSub: "TRAMPA REAL DE TALLER · CORTOCIRCUITO SHOOT-THROUGH",
    circuitoTitulo: "Giro Directo, Reversa y Peligro de Tiempo Muerto",
    regionesSub: "DATASHEET COMPARADO · EFICIENCIA EN BATERÍAS (I = 1.0 A)",
    regionesTitulo: "L298N (2.5 W en Calor) vs. DRV8833 (0.36 W)",
    cierreSub: "ELECCIÓN REAL DE INGENIERÍA EN KICAD 9.0",
    cierreTitulo: "Cuándo usar L298N vs. DRV8833 MOSFET",
    cta: "Descarga el modelo 3D y esquemático en GitHub",
  },
  en: {
    titulo: "The H-Bridge",
    subtitulo: "L298N (BJT) VS. DRV8833 (MOSFET) · MOTOR REVERSAL & SHOOT-THROUGH",
    badge: "ST L298N: V_drop ≈ 2.5 V @ 1 A | TI DRV8833: R_DS(on) = 360 mΩ",
    autopsiaSub: "BLENDER 5.0 3D AUTOPSY · 4-TRANSISTOR POWER MATRIX",
    autopsiaTitulo: "Inside the L298N Power H-Bridge",
    cotaAlta: "High-Side Q1 / Q3 (+VCC)",
    cotaBaja: "Low-Side Q4 / Q2 (GND)",
    cotaCobre: "Copper Thermal Tab",
    analogiaConcepto: "H-BRIDGE",
    analogiaFisico: "4 CROSS VALVES",
    analogiaDesc: "Switching opposite diagonals (Q1+Q2 vs Q3+Q4) reverses DC motor polarity electronically.",
    circuitoSub: "REAL BENCH TRAP · SHOOT-THROUGH SHORT CIRCUIT",
    circuitoTitulo: "Forward, Reverse & Dead-Time Hazard",
    regionesSub: "DATASHEET BENCHMARK · BATTERY EFFICIENCY (I = 1.0 A)",
    regionesTitulo: "L298N (2.5 W Heat) vs. DRV8833 (0.36 W)",
    cierreSub: "REAL ENGINEERING CHOICE IN KICAD 9.0",
    cierreTitulo: "When to pick L298N vs. DRV8833 MOSFET",
    cta: "Download 3D models & schematics on GitHub",
  },
} satisfies Record<Idioma, Record<string, string>>;
