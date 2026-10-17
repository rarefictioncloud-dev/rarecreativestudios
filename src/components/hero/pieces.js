import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/* ---------- Geometry (100% procedural: no GLB, no downloads) ---------- */

const v2 = (pts) => pts.map(([x, y]) => new THREE.Vector2(x, y));
const BASE = [[0, 0], [0.44, 0], [0.47, 0.04], [0.47, 0.1], [0.4, 0.16], [0.3, 0.2]];
const lathe = (profile) => new THREE.LatheGeometry(v2([...BASE, ...profile]), 72);

// Knight head: smooth closed spline, extruded and bevelled, then smoothed normals
const knightHead = (() => {
  const pts = [
    [-0.24, 0.4], [-0.2, 0.85], [-0.14, 1.2], [-0.06, 1.44], [0.03, 1.28], [0.16, 1.3],
    [0.34, 1.17], [0.5, 1.0], [0.5, 0.9], [0.38, 0.84], [0.22, 0.9], [0.12, 0.74], [0.27, 0.4],
  ];
  const curve = new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, y, 0)), true, "centripetal");
  const shape = new THREE.Shape(curve.getPoints(120).map((p) => new THREE.Vector2(p.x, p.y)));
  let g = new THREE.ExtrudeGeometry(shape, {
    depth: 0.2, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.05, bevelSegments: 6, curveSegments: 1,
  });
  g.translate(0, 0, -0.1);
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  g = mergeVertices(g, 1e-4);
  g.computeVertexNormals();
  return g;
})();

export const G = {
  pawn: lathe([[0.22, 0.3], [0.17, 0.5], [0.29, 0.55], [0.29, 0.6], [0.15, 0.66], [0.23, 0.78], [0.21, 0.9], [0.12, 0.99], [0, 1.02]]),
  rook: lathe([[0.26, 0.3], [0.23, 0.85], [0.35, 0.9], [0.35, 1.16], [0.27, 1.16], [0.27, 1.06], [0, 1.06]]),
  bishop: lathe([[0.22, 0.35], [0.14, 0.75], [0.3, 0.8], [0.3, 0.86], [0.2, 1.1], [0.14, 1.38], [0.07, 1.46], [0.09, 1.52], [0, 1.55]]),
  queen: lathe([[0.25, 0.4], [0.16, 0.95], [0.36, 1.02], [0.36, 1.08], [0.26, 1.4], [0.34, 1.62], [0.2, 1.64], [0.08, 1.72], [0.1, 1.8], [0, 1.84]]),
  king: lathe([[0.27, 0.4], [0.18, 1.0], [0.4, 1.1], [0.4, 1.16], [0.3, 1.5], [0.38, 1.7], [0.26, 1.74], [0, 1.76]]),
  knightBase: lathe([[0.3, 0.3], [0.27, 0.42], [0, 0.42]]),
  knightHead,
  crossV: new THREE.BoxGeometry(0.12, 0.5, 0.12),
  crossH: new THREE.BoxGeometry(0.38, 0.12, 0.12),
  square: new THREE.BoxGeometry(0.99, 0.1, 0.99),
};

/* ---------- Materials ---------- */

export const M = {
  // Satin finishes with a controlled sheen: enough to catch light, never a mirror
  black: new THREE.MeshPhysicalMaterial({ color: "#14171f", metalness: 0.55, roughness: 0.32, clearcoat: 0.4, clearcoatRoughness: 0.3, envMapIntensity: 1.0 }),
  silver: new THREE.MeshPhysicalMaterial({ color: "#cfd5e0", metalness: 0.9, roughness: 0.24, clearcoat: 0.3, clearcoatRoughness: 0.3, envMapIntensity: 1.2 }),
  blue: new THREE.MeshPhysicalMaterial({ color: "#0756BD", metalness: 0.45, roughness: 0.28, clearcoat: 0.6, clearcoatRoughness: 0.2, emissive: "#0756BD", emissiveIntensity: 0.12, envMapIntensity: 1.0 }),
  squareDark: new THREE.MeshPhysicalMaterial({ color: "#050507", metalness: 0.35, roughness: 0.35, clearcoat: 0.5, clearcoatRoughness: 0.25, envMapIntensity: 0.6 }),
  squareBlue: new THREE.MeshPhysicalMaterial({ color: "#0c3f9a", metalness: 0.35, roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.25, envMapIntensity: 0.7 }),
  frame: new THREE.MeshStandardMaterial({ color: "#0b0c10", metalness: 0.7, roughness: 0.35 }),
  glow: new THREE.MeshBasicMaterial({ color: "#2f8bff", toneMapped: false }),
};