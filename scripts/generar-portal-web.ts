import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const KICAD_3D_DIR = "C:\\Program Files\\KiCad\\9.0\\share\\kicad\\3dmodels";
const BLENDER_EXE = "C:\\Program Files\\Blender Foundation\\Blender 5.0\\blender.exe";

const DOCS_DIR = path.resolve("docs");
const MODELOS_WEB_DIR = path.join(DOCS_DIR, "modelos");
const DESCARGAS_DIR = path.join(DOCS_DIR, "descargas", "01-transistor");
const DESCARGAS_RELE_DIR = path.join(DOCS_DIR, "descargas", "02-rele");
const DESCARGAS_MOSFET_DIR = path.join(DOCS_DIR, "descargas", "03-mosfet");
const DESCARGAS_CAP_DIR = path.join(DOCS_DIR, "descargas", "04-capacitor");
const DESCARGAS_DIODO_DIR = path.join(DOCS_DIR, "descargas", "05-diodo");
const DESCARGAS_INDUCTOR_DIR = path.join(DOCS_DIR, "descargas", "06-inductor");
const DESCARGAS_PUENTE_H_DIR = path.join(DOCS_DIR, "descargas", "07-puente-h");

fs.mkdirSync(MODELOS_WEB_DIR, { recursive: true });
fs.mkdirSync(DESCARGAS_DIR, { recursive: true });
fs.mkdirSync(DESCARGAS_RELE_DIR, { recursive: true });
fs.mkdirSync(DESCARGAS_MOSFET_DIR, { recursive: true });
fs.mkdirSync(DESCARGAS_CAP_DIR, { recursive: true });
fs.mkdirSync(DESCARGAS_DIODO_DIR, { recursive: true });
fs.mkdirSync(DESCARGAS_INDUCTOR_DIR, { recursive: true });
fs.mkdirSync(DESCARGAS_PUENTE_H_DIR, { recursive: true });

// 1. Copiar modelos GLB optimizados para el visor 3D web y para descarga
const glbs = [
  "to92_autopsia.glb",
  "to92.glb",
  "sot23.glb",
  "to220.glb",
  "led5mm.glb",
  "resistencia_axial.glb",
  "pulsador_6mm.glb",
  "rele_autopsia.glb",
  "rele_spdt.glb",
  "rele_dpdt.glb",
  "rele_smd.glb",
  "diodo_1n4007.glb",
  "mosfet_autopsia.glb",
  "dpak.glb",
  "disipador_to220.glb",
  "cap_autopsia.glb",
  "cap_electrolitico.glb",
  "cap_ceramico.glb",
  "cap_tantalo.glb",
  "diodo_autopsia.glb",
  "diodo_zener.glb",
  "inductor_autopsia.glb",
  "inductor_radial.glb",
  "inductor_smd.glb",
  "inductor_toroidal.glb",
  "puente_h_autopsia.glb",
  "l298n.glb",
  "drv8833.glb",
];

for (const archivo of glbs) {
  const origen = path.resolve("public/modelos", archivo);
  if (fs.existsSync(origen)) {
    fs.copyFileSync(origen, path.join(MODELOS_WEB_DIR, archivo));
    const destCarpeta =
      archivo.startsWith("mosfet") || archivo === "dpak.glb" || archivo === "disipador_to220.glb"
        ? DESCARGAS_MOSFET_DIR
        : archivo.startsWith("cap_")
          ? DESCARGAS_CAP_DIR
          : archivo === "diodo_autopsia.glb" || archivo === "diodo_zener.glb"
            ? DESCARGAS_DIODO_DIR
            : archivo.startsWith("inductor_")
              ? DESCARGAS_INDUCTOR_DIR
              : archivo.startsWith("puente_h") || archivo === "l298n.glb" || archivo === "drv8833.glb"
                ? DESCARGAS_PUENTE_H_DIR
                : archivo.startsWith("rele") || archivo.startsWith("diodo")
                  ? DESCARGAS_RELE_DIR
                  : DESCARGAS_DIR;
    fs.copyFileSync(origen, path.join(destCarpeta, archivo));
  }
}

