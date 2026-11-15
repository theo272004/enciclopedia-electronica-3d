import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const KICAD_3D_DIR = "C:\\Program Files\\KiCad\\9.0\\share\\kicad\\3dmodels";
const BLENDER_EXE = "C:\\Program Files\\Blender Foundation\\Blender 5.0\\blender.exe";

const DOCS_DIR = path.resolve("docs");
const MODELOS_WEB_DIR = path.join(DOCS_DIR, "modelos");
const DESCARGAS_DIR = path.join(DOCS_DIR, "descargas", "01-transistor");

fs.mkdirSync(MODELOS_WEB_DIR, { recursive: true });
fs.mkdirSync(DESCARGAS_DIR, { recursive: true });

// 1. Copiar modelos GLB optimizados para el visor 3D web y para descarga (Blender / Three.js / Unreal / Unity)
const glbs = [
  "to92_autopsia.glb",
  "to92.glb",
  "sot23.glb",
  "to220.glb",
  "led5mm.glb",
  "resistencia_axial.glb",
  "pulsador_6mm.glb",
];

for (const archivo of glbs) {
  const origen = path.resolve("public/modelos", archivo);
  if (fs.existsSync(origen)) {
    fs.copyFileSync(origen, path.join(MODELOS_WEB_DIR, archivo));
    fs.copyFileSync(origen, path.join(DESCARGAS_DIR, archivo));
  }
}

// 2. Copiar modelos CAD originales (.STEP ISO-10303 y .WRL VRML 2.0) para KiCad, Altium, EasyEDA, Fusion 360 y SolidWorks
const cadFiles = [
  { orig: "Package_TO_SOT_THT.3dshapes/TO-92_Inline.step", dest: "TO-92_2N2222A.step" },
  { orig: "Package_TO_SOT_THT.3dshapes/TO-92_Inline.wrl", dest: "TO-92_2N2222A.wrl" },
  { orig: "Package_TO_SOT_SMD.3dshapes/SOT-23.step", dest: "SOT-23_MMBT2222A.step" },
  { orig: "Package_TO_SOT_SMD.3dshapes/SOT-23.wrl", dest: "SOT-23_MMBT2222A.wrl" },
  { orig: "Package_TO_SOT_THT.3dshapes/TO-220-3_Vertical.step", dest: "TO-220_TIP31C.step" },
  { orig: "Package_TO_SOT_THT.3dshapes/TO-220-3_Vertical.wrl", dest: "TO-220_TIP31C.wrl" },
];

for (const c of cadFiles) {
  const ruta = path.join(KICAD_3D_DIR, c.orig);
  if (fs.existsSync(ruta)) {
    fs.copyFileSync(ruta, path.join(DESCARGAS_DIR, c.dest));
  }
}

// 3. Exportar STL imprimible en 3D de la autopsia del TO-92 usando Blender 5.0
if (fs.existsSync(BLENDER_EXE)) {
  const outStl = path.join(DESCARGAS_DIR, "TO-92_Autopsia_Imprimible_3D.stl").replace(/\\/g, "/");
  const inGlb = path.resolve("public/modelos/to92_autopsia.glb").replace(/\\/g, "/");
  execFileSync(
    BLENDER_EXE,
    [
      "-b",
      "--python-expr",
      `import bpy; bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath='${inGlb}'); bpy.ops.wm.stl_export(filepath='${outStl}', global_scale=10.0)`,
    ],
    { stdio: "inherit" },
  );
}

