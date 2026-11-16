# Auditoría de los episodios 01–07

> Revisión de `src/guion*.ts` (narración, `DATASHEET_*` y `TEXTOS_*` en pantalla), duraciones reales y kit de YouTube. Fecha: 2026-11-16.
>
> **Nivel de verificación:**
> - ✅ **Verificado:** comprobado en el PDF oficial durante esta revisión (por ahora solo el P2N2222A/D Rev. 7 de onsemi).
> - ⚠️ **Muy probable:** dato conocido de la hoja del fabricante, pero **hay que abrir el PDF y confirmarlo** antes de corregir.
> - 🔍 **Por verificar:** hay dudas razonables y hace falta la hoja oficial.
>
> **Tipo de arreglo:**
> - **Pantalla:** el error está en `TEXTOS_*` o `DATASHEET_*`. Basta con volver a renderizar, sin regenerar la voz.
> - **Voz:** el error está en `GUION_*`. Hay que regenerar el audio con ElevenLabs y luego renderizar.

---

## 1. El error de fondo: ejemplos que superan los límites del propio componente

Es el fallo que más daña la credibilidad, porque cualquier ingeniero lo detecta en segundos:

| Ep | Qué dice | Problema | Nivel |
|---|---|---|---|
| 03 | "BJT de potencia (**TIP31C** / Darlington) **a 10 A**" | El TIP31C está especificado para **3 A** continuos. | ⚠️ |
| 06 | "LM7805 de 12 a 5 V **a 2 A** → 14 W" | El 7805 llega a **1–1,5 A** según el fabricante, y 14 W en un TO-220 no es realista. | ⚠️ |
| 07 | DRV8833: "**2,0 A continuos** por canal" | TI especifica **1,5 A RMS** (2 A pico) por puente. | ⚠️ |
| 01 | "I_C máx. 800 mA" | El P2N2222A de onsemi indica **600 mA**. Ya está corregido en la web y en `guion.ts`; falta volver a renderizar. | ✅ |

**Regla nueva:** todo ejemplo numérico debe quedar **dentro** del rango del datasheet citado, y en la escena se muestra la página de donde sale.

---

## 2. Fallos por episodio

### Ep. 01 — Transistor 2N2222A (1:36 · Short 0:59)
| # | Fallo | Tipo | Nivel | Corrección |
|---|---|---|---|---|
| 1 | Rótulo "I_C: 800 mA" en la intro | Pantalla | ✅ | Ya corregido a 600 mA → renderizar |
| 2 | Cierre: "miles de millones **de ellos** forman cada procesador" | Voz | ⚠️ | Los procesadores modernos usan transistores **MOSFET (CMOS)**, no BJT. Reescribir: "Sus primos, los MOSFET, se cuentan por miles de millones en cada procesador". |
| 3 | Circuito: "una pequeña corriente de base… una corriente **mucho mayor**", pero los rótulos dicen I_B ≈ 8,3 mA e I_C ≈ 20 mA (solo 2,4 veces más) | Pantalla | ✅ | Ajustar R_B para I_B ≈ 2 mA (saturación con β forzada = 10), o cambiar la frase. |
| 4 | "0.7 V" presentado como dato del datasheet | Pantalla | ✅ | El datasheet da **V_BE(sat) 0,6–1,2 V**. Mostrar "≈ 0,7 V (aprox.)". |
| 5 | El intro en inglés es otro guion (no tiene el gancho del "oro puro") | Voz (EN) | ✅ | Adaptar el gancho del español. |

### Ep. 02 — Relé Omron G5LE (2:07 · Short 1:21)
| # | Fallo | Tipo | Nivel | Corrección |
|---|---|---|---|---|
| 1 | Bobina de 5 V: "70 Ω · 71,4 mA · 360 mW" | Voz + pantalla | 🔍 | Según recuerdo, la versión estándar de 5 V es de **~63 Ω / 79,4 mA / 400 mW**. Confirmar el sufijo exacto en el PDF de Omron. |
| 2 | Contactos "10 A @ 250 VAC" | Pantalla | 🔍 | Confirmar: suele especificarse 10 A @ 125 VAC y menos a 250 VAC según la carga. |
| 3 | Pico de **−320 V en el colector** del 2N2222A | Voz + pantalla | ⚠️ | En el colector el pico es **positivo** (por encima de VCC) y el transistor entra en avalancha mucho antes, cerca de su V_CBO de 75 V. Los 300 V solo aparecerían sobre una bobina sin carga. Mostrar "el pico se recorta en la ruptura del transistor y lo daña". |
| 4 | "Con diodo: 5,7 V" | — | ✅ | Correcto (VCC + V_F). |
| 5 | El cierre menciona relés de estado sólido (SSR), pero no aparecen en el video | Voz | — | Quitarlos o mostrarlos. |

