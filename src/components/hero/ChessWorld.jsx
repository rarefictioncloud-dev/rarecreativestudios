import { forwardRef, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import gsap from "gsap";
import { G, M } from "./pieces";

/* ------------------------------------------------------------------ */
/* Layout: file (0-7), rank (0-7). Board square = 1 unit, centred.     */
/* ------------------------------------------------------------------ */
export const BG = "#000000"; // pure black stage
const sq = (f, r) => [f - 3.5, 0, 3.5 - r];

const PIECES = [
  // Heroes
  { id: "K", t: "king", m: "silver", at: [4, 1], s: 1.3, ry: 0 },
  { id: "N", t: "knight", m: "blue", at: [6, 2], s: 1.2, ry: -0.6 },
  // Silver support
  { id: "s1", t: "rook", m: "silver", at: [0, 0], s: 0.9, ry: 0 },
  { id: "s2", t: "bishop", m: "silver", at: [2, 0], s: 0.9, ry: 0 },
  { id: "s3", t: "pawn", m: "silver", at: [2, 1], s: 0.85, ry: 0 },
  { id: "s4", t: "pawn", m: "silver", at: [3, 1], s: 0.85, ry: 0 },
  { id: "s5", t: "pawn", m: "silver", at: [5, 1], s: 0.85, ry: 0 },
  { id: "s6", t: "pawn", m: "silver", at: [6, 1], s: 0.85, ry: 0 },
  // Black side
  { id: "X", t: "pawn", m: "black", at: [4, 3], s: 0.9, ry: 0 }, // gets captured
  { id: "b1", t: "queen", m: "black", at: [3, 6], s: 0.95, ry: 0 },
  { id: "b2", t: "king", m: "black", at: [4, 7], s: 0.95, ry: 0 },
  { id: "b3", t: "bishop", m: "black", at: [5, 7], s: 0.9, ry: 0 },
  { id: "b4", t: "rook", m: "black", at: [7, 7], s: 0.9, ry: 0 },
  { id: "b5", t: "rook", m: "black", at: [0, 7], s: 0.9, ry: 0 },
  { id: "b6", t: "pawn", m: "black", at: [2, 5], s: 0.85, ry: 0 },
  { id: "b7", t: "pawn", m: "black", at: [3, 5], s: 0.85, ry: 0 },
  { id: "b8", t: "pawn", m: "black", at: [5, 5], s: 0.85, ry: 0 },
  { id: "b9", t: "pawn", m: "black", at: [6, 4], s: 0.85, ry: 0 },
  { id: "b10", t: "pawn", m: "black", at: [1, 4], s: 0.85, ry: 0 },
].map((p) => ({ ...p, pos: sq(...p.at) }));

/* Camera journey driven by scroll (0 → 1) */
const V = (a) => new THREE.Vector3(...a);
const CAM_PATH = new THREE.CatmullRomCurve3([V([0.8, 1.6, 11.4]), V([8.5, 3.4, 6.8]), V([0.6, 13.5, 2.8]), V([-1, 3.4, 11.5])], false, "centripetal");
const LOOK_PATH = new THREE.CatmullRomCurve3([V([0, 1.1, 0]), V([0, 0.8, 0]), V([0, 0, 0]), V([-0.4, 1.6, 0.5])], false, "centripetal");
const Y_AXIS = new THREE.Vector3(0, 1, 0);

const getTier = () => {
  if (typeof window === "undefined") return "low";
  const small = window.innerWidth < 768;
  const touch = window.matchMedia("(pointer: coarse)").matches; // phones + tablets, incl. landscape
  const weak = (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 4) <= 4;
  return small || touch || weak ? "low" : "high";
};

// pixel-density ceiling per tier (desktop "high" is unchanged)
const DPR = { high: [1, 2], low: [1, 1.5], min: [0.75, 1.1] };

/* ------------------------------------------------------------------ */

const Piece = forwardRef(function Piece({ t, m, pos, s, ry, cast }, ref) {
  const mat = M[m];
  const mesh = (geo, extra = {}) => <mesh geometry={geo} material={mat} castShadow={cast} receiveShadow {...extra} />;
  return (
    <group ref={ref} position={pos} scale={s} rotation-y={ry}>
      {t === "knight" ? (
        <>
          {mesh(G.knightBase)}
          {mesh(G.knightHead)}
        </>
      ) : (
        mesh(G[t])
      )}
      {t === "king" && (
        <>
          {mesh(G.crossV, { position: [0, 2.0, 0] })}
          {mesh(G.crossH, { position: [0, 2.07, 0] })}
        </>
      )}
    </group>
  );
});

function Board() {
  const dark = useRef();
  const blue = useRef();

  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    let d = 0;
    let b = 0;
    for (let f = 0; f < 8; f++) {
      for (let r = 0; r < 8; r++) {
        const [x, , z] = sq(f, r);
        o.position.set(x, -0.05, z);
        o.updateMatrix();
        ((f + r) % 2 === 0 ? dark : blue).current.setMatrixAt((f + r) % 2 === 0 ? d++ : b++, o.matrix);
      }
    }
    dark.current.instanceMatrix.needsUpdate = true;
    blue.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      <instancedMesh ref={dark} args={[G.square, M.squareDark, 32]} receiveShadow />
      <instancedMesh ref={blue} args={[G.square, M.squareBlue, 32]} receiveShadow />
      {/* slim navy chassis + glowing trim */}
      <mesh material={M.frame} position={[0, -0.21, 0]} receiveShadow>
        <boxGeometry args={[8.7, 0.22, 8.7]} />
      </mesh>
      <mesh material={M.glow} position={[0, -0.34, 0]}>
        <boxGeometry args={[8.78, 0.04, 8.78]} />
      </mesh>
      <mesh material={M.frame} position={[0, -0.52, 0]}>
        <boxGeometry args={[7.6, 0.3, 7.6]} />
      </mesh>
    </group>
  );
}

