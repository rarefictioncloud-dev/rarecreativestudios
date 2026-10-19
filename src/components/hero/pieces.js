import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/* ====================================================================
   THE CULTURAL COLLISION: geometry, materials and scroll choreography.
   100% procedural (no GLB, no textures to download).
   Cast: a twisted cobalt monolith, a monumental chrome ring, a white
   architectural plinth, a suspended photographic frame, one yellow bead.
   ==================================================================== */

export const FOV = 32; // vertical field of view (degrees)
export const D0 = 16; // reference camera distance used for screen-space layout
export const RING_R = 2.4; // ring radius (bead rides on it)

/* ---------- Geometry ---------- */

const TOWER_H = 6;
const TOWER_HALF = 0.85;

// Squircle cross-section, tapered and twisted: a sculptural monolith with flat caps
function makeTower(rings, segs) {
  const pos = [];
  const idx = [];
  const sp = (c, e) => Math.sign(c) * Math.pow(Math.abs(c), e);
  const TWIST = 2.4; // radians over the full height
  const TAPER = 0.24;

  const point = (i, j) => {
    const y01 = i / rings;
    const y = (y01 - 0.5) * TOWER_H;
    const sc = 1 - TAPER * y01;
    const a = (j / segs) * Math.PI * 2;
    const x = TOWER_HALF * sc * sp(Math.cos(a), 0.5);
    const z = TOWER_HALF * sc * sp(Math.sin(a), 0.5);
    const tw = TWIST * y01;
    const c = Math.cos(tw);
    const s = Math.sin(tw);
    return [x * c - z * s, y, x * s + z * c];
  };

  // side wall (shared vertices => smooth shading)
  for (let i = 0; i <= rings; i++) for (let j = 0; j < segs; j++) pos.push(...point(i, j));
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < segs; j++) {
      const a = i * segs + j;
      const b = i * segs + ((j + 1) % segs);
      const c = a + segs;
      const d = b + segs;
      idx.push(a, c, b, b, c, d);
    }
  }

  // flat caps (own vertices => crisp edge)
  const cap = (i, up) => {
    const base = pos.length / 3;
    for (let j = 0; j < segs; j++) pos.push(...point(i, j));
    const cy = (i / rings - 0.5) * TOWER_H;
    pos.push(0, cy, 0);
    const center = base + segs;
    for (let j = 0; j < segs; j++) {
      const a = base + j;
      const b = base + ((j + 1) % segs);
      if (up) idx.push(center, b, a);
      else idx.push(center, a, b);
    }
  };
  cap(0, false);
  cap(rings, true);

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export const G = {
  tower: makeTower(96, 72),
  towerLow: makeTower(44, 40),
  ring: new THREE.TorusGeometry(RING_R, 0.2, 40, 160),
  ringLow: new THREE.TorusGeometry(RING_R, 0.2, 24, 84),
  plinth: new RoundedBoxGeometry(3.4, 0.5, 3.4, 4, 0.07),
  panel: new RoundedBoxGeometry(2.6, 3.4, 0.22, 4, 0.05),
  photo: new THREE.PlaneGeometry(2.2, 3.0),
  bead: new THREE.SphereGeometry(0.24, 32, 24),
};

