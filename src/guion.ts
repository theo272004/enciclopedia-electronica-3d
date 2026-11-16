// Fuente única del contenido y ficha técnica real (Datasheet ON Semiconductor P2N2222A / 2N2222A).

export type Idioma = "es" | "en";
export type FormatoVideo = "16:9" | "9:16";
export type EscenaId = "intro" | "autopsia" | "partes" | "circuito" | "regiones" | "cierre";

// Video largo horizontal (16:9): las 6 capas completas de ingeniería sin relleno.
export const ESCENAS_LARGO: EscenaId[] = ["intro", "autopsia", "partes", "circuito", "regiones", "cierre"];

// Video Short vertical (9:16, < 60 s): impacto directo con modelo 3D, autopsia en Blender, circuito y encapsulados.
export const ESCENAS_SHORT: EscenaId[] = ["intro", "autopsia", "circuito", "cierre"];

export const ESCENAS: EscenaId[] = ESCENAS_LARGO;

// Parámetros reales extraídos de la hoja de datos (Datasheet 2N2222A / P2N2222A — ON Semiconductor)
export const DATASHEET_2N2222A = {
  modelo: "2N2222A (NPN)",
  fabricante: "ON Semiconductor",
  encapsulado: "TO-92 (SOT-23: MMBT2222A)",
  vceoMax: "40 V",
  icMax: "600 mA",
  pdMax: "625 mW @ 25°C",
  hfeRango: "100 – 300",
  vbeSat: "0.7 V",
  vceSat: "0.3 V @ Ic=150mA",
  ft: "300 MHz",
} as const;

export const GUION: Record<Idioma, Record<EscenaId, string>> = {
  es: {
    intro:
      "Adentro de este plástico negro de cinco centavos hay oro puro... y una trampa microscópica que decide si tu celular funciona o se quema. Es el transistor.",
    autopsia:
      "Si abrimos el encapsulado de resina de un 2N2222A, vemos su secreto: un cristal de silicio con tres capas dopadas, Emisor N-plus, una Base P ultra-delgada y el Colector N, unidas a las patas por hilos de oro puro. Sin al menos 0.7 voltios en la base, su barrera interna bloquea el paso.",
    partes:
      "Un transistor tiene tres patas: la base, el colector y el emisor. La base funciona como una llave: controla cuánta corriente pasa del colector al emisor.",
    circuito:
      "Mira este circuito. Sin corriente en la base, el LED está apagado. Pero cuando aplicamos una pequeña corriente a la base... el transistor se abre, y una corriente mucho mayor enciende el LED.",
    regiones:
      "Según su hoja de datos, este transistor opera en tres regiones: en Corte bloquea hasta 40 voltios abierto; en Saturación cierra el paso cayendo apenas 0.3 voltios; y en la Región Activa multiplica la corriente de base por su ganancia Beta de hasta 300 veces.",
    cierre:
      "Por eso el transistor funciona como interruptor y como amplificador. Miles de millones de ellos forman cada procesador moderno.",
  },
  en: {
    intro:
      "This tiny component changed the world. It's inside your phone, your computer, and almost everything that runs on electricity. It's the transistor.",
    autopsia:
      "If we slice open the epoxy body of a 2N2222A, we reveal its secret: a three-layer doped silicon die—an N-plus Emitter, an ultra-thin P Base, and an N Collector—connected to the leads by pure gold bond wires. Below 0.7 volts at the base, its internal barrier blocks the current.",
    partes:
      "A transistor has three legs: the base, the collector, and the emitter. The base works like a tap: it controls how much current flows from the collector to the emitter.",
    circuito:
      "Look at this circuit. With no current at the base, the LED stays off. But when we apply a small current to the base... the transistor opens up, and a much larger current lights the LED.",
    regiones:
      "According to its datasheet, this transistor works in three regions: in Cutoff it blocks up to 40 volts; in Saturation it acts as a closed switch dropping just 0.3 volts; and in the Active Region it multiplies base current by its Beta gain of up to 300 times.",
    cierre:
      "That's why the transistor works as both a switch and an amplifier. Billions of them make up every modern processor.",
  },
};

