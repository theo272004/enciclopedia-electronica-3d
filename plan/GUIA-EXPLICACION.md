# Guía de explicación: entender cómo funciona por dentro

> **Propuesta de valor del canal:** *"Entiende de verdad cómo funciona cada componente: desde el átomo hasta el datasheet, con el componente real abierto en 3D."*
>
> La referencia es la **claridad didáctica** de canales como The Engineering Mindset ("Mentalidad de Ingeniería"). La idea es tomar sus **principios de enseñanza**, no su aspecto: nada de fondo de plano azul cuadriculado, tipografía tipo cómic ni paleta amarilla y blanca. Nuestra identidad visual es otra: estudio 3D, PCB real, autopsias y datasheet.
>
> Este documento **va antes** que `PLAN-GUIONES.md` y `AUDITORIA-EPISODIOS.md`. Los otros dos dicen *qué* contar y *qué* corregir; este dice *cómo enseñarlo*.

---

## 1. Por qué funciona la referencia (análisis de los 7 fotogramas)

| Fotograma | Principio | Qué nos falta hoy |
|---|---|---|
| Átomo con núcleo, capas y electrones | **Empieza desde cero.** No da nada por sabido. | Arrancamos en la autopsia: quien no sabe qué es un semiconductor se pierde en el segundo 15. |
| Red de Si con átomos de P y "5 electrones en valencia" | **Una idea por plano**, con una sola etiqueta que aparece cuando se nombra. | Nuestros planos tienen 4 a 6 rótulos a la vez. |
| Bloque P / N y "Unión P-N" | **El mismo dibujo evoluciona.** La red pasa a ser un bloque y el bloque una unión. El espectador nunca pierde el hilo. | Saltamos entre escenas sin continuidad visual. |
| Región de agotamiento con puntos que se mueven | **El mecanismo se ve.** Los portadores se mueven y la zona se vacía. | Decimos "barrera de 0,7 V" pero nunca mostramos qué es. |
| PNP / NPN: bloques + símbolo | **Comparar dos casos lado a lado** con el mismo código de color. | Nunca explicamos el PNP ni por qué la flecha apunta a donde apunta. |
| Circuito: 5 mA + 20 mA = 25 mA | **Los números cuadran en pantalla** (I_E = I_B + I_C). El espectador comprueba la ley. | Ponemos corrientes sueltas (8,3 mA y 20 mA) sin relación visible. |
| "No todos usan esta configuración. Consulte la hoja de datos" | **Honestidad sobre los límites** de lo que se enseña. | Lo pusimos en la web, pero no en los videos. |

**La regla de fondo:** cada plano responde **una** pregunta, y la respuesta de un plano crea la pregunta del siguiente. Eso es la "fluidez".

---

## 2. La escalera de explicación (estructura de cada video largo)

Duración objetivo: **8–12 min**. Cada peldaño se apoya en el anterior. Nada aparece sin haber sido explicado antes.

| Peldaño | Pregunta que responde | Tiempo | Tipo de plano dominante |
|---|---|---|---|
| **0. Para qué** | ¿Dónde lo he visto y qué problema resuelve? | 0:00–0:40 | Objeto real (3D o foto) + caso cotidiano |
| **1. El material** | ¿De qué está hecho y por qué ese material? | 0:40–2:30 | Diagrama 2D animado: átomo, red cristalina, dopaje |
| **2. El mecanismo** | ¿Qué pasa por dentro cuando funciona? | 2:30–5:00 | Diagrama 2D animado: unión, portadores, campo |
| **3. La pieza real** | ¿Cómo se ve eso en el componente que compro? | 5:00–6:15 | **Autopsia 3D** (nuestro diferenciador) |
| **4. El símbolo y el circuito** | ¿Cómo lo conecto y qué corrientes circulan? | 6:15–8:00 | Esquema 2D + circuito 3D con corrientes que cuadran |
| **5. Los límites** | ¿Hasta dónde aguanta? ¿Qué dice el datasheet? | 8:00–9:15 | Tabla y gráfica del datasheet con sello de página |
| **6. El error real** | ¿Cómo se rompe en la práctica? | 9:15–10:15 | Multímetro u osciloscopio + SFX |
| **7. Resumen visual** | ¿Qué me llevo? | 10:15–10:45 | Un solo diagrama que reúne los peldaños 1–4 |

