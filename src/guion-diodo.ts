// Fuente única del Episodio 05: Diodos — Rectificador (1N4007), Schottky (1N5819) y Zener (1N4733A)
// Datasheets de referencia: Vishay 1N4007 (1000V 1A, V_F = 0.7V) · 1N5819 Schottky (40V 1A, V_F = 0.25V) · 1N4733A Zener (V_Z = 5.1V 1W)

import type { EscenaId, Idioma } from "./guion";

export const DATASHEET_DIODO = {
  modelo: "1N4007 (P-N) · 1N5819 (Schottky) · 1N4733A (Zener)",
  vrrm1n4007: "1,000 V (I_F = 1.0 A)",
  vfSilicio: "0.7 V (Unión P-N 1N4007)",
  vfSchottky: "0.22 – 0.35 V (Metal-Silicio 1N5819)",
  vzZener: "5.1 V ±5% @ 49 mA (1N4733A)",
  trr: "30 µs (1N4007) vs. < 5 ns (Schottky)",
} as const;

export const GUION_DIODO: Record<Idioma, Record<EscenaId, string>> = {
  es: {
    intro:
      "Es la válvula antirretorno de la electrónica: deja fluir la corriente en un sentido y levanta un muro de hasta mil voltios en el sentido contrario. Es el diodo semiconductor, y sin él sería imposible convertir la corriente alterna de tu enchufe en corriente continua.",
    autopsia:
      "Si abrimos un diodo 1N4007, encontramos una pastilla de silicio con una mitad tipo P y otra mitad tipo N comprimida entre dos cabezales de cobre que disipan el calor. En el centro se forma una zona de agotamiento sin cargas libres: solo cuando aplicamos más de 0.7 voltios del ánodo al cátodo esa barrera colapsa y los electrones cruzan.",
    partes:
      "La flecha del símbolo apunta del Ánodo al Cátodo, indicando el sentido permitido de la corriente. En el componente físico, una franja plateada o negra marca siempre el Cátodo, que actúa como la puerta de salida.",
    circuito:
      "Cuando combinamos cuatro diodos en un Puente de Graetz, logramos rectificar la onda alterna completa: en el semiciclo positivo conducen dos diodos, y en el semiciclo negativo conducen los otros dos, obligando a que la corriente salga siempre con la misma polaridad hacia la carga.",
    regiones:
      "Pero no todos los diodos trabajan igual en su curva característica: el 1N4007 de silicio pierde 0.7 voltios en directa; el diodo Schottky 1N5819 usa una unión metal-semiconductor que cae apenas 0.25 voltios y conmuta en nanosegundos; y el diodo Zener se diseña para conducir en inversa a un voltaje exacto como 5.1 voltios.",
    cierre:
      "Desde el 1N4007 en fuentes rectificadoras y el Schottky en fuentes conmutadas de alta velocidad, hasta el diodo Zener de vidrio DO-35 para referencias de tensión: conocer su curva exacta define el éxito de tu diseño.",
  },
  en: {
    intro:
      "It is the one-way check valve of electronics: it lets current flow freely in one direction while standing as a thousand-volt wall in reverse. This is the semiconductor diode, the component that turns AC wall power into DC.",
    autopsia:
      "If we slice open a 1N4007 diode, we find a P-N silicon die sandwiched between two heavy copper heat slugs. At the junction sits a charge-free depletion zone: only when we apply more than 0.7 volts from anode to cathode does that barrier collapse and allow current to flow.",
    partes:
      "The schematic arrow points from Anode to Cathode in the direction of conventional current flow. On the physical package, a silver or black band always marks the Cathode terminal.",
    circuito:
      "When we arrange four diodes in a Full-Wave Bridge Rectifier, we flip the negative half-cycles of AC into positive pulses: two diodes conduct on the positive swing, and the other two conduct on the negative swing, feeding unidirectional current to the load.",
    regiones:
      "Yet different diode families behave uniquely across the V-I curve: a standard 1N4007 silicon diode drops 0.7 volts; a 1N5819 Schottky diode uses a metal-silicon junction that drops just 0.25 volts and switches in nanoseconds; and a Zener diode is engineered to conduct safely in reverse breakdown at a precise voltage like 5.1 volts.",
    cierre:
      "From the 1N4007 in mains rectifiers and Schottky diodes in high-frequency converters, to glass DO-35 Zener diodes for voltage clamping: picking the right junction is essential for every circuit.",
  },
};

export const MARCAS_DIODO = {
  es: {
    titulo: "diodo",
    abrimos: "abrimos",
    agotamiento: "agotamiento",
    barrera: "0.7",
    anodo: "anodo",
    catodo: "catodo",
    puente: "puente",
    alterna: "alterna",
    schottky: "schottky",
    zener: "zener",
    do41: "1n4007",
    do35: "do-35",
  },
  en: {
    titulo: "diode",
    abrimos: "slice",
    agotamiento: "depletion",
    barrera: "0.7",
    anodo: "anode",
    catodo: "cathode",
    puente: "bridge",
    alterna: "negative",
    schottky: "schottky",
    zener: "zener",
    do41: "1n4007",
    do35: "do-35",
  },
} as const satisfies Record<Idioma, Record<string, string>>;