// Monochrome "editorial haze" with a single blue horizon line, drawn on a tiny canvas
export function makePhotoTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 320;
  const g = c.getContext("2d");
  const lg = g.createLinearGradient(0, 0, 256, 320);
  lg.addColorStop(0, "#0C192D");
  lg.addColorStop(0.55, "#4a5a78");
  lg.addColorStop(1, "#c9d1de");
  g.fillStyle = lg;
  g.fillRect(0, 0, 256, 320);
  const rg = g.createRadialGradient(150, 120, 6, 150, 120, 120);
  rg.addColorStop(0, "rgba(255,255,255,.9)");
  rg.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = rg;
  g.fillRect(0, 0, 256, 320);
  g.fillStyle = "#5271FF";
  g.fillRect(0, 236, 256, 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Soft blue bloom of light behind the sculpture (gives the black void some atmosphere)
export function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const rg = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  rg.addColorStop(0, "rgba(82,113,255,.55)");
  rg.addColorStop(0.45, "rgba(0,35,102,.28)");
  rg.addColorStop(1, "rgba(12,25,45,0)");
  g.fillStyle = rg;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ---------- Materials ---------- */

export const M = {
  // lacquered cobalt: satin sheen, not a mirror
  blue: new THREE.MeshPhysicalMaterial({ color: "#5271FF", metalness: 0.15, roughness: 0.34, clearcoat: 0.9, clearcoatRoughness: 0.22, envMapIntensity: 1.1 }),
  // polished chrome: the only truly reflective surface
  chrome: new THREE.MeshStandardMaterial({ color: "#eef2fb", metalness: 1, roughness: 0.07, envMapIntensity: 1.8 }),
  // matte architectural white
  white: new THREE.MeshStandardMaterial({ color: "#F4F1EA", metalness: 0, roughness: 0.82, envMapIntensity: 0.5 }),
  // the single champagne-gold accent (key name kept for compatibility)
  yellow: new THREE.MeshStandardMaterial({ color: "#C6A66B", metalness: 0.75, roughness: 0.3, emissive: "#C6A66B", emissiveIntensity: 0.08 }),
};

/* ====================================================================
   Scroll choreography
   Positions are SCREEN FRACTIONS (x of half-width, y of half-height) so
   the composition keeps its shape on any aspect ratio. Stages sit at
   the centre of each page section:
     0.00 hero (collision) · 0.25 idea · 0.50 narrative · 0.75 conversation · 1.00 impact
   Copy sides on the page: hero bottom-left, idea left, narrative right,
   conversation left, finale bottom-centre, so the sculpture takes the
   opposite side each time.
   ==================================================================== */

const P = (x, y, z, rx, ry, rz, s) => ({ x, y, z, rx, ry, rz, s });

export const STAGES = [
  {
    u: 0,
    cam: { th: 0, ph: -0.03, d: 16, ty: 0 },
    tower: P(0.42, 0.05, 0, 0, 0.5, 0, 1),
    ring: P(-0.2, 0.25, 3, 1.15, 0.35, 0, 1),
    panel: P(0.8, 0.1, -2.5, 0, -0.6, 0, 1),
    bead: { a: 2.2 },
  },
  {
    u: 0.25,
    cam: { th: 0.22, ph: 0.1, d: 15, ty: 0 },
    tower: P(0.46, 0.02, 0, 0, 1.3, 0, 1),
    ring: P(0.46, -0.02, 0.2, 1.05, 0, 0, 0.82),
    panel: P(0.8, -0.08, -3, 0, -0.9, 0, 0.9),
    bead: { a: 0.7 },
  },
  {
    u: 0.5,
    cam: { th: -0.28, ph: 0.16, d: 13.5, ty: 0 },
    tower: P(-0.42, 0, 0, 0, 2.4, 0, 1.05),
    ring: P(-0.42, 0.12, 0, 0.9, 0.5, 0, 0.95),
    panel: P(-0.62, 0.04, -2, 0, 0.55, 0, 1.1),
    bead: { a: 3.6 },
  },
  {
    u: 0.75,
    cam: { th: 0.08, ph: 0.08, d: 16, ty: 0 },
    tower: P(0.42, 0.02, 0, 0, 3.1, 0, 1),
    ring: P(0.42, 0.25, 0.15, 1.0, 0.3, 0, 1.05),
    panel: P(0.84, -0.04, -1.8, 0, -0.3, 0, 1),
    bead: { a: 1.4 },
  },
  {
    u: 1,
    cam: { th: 0, ph: 0.12, d: 20, ty: -0.08 },
    tower: P(0, 0.26, 0, 0, 3.9, 0, 0.8),
    ring: P(0, 0.5, 0, 1.05, 0.1, 0, 0.85),
    panel: P(0, 0.22, -3.5, 0, 0, 0, 1.45),
    bead: { a: 1.57 },
  },
];

const mixInto = (out, a, b, f) => {
  for (const k in a) {
    if (typeof a[k] === "number") out[k] = a[k] + (b[k] - a[k]) * f;
    else mixInto(out[k], a[k], b[k], f);
  }
};
const clone = (o) => JSON.parse(JSON.stringify(o));
const ss = THREE.MathUtils.smoothstep;

export const makePose = () => clone(STAGES[0]);

// Writes the interpolated pose for scroll progress u into `out` (no allocation per frame).
// Each stage holds briefly around its section centre, then eases to the next.
export function evalPose(u, out) {
  const last = STAGES.length - 1;
  let i = 0;
  while (i < last - 1 && u > STAGES[i + 1].u) i++;
  const A = STAGES[i];
  const B = STAGES[i + 1];
  const hold = 0.04;
  const f = ss(u, A.u + hold, B.u - hold);
  mixInto(out, A, B, f);
  return out;
}

const FR = { halfH: 0, halfW: 0, U: 1, px: 1, py: 0, portrait: false };

// Screen-space layout constants for an aspect ratio. U = world units per "design unit".
export function frame(aspect) {
  const portrait = aspect < 1;
  const halfH = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * D0;
  const halfW = halfH * aspect;
  const U = Math.min(halfH / 4.4, halfW / 3.2) * (portrait ? 0.72 : 1);
  FR.halfH = halfH;
  FR.halfW = halfW;
  FR.U = U;
  FR.px = portrait ? 0.22 : 1; // portrait: the copy spans the full width, so objects gather at the centre
  FR.py = portrait ? 0.34 : 0; // ...and sit in the free band above it
  FR.portrait = portrait;
  return FR;
}

// Applies a pose entry (screen fractions) to an Object3D living inside the U-scaled root group
export function place(obj, p, fr) {
  obj.position.set((p.x * fr.px * fr.halfW) / fr.U, ((p.y + fr.py) * fr.halfH) / fr.U, p.z);
  obj.rotation.set(p.rx, p.ry, p.rz);
  obj.scale.setScalar(p.s);
}