El Short sale de **un solo peldaño** (el 2, el 3 o el 6), nunca de un resumen de todos.

---

## 3. Gramática visual

### Ritmo
- **Cambio de plano o de estado visual cada 3–6 s.** No siempre es un corte: puede ser un zoom, una etiqueta nueva o un elemento que se mueve.
- **La palabra dispara la imagen.** Ya existe el sistema de `MARCAS` (sincronía por palabra): hay que usarlo en *cada* sustantivo técnico, no solo en 3 o 4 por escena.
- **Máximo 2 etiquetas nuevas en pantalla al mismo tiempo.** Las anteriores se atenúan al 40 %.
- **Tras un concepto difícil, 1–2 s sin texto nuevo** para que el espectador lo asimile.

### Tipos de plano
| Código | Plano | Herramienta |
|---|---|---|
| **P3D** | Componente real en 3D (PCB, macro, DoF) | `Estudio`, `EncapsuladoKiCad` |
| **AUT** | Autopsia por capas | `TransistorAutopsia`, etc. |
| **ZT** | **Zoom de transición**: de la pieza al cristal y de ahí al átomo | **Nuevo**: `ZoomEscalas` |
| **D2** | Diagrama 2D animado (física) | **Nuevos**: `Atomo`, `RedCristalina`, `UnionPN` |
| **ESQ** | Esquema eléctrico con corrientes | **Nuevo**: `EsquemaCorrientes` |
| **DS** | Datasheet: tabla o curva con sello de página | `Regiones` (adaptar) |
| **MED** | Medición: multímetro u osciloscopio | `MultimetroVivo` |
| **COMP** | Comparación lado a lado (NPN/PNP, Si/Schottky) | **Nuevo**: `LadoALado` |

**El plano estrella del canal es el ZT:** la cámara entra en la autopsia 3D, atraviesa el die y aterriza en el diagrama 2D de la red cristalina. Une nuestro diferenciador (3D real) con la explicación científica, y en español casi nadie lo hace.

### Código de color fijo para toda la serie
Se define una vez en `estilo.ts` y no cambia nunca. El espectador aprende a leerlo.

| Elemento | Uso |
|---|---|
| Electrones (portador negativo) | Un color frío, siempre el mismo |
| Huecos (portador positivo) | Un color cálido contrastante, dibujado como círculo hueco |
| Región P / región N | Dos tonos suaves de fondo, distintos de los portadores |
| Zona de agotamiento | Neutro, semitransparente |
| Corriente convencional | Flechas sólidas |
| Flujo de electrones | Puntos en movimiento, en sentido contrario a las flechas |

### Movimiento
- La cámara **siempre se mueve un poco** (como ya hace `Camara`), pero sin girar sin motivo.
- Usar animación para **mostrar causa y efecto**, no para decorar: si algo se mueve, debe significar algo físico.

---

## 4. Rigor científico (para que la claridad no sea a costa de la verdad)

Las explicaciones didácticas suelen simplificar de más. Nuestro valor es **simplificar y avisar que es una simplificación**:

| Tema | Simplificación habitual | Cómo decirlo bien |
|---|---|---|
| Átomo de Bohr | "Los electrones giran en órbitas" | "Es un modelo simplificado: sirve para contar electrones de valencia". |
| Huecos | "Un hueco es una partícula positiva" | "Es la ausencia de un electrón, y se comporta *como* una carga positiva que se mueve". |
| Zona de agotamiento | "Una barrera que bloquea" | Mostrar la difusión, los iones fijos que quedan y el campo eléctrico que frena más difusión. |
| 0,7 V | "El transistor se activa a 0,7 V" | "En el silicio, la unión conduce con fuerza alrededor de 0,6–0,7 V. Es aproximado, y el datasheet da un rango". |
| Base delgada | "La corriente pasa por la base" | Los electrones inyectados por el emisor **cruzan la base por difusión** antes de recombinarse, porque es muy delgada y poco dopada. Por eso la corriente de base es pequeña. |
| Sentido de la corriente | Mezclar los dos sentidos | Decir siempre cuál se dibuja: convencional (+ → −) o electrones (− → +). |
| Ganancia β | "Multiplica la corriente" | "Controla: la corriente de colector *depende* de la de base. No se crea energía; viene de la fuente". |