### Ep. 03 — MOSFET IRFZ44N (2:19 · Short 1:31)
| # | Fallo | Tipo | Nivel | Corrección |
|---|---|---|---|---|
| 1 | TIP31C a 10 A | Pantalla | ⚠️ | Usar un BJT de 10 A real (p. ej. TIP3055 / 2N3055) o comparar a 3 A. |
| 2 | 17,5 mΩ usado como resistencia en caliente | Voz + pantalla | ⚠️ | 17,5 mΩ es a **25 °C**; en caliente R_DS(on) sube cerca de 1,5–1,8×. Agregar "a 25 °C" o mostrar la curva. |
| 3 | "Cero corriente continua de control" | Voz | ⚠️ | Son nanoamperios de fuga (I_GSS): decir "prácticamente cero". |
| 4 | El capítulo del kit dice "0,16 W vs 1,2 W" y "mito V_GS(th)" en la escena que no corresponde | Kit YT | ✅ | Generar los capítulos desde el guion (ver la sección 3). |
| 5 | Short de **1:31** | — | ✅ | Rehacerlo como 3 Shorts. |

### Ep. 04 — Capacitor (2:01 · Short 1:20)
| # | Fallo | Tipo | Nivel | Corrección |
|---|---|---|---|---|
| 1 | "Cae a cero **cien** veces por segundo" | Voz | ✅ | Solo vale para una red de **50 Hz**. En México, Colombia y Venezuela (60 Hz) son **120**. Decir "100 o 120 veces, según tu red". |
| 2 | ESR "0,18 Ω @ 100 kHz" y "MLCC 0,01 Ω" sin la serie concreta | Pantalla | 🔍 | Citar la serie exacta de Nichicon y Murata y su página. |
| 3 | El intro mezcla electrolítico, cerámico y tántalo sin un problema central | Voz | — | Es una mejora de formato, no un error. |

### Ep. 05 — Diodo (2:11 · Short 1:23)
| # | Fallo | Tipo | Nivel | Corrección |
|---|---|---|---|---|
| 1 | "El 1N4007 pierde 0,7 V" | Voz + pantalla | ⚠️ | El datasheet da **V_F máx. 1,1 V @ 1 A**. 0,7 V solo vale a corrientes bajas. Mostrar ambos valores. |
| 2 | "El Schottky 1N5819 cae **0,25 V**" | Voz + pantalla | ⚠️ | A 1 A el máximo es cerca de **0,6 V**. 0,25 V es a corriente muy baja. **Es el error típico contra máximo que prometimos evitar.** |
| 3 | t_rr del 1N4007 "≈ 30 µs" | Pantalla | 🔍 | Varía según el fabricante; muchas hojas no lo especifican. Citar la fuente o quitarlo. |
| 4 | "Schottky < 5 ns, instantáneo" | Pantalla | ⚠️ | No tiene recuperación por portadores minoritarios, pero sí capacitancia. Decir "sin tiempo de recuperación inversa". |
| 5 | 1N4733A: 5,1 V ±5 % @ 49 mA | — | ⚠️ | Parece correcto; confirmarlo y agregar la página. |

### Ep. 06 — Inductor (2:10 · Short 1:21)
| # | Fallo | Tipo | Nivel | Corrección |
|---|---|---|---|---|
| 1 | "La inductancia **cae a cero** y actúa como un **cortocircuito**" | Voz | ✅ | Cae bruscamente; la corriente sube muy rápido y limita la resistencia del cobre. Reescribir. |
| 2 | LM7805 a 2 A | Pantalla + voz | ⚠️ | Rehacer el ejemplo a **1 A**: 7 W de calor contra ≈ 0,5 W en el buck. |
| 3 | "92 % de eficiencia" sin decir de qué convertidor | Pantalla | 🔍 | Citar el chip (p. ej. MP1584 o LM2596) y su curva de eficiencia. |
| 4 | Toroide: "EPCOS **B82722A**" en el video y "**B82622**" en la web | Pantalla + web | ✅ | Son números distintos. Confirmar cuál es el modelo 3D real y unificarlo. |
| 5 | SRR1260-330M: I_rms 3,0 A, I_sat 3,5 A, DCR 39 mΩ | Pantalla | 🔍 | Confirmar en la hoja de Bourns. |

