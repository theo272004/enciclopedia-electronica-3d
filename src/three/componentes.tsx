import { RoundedBox, useGLTF } from "@react-three/drei";
import React, { useMemo } from "react";
import { staticFile } from "remotion";
import * as THREE from "three";
import { texturaTexto } from "./textura-texto";

// ---------- Materiales PBR de Estudio ----------
export const MAT = {
  cobre: new THREE.MeshPhysicalMaterial({ color: "#c7834a", metalness: 1, roughness: 0.26, clearcoat: 0.4 }),
  oro: new THREE.MeshPhysicalMaterial({ color: "#f2c45a", metalness: 1, roughness: 0.2, clearcoat: 0.5 }),
  estano: new THREE.MeshStandardMaterial({ color: "#d9dee5", metalness: 1, roughness: 0.22 }),
  aluminio: new THREE.MeshPhysicalMaterial({ color: "#c4cbd4", metalness: 0.95, roughness: 0.28 }),
  placa: new THREE.MeshLambertMaterial({ color: "#0b2633" }),
  resina: new THREE.MeshPhysicalMaterial({ color: "#121418", roughness: 0.38, clearcoat: 0.25 }),
  ceramica: new THREE.MeshPhysicalMaterial({ color: "#d8c49b", roughness: 0.42, clearcoat: 0.4 }),
  negro: new THREE.MeshStandardMaterial({ color: "#0c0d10", roughness: 0.55 }),
};

export type P2 = [number, number]; // (x, z) en el plano de la placa
export const ALTO_PLACA = 0.08;

// ---------- Placa PCB ----------
export const Placa: React.FC<{ ancho: number; fondo: number; x?: number; z?: number }> = ({
  ancho,
  fondo,
  x = 0,
  z = 0,
}) => (
  <RoundedBox args={[ancho, 0.16, fondo]} radius={0.06} smoothness={4} position={[x, 0, z]} receiveShadow>
    <primitive object={MAT.placa} attach="material" />
  </RoundedBox>
);

// ---------- Pista de cobre (polilínea) ----------
export const Pista: React.FC<{ puntos: P2[]; ancho?: number }> = ({ puntos, ancho = 0.22 }) => (
  <>
    {puntos.slice(1).map((b, i) => {
      const a = puntos[i];
      const dx = b[0] - a[0];
      const dz = b[1] - a[1];
      const largo = Math.hypot(dx, dz) + ancho;
      return (
        <mesh
          key={i}
          position={[(a[0] + b[0]) / 2, ALTO_PLACA + 0.015, (a[1] + b[1]) / 2]}
          rotation-y={-Math.atan2(dz, dx)}
          material={MAT.cobre}
          receiveShadow
        >
          <boxGeometry args={[largo, 0.03, ancho]} />
        </mesh>
      );
    })}
  </>
);

export const Pad: React.FC<{ p: P2; r?: number }> = ({ p, r = 0.2 }) => (
  <mesh position={[p[0], ALTO_PLACA + 0.02, p[1]]} material={MAT.oro} receiveShadow>
    <cylinderGeometry args={[r, r, 0.04, 32]} />
  </mesh>
);

// ---------- Serigrafía PCB ----------
export const Serigrafia: React.FC<{ texto: string; p: P2; tam?: number; rot?: number }> = ({
  texto,
  p,
  tam = 0.5,
  rot = 0,
}) => {
  const tex = texturaTexto([texto], { ancho: 512, alto: 128, tam: 92, color: "#e8eef5" });
  return (
    <mesh position={[p[0], ALTO_PLACA + 0.002, p[1]]} rotation={[-Math.PI / 2, 0, rot]}>
      <planeGeometry args={[tam * 4, tam]} />
      <meshStandardMaterial map={tex} transparent roughness={0.8} depthWrite={false} />
    </mesh>
  );
};

// ---------- Ruta 3D para electrones ----------
export const crearRuta = (puntos: P2[], y = ALTO_PLACA + 0.09) => {
  const ruta = new THREE.CurvePath<THREE.Vector3>();
  puntos.slice(1).forEach((b, i) => {
    const a = puntos[i];
    ruta.add(new THREE.LineCurve3(new THREE.Vector3(a[0], y, a[1]), new THREE.Vector3(b[0], y, b[1])));
  });
  return ruta;
};

const geoElectron = new THREE.SphereGeometry(1, 16, 12);