export const TEXTOS_DIODO = {
  es: {
    titulo: "El diodo",
    subtitulo: "Datasheet 1N4007 / 1N5819 / 1N4733A · Unión P-N, Rectificación y Zener",
    autopsiaTitulo: "Autopsia Interna · Diodo DO-41 (Vishay 1N4007)",
    autopsiaSub: "Corte Booleano Blender 5.0 · Cabezales de Cobre y Barrera de Agotamiento P-N",
    capaAnodo: "Cabezal Térmico de Cobre + Región P (Ánodo — Huecos)",
    capaBarrera: "Zona de Agotamiento (Colapsa con V_F ≥ 0.7 V · Bloquea 1,000 V en inversa)",
    capaCatodo: "Región N (Electrones) + Cabezal de Cátodo",
    capaBanda: "Franja Plateada Exterior (Identifica el terminal de Cátodo)",
    pinA: "Ánodo (+)",
    pinK: "Cátodo (−) · Banda",
    vfTxt: "Caída en Directa: V_F ≈ 0.7 V (Silicio) | 0.25 V (Schottky)",
    puenteTxt: "Puente de Graetz (4 × 1N4007): Rectificación de Onda Completa",
    caidaPuente: "Caída total del puente: 2 × 0.7 V = 1.4 V",
    curvaTitulo: "Curva Característica V-I Real: Silicio vs. Schottky vs. Zener",
    regSilicio: "1. DIODO RECTIFICADOR DE SILICIO (1N4007)",
    regSilicioDesc: "V_F ≈ 0.7 V · V_RRM = 1,000 V · Lento (t_rr ≈ 30 µs, para 50/60 Hz)",
    regSchottky: "2. DIODO SCHOTTKY METAL-SILICIO (1N5819)",
    regSchottkyDesc: "V_F ≈ 0.25 V · Conmutación instantánea (< 5 ns) · Ideal en fuentes PWM",
    regZener: "3. DIODO ZENER EN RUPTURA CONTROLADA (1N4733A)",
    regZenerDesc: "Opera en polarización inversa clavando el voltaje en V_Z = 5.1 V",
    cardRect: "Rectificador / Schottky",
    cardZener: "Regulador Zener (V_Z)",
    chip: "Encapsulados Reales en KiCad 9.0: DO-41 Epóxico y DO-35 de Vidrio",
    pkgDo41: "DO-41 (1N4007 / 1N5819) · 1 A",
    pkgDo35: "DO-35 Vidrio (1N4733A Zener / 1N4148)",
    pkgSmd: "Puente / Protección TVS",
  },
  en: {
    titulo: "The diode",
    subtitulo: "1N4007 / 1N5819 / 1N4733A Datasheet · P-N Junction, Bridge & Zener",
    autopsiaTitulo: "Internal Autopsy · DO-41 Diode (Vishay 1N4007)",
    autopsiaSub: "Blender 5.0 Boolean Cutaway · Copper Heat Slugs & Depletion Zone",
    capaAnodo: "Copper Thermal Slug + P-Region (Anode — Holes)",
    capaBarrera: "Depletion Zone (Collapses at V_F ≥ 0.7 V · Blocks 1,000 V reverse)",
    capaCatodo: "N-Region (Electrons) + Cathode Copper Slug",
    capaBanda: "Exterior Silver Band (Marks the Cathode terminal)",
    pinA: "Anode (+)",
    pinK: "Cathode (−) · Band",
    vfTxt: "Forward Drop: V_F ≈ 0.7 V (Silicon) | 0.25 V (Schottky)",
    puenteTxt: "Full-Wave Bridge (4 × 1N4007): AC to Pulsating DC",
    caidaPuente: "Total bridge drop: 2 × 0.7 V = 1.4 V",
    curvaTitulo: "Real V-I Characteristic Curve: Silicon vs. Schottky vs. Zener",
    regSilicio: "1. STANDARD SILICON RECTIFIER (1N4007)",
    regSilicioDesc: "V_F ≈ 0.7 V · V_RRM = 1,000 V · Slow recovery (30 µs, for 50/60 Hz)",
    regSchottky: "2. SCHOTTKY METAL-SILICON DIODE (1N5819)",
    regSchottkyDesc: "V_F ≈ 0.25 V · Nanosecond switching (< 5 ns) · Ideal for PWM converters",
    regZener: "3. ZENER DIODE IN REVERSE BREAKDOWN (1N4733A)",
    regZenerDesc: "Operates safely in reverse avalanche, clamping voltage at V_Z = 5.1 V",
    cardRect: "Rectifier / Schottky",
    cardZener: "Zener Regulator (V_Z)",
    chip: "Real KiCad 9.0 Packages: DO-41 Epoxy & DO-35 Glass",
    pkgDo41: "DO-41 (1N4007 / 1N5819) · 1 A",
    pkgDo35: "DO-35 Glass (1N4733A Zener / 1N4148)",
    pkgSmd: "Bridge & Clamping Protection",
  },
} satisfies Record<Idioma, Record<string, string>>;