### Ep. 07 — Puente H (1:48 · Short 1:09)
| # | Fallo | Tipo | Nivel | Corrección |
|---|---|---|---|---|
| 1 | DRV8833: "2,0 A continuos" | Pantalla | ⚠️ | **1,5 A RMS, 2 A pico** por puente. |
| 2 | "Cuatro transistores bipolares" | Voz | ✅ | El L298N trae **dos** puentes (8 transistores). Decir "cada puente tiene cuatro". |
| 3 | "2,5 W en calor" presentado como dato exacto | Pantalla | ⚠️ | Con la caída de 1,8–3,2 V @ 1 A salen **1,8–3,2 W**. Mostrar el rango o "≈ 2,5 W típico". |
| 4 | No dice que el DRV8833 solo admite **hasta 10,8 V** | Voz | ⚠️ | El cierre lo insinúa ("12 a 35 V para el L298N"); conviene decirlo explícitamente. |

---

## 3. Fallos que se repiten en todos los episodios

1. **Los Shorts no son Shorts:** duran 59–91 s y son recortes del largo (ver `PLAN-GUIONES.md`).
2. **Ningún número muestra su fuente en pantalla.** Falta el sello "Datasheet · pág. X", que ahora es el diferenciador.
3. **Se confunde típico con máximo** (diodos, V_BE). Cada rótulo debe decir "típ." o "máx." y la condición.
4. **Los capítulos de YouTube están escritos a mano** en `generar-kit-youtube.ts` y no coinciden con lo que se dice.
5. **Los guiones tienen la misma plantilla y las mismas frases** ("Si abrimos…", "Desde el X… hasta el Y…").
6. **Las versiones en inglés** existen solo para 01–03, y la del 01 tiene otro gancho.
7. **Las imágenes de la web** son fotogramas con subtítulos incrustados.

---

## 4. Plan de corrección (en orden)

### Ola 1 — Sin regenerar voz (barato, esta semana)
1. Abrir los PDF oficiales y confirmar todos los ⚠️ y 🔍. Guardar cada dato como `{valor, condición, fuente, página}` en `DATASHEET_*`.
2. Corregir `TEXTOS_*` y `DATASHEET_*`: 600 mA (01), I_B/I_C (01), TIP31C (03), "a 25 °C" (03), V_F típ./máx. (05), LM7805 a 1 A (06), toroide (06) y DRV8833 1,5 A (07).
3. Agregar a `HudIngenieria` / `CotaSenal` el sello de fuente en pantalla.
4. Volver a renderizar los 7 largos.
5. **Si los videos ya están publicados:** YouTube no permite cambiar el archivo de un video. Publicar un **comentario fijado con la fe de erratas** y una sección "Correcciones" en la descripción. Si el error es grave (01, 05), conviene volver a subir el video corregido y dejar el antiguo oculto.

### Ola 2 — Con voz nueva (afecta la narración)
6. Reescribir solo las frases con error: 01 (procesador), 02 (pico en el colector), 04 (100/120 Hz), 05 (V_F), 06 (saturación y 7805) y 07 (cuatro transistores). Así ElevenLabs regenera solo esas escenas, gracias a la caché por hash.
7. Generar los capítulos de YouTube desde el guion.

### Ola 3 — Formato nuevo
8. Rehacer los Shorts: 3 por episodio, de 30–45 s, con guion propio.
9. Rehacer los largos con el formato "Problema → Autopsia → Decisión" a medida que se completen los kits verificados (empezando por el 07, que ya tiene la mejor base).

**Prioridad si solo hay tiempo para tres:** Ep. 05 (V_F del Schottky, el error que más se repite en la red), Ep. 03 (TIP31C a 10 A) y Ep. 01 (600 mA y "procesadores de BJT"). Son los que primero corregiría alguien en los comentarios.
