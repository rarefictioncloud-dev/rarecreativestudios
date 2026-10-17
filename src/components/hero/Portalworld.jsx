import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

/*
  THE NEXT MOVE: an art-directed chess installation (not a playable game).
  Everything is procedural (lathe-turned pieces, instanced tiles), so there
  are no downloaded assets and the homepage's chess code is not reused.

  Scroll progress (0..1) choreographs: camera sweep across the board, a few
  pieces gliding to final tiles, a cobalt route lighting tile by tile, and a
  cleaner composition near the form. It is damped, reversible, and never
  touches native scrolling.
*/

const ss = THREE.MathUtils.smoothstep;
const lerp = THREE.MathUtils.lerp;
const BG_DARK = new THREE.Color("#07080b");
const BG_LIGHT = new THREE.Color("#121c30");
const tileXZ = ([i, j]) => [i - 3.5, j - 3.5];

/* Lathe profiles: [radius, height] */
const PROFILES = {
  pawn: [[0, 0], [0.42, 0], [0.45, 0.08], [0.34, 0.16], [0.2, 0.3], [0.17, 0.5], [0.3, 0.58], [0.3, 0.64], [0.2, 0.7], [0.26, 0.82], [0.26, 0.96], [0.17, 1.06], [0, 1.08]],
  rook: [[0, 0], [0.52, 0], [0.55, 0.1], [0.4, 0.26], [0.32, 0.9], [0.46, 1.0], [0.46, 1.4], [0.34, 1.4], [0.34, 1.3], [0, 1.3]],
  bishop: [[0, 0], [0.52, 0], [0.55, 0.1], [0.38, 0.26], [0.26, 0.7], [0.3, 0.9], [0.4, 1.1], [0.34, 1.45], [0.14, 1.75], [0.18, 1.85], [0.1, 1.98], [0, 1.98]],
  queen: [[0, 0], [0.58, 0], [0.62, 0.1], [0.46, 0.26], [0.28, 0.7], [0.24, 1.2], [0.44, 1.5], [0.5, 1.7], [0.3, 1.75], [0.2, 1.9], [0.26, 2.0], [0.14, 2.14], [0, 2.14]],
  king: [[0, 0], [0.62, 0], [0.66, 0.12], [0.5, 0.24], [0.3, 0.5], [0.24, 1.2], [0.4, 1.45], [0.42, 1.55], [0.3, 1.62], [0.34, 1.9], [0.46, 2.15], [0.36, 2.35], [0, 2.4]],
};

const PIECES = [
  { id: "king", type: "king", mat: "chrome", a: [5, 3], b: [4, 4], s: 1.5, t: [0.5, 0.95], m: true },
  { id: "queen", type: "queen", mat: "black", a: [2, 2], b: [3, 3], s: 1.2, t: [0.12, 0.55], m: true },
  { id: "rook", type: "rook", mat: "chrome", a: [0, 1], b: [0, 3], s: 1.05, t: [0.25, 0.7], m: true },
  { id: "bishop", type: "bishop", mat: "black", a: [7, 5], b: [6, 4], s: 1.05, t: [0.3, 0.75], m: true },
  { id: "p1", type: "pawn", mat: "chrome", a: [3, 6], b: [4, 6], s: 1, t: [0.2, 0.6], m: true },
  { id: "p2", type: "pawn", mat: "black", a: [6, 2], b: [5, 2], s: 1, t: [0.35, 0.8] },
  { id: "p3", type: "pawn", mat: "chrome", a: [1, 3], b: [1, 4], s: 1, t: [0.4, 0.85] },
  { id: "p4", type: "pawn", mat: "black", a: [4, 1], b: [4, 2], s: 1, t: [0.1, 0.5] },
];

/* The cobalt route, ending under the king's final square */
const ROUTE = [[0, 7], [1, 6], [2, 5], [3, 5], [3, 4], [4, 4]];

/* Shared materials */
const mats = {
  chrome: new THREE.MeshStandardMaterial({ color: "#e6ebf5", metalness: 1, roughness: 0.1, envMapIntensity: 1.7 }),
  black: new THREE.MeshStandardMaterial({ color: "#0b0c10", metalness: 0.25, roughness: 0.5, envMapIntensity: 0.8 }),
  slab: new THREE.MeshStandardMaterial({ color: "#0d0f14", metalness: 0.85, roughness: 0.28, envMapIntensity: 1.2 }),
  tile: new THREE.MeshStandardMaterial({ color: "#ffffff", metalness: 0.15, roughness: 0.28 }),
};
const tileGeo = new THREE.BoxGeometry(0.98, 0.12, 0.98);
const slabGeo = new THREE.BoxGeometry(8.5, 0.4, 8.5);
const routeGeo = new THREE.BoxGeometry(0.96, 0.02, 0.96);

function Tiles() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const light = new THREE.Color("#F5F5F2");
    const dark = new THREE.Color("#0b0c10");
    let n = 0;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const [x, z] = tileXZ([i, j]);
        o.position.set(x, 0, z);
        o.updateMatrix();
        m.setMatrixAt(n, o.matrix);
        m.setColorAt(n, (i + j) % 2 ? dark : light);
        n++;
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, []);
  return <instancedMesh ref={ref} args={[tileGeo, mats.tile, 64]} receiveShadow />;
}