// Palabras de la narración que disparan animaciones (sincronía voz ↔ imagen).
export const MARCAS = {
  es: {
    titulo: "transistor",
    abrimos: "abrimos",
    silicio: "silicio",
    hilos: "oro",
    barrera: "0.7",
    base: "base",
    colector: "colector",
    emisor: "emisor",
    llave: "llave",
    baseOn: "aplicamos",
    corte: "corte",
    saturacion: "saturacion",
    activa: "activa",
    interruptor: "interruptor",
    amplificador: "amplificador",
    miles: "miles",
  },
  en: {
    titulo: "transistor",
    abrimos: "slice",
    silicio: "silicon",
    hilos: "gold",
    barrera: "0.7",
    base: "base",
    colector: "collector",
    emisor: "emitter",
    llave: "tap",
    baseOn: "apply",
    corte: "cutoff",
    saturacion: "saturation",
    activa: "active",
    interruptor: "switch",
    amplificador: "amplifier",
    miles: "billions",
  },
} as const satisfies Record<Idioma, Record<string, string>>;

export const TEXTOS = {
  es: {
    titulo: "El transistor",
    subtitulo: "Datasheet 2N2222A · Arquitectura y Física Real",
    autopsiaTitulo: "Autopsia Interna · Encapsulado TO-92",
    autopsiaSub: "Anatomía Semiconductora · Silicio Planar Epitaxial NPN",
    capaEmisor: "Emisor (Silicio N⁺ fuertemente dopado)",
    capaBase: "Base (Silicio P ultra-delgado · Barrera 0.7 V)",
    capaColector: "Colector (Sustrato N sobre paleta de cobre)",
    capaHilos: "Hilos de enlace Au (25 µm) → Pines E y B",
    base: "Base",
    colector: "Colector",
    emisor: "Emisor",
    ib: "I_B ≈ 8.3 mA (Base)",
    ic: "I_C ≈ 20 mA (Colector)",
    vbe: "V_BE = 0.7 V · V_CE(sat) = 0.3 V",
    regionesTitulo: "Curvas del Datasheet · I_C vs V_CE (2N2222A)",
    regCorte: "1. CORTE (Interruptor Abierto)",
    regCorteDesc: "V_BE < 0.7 V → I_B = 0 mA · Soporta hasta V_CEO = 40 V",
    regSat: "2. SATURACIÓN (Interruptor Cerrado)",
    regSatDesc: "V_CE(sat) ≈ 0.3 V · Mínima disipación térmica",
    regActiva: "3. REGIÓN ACTIVA (Amplificador Lineal)",
    regActivaDesc: "I_C = β · I_B (h_FE = 100–300) · Límite P_D = 625 mW",
    interruptor: "Interruptor",
    amplificador: "Amplificador",
    chip: "Encapsulados de Producción (THT vs SMD) y Escala VLSI",
    pkgTo92: "TO-92 (2N2222A) · THT 625 mW",
    pkgSot23: "SOT-23 (MMBT2222A) · SMD 350 mW",
    pkgTo220: "TO-220 (TIP31C) · Potencia > 2 A",
  },
  en: {
    titulo: "The transistor",
    subtitulo: "2N2222A Datasheet · Real Physics & Architecture",
    autopsiaTitulo: "Internal Autopsy · TO-92 Package",
    autopsiaSub: "Blender 5.0 Boolean Cutaway · Epitaxial Planar Silicon",
    capaEmisor: "Emitter (Heavily doped N⁺ silicon)",
    capaBase: "Base (Ultra-thin P layer · 0.7 V Barrier)",
    capaColector: "Collector (N substrate on copper paddle)",
    capaHilos: "Au Bond Wires (25 µm) → E & B Leads",
    base: "Base",
    colector: "Collector",
    emisor: "Emitter",
    ib: "I_B ≈ 8.3 mA (Base)",
    ic: "I_C ≈ 20 mA (Collector)",
    vbe: "V_BE = 0.7 V · V_CE(sat) = 0.3 V",
    regionesTitulo: "Datasheet Curves · I_C vs V_CE (2N2222A)",
    regCorte: "1. CUTOFF (Open Switch)",
    regCorteDesc: "V_BE < 0.7 V → I_B = 0 mA · Blocks up to V_CEO = 40 V",
    regSat: "2. SATURATION (Closed Switch)",
    regSatDesc: "V_CE(sat) ≈ 0.3 V · Minimal thermal loss",
    regActiva: "3. ACTIVE REGION (Linear Amplifier)",
    regActivaDesc: "I_C = β · I_B (h_FE = 100–300) · Max P_D = 625 mW",
    interruptor: "Switch",
    amplificador: "Amplifier",
    chip: "Real KiCad 9.0 Packages & VLSI Scale",
    pkgTo92: "TO-92 (2N2222A) · THT 625 mW",
    pkgSot23: "SOT-23 (MMBT2222A) · SMD 350 mW",
    pkgTo220: "TO-220 (TIP31C) · Power > 2 A",
  },
} satisfies Record<Idioma, Record<string, string>>;
