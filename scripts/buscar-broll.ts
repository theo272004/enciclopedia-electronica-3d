// Descarga fotos y videos de b-roll desde bancos gratuitos y guarda los créditos de cada archivo.
// Uso:
//   npm run broll -- "transistor macro" fotos 6 wikimedia     (sin clave)
//   npm run broll -- "soldering electronics" fotos 8 pixabay
//   npm run broll -- "oscilloscope" videos 4 pixabay
//   npm run broll -- "arduino workbench" fotos 6 unsplash
// Claves opcionales en .env: PIXABAY_API_KEY, UNSPLASH_ACCESS_KEY, PEXELS_API_KEY.
// Sin proveedor explícito se usa el primero con clave; si no hay ninguna, Wikimedia Commons.
// Los archivos van a public/broll/<tema>/ (ignorado por Git: las licencias no permiten
// redistribuir los originales tal cual) junto con creditos.json para la descripción del video.
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

type Fuente = "Pexels" | "Pixabay" | "Unsplash" | "Wikimedia Commons";
type Credito = { archivo: string; fuente: Fuente; autor: string; perfil: string; pagina: string; licencia: string };

const args = process.argv.slice(2);
const permitirSA = args.includes("--sa");
const [consulta, tipo = "fotos", cantidadTxt = "6", proveedorPedido] = args.filter((a) => a !== "--sa");
if (!consulta) {
  salir('Uso: npm run broll -- "consulta en inglés" [fotos|videos] [cantidad] [wikimedia|pixabay|unsplash|pexels] [--sa]');
}
const cantidad = Math.min(Math.max(Number(cantidadTxt) || 6, 1), 30);
const CLAVES = {
  pexels: process.env.PEXELS_API_KEY?.trim(),
  pixabay: process.env.PIXABAY_API_KEY?.trim(),
  unsplash: process.env.UNSPLASH_ACCESS_KEY?.trim(),
};
const proveedor =
  proveedorPedido ?? (CLAVES.pixabay ? "pixabay" : CLAVES.pexels ? "pexels" : CLAVES.unsplash ? "unsplash" : "wikimedia");

const NOMBRE_CLAVE: Record<string, string> = { pexels: "PEXELS_API_KEY", pixabay: "PIXABAY_API_KEY", unsplash: "UNSPLASH_ACCESS_KEY" };
if (!["wikimedia", "pixabay", "unsplash", "pexels"].includes(proveedor)) salir(`Proveedor desconocido: ${proveedor}`);
if (proveedor !== "wikimedia" && !CLAVES[proveedor as keyof typeof CLAVES]) salir(`Falta ${NOMBRE_CLAVE[proveedor]} en el archivo .env`);
if (tipo === "videos" && (proveedor === "unsplash" || proveedor === "wikimedia")) salir(`${proveedor} no sirve para videos: usa pixabay`);

const tema = consulta.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const carpeta = path.resolve("public", "broll", tema);
const rutaCreditos = path.join(carpeta, "creditos.json");
fs.mkdirSync(carpeta, { recursive: true });
const creditos: Credito[] = fs.existsSync(rutaCreditos) ? JSON.parse(fs.readFileSync(rutaCreditos, "utf8")) : [];

// Wikimedia pide un User-Agent identificable; uno genérico del proyecto, sin datos personales.
const UA = { "User-Agent": "EnciclopediaElectronica3D-broll/1.0 (script de descarga de b-roll)" };