Cada simplificación lleva un pequeño rótulo **"modelo simplificado"** en pantalla. Da confianza.

---

## 5. Cambios en el pipeline

1. **Del "guion por escena" al "guion por planos".** Hoy cada escena es un texto largo con 3–4 marcas. Pasa a ser:
   ```ts
   type Plano = {
     id: string;
     texto: string;          // 1–2 frases de narración
     tipo: "P3D" | "AUT" | "ZT" | "D2" | "ESQ" | "DS" | "MED" | "COMP";
     visual: string;         // qué componente y en qué estado
     marcas?: Record<string, string>; // palabra → evento
     fuente?: string;        // "P2N2222A/D Rev.7 pág. 2" si muestra un dato
   };
   ```
   La voz se genera por plano (la caché por hash ya lo permite) y la duración del plano sale del audio.
2. **Escenas propias por episodio.** Las 6 escenas compartidas (`src/escenas/*.tsx`) pasan a ser una **librería de planos reutilizables**, y cada episodio arma su propia secuencia.
3. **Componentes nuevos (por prioridad):**
   1. `RedCristalina`: rejilla de Si con dopantes P/B, electrones de valencia y un electrón libre o un hueco que aparece.
   2. `UnionPN`: difusión de portadores, iones fijos, zona de agotamiento que se ensancha o estrecha con la polarización.
   3. `EsquemaCorrientes`: esquema 2D con etiquetas que suman (I_E = I_B + I_C) y flechas que muestran ambos sentidos.
   4. `ZoomEscalas`: transición de la autopsia 3D al die y a la red 2D.
   5. `Atomo`: modelo de capas para el silicio (14 electrones; 4 de valencia).
   6. `LadoALado`: dos diagramas sincronizados (NPN/PNP, Si/Schottky/Zener).
4. **Reutilización entre episodios:** `RedCristalina` y `UnionPN` sirven para el diodo, el transistor, el MOSFET y el LED. Se construyen una vez y alimentan toda la serie.

---

## 6. Ejemplo: Ep. 01 Transistor rehecho como guion de planos (≈ 10 min)

> Narración resumida. Cada fila es un plano o un cambio de estado. **[F]** = dato con fuente en pantalla.

### Peldaño 0 — Para qué (0:00–0:40)
| t | Narración | Plano | Visual |
|---|---|---|---|
| 0:00 | "Este componente de pocos centavos decide si un LED se enciende… con una corriente diez veces más pequeña que la que controla." | P3D | Macro del TO-92 en la PCB, LED apagado |
| 0:06 | "Pulsas el botón: entran 2 miliamperios por aquí…" | P3D | Pulsador baja; flujo pequeño hacia la base |
| 0:10 | "…y por aquí pasan 20." | P3D | LED se enciende; flujo grande en colector |
| 0:14 | "¿Cómo puede una corriente pequeña controlar una grande? Para entenderlo hay que bajar hasta el átomo." | ZT | Zoom de la cámara hacia el encapsulado |

### Peldaño 1 — El material (0:40–2:30)
| t | Narración | Plano | Visual |
|---|---|---|---|
| 0:40 | "Dentro hay un trocito de silicio." | AUT → ZT | Autopsia, la cámara entra en el die |
| 0:46 | "Un átomo de silicio tiene 4 electrones en su capa externa." | D2 | `Atomo` Si; se resaltan los 4 de valencia · rótulo "modelo simplificado" |
| 0:55 | "Se une con 4 vecinos compartiendo esos electrones: forma un cristal." | D2 | `RedCristalina` se arma átomo a átomo |
| 1:05 | "En el cristal puro casi no hay electrones libres: conduce muy mal." | D2 | Red quieta; medidor de conductividad bajo |
| 1:15 | "Ahora reemplazamos algunos átomos por fósforo, que tiene 5." | D2 | Átomos de P entran en la red |
| 1:25 | "El quinto electrón sobra y queda libre. Esto es silicio tipo N." | D2 | Electrón libre se suelta y se mueve |
| 1:40 | "Si en cambio usamos boro, que tiene 3, falta un electrón: queda un hueco." | D2 | Átomo de B; aparece el hueco |
| 1:52 | "Un electrón vecino salta a ese hueco… y el hueco parece moverse al revés. Esto es silicio tipo P." | D2 | Animación del salto; rótulo "el hueco es la ausencia de un electrón" |
| 2:10 | "Tipo N: sobran electrones. Tipo P: faltan. ¿Qué pasa si los juntamos?" | COMP | Dos bloques lado a lado |

