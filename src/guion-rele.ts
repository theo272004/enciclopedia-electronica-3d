// Fuente única del Episodio 02: El Relé Electromecánico vs. SSR (+ Diodo Flyback 1N4007)
// Datasheets de referencia: Omron G5LE-1 (SPDT 10A 250VAC, bobina 5VDC 70Ω) + Vishay 1N4007 (DO-41 1000V 1A)

import type { EscenaId, Idioma } from "./guion";

export const DATASHEET_G5LE = {
  modelo: "Omron G5LE-1 (SPDT)",
  bobina: "5 VDC · 70 Ω · 71.4 mA",
  potenciaBobina: "360 mW",
  contactos: "AgSnO2 · 10 A @ 250 VAC",
  aislamiento: "2,000 VAC (Bobina ↔ Contactos)",
  tiempoOperacion: "10 ms máx (Liberación: 5 ms)",
  diodoFlyback: "1N4007 (DO-41 · 1000 V, 1 A)",
} as const;

export const GUION_RELE: Record<Idioma, Record<EscenaId, string>> = {
  es: {
    intro:
      "¿Cómo puede un microcontrolador de apenas 5 voltios encender un motor o una lámpara de 220 voltios sin quemarse? El secreto detrás de ese clic mecánico es el relé electromecánico.",
    autopsia:
      "Si abrimos un relé Omron G5LE, vemos su ingeniería interna: una bobina de cobre enrollada sobre un núcleo de hierro dulce, un yugo magnético y una armadura móvil. Al energizar la bobina, el campo magnético atrae la armadura en menos de 10 milisegundos, moviendo el contacto común del pin normalmente cerrado al normalmente abierto con 2,000 voltios de aislamiento.",
    partes:
      "Un relé SPDT tiene cinco patas: dos para alimentar la bobina y tres de potencia: Común, Normalmente Cerrado y Normalmente Abierto. Como su bobina de 70 ohmios exige 71 miliamperios, un pin de Arduino no puede moverla solo: necesita un transistor impulsor.",
    circuito:
      "Pero aquí ocurre el error que destruye miles de circuitos. Cuando el transistor apaga la bobina, el campo magnético colapsa y genera un latigazo inverso de más de 300 voltios. Al colocar un diodo flyback 1N4007 en antiparalelo, atrapamos ese pico y la corriente recircula sin dañar el transistor.",
    regiones:
      "Mira la diferencia en el osciloscopio al cortar la corriente: sin diodo flyback, el pico inductivo supera los 300 voltios y perfora el colector; con el diodo 1N4007, el voltaje queda frenado en apenas 5.7 voltios mientras los contactos superan su rebote mecánico inicial.",
    cierre:
      "Desde el clásico relé SPDT para tarjetas de control y el DPDT industrial de doble polo, hasta los relés de estado sólido con optoacoplador para conmutación silenciosa: elegir el relé correcto protege tu lógica y domina la potencia.",
  },
  en: {
    intro:
      "How can a tiny 5-volt microcontroller switch a 220-volt motor or lamp without frying itself? The secret behind that iconic mechanical click is the electromechanical relay.",
    autopsia:
      "If we slice open an Omron G5LE relay, we see its internal mechanism: a copper coil wound around a soft iron core, a magnetic yoke, and a movable armature. When the coil is energized, the magnetic field pulls the armature in under 10 milliseconds, flipping the common contact from normally closed to normally open with 2,000 volts of isolation.",
    partes:
      "An SPDT relay has five pins: two for the coil and three for the load: Common, Normally Closed, and Normally Open. Because its 70-ohm coil demands 71 milliamps, a microcontroller pin cannot drive it directly—it requires a driver transistor.",
    circuito:
      "And here lies the trap that destroys thousands of circuits. When the transistor turns the coil off, the collapsing magnetic field unleashes a reverse voltage spike of over 300 volts. By placing a 1N4007 flyback diode in antiparallel across the coil, we trap that spike and let the current safely recirculate.",
    regiones:
      "Look at the oscilloscope at turn-off: without a flyback diode, the inductive kickback exceeds 300 volts and punctures the transistor; with the 1N4007 diode, the collector voltage is safely clamped to just 5.7 volts while the contacts settle after mechanical bounce.",
    cierre:
      "From the classic SPDT relay and industrial double-pole DPDT relays, to silent Solid State Relays using optocouplers: choosing the right relay and flyback protection lets low-voltage logic safely command high power.",
  },
};

export const MARCAS_RELE = {
  es: {
    titulo: "rele",
    abrimos: "abrimos",
    bobina: "bobina",
    armadura: "armadura",
    contactos: "contacto",
    cinco: "cinco",
    comun: "comun",
    cerrado: "cerrado",
    abierto: "abierto",
    apaga: "apaga",
    diodo: "diodo",
    pico: "300",
    frenado: "5.7",
    spdt: "spdt",
    dpdt: "dpdt",
    ssr: "solido",
  },
  en: {
    titulo: "relay",
    abrimos: "slice",
    bobina: "coil",
    armadura: "armature",
    contactos: "contact",
    cinco: "five",
    comun: "common",
    cerrado: "closed",
    abierto: "open",
    apaga: "turns",
    diodo: "diode",
    pico: "300",
    frenado: "5.7",
    spdt: "spdt",
    dpdt: "dpdt",
    ssr: "solid",
  },
} as const satisfies Record<Idioma, Record<string, string>>;

