// Fuente única del Episodio 03: BJT vs. MOSFET de Potencia (IRFZ44N — Física del Canal, Capacitancia y Calor)
// Datasheets de referencia: Infineon IRFZ44N (HEXFET 55V, 49A, R_DS(on) = 17.5 mΩ, C_iss = 1470 pF) vs. TIP31C (BJT TO-220)

import type { EscenaId, Idioma } from "./guion";

export const DATASHEET_IRFZ44N = {
  modelo: "Infineon IRFZ44N (HEXFET N-Ch)",
  vdssMax: "55 V",
  idMax: "49 A @ 25°C",
  rdsOn: "17.5 mΩ @ V_GS = 10 V",
  vgsTh: "2.0 – 4.0 V (Umbral 250 µA)",
  ciss: "1470 pF (Q_g = 63 nC)",
  pdMax: "94 W (Con disipador)",
} as const;

export const GUION_MOSFET: Record<Idioma, Record<EscenaId, string>> = {
  es: {
    intro:
      "Por fuera lucen idénticos en el mismo encapsulado TO-220, pero por dentro pertenecen a dos mundos distintos. Mientras un transistor BJT exige corriente continua y se calienta con cargas grandes, el MOSFET controla casi 50 amperios usando solo un campo eléctrico.",
    autopsia:
      "Si abrimos un MOSFET IRFZ44N, vemos por qué es tan eficiente: su compuerta está separada del silicio por una capa nanométrica de dióxido de silicio aislante. Al aplicar voltaje en la compuerta, el campo eléctrico atrae electrones y crea un canal conductor con apenas 17.5 miliohmios de resistencia y cero corriente continua de control.",
    partes:
      "Sus tres terminales son Compuerta, Drenador y Fuente. Pero cuidado con la trampa más común de su hoja de datos: aunque su voltaje umbral dice 2 a 4 voltios, ahí apenas conduce microamperios. Un IRFZ44N estándar exige 10 voltios en la compuerta para abrir su canal al cien por ciento.",
    circuito:
      "Además, esa capa aislante convierte la compuerta en un capacitor interno de 1,470 picofaradios. Al conmutar por PWM a miles de hercios, necesitas una resistencia de compuerta de bajo valor o un driver dedicado para cargar y descargar ese capacitor rápido, más otra resistencia pull-down a tierra para que no se encienda solo por ruido.",
    regiones:
      "Mira la diferencia térmica conduciendo 10 amperios: un BJT de potencia cae al menos 1.2 voltios y disipa 12 vatios en puro calor; en cambio, el MOSFET IRFZ44N en región óhmica con 17.5 miliohmios cae solo 0.17 voltios y disipa apenas 1.75 vatios.",
    cierre:
      "Desde el clásico TO-220 con disipador de aluminio hasta los encapsulados superficiales DPAK y D2PAK en placas madre y variadores: usa BJT para señales pequeñas de bajo costo y elige MOSFET para conmutar potencia con máxima eficiencia.",
  },
  en: {
    intro:
      "From the outside they look identical in the same TO-220 package, but inside they belong to two different worlds. While a BJT demands continuous base current and heats up under heavy loads, the power MOSFET switches nearly 50 amps using purely an electric field.",
    autopsia:
      "If we slice open an IRFZ44N MOSFET, we see why it is so efficient: its gate is isolated from the silicon by a nanometric layer of silicon dioxide glass. Applying voltage to the gate creates an electric field that forms a conductive channel with just 17.5 milliohms of resistance and zero continuous gate current.",
    partes:
      "Its three terminals are Gate, Drain, and Source. Beware of the most common datasheet trap: although its threshold voltage says 2 to 4 volts, at that point it barely conducts microamps. A standard IRFZ44N requires 10 volts at the gate to fully open its channel.",
    circuito:
      "Furthermore, that oxide layer turns the gate into a 1,470-picofarad capacitor. When switching PWM at kilohertz frequencies, you need a low-value gate resistor or a gate driver to charge and discharge that capacitance quickly, plus a pull-down resistor to ground so stray noise never turns it on.",
    regiones:
      "Look at the thermal difference carrying 10 amps: a power BJT drops at least 1.2 volts and burns 12 watts as heat; meanwhile, the IRFZ44N MOSFET in its ohmic region with 17.5 milliohms drops only 0.17 volts and dissipates just 1.75 watts.",
    cierre:
      "From the classic TO-220 with an aluminum heatsink to surface-mount DPAK and D2PAK packages on motherboards and motor drives: use BJTs for low-cost small signals, and choose MOSFETs to switch serious power with maximum efficiency.",
  },
};

export const MARCAS_MOSFET = {
  es: {
    titulo: "mosfet",
    abrimos: "abrimos",
    oxido: "oxido",
    canal: "canal",
    miliohmios: "17.5",
    compuerta: "compuerta",
    drenador: "drenador",
    fuente: "fuente",
    diez: "10",
    capacitor: "capacitor",
    pulldown: "pull-down",
    doce: "12",
    ohmica: "ohmica",
    to220: "to-220",
    dpak: "dpak",
    eficiencia: "eficiencia",
  },
  en: {
    titulo: "mosfet",
    abrimos: "slice",
    oxido: "dioxide",
    canal: "channel",
    miliohmios: "17.5",
    compuerta: "gate",
    drenador: "drain",
    fuente: "source",
    diez: "10",
    capacitor: "capacitor",
    pulldown: "pull-down",
    doce: "12",
    ohmica: "ohmic",
    to220: "to-220",
    dpak: "dpak",
    eficiencia: "efficiency",
  },
} as const satisfies Record<Idioma, Record<string, string>>;

