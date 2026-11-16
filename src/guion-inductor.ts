// Fuente única del Episodio 06: Inductores y el Convertidor Buck (LM2596 / Bourns SRR1260)
// Datasheets de referencia: Bourns SRR1260 (33 µH 3.0 A, DCR = 39 mΩ, I_sat = 3.5 A) + Texas Instruments LM2596 (150 kHz Buck)

import type { EscenaId, Idioma } from "./guion";

export const DATASHEET_INDUCTOR = {
  modelo: "Bourns SRR1260-330M (33 µH) + EPCOS Toroidal",
  inductancia: "33 µH ±20% (I_rms = 3.0 A · I_sat = 3.5 A)",
  dcr: "39 mΩ máx",
  ecuacion: "V_L = L · (dI / dt) · E = ½ · L · I²",
  nucleo: "Ferrita MnZn Blindada (Baja radiación EMI)",
  eficienciaBuck: "92% (Buck Conmutado) vs. 41% (Lineal LM7805 de 12V a 5V)",
} as const;

export const GUION_INDUCTOR: Record<Idioma, Record<EscenaId, string>> = {
  es: {
    intro:
      "Mientras el capacitor almacena energía en un campo eléctrico y odia los cambios bruscos de voltaje, su hermano gemelo magnético hace exactamente lo opuesto: el inductor almacena energía en un campo magnético y se opone a cualquier cambio brusco de corriente.",
    autopsia:
      "Si abrimos un inductor de potencia blindado Bourns de 33 microhenrios, vemos una bobina de cobre grueso enrollada sobre un tambor de ferrita y rodeada por un escudo magnético. Cuando pasa corriente, las líneas de flujo magnético se concentran en la ferrita acumulando energía sin apenas perder calor gracias a sus 39 miliohmios.",
    partes:
      "Su símbolo esquemático representa las espiras del alambre y el núcleo. Dos parámetros de su hoja de datos son sagrados: la corriente efectiva térmica y la corriente de saturación. Si superas la corriente de saturación, el núcleo de ferrita se satura, la inductancia cae a cero y actúa como un cortocircuito.",
    circuito:
      "Su aplicación estrella es el convertidor Buck que baja 12 voltios a 5 voltios sin quemar energía: cuando el transistor conmuta a 150 kilohercios, el inductor absorbe el exceso de voltaje inflando su campo magnético; y cuando el transistor se apaga, el inductor descarga esa energía a través del diodo Schottky manteniendo 5 voltios continuos.",
    regiones:
      "Mira en las gráficas por qué un convertidor Buck con inductor reemplaza al viejo regulador lineal 7805: para bajar de 12 a 5 voltios a 2 amperios, el regulador lineal quema 14 vatios en calor con solo 41 por ciento de eficiencia, mientras el inductor en un Buck logra más del 90 por ciento de eficiencia.",
    cierre:
      "Desde el inductor radial de tambor y el inductor SMD blindado para fuentes conmutadas, hasta el toroide de filtro EMI: dominar el inductor es dominar la electrónica de potencia moderna.",
  },
  en: {
    intro:
      "While a capacitor stores energy in an electric field and resists sudden changes in voltage, its magnetic twin does the exact opposite: the inductor stores energy in a magnetic field and fights any sudden change in current.",
    autopsia:
      "If we slice open a 33-microhenry Bourns shielded power inductor, we see heavy copper wire wound around a ferrite drum core inside a magnetic shield. As current flows, magnetic flux lines concentrate inside the ferrite, storing energy with minimal loss thanks to its 39-milliohm resistance.",
    partes:
      "Its schematic symbol depicts the wire coils and core. Two datasheet ratings are critical: thermal RMS current and saturation current. If you exceed the saturation current, the ferrite core saturates, inductance collapses, and the coil turns into a short circuit.",
    circuito:
      "Its flagship role is the Buck converter stepping 12 volts down to 5 volts without wasting heat: when the switch turns on at 150 kilohertz, the inductor absorbs the voltage difference by expanding its magnetic field; when the switch turns off, the collapsing field drives current through the Schottky diode to maintain a steady 5-volt output.",
    regiones:
      "Look at the waveforms to see why an inductor-based Buck converter beats an old 7805 linear regulator: dropping 12 volts to 5 volts at 2 amps forces a linear regulator to burn 14 watts as heat at 41 percent efficiency, whereas the Buck inductor achieves over 90 percent efficiency.",
    cierre:
      "From radial drum coils and shielded SMD power inductors for switching regulators, to toroidal EMI chokes: mastering the inductor is the key to modern power electronics.",
  },
};

export const MARCAS_INDUCTOR = {
  es: {
    titulo: "inductor",
    abrimos: "abrimos",
    ferrita: "ferrita",
    flujo: "flujo",
    saturacion: "saturacion",
    buck: "buck",
    schottky: "schottky",
    lineal: "lineal",
    noventa: "90",
    radial: "radial",
    toroide: "toroide",
  },
  en: {
    titulo: "inductor",
    abrimos: "slice",
    ferrita: "ferrite",
    flujo: "flux",
    saturacion: "saturation",
    buck: "buck",
    schottky: "schottky",
    lineal: "linear",
    noventa: "90",
    radial: "radial",
    toroide: "toroidal",
  },
} as const satisfies Record<Idioma, Record<string, string>>;