// Partículas emisivas (brillan con bloom) recorriendo una ruta. `t` = segundos.
export const Electrones: React.FC<{
  ruta: THREE.CurvePath<THREE.Vector3>;
  n: number;
  t: number;
  velocidad: number;
  color: string;
  radio: number;
  visible: number;
  brillo?: number;
}> = ({ ruta, n, t, velocidad, color, radio, visible, brillo = 6 }) => {
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(brillo), toneMapped: false }),
    [color, brillo],
  );
  const largo = useMemo(() => ruta.getLength(), [ruta]);
  if (visible <= 0.001) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const u = (((t * velocidad) / largo + i / n) % 1 + 1) % 1;
        const p = ruta.getPointAt(u);
        return <mesh key={i} geometry={geoElectron} material={mat} position={p} scale={radio * visible} />;
      })}
    </>
  );
};

// ---------- Patas formadas hacia los pads de la PCB ----------
const pataCurva = (desde: THREE.Vector3, hasta: THREE.Vector3, radio = 0.035) =>
  new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      desde,
      new THREE.Vector3(desde.x, desde.y - 0.16, desde.z),
      new THREE.Vector3(hasta.x, hasta.y + 0.25, hasta.z),
      hasta,
    ]),
    36,
    radio,
    12,
  );

// ---------- Transistor TO-92 Real (Modelo KiCad 9.0 + Grabado Láser Datasheet 2N2222A) ----------
export const Transistor: React.FC<{
  posicion: [number, number, number];
  separacion?: number;
  escala?: number;
}> = ({ posicion, separacion = 0.6, escala = 0.22 }) => {
  const gltf = useGLTF(staticFile("modelos/to92.glb"));
  const mallaEncapsulado = useMemo(() => {
    let geom: THREE.BufferGeometry | null = null;
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && child.name.startsWith("Encapsulado")) {
        geom = (child as THREE.Mesh).geometry;
      }
    });
    return geom;
  }, [gltf]);

  const baseY = 0.18;
  const patas = useMemo(
    () =>
      [-1, 0, 1].map((k) =>
        pataCurva(new THREE.Vector3(k * 1.27 * escala, baseY + 2.5 * escala, 0), new THREE.Vector3(k * separacion, ALTO_PLACA, 0)),
      ),
    [separacion, escala],
  );
  const marca = useMemo(
    () => texturaTexto(["P2N", "2222A", "E B C"], { ancho: 256, alto: 256, tam: 56, color: "#b8c4d4" }),
    [],
  );

  return (
    <group position={posicion}>
      {patas.map((g, i) => (
        <mesh key={i} geometry={g} material={MAT.estano} castShadow />
      ))}
      {mallaEncapsulado && (
        <mesh
          geometry={mallaEncapsulado}
          material={MAT.resina}
          position={[0, baseY, 0]}
          scale={escala}
          castShadow
          receiveShadow
        />
      )}
      {/* Grabado láser sobre la cara plana frontal del TO-92 (z = +1.33 mm * escala) */}
      <mesh position={[0, baseY + 4.9 * escala, 1.34 * escala + 0.004]}>
        <planeGeometry args={[3.2 * escala, 3.2 * escala]} />
        <meshStandardMaterial map={marca} transparent roughness={0.5} depthWrite={false} />
      </mesh>
    </group>
  );
};

// ---------- Autopsia 3D del Transistor (Modelo Booleano de Blender 5.0 + Silicio N-P-N + Hilos de Oro) ----------
export type CapaAutopsia = "todas" | "emisor" | "base" | "colector" | "hilos";

