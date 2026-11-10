import { Suspense, useLayoutEffect, useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Center, Edges, Environment, Lightformer, Line, MeshReflectorMaterial,
  PerformanceMonitor, Text, Text3D,
} from "@react-three/drei";
import { ChromaticAberration, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

/* BEYOND THE LENS — one continuous 3D world driven by a single progress value (progress.v, 0..1)
   owned by the master GSAP timeline in About.jsx. Nothing in here listens to scroll. */

const C = { obs: "#08090B", char: "#121417", cu: "#B87345", am: "#D99A54", au: "#C7A477", iv: "#EAE4DA" };
const FONT = "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"; // swap for a brand font / real logo geometry
const Z = [-18, -32, -46, -60]; // stage depths
const PATH = [ // camera spline: lens approach, through the lens, 4 stages, void, logo, pull-back
  [0, 0, 22], [0, 0, 14], [0, 0, 7], [0, 0, 1], [0, 0, -5], [0, 0.2, -13], [0, 0.1, -27],
  [0, 0.2, -41], [0, 0.1, -55], [0, 0, -68], [0, 0, -76], [0, 0, -86], [0, 0.5, -74],
];

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const sstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const bell = (a, b, c, d, x) => sstep(a, b, x) * (1 - sstep(c, d, x));
const useWin = (ref, p, a, b) => useFrame(() => { if (ref.current) ref.current.visible = p.v > a && p.v < b; });

function quality() {
  const mobile = window.matchMedia("(max-width: 768px)").matches || window.matchMedia("(pointer: coarse)").matches;
  const low = mobile || (navigator.hardwareConcurrency || 8) <= 4;
  return {
    mobile, dpr: mobile ? [1, 1.5] : [1, 2], particles: mobile ? 320 : 760, dust: mobile ? 180 : 520,
    transmission: !low, reflector: !mobile, post: !mobile, seg: mobile ? 48 : 96, tex: mobile ? 256 : 512,
  };
}

/* ---------- shared materials & procedural textures ---------- */
const MAT = {
  black: new THREE.MeshStandardMaterial({ color: "#0c0d0f", metalness: 0.9, roughness: 0.38 }),
  chrome: new THREE.MeshStandardMaterial({ color: "#1a1c20", metalness: 1, roughness: 0.14 }),
  copper: new THREE.MeshStandardMaterial({ color: C.cu, metalness: 1, roughness: 0.3 }),
  alu: new THREE.MeshStandardMaterial({ color: "#34373c", metalness: 0.95, roughness: 0.5 }),
  dark: new THREE.MeshStandardMaterial({ color: "#050506", metalness: 0.6, roughness: 0.7, side: THREE.DoubleSide }),
  brushed: new THREE.MeshPhysicalMaterial({ color: C.cu, metalness: 1, roughness: 0.4, anisotropy: 0.85 }),
  glassLite: new THREE.MeshPhysicalMaterial({
    color: "#2a1d14", roughness: 0.04, transparent: true, opacity: 0.3, clearcoat: 1,
    envMapIntensity: 2, side: THREE.DoubleSide, depthWrite: false,
  }),
};

let _sprite;
const sprite = () => _sprite || (_sprite = (() => {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.4, "rgba(255,255,255,.35)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
})());

const gradTex = (w, h, vert, stops) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d"), g = vert ? x.createLinearGradient(0, 0, 0, h) : x.createLinearGradient(0, 0, w, 0);
  stops.forEach(([o, col]) => g.addColorStop(o, col)); x.fillStyle = g; x.fillRect(0, 0, w, h);
  return new THREE.CanvasTexture(c);
};

