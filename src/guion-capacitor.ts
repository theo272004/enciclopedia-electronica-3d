// Fuente única del Episodio 04: Capacitores — Electrolítico, Cerámico (MLCC) y Tántalo
// Datasheets de referencia: Nichicon Serie UWT / UHD (100 µF 25 V, ESR, Rizado, Válvula K) + Murata MLCC (100 nF 50 V X7R 0805)

import type { EscenaId, Idioma } from "./guion";

export const DATASHEET_CAPACITOR = {
  modelo: "Nichicon 100 µF 25 V (Radial) + Murata 100 nF (MLCC)",
  ecuacion: "C = ε · (A / d) · I = C · (dV/dt)",
  dielectrico: "Óxido de Aluminio Al2O3 (Electrolito) / Cerámica X7R",
  esrTipica: "0.18 Ω @ 100 kHz (Electrolítico) vs. 0.01 Ω (MLCC)",
  limiteTemperatura: "105 °C (Válvula de alivio en K)",
  polaridad: "Polarizado (Ánodo + / Cátodo − con banda)",
} as const;

export const GUION_CAPACITOR: Record<Idioma, Record<EscenaId, string>> = {
  es: {
    intro:
      "Parece una pequeña batería, pero puede entregar toda su energía en microsegundos o explotar si inviertes sus patas. Es el capacitor, el componente que estabiliza cada fuente de poder y filtra el ruido de todos tus circuitos.",
    autopsia:
      "Si abrimos un capacitor electrolítico de 100 microfaradios, vemos dos láminas de aluminio enrolladas como un pergamino y separadas por papel impregnado en electrolito. El secreto está en su capa microscópica de óxido aislante: si conectas el voltaje al revés, una reacción química destruye ese óxido, hierve el electrolito y el gas revienta la válvula superior.",
    partes:
      "En el símbolo esquemático, la placa recta es el positivo y la curva o marcada es el negativo. Físicamente, el capacitor electrolítico indica el negativo con una franja clara y la pata más corta, mientras que los cerámicos no tienen polaridad.",
    circuito:
      "Mira por qué en las placas reales siempre ves un capacitor electrolítico grande junto a uno cerámico diminuto de 100 nanofaradios: el electrolítico actúa como un tanque que sostiene el voltaje ante caídas lentas, mientras que el cerámico de baja resistencia interna absorbe los picos rápidos de alta frecuencia junto al chip.",
    regiones:
      "En el osciloscopio vemos su efecto tras un rectificador: sin capacitor, el voltaje cae a cero cien veces por segundo; al conectar el capacitor, este se carga en las crestas y se descarga suavemente en los valles, reduciendo el rizado a una línea continua estable.",
    cierre:
      "Desde el electrolítico de aluminio para fuentes de poder y el cerámico multicapa MLCC para desacoplo digital, hasta el capacitor de tántalo de alta densidad: combinarlos correctamente es la base de toda electrónica estable.",
  },
  en: {
    intro:
      "It looks like a tiny battery, yet it can dump all its energy in microseconds—or explode if you wire it backwards. This is the capacitor, the component that stabilizes every power supply and filters noise across your circuits.",
    autopsia:
      "If we slice open a 100-microfarad electrolytic capacitor, we find two aluminum foils rolled up like a scroll and separated by electrolyte-soaked paper. Its secret is a microscopic aluminum-oxide insulating layer: reverse the polarity, and a chemical reaction destroys that oxide, boils the liquid electrolyte, and bursts the top safety vent.",
    partes:
      "On the schematic symbol, the straight plate is positive and the curved or marked plate is negative. Physically, an electrolytic capacitor marks its negative cathode with a bright stripe and a shorter lead, while ceramic capacitors are non-polarized.",
    circuito:
      "Look at why real PCBs always pair a large electrolytic capacitor with a tiny 100-nanofarad ceramic capacitor: the electrolytic acts as a bulk reservoir for slow voltage drops, while the ultra-low-ESR ceramic shunts high-frequency switching noise right at the chip pins.",
    regiones:
      "On the oscilloscope we see its effect after a rectifier: without a capacitor, voltage drops to zero a hundred times per second; with the capacitor connected, it charges at the peaks and supplies current during the valleys, smoothing ripple into clean DC.",
    cierre:
      "From aluminum electrolytics for bulk power filtering and multilayer ceramic MLCCs for high-speed decoupling, to dense tantalum capacitors: combining them properly is the foundation of stable electronics.",
  },
};

export const MARCAS_CAPACITOR = {
  es: {
    titulo: "capacitor",
    abrimos: "abrimos",
    aluminio: "aluminio",
    oxido: "oxido",
    valvula: "valvula",
    positivo: "positivo",
    negativo: "negativo",
    ceramico: "ceramico",
    tanque: "tanque",
    picos: "picos",
    rizado: "rizado",
    continua: "continua",
    electrolitico: "electrolitico",
    mlcc: "mlcc",
    tantalo: "tantalo",
  },
  en: {
    titulo: "capacitor",
    abrimos: "slice",
    aluminio: "aluminum",
    oxido: "oxide",
    valvula: "vent",
    positivo: "positive",
    negativo: "negative",
    ceramico: "ceramic",
    tanque: "reservoir",
    picos: "high-frequency",
    rizado: "ripple",
    continua: "clean",
    electrolitico: "electrolytics",
    mlcc: "mlccs",
    tantalo: "tantalum",
  },
} as const satisfies Record<Idioma, Record<string, string>>;

