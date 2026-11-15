# Videos de Electrónica — 100 % Código (Pipeline Híbrido KiCad 9 + Blender 5 + Remotion 4)

**Stack:**
- **KiCad 9.0 (`kicad-cli`)**: Exportación directa de los **13,811 modelos CAD `.step`/`.wrl`** oficiales a `.glb` (`scripts/exportar-kicad-glb.ts`).
- **Blender 5.0 (`bpy`)**: Normalización a milímetros, materiales PBR reales y cortes booleanos / vistas de autopsia interna (`scripts/procesar-modelos-blender.py`).
- **Remotion 4 + React Three Fiber / Three.js**: Composición 3D a 60 fps con iluminación HDRI, sombras 4K, post-procesado AGX + Bloom, trazador de curvas de datasheet y sincronía exacta por palabra.
- **ElevenLabs API**: Narración ES/EN con timestamps por palabra y caché SHA-1 (`scripts/generar-voces.ts`).

## Flujo de Producción
1. **Generar/actualizar modelos 3D desde KiCad 9.0 + Blender 5.0:**
   ```bash
   npm run modelos
   ```
2. **Escribir/editar el guion y datos de datasheet en `src/guion.ts` (ES y EN).**
3. **Generar voces y timestamps (solo genera escenas nuevas o modificadas):**
   ```bash
   npm run voces
   ```
4. **Previsualizar en el navegador:**
   ```bash
   npm run studio
   ```
5. **Renderizar videos finales (1080p 60 fps en `out/`):**
   - **Horizontal Principal (16:9 — 6 escenas de ingeniería):**
     ```bash
     npm run render:es
     npm run render:en
     ```
   - **Vertical Short / Reels / TikTok (9:16 — < 58 s de alta retención):**
     ```bash
     npm run render:short:es
     npm run render:short:en
     ```

## Estructura de Escenas (`Transistor 2N2222A`)
- `src/escenas/Intro.tsx` — Encapsulado real `TO-92` de KiCad en PCB + ficha técnica del datasheet (`2N2222A`).
- `src/escenas/Autopsia.tsx` — Corte booleano 3D hecho en Blender 5.0 (`to92_autopsia.glb`) mostrando el *leadframe* de cobre, hilos de oro de $25\text{ }\mu\text{m}$ y las 3 capas del cristal de silicio ($N^+$ Emisor, $P$ Base, $N$ Colector).
- `src/escenas/Partes.tsx` — Símbolo esquemático NPN, terminales y ganancia $\beta$.
- `src/escenas/Circuito.tsx` — Circuito real en 3D con modelos CAD de KiCad (`TO-92`, resistencia axial $1\text{ k}\Omega$, LED $5\text{ mm}$, pulsador Omron $6\text{ mm}$) + corrientes y tensiones de saturación ($V_{BE} = 0.7\text{ V}$, $V_{CE(\text{sat})} = 0.3\text{ V}$).
- `src/escenas/Regiones.tsx` — Trazador de curvas del datasheet ($I_C$ vs $V_{CE}$) explicando Corte, Saturación y Región Activa ($P_{D(\max)} = 625\text{ mW}$).
- `src/escenas/Cierre.tsx` — Comparativa 3D con los 3 encapsulados reales de KiCad (`TO-92` THT, `SOT-23` SMD y `TO-220` de potencia).