function paperTex(i, s) {
  const w = s, h = Math.round(s * 1.25), c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d"), m = w * 0.1;
  x.fillStyle = C.iv; x.fillRect(0, 0, w, h);
  for (let k = 0; k < s * 8; k++) { x.fillStyle = `rgba(80,60,40,${Math.random() * 0.06})`; x.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
  x.strokeStyle = C.cu; x.lineWidth = 2; x.strokeRect(m, m, w - 2 * m, h * 0.55);
  x.strokeStyle = "rgba(18,20,23,.55)"; x.lineWidth = 1.2; x.beginPath();
  x.moveTo(m, m + h * 0.55); x.lineTo(w - m, m); x.moveTo(m, m); x.lineTo(w * (0.4 + 0.08 * i), m + h * 0.55);
  x.moveTo(m, m + h * (0.2 + 0.05 * i)); x.lineTo(w - m, m + h * (0.2 + 0.05 * i)); x.stroke();
  x.beginPath(); x.arc(w * (0.28 + 0.09 * (i % 4)), h * 0.24, w * 0.09, 0, 6.283); x.stroke();
  x.fillStyle = "rgba(18,20,23,.35)"; for (let k = 0; k < 4; k++) x.fillRect(m, h * 0.72 + k * (h * 0.045), (w - 2 * m) * (0.92 - 0.16 * k), 2);
  x.fillStyle = C.cu; x.font = `${w * 0.05}px monospace`; x.fillText(`SC ${i + 1}  ·  FRAME ${12 + i * 7}`, m, h - m * 0.7);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

function filmTex() {
  const c = document.createElement("canvas"); c.width = 128; c.height = 512;
  const x = c.getContext("2d"); x.fillStyle = "#0b0a09"; x.fillRect(0, 0, 128, 512);
  for (let k = 0; k < 8; k++) {
    const y = k * 64; x.fillStyle = "#26211c";
    x.fillRect(6, y + 12, 10, 14); x.fillRect(112, y + 12, 10, 14); x.fillRect(6, y + 40, 10, 14); x.fillRect(112, y + 40, 10, 14);
    const g = x.createLinearGradient(22, y, 106, y + 60); g.addColorStop(0, k % 2 ? C.cu : "#2a1d14"); g.addColorStop(1, k % 2 ? "#1a120c" : C.am);
    x.fillStyle = g; x.fillRect(22, y + 6, 84, 52);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 3); return t;
}

function drawReel(x, w, h, t, s) {
  x.fillStyle = C.obs; x.fillRect(0, 0, w, h);
  [[C.am, 0], [C.cu, 1], [C.au, 2]].forEach(([col, i]) => {
    const px = w * (0.5 + 0.32 * Math.sin(t * 0.4 + i * 2 + s)), py = h * (0.5 + 0.3 * Math.cos(t * 0.33 + i * 1.7 + s * 2));
    const r = h * (0.55 + 0.12 * Math.sin(t + i)), g = x.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, col + "cc"); g.addColorStop(1, col + "00"); x.fillStyle = g; x.fillRect(0, 0, w, h);
  });
  x.strokeStyle = "rgba(234,228,218,.45)"; x.lineWidth = 1.2;
  for (let i = 0; i < 5; i++) { x.beginPath(); x.ellipse(w / 2, h / 2, w * (0.08 + i * 0.07), h * (0.12 + i * 0.07), t * 0.2 * (i % 2 ? 1 : -1) + s, 0, 6.283); x.stroke(); }
  x.fillStyle = C.obs; x.fillRect(0, 0, w, h * 0.1); x.fillRect(0, h * 0.9, w, h * 0.1);
  x.fillStyle = C.iv; x.font = `${h * 0.045}px monospace`;
  x.fillText(`RCS REEL 0${s + 1}   00:00:${String(Math.floor(t) % 60).padStart(2, "0")}:${String(Math.floor((t % 1) * 24)).padStart(2, "0")}`, w * 0.04, h * 0.96);
}

/* ---------- instanced helper ---------- */
function Inst({ n, set, size, mat }) {
  const ref = useRef();
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) { o.position.set(0, 0, 0); o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1); set(i, o); o.updateMatrix(); ref.current.setMatrixAt(i, o.matrix); }
    ref.current.instanceMatrix.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);
  return <instancedMesh ref={ref} args={[null, null, n]} material={mat}><boxGeometry args={size} /></instancedMesh>;
}

/* ---------- global direction: exposure, fog, chromatic aberration ---------- */
function Director({ p, ca }) {
  useFrame(({ scene }) => {
    const t = p.v, ex = p.intro * (0.35 + 0.65 * sstep(0, 0.08, t));
    p.ex = ex;
    scene.environmentIntensity = 0.9 * ex;
    if (scene.fog) scene.fog.far = 58 + 70 * sstep(0.84, 0.95, t);
    const k = bell(0.2, 0.26, 0.32, 0.37, t);
    ca.set(k * 0.0035, k * 0.002);
  });
  return null;
}