export const TEXTOS_CAPACITOR = {
  es: {
    titulo: "El capacitor",
    subtitulo: "Datasheet Nichicon & Murata · Campo Electrostático, ESR y Filtrado",
    autopsiaTitulo: "Autopsia Interna · Capacitor Electrolítico 100 µF 25 V",
    autopsiaSub: "Corte Booleano Blender 5.0 · Rollo de Aluminio, Óxido Al2O3 y Válvula K",
    capaAnodo: "Hoja de Ánodo de Aluminio Grabado (Mayor área superficial A)",
    capaOxido: "Dieléctrico Nanométrico Al2O3 (Define el voltaje máximo 25 V)",
    capaPapel: "Papel Separador con Electrolito Líquido (Cátodo real)",
    capaValvula: "Válvula Superior en K (Libera gas H2 si se invierte la polaridad)",
    pinPos: "Ánodo (+) · Pata Larga",
    pinNeg: "Cátodo (−) · Banda Lateral",
    pinNoPol: "Cerámico MLCC (Sin Polaridad)",
    cBulk: "C1 = 100 µF (Reserva de Energía Baja Frecuencia)",
    cDecouple: "C2 = 100 nF MLCC (Filtro de Ruido Alta Frecuencia · ESR ≈ 0.01 Ω)",
    formulaRizado: "V_rizado = I_Carga / (f · C)",
    oscTitulo: "Osciloscopio: Filtrado de Rizado y Desacoplo en Fuente DC",
    regSinCap: "1. SIN CAPACITOR DE FILTRO (Onda Pulsante)",
    regSinCapDesc: "El voltaje cae a 0 V en cada semiciclo · El microcontrolador se reinicia",
    regConElect: "2. CON CAPACITOR ELECTROLÍTICO (100 µF — Reserva)",
    regConElectDesc: "Se carga en las crestas y sostiene la tensión · Rizado V_pp = I / (f·C)",
    regConMlcc: "3. + CAPACITOR CERÁMICO MLCC (100 nF — Baja ESR)",
    regConMlccDesc: "Elimina el ruido de conmutación de MHz donde el electrolítico es inductivo",
    cardElectro: "Electrolítico (Reserva µF)",
    cardMlcc: "Cerámico MLCC (Velocidad nF)",
    chip: "Familia Real en KiCad 9.0: Electrolítico Radial, Cerámico 0805 y Tántalo SMD",
    pkgElect: "Radial 100 µF 25 V · 105 °C",
    pkgMlcc: "MLCC 0805 100 nF · X7R 50 V",
    pkgTantalo: "Tántalo SMD Case A · Baja Fuga",
  },
  en: {
    titulo: "The capacitor",
    subtitulo: "Nichicon & Murata Datasheet · Electrostatic Field, ESR & Filtering",
    autopsiaTitulo: "Internal Autopsy · 100 µF 25 V Electrolytic Capacitor",
    autopsiaSub: "Blender 5.0 Boolean Cutaway · Aluminum Foil Roll, Al2O3 & K-Vent",
    capaAnodo: "Etched Aluminum Anode Foil (Maximizes surface area A)",
    capaOxido: "Nanometric Al2O3 Dielectric (Sets the 25 V breakdown rating)",
    capaPapel: "Electrolyte-Soaked Kraft Paper (True liquid cathode)",
    capaValvula: "Top K-Vent Grooves (Releases H2 gas under reverse polarity)",
    pinPos: "Anode (+) · Long Lead",
    pinNeg: "Cathode (−) · Side Stripe",
    pinNoPol: "Ceramic MLCC (Non-Polarized)",
    cBulk: "C1 = 100 µF (Bulk Low-Frequency Energy Reservoir)",
    cDecouple: "C2 = 100 nF MLCC (High-Frequency Noise Bypass · ESR ≈ 0.01 Ω)",
    formulaRizado: "V_ripple = I_Load / (f · C)",
    oscTitulo: "Oscilloscope: Ripple Smoothing & Decoupling on DC Rail",
    regSinCap: "1. WITHOUT FILTER CAPACITOR (Pulsating DC)",
    regSinCapDesc: "Voltage drops to 0 V every half-cycle · Resets digital logic",
    regConElect: "2. WITH ELECTROLYTIC CAPACITOR (100 µF — Bulk)",
    regConElectDesc: "Charges at peaks and bridges valleys · Ripple V_pp = I / (f·C)",
    regConMlcc: "3. + CERAMIC MLCC BYPASS (100 nF — Low ESR)",
    regConMlccDesc: "Shunts MHz switching spikes where electrolytics become inductive",
    cardElectro: "Electrolytic (Bulk µF)",
    cardMlcc: "Ceramic MLCC (Fast nF)",
    chip: "Real KiCad 9.0 Capacitor Family: Radial Electrolytic, 0805 MLCC & Tantalum",
    pkgElect: "Radial 100 µF 25 V · 105 °C",
    pkgMlcc: "MLCC 0805 100 nF · X7R 50 V",
    pkgTantalo: "Tantalum SMD Case A · Low Leakage",
  },
} satisfies Record<Idioma, Record<string, string>>;