export const TEXTOS_MOSFET = {
  es: {
    titulo: "El MOSFET",
    subtitulo: "Datasheet Infineon IRFZ44N · Campo Eléctrico, R_DS(on) y Eficiencia",
    autopsiaTitulo: "Autopsia Interna · MOSFET HEXFET IRFZ44N (TO-220)",
    autopsiaSub: "Corte Booleano Blender 5.0 · Compuerta Aislada SiO2 y Cinta de 49 A",
    capaOxido: "Compuerta Aislada SiO2 (I_G = 0 A en DC · C_iss = 1470 pF)",
    capaCanal: "Región P-Body (Canal N inducido con V_GS = 10 V)",
    capaDrenador: "Sustrato Drenador N⁺ sobre Aleta Metálica (R_DS(on) = 17.5 mΩ)",
    capaFuente: "Celdas HEXFET de Fuente + Cinta de Aluminio (49 A máx)",
    pinG: "G (Compuerta)",
    pinD: "D (Drenador)",
    pinS: "S (Fuente)",
    ciss: "C_iss = 1470 pF (Q_g = 63 nC)",
    rg: "R_G = 22 Ω (Carga rápida) · R_PD = 10 kΩ (Pull-Down)",
    vgs: "V_GS = 10 V → R_DS(on) = 17.5 mΩ (Canal 100% abierto)",
    termicoTitulo: "Comparativa Térmica Real a I_Carga = 10 A (BJT vs. MOSFET)",
    regBjt: "1. BJT DE POTENCIA (TIP31C / Darlington a 10 A)",
    regBjtDesc: "V_CE(sat) ≈ 1.2 V → P_D = 1.2 V × 10 A = 12.0 W (Exige gran disipador)",
    regMosfet: "2. MOSFET IRFZ44N EN REGIÓN ÓHMICA (V_GS = 10 V)",
    regMosfetDesc: "R_DS(on) = 17.5 mΩ → P_D = I²·R = 100 × 0.0175 = 1.75 W (85% menos calor)",
    regTrampa: "3. EL ERROR DE USAR V_GS = 3.3 V EN UN IRFZ44N ESTÁNDAR",
    regTrampaDesc: "A 3.3 V queda semi-abierto en zona lineal y se funde · Usa IRLZ44N (Logic-Level)",
    bjtCard: "BJT (Control por Corriente)",
    mosfetCard: "MOSFET (Control por Voltaje)",
    chip: "Encapsulados de Potencia en KiCad 9.0: TO-220, DPAK, D2PAK y Disipador",
    pkgTo220: "TO-220 (IRFZ44N) · 49 A / 94 W",
    pkgDpak: "DPAK / TO-252 (IRLR2905) · SMD Potencia",
    pkgHeatsink: "Disipador Aluminio HS-132 · TO-220",
  },
  en: {
    titulo: "The MOSFET",
    subtitulo: "Infineon IRFZ44N Datasheet · Electric Field, R_DS(on) & Efficiency",
    autopsiaTitulo: "Internal Autopsy · IRFZ44N HEXFET MOSFET (TO-220)",
    autopsiaSub: "Blender 5.0 Boolean Cutaway · Isolated SiO2 Gate & 49 A Bond Ribbon",
    capaOxido: "Isolated SiO2 Gate (I_G = 0 A DC · C_iss = 1470 pF)",
    capaCanal: "P-Body Region (N-Channel induced at V_GS = 10 V)",
    capaDrenador: "N⁺ Drain Substrate on Metal Tab (R_DS(on) = 17.5 mΩ)",
    capaFuente: "HEXFET Source Cells + Heavy Aluminum Ribbon (49 A max)",
    pinG: "G (Gate)",
    pinD: "D (Drain)",
    pinS: "S (Source)",
    ciss: "C_iss = 1470 pF (Q_g = 63 nC)",
    rg: "R_G = 22 Ω (Fast drive) · R_PD = 10 kΩ (Pull-Down)",
    vgs: "V_GS = 10 V → R_DS(on) = 17.5 mΩ (Fully enhanced)",
    termicoTitulo: "Real Thermal Comparison at I_Load = 10 A (BJT vs. MOSFET)",
    regBjt: "1. POWER BJT (TIP31C / Darlington at 10 A)",
    regBjtDesc: "V_CE(sat) ≈ 1.2 V → P_D = 1.2 V × 10 A = 12.0 W (Heavy heat loss)",
    regMosfet: "2. IRFZ44N MOSFET IN OHMIC REGION (V_GS = 10 V)",
    regMosfetDesc: "R_DS(on) = 17.5 mΩ → P_D = I²·R = 100 × 0.0175 = 1.75 W (85% less heat)",
    regTrampa: "3. THE 3.3 V GATE TRAP ON A STANDARD IRFZ44N",
    regTrampaDesc: "At 3.3 V it stays half-open in linear mode & overheats · Use IRLZ44N (Logic-Level)",
    bjtCard: "BJT (Current-Driven)",
    mosfetCard: "MOSFET (Voltage-Driven)",
    chip: "Real KiCad 9.0 Power Packages: TO-220, DPAK, D2PAK & Heatsink",
    pkgTo220: "TO-220 (IRFZ44N) · 49 A / 94 W",
    pkgDpak: "DPAK / TO-252 (IRLR2905) · SMD Power",
    pkgHeatsink: "Aluminum Heatsink HS-132 · TO-220",
  },
} satisfies Record<Idioma, Record<string, string>>;