function Env() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={6} color={C.am} position={[-7, 3, 5]} rotation-y={Math.PI / 3} scale={[9, 1.2, 1]} />
      <Lightformer form="rect" intensity={3} color={C.au} position={[7, -1, 6]} rotation-y={-Math.PI / 3} scale={[1.2, 10, 1]} />
      <Lightformer form="ring" intensity={2.5} color={C.iv} position={[0, 7, -3]} rotation-x={Math.PI / 2} scale={5} />
      <Lightformer form="rect" intensity={4} color={C.cu} position={[0, -3, -8]} scale={[14, 1, 1]} />
    </Environment>
  );
}

function Lights({ p }) {
  const sweep = useRef(), core = useRef(), key = useRef(), rim = useRef();
  useFrame(() => {
    const t = p.v, ex = p.ex ?? 1;
    sweep.current.position.x = THREE.MathUtils.lerp(-9, 9, sstep(0.02, 0.15, t));
    sweep.current.intensity = 320 * ex * bell(0, 0.03, 0.12, 0.17, t);
    core.current.intensity = 70 * bell(0.14, 0.24, 0.34, 0.42, t);
    key.current.intensity = 0.5 * ex * (1 - sstep(0.4, 0.5, t));
    rim.current.intensity = 1.2 * ex * (1 - sstep(0.4, 0.5, t));
  });
  return (
    <>
      <ambientLight intensity={0.05} />
      <directionalLight ref={key} position={[-5, 6, 8]} color="#fff0dc" />
      <directionalLight ref={rim} position={[6, 2, -6]} color={C.cu} />
      <spotLight ref={sweep} position={[0, 3, 12]} angle={0.3} penumbra={0.7} color={C.am} distance={40} />
      <pointLight ref={core} position={[0, 0, 0.5]} color={C.am} distance={12} />
    </>
  );
}

/* ---------- camera rig: one spline, one progress value ---------- */
function Rig({ p, q }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(PATH.map((v) => new THREE.Vector3(...v))), []);
  const light = useRef(), look = useMemo(() => new THREE.Vector3(), []), m = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  useEffect(() => {
    if (q.mobile) return;
    const f = (e) => { m.current.tx = (e.clientX / innerWidth) * 2 - 1; m.current.ty = -((e.clientY / innerHeight) * 2 - 1); };
    addEventListener("pointermove", f, { passive: true });
    return () => removeEventListener("pointermove", f);
  }, [q]);
  useFrame(({ camera }, dt) => {
    const t = clamp01(p.v), s = m.current, k = Math.min(1, dt * 2);
    s.x += (s.tx - s.x) * k; s.y += (s.ty - s.y) * k;
    curve.getPoint(t, camera.position);
    const par = sstep(0.3, 0.4, t) * (1 - sstep(0.86, 0.94, t));
    look.set(s.x * 0.9 * par, camera.position.y * 0.2 + s.y * 0.5 * par - sstep(0.85, 1, t) * 0.6, camera.position.z - 10);
    camera.lookAt(look);
    camera.rotateZ(bell(0.2, 0.3, 0.3, 0.38, t) * 0.06);
    camera.fov = (q.mobile ? 48 : 38) + 16 * bell(0.2, 0.26, 0.3, 0.37, t);
    camera.updateProjectionMatrix();
    light.current.position.set(camera.position.x, camera.position.y + 1.4, camera.position.z + 2);
    light.current.intensity = 16 * (p.ex ?? 1) * sstep(0.3, 0.38, t) * (1 - sstep(0.74, 0.82, t));
  });
  return <pointLight ref={light} color="#ffd9a8" distance={24} />;
}

function Dust({ q }) {
  const ref = useRef();
  const geo = useMemo(() => {
    const a = new Float32Array(q.dust * 3);
    for (let i = 0; i < q.dust; i++) { a[i * 3] = (Math.random() - 0.5) * 30; a[i * 3 + 1] = (Math.random() - 0.5) * 16; a[i * 3 + 2] = 22 - Math.random() * 140; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(a, 3)); return g;
  }, [q]);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame(({ clock }) => { ref.current.position.y = Math.sin(clock.elapsedTime * 0.15) * 0.4; ref.current.rotation.z = clock.elapsedTime * 0.004; });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial map={sprite()} size={0.08} color={C.au} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  );
}

