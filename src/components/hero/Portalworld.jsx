import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

/*
  Connection Portal: a cobalt glass ribbon flows through two chrome rings.
  One fixed canvas serves the whole page. Normalised scroll progress (0..1)
  drives rings, ribbon window, camera, lighting and the final "luminous line".
*/

const STOPS = 10;

// Path runs along the Z axis toward the camera. The wobble calms near the
// middle so both rings sit cleanly around the ribbon.
const curve = new THREE.CatmullRomCurve3(
  Array.from({ length: STOPS }, (_, i) => {
    const w = 0.25 + 0.75 * (1 - Math.exp(-Math.pow((i - 4.5) / 2.5, 2)));
    return new THREE.Vector3(
      Math.sin(i * 1.3) * 1.6 * w,
      Math.cos(i * 1.1) * 0.9 * w,
      -14 + i * (22 / (STOPS - 1))
    );
  })
);

const ss = THREE.MathUtils.smoothstep;
const BG_DARK = new THREE.Color("#07080b");
const BG_LIGHT = new THREE.Color("#16233d");

/* Shared, reusable materials */
const ringMat = new THREE.MeshStandardMaterial({
  color: "#e6ebf5",
  metalness: 1,
  roughness: 0.12,
  envMapIntensity: 1.5,
});
const lineMat = new THREE.MeshBasicMaterial({
  color: "#6BA8FF",
  transparent: true,
  opacity: 0,
});

function Ring({ tBase, dir, radius, progress, mobile }) {
  const outer = useRef(null);
  const inner = useRef(null);
  const geo = useMemo(
    () => new THREE.TorusGeometry(radius, 0.07, mobile ? 8 : 14, mobile ? 48 : 96),
    [radius, mobile]
  );
  const tmp = useMemo(
    () => ({ p: new THREE.Vector3(), tg: new THREE.Vector3(), o: new THREE.Object3D() }),
    []
  );

  useEffect(() => () => geo.dispose(), [geo]);

  useFrame(({ clock }) => {
    if (!outer.current) return;
    const p = progress.current;
    // rings drift apart slightly along the path as the page scrolls
    const t = tBase + dir * p * 0.07;
    curve.getPoint(t, tmp.p);
    curve.getTangent(t, tmp.tg);
    tmp.o.position.copy(tmp.p);
    tmp.o.lookAt(tmp.p.x + tmp.tg.x, tmp.p.y + tmp.tg.y, tmp.p.z + tmp.tg.z);
    outer.current.position.copy(tmp.p);
    outer.current.quaternion.copy(tmp.o.quaternion);
    // orientation changes with scroll, kept small so the ribbon never clips
    inner.current.rotation.x = dir * (Math.sin(p * 2.4) * 0.3 + p * 0.3) + Math.sin(clock.elapsedTime * 0.4 + dir) * 0.03;
    inner.current.rotation.y = dir * Math.sin(p * 3) * 0.22;
  });

  return (
    <group ref={outer}>
      <mesh ref={inner} geometry={geo} material={ringMat} />
    </group>
  );
}

function Ribbon({ progress, mobile }) {
  const ribbonMat = useRef(null);
  const N = mobile ? 180 : 320;

  const geometry = useMemo(() => {
    const pos = new Float32Array(N * 2 * 3);
    const index = [];
    const up = new THREE.Vector3(0, 1, 0);
    const a = new THREE.Vector3();
    const s = new THREE.Vector3();
    const n = new THREE.Vector3();
    for (let k = 0; k < N; k++) {
      const t = k / (N - 1);
      const p = curve.getPoint(t);
      const tg = curve.getTangent(t).normalize();
      s.crossVectors(tg, up).normalize();
      n.crossVectors(tg, s).normalize();
      const ang = t * Math.PI * 5;
      a.copy(s).multiplyScalar(Math.cos(ang)).addScaledVector(n, Math.sin(ang)).multiplyScalar(0.5);
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

  const lineGeo = useMemo(
    () => new THREE.TubeGeometry(curve, mobile ? 120 : 240, 0.018, 6, false),
    [mobile]
  );

  useEffect(
    () => () => {
      geometry.dispose();
      lineGeo.dispose();
    },
    [geometry, lineGeo]
  );

  useFrame(() => {
    const p = progress.current;
    // the ribbon is a window sliding along the path, so it travels through the rings
    const a = Math.floor((N - 1) * (0.08 + p * 0.3));
    const b = Math.floor((N - 1) * Math.min(1, 0.72 + p * 0.3));
    geometry.setDrawRange(a * 6, Math.max(0, b - a) * 6);
    // the end of the journey: glass dissolves into a luminous line
    const resolve = ss(p, 0.78, 1);
    if (ribbonMat.current) ribbonMat.current.opacity = 1 - resolve * 0.8;
    lineMat.opacity = resolve * 0.95;
  });

  return (
    <>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          ref={ribbonMat}
          color="#0756BD"
          roughness={0.07}
          metalness={0.05}
          transmission={mobile ? 0 : 0.6}
          thickness={0.6}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.04}
          envMapIntensity={1.6}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={lineGeo} material={lineMat} />
    </>
  );
}

function PortalLight({ progress }) {
  const ref = useRef(null);
  const pos = useMemo(() => curve.getPoint(0.5).toArray(), []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.intensity = 28 + Math.sin(clock.elapsedTime * 0.8) * 4 + progress.current * 26;
  });
  return <pointLight ref={ref} position={pos} color="#2a6bff" distance={14} decay={2} />;
}

function Rig({ progress, mobile }) {
  const target = useRef(0);
  const { camera } = useThree();

  useEffect(() => {
    camera.fov = mobile ? 50 : 36;
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
    const px = mobile ? 0 : pointer.x * 0.3;
    const py = mobile ? 0 : pointer.y * 0.15;
    camera.position.set(
      Math.sin(p * 2.2) * 2 + px,
      0.5 - p * 0.9 + py,
      (mobile ? 13 : 9.5) - p * 4.5
    );
    // on phones look below the portal so it sits above the headline
    camera.lookAt(0, mobile ? -1.7 : 0, -3 + p * 1.5);

    // dark hero -> slightly brighter contact area
    const mix = p * 0.8;
    if (scene.background?.isColor) scene.background.copy(BG_DARK).lerp(BG_LIGHT, mix);
    if (scene.fog) scene.fog.color.copy(BG_DARK).lerp(BG_LIGHT, mix);
  });

  return null;
}

function Scene({ progress }) {
  const width = useThree((s) => s.size.width);
  const mobile = width < 768;
  const group = useRef(null);

  useFrame(({ clock }) => {
    if (group.current) group.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.08;
  });

  return (
    <>
      <color attach="background" args={["#07080b"]} />
      <fog attach="fog" args={["#07080b", 14, 34]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 8]} intensity={1.8} />
      <PortalLight progress={progress} />
      <Rig progress={progress} mobile={mobile} />
      <group ref={group}>
        <Ring tBase={0.4} dir={-1} radius={1.55} progress={progress} mobile={mobile} />
        <Ring tBase={0.6} dir={1} radius={1.25} progress={progress} mobile={mobile} />
        <Ribbon progress={progress} mobile={mobile} />
      </group>
      <Environment preset="studio" />
    </>
  );
}

export default function PortalWorld() {
  const progress = useRef(0);
  const small = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Canvas
      dpr={small ? [1, 1.25] : [1, 1.5]}
      camera={{ position: [0, 0.5, small ? 13 : 9.5], fov: small ? 50 : 36, near: 0.1, far: 60 }}
      gl={{ antialias: !small, alpha: false, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene progress={progress} />
    </Canvas>
  );
}