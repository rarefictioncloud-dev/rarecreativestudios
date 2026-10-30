import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";

/*
  One shared scene for the whole About page. The canvas is fixed behind the
  content; the camera descends along a tall vertical path as the page scrolls.
  The path narrows toward the end so the ribbon "resolves" at the final CTA.

  NEW in this version
  - Scroll-velocity: the ribbon twists and the crystals spin faster while you scroll.
  - Floating glass + gold crystals scattered down the journey.
  - A drifting particle field for depth.

  Responsive rules
  - "compact" = phones (< 768px wide) and portrait tablets (< 1024px, taller than wide).
  - Compact devices get fewer particles / crystals and no transmission material.
*/
const H = 34;
const STOPS = 14;
const NAVY = "#050A14";

const isCompact = (w, h) => w < 768 || (w < 1024 && w < h);

const curve = new THREE.CatmullRomCurve3(
  Array.from({ length: STOPS }, (_, i) => {
    const amp = Math.min(1, (STOPS - 1 - i) / 4 + 0.15);
    return new THREE.Vector3(
      Math.sin(i * 1.15) * 2.6 * amp,
      -i * (H / (STOPS - 1)),
      Math.cos(i * 0.95 + 0.6) * 2.2 * amp
    );
  })
);

const SHEETS = Array.from({ length: 9 }, (_, i) => {
  const side = i % 2 ? 1 : -1;
  return {
    pos: [side * (2.9 + (i % 3) * 0.5), -1 - i * 3.8, -2.2 + (i % 3) * 1.1],
    rot: [0.1 * side, -0.35 * side, 0.2 * side * (i % 2 ? 1 : -1)],
    phase: i * 0.9,
    depth: 0.04 + (i % 3) * 0.03,
  };
});

/* Floating crystals: alternate cobalt glass and champagne-gold chrome */
const CRYSTALS = Array.from({ length: 6 }, (_, i) => {
  const side = i % 2 ? 1 : -1;
  return {
    pos: [side * (3.6 + (i % 3) * 0.7), -2.5 - i * 5.6, -1 + (i % 2) * 1.5],
    scale: 0.55 + (i % 3) * 0.18,
    speed: 0.25 + (i % 4) * 0.08,
    phase: i * 1.3,
    gold: i % 2 === 1,
    kind: i % 3, // 0 icosahedron, 1 octahedron, 2 dodecahedron
  };
});

const RING_T = [0.1, 0.27, 0.44, 0.61, 0.78, 0.93];
const RINGS = RING_T.map((t) => {
  const p = curve.getPoint(t);
  const m = new THREE.Object3D();
  m.position.copy(p);
  m.lookAt(p.clone().add(curve.getTangent(t)));
  return { position: p.toArray(), quaternion: m.quaternion.toArray() };
});

/* Shared, reusable materials / geometries */
const sheetGeo = new THREE.BoxGeometry(7, 9.2, 0.04);
const ruleGeo = new THREE.BoxGeometry(3.2, 0.04, 0.005);
const ringGeo = new THREE.TorusGeometry(0.95, 0.022, 10, 56);
const crystalGeos = [
  new THREE.IcosahedronGeometry(1, 0),
  new THREE.OctahedronGeometry(1.15, 0),
  new THREE.DodecahedronGeometry(1, 0),
];
const sheetMat = new THREE.MeshStandardMaterial({ color: "#d9d8d3", roughness: 0.92 });
const ruleMat = new THREE.MeshBasicMaterial({ color: "#C6A66B" });
const ringMat = new THREE.MeshStandardMaterial({
  color: "#dcc79a",
  metalness: 1,
  roughness: 0.14,
  envMapIntensity: 1.4,
});
const goldCrystalMat = new THREE.MeshStandardMaterial({
  color: "#dcc79a",
  metalness: 1,
  roughness: 0.12,
  envMapIntensity: 1.6,
  flatShading: true,
});

function Sheet({ pos, rot, phase, depth, progress, scale }) {
  const ref = useRef(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime + phase;
    ref.current.position.y = pos[1] + progress.current * H * depth + Math.sin(t * 0.3) * 0.1;
    ref.current.rotation.x = rot[0] + Math.sin(t * 0.25) * 0.02;
    ref.current.rotation.y = rot[1] + progress.current * 0.4 * Math.sign(pos[0]) * -1;
  });

  return (
    <group ref={ref} position={pos} rotation={rot} scale={scale}>
      <mesh geometry={sheetGeo} material={sheetMat} />
      <mesh geometry={ruleGeo} material={ruleMat} position={[-1.2, 3.5, 0.03]} />
    </group>
  );
}