export const TransistorAutopsia: React.FC<{
  posicion?: [number, number, number];
  escala?: number;
  apertura: number; // 0 = cerrado, 1 = tapa desplazada mostrando el cristal de silicio
  resaltar?: CapaAutopsia;
  pulsoCorriente?: number; // 0..1 para brillar la unión
}> = ({ posicion = [0, 0, 0], escala = 0.45, apertura, resaltar = "todas", pulsoCorriente = 0 }) => {
  const gltf = useGLTF(staticFile("modelos/to92_autopsia.glb"));

  const partes = useMemo(() => {
    const mapa: Record<string, THREE.BufferGeometry> = {};
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        mapa[child.name] = (child as THREE.Mesh).geometry;
      }
    });
    return mapa;
  }, [gltf]);

  const matTapa = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#151920",
        roughness: 0.32,
        clearcoat: 0.3,
        transparent: true,
        opacity: Math.max(0.18, 1 - apertura * 0.72),
      }),
    [apertura],
  );

  const matSilicioN = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#1f9eff",
        metalness: 0.25,
        roughness: 0.18,
        emissive: new THREE.Color("#0d6efd"),
        emissiveIntensity: resaltar === "colector" ? 2.8 : 0.55 + pulsoCorriente * 1.4,
      }),
    [resaltar, pulsoCorriente],
  );

  const matSilicioP = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#ff9f1c",
        metalness: 0.2,
        roughness: 0.18,
        emissive: new THREE.Color("#ff8c00"),
        emissiveIntensity: resaltar === "base" ? 3.4 : 0.75 + pulsoCorriente * 1.8,
      }),
    [resaltar, pulsoCorriente],
  );

  const matSilicioNPlus = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#3de0ff",
        metalness: 0.3,
        roughness: 0.15,
        emissive: new THREE.Color("#00e5ff"),
        emissiveIntensity: resaltar === "emisor" ? 3.4 : 0.9 + pulsoCorriente * 1.6,
      }),
    [resaltar, pulsoCorriente],
  );

  const matHiloOro = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#ffd166",
        metalness: 1,
        roughness: 0.16,
        emissive: new THREE.Color("#ffb703"),
        emissiveIntensity: resaltar === "hilos" ? 2.5 : 0.2 + pulsoCorriente * 0.8,
      }),
    [resaltar, pulsoCorriente],
  );

  return (
    <group position={posicion} scale={escala}>
      {partes.Pines_Metal && <mesh geometry={partes.Pines_Metal} material={MAT.estano} castShadow />}
      {partes.Carcasa_Base && <mesh geometry={partes.Carcasa_Base} material={MAT.resina} castShadow receiveShadow />}

      {/* Tapa frontal cortada en Blender que se abre suavemente */}
      {partes.Carcasa_Corte && (
        <mesh
          geometry={partes.Carcasa_Corte}
          material={matTapa}
          position={[apertura * 2.1, apertura * 0.65, apertura * 2.6]}
          rotation={[apertura * -0.18, apertura * 0.32, 0]}
        />
      )}

      {/* Leadframe interno de cobre */}
      {["Leadframe_Poste_C", "Leadframe_Paleta_C", "Leadframe_Poste_B", "Leadframe_Poste_E"].map(
        (k) => partes[k] && <mesh key={k} geometry={partes[k]} material={MAT.cobre} castShadow />,
      )}

      {/* Pastilla de silicio N-P-N en 3 capas */}
      {partes.Die_Colector_N && <mesh geometry={partes.Die_Colector_N} material={matSilicioN} />}
      {partes.Die_Base_P && <mesh geometry={partes.Die_Base_P} material={matSilicioP} />}
      {partes.Die_Emisor_NPlus && <mesh geometry={partes.Die_Emisor_NPlus} material={matSilicioNPlus} />}

      {/* Hilos de enlace de oro (25 µm) */}
      {partes.Hilo_Oro_Base && <mesh geometry={partes.Hilo_Oro_Base} material={matHiloOro} />}
      {partes.Hilo_Oro_Emisor && <mesh geometry={partes.Hilo_Oro_Emisor} material={matHiloOro} />}
    </group>
  );
};

// ---------- Encapsulados Reales de KiCad 9.0 (TO-92, SOT-23, TO-220, Relés y Diodo) ----------
export type TipoModeloKiCad =
  | "to92"
  | "sot23"
  | "to220"
  | "rele_spdt"
  | "rele_dpdt"
  | "rele_smd"
  | "diodo_1n4007";

export const EncapsuladoKiCad: React.FC<{
  tipo: TipoModeloKiCad;
  posicion: [number, number, number];
  escala?: number;
  rotacionY?: number;
}> = ({ tipo, posicion, escala = 0.25, rotacionY = 0 }) => {
  const gltf = useGLTF(staticFile(`modelos/${tipo}.glb`));
  const mallas = useMemo(() => {
    const lista: { name: string; geometry: THREE.BufferGeometry }[] = [];
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        lista.push({ name: child.name, geometry: (child as THREE.Mesh).geometry });
      }
    });
    return lista;
  }, [gltf]);

  const matAzulRele = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#0e4d8a", roughness: 0.25, clearcoat: 0.5, transmission: tipo === "rele_dpdt" ? 0.45 : 0 }),
    [tipo],
  );

  return (
    <group position={posicion} scale={escala} rotation-y={rotacionY}>
      {mallas.map((m) => {
        let mat: THREE.Material = MAT.resina;
        if (m.name.startsWith("Pines")) mat = MAT.estano;
        else if (m.name.startsWith("Lente")) mat = MAT.cobre;
        else if (tipo === "rele_spdt" || tipo === "rele_dpdt") mat = matAzulRele;
        return <mesh key={m.name} geometry={m.geometry} material={mat} castShadow receiveShadow />;
      })}
    </group>
  );
};

