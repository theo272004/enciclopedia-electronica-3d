import { Environment, Lightformer } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  NoiseEffect,
  RenderPass,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
} from "postprocessing";
import { useEffect, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";

// Post-procesado HDR creado de forma síncrona (listo desde el primer frame que Remotion captura).
const PostProceso: React.FC<{ bloom: number }> = ({ bloom }) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  const composer = useMemo(() => {
    const c = new EffectComposer(gl, { multisampling: 8, frameBufferType: THREE.HalfFloatType });
    c.addPass(new RenderPass(scene, camera));
    const ruido = new NoiseEffect({ premultiply: true });
    ruido.blendMode.opacity.value = 0.035;
    c.addPass(
      new EffectPass(
        camera,
        new BloomEffect({ intensity: bloom, luminanceThreshold: 1, luminanceSmoothing: 0.25, mipmapBlur: true, radius: 0.75 }),
        new VignetteEffect({ offset: 0.25, darkness: 0.7 }),
        ruido,
        new ToneMappingEffect({ mode: ToneMappingMode.AGX }),
      ),
    );
    return c;
  }, [gl, scene, camera, bloom]);

  useLayoutEffect(() => composer.setSize(size.width, size.height), [composer, size]);
  useEffect(() => () => composer.dispose(), [composer]);
  useFrame((_, delta) => composer.render(delta), 1);
  return null;
};

// Iluminación de estudio oscura (luces de borde cian/ámbar) + reflejos HDR procedurales + post-procesado cinematográfico.
export const Estudio: React.FC<{ bloom?: number; sombraTam?: number }> = ({ bloom = 1.1, sombraTam = 8 }) => (
  <>
    <color attach="background" args={["#04070b"]} />
    <fog attach="fog" args={["#04070b", 16, 40]} />
    <ambientLight intensity={0.12} />
    <directionalLight
      position={[-5, 10, 6]}
      intensity={2.2}
      castShadow
      shadow-mapSize={[4096, 4096]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
      shadow-camera-left={-sombraTam}
      shadow-camera-right={sombraTam}
      shadow-camera-top={sombraTam}
      shadow-camera-bottom={-sombraTam}
    />
    <spotLight position={[7, 6, -9]} angle={0.5} penumbra={1} intensity={60} color="#3de0ff" />
    <spotLight position={[-9, 5, -7]} angle={0.5} penumbra={1} intensity={45} color="#ffb547" />

    <Environment resolution={512} frames={Infinity} environmentIntensity={1}>
      <color attach="background" args={["#020306"]} />
      <Lightformer form="rect" intensity={3} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[14, 8, 1]} />
      <Lightformer form="rect" intensity={2.5} color="#3de0ff" position={[10, 3, -3]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} />
      <Lightformer form="rect" intensity={2} color="#ffb547" position={[-10, 3, 3]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
      <Lightformer form="ring" intensity={2} position={[0, 4, 10]} scale={5} />
    </Environment>

    <PostProceso bloom={bloom} />
  </>
);
