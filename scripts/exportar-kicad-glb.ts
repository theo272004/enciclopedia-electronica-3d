import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const KICAD_CLI = "C:\\Program Files\\KiCad\\9.0\\bin\\kicad-cli.exe";
const KICAD_3D_DIR = "C:\\Program Files\\KiCad\\9.0\\share\\kicad\\3dmodels";
const OUT_DIR = path.resolve("public/modelos/raw");

export type ModeloKiCad = {
  id: string;
  rutaRelativa: string; // relativa a KICAD_3D_DIR
  descripcion: string;
};

// Catálogo de encapsulados reales de KiCad 9.0 (Episodio 01 + Episodio 02)
export const CATALOGO_KICAD: ModeloKiCad[] = [
  // Episodio 01: Transistor BJT
  {
    id: "to92",
    rutaRelativa: "Package_TO_SOT_THT.3dshapes/TO-92_Inline.step",
    descripcion: "Encapsulado TO-92 THT (2N2222A, BC547, 2N3904) — 625 mW",
  },
  {
    id: "to220",
    rutaRelativa: "Package_TO_SOT_THT.3dshapes/TO-220-3_Vertical.step",
    descripcion: "Encapsulado TO-220-3 de potencia (TIP31C, IRFZ44N, LM7805)",
  },
  {
    id: "sot23",
    rutaRelativa: "Package_TO_SOT_SMD.3dshapes/SOT-23.step",
    descripcion: "Encapsulado SMD SOT-23 (MMBT2222A, BSS138) — 350 mW",
  },
  {
    id: "led5mm",
    rutaRelativa: "LED_THT.3dshapes/LED_D5.0mm.step",
    descripcion: "Diodo emisor de luz THT 5 mm estándar",
  },
  {
    id: "resistencia_axial",
    rutaRelativa: "Resistor_THT.3dshapes/R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal.step",
    descripcion: "Resistencia axial DIN0207 1/4 W (paso 10.16 mm)",
  },
  {
    id: "pulsador_6mm",
    rutaRelativa: "Button_Switch_THT.3dshapes/SW_PUSH_6mm_H5mm.step",
    descripcion: "Pulsador táctil THT 6x6 mm H=5 mm (Omron B3F)",
  },
  // Episodio 02: Relé Electromecánico + Diodo Flyback 1N4007
  {
    id: "rele_spdt",
    rutaRelativa: "Relay_THT.3dshapes/Relay_SPDT_Omron-G5LE-1.step",
    descripcion: "Relé electromecánico SPDT 5 pines Omron G5LE-1 (10A 250VAC, bobina 5V/12V)",
  },
  {
    id: "rele_dpdt",
    rutaRelativa: "Relay_THT.3dshapes/Relay_DPDT_Finder_40.52.step",
    descripcion: "Relé industrial DPDT 8 pines Finder Serie 40.52 (8A 250VAC)",
  },
  {
    id: "rele_smd",
    rutaRelativa: "Relay_SMD.3dshapes/Relay_DPDT_Omron_G6K-2F-Y.step",
    descripcion: "Micro-relé SMD DPDT de señal Omron G6K-2F-Y",
  },
  {
    id: "diodo_1n4007",
    rutaRelativa: "Diode_THT.3dshapes/D_DO-41_SOD81_P10.16mm_Horizontal.step",
    descripcion: "Diodo rectificador flyback 1N4007 en encapsulado axial DO-41 (1000V 1A)",
  },
  // Episodio 03: BJT vs. MOSFET de Potencia (IRFZ44N / SOT-223 / Disipador)
  {
    id: "dpak",
    rutaRelativa: "Package_TO_SOT_SMD.3dshapes/SOT-223.step",
    descripcion: "Encapsulado SMD de potencia con aleta térmica SOT-223 (BSP295, IRFL014N)",
  },
  {
    id: "disipador_to220",
    rutaRelativa: "Heatsink.3dshapes/Heatsink_Stonecold_HS-132_32x14mm_2xFixation1.5mm.step",
    descripcion: "Disipador de aluminio extruido para encapsulado TO-220",
  },
  // Episodio 04: Capacitores (Electrolítico Radial, Cerámico MLCC 0805 y Tántalo SMD)
  {
    id: "cap_electrolitico",
    rutaRelativa: "Capacitor_THT.3dshapes/CP_Radial_D8.0mm_P3.50mm.step",
    descripcion: "Capacitor electrolítico de aluminio radial 100 µF 25 V (D=8mm, P=3.5mm)",
  },
  {
    id: "cap_ceramico",
    rutaRelativa: "Capacitor_SMD.3dshapes/C_0805_2012Metric.step",
    descripcion: "Capacitor cerámico multicapa SMD MLCC 0805 (100 nF X7R)",
  },
  {
    id: "cap_tantalo",
    rutaRelativa: "Capacitor_Tantalum_SMD.3dshapes/CP_EIA-3216-18_Kemet-A.step",
    descripcion: "Capacitor de tántalo SMD EIA-3216 Case A (10 µF 16 V)",
  },
  // Episodio 05: Diodos (Rectificador DO-41, Zener de vidrio DO-35)
  {
    id: "diodo_zener",
    rutaRelativa: "Diode_THT.3dshapes/D_DO-35_SOD27_P10.16mm_Horizontal.step",
    descripcion: "Diodo Zener axial en encapsulado de vidrio DO-35 (1N4733A 5.1V / 1N4148)",
  },
  // Episodio 06: Inductores y Convertidor Buck (Radial, SMD Blindado Bourns, Toroidal EPCOS)
  {
    id: "inductor_radial",
    rutaRelativa: "Inductor_THT.3dshapes/L_Radial_D10.0mm_P5.00mm_Fastron_07M.step",
    descripcion: "Inductor de potencia radial en núcleo de ferrita Fastron 07M (100 µH)",
  },
  {
    id: "inductor_smd",
    rutaRelativa: "Inductor_SMD.3dshapes/L_Bourns_SRR1260.step",
    descripcion: "Inductor de potencia SMD blindado Bourns SRR1260 para Convertidor Buck (33 µH 3A)",
  },
  {
    id: "inductor_toroidal",
    rutaRelativa: "Inductor_THT.3dshapes/Choke_EPCOS_B82722A.step",
    descripcion: "Inductor toroidal de filtro y potencia EPCOS B82722A",
  },
];