// ---------- Autopsia 3D del Relé Electromecánico (Omron G5LE-1 en Blender 5.0) ----------
export type CapaRele = "todas" | "bobina" | "nucleo" | "armadura" | "contactos";

export const ReleAutopsia: React.FC<{
  posicion?: [number, number, number];
  escala?: number;
  apertura: number; // 0 = cerrado, 1 = carcasa abierta
  activado: number; // 0 = reposo en NC, 1 = energizado en NO
  resaltar?: CapaRele;
}> = ({ posicion = [0, 0, 0], escala = 0.16, apertura, activado, resaltar = "todas" }) => {
  const gltf = useGLTF(staticFile("modelos/rele_autopsia.glb"));
  const partes = useMemo(() => {
    const mapa: Record<string, THREE.BufferGeometry> = {};
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        mapa[child.name] = (child as THREE.Mesh).geometry;
      }
    });
    return mapa;
  }, [gltf]);

  const matCarcasa = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#0b3b6e", roughness: 0.28, clearcoat: 0.45 }),
    [],
  );
  const matTapa = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#0e4d8a",
        roughness: 0.25,
        clearcoat: 0.5,
        transparent: true,
        opacity: Math.max(0.15, 1 - apertura * 0.78),
      }),
    [apertura],
  );
  const matBobina = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#d97736",
        metalness: 0.9,
        roughness: 0.22,
        emissive: new THREE.Color("#ff8c00"),
        emissiveIntensity: (resaltar === "bobina" ? 1.8 : 0.2) + activado * 1.6,
      }),
    [resaltar, activado],
  );
  const matNucleo = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#7c8594",
        metalness: 0.95,
        roughness: 0.3,
        emissive: new THREE.Color("#3de0ff"),
        emissiveIntensity: resaltar === "nucleo" ? 1.6 : activado * 0.7,
      }),
    [resaltar, activado],
  );
  const matArmadura = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#f2c45a",
        metalness: 0.95,
        roughness: 0.18,
        emissive: new THREE.Color("#ffb547"),
        emissiveIntensity: resaltar === "armadura" ? 2.0 : 0.25,
      }),
    [resaltar],
  );
  const matContactos = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#f8fafc",
        metalness: 1,
        roughness: 0.12,
        emissive: new THREE.Color("#3de0ff"),
        emissiveIntensity: resaltar === "contactos" ? 2.4 : activado * 1.2,
      }),
    [resaltar, activado],
  );

  return (
    <group position={posicion} scale={escala}>
      {partes.Pines_Metal && <mesh geometry={partes.Pines_Metal} material={MAT.estano} castShadow />}
      {partes.Carcasa_Base && <mesh geometry={partes.Carcasa_Base} material={matCarcasa} castShadow receiveShadow />}
      {partes.Carcasa_Corte && (
        <mesh
          geometry={partes.Carcasa_Corte}
          material={matTapa}
          position={[apertura * 6.5, apertura * 2.2, apertura * 8.5]}
          rotation={[apertura * -0.15, apertura * 0.28, 0]}
        />
      )}
      {partes.Nucleo_Hierro && <mesh geometry={partes.Nucleo_Hierro} material={matNucleo} />}
      {partes.Yugo_Hierro && <mesh geometry={partes.Yugo_Hierro} material={matNucleo} />}
      {partes.Bobina_Cobre && <mesh geometry={partes.Bobina_Cobre} material={matBobina} />}
      {partes.Armadura_Movil && (
        <mesh
          geometry={partes.Armadura_Movil}
          material={matArmadura}
          position={[(activado - 0.5) * 1.4, -activado * 0.35, 0]}
          rotation={[0, 0, (activado - 0.5) * -0.09]}
        />
      )}
      {partes.Contacto_NC && <mesh geometry={partes.Contacto_NC} material={matContactos} />}
      {partes.Contacto_NO && <mesh geometry={partes.Contacto_NO} material={matContactos} />}
    </group>
  );
};