function Shaft({ p }) {
  const ref = useRef(), mat = useRef();
  const tex = useMemo(() => gradTex(4, 128, true, [[0, "#fff"], [1, "#000"]]), []);
  useFrame(() => { ref.current.visible = p.v < 0.16; mat.current.opacity = 0.12 * bell(0, 0.04, 0.08, 0.14, p.v) * (p.ex ?? 1); });
  return (
    <mesh ref={ref} position={[0, 0, 4.5]} rotation-x={-Math.PI / 2}>
      <coneGeometry args={[3.6, 9, 48, 1, true]} />
      <meshBasicMaterial ref={mat} alphaMap={tex} color={C.am} transparent blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Floor({ y, size, q }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={y}>
      <planeGeometry args={[size, size]} />
      {q.reflector ? (
        <MeshReflectorMaterial blur={[300, 80]} resolution={512} mixBlur={1} mixStrength={35} roughness={0.9} depthScale={1}
          minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#0a0b0d" metalness={0.6} mirror={0} />
      ) : <meshStandardMaterial color="#0a0b0d" metalness={0.8} roughness={0.4} />}
    </mesh>
  );
}

/* ================= SCENE 01 / 02 — THE LENS ================= */
const BANDS = [["alu", 2.0, -2.6, -2.0], ["black", 2.45, -2.0, -0.6], ["black", 2.6, -0.6, 1.0], ["copper", 2.63, 1.0, 1.1], ["alu", 2.5, 1.1, 1.7], ["black", 2.9, 1.7, 2.45], ["copper", 2.95, 2.45, 2.5]];
const SHOULDERS = [[2.0, 2.45, -2.0, "alu"], [2.45, 2.6, -0.6, "black"], [2.5, 2.9, 1.7, "chrome"], [2.0, 2.95, 2.5, "chrome"]];
const ELEMS = [{ y: 2.15, cap: true }, { y: 1.55, r: 1.85 }, { y: 0.7, r: 1.75 }, { y: -0.3, r: 1.6 }, { y: -1.3, r: 1.5 }, { y: -2.0, r: 1.4 }];
const BLADES = 9;

function Engrave() {
  const items = [["RCS · CINE PRIME", Math.PI / 2], ["T1.3", 0], ["50 mm", Math.PI], ["Nº 0001", -Math.PI / 2]];
  return items.map(([s, a]) => (
    <Text key={s} position={[Math.cos(a) * 2.4, Math.sin(a) * 2.4, 2.515]} rotation={[0, 0, a - Math.PI / 2]} fontSize={0.15} letterSpacing={0.18} color={C.au} anchorX="center" anchorY="middle">{s}</Text>
  ));
}

function Lens({ p, q }) {
  const root = useRef(), focus = useRef(), els = useRef([]), blades = useRef([]);
  const glass = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#2a1d14", metalness: 0, roughness: 0.03, transmission: q.transmission ? 0.95 : 0, transparent: !q.transmission,
    opacity: q.transmission ? 1 : 0.38, ior: 1.5, thickness: 0.8, clearcoat: 1, envMapIntensity: 2.2,
    attenuationColor: new THREE.Color("#5a3516"), attenuationDistance: 3, side: THREE.DoubleSide,
  }), [q]);
  useEffect(() => () => glass.dispose(), [glass]);
  const bladeShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0.35, 0); s.quadraticCurveTo(0.7, -0.6, 0.1, -1.2); s.quadraticCurveTo(-0.5, -0.8, -0.35, 0); s.closePath();
    return s;
  }, []);

  useFrame(({ clock }) => {
    const t = p.v, time = clock.elapsedTime;
    root.current.visible = t < 0.44;
    root.current.rotation.set(0, 0, 0);
    focus.current.rotation.y = t * 3.2;
    els.current.forEach((g, i) => { if (g) g.rotation.y = (i % 2 ? 1 : -1) * (t * 4 + time * 0.08); });
    const open = 0.3 + 0.12 * Math.sin(t * 50) * (1 - sstep(0.08, 0.13, t)) + 0.7 * sstep(0.1, 0.22, t);
    const swing = THREE.MathUtils.lerp(0.55, 1.95, open);
    blades.current.forEach((b, i) => { if (b) b.rotation.z = (i / BLADES) * Math.PI * 2 - Math.PI / 2 + swing; });
  });

  return (
    <group ref={root}>
      <group rotation-x={Math.PI / 2}>
        {BANDS.map(([m, r, a, b], i) => (
          <mesh key={i} position-y={(a + b) / 2} material={MAT[m]}><cylinderGeometry args={[r, r, b - a, q.seg, 1, true]} /></mesh>
        ))}
        {SHOULDERS.map(([r0, r1, y, m], i) => (
          <mesh key={i} position-y={y} rotation-x={-Math.PI / 2} material={MAT[m]}><ringGeometry args={[r0, r1, q.seg]} /></mesh>
        ))}
        <mesh position-y={-0.05} material={MAT.dark}><cylinderGeometry args={[1.97, 1.97, 5.1, q.seg, 1, true]} /></mesh>
        {[-1.2, 0.1, 1.3].map((y) => (
          <mesh key={y} position-y={y} material={MAT.copper}><cylinderGeometry args={[1.94, 1.94, 0.06, q.seg, 1, true]} /></mesh>
        ))}
        <group ref={focus} position-y={0.25}>
          <Inst n={108} size={[0.08, 1.3, 0.14]} mat={MAT.chrome}
            set={(i, o) => { const a = (i / 108) * Math.PI * 2; o.position.set(Math.cos(a) * 2.62, 0, Math.sin(a) * 2.62); o.rotation.y = -a; }} />
        </group>
        {ELEMS.map((e, i) => {
          const r = e.cap ? 1.95 : e.r;
          return (
            <group key={i} ref={(g) => (els.current[i] = g)} position-y={e.y}>
              {e.cap ? (
                <mesh position-y={-3.2} material={glass}><sphereGeometry args={[3.2, q.seg, 32, 0, Math.PI * 2, 0, 0.64]} /></mesh>
              ) : (
                <mesh material={MAT.glassLite}><cylinderGeometry args={[e.r, e.r, 0.12, q.seg]} /></mesh>
              )}
              <mesh position-y={e.cap ? -0.3 : 0} material={MAT.copper}><cylinderGeometry args={[r + 0.04, r + 0.04, 0.08, q.seg, 1, true]} /></mesh>
              {[0, 1, 2].map((k) => (
                <mesh key={k} position={[Math.cos(k * 2.09) * r, e.cap ? -0.3 : 0, Math.sin(k * 2.09) * r]} material={MAT.chrome}><boxGeometry args={[0.08, 0.2, 0.08]} /></mesh>
              ))}
            </group>
          );
        })}
      </group>

      {/* aperture blades */}
      <group position-z={1.25}>
        {Array.from({ length: BLADES }, (_, i) => {
          const a = (i / BLADES) * Math.PI * 2;
          return (
            <group key={i} ref={(g) => (blades.current[i] = g)} position={[Math.cos(a) * 1.9, Math.sin(a) * 1.9, i * 0.004]}>
              <mesh scale={1.7} material={MAT.chrome}><extrudeGeometry args={[bladeShape, { depth: 0.012, bevelEnabled: false }]} /></mesh>
            </group>
          );
        })}
      </group>

      {/* engraved scale on the front face */}
      <Inst n={72} size={[0.12, 0.018, 0.012]} mat={MAT.copper}
        set={(i, o) => { const a = (i / 72) * Math.PI * 2; o.position.set(Math.cos(a) * 2.78, Math.sin(a) * 2.78, 2.505); o.rotation.z = a; o.scale.set(i % 6 === 0 ? 1.8 : 1, 1, 1); }} />
      <Suspense fallback={null}><Engrave /></Suspense>
    </group>
  );
}