function Crystal({ pos, scale, speed, phase, gold, kind, progress, velocity, mobile }) {
  const ref = useRef(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed + phase;
    const boost = 1 + Math.abs(velocity.current) * 40;
    ref.current.rotation.x = t * boost + progress.current * 3;
    ref.current.rotation.y = t * 0.8 * boost - progress.current * 2;
    ref.current.position.y = pos[1] + Math.sin(clock.elapsedTime * 0.5 + phase) * 0.35 + progress.current * H * 0.06;
  });

  return (
    <mesh ref={ref} geometry={crystalGeos[kind]} position={pos} scale={scale} material={gold ? goldCrystalMat : undefined}>
      {!gold && (
        <meshPhysicalMaterial
          color="#245DFF"
          roughness={0.08}
          metalness={0.1}
          transmission={mobile ? 0 : 0.55}
          transparent={mobile}
          opacity={mobile ? 0.85 : 1}
          thickness={0.9}
          ior={1.5}
          clearcoat={1}
          envMapIntensity={1.7}
          flatShading
        />
      )}
    </mesh>
  );
}

function Particles({ count, progress }) {
  const ref = useRef(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = -Math.random() * (H + 6) + 3;
      arr[i * 3 + 2] = -7 + Math.random() * 11;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.015 + progress.current * 0.6;
    ref.current.position.y = progress.current * 1.5;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#8FB0FF" size={0.05} sizeAttenuation transparent opacity={0.75} depthWrite={false} />
    </points>
  );
}

function Ribbon({ progress, velocity, mobile }) {
  const group = useRef(null);
  const N = mobile ? 200 : 360;

  const geometry = useMemo(() => {
    const pos = new Float32Array(N * 2 * 3);
    const index = [];
    const up = new THREE.Vector3(0, 0, 1);
    const a = new THREE.Vector3();
    const s = new THREE.Vector3();
    const n = new THREE.Vector3();

    for (let k = 0; k < N; k++) {
      const t = k / (N - 1);
      const p = curve.getPoint(t);
      const tg = curve.getTangent(t).normalize();
      s.crossVectors(tg, up).normalize();
      n.crossVectors(tg, s).normalize();
      const ang = t * Math.PI * 7;
      const w = 0.62 * (1 - THREE.MathUtils.smoothstep(t, 0.82, 1) * 0.45);
      a.copy(s).multiplyScalar(Math.cos(ang)).addScaledVector(n, Math.sin(ang)).multiplyScalar(w);
      pos.set([p.x - a.x, p.y - a.y, p.z - a.z, p.x + a.x, p.y + a.y, p.z + a.z], k * 6);
      if (k < N - 1) {
        const b = k * 2;
        index.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setIndex(index);
    g.computeVertexNormals();
    return g;
  }, [N]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const p = progress.current;
    const head = Math.min(1, 0.22 + p * 1.1);
    geometry.setDrawRange(0, Math.floor((N - 1) * head) * 6);
    // scroll velocity adds a live twist/sway to the ribbon
    const v = THREE.MathUtils.clamp(velocity.current * 6, -0.6, 0.6);
    group.current.rotation.y = Math.sin(p * 5) * 0.3 + Math.sin(clock.elapsedTime * 0.4) * 0.03 + v;
    group.current.rotation.z = p * 0.35 * (1 - p * 0.6) + v * 0.4;
    group.current.rotation.x = v * 0.25;
  });

  const rings = mobile ? RINGS.filter((_, i) => i % 2 === 0) : RINGS;

  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color="#0756BD"
          roughness={0.07}
          metalness={0.05}
          transmission={mobile ? 0 : 0.6}
          transparent={mobile}
          opacity={mobile ? 0.88 : 1}
          thickness={0.6}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.04}
          envMapIntensity={1.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {rings.map((r, i) => (
        <mesh key={i} geometry={ringGeo} material={ringMat} position={r.position} quaternion={r.quaternion} />
      ))}
    </group>
  );
}

