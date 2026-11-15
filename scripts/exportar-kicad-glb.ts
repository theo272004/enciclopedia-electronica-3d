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

// Catálogo inicial de encapsulados reales de KiCad 9.0
export const CATALOGO_KICAD: ModeloKiCad[] = [
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