/* ================= SCENE 03 — STAGES ================= */
function Imagine({ p, q, x }) {
  const g = useRef(), shapes = useRef();
  useWin(g, p, 0.3, 0.52);
  const d = useMemo(() => {
    const N = q.particles, cur = new Float32Array(N * 3), from = new Float32Array(N * 3), to = new Float32Array(N * 3);
    const k = new THREE.TorusKnotGeometry(1.35, 0.34, 220, 12, 2, 3).attributes.position;
    for (let i = 0; i < N; i++) {
      const j = (i * 37) % k.count; to.set([k.getX(j), k.getY(j), k.getZ(j)], i * 3);
      const r = 3 + Math.random() * 5, th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1);
      from.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)], i * 3);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(cur, 3));
    const trails = [0, 1, 2].map((s) => new THREE.CatmullRomCurve3(Array.from({ length: 7 }, (_, i) => new THREE.Vector3(Math.cos(i * 1.1 + s * 2) * (2.4 + s * 0.5), (i - 3) * 0.55, Math.sin(i * 1.1 + s * 2) * (2.4 + s * 0.5)))).getPoints(60));
    return { N, cur, from, to, geo, trails };
  }, [q]);
  useEffect(() => () => d.geo.dispose(), [d]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, e = sstep(0.37, 0.44, p.v), { N, cur, from, to } = d;
    for (let i = 0; i < N * 3; i++) cur[i] = THREE.MathUtils.lerp(from[i] + Math.sin(t * 0.6 + i) * 0.15 * (1 - e), to[i], e);
    d.geo.attributes.position.needsUpdate = true;
    g.current.rotation.y = t * 0.12; shapes.current.rotation.set(t * 0.1, t * 0.15, 0);
  });
  return (
    <group ref={g} position={[x, 0, Z[0]]}>
      <points geometry={d.geo}><pointsMaterial map={sprite()} size={0.07} color={C.am} transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation /></points>
      {d.trails.map((pts, i) => <Line key={i} points={pts} color={C.cu} lineWidth={1} transparent opacity={0.55} />)}
      <group ref={shapes}>
        {[[-3, 1.6, -1, 0.5], [3.2, -1.2, 1, 0.4], [0.5, 2.6, -2, 0.35]].map(([a, b, c, s], i) => (
          <mesh key={i} position={[a, b, c]} scale={s}>{i % 2 ? <octahedronGeometry args={[1, 0]} /> : <icosahedronGeometry args={[1, 0]} />}<meshStandardMaterial color={C.cu} metalness={1} roughness={0.35} wireframe /></mesh>
        ))}
      </group>
    </group>
  );
}

function Concept({ p, q, x }) {
  const g = useRef(), ring = useRef(), wire = useRef();
  useWin(g, p, 0.4, 0.62);
  const tex = useMemo(() => Array.from({ length: 6 }, (_, i) => paperTex(i, q.tex)), [q]);
  useEffect(() => () => tex.forEach((t) => t.dispose()), [tex]);
  useFrame(({ clock }) => { const t = clock.elapsedTime; ring.current.rotation.y = t * 0.12 + p.v * 3; wire.current.rotation.set(t * 0.12, t * 0.18, 0); });
  return (
    <group ref={g} position={[x, 0, Z[1]]}>
      <group ref={ring}>
        {tex.map((t, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 2.6, Math.sin(i * 1.7) * 0.5, Math.sin(a) * 2.6]} rotation={[0, Math.PI / 2 - a, 0]}>
              <planeGeometry args={[1.3, 1.62]} /><meshStandardMaterial map={t} roughness={0.9} side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>
      <group ref={wire}>
        <mesh><boxGeometry args={[1.8, 1.8, 1.8]} /><meshBasicMaterial visible={false} /><Edges color={C.cu} /></mesh>
        <mesh scale={0.8}><icosahedronGeometry args={[1, 1]} /><meshBasicMaterial visible={false} /><Edges color={C.au} /></mesh>
      </group>
      <gridHelper args={[14, 14, C.cu, "#3a2a1c"]} rotation-x={Math.PI / 2} position={[0, 0, -3.5]} material-transparent material-opacity={0.4} />
    </group>
  );
}

function MiniLens({ s = 1 }) {
  return (
    <group scale={s} rotation-x={Math.PI / 2}>
      <mesh material={MAT.black}><cylinderGeometry args={[0.4, 0.44, 0.9, 40]} /></mesh>
      <mesh position-y={0.2} material={MAT.copper}><cylinderGeometry args={[0.45, 0.45, 0.06, 40]} /></mesh>
      <mesh position-y={0.46} material={MAT.glassLite}><cylinderGeometry args={[0.34, 0.34, 0.04, 40]} /></mesh>
    </group>
  );
}

function Create({ p, q, x }) {
  const g = useRef(), rig = useRef(), minis = useRef([]), strips = useRef();
  useWin(g, p, 0.48, 0.7);
  const streak = useMemo(() => gradTex(256, 4, false, [[0, "rgba(217,154,84,0)"], [0.5, "rgba(255,220,170,1)"], [1, "rgba(217,154,84,0)"]]), []);
  const film = useMemo(() => filmTex(), []);
  const ribbon = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1.3, 16, 1, 90), a = geo.attributes.position;
    for (let i = 0; i < a.count; i++) { const y = a.getY(i); a.setZ(i, Math.sin(y * 0.55) * 1.3); a.setX(i, a.getX(i) + Math.cos(y * 0.55) * 0.4); }
    geo.computeVertexNormals(); return geo;
  }, []);
  useEffect(() => () => { streak.dispose(); film.dispose(); ribbon.dispose(); }, [streak, film, ribbon]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    rig.current.rotation.y = -0.6 + Math.sin(t * 0.3) * 0.15 + (p.v - 0.58) * 3;
    minis.current.forEach((m, i) => { if (!m) return; const a = t * 0.2 + i * 2.09; m.position.set(Math.cos(a) * 3.4, Math.sin(t * 0.4 + i) * 0.8 + (i - 1) * 0.4, Math.sin(a) * 2.2 - 1); m.rotation.set(t * 0.2 + i, t * 0.3, 0); });
    film.offset.y = t * 0.04; strips.current.rotation.y = t * 0.05;
  });
  return (
    <group ref={g} position={[x, 0, Z[2]]}>
      <group ref={rig} scale={0.9}>
        <mesh material={MAT.black}><boxGeometry args={[1.5, 1.2, 2.2]} /></mesh>
        <mesh position={[0, 0.72, -0.1]} material={MAT.alu}><boxGeometry args={[1.2, 0.25, 1.4]} /></mesh>
        <mesh position={[0, 1.05, -0.1]} material={MAT.chrome}><boxGeometry args={[0.12, 0.35, 1.1]} /></mesh>
        <mesh position={[0.95, 0.3, -0.8]} rotation-z={Math.PI / 2} material={MAT.black}><cylinderGeometry args={[0.26, 0.3, 0.9, 24]} /></mesh>
        <mesh position={[0.76, 0.1, 0]} material={MAT.copper}><boxGeometry args={[0.02, 0.5, 1.6]} /></mesh>
        <mesh position={[0, 0, 1.35]} rotation-x={Math.PI / 2} material={MAT.alu}><cylinderGeometry args={[0.62, 0.62, 0.5, 48]} /></mesh>
        <mesh position={[0, 0, 2.2]} rotation-x={Math.PI / 2} material={MAT.black}><cylinderGeometry args={[0.5, 0.55, 1.3, 48]} /></mesh>
        <mesh position={[0, 0, 2.5]} rotation-x={Math.PI / 2} material={MAT.copper}><cylinderGeometry args={[0.56, 0.56, 0.08, 48]} /></mesh>
        <mesh position={[0, 0, 2.86]} rotation-x={Math.PI / 2} material={MAT.glassLite}><cylinderGeometry args={[0.46, 0.46, 0.04, 48]} /></mesh>
        {[[0, 0.68, 3.1, 1.5, 0.06], [0, -0.68, 3.1, 1.5, 0.06], [0.74, 0, 3.1, 0.06, 1.3], [-0.74, 0, 3.1, 0.06, 1.3]].map(([a, b, c, w, h], i) => (
          <mesh key={i} position={[a, b, c]} material={MAT.black}><boxGeometry args={[w, h, 0.5]} /></mesh>
        ))}
      </group>
      {[0, 1, 2].map((i) => <group key={i} ref={(m) => (minis.current[i] = m)}><MiniLens s={0.8 + i * 0.15} /></group>)}
      <group position={[-3.4, 1.8, -2]} rotation-y={0.5}>
        <mesh material={MAT.black}><boxGeometry args={[2.4, 1.4, 0.3]} /></mesh>
        <mesh position-z={0.16}><planeGeometry args={[2.2, 1.2]} /><meshBasicMaterial color="#ffcf91" toneMapped={false} /></mesh>
        <pointLight position-z={1.5} color={C.am} intensity={30} distance={14} />
      </group>
      {[[0, 0.6, -1.5, 18, 0.05], [0, -0.9, 0.5, 14, 0.035], [0, 1.9, -3.5, 22, 0.06]].map(([a, b, c, w, h], i) => (
        <mesh key={i} position={[a, b, c]} rotation-z={0.04 * (i - 1)}><planeGeometry args={[w, h]} /><meshBasicMaterial map={streak} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
      ))}
      <group ref={strips} position={[-0.5, 0, -3]} rotation-z={0.5}>
        <mesh geometry={ribbon}><meshStandardMaterial map={film} roughness={0.6} metalness={0.2} side={THREE.DoubleSide} /></mesh>
      </group>
    </group>
  );
}

function Panel({ pos, rot, seed, q, p, size = [3.6, 2.025] }) {
  const w = q.mobile ? 384 : 640, h = Math.round((w * 9) / 16), last = useRef(0);
  const d = useMemo(() => { const c = document.createElement("canvas"); c.width = w; c.height = h; const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return { ctx: c.getContext("2d"), tex }; }, [w, h]);
  useEffect(() => () => d.tex.dispose(), [d]);
  useFrame(({ clock }) => {
    if (p.v < 0.6 || p.v > 0.76) return;
    const t = clock.elapsedTime; if (t - last.current < 1 / 24) return;
    last.current = t; drawReel(d.ctx, w, h, t, seed); d.tex.needsUpdate = true;
  });
  return (
    <group position={pos} rotation={rot}>
      <mesh position-z={-0.06} material={MAT.copper}><boxGeometry args={[size[0] + 0.16, size[1] + 0.16, 0.06]} /></mesh>
      <mesh><planeGeometry args={size} /><meshBasicMaterial map={d.tex} toneMapped={false} /></mesh>
    </group>
  );
}

function Deliver({ p, q, x }) {
  const g = useRef();
  useWin(g, p, 0.57, 0.78);
  return (
    <group ref={g} position={[x, 0, Z[3]]} scale={q.mobile ? 0.7 : 1}>
      <Panel p={p} q={q} seed={0} pos={[0, 0.2, 0]} rot={[0, 0, 0]} />
      <Panel p={p} q={q} seed={1} pos={[-4.4, 0.3, -1.4]} rot={[0, 0.4, 0]} size={[2.8, 1.575]} />
      <Panel p={p} q={q} seed={2} pos={[4.4, -0.1, -1.2]} rot={[0, -0.4, 0]} size={[2.8, 1.575]} />
      <Floor y={-2.2} size={50} q={q} />
    </group>
  );
}