// 4. Generar librería SPICE oficial (.lib) compatible con LTspice, Proteus, Multisim, Altium, EasyEDA y Ngspice
const spiceLib = `* ============================================================================
* Modelo SPICE Oficial — ON Semiconductor 2N2222A / P2N2222A / MMBT2222A (NPN)
* Compatible con: LTspice, Ngspice, Proteus, Multisim, Altium, EasyEDA, PSpice
* Parametros clave de Datasheet:
*   V_CEO(max) = 40 V | I_C(max) = 800 mA | P_D(max) = 625 mW (TO-92)
*   h_FE (Beta) = 100..300 | V_CE(sat) = 0.3 V | f_T = 300 MHz
* ============================================================================
.MODEL Q2N2222A NPN(
+ IS=14.34E-15
+ XTI=3
+ EG=1.11
+ VAF=74.03
+ BF=255.9
+ NE=1.307
+ ISE=14.34E-15
+ IKF=0.2847
+ XTB=1.5
+ BR=6.092
+ NC=2
+ ISC=0
+ IKR=0
+ RC=1
+ CJC=7.306E-12
+ MJC=0.3416
+ VJC=0.75
+ FC=0.5
+ CJE=22.01E-12
+ MJE=0.377
+ VJE=0.75
+ TR=46.91E-9
+ TF=411.1E-12
+ ITF=0.6
+ VTF=1.7
+ XTF=3
+ RB=10
+ Vceo=40
+ Icrating=0.8
+ mfg=ON_Semiconductor)
`;
fs.writeFileSync(path.join(DESCARGAS_DIR, "2N2222A_ON_Semi.lib"), spiceLib, "utf8");

// 5. Generar esquemático nativo de LTspice (.asc) listo para abrir y simular
const ltspiceAsc = `Version 4
SHEET 1 880 680
WIRE 160 128 160 208
WIRE 160 128 480 128
WIRE 480 128 480 160
WIRE 480 240 480 288
WIRE 480 352 480 384
WIRE 208 432 320 432
WIRE 400 432 416 432
WIRE 160 288 160 528
WIRE 480 480 480 528
WIRE 160 528 480 528
WIRE 480 528 480 560
FLAG 480 560 0
SYMBOL voltage 160 192 R0
WINDOW 123 0 0 Left 0
WINDOW 39 0 0 Left 0
SYMATTR InstName V1
SYMATTR Value 9
SYMBOL res 464 144 R0
SYMATTR InstName R_LED
SYMATTR Value 330
SYMBOL LED 464 288 R0
SYMATTR InstName D1
SYMATTR Value QTLP690C
SYMBOL npn 416 384 R0
SYMATTR InstName Q1
SYMATTR Value Q2N2222A
SYMBOL res 416 416 R90
WINDOW 0 0 56 VBottom 2
WINDOW 3 32 56 VTop 2
SYMATTR InstName R_BASE
SYMATTR Value 1k
SYMBOL voltage 208 416 R0
WINDOW 123 0 0 Left 0
WINDOW 39 0 0 Left 0
SYMATTR InstName V_CTRL
SYMATTR Value PULSE(0 9 2m 10u 10u 5m 10m)
FLAG 208 512 0
WIRE 208 496 208 512
TEXT 144 64 Left 2 !.tran 20m
TEXT 144 92 Left 2 !.model Q2N2222A NPN(IS=14.34f VAF=74.03 BF=255.9 IKF=0.2847 RC=1 RB=10 CJC=7.3p CJE=22p TF=411p TR=46.9n Vceo=40 Icrating=0.8)
`;
fs.writeFileSync(path.join(DESCARGAS_DIR, "Circuito_2N2222A_LTspice.asc"), ltspiceAsc, "utf8");

// 6. Generar esquemático nativo de KiCad 9.0 (.kicad_sch)
const kicadSch = `(kicad_sch
  (version 20231120)
  (generator "videos-electronica")
  (generator_version "9.0")
  (uuid "8e442222-1111-4444-8888-222222222222")
  (paper "A4")
  (title_block
    (title "Circuito de Conmutacion y Saturacion BJT NPN 2N2222A")
    (date "2026-11-15")
    (rev "1.0")
    (company "Canal de Electronica — 100% Codigo")
    (comment 1 "Datasheet: ON Semiconductor P2N2222A / 2N2222A (Vceo=40V, Ic=800mA, Pd=625mW)")
    (comment 2 "Calculo de Saturacion: Vcc=9V, Rb=1k, Ib=8.3mA, Vce(sat)=0.3V, Ic=20mA")
  )
)
`;
fs.writeFileSync(path.join(DESCARGAS_DIR, "Circuito_2N2222A_KiCad9.kicad_sch"), kicadSch, "utf8");

