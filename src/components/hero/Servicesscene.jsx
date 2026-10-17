import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ss = (t) => t * t * (3 - 2 * t);
const w = (i, f) => ss(clamp(1 - Math.abs(f - i))); // weight of stage i at scroll position f
const mix = THREE.MathUtils.lerp;

// Shared materials + geometries: created once, never rebuilt per frame.
const M = {
  chrome: new THREE.MeshStandardMaterial({ color: "#C7CDD6", metalness: 1, roughness: 0.12 }),
  glass: new THREE.MeshPhysicalMaterial({ color: "#0756BD", metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.62, clearcoat: 1 }),
  plane: new THREE.MeshStandardMaterial({ color: "#F5F5F2", roughness: 0.6, side: THREE.DoubleSide, transparent: true, opacity: 0.92 }),
  light: new THREE.MeshBasicMaterial({ color: "#6BA8FF", transparent: true }),
};
const PATH = new THREE.CatmullRomCurve3(
  [[-2.4, 0.8, -2], [-0.8, 0.2, 0.5], [0.6, 0.9, -1.5], [1.6, -0.7, -3.5], [0.2, 1.5, -5.5], [-1.5, 0, -7]].map((p) => new THREE.Vector3(...p))
);
const G = {
  bar: new THREE.BoxGeometry(1, 1, 1),
  core: new THREE.OctahedronGeometry(1, 0),
  plane: new THREE.PlaneGeometry(1, 1.4),
  ring: new THREE.TorusGeometry(1, 0.018, 12, 96),
  path: new THREE.TubeGeometry(PATH, 140, 0.022, 6, false),
};

const FRAMES = [{ s: [3.6, 4.6], z: 2, x: -1.3 }, { s: [3, 3.9], z: -1, x: 1 }, { s: [2.4, 3.2], z: -4, x: -0.6 }];
const PX = [-2.8, 2.6, -1.6, 1.9, -0.4, 0.9];
const PY = [1.2, -1.1, -0.2, 1.5, -1.6, 0.1];
const PZ = [-5, -3.5, -6.5, -2, -7.5, -9];
const RINGS = [[-2, 0.8, -2, 1.1], [1.6, -0.7, -3.5, 0.9], [0.2, 1.5, -5.5, 1.3]];

function Frame({ s: [W, H], t = 0.07, gref }) {
  return (
    <group ref={gref}>
      {[[0, H / 2, W + t, t], [0, -H / 2, W + t, t], [-W / 2, 0, t, H], [W / 2, 0, t, H]].map(([x, y, sx, sy], i) => (
        <mesh key={i} geometry={G.bar} material={M.chrome} position={[x, y, 0]} scale={[sx, sy, t]} />
      ))}
    </group>
  );
}

