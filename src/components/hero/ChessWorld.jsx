import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import gsap from "gsap";
import { G, M, FOV, RING_R, makePose, evalPose, frame, place, makePhotoTexture, makeGlowTexture } from "./pieces";

/* ====================================================================
   THE CULTURAL COLLISION: scroll-driven 3D sculpture
   (file keeps its original name so Home.jsx imports keep working)

   Props (unchanged API):
     scroll  ref {p: 0..1}  page scroll progress (written by Home's ScrollTrigger)
     pointer ref {x, y, t}  cursor / touch / tilt input
     onReady callback       fired once the GPU is warm

   One damped scroll value drives ONE pose (see STAGES in pieces.js); the
   camera, tower, ring, panel and bead are all derived from it, so nothing
   fights over the same properties.
   ==================================================================== */

export const BG = "#0C192D"; // brand midnight navy

const getTier = () => {
  if (typeof window === "undefined") return "low";
  const small = window.innerWidth < 768;
  const touch = window.matchMedia("(pointer: coarse)").matches; // phones + tablets, incl. landscape
  const weak = (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 4) <= 4;
  return small || touch || weak ? "low" : "high";
};

// pixel-density ceiling per tier
const DPR = { high: [1, 2], low: [1, 1.5], min: [0.75, 1.1] };