function salir(msg: string): never {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

async function pedirJson(url: string, headers: Record<string, string> = {}) {
  const r = await fetch(url, { headers: { ...UA, ...headers } });
  if (!r.ok) salir(`${r.status} ${r.statusText} en ${new URL(url).host}`);
  return r.json() as Promise<any>;
}

async function descargar(url: string, archivo: string) {
  const destino = path.join(carpeta, archivo);
  if (fs.existsSync(destino)) return false;
  const r = await fetch(url, { headers: UA });
  if (!r.ok) salir(`No se pudo descargar ${archivo}: ${r.status}`);
  fs.writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
  return true;
}

function registrar(c: Credito, nuevo: boolean, extra = "") {
  if (!creditos.some((x) => x.archivo === c.archivo)) creditos.push(c);
  console.log(`${nuevo ? "↓" : "="} ${c.archivo} · ${c.autor}${extra ? ` · ${extra}` : ""}`);
}

const sinHtml = (s = "") => s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const q = encodeURIComponent(consulta);

if (proveedor === "wikimedia") {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6" +
    `&gsrsearch=${q}%20filetype:bitmap&gsrlimit=${cantidad * 3}` +
    "&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=2400";
  const data = await pedirJson(url);
  const paginas = Object.values(data.query?.pages ?? {}) as any[];
  let guardadas = 0;
  let omitidas = 0;
  for (const p of paginas.sort((a, b) => a.index - b.index)) {
    if (guardadas >= cantidad) break;
    const info = p.imageinfo?.[0];
    const meta = info?.extmetadata ?? {};
    const licencia = sinHtml(meta.LicenseShortName?.value) || "desconocida";
    const esSA = /SA/i.test(licencia);
    const libre = /^(CC0|Public domain|PD|CC BY)/i.test(licencia) || /dominio p/i.test(licencia);
    // CC BY-SA exige compartir la obra derivada con la misma licencia: solo con --sa
    if (!info || info.width < 1200 || !libre || (esSA && !permitirSA)) {
      omitidas++;
      continue;
    }
    const ext = (info.thumburl ?? info.url).split(".").pop()!.split("?")[0].toLowerCase();
    const archivo = `wikimedia-${p.pageid}.${ext === "png" ? "png" : "jpg"}`;
    const nuevo = await descargar(info.thumburl ?? info.url, archivo);
    registrar(
      {
        archivo,
        fuente: "Wikimedia Commons",
        autor: sinHtml(meta.Artist?.value) || "desconocido",
        perfil: "",
        pagina: info.descriptionurl,
        licencia: `${licencia}${meta.LicenseUrl?.value ? ` (${meta.LicenseUrl.value})` : ""}`,
      },
      nuevo,
      licencia,
    );
    guardadas++;
  }
  if (omitidas) console.log(`  (${omitidas} omitidas por tamaño < 1200 px o licencia no libre${permitirSA ? "" : "/BY-SA; usa --sa para incluir BY-SA"})`);
} else if (proveedor === "pixabay") {
  const base = tipo === "videos" ? "https://pixabay.com/api/videos/" : "https://pixabay.com/api/";
  // Solo fotos reales (sin ilustraciones ni vectores) y en buena resolución
  const filtros = tipo === "videos" ? "&video_type=film" : "&image_type=photo&min_width=1920";
  const data = await pedirJson(`${base}?key=${CLAVES.pixabay}&q=${q}&per_page=${Math.max(cantidad, 3)}&safesearch=true${filtros}`);
  for (const h of (data.hits ?? []).slice(0, cantidad)) {
    const pixabay = { fuente: "Pixabay" as const, autor: h.user, perfil: `https://pixabay.com/users/${h.user}-${h.user_id}/`, pagina: h.pageURL, licencia: "Pixabay Content License" };
    if (tipo === "videos") {
      // Preferir ~1080p: el 4K de "large" infla el render sin aportar nada a 1080p
      const opciones = [h.videos?.medium, h.videos?.large, h.videos?.small].filter((x: any) => x?.url && x.width);
      const v = opciones.sort((a: any, b: any) => Math.abs(a.width - 1920) - Math.abs(b.width - 1920))[0];
      if (!v?.url) continue;
      const archivo = `pixabay-${h.id}.mp4`;
      registrar({ archivo, ...pixabay }, await descargar(v.url, archivo), `${v.width}×${v.height} · ${h.duration}s`);
    } else {
      const archivo = `pixabay-${h.id}.jpg`;
      registrar({ archivo, ...pixabay }, await descargar(h.largeImageURL, archivo));
    }
  }
} else if (proveedor === "pexels") {
  const headers = { Authorization: CLAVES.pexels! };
  if (tipo === "videos") {
    const data = await pedirJson(`https://api.pexels.com/videos/search?query=${q}&per_page=${cantidad}&orientation=landscape&size=large`, headers);
    for (const v of data.videos ?? []) {
      const mp4 = (v.video_files ?? [])
        .filter((f: any) => f.file_type === "video/mp4" && f.width)
        .sort((a: any, b: any) => Math.abs(a.width - 1920) - Math.abs(b.width - 1920))[0];
      if (!mp4) continue;
      const archivo = `pexels-${v.id}.mp4`;
      registrar(
        { archivo, fuente: "Pexels", autor: v.user?.name ?? "", perfil: v.user?.url ?? "", pagina: v.url, licencia: "Pexels License" },
        await descargar(mp4.link, archivo),
        `${mp4.width}×${mp4.height} · ${v.duration}s`,
      );
    }
  } else {
    const data = await pedirJson(`https://api.pexels.com/v1/search?query=${q}&per_page=${cantidad}`, headers);
    for (const f of data.photos ?? []) {
      const archivo = `pexels-${f.id}.jpg`;
      registrar(
        { archivo, fuente: "Pexels", autor: f.photographer, perfil: f.photographer_url, pagina: f.url, licencia: "Pexels License" },
        await descargar(f.src.large2x, archivo),
      );
    }
  }
} else {
  const headers = { Authorization: `Client-ID ${CLAVES.unsplash}` };
  const data = await pedirJson(`https://api.unsplash.com/search/photos?query=${q}&per_page=${cantidad}`, headers);
  for (const f of data.results ?? []) {
    const archivo = `unsplash-${f.id}.jpg`;
    const nuevo = await descargar(`${f.urls.raw}&w=2400&fm=jpg&q=85`, archivo);
    // Las normas de la API de Unsplash exigen avisar cada descarga a este endpoint
    if (nuevo) await fetch(f.links.download_location, { headers });
    registrar(
      {
        archivo,
        fuente: "Unsplash",
        autor: f.user?.name ?? "",
        perfil: `${f.user?.links?.html}?utm_source=enciclopedia_electronica&utm_medium=referral`,
        pagina: f.links.html,
        licencia: "Unsplash License",
      },
      nuevo,
    );
  }
}

fs.writeFileSync(rutaCreditos, JSON.stringify(creditos, null, 2), "utf8");
console.log(`\n✔ ${creditos.length} archivos con crédito en ${path.relative(process.cwd(), rutaCreditos)}`);