export const TEXTOS_INDUCTOR = {
  es: {
    titulo: "El inductor",
    subtitulo: "Datasheet Bourns SRR1260 · Flujo Magnético, Saturación y Convertidor Buck",
    autopsiaTitulo: "Autopsia Interna · Inductor Blindado Bourns SRR1260 (33 µH)",
    autopsiaSub: "Corte Booleano Blender 5.0 · Núcleo de Ferrita MnZn y Flujo Magnético 3D",
    capaFerrita: "Núcleo Tambor de Ferrita MnZn (Multiplica la permeabilidad magnética µ)",
    capaCobre: "Devanado de Cobre Esmaltado Grueso (DCR = 39 mΩ · I_rms = 3.0 A)",
    capaFlujo: "Campo Magnético Φ_B (Almacena energía E = ½ · L · I²)",
    capaEscudo: "Coraza Exterior de Ferrita (Confinamiento magnético · Baja EMI)",
    pinL: "L = 33 µH (Inercia de Corriente)",
    isatTxt: "¡Peligro I_sat = 3.5 A! Si el núcleo satura, L cae y quema el MOSFET",
    buckOn: "TON (Switch ON): El inductor se carga suavizando el paso de 12V a 5V",
    buckOff: "TOFF (Switch OFF): El campo colapsa e impulsa corriente vía Diodo Schottky",
    eficienciaTxt: "V_out = V_in · Duty Cycle (5 V / 12 V = 41.6% PWM)",
    oscTitulo: "Comparativa en Fuente de 12 V → 5 V @ 2 A (Lineal vs. Buck Conmutado)",
    regLineal: "1. REGULADOR LINEAL (LM7805 — Quema el exceso en calor)",
    regLinealDesc: "P_Calor = (12V − 5V) × 2A = 14.0 W perdidos · Eficiencia = 41.6%",
    regBuck: "2. CONVERTIDOR BUCK CON INDUCTOR (33 µH @ 150 kHz)",
    regBuckDesc: "Corriente triangular ΔI_L suave · Solo 0.9 W perdidos · Eficiencia = 92%",
    regSat: "3. LÍMITE DE SATURACIÓN MAGNÉTICA DEL NÚCLEO (I_sat)",
    regSatDesc: "Superar 3.5 A alinea todos los dominios magnéticos y dispara un pico de corriente",
    cardRadial: "Inductor de Potencia (Buck/Boost)",
    cardChoke: "Toroide de Filtro (Supresión EMI)",
    chip: "Variaciones Reales en KiCad 9.0: Tambor Radial, SMD Blindado y Toroide EPCOS",
    pkgRadial: "Radial Fastron 07M · 100 µH",
    pkgSmd: "SMD Blindado Bourns SRR1260 · 33 µH 3 A",
    pkgToroid: "Toroide EPCOS B82722A · Filtro EMI",
  },
  en: {
    titulo: "The inductor",
    subtitulo: "Bourns SRR1260 Datasheet · Magnetic Flux, Core Saturation & Buck Converter",
    autopsiaTitulo: "Internal Autopsy · Bourns SRR1260 Shielded Inductor (33 µH)",
    autopsiaSub: "Blender 5.0 Boolean Cutaway · MnZn Ferrite Core & 3D Magnetic Flux",
    capaFerrita: "MnZn Ferrite Drum Core (Multiplies magnetic permeability µ)",
    capaCobre: "Heavy Enameled Copper Winding (DCR = 39 mΩ · I_rms = 3.0 A)",
    capaFlujo: "Magnetic Flux Rings Φ_B (Stores energy E = ½ · L · I²)",
    capaEscudo: "Outer Ferrite Shield Ring (Contains magnetic field · Low EMI)",
    pinL: "L = 33 µH (Current Inertia)",
    isatTxt: "Warning I_sat = 3.5 A! Core saturation collapses L and shorts the switch",
    buckOn: "TON (Switch ON): Inductor charges while stepping 12V down to 5V",
    buckOff: "TOFF (Switch OFF): Collapsing field drives current via Schottky Diode",
    eficienciaTxt: "V_out = V_in · Duty Cycle (5 V / 12 V = 41.6% PWM)",
    oscTitulo: "12 V → 5 V @ 2 A Step-Down Comparison (Linear vs. Buck Inductor)",
    regLineal: "1. LINEAR REGULATOR (LM7805 — Burns excess voltage as heat)",
    regLinealDesc: "P_Heat = (12V − 5V) × 2A = 14.0 W wasted · Efficiency = 41.6%",
    regBuck: "2. BUCK CONVERTER WITH INDUCTOR (33 µH @ 150 kHz)",
    regBuckDesc: "Smooth triangular ΔI_L ripple · Only 0.9 W lost · Efficiency = 92%",
    regSat: "3. MAGNETIC CORE SATURATION LIMIT (I_sat)",
    regSatDesc: "Exceeding 3.5 A aligns all magnetic domains and causes a current spike",
    cardRadial: "Power Inductor (Buck/Boost)",
    cardChoke: "Toroidal Choke (EMI Filter)",
    chip: "Real KiCad 9.0 Inductor Variations: Radial Drum, Shielded SMD & EPCOS Toroid",
    pkgRadial: "Radial Fastron 07M · 100 µH",
    pkgSmd: "Shielded SMD Bourns SRR1260 · 33 µH 3 A",
    pkgToroid: "EPCOS B82722A Toroid · EMI Choke",
  },
} satisfies Record<Idioma, Record<string, string>>;