function World({ scroll, pointer, high, onReady }) {
  const { camera, size } = useThree();

  const root = useRef();
  const towerG = useRef();
  const towerMesh = useRef();
  const ringG = useRef();
  const bead = useRef();
  const panelG = useRef();
  const glow = useRef();

  const tlRef = useRef(null);
  const frames = useRef(0);
  const sp = useRef(0);
  const sm = useRef({ x: 0, y: 0 });
  const intro = useRef({ enter: 0 });
  const pose = useMemo(() => makePose(), []);
  const reduce = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  const photoTex = useMemo(() => makePhotoTexture(), []);
  const glowTex = useMemo(() => makeGlowTexture(), []);
  useEffect(() => () => { photoTex.dispose(); glowTex.dispose(); }, [photoTex, glowTex]);

  /* Quick entrance: objects arrive in ~2s, then the scene idles. */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (reduce) {
        intro.current.enter = 1;
        return;
      }
      tlRef.current = gsap
        .timeline({ paused: true })
        .fromTo(intro.current, { enter: 0 }, { enter: 1, duration: 2.2, ease: "power3.out" });
    });
    return () => ctx.revert();
  }, [reduce]);

  useFrame((state, dt) => {
    // start the entrance only once the GPU has warmed up (no janky first second)
    if (frames.current < 4 && ++frames.current === 4) {
      tlRef.current?.play();
      onReady?.();
    }

    const t = state.clock.elapsedTime;

    // cursor / touch / tilt, or a slow idle drift when there is no input (always works without a mouse)
    const live = performance.now() - pointer.current.t < 2500;
    const tx = live ? pointer.current.x : reduce ? 0 : Math.sin(t * 0.35) * 0.6;
    const ty = live ? pointer.current.y : reduce ? 0 : Math.cos(t * 0.28) * 0.3;
    sm.current.x = THREE.MathUtils.damp(sm.current.x, tx, 4, dt);
    sm.current.y = THREE.MathUtils.damp(sm.current.y, ty, 4, dt);

    // the single scroll value that drives the whole story
    sp.current = THREE.MathUtils.damp(sp.current, scroll.current.p, 3.2, dt);
    const u = Math.min(Math.max(sp.current, 0), 1);
    evalPose(u, pose);

    const aspect = size.width / size.height;
    const fr = frame(aspect);
    const e = intro.current.enter;
    const inv = 1 - e;
    const idle = reduce ? 0 : 1;
    const kM = reduce ? 0.4 : 1; // calmer camera for reduced motion

    root.current.scale.setScalar(fr.U);

    // THE MONOLITH (rises into frame, slowly turns)
    place(towerG.current, pose.tower, fr);
    towerG.current.rotation.set(0, 0, 0);
    towerG.current.position.y -= inv * 9;
    towerMesh.current.rotation.y = pose.tower.ry + t * 0.07 * idle + sm.current.x * 0.25 * kM;

    // THE RING (spins in, then wraps / orbits the monolith)
    place(ringG.current, pose.ring, fr);
    ringG.current.position.x += inv * 6;
    ringG.current.rotation.x += inv * 2.2 + Math.sin(t * 0.5) * 0.035 * idle;
    ringG.current.rotation.y += Math.cos(t * 0.4) * 0.03 * idle;
    ringG.current.scale.multiplyScalar(0.55 + 0.45 * e);

    // THE BEAD (yellow accent riding the ring)
    const a = pose.bead.a + Math.sin(t * 0.7) * 0.3 * idle;
    bead.current.position.set(RING_R * Math.cos(a), RING_R * Math.sin(a), 0);

    // THE FRAME (suspended photographic panel)
    place(panelG.current, pose.panel, fr);
    panelG.current.position.x += inv * 5;
    panelG.current.rotation.y += Math.sin(t * 0.3) * 0.03 * idle;
    panelG.current.scale.multiplyScalar(0.7 + 0.3 * e);

    // CAMERA: orbit + dolly + perspective shift from the pose; pointer is only a subtle extra
    const th = pose.cam.th * kM + sm.current.x * 0.06 * kM;
    const ph = pose.cam.ph * kM + sm.current.y * 0.03 * kM;
    const d = 16 + (pose.cam.d - 16) * kM + inv * 4;
    const ly = pose.cam.ty * fr.halfH;
    camera.position.set(Math.sin(th) * Math.cos(ph) * d, Math.sin(ph) * d + ly, Math.cos(th) * Math.cos(ph) * d);
    camera.lookAt(0, ly, 0);

    if (glow.current) glow.current.position.x = -sm.current.x * 1.5;
  });

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 30, 90]} />

      {/* Controlled cinematic lighting: cool key, cobalt rim, one small warm kicker */}
      <ambientLight intensity={0.3} color="#9fb4ff" />
      <directionalLight position={[-6, 9, 8]} intensity={2.4} color="#ffffff" castShadow={high} shadow-mapSize={[1024, 1024]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-camera-near={0.5} shadow-camera-far={40} shadow-bias={-0.0004} shadow-normalBias={0.02} />
      <directionalLight position={[8, 4, -6]} intensity={2.2} color="#5271FF" />
      <pointLight position={[-5, -2, 4]} intensity={8} distance={14} color="#C6A66B" />

      {/* Procedural studio reflections (no external HDR): what the chrome ring reflects */}
      <Environment resolution={high ? 256 : 128} frames={1}>
        <Lightformer form="rect" intensity={3.2} position={[0, 6, 4]} scale={[10, 3, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={5} position={[-7, 1, 2]} rotation-y={Math.PI / 2} scale={[7, 3, 1]} color="#5271FF" />
        <Lightformer form="rect" intensity={3} position={[7, 0, -2]} rotation-y={-Math.PI / 2} scale={[7, 3, 1]} color="#ffffff" />
        <Lightformer form="ring" intensity={2.2} position={[0, 2, -7]} scale={6} color="#C6A66B" />
      </Environment>

      {/* atmosphere behind the sculpture */}
      <mesh ref={glow} position={[0, 0, -22]}>
        <planeGeometry args={[90, 56]} />
        <meshBasicMaterial map={glowTex} transparent depthWrite={false} toneMapped={false} fog={false} />
      </mesh>

      <group ref={root}>
        {/* twisted cobalt monolith on a white architectural plinth */}
        <group ref={towerG}>
          <mesh ref={towerMesh} geometry={high ? G.tower : G.towerLow} material={M.blue} castShadow receiveShadow />
          <mesh geometry={G.plinth} material={M.white} position={[0, -3.25, 0]} castShadow receiveShadow />
        </group>

        {/* monumental chrome ring + a single yellow bead */}
        <group ref={ringG}>
          <mesh geometry={high ? G.ring : G.ringLow} material={M.chrome} castShadow receiveShadow />
          <mesh ref={bead} geometry={G.bead} material={M.yellow} castShadow />
        </group>

        {/* suspended photographic frame */}
        <group ref={panelG}>
          <mesh geometry={G.panel} material={M.white} castShadow receiveShadow />
          <mesh geometry={G.photo} position={[0, 0, 0.115]}>
            <meshBasicMaterial map={photoTex} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </>
  );
}

export default function ChessWorld({ scroll, pointer, onReady }) {
  const [tier, setTier] = useState(getTier);
  const shadows = useRef(tier === "high").current; // decided once, so the look never changes mid-session

  return (
    <Canvas
      shadows={shadows}
      dpr={DPR[tier]}
      camera={{ fov: FOV, near: 0.1, far: 120, position: [0, 0, 16] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      {/* If FPS drops, only the pixel density is reduced (step by step) */}
      <PerformanceMonitor onDecline={() => setTier((t) => (t === "high" ? "low" : "min"))} flipflops={3} />
      <World scroll={scroll} pointer={pointer} high={shadows} onReady={onReady} />
    </Canvas>
  );
}