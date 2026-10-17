import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";

/*
  One shared scene for the whole About page. The canvas is fixed behind the
  content; the camera descends along a tall vertical path as the page scrolls.
  The path narrows toward the end so the ribbon "resolves" at the final CTA.

  Responsive rules
  - "compact" = phones (< 768px wide) and portrait tablets (< 1024px, taller than wide).
  - Everything the desktop view uses (fov 36, full ribbon, transmission, all sheets,
    pointer parallax) is untouched; only the compact branches below change.
*/
const H = 34;
const STOPS = 14;

const isCompact = (w, h) => w < 768 || (w < 1024 && w < h);

const curve = new THREE.CatmullRomCurve3(
  Array.from({ length: STOPS }, (_, i) => {
    // converge toward the centre axis over the last stops
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
    depth: 0.04 + (i % 3) * 0.03, // parallax strength
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
const sheetMat = new THREE.MeshStandardMaterial({ color: "#d9d8d3", roughness: 0.92 });
const ruleMat = new THREE.MeshBasicMaterial({ color: "#0756BD" });
const ringMat = new THREE.MeshStandardMaterial({
  color: "#e6ebf5",
  metalness: 1,
  roughness: 0.14,
  envMapIntensity: 1.4,
});

function Sheet({ pos, rot, phase, depth, progress, scale }) {
  const ref = useRef(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime + phase;
    // different parallax speed per sheet + a slow idle drift
    ref.current.position.y =
      pos[1] + progress.current * H * depth + Math.sin(t * 0.3) * 0.1;
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

function Ribbon({ progress, mobile }) {
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
      // ribbon tightens slightly at the end (resolve)
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
    group.current.rotation.y = Math.sin(p * 5) * 0.3 + Math.sin(clock.elapsedTime * 0.4) * 0.03;
    group.current.rotation.z = p * 0.35 * (1 - p * 0.6);
  });

  const rings = mobile ? RINGS.filter((_, i) => i % 2 === 0) : RINGS;

  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color="#0756BD"
          roughness={0.07}
          metalness={0.05}
          // transmission is costly: use plain transparency on phones
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

function Rig({ progress, mobile }) {
  const target = useRef(0);
  const { camera } = useThree();
  const reduce = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  useEffect(() => {
    camera.fov = mobile ? 50 : 36;
    camera.updateProjectionMatrix();
  }, [mobile, camera]);

  useEffect(() => {
    // Touch devices: measure against the LARGE viewport (100lvh) so the browser toolbar
    // sliding in/out never changes the scroll range (no jumps, and progress still reaches 1).
    // Desktop (mouse) keeps using window.innerHeight exactly as before.
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

    const read = () => {
      const max = document.documentElement.scrollHeight - viewport();
      target.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    // content height changes (FAQ open, lazy layout) shift the max scroll
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
    progress.current = THREE.MathUtils.damp(progress.current, target.current, 4, delta);
    const p = progress.current;
    const y = -p * H * 0.92 - 1;
    // desktop: pointer parallax. phones: no pointer, so a very gentle idle drift instead
    const drift = mobile && !reduce ? Math.sin(clock.elapsedTime * 0.35) * 0.22 : 0;
    const px = mobile ? drift : pointer.x * 0.35;
    const py = mobile ? drift * 0.5 : pointer.y * 0.2;
    camera.position.set(Math.sin(p * 4) * 1.2 * (1 - p * 0.7) + px, y + py, 11 - Math.sin(p * Math.PI) * 3);
    camera.lookAt(0, y - 1.5, 0);
  });

  return null;
}

function Scene({ progress }) {
  const size = useThree((s) => s.size);
  const mobile = isCompact(size.width, size.height);
  const sheets = mobile ? SHEETS.filter((_, i) => i % 3 !== 2) : SHEETS;

  // Adaptive fit for compact screens. `fit` is exactly 1 at a typical phone (aspect 0.5),
  // which reproduces the original 0.72 scale / 1.5 offset; narrower or wider screens adapt.
  const aspect = size.width / Math.max(size.height, 1);
  const halfW = 4.43 * aspect; // visible half-width at mid-scroll (fov 50)
  const fit = THREE.MathUtils.clamp(halfW / 2.215, 0.7, 1.4);
  const groupScale = mobile ? THREE.MathUtils.clamp(0.72 * fit, 0.5, 1) : 1;
  const groupX = mobile ? THREE.MathUtils.clamp(1.5 * fit, 0.8, 2.6) : 0;

  return (
    <>
      <color attach="background" args={["#07080b"]} />
      <fog attach="fog" args={["#07080b", 12, 30]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 8, 8]} intensity={2} />
      <pointLight position={[-6, -8, 4]} intensity={60} color="#2a6bff" distance={26} />
      <Rig progress={progress} mobile={mobile} />

      {/* on phones the whole installation sits to the right and smaller,
          so it stays clear of the left-aligned headline */}
      <group position={mobile ? [groupX, 0, -2] : [0, 0, 0]} scale={groupScale}>
        {sheets.map((s, i) => (
          <Sheet key={i} {...s} progress={progress} scale={mobile ? 0.8 : 1} />
        ))}
        <Ribbon progress={progress} mobile={mobile} />
      </group>

      {/* its own Suspense: the scene renders straight away while the HDR streams in (slow mobile networks) */}
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

  // desktop: [1, 1.5] as before. phones: [1, 1.5] too, stepping down only if the frame rate drops
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