// ---------- Diodo Rectificador Flyback 1N4007 (Modelo KiCad DO-41) ----------
export const DiodoFlyback: React.FC<{
  desde: P2;
  hasta: P2;
  pulso?: number; // 0..1 brilla cuando absorbe el pico inductivo
}> = ({ desde, hasta, pulso = 0 }) => {
  const gltf = useGLTF(staticFile("modelos/diodo_1n4007.glb"));
  const mallas = useMemo(() => {
    const lista: { name: string; geometry: THREE.BufferGeometry }[] = [];
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        lista.push({ name: child.name, geometry: (child as THREE.Mesh).geometry });
      }
    });
    return lista;
  }, [gltf]);

  const cx = (desde[0] + hasta[0]) / 2;
  const cz = (desde[1] + hasta[1]) / 2;
  const largo = Math.hypot(hasta[0] - desde[0], hasta[1] - desde[1]);
  const ang = -Math.atan2(hasta[1] - desde[1], hasta[0] - desde[0]);
  const escala = largo / 10.16;

  const matCuerpo = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#14171c",
        roughness: 0.35,
        clearcoat: 0.4,
        emissive: new THREE.Color("#3de0ff"),
        emissiveIntensity: pulso * 2.5,
      }),
    [pulso],
  );

  return (
    <group position={[cx, ALTO_PLACA, cz]} rotation-y={ang} scale={escala}>
      {mallas.map((m) => (
        <mesh
          key={m.name}
          geometry={m.geometry}
          material={m.name.startsWith("Pines") ? MAT.estano : matCuerpo}
          castShadow
        />
      ))}
    </group>
  );
};

// ---------- LED 5 mm Real (Modelo KiCad 9.0) ----------
export const Led: React.FC<{ posicion: [number, number, number]; encendido: number }> = ({ posicion, encendido }) => {
  const gltf = useGLTF(staticFile("modelos/led5mm.glb"));
  const mallas = useMemo(() => {
    let pines: THREE.BufferGeometry | null = null;
    let lente: THREE.BufferGeometry | null = null;
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        if (child.name.startsWith("Pines")) pines = (child as THREE.Mesh).geometry;
        else lente = (child as THREE.Mesh).geometry;
      }
    });
    return { pines, lente };
  }, [gltf]);

  const matLente = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#ff3b3b",
        roughness: 0.1,
        transmission: 0.6,
        thickness: 0.5,
        ior: 1.5,
        emissive: new THREE.Color("#ff2a2a"),
      }),
    [],
  );
  matLente.emissiveIntensity = 0.06 + encendido * 9.5;
  const escala = 0.16;

  return (
    <group position={[posicion[0], ALTO_PLACA, posicion[2]]}>
      <group scale={escala} rotation-y={Math.PI / 2}>
        {mallas.pines && <mesh geometry={mallas.pines} material={MAT.estano} castShadow />}
        {mallas.lente && <mesh geometry={mallas.lente} material={matLente} castShadow />}
      </group>
      <pointLight position={[0, 1.1, 0]} color="#ff3030" intensity={encendido * 14} distance={7} decay={2} />
    </group>
  );
};

// ---------- Resistencia Axial Real (Modelo KiCad 9.0 + Bandas 1 kΩ en Blender) ----------
const COLOR_BANDAS: Record<string, { color: string; metal: number }> = {
  Banda_1_Marron: { color: "#6b3a1e", metal: 0 },
  Banda_2_Negro: { color: "#111111", metal: 0 },
  Banda_3_Rojo: { color: "#c0281e", metal: 0 },
  Banda_4_Oro: { color: "#d4af37", metal: 0.85 },
};