export const TEXTOS_RELE = {
  es: {
    titulo: "El relé",
    subtitulo: "Datasheet Omron G5LE-1 · Aislamiento Galvánico y Diodo Flyback",
    autopsiaTitulo: "Autopsia Interna · Relé SPDT Omron G5LE-1",
    autopsiaSub: "Corte Booleano Blender 5.0 · Circuito Magnético y Contactos AgSnO2",
    capaBobina: "Bobina de Cobre (5 VDC · 70 Ω · 71.4 mA)",
    capaNucleo: "Núcleo de Hierro Dulce + Yugo Magnético en L",
    capaArmadura: "Armadura Móvil (Tiempo de cierre < 10 ms)",
    capaContactos: "Contactos AgSnO2 (COM → NC / NO · 10 A 250 VAC)",
    pinBobina: "A1 / A2 (Bobina)",
    pinCom: "COM (Común)",
    pinNc: "NC (Normal Cerrado)",
    pinNo: "NO (Normal Abierto)",
    icBobina: "I_Bobina = 71.4 mA (5V / 70Ω)",
    picoSinDiodo: "Sin Diodo: Pico V_L = −320 V (Destruye Q1)",
    clampConDiodo: "Con Diodo 1N4007: Clamping a +5.7 V (Seguro)",
    oscTitulo: "Osciloscopio en Colector V_CE(t) al Apagar la Bobina",
    regSin: "1. SIN DIODO FLYBACK (Fallo por Avalancha)",
    regSinDesc: "V = −L·(di/dt) genera > 300 V · Supera V_CEO = 40 V del 2N2222A",
    regCon: "2. CON DIODO 1N4007 EN ANTIPARALELO",
    regConDesc: "El diodo conduce en directa (0.7 V) · V_CE(máx) = 5.0 V + 0.7 V = 5.7 V",
    regBounce: "3. REBOTE MECÁNICO DE CONTACTOS (Bounce)",
    regBounceDesc: "Cierre en ≤ 10 ms · Oscilación de 2–4 ms al chocar las láminas AgSnO2",
    emec: "Electromecánico",
    ssr: "Estado Sólido (SSR)",
    chip: "Variaciones Reales en KiCad 9.0: Potencia, Industrial y SMD",
    pkgSpdt: "SPDT Omron G5LE-1 · 10 A 250 VAC",
    pkgDpdt: "DPDT Finder 40.52 · 2 Polos 8 A",
    pkgSmd: "SMD Omron G6K-2F · Telecom 1 A",
  },
  en: {
    titulo: "The relay",
    subtitulo: "Omron G5LE-1 Datasheet · Galvanic Isolation & Flyback Diode",
    autopsiaTitulo: "Internal Autopsy · Omron G5LE-1 SPDT Relay",
    autopsiaSub: "Blender 5.0 Boolean Cutaway · Magnetic Loop & AgSnO2 Contacts",
    capaBobina: "Copper Coil (5 VDC · 70 Ω · 71.4 mA)",
    capaNucleo: "Soft Iron Core + L-Shaped Magnetic Yoke",
    capaArmadura: "Movable Armature (Operate time < 10 ms)",
    capaContactos: "AgSnO2 Contacts (COM → NC / NO · 10 A 250 VAC)",
    pinBobina: "A1 / A2 (Coil)",
    pinCom: "COM (Common)",
    pinNc: "NC (Normally Closed)",
    pinNo: "NO (Normally Open)",
    icBobina: "I_Coil = 71.4 mA (5V / 70Ω)",
    picoSinDiodo: "No Diode: Spike V_L = −320 V (Destroys Q1)",
    clampConDiodo: "With 1N4007 Diode: Clamped at +5.7 V (Safe)",
    oscTitulo: "Collector Oscilloscope Trace V_CE(t) at Coil Turn-Off",
    regSin: "1. WITHOUT FLYBACK DIODE (Avalanche Failure)",
    regSinDesc: "V = −L·(di/dt) spikes > 300 V · Exceeds 2N2222A V_CEO = 40 V",
    regCon: "2. WITH ANTIPARALLEL 1N4007 FLYBACK DIODE",
    regConDesc: "Diode conducts forward (0.7 V) · V_CE(max) = 5.0 V + 0.7 V = 5.7 V",
    regBounce: "3. MECHANICAL CONTACT BOUNCE",
    regBounceDesc: "Operates in ≤ 10 ms · 2–4 ms contact chatter on AgSnO2 pads",
    emec: "Electromechanical",
    ssr: "Solid State (SSR)",
    chip: "Real KiCad 9.0 Relay Variations: Power, Industrial & SMD",
    pkgSpdt: "SPDT Omron G5LE-1 · 10 A 250 VAC",
    pkgDpdt: "DPDT Finder 40.52 · Dual Pole 8 A",
    pkgSmd: "SMD Omron G6K-2F · Signal 1 A",
  },
} satisfies Record<Idioma, Record<string, string>>;
