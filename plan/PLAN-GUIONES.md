# Plan de guiones y videos — v2

> Basado en la revisión de los 7 episodios (`src/guion*.ts`), las duraciones reales de voz (`public/voz*/es/manifest.json`), el kit de YouTube y la web (`docs/`). Fecha: 2026-11-16.

---

## 1. Diagnóstico

### Lo que ya funciona (mantener)
- **Diferenciador visual fuerte:** autopsias 3D de Blender, modelos CAD reales de KiCad y datos del datasheet. Ningún canal en español hace esto con este nivel.
- **El Ep. 07 (Puente H) es el mejor guion:** arranca con un **dolor real** ("el disipador arde y los motores giran lento"), mete una **trampa** (shoot-through) y termina en una **decisión** (L298N vs DRV8833). Ese es el modelo a seguir.
- El intro ES del transistor ("oro puro… y una trampa microscópica") también es un buen gancho.
- Datos concretos: 17.5 mΩ, 1 470 pF, 2.5 W vs 0.36 W. Eso da credibilidad.

### Lo que frena el crecimiento
| # | Problema | Evidencia |
|---|---|---|
| 1 | **Plantilla rígida de 6 escenas** (intro → autopsia → partes → circuito → regiones → cierre). Todos los videos se sienten iguales. | Mismo `EscenaId` en todos los episodios |
| 2 | **Frases repetidas que suenan a IA**: "Si abrimos un…" (6/7 episodios), "Desde el X… hasta el Y: dominar Z es…" (5/7 cierres). | `autopsia` y `cierre` de cada guion |
| 3 | **Ganchos de definición, no de problema**: "Es la válvula antirretorno…", "Mientras el capacitor almacena…". El espectador no sabe por qué le importa. | Intros de diodo, inductor, capacitor |
| 4 | **Los Shorts no son Shorts**: el README dice "< 58 s" pero duran **69–91 s**. Además son recortes del largo, no guiones propios. | Transistor 59.5 s · Puente H 69.4 s · Relé 81.3 s · MOSFET 91.0 s |
| 5 | **El video largo (1:36–2:19) queda en tierra de nadie**: demasiado largo para Short y demasiado corto para que YouTube lo recomiende como video largo. Sin margen para un ejemplo práctico. | Duraciones en la tabla de abajo |
| 6 | **Los capítulos del kit no coinciden con el guion** (p. ej. MOSFET: el capítulo "regiones" dice "mito V_GS(th)", pero ese tema está en `partes`; `regiones` habla de calor). | `scripts/generar-kit-youtube.ts` vs `guion-mosfet.ts` |
| 7 | **No hay hilo entre episodios**: ningún video termina invitando al siguiente; el canal no tiene una "historia". | Cierres de todos los guiones |
| 8 | **Algunas exageraciones técnicas** que un comentario puede tumbar: "la inductancia cae a cero" (cae fuerte, no a cero); "cuatro transistores" en el L298N (son 4 por puente, 8 en el chip doble). | `guion-inductor.ts`, `guion-puente-h.ts` |

Duraciones reales (ES, con transiciones):

| Ep | Largo | "Short" |
|---|---|---|
| 01 Transistor | 1:36 | 0:59 |
| 02 Relé | 2:07 | 1:21 |
| 03 MOSFET | 2:19 | 1:31 |
| 04 Capacitor | 2:01 | 1:20 |
| 05 Diodo | 2:11 | 1:23 |
| 06 Inductor | 2:10 | 1:21 |
| 07 Puente H | 1:48 | 1:09 |

---

## 1.5 Diferenciador: "Kit de componente verificado"

**Posicionamiento:** *"El componente explicado con datos que puedes comprobar, y listo para usar en tu software de electrónica."*
El video atrae; **el kit descargable es lo que hace volver a la gente y lo que la gente comparte** (foros, grupos de Arduino, clases).

### Estado actual de las descargas (`docs/descargas/`)
| Ep | STEP/WRL | GLB | Esquemático | SPICE | Código | Fritzing | Otros |
|---|---|---|---|---|---|---|---|
| 01 Transistor | ✅ | ✅ | ✅ KiCad | ✅ | ✅ .ino + .py | ❌ | ✅ STL |
| 02 Relé | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | — |
| 03 MOSFET | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | — |
| 04 Capacitor | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | — |
| 05 Diodo | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | — |
| 06 Inductor | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | — |
| 07 Puente H | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | — |

⚠️ **Riesgos de fiabilidad que ya existen:**
- La web dice "KiCad 9.0 · Altium · EasyEDA · Fusion 360", pero solo hay `.step`. Un `.step` sirve para la vista 3D, **no** trae símbolo ni huella. Si alguien lo prueba y no funciona, se pierde la confianza. Hay que cumplir lo que dice la web o cambiar el texto.
- **No hay aviso de licencias.** Los modelos 3D de KiCad tienen licencia CC-BY-SA 4.0 (con una excepción para usarlos en diseños propios): al redistribuirlos modificados hay que dar crédito y compartirlos con la misma licencia. Los modelos SPICE de fabricante (p. ej. ON Semi) suelen tener términos propios: es más seguro **enlazar a la fuente oficial** que volver a subirlos.

### Qué incluye cada kit (estándar mínimo)
| Plataforma | Archivos | Para quién | Prioridad |
|---|---|---|---|
| **KiCad 9** | `.kicad_sym` + `.pretty/.kicad_mod` + `.step` + esquemático de ejemplo `.kicad_sch` | Quienes diseñan PCB | 🔴 Alta (es el pipeline base) |
| **Fritzing** | `.fzpz` (vista protoboard + esquema + PCB) **y** proyecto de ejemplo `.fzz` | Estudiantes, makers, clases | 🔴 Alta (casi nadie hace buenas piezas) |
| **Wokwi** | `diagram.json` + sketch, con enlace a la simulación online | Público Arduino/ESP32 | 🔴 Alta (se prueba en 1 clic, sin hardware) |
| **Arduino / ESP32 / MicroPython** | `.ino`, `.py` | Todos | 🔴 Alta |
| **SPICE** (LTspice y ngspice de KiCad) | `.asc` + enlace al `.lib` oficial | Quienes estudian electrónica, universidades | 🟡 Media |
| **EasyEDA / JLCPCB** | Código LCSC (C-number) + importación de la librería KiCad | Quienes fabrican en JLCPCB | 🟡 Media (a veces solo hace falta el código) |
| **Fusion 360 Electronics / Eagle** | `.lbr` | Usuarios de Fusion | 🟢 Baja |
| **Impresión 3D** | `.stl` de la autopsia | Profesores, divulgación | 🟢 Baja (buen extra) |
| Tinkercad / Proteus | No permiten importar piezas de forma sencilla → solo enlace a un circuito público de Tinkercad cuando aplique | — | ⚪ Opcional |

> En Fritzing y Wokwi el valor real está en los **módulos** (L298N rojo, DRV8833, MP1584, TP4056, INA219), que es lo que usa la gente en protoboard. En los componentes sueltos (2N2222, 1N4007) el core de Fritzing ya suele traer una pieza: hay que comprobarlo antes, y en ese caso ofrecer el **proyecto de ejemplo** en vez de una pieza repetida.

### Protocolo de fiabilidad (sello de 3 niveles)
Cada dato que aparece en el video, en la web y en el kit lleva su nivel:

| Sello | Significa | Cómo se registra |
|---|---|---|
| 📄 **Datasheet** | Valor tomado de la hoja oficial | Fabricante + nº de documento + **revisión** + página + condición de prueba ("@ I_C = 150 mA, 25 °C") |
| 🧮 **Simulado** | Comprobado en SPICE | Archivo `.asc` / netlist incluido en el kit |
| 🔬 **Medido** | Comprobado en banco con la pieza real | Foto/clip de la medición + instrumento + fecha |

Reglas:
- **Nada sin fuente.** Cada `DATASHEET_*` en el código pasa a ser `{valor, condicion, fuente, pagina, sello}`, y la web y los rótulos del video se generan desde ahí.
- **Típico ≠ máximo.** Decir siempre cuál es ("V_CE(sat) **máx.** 0.3 V"). Es el error más común en contenido de electrónica.
- **Dimensiones del 3D verificadas** contra el dibujo mecánico del datasheet (cota en el video = cota del plano).
- **Fe de erratas pública** en la web y en la descripción de YouTube: si alguien encuentra un error, se corrige y se le da crédito. Eso **aumenta** la confianza.
- **Prueba de importación:** antes de publicar, abrir cada archivo en su programa (KiCad, Fritzing, Wokwi, LTspice) y dejarlo en una lista de control. Si no se pudo probar, no se anuncia esa plataforma.