export const Resistencia: React.FC<{ desde: P2; hasta: P2 }> = ({ desde, hasta }) => {
  const gltf = useGLTF(staticFile("modelos/resistencia_axial.glb"));
  const mallas = useMemo(() => {
    const lista: { name: string; geometry: THREE.BufferGeometry }[] = [];
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        lista.push({ name: child.name, geometry: (child as THREE.Mesh).geometry });
      }
    });
    return lista;
  }, [gltf]);

  const cx = (desde[0] + hasta[0]) / 2;
  const cz = (desde[1] + hasta[1]) / 2;
  const largo = Math.hypot(hasta[0] - desde[0], hasta[1] - desde[1]);
  const ang = -Math.atan2(hasta[1] - desde[1], hasta[0] - desde[0]);
  // El paso original en KiCad es 10.16 mm
  const escala = largo / 10.16;

  return (
    <group position={[cx, ALTO_PLACA, cz]} rotation-y={ang} scale={escala}>
      {mallas.map((m) => {
        if (m.name.startsWith("Pines")) {
          return <mesh key={m.name} geometry={m.geometry} material={MAT.estano} castShadow />;
        }
        if (m.name.startsWith("Cuerpo")) {
          return <mesh key={m.name} geometry={m.geometry} material={MAT.ceramica} castShadow />;
        }
        const b = COLOR_BANDAS[m.name] ?? { color: "#111111", metal: 0 };
        return (
          <mesh key={m.name} geometry={m.geometry} castShadow>
            <meshPhysicalMaterial color={b.color} roughness={0.35} clearcoat={0.5} metalness={b.metal} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- Pulsador Táctil 6 mm Real (Modelo KiCad 9.0 Omron B3F) ----------
export const Pulsador: React.FC<{ p: P2; presion: number }> = ({ p, presion }) => {
  const gltf = useGLTF(staticFile("modelos/pulsador_6mm.glb"));
  const mallas = useMemo(() => {
    let pines: THREE.BufferGeometry | null = null;
    let cuerpo: THREE.BufferGeometry | null = null;
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        if (child.name.startsWith("Pines")) pines = (child as THREE.Mesh).geometry;
        else cuerpo = (child as THREE.Mesh).geometry;
      }
    });
    return { pines, cuerpo };
  }, [gltf]);

  const escala = 0.16;
  return (
    <group position={[p[0], ALTO_PLACA, p[1]]} scale={escala}>
      {mallas.pines && <mesh geometry={mallas.pines} material={MAT.estano} castShadow />}
      {mallas.cuerpo && (
        <mesh geometry={mallas.cuerpo} material={MAT.negro} position={[0, -presion * 0.45, 0]} castShadow receiveShadow />
      )}
    </group>
  );
};

// ---------- Batería 9 V ----------
export const Bateria: React.FC<{ posicion: [number, number, number] }> = ({ posicion }) => {
  const etiqueta = texturaTexto(["9V"], { ancho: 512, alto: 512, tam: 260, peso: 800, color: "#05080d", fondo: "#ffb547" });
  return (
    <group position={posicion}>
      <RoundedBox args={[2.6, 1.7, 4.8]} radius={0.12} smoothness={4} position={[0, 0.85, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#14171c" metalness={0.6} roughness={0.35} clearcoat={0.8} />
      </RoundedBox>
      <mesh position={[0, 1.705, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2.2, 2.2]} />
        <meshStandardMaterial map={etiqueta} roughness={0.5} />
      </mesh>
      {[-0.55, 0.55].map((z, i) => (
        <mesh key={z} position={[1.38, 1.15, z]} rotation-z={Math.PI / 2} material={MAT.estano} castShadow>
          <cylinderGeometry args={i === 0 ? [0.22, 0.22, 0.18, 6] : [0.2, 0.2, 0.18, 32]} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- Cable flexible ----------
export const Cable: React.FC<{ puntos: [number, number, number][]; color: string }> = ({ puntos, color }) => {
  const geo = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(puntos.map((p) => new THREE.Vector3(...p))), 64, 0.07, 12),
    [puntos],
  );
  return (
    <mesh geometry={geo} castShadow>
      <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.7} />
    </mesh>
  );
};

useGLTF.preload(staticFile("modelos/to92.glb"));
useGLTF.preload(staticFile("modelos/to92_autopsia.glb"));
useGLTF.preload(staticFile("modelos/to220.glb"));
useGLTF.preload(staticFile("modelos/sot23.glb"));
useGLTF.preload(staticFile("modelos/led5mm.glb"));
useGLTF.preload(staticFile("modelos/resistencia_axial.glb"));
useGLTF.preload(staticFile("modelos/pulsador_6mm.glb"));
useGLTF.preload(staticFile("modelos/rele_spdt.glb"));
useGLTF.preload(staticFile("modelos/rele_autopsia.glb"));
useGLTF.preload(staticFile("modelos/rele_dpdt.glb"));
useGLTF.preload(staticFile("modelos/rele_smd.glb"));
useGLTF.preload(staticFile("modelos/diodo_1n4007.glb"));