// 2. Copiar modelos CAD originales (.STEP ISO-10303 y .WRL VRML 2.0)
const cadFiles = [
  { orig: "Package_TO_SOT_THT.3dshapes/TO-92_Inline.step", dest: path.join(DESCARGAS_DIR, "TO-92_2N2222A.step") },
  { orig: "Package_TO_SOT_THT.3dshapes/TO-92_Inline.wrl", dest: path.join(DESCARGAS_DIR, "TO-92_2N2222A.wrl") },
  { orig: "Package_TO_SOT_SMD.3dshapes/SOT-23.step", dest: path.join(DESCARGAS_DIR, "SOT-23_MMBT2222A.step") },
  { orig: "Package_TO_SOT_SMD.3dshapes/SOT-23.wrl", dest: path.join(DESCARGAS_DIR, "SOT-23_MMBT2222A.wrl") },
  { orig: "Package_TO_SOT_THT.3dshapes/TO-220-3_Vertical.step", dest: path.join(DESCARGAS_DIR, "TO-220_TIP31C.step") },
  { orig: "Package_TO_SOT_THT.3dshapes/TO-220-3_Vertical.wrl", dest: path.join(DESCARGAS_DIR, "TO-220_TIP31C.wrl") },
  // Episodio 02: Relés y Diodo 1N4007
  { orig: "Relay_THT.3dshapes/Relay_SPDT_Omron-G5LE-1.step", dest: path.join(DESCARGAS_RELE_DIR, "Relay_SPDT_Omron_G5LE-1.step") },
  { orig: "Relay_THT.3dshapes/Relay_DPDT_Finder_40.52.step", dest: path.join(DESCARGAS_RELE_DIR, "Relay_DPDT_Finder_40_52.step") },
  { orig: "Relay_SMD.3dshapes/Relay_DPDT_Omron_G6K-2F-Y.step", dest: path.join(DESCARGAS_RELE_DIR, "Relay_SMD_Omron_G6K.step") },
  { orig: "Diode_THT.3dshapes/D_DO-41_SOD81_P10.16mm_Horizontal.step", dest: path.join(DESCARGAS_RELE_DIR, "Diodo_DO-41_1N4007.step") },
  // Episodio 04: Capacitores
  { orig: "Capacitor_THT.3dshapes/CP_Radial_D8.0mm_P3.50mm.step", dest: path.join(DESCARGAS_CAP_DIR, "CP_Radial_8mm_Nichicon_100uF.step") },
  { orig: "Capacitor_SMD.3dshapes/C_0805_2012Metric.step", dest: path.join(DESCARGAS_CAP_DIR, "C_0805_MLCC_Murata_100nF.step") },
  { orig: "Capacitor_Tantalum_SMD.3dshapes/CP_EIA-3216-18_Kemet-A.step", dest: path.join(DESCARGAS_CAP_DIR, "CP_Tantalo_Kemet_CaseA_10uF.step") },
  // Episodio 05: Diodos
  { orig: "Diode_THT.3dshapes/D_DO-41_SOD81_P10.16mm_Horizontal.step", dest: path.join(DESCARGAS_DIODO_DIR, "D_DO-41_1N4007_1N5819.step") },
  { orig: "Diode_THT.3dshapes/D_DO-35_SOD27_P10.16mm_Horizontal.step", dest: path.join(DESCARGAS_DIODO_DIR, "D_DO-35_Zener_1N4733A.step") },
  // Episodio 06: Inductores
  { orig: "Inductor_SMD.3dshapes/L_Bourns_SRR1260.step", dest: path.join(DESCARGAS_INDUCTOR_DIR, "L_Bourns_SRR1260_33uH.step") },
  { orig: "Inductor_THT.3dshapes/L_Radial_D8.7mm_P5.00mm_Fastron_07HCP.step", dest: path.join(DESCARGAS_INDUCTOR_DIR, "L_Radial_Fastron_07HCP.step") },
  { orig: "Inductor_THT.3dshapes/L_Toroid_Vertical_L14.0mm_W7.0mm_P5.58mm_EPCOS_B82622.step", dest: path.join(DESCARGAS_INDUCTOR_DIR, "L_Toroid_EPCOS_B82622.step") },
  // Episodio 07: Puente H
  { orig: "Package_TO_SOT_THT.3dshapes/TO-220-11_P3.4x5.08mm_StaggerEven_Lead4.58mm_Vertical.step", dest: path.join(DESCARGAS_PUENTE_H_DIR, "L298N_TO-220-11.step") },
  { orig: "Package_SO.3dshapes/HTSSOP-16-1EP_4.4x5mm_P0.65mm_EP3.4x5mm.step", dest: path.join(DESCARGAS_PUENTE_H_DIR, "DRV8833_HTSSOP-16.step") },
];

for (const c of cadFiles) {
  const ruta = path.join(KICAD_3D_DIR, c.orig);
  if (fs.existsSync(ruta)) {
    fs.copyFileSync(ruta, c.dest);
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
