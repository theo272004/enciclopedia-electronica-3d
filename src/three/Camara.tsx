import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import type * as THREE from "three";

// Cámara orbital controlada 100% por el frame (determinista → render idéntico siempre).
export const Camara: React.FC<{
  angulo: number; // radianes alrededor del eje Y
  radio: number;
  altura: number;
  objetivo: [number, number, number];
  fov?: number;
}> = ({ angulo, radio, altura, objetivo, fov }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(objetivo[0] + Math.sin(angulo) * radio, altura, objetivo[2] + Math.cos(angulo) * radio);
    camera.lookAt(objetivo[0], objetivo[1], objetivo[2]);
    if (fov && camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });
  return null;
};