### Cómo se nota en los videos
- **Sello en pantalla** junto a cada número (📄/🧮/🔬), y la fuente en pequeño (estilo cita): es el `HudIngenieria`/`CotaSenal` actual con un campo más.
- La escena **PRUEBA** pasa a ser "datasheet vs medición real": si coinciden, se gana confianza; si no, el desvío **es contenido** ("el datasheet dice 0.3 V, yo medí 0.18 V: esto es por qué").
- El **MINI-PROYECTO** se muestra *en el archivo que se descarga* (Fritzing en protoboard o Wokwi corriendo), no en un render aparte.
- CTA concreto: "El símbolo, la huella, la pieza de Fritzing y la simulación de Wokwi están en la web", en lugar de un genérico "descárgalo en GitHub".

### Pipeline para producirlo sin trabajo manual
1. **KiCad:** `kicad-cli` ya está en uso → exportar `.kicad_sym`/`.kicad_mod` de la librería oficial y generar el esquemático de ejemplo por script.
2. **Fritzing:** un `.fzpz` es un zip con un `.fzp` (XML) y 3 SVG (protoboard, esquema, PCB) + icono → se puede generar con script: esquema y PCB desde el SVG que exporta KiCad, y la vista de protoboard desde un render cenital de Blender convertido a SVG/PNG embebido.
3. **Wokwi:** `diagram.json` generado desde la misma lista de conexiones del ejemplo.
4. **Una sola fuente:** un `kit-<ep>.ts` con la lista de conexiones, los pines y los datos con sello → de ahí salen el esquemático KiCad, el proyecto Fritzing, Wokwi, la web y los rótulos del video.
5. Script `validar-kit` que compruebe que existen todos los archivos del estándar mínimo y que cada dato tiene fuente.

---

## 2. Nuevo formato: "Problema → Autopsia → Decisión"

En vez de recorrer el componente parte por parte, **cada episodio responde una pregunta que el espectador ya se hizo en el taller.** El componente es la respuesta, no el tema.

### Estructura del video largo (meta: 5–7 min)
Los bloques son flexibles: se pueden repetir o reordenar. Ya no son 6 fijos.

| Bloque | Duración | Qué hace | Escena actual que lo cubre |
|---|---|---|---|
| **GANCHO** | 0–8 s | Imagen del fallo + una pregunta. Nada de definiciones. | `intro` (cambiar texto) |
| **APUESTA** | 8–25 s | "Al final vas a saber X, y vas a ver por qué Y es mentira." Promesa concreta. | nuevo (texto sobre `intro`) |
| **AUTOPSIA** | 30–60 s | Abrir el componente para mostrar la causa física del problema. | `autopsia` |
| **MECANISMO** | 40–60 s | Analogía física + símbolo y pines solo si hacen falta. | `partes` + `AnaliogiaFisica` |
| **PRUEBA** | 60–90 s | Medición: multímetro vivo, osciloscopio o curva del datasheet. **El número que cambia la decisión.** | `regiones` + `MultimetroVivo` |
| **ERROR REAL** | 30–60 s | La trampa que quema placas (shoot-through, flyback, V_GS(th)…). | `circuito` |
| **MINI-PROYECTO** | 60–120 s | Montaje práctico con el archivo descargable (KiCad / .ino). Aquí entra el tiempo extra. | nuevo |
| **DECISIÓN** | 15–25 s | Regla de bolsillo: "usa A cuando…, B cuando…". | `cierre` |
| **PUENTE** | 5–10 s | Gancho al siguiente episodio, no un resumen. | nuevo |

### Shorts: guiones propios, no recortes (meta: 30–45 s)
De cada episodio salen **3 Shorts**, cada uno con **una sola idea**:
1. **Short-Trampa:** el error real (p. ej. "Esto pasa si activas Q1 y Q4 a la vez" → chispa).
2. **Short-Autopsia:** "Lo que hay dentro de X" → corte 3D sin narrar teoría.
3. **Short-Número:** "2.5 W vs 0.36 W" → comparación con multímetro vivo.

Estructura de cada Short: **gancho visual en 1 s → tensión → revelación → loop** (que la última frase empalme con la primera).

---

## 3. Reglas de escritura (checklist por guion)

- [ ] El gancho es **un problema o una imagen**, nunca "Es el / La X es…".
- [ ] Prohibido abrir la autopsia con "Si abrimos…". Alternativas: "Corta el encapsulado y aparece…", "Esto es lo que el datasheet no dibuja…", entrar directo con la imagen sin narrar.
- [ ] Prohibido el cierre "Desde el X… hasta el Y". El cierre es una **regla de decisión** + **puente** al siguiente.
- [ ] **Un número por frase**, y siempre con su consecuencia ("cae 0.17 V → **casi no calienta**").
- [ ] Cada número sale del datasheet citado en `DATASHEET_*` (pieza + condición: "@ 1 A, 25 °C").
- [ ] Leerlo en voz alta: si no lo dirías hablando con un amigo en el taller, reescríbelo.
- [ ] ES se escribe primero y de forma natural; EN se **adapta**, no se traduce palabra por palabra (hoy el intro del transistor ES y EN son guiones distintos sin querer).
- [ ] Ritmo: ~150 palabras/min. Bloques de 25–40 palabras con un corte visual o SFX cada 3–5 s.
- [ ] Revisión técnica: buscar absolutos ("cero", "nunca", "siempre", "instantáneo") y comprobar que son ciertos.