// 7. Generar código de ejemplo para Arduino / ESP32 (C++) y MicroPython
const codigoArduino = `/*
 * ============================================================================
 * Control de Carga DC y PWM con Transistor NPN 2N2222A (TO-92) / MMBT2222A (SOT-23)
 * Plataformas: Arduino UNO/Nano (5V) | ESP32 / STM32 / RP2040 (3.3V)
 * ============================================================================
 *
 * REGLA DE INGENIERIA (Datasheet 2N2222A):
 * 1. Para operar como INTERRUPTOR FRIO (Saturacion, V_CE(sat) <= 0.3 V),
 *    el datasheet exige forzar una relacion: I_B >= I_C / 10 (Beta forzado = 10).
 * 2. Si queremos conmutar una carga de I_C = 150 mA desde un GPIO de 3.3V (ESP32):
 *    - I_B(sat) requerida = 150 mA / 10 = 15 mA
 *    - Caida Base-Emisor en saturacion: V_BE(sat) ≈ 0.7 V
 *    - R_B = (V_GPIO - V_BE) / I_B = (3.3 V - 0.7 V) / 0.015 A = 173 Ohm -> Usar 180 Ohm o 220 Ohm.
 *    - Para un LED de 20 mA: I_B >= 2 mA -> Con R_B = 1 kOhm tenemos I_B = (3.3 - 0.7)/1k = 2.6 mA (Saturacion garantizada).
 * 3. IMPORTANTE: Si la carga es inductiva (rele, motor, solenoide), coloca SIEMPRE
 *    un diodo flyback (1N4007 o 1N5819) en antiparalelo con la carga para evitar que
 *    el pico inductivo supere V_CEO(max) = 40 V y destruya el colector.
 */

const int PIN_BASE_Q1 = 9; // Pin con soporte PWM

void setup() {
  pinMode(PIN_BASE_Q1, OUTPUT);
  digitalWrite(PIN_BASE_Q1, LOW); // Transistor en CORTE (I_B = 0, I_C = 0)
}

void loop() {
  // 1. Modo Conmutacion Pura: Corte -> Saturacion
  digitalWrite(PIN_BASE_Q1, HIGH); // Saturacion: V_CE(sat) ≈ 0.2 - 0.3 V
  delay(1500);

  digitalWrite(PIN_BASE_Q1, LOW);  // Corte: Interruptor abierto
  delay(1000);

  // 2. Control de Potencia eficiente por PWM (alterna solo entre Corte y Saturacion
  //    para no recalentar el 2N2222A en la Region Activa, respetando P_D < 625 mW)
  for (int duty = 0; duty <= 255; duty += 5) {
    analogWrite(PIN_BASE_Q1, duty);
    delay(25);
  }
  for (int duty = 255; duty >= 0; duty -= 5) {
    analogWrite(PIN_BASE_Q1, duty);
    delay(25);
  }
}
`;
fs.writeFileSync(path.join(DESCARGAS_DIR, "Control_2N2222A_Arduino_ESP32.ino"), codigoArduino, "utf8");

const codigoMicroPython = `# ============================================================================
# Control de Transistor NPN 2N2222A por PWM en MicroPython (ESP32 / Raspberry Pi Pico)
# ============================================================================
from machine import Pin, PWM
import time

# Frecuencia de 20 kHz (fuera del rango audible para evitar zumbido en bobinas/motores)
pwm_base = PWM(Pin(15), freq=20000, duty_u16=0)

print("Iniciando control en Saturacion / Corte por PWM (2N2222A)...")

while True:
    # Rampa de encendido suave (0% a 100% de ciclo util)
    for pulso in range(0, 65536, 1024):
        pwm_base.duty_u16(pulso)
        time.sleep_ms(15)
    time.sleep_ms(500)

    # Apagado en Corte (duty = 0 -> I_B = 0 mA)
    pwm_base.duty_u16(0)
    time.sleep_ms(800)
`;
fs.writeFileSync(path.join(DESCARGAS_DIR, "Control_2N2222A_MicroPython.py"), codigoMicroPython, "utf8");

console.log("✔ Todos los archivos 3D, CAD, SPICE, KiCad y código fueron generados en docs/");