### Peldaño 2 — El mecanismo (2:30–5:00)
| t | Narración | Plano | Visual |
|---|---|---|---|
| 2:30 | "En la frontera, los electrones de N cruzan a llenar huecos de P." | D2 | `UnionPN`: difusión |
| 2:42 | "Al cruzar dejan átomos con carga fija a cada lado." | D2 | Iones fijos (+ en N, − en P) |
| 2:52 | "Esas cargas crean un campo que frena el paso: la zona de agotamiento." | D2 | Zona se vacía; aparece el campo |
| 3:05 | "Para cruzarla hay que empujar con unos 0,6–0,7 voltios en el silicio." | D2 + DS | Polarización directa; zona se estrecha · **[F]** V_BE(sat) 0,6–1,2 V |
| 3:25 | "Un transistor NPN son dos uniones espalda con espalda: N, P, N." | D2 | Bloque N-P-N; etiquetas E, B, C |
| 3:40 | "El truco está en la base: es finísima y está poco dopada." | D2 + ZT | Base se estrecha; inserto de la autopsia real |
| 3:55 | "Al polarizar la unión base-emisor, el emisor inyecta electrones en la base…" | D2 | Electrones entran a la base |
| 4:10 | "…pero la base es tan delgada que casi todos la cruzan antes de encontrar un hueco." | D2 | La mayoría cruza; pocos se recombinan |
| 4:25 | "Los atrapa el campo del colector. Solo unos pocos salen por la base." | D2 | Flujo grande al colector, pequeño a la base |
| 4:40 | "Por eso la corriente de base controla la de colector: abre la puerta, y la energía la pone la fuente." | D2 | Rótulo "control, no amplificación de energía" |

### Peldaño 3 — La pieza real (5:00–6:15)
| t | Narración | Plano | Visual |
|---|---|---|---|
| 5:00 | "Esto es lo que acabamos de dibujar, dentro del encapsulado real." | AUT | Autopsia TO-92 completa |
| 5:12 | "El die de silicio sobre la paleta del colector…" | AUT | Capa colector |
| 5:22 | "…y los hilos de unión que conectan base y emisor." | AUT | Hilos resaltados |
| 5:35 | "Las patas: emisor, base, colector, en este orden para el P2N2222A de onsemi." | P3D | Pinout · **[F]** pág. 1 · "otras marcas cambian el orden: revisa la hoja" |
| 5:55 | "Y la versión de montaje superficial: misma idea, mucho más pequeña." | P3D | SOT-23 al lado del TO-92 |

### Peldaño 4 — Símbolo y circuito (6:15–8:00)
| t | Narración | Plano | Visual |
|---|---|---|---|
| 6:15 | "En el esquema, la flecha está en el emisor y apunta hacia afuera: es un NPN." | ESQ | Símbolo, flecha resaltada |
| 6:25 | "La flecha marca el sentido de la corriente convencional en la unión base-emisor." | ESQ | Flecha y unión alineadas |
| 6:40 | "En el PNP todo se invierte: la flecha entra y las corrientes cambian de sentido." | COMP | NPN / PNP lado a lado |
| 7:00 | "Volvamos al circuito: 2 mA en la base, 20 en el colector…" | ESQ | `EsquemaCorrientes` |
| 7:12 | "…y por el emisor salen las dos juntas: 22 miliamperios." | ESQ | Suma animada **I_E = I_B + I_C** |
| 7:25 | "La resistencia de base no es opcional: sin ella, la base es un diodo directo a tu microcontrolador." | ESQ | Cálculo R_B paso a paso |