function RouteTile({ at, index, progress }) {
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#2a6bff", transparent: true, opacity: 0 }),
    []
  );
  useEffect(() => () => mat.dispose(), [mat]);
  const [x, z] = tileXZ(at);
  useFrame(() => {
    const s = 0.06 + index * 0.1;
    mat.opacity = ss(progress.current, s, s + 0.1) * 0.9;
  });
  return <mesh geometry={routeGeo} material={mat} position={[x, 0.07, z]} />;
}

function Piece({ spec, progress, geos }) {
  const ref = useRef(null);
  const [ax, az] = tileXZ(spec.a);
  const [bx, bz] = tileXZ(spec.b);
  const mat = mats[spec.mat];
  const isKing = spec.type === "king";

  useFrame(() => {
    if (!ref.current) return;
    const p = progress.current;
    const k = ss(p, spec.t[0], spec.t[1]);
    ref.current.position.set(lerp(ax, bx, k), 0.06, lerp(az, bz, k));
    if (isKing) ref.current.rotation.y = lerp(0.6, -0.35, p);
  });

  return (
    <group ref={ref} position={[ax, 0.06, az]} scale={spec.s}>
      <mesh geometry={geos[spec.type]} material={mat} castShadow />
      {isKing && (
        <>
          <mesh geometry={geos.crossV} material={mat} position={[0, 2.68, 0]} castShadow />
          <mesh geometry={geos.crossH} material={mat} position={[0, 2.8, 0]} castShadow />
        </>
      )}
    </group>
  );
}

function RouteLight({ progress }) {
  const ref = useRef(null);
  const [x, z] = tileXZ(ROUTE[ROUTE.length - 1]);
  useFrame(() => {
    if (ref.current) ref.current.intensity = 4 + progress.current * 34;
  });
  return <pointLight ref={ref} position={[x, 1.4, z]} color="#2a6bff" distance={9} decay={2} />;
}

function Rig({ progress, mobile }) {
  const target = useRef(0);
  const { camera } = useThree();
  const v = useMemo(
    () => ({
      posA: mobile ? new THREE.Vector3(3.6, 4.4, 9.4) : new THREE.Vector3(6.5, 5, 9.5),
      posB: mobile ? new THREE.Vector3(-1.4, 9, 6.6) : new THREE.Vector3(-3, 9.5, 5.5),
      lookA: new THREE.Vector3(0, mobile ? -0.8 : 1, 0),
      lookB: new THREE.Vector3(0, mobile ? -0.6 : 0, 0),
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
    }),
    [mobile]
  );

  useEffect(() => {
    camera.fov = mobile ? 46 : 34;
    camera.updateProjectionMatrix();
  }, [mobile, camera]);

  useEffect(() => {
    const read = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    const ro = new ResizeObserver(read);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
      ro.disconnect();
    };
  }, []);

  useFrame(({ camera, pointer, scene }, delta) => {
    progress.current = THREE.MathUtils.damp(progress.current, target.current, 4, delta);
    const p = progress.current;
    const e = p * p * (3 - 2 * p); // eased diagonal sweep
    v.pos.lerpVectors(v.posA, v.posB, e);
    if (!mobile) v.pos.x += pointer.x * 0.3;
    camera.position.copy(v.pos);
    v.look.lerpVectors(v.lookA, v.lookB, e);
    camera.lookAt(v.look);

    const mix = p * 0.8;
    if (scene.background?.isColor) scene.background.copy(BG_DARK).lerp(BG_LIGHT, mix);
    if (scene.fog) scene.fog.color.copy(BG_DARK).lerp(BG_LIGHT, mix);
  });

  return null;
}

function Scene({ progress }) {
  const width = useThree((s) => s.size.width);
  const mobile = width < 768;
  const board = useRef(null);
  const seg = mobile ? 24 : 56;

  const geos = useMemo(() => {
    const g = {};
    for (const [k, pts] of Object.entries(PROFILES)) {
      g[k] = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
    }
    g.crossV = new THREE.BoxGeometry(0.14, 0.6, 0.14);
    g.crossH = new THREE.BoxGeometry(0.44, 0.13, 0.14);
    return g;
  }, [seg]);
  useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  useFrame(({ clock }) => {
    if (board.current) board.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.06;
  });

  const pieces = mobile ? PIECES.filter((p) => p.m) : PIECES;

  return (
    <>
      <color attach="background" args={["#07080b"]} />
      <fog attach="fog" args={["#07080b", 16, 38]} />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[9, 8, 4]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-far={30}
        shadow-bias={-0.0005}
      />
      <RouteLight progress={progress} />
      <Rig progress={progress} mobile={mobile} />

      <group ref={board}>
        <mesh geometry={slabGeo} material={mats.slab} position={[0, -0.26, 0]} receiveShadow />
        <Tiles />
        {ROUTE.map((at, i) => (
          <RouteTile key={i} at={at} index={i} progress={progress} />
        ))}
        {pieces.map((spec) => (
          <Piece key={spec.id} spec={spec} progress={progress} geos={geos} />
        ))}
      </group>
      <Environment preset="studio" />
    </>
  );
}

export default function ChessMoveWorld() {
  const progress = useRef(0);
  const small = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Canvas
      shadows={!small}
      dpr={small ? [1, 1.25] : [1, 1.5]}
      camera={{ position: small ? [3.6, 4.4, 9.4] : [6.5, 5, 9.5], fov: small ? 46 : 34, near: 0.1, far: 60 }}
      gl={{ antialias: !small, alpha: false, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene progress={progress} />
    </Canvas>
  );
}