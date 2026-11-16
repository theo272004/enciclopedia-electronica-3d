import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";

/**
 * Flechas 3D animadas de dirección de corriente / flujo magnético estilo "Mentalidad de Ingeniería".
 * Permiten visualizar al instante hacia dónde empujan los electrones o líneas de campo sin texto extra.
 */
export const FlechasFlujo3D: React.FC<{
  puntos: [number, number, number][];
  cantidad?: number;
  velocidad?: number;
  color?: string;
  escala?: number;
  activo?: boolean;
}> = ({ puntos, cantidad = 5, velocidad = 0.45, color = "#3de0ff", escala = 0.08, activo = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const curva = useMemo(
    () => new THREE.CatmullRomCurve3(puntos.map((p) => new THREE.Vector3(p[0], p[1], p[2]))),
    [puntos],
  );

  if (!activo) return null;

  const tBase = ((frame / fps) * velocidad) % 1;

  return (
    <group>
      {Array.from({ length: cantidad }).map((_, i) => {
        const u = (tBase + i / cantidad) % 1;
        const pos = curva.getPointAt(u);
        const tan = curva.getTangentAt(u).normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan);

        return (
          <group key={i} position={[pos.x, pos.y, pos.z]} quaternion={quat}>
            <mesh>
              <coneGeometry args={[escala * 0.75, escala * 2.1, 12]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} roughness={0.2} />
            </mesh>
            <mesh position={[0, -escala * 1.4, 0]}>
              <cylinderGeometry args={[escala * 0.28, escala * 0.28, escala * 1.3, 10]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} roughness={0.25} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