### Peldaño 5 — Límites (8:00–9:15)
| t | Narración | Plano | Visual |
|---|---|---|---|
| 8:00 | "El datasheet dice hasta dónde llega." | DS | Ficha técnica **[F]** P2N2222A/D Rev. 7 |
| 8:10 | "40 V entre colector y emisor, 600 mA continuos, 625 mW de disipación." | DS | Tres filas resaltadas **[F]** pág. 1 |
| 8:30 | "Y la ganancia no es un número fijo: entre 100 y 300 a 150 mA, y menos a otras corrientes." | DS | Tabla h_FE **[F]** pág. 2 |
| 8:50 | "Por eso, para usarlo como interruptor, no confíes en β: fuerza una base de una décima de la corriente de colector." | DS | Condición V_CE(sat) **[F]** pág. 2 |

### Peldaño 6 — Error real (9:15–10:15)
| t | Narración | Plano | Visual |
|---|---|---|---|
| 9:15 | "Si la base no recibe suficiente corriente, el transistor queda a medias…" | MED | V_CE alto en el multímetro |
| 9:30 | "…y toda esa caída por la corriente se convierte en calor." | MED | P = V_CE · I_C; termómetro sube |
| 9:50 | "Saturado, cae 0,3 V como máximo y apenas se calienta." | MED | V_CE(sat) **[F]** |

### Peldaño 7 — Resumen (10:15–10:45)
| t | Narración | Plano | Visual |
|---|---|---|---|
| 10:15 | "Del átomo al circuito: dopaje, unión, base delgada y la corriente pequeña que controla la grande." | D2 + P3D | Diagrama único que recorre los peldaños |
| 10:35 | "En el próximo: su primo controlado por voltaje, el MOSFET." | P3D | Gancho al Ep. 03 |

**Shorts que salen de aquí:** "Por qué la base es tan delgada" (peldaño 2), "Lo que hay dentro de un 2N2222" (peldaño 3) y "Por qué se calienta tu transistor" (peldaño 6).

---

## 7. Identidad visual: "taller premium"

**Idea:** la electrónica como algo que apasiona. Un banco de trabajo real, con el desorden de quien construye cosas, presentado con la limpieza de un estudio. *Nerd cool*, no laboratorio frío ni tutorial escolar.

### Dos registros visuales que no se mezclan
| Registro | Para qué | Cómo se ve |
|---|---|---|
| **Energía: collage de taller** | Gancho, separadores entre peldaños, cierre, miniaturas, Shorts, hero de la web | Capas de fotos que se superponen: manos soldando, protoboards, osciloscopio, código en pantalla, nuestros renders 3D y recortes de esquemas KiCad y datasheets |
| **Claridad: diagrama limpio** | Peldaños 1–5 (física, circuito, datasheet) | Fondo neutro, el código de color de la sección 3, una idea por plano |

El collage **emociona**; el diagrama **enseña**. Si el collage aparece mientras se explica la unión P-N, distrae. Por eso cada uno tiene su momento.

### Reglas del collage (para que se vea premium y no "hecho con IA")
1. **Mezcla de fuentes:** como máximo un 50 % de fotos de banco. El resto es **material propio**: renders de nuestras autopsias, capturas de KiCad, la curva del datasheet y la lectura del multímetro. Eso lo vuelve original e imposible de copiar.
2. **Tratamiento uniforme:** misma gradación de color en todas las fotos (un poco desaturadas, sombras frías y un único acento de color), grano fino y viñeta suave. Fotos de bancos distintos se ven como una sola sesión.
3. **Composición:** 5–9 piezas por collage, con un **protagonista claro** (el componente del episodio) y el resto como contexto. Recortes con esquinas suaves y sombra corta; nada de cinta adhesiva ni papel rasgado, que se ve infantil.
4. **Movimiento:** las piezas entran escalonadas (80–120 ms entre una y otra) con un parallax leve. Duración total de 2–4 s. Nunca un collage estático de más de 5 s.
5. **Prohibido:** fotos de personas posando o sonriendo a cámara, "manos con guantes y tubo de ensayo", circuitos falsos con luces azules, y cualquier imagen generada por IA de una placa (los ingenieros detectan las pistas imposibles).