function World({ scroll, pointer, high, onReady }) {
  const { camera, size } = useThree();
  const refs = useRef({});
  const world = useRef();
  const ring = useRef();
  const glint = useRef();
  const tlRef = useRef(null);
  const frames = useRef(0);
  const sp = useRef(0);
  const sm = useRef({ x: 0, y: 0 });
  const intro = useRef({ dolly: 1, shake: 0 });
  const camPos = useMemo(() => new THREE.Vector3(), []);
  const camLook = useMemo(() => new THREE.Vector3(), []);
  const heroLook = useMemo(() => new THREE.Vector3(), []);
  const reduce = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  /* Opening sequence: pieces rise, knight captures, king takes command */
  useLayoutEffect(() => {
    const g = (id) => refs.current[id];
    const K = g("K");
    const N = g("N");
    const X = g("X");

    const ctx = gsap.context(() => {
      if (reduce) {
        intro.current.dolly = 0;
        K.position.set(...sq(3, 3));
        K.scale.setScalar(1.5);
        N.position.set(...sq(4, 3));
        N.rotation.y = -2.5;
        X.visible = false;
        return;
      }

      const tl = gsap.timeline({ paused: true });
      tlRef.current = tl;
      const others = PIECES.filter((p) => p.id !== "K" && p.id !== "N").map((p) => g(p.id).position);

      tl.fromTo(intro.current, { dolly: 1 }, { dolly: 0, duration: 4.4, ease: "power3.inOut" }, 0)
        .fromTo(others, { y: -7 }, { y: 0, duration: 1.9, ease: "power3.out", stagger: { each: 0.06, from: "random" } }, 0.1)
        .fromTo([K.position, N.position], { y: -7 }, { y: 0, duration: 2.3, ease: "power4.out" }, 1.0);

      // Knight leaps g3 → e4 and takes the pawn
      const t0 = 4.0;
      const to = sq(4, 3);
      tl.to(N.position, { x: to[0], z: to[2], duration: 1.3, ease: "power2.inOut" }, t0)
        .to(N.position, { y: 1.7, duration: 0.65, ease: "power2.out", yoyo: true, repeat: 1 }, t0)
        .to(N.rotation, { y: -2.5, duration: 1.3, ease: "power2.inOut" }, t0)
        // capture
        .to(X.position, { x: "+=2.4", y: 1.5, z: "-=2.6", duration: 1.1, ease: "power2.out" }, t0 + 1.2)
        .to(X.rotation, { x: -1.6, z: 2.4, duration: 1.1, ease: "power1.out" }, t0 + 1.2)
        .to(X.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.5, ease: "power2.in" }, t0 + 1.8)
        .fromTo(ring.current.scale, { x: 0.01, y: 0.01, z: 0.01 }, { x: 4.6, y: 4.6, z: 4.6, duration: 1.8, ease: "expo.out" }, t0 + 1.25)
        .fromTo(ring.current.material, { opacity: 0.95 }, { opacity: 0, duration: 1.8, ease: "power2.out" }, t0 + 1.25)
        .fromTo(intro.current, { shake: 0.2 }, { shake: 0, duration: 0.9, ease: "expo.out" }, t0 + 1.25);

      // King advances, rises in scale: the commanding finish
      const k1 = sq(4, 2);
      const k2 = sq(3, 3);
      tl.to(K.position, { x: k1[0], z: k1[2], duration: 0.9, ease: "power2.inOut" }, t0 + 1.9)
        .to(K.position, { x: k2[0], z: k2[2], duration: 1.2, ease: "power2.inOut" }, t0 + 2.8)
        .to(K.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 1.4, ease: "power3.out" }, t0 + 2.8);
    });

    return () => ctx.revert();
  }, [reduce]);

  useFrame((state, dt) => {
    // Start the intro only after the GPU has warmed up (avoids a janky first second)
    if (frames.current < 4 && ++frames.current === 4) {
      tlRef.current?.play();
      onReady?.();
    }

    const t = state.clock.elapsedTime;
    const live = performance.now() - pointer.current.t < 2500;
    const tx = live ? pointer.current.x : reduce ? 0 : Math.sin(t * 0.35) * 0.6;
    const ty = live ? pointer.current.y : reduce ? 0 : Math.cos(t * 0.28) * 0.3;
    sm.current.x = THREE.MathUtils.damp(sm.current.x, tx, 4, dt);
    sm.current.y = THREE.MathUtils.damp(sm.current.y, ty, 4, dt);
    sp.current = THREE.MathUtils.damp(sp.current, scroll.current.p, 3.5, dt);
    const u = Math.min(Math.max(sp.current, 0), 1);

    const aspect = size.width / size.height;
    const portrait = aspect < 1;

    // Portrait (phones / tablets): open on the WHOLE board from a raised angle, then ease into the cinematic path.
    // Landscape / desktop (aspect >= 1) takes the exact same code path as before.
    const el = 0.47; // camera elevation (rad) for the portrait hero shot
    const a = Math.max(aspect, 0.35);
    const kFit = ((16 / a) * Math.cos(el)) / 11.43; // distance at which the board width just fits the screen
    const w = portrait ? 1 - THREE.MathUtils.smoothstep(u, 0, 0.28) : 0;
    const kRest = aspect < 0.7 ? 1.7 : aspect < 1 ? 1.5 : aspect < 1.4 ? 1.2 : 1;
    const k = portrait ? THREE.MathUtils.lerp(kRest, kFit, w) : kRest;

    CAM_PATH.getPoint(u, camPos).multiplyScalar(k);
    LOOK_PATH.getPoint(u, camLook);

    if (portrait) {
      if (w > 0) {
        const hd = Math.hypot(camPos.x, camPos.z);
        camPos.y = THREE.MathUtils.lerp(camPos.y, 0.3 + hd * Math.tan(el), w);
        camPos.x = THREE.MathUtils.lerp(camPos.x, 0, w); // dead-centre so the board is symmetric
        const visH = 2 * (hd / Math.cos(el)) * 0.3249; // visible world height at the board
        const lift = (0.09 * visH) / Math.cos(el); // park the board in the free band above the copy
        camLook.lerp(heroLook.set(0, 0.3 - lift, 0.3), w);
      }
    } else {
      const lift = aspect < 1.4 ? 0.6 : 0;
      camLook.y -= lift * (1 - THREE.MathUtils.smoothstep(u, 0, 0.2));
    }

    // slow orbit + intro dolly + pointer parallax + impact shake
    if (!reduce) camPos.applyAxisAngle(Y_AXIS, Math.sin(t * 0.15) * 0.14 * (portrait ? 0.5 : 1));
    const d = intro.current.dolly;
    camPos.z += d * 6;
    camPos.y -= d * 0.7;
    camPos.x += sm.current.x * 0.9 + Math.sin(t * 55) * intro.current.shake * 0.05;
    camPos.y += sm.current.y * 0.45 + Math.cos(t * 47) * intro.current.shake * 0.05;

    camera.position.copy(camPos);
    camera.lookAt(camLook);

    const fog = state.scene.fog;
    if (fog) {
      const shift = portrait ? Math.max(0, camPos.length() - 12) : 0; // desktop: shift = 0 (unchanged)
      fog.near = 16 + shift;
      fog.far = 46 + shift;
    }

    // the whole board follows the cursor: yaw, tilt, slide
    if (world.current) {
      const sway = portrait ? 0.6 : 1;
      world.current.rotation.y = sm.current.x * 0.3 * sway;
      world.current.rotation.x = -sm.current.y * 0.1;
      world.current.rotation.z = -sm.current.x * 0.02 * sway;
      world.current.position.x = sm.current.x * 0.5;
      world.current.position.y = (reduce ? 0 : Math.sin(t * 0.6) * 0.08) + sm.current.y * 0.15;
    }
    // a soft light glint that sweeps the board and chases the cursor
    if (glint.current) {
      glint.current.position.set(sm.current.x * 5 + Math.sin(t * 0.6) * 3, 2.4, 1 - sm.current.y * 3 + Math.cos(t * 0.45) * 2);
    }
    const K = refs.current.K;
    if (K && !reduce) K.rotation.y = Math.sin(t * 0.35) * 0.18 + sm.current.x * 0.25;
  });

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 16, 46]} />

      {/* Studio light rig */}
      <ambientLight intensity={0.22} />
      <hemisphereLight args={["#aab6d6", BG, 0.35]} />
      <spotLight position={[6, 13, 7]} angle={0.45} penumbra={1} intensity={520} color="#e2ecff" castShadow={high} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      <spotLight position={[-9, 5, -8]} angle={0.6} penumbra={1} intensity={650} color="#1a6dff" />
      <pointLight position={[0, 3, 12]} intensity={40} color="#cfe0ff" />
      <pointLight position={[0, -1.6, 0]} intensity={45} distance={14} color="#0756BD" />
      <pointLight ref={glint} position={[0, 2.4, 1]} intensity={22} distance={10} color="#d6e4ff" />

      {/* Procedural studio reflections (no external HDR) */}
      <Environment resolution={high ? 256 : 128} frames={1}>
        <Lightformer form="rect" intensity={4} position={[0, 6, 2]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={6} position={[-8, 2, -3]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#0756BD" />
        <Lightformer form="rect" intensity={5} position={[8, 2, -3]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color="#2f8bff" />
      </Environment>

      <group ref={world}>
        <Board />
        {PIECES.map((p) => (
          <Piece key={p.id} ref={(el) => (refs.current[p.id] = el)} t={p.t} m={p.m} pos={p.pos} s={p.s} ry={p.ry} cast={high} />
        ))}
        <mesh ref={ring} position={[0.5, 0.03, 0.5]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.9, 1, 96]} />
          <meshBasicMaterial color="#3d93ff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
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
      camera={{ fov: 36, near: 0.1, far: 90, position: [0.8, 1.6, 11.4] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      {/* If FPS drops, only the pixel density is reduced (step by step) */}
      <PerformanceMonitor onDecline={() => setTier((t) => (t === "high" ? "low" : "min"))} flipflops={3} />
      <World scroll={scroll} pointer={pointer} high={shadows} onReady={onReady} />
    </Canvas>
  );
}