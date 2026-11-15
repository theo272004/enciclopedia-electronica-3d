import * as THREE from "three";

// Texturas de texto generadas con canvas (serigrafía de PCB, marcas en componentes). Sin red, sin fuentes externas.
const cache = new Map<string, THREE.CanvasTexture>();

export const texturaTexto = (
  lineas: string[],
  { ancho = 512, alto = 256, color = "#ffffff", fondo = "transparent", tam = 96, peso = 700 } = {},
) => {
  const clave = JSON.stringify([lineas, ancho, alto, color, fondo, tam, peso]);
  const hit = cache.get(clave);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = ancho;
  c.height = alto;
  const ctx = c.getContext("2d")!;
  if (fondo !== "transparent") {
    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, ancho, alto);
  }
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${peso} ${tam}px "Consolas", "DejaVu Sans Mono", monospace`;
  const paso = tam * 1.1;
  lineas.forEach((l, i) => ctx.fillText(l, ancho / 2, alto / 2 + (i - (lineas.length - 1) / 2) * paso));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(clave, t);
  return t;
};