### La pieza más original: tu propio banco
Las fotos de banco sirven para empezar, pero lo que hace único al canal es **grabar tu propio taller con el celular**: manos soldando, la punta del multímetro tocando el colector o el LED encendiéndose. Además, es el material que exige el sello 🔬 **Medido** (ver `PLAN-GUIONES.md`). Diez minutos de b-roll propio por episodio valen más que cien fotos de banco.

### Bancos gratuitos y cómo se usan
| Banco | Qué aporta | Licencia (resumen; leer la vigente) | Uso en el pipeline |
|---|---|---|---|
| **Wikimedia Commons** ★ | Fotos **reales** de componentes y ***die shots*** al microscopio (p. ej. ZeptoBars) | Varía por archivo. El script solo acepta **CC0, dominio público y CC BY** | `npm run broll -- "consulta" fotos N wikimedia` · **no necesita clave** |
| **Pixabay** | Fotos **y videos** de taller (b-roll en movimiento) | Pixabay Content License: uso libre en video, también comercial; no redistribuir los originales tal cual | `... pixabay` con `PIXABAY_API_KEY` (clave gratuita al registrarse) |
| **Unsplash** | Las mejores fotos de escritorio y taller | Unsplash License; la API exige dar crédito y avisar cada descarga (el script lo hace) | `... unsplash` con `UNSPLASH_ACCESS_KEY` |
| ~~Pexels~~ | — | **Pausó la emisión de claves nuevas** (noviembre de 2026). El soporte queda en el script por si se reabre | `PEXELS_API_KEY` |

**Por qué el script descarta CC BY-SA:** en Wikimedia es la licencia más común, pero si la imagen se sincroniza con un video, el video puede considerarse obra derivada y tendría que publicarse bajo CC BY-SA. Solo se incluye con `--sa` y después de decidirlo de forma consciente.

**Hallazgo para el Ep. 01:** con `npm run broll -- "zeptobars transistor die" fotos 4 wikimedia` aparece la foto al microscopio del die del **MMBT2222A de onsemi** (ZeptoBars, CC BY 3.0). En ella se ven los dedos entrelazados de emisor y base y las zonas de soldadura de los hilos. Es la pieza perfecta para el plano ZT: autopsia 3D → foto real del die → red cristalina. También **corrige nuestra autopsia**: el transistor real es **planar** (emisor y base arriba, colector como sustrato), no tres capas apiladas como en el corte de Blender. Hay que mostrarlo así o rotularlo como "modelo simplificado".

`scripts/buscar-broll.ts` guarda todo en `public/broll/<tema>/`, que está fuera de Git porque las licencias no permiten redistribuir los originales en un repositorio público, junto con un `creditos.json` (autor, página y licencia) para pegar en la descripción del video. CC BY exige ese crédito.

**Consultas que funcionan** (en inglés): `electronics workbench`, `soldering iron macro`, `oscilloscope`, `breadboard circuit`, `circuit board macro`, `multimeter`, `arduino`, `engineer desk night`, `code on screen dark`, `robot arm prototype`.

### Componente nuevo para Remotion
`CollageTaller`: recibe una lista de piezas (`{src, x, y, ancho, rot, z}`), aplica la gradación común, el grano y la viñeta, y anima la entrada escalonada con parallax. Las piezas propias (renders, capturas de KiCad, datasheet) y las de banco usan el mismo tratamiento.

---

## 8. Orden de trabajo sugerido
1. Definir el código de color en `estilo.ts`.
2. Construir `RedCristalina` y `UnionPN` (sirven para 4 episodios).
3. Pasar el modelo de datos a "guion por planos" y hacer `EsquemaCorrientes`.
4. Producir el Ep. 01 completo con este guion de planos como piloto, y medir retención frente al actual.
5. Construir `ZoomEscalas` y aplicarlo al resto de episodios.