---

## 4. Ficha previa de cada episodio (antes de tocar `guion-*.ts`)

Copia esta ficha por episodio y complétala **antes** de escribir la narración:

```
EPISODIO: 08 — <título de trabajo>
PREGUNTA DEL ESPECTADOR: "¿Por qué mi ESP32 se reinicia cuando arranca el motor?"
MITO / ERROR COMÚN: "Con un 7805 basta para alimentar todo."
PROMESA (APUESTA): "Al final sabrás elegir el regulador en 10 segundos mirando 2 números."
COMPONENTE(S): AMS1117-3.3 vs MP1584 (buck)
AUTOPSIA: qué se corta en Blender y qué se ve
NÚMERO QUE DECIDE: P = (Vin − Vout) · I → 1.7 W vs 0.3 W
ERROR REAL (TRAMPA): caída de tensión en arranque → brown-out del ESP32
MINI-PROYECTO: placa KiCad + .ino que mide Vcc con el ADC
REGLA DE DECISIÓN: lineal si ΔV·I < 0.5 W; buck en cualquier otro caso
PUENTE AL SIGUIENTE: "…y ese ruido del buck tiene nombre: lo vemos en el 09."
SHORTS (3): trampa / autopsia / número
TÍTULO + MINIATURA: 3 opciones de título, 1 frase de miniatura (≤ 4 palabras)
PALABRAS CLAVE SEO: …
KIT VERIFICADO:
  KiCad: .kicad_sym / .kicad_mod / .step / .kicad_sch   [probado: sí/no]
  Fritzing: .fzpz / .fzz (¿ya existe en el core?)        [probado: sí/no]
  Wokwi: enlace + diagram.json                           [probado: sí/no]
  Código: .ino / .py      SPICE: .asc + enlace .lib oficial
  EasyEDA: código LCSC    Licencias: fuente + licencia de cada archivo
DATOS CON SELLO: valor · condición · fuente (doc, rev., pág.) · 📄/🧮/🔬
```

---

## 5. Hoja de ruta: Temporada 2 — "Arma un robot que no se queme"

Los episodios 01–07 quedan como **Temporada 1: Componentes**. La Temporada 2 usa **un solo proyecto** (un robot con ESP32 y 2 motores, que ya empieza con el Puente H) y cada episodio resuelve un problema real de ese robot. Ventajas: hilo narrativo, puentes naturales entre episodios y descargas que se acumulan en un proyecto completo para la web.

| Ep | Pregunta del espectador | Componente(s) | Trampa real |
|---|---|---|---|
| 08 | ¿Por qué se reinicia el ESP32 cuando arranca el motor? | AMS1117 (lineal) vs MP1584 (buck) | Brown-out, calor del lineal |
| 09 | ¿De dónde sale ese ruido que rompe mis lecturas? | Desacoplo, ferrita, capacitores en el motor | Masa compartida y bucles de corriente |
| 10 | ¿Cómo leo una batería de 7.4 V con un pin de 3.3 V? | Divisor de tensión + ADC del ESP32 | No linealidad del ADC del ESP32 |
| 11 | ¿Por qué mi botón cuenta 5 veces? | Pull-up/pull-down, RC, Schmitt | Rebote y pines flotantes |
| 12 | ¿Cómo aíslo el motor del micro? | Optoacoplador PC817 | CTR y la velocidad real |
| 13 | ¿Cómo sé cuánta corriente consume el motor? | Shunt + INA219 | Resistencia del shunt y caída |
| 14 | ¿Cómo cargo la LiPo sin incendiarla? | TP4056 + DW01 (protección) | Cargar sin protección, celdas en serie |
| 15 | ¿Cómo amplifico un sensor débil? | LM358 vs rail-to-rail | "Rail-to-rail" que no lo es |
| 16 | Final de temporada: el robot completo | Repaso + placa final KiCad | — |

Cadencia sugerida: **1 largo cada 2 semanas + 3 Shorts por semana** (los 3 del episodio nuevo + reciclar Shorts de la Temporada 1 rehechos con el formato nuevo).