function Rig({ progress, velocity, mobile }) {
  const target = useRef(0);
  const { camera } = useThree();
  const reduce = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  useEffect(() => {
    camera.fov = mobile ? 50 : 36;
    camera.updateProjectionMatrix();
  }, [mobile, camera]);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let probe = null;
    if (coarse && window.CSS?.supports?.("height", "100lvh")) {
      probe = document.createElement("div");
      probe.setAttribute("aria-hidden", "true");
      probe.style.cssText =
        "position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none";
      document.body.appendChild(probe);
    }
    const viewport = () => (probe && probe.offsetHeight) || window.innerHeight;

    const rootEl = document.querySelector("[data-scene-root]");
    const read = () => {
      const end = rootEl
        ? rootEl.getBoundingClientRect().bottom + window.scrollY
        : document.documentElement.scrollHeight;
      const max = end - viewport();
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
      probe?.remove();
    };
  }, []);

  useFrame(({ camera, pointer, clock }, delta) => {
    // scroll velocity (progress units per frame-ish), smoothed
    velocity.current = THREE.MathUtils.damp(velocity.current, target.current - progress.current, 5, delta);
    progress.current = THREE.MathUtils.damp(progress.current, target.current, 4, delta);
    const p = progress.current;
    const y = -p * H * 0.92 - 1;
    const drift = mobile && !reduce ? Math.sin(clock.elapsedTime * 0.35) * 0.22 : 0;
    const px = mobile ? drift : pointer.x * 0.35;
    const py = mobile ? drift * 0.5 : pointer.y * 0.2;
    camera.position.set(Math.sin(p * 4) * 1.2 * (1 - p * 0.7) + px, y + py, 11 - Math.sin(p * Math.PI) * 3);
    camera.lookAt(0, y - 1.5, 0);
    // tiny roll from scroll speed for a "pulled along" feel
    camera.rotation.z += THREE.MathUtils.clamp(velocity.current * 1.2, -0.05, 0.05);
  });

  return null;
}

function Scene({ progress }) {
  const velocity = useRef(0);
  const size = useThree((s) => s.size);
  const mobile = isCompact(size.width, size.height);
  const sheets = mobile ? SHEETS.filter((_, i) => i % 3 !== 2) : SHEETS;
  const crystals = mobile ? CRYSTALS.filter((_, i) => i % 2 === 0) : CRYSTALS;

  const aspect = size.width / Math.max(size.height, 1);
  const halfW = 4.43 * aspect;
  const fit = THREE.MathUtils.clamp(halfW / 2.215, 0.7, 1.4);
  const groupScale = mobile ? THREE.MathUtils.clamp(0.72 * fit, 0.5, 1) : 1;
  const groupX = mobile ? THREE.MathUtils.clamp(1.5 * fit, 0.8, 2.6) : 0;

  return (
    <>
      <color attach="background" args={[NAVY]} />
      <fog attach="fog" args={[NAVY, 12, 30]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 8, 8]} intensity={2} />
      <pointLight position={[-6, -8, 4]} intensity={60} color="#2a6bff" distance={26} />
      <Rig progress={progress} velocity={velocity} mobile={mobile} />

      <Particles count={mobile ? 220 : 520} progress={progress} />

      <group position={mobile ? [groupX, 0, -2] : [0, 0, 0]} scale={groupScale}>
        {sheets.map((s, i) => (
          <Sheet key={i} {...s} progress={progress} scale={mobile ? 0.8 : 1} />
        ))}
        {crystals.map((c, i) => (
          <Crystal key={i} {...c} progress={progress} velocity={velocity} mobile={mobile} />
        ))}
        <Ribbon progress={progress} velocity={velocity} mobile={mobile} />
      </group>

      <Suspense fallback={null}>
        <Environment preset="studio" />
      </Suspense>
    </>
  );
}

function useCompact() {
  const [compact, setCompact] = useState(
    () => typeof window !== "undefined" && isCompact(window.innerWidth, window.innerHeight)
  );
  useEffect(() => {
    const on = () => setCompact(isCompact(window.innerWidth, window.innerHeight));
    window.addEventListener("resize", on);
    window.addEventListener("orientationchange", on);
    return () => {
      window.removeEventListener("resize", on);
      window.removeEventListener("orientationchange", on);
    };
  }, []);
  return compact;
}

export default function RibbonWorld() {
  const progress = useRef(0);
  const compact = useCompact();
  const [lowPerf, setLowPerf] = useState(false);

  const dpr = compact && lowPerf ? [0.75, 1.1] : [1, 1.5];

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 11], fov: compact ? 50 : 36, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      {compact && <PerformanceMonitor onDecline={() => setLowPerf(true)} flipflops={2} />}
      <Scene progress={progress} />
    </Canvas>
  );
}