function generarPcbTemporal(rutaModeloAbs: string): string {
  const rutaKicad = rutaModeloAbs.replace(/\\/g, "/");
  return `(kicad_pcb
  (version 20240108)
  (generator "videos-electronica")
  (layers
    (0 "F.Cu" signal)
    (31 "B.Cu" signal)
    (44 "Edge.Cuts" user)
  )
  (footprint "Custom:ModelWrapper"
    (layer "F.Cu")
    (at 0 0)
    (property "Reference" "U1" (at 0 0 0) (layer "F.SilkS"))
    (property "Value" "Model" (at 0 0 0) (layer "F.Fab"))
    (attr through_hole)
    (model "${rutaKicad}"
      (offset (xyz 0 0 0))
      (scale (xyz 1 1 1))
      (rotate (xyz 0 0 0))
    )
  )
)
`;
}

export function exportarModeloKiCad(modelo: ModeloKiCad) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const rutaStep = path.join(KICAD_3D_DIR, modelo.rutaRelativa);
  if (!fs.existsSync(rutaStep)) {
    throw new Error(`No existe el modelo de KiCad: ${rutaStep}`);
  }

  const outGlb = path.join(OUT_DIR, `${modelo.id}.glb`);
  const tmpPcb = path.join(os.tmpdir(), `kicad_export_${modelo.id}.kicad_pcb`);
  fs.writeFileSync(tmpPcb, generarPcbTemporal(rutaStep), "utf8");

  execFileSync(
    KICAD_CLI,
    [
      "pcb",
      "export",
      "glb",
      "--no-board-body",
      "--subst-models",
      "--user-origin",
      "0x0mm",
      "-f",
      "-o",
      outGlb,
      tmpPcb,
    ],
    { stdio: "inherit" },
  );

  fs.unlinkSync(tmpPcb);
  const bytes = fs.statSync(outGlb).size;
  console.log(`✔ [${modelo.id}] exportado → ${outGlb} (${(bytes / 1024).toFixed(1)} KB)`);
}

for (const m of CATALOGO_KICAD) {
  exportarModeloKiCad(m);
}

const BLENDER_EXE = "C:\\Program Files\\Blender Foundation\\Blender 5.0\\blender.exe";
if (fs.existsSync(BLENDER_EXE)) {
  console.log("⚙ Procesando materiales PBR y cortes booleanos en Blender 5.0…");
  execFileSync(BLENDER_EXE, ["-b", "-P", "scripts/procesar-modelos-blender.py"], { stdio: "inherit" });
}