---

## 6. Cambios técnicos en el pipeline (para soportar el formato)

1. **Escenas flexibles:** cambiar `EscenaId` fijo por una lista de bloques por episodio (`bloques: {id, tipo, texto}[]`), para que cada guion defina su propio orden y número de bloques.
2. **Shorts con guion propio:** `GUION_SHORTS_<EP>` con 3 entradas y su propia carpeta de voz, en lugar de `ESCENAS_SHORT` (que recorta el largo).
3. **Validación de duración:** un script que avise si un Short pasa de 45 s o un bloque pasa de 40 palabras (con `construirEscenas`, como hice para medir).
4. **Capítulos generados desde el guion:** que `generar-kit-youtube.ts` lea los títulos de bloque del mismo archivo del guion, para que no se desincronicen.
5. **Ficha del episodio en código:** un `BriefEpisodio` tipado (sección 4) junto a cada guion; el kit de YouTube y la web leen de ahí títulos, SEO y descargas.

---

## 7. Ejemplo: Ep. 07 reescrito con el formato nuevo (ES)

> Esto es para mostrar el tono. No reemplaza `guion-puente-h.ts` hasta aprobarlo.

**GANCHO** — *(plano: disipador del L298N con cámara térmica, motor girando lento)*
"Este módulo rojo está quemando un tercio de tu batería. Y casi nadie lo nota."

**APUESTA**
"En tres minutos vas a ver dónde se pierden esos tres voltios, el error de código que lo destruye en milisegundos, y qué chip de un dólar lo reemplaza."

**AUTOPSIA** — *(corte 3D, sin "si abrimos")*
"Esto es lo que hay bajo la tapa de metal: transistores bipolares en forma de H. Cada uno, al conducir, se queda con más de un voltio. Y la corriente pasa siempre por dos de ellos."

**MECANISMO** — *(analogía de las 4 válvulas)*
"Cuatro válvulas en cruz. Abres arriba a la izquierda y abajo a la derecha: el motor gira hacia adelante. Cambias de diagonal: gira al revés."

**ERROR REAL** — *(SFX chispa)*
"Ahora abre las dos válvulas del mismo lado. La batería ve un cable directo a tierra. Eso se llama shoot-through, y un bug de una línea basta para provocarlo."

**PRUEBA** — *(multímetro vivo, mismo motor, 1 A)*
"Mismo motor, un amperio. El L298N: dos coma cinco vatios de calor. El DRV8833: cero coma treinta y seis. Siete veces menos."

**MINI-PROYECTO** — *(PCB KiCad + .ino)*
"Así se cablea el DRV8833 con un ESP32, con tiempo muerto por software para que el shoot-through no pase nunca. El esquemático está en la web."

**DECISIÓN**
"¿Batería y menos de 10 voltios? DRV8833. ¿Motores de 12 a 35 voltios en un banco fijo? Ahí el L298N todavía sirve."

**PUENTE**
"Pero cuando ese motor arranca, tu ESP32 se reinicia. Eso es culpa del regulador, y es el próximo episodio."

**Shorts derivados**
- *Trampa (≈30 s):* "Una línea de código y este chip muere." → shoot-through → "por eso existe el tiempo muerto" → loop.
- *Autopsia (≈25 s):* corte 3D del L298N con cotas, sin teoría.
- *Número (≈30 s):* "2.5 W contra 0.36 W. Mismo motor." → termómetro vivo.

---

## 8. Siguientes pasos propuestos (ordenados por el diferenciador)
1. **Arreglar la confianza ya publicada:** corregir el texto "Altium · EasyEDA · Fusion 360" de la web hasta que existan esos archivos, añadir créditos y licencias (KiCad CC-BY-SA 4.0, modelos SPICE de fabricante) y corregir las 2 exageraciones técnicas.
2. **Kit piloto completo del Ep. 07 Puente H** (KiCad + Fritzing con el módulo L298N y el DRV8833 + Wokwi con ESP32 + datos con sello), probado en cada programa.
3. **Video piloto del Ep. 07** con el formato nuevo, los sellos en pantalla y 3 Shorts que muestren el kit.
4. Medir: retención del video **y** descargas/clics al kit. Si el kit funciona, completar los kits de los Ep. 01–06 antes de empezar la Temporada 2.
5. Automatizar (`kit-<ep>.ts` → todos los formatos + `validar-kit`) para que cada episodio nuevo salga con el kit sin trabajo manual.
6. Escribir las fichas de los episodios 08–10 de la Temporada 2.