function World({ rootRef, mobile, reduced }) {
  const { camera, scene, gl, invalidate } = useThree();
  const st = useRef({ f: 0, t: 0 });
  const R = useRef({ frames: [], planes: [], rings: [], slabs: [] });
  const g = useRef(), core = useRef(), blades = useRef(), path = useRef();
  const nPlanes = mobile ? 4 : 6;

  // Studio reflections for chrome/glass (no external HDR file).
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    invalidate();
    return () => { scene.environment = null; tex.dispose(); pm.dispose(); };
  }, [gl, scene, invalidate]);

  // Scroll position -> fractional stage index (0 = hero ... 11 = closing). Passive, rAF-throttled.
  useEffect(() => {
    const nodes = [...rootRef.current.querySelectorAll("[data-stage]")];
    let raf = 0;
    const read = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let f = 0;
      nodes.forEach((n, i) => {
        const r = n.getBoundingClientRect();
        if (r.top <= mid) f = i + clamp((mid - r.top) / Math.max(r.height, 1));
      });
      st.current.t = Math.min(f, nodes.length - 1);
      invalidate();
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, [rootRef, invalidate]);

  useEffect(() => { invalidate(); }, [mobile, reduced, invalidate]);

  useFrame((_, dt) => {
    const s = st.current;
    const d = s.t - s.f;
    s.f = reduced || Math.abs(d) < 5e-4 ? s.t : s.f + d * (1 - Math.exp(-4 * dt)); // damping
    if (s.f !== s.t) invalidate(); // render only while still moving
    const f = s.f, W = (i) => w(i, f);
    const align = Math.max(W(1), W(4), W(9), W(11), W(12)), loose = 1 - align;

    g.current.position.set(mobile ? 0 : 2.2, mobile ? 1.5 : 0, 0);
    g.current.scale.setScalar(mobile ? 0.6 : 1);
    camera.position.set(Math.sin(f * 0.55) * 1.8, Math.cos(f * 0.4) * 0.7, (mobile ? 13.5 : 9.5) - W(7) * 1.5 + W(10) * 2);
    camera.lookAt(0, mobile ? 0.8 : 0, -3);

    // Cobalt glass core
    const big = Math.max(W(1), W(6), W(12));
    core.current.scale.setScalar(0.5 + 0.5 * big + 0.55 * W(0));
    core.current.position.set(0, 0, mix(1.2, 0.5, W(1)));
    core.current.rotation.set(mix(f * 0.35, 0, W(1)), mix(f * 0.9, Math.PI / 4, big), 0);

    // Chrome frames: separate, align, and (short film) open to a wide cinematic ratio
    R.current.frames.forEach((m, i) => {
      if (!m) return;
      m.position.set(FRAMES[i].x * loose + Math.sin(f * 0.8 + i) * 0.35 * loose, 0, FRAMES[i].z);
      m.rotation.y = loose * (i - 1) * 0.35;
      m.scale.set(i === 0 ? 1 + 1.1 * W(10) : 1, 1, 1);
    });
    R.current.slabs.forEach((m, i) => {
      if (!m) return;
      const sx = i ? 1 : -1;
      m.position.set(mix(sx * 2.4, sx * 1.7, align), -0.2 * i, mix(-2.5 - i * 2, -3, align));
      m.rotation.y = loose * sx * (0.4 + f * 0.05);
    });

    // White planes: drift -> fan (story) -> sequence (editing) -> converge (post / finale)
    const fan = W(3), seq = W(8), conv = Math.max(W(9), W(12));
    R.current.planes.forEach((m, i) => {
      if (!m) return;
      const k = i - (nPlanes - 1) / 2;
      let x = PX[i], y = PY[i] + Math.sin(f * 0.7 + i) * 0.15 * (1 - conv), z = PZ[i], ry = 0.25 * Math.sin(i + f * 0.3);
      x = mix(x, k * 0.35, fan); y = mix(y, 0, fan); z = mix(z, -1 - i * 0.55, fan); ry = mix(ry, k * 0.22, fan);
      x = mix(x, k * 0.85, seq); y = mix(y, 0, seq); z = mix(z, -2, seq); ry = mix(ry, 0, seq);
      x = mix(x, 0, conv); y = mix(y, 0, conv); z = mix(z, -2 - i * 0.12, conv); ry = mix(ry, 0, conv);
      m.position.set(x, y, z);
      m.rotation.y = ry;
      m.scale.setScalar(1.5 * (1 - 0.35 * seq));
    });

    // Media strategy: chrome rings + blue light path
    R.current.rings.forEach((m, i) => {
      if (!m) return;
      m.scale.setScalar(RINGS[i][3] * (0.001 + Math.max(W(2), 0.3 * W(5))));
      m.rotation.set(f * 0.5 + i, 0.6 * i, 0);
    });
    const pv = Math.max(W(2), W(5), 0.7 * W(11));
    path.current.visible = pv > 0.01;
    path.current.geometry.setDrawRange(0, Math.floor(G.path.index.count * pv));
    M.light.opacity = 0.95 * pv;

    // Cinematography: aperture sculpture
    const bv = W(7);
    blades.current.visible = bv > 0.01;
    blades.current.scale.setScalar(0.001 + bv);
    blades.current.rotation.z = f * 0.6;
  });

  const ref = (key, i) => (el) => { R.current[key][i] = el; };
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <pointLight position={[-3, 1, 3]} intensity={30} color="#6BA8FF" />
      <group ref={g}>
        <mesh ref={core} geometry={G.core} material={M.glass} />
        {FRAMES.map((F, i) => <Frame key={i} s={F.s} gref={ref("frames", i)} />)}
        {[0, 1].map((i) => <mesh key={i} ref={ref("slabs", i)} geometry={G.bar} material={M.glass} scale={[0.8, 3.4, 0.08]} />)}
        {Array.from({ length: nPlanes }, (_, i) => <mesh key={i} ref={ref("planes", i)} geometry={G.plane} material={M.plane} />)}
        {RINGS.map(([x, y, z], i) => <mesh key={i} ref={ref("rings", i)} geometry={G.ring} material={M.chrome} position={[x, y, z]} />)}
        <mesh ref={path} geometry={G.path} material={M.light} />
        <group ref={blades} position={[0, 0, -0.5]}>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i * Math.PI) / 3;
            return <mesh key={i} geometry={G.bar} material={M.chrome} position={[Math.cos(a) * 0.9, Math.sin(a) * 0.9, 0]} rotation={[0, 0, a + Math.PI / 2 + 0.45]} scale={[1.1, 0.05, 0.03]} />;
          })}
        </group>
      </group>
    </>
  );
}

export default function ServicesScene({ rootRef, mobile, reduced }) {
  return (
    <Canvas frameloop="demand" dpr={mobile ? [1, 1.5] : [1, 2]} gl={{ antialias: !mobile, alpha: true }} camera={{ position: [0, 0, 9.5], fov: 42 }}>
      <World rootRef={rootRef} mobile={mobile} reduced={reduced} />
    </Canvas>
  );
}