/* ================= SCENE 05 — THE LOGO ================= */
function Logo({ p, q }) {
  const g = useRef(), l1 = useRef(), l2 = useRef(), l3 = useRef();
  useFrame(({ clock }) => {
    const t = p.v, vis = t > 0.78; g.current.visible = vis; if (!vis) return;
    const r = sstep(0.88, 0.95, t) * (p.ex ?? 1);
    l1.current.intensity = l2.current.intensity = 140 * r; l3.current.intensity = 90 * r;
    g.current.rotation.y = Math.sin(clock.elapsedTime * 0.25) * 0.12 + (1 - sstep(0.88, 0.97, t)) * 0.4;
  });
  return (
    <group ref={g} position={[0, 0, -104]} scale={q.mobile ? 0.4 : 1}>
      <Suspense fallback={null}>
        <Center>
          <Text3D font={FONT} size={3.4} height={0.9} bevelEnabled bevelSize={0.05} bevelThickness={0.08} curveSegments={q.mobile ? 4 : 10} letterSpacing={0.12} material={[MAT.brushed, MAT.chrome]}>RCS</Text3D>
        </Center>
      </Suspense>
      <pointLight ref={l1} position={[-7, 2, -3]} color={C.am} distance={30} />
      <pointLight ref={l2} position={[7, 2, -3]} color={C.cu} distance={30} />
      <pointLight ref={l3} position={[0, 4, 6]} color={C.iv} distance={30} />
      <Floor y={-2.4} size={90} q={q} />
    </group>
  );
}

/* ================= CANVAS ================= */
export default function FilmCanvas({ progress, active = true }) {
  const q = useMemo(quality, []);
  const [dpr, setDpr] = useState(q.dpr[1]);
  const ca = useMemo(() => new THREE.Vector2(0, 0), []);
  const x = q.mobile ? 0 : 2.0;
  return (
    <Canvas
      dpr={dpr} frameloop={active ? "always" : "demand"} resize={{ scroll: false }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      camera={{ fov: q.mobile ? 48 : 38, near: 0.05, far: 300, position: [0, 0, 22] }}
      gl={{ antialias: !q.post, powerPreference: "high-performance" }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(q.dpr[1])} />
      <color attach="background" args={[C.obs]} />
      <fog attach="fog" args={[C.obs, 24, 58]} />
      <Suspense fallback={null}>
        <Env />
        <Director p={progress} ca={ca} />
        <Lights p={progress} />
        <Rig p={progress} q={q} />
        <Dust q={q} />
        <Shaft p={progress} />
        <Lens p={progress} q={q} />
        <Imagine p={progress} q={q} x={x} />
        <Concept p={progress} q={q} x={x} />
        <Create p={progress} q={q} x={x} />
        <Deliver p={progress} q={q} x={x} />
        <Logo p={progress} q={q} />
        {q.post && (
          <EffectComposer multisampling={4}>
            <ChromaticAberration offset={ca} radialModulation={false} modulationOffset={0} />
            <Vignette offset={0.25} darkness={0.75} />
            <Noise opacity={0.035} blendFunction={BlendFunction.SOFT_LIGHT} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}