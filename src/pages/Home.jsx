import { Component, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Sparkles, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, ToneMapping, SMAA, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { ToneMappingMode } from "postprocessing";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { ArrowUpRight } from "lucide-react";

/* ====================================================================
   RARE CREATIVE STUDIOS: HOME  (v4)
   One continuous, scroll-controlled camera journey
   (React Three Fiber + GSAP ScrollTrigger + Lenis).
   Navbar and Footer are NOT part of this file.

   INSTALL
     npm i three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing gsap lenis lucide-react react-router-dom
     (React 18 projects: @react-three/fiber@8, @react-three/drei@9, @react-three/postprocessing@2)

   THE STORY (scroll order)
     1. OPEN      Camera behind four people. Two sit facing each other across
                  the table, two stand close behind them. They are mid
                  conversation: taking turns, gesturing, nodding.
     2. TABLE     A slow curved dolly in towards the table.
     3. NOTES     Push onto the storyboard and notes they are discussing.
     4. CAMERA    Pull back off the notes, crane up out of the studio and
                  reveal the film set next door.
     5. LENS      Dive into the cinema camera: you see the car through the
                  viewfinder (REC overlay, iris vignette).
     6. THIRD     Scroll out of the lens, swing round and settle behind the
                  operator in a third person view of the shoot.
     7. END       Resolve on the hero frame of the black BMW-style coupe.
                  The page then ends.

   WHAT CHANGED IN v4
     - Font: the whole page now uses the light neo-grotesque from the
       reference screenshot (Inter Tight, weight 300 for display). To swap
       it for another family, change FONT_LINK and the FD constant only.
       Caveat is kept for the handwriting on the storyboards.
     - Hero heading matches the reference: "Ideas, framed" in ivory,
       "in motion." in soft grey, amber label above.
     - Characters on the first screen stand closer together around a
       smaller table and are visibly discussing (turn taking, hand
       gestures, nodding, leaning in).
     - Animation: the camera now follows ONE continuous spline through all
       the waypoints (monotone cubic, no overshoot) instead of separate
       stop-start tweens. Added curved arcs, a crane move, a banking dive
       into the lens, a gentle roll, handheld breathing and an iris
       vignette inside the viewfinder.

   TUNING KNOBS: GAIN (overall light), POSE / PATH (camera path), ASSETS (GLB models).
   The Navbar sits on a dark scene: give it light text on this page.
   ==================================================================== */

const CONTACT_EMAIL = "info@rarecreativestudios.com";
const COL = { obsidian: "#0B0B0C", charcoal: "#191A1C", ivory: "#F1EFE9", blue: "#234A78", amber: "#D9A441", copper: "#7C3F30" };
const GAIN = 1; // multiplies every light: raise if the scene feels too dark
const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&family=Caveat:wght@500;600&display=swap";

/* Real models plug in here. Leave null to use the built-in procedural
   models. Example: car: "/models/car.glb". For people use ids
   seatA, seatB, standA, standB, operator, crewA, crewB. */
const ASSETS = { car: null, carScale: 1, people: {} };

gsap.registerPlugin(ScrollTrigger);
RectAreaLightUniformsLib.init(); // soft window / ceiling area lights
ScrollTrigger.config({ ignoreMobileResize: true });

/* ---------- shared mutable state: written by GSAP, read by the scene ---------- */
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const C = V3(15, 0, 9); // centre of the film set
const CAR_POS = C.clone();
const OP_POS = V3(C.x - 3.8, 0, C.z + 3.5);
const TO_CAR = CAR_POS.clone().sub(OP_POS).setY(0).normalize();
const SET_YAW = Math.atan2(-TO_CAR.x, -TO_CAR.z); // car front and operator gaze share this yaw maths
const BACK = { x: -TO_CAR.x, z: -TO_CAR.z };
const SIDE = { x: -TO_CAR.z, z: TO_CAR.x }; // perpendicular to the shooting line
const HERO_A = -0.96;
const HERO_DIR = { x: BACK.x * Math.cos(HERO_A) - BACK.z * Math.sin(HERO_A), z: BACK.x * Math.sin(HERO_A) + BACK.z * Math.cos(HERO_A) };
const HERO_RIGHT = { x: HERO_DIR.z, z: -HERO_DIR.x };
const lerp = THREE.MathUtils.lerp;
const rel = (dx, dz) => [C.x + dx, C.z + dz]; // position relative to film-set centre

/* position of the film-set camera lens (used by the "inside the camera" shot) */
const LENS_POS = {
  x: OP_POS.x + TO_CAR.x * (0.85 + 0.62),
  y: 1.22 + 0.05 + 0.12,
  z: OP_POS.z + TO_CAR.z * (0.85 + 0.62),
};

/* studio / set = light channels (never below ~0.4 so nothing ever goes black).
   roll = camera banking in degrees. */
const POSE = {
  /* 1. open: behind the four people, looking across the table */
  wide: { px: 0.0, py: 1.7, pz: 6.4, lx: 0, ly: 1.05, lz: -0.4, fov: 36, studio: 1, set: 0.5, env: 0.35, fb: 0.33, bk: 0.7, roll: 0 },
  /* 1b. gentle arc to the right while we start moving in */
  arcA: { px: 0.8, py: 1.62, pz: 5.0, lx: 0.05, ly: 1.0, lz: -0.4, fov: 36, studio: 1, set: 0.5, env: 0.35, fb: 0.28, bk: 1.3, roll: 0.7 },
  /* 2. approach the table between the two standing people */
  table: { px: 0.05, py: 1.5, pz: 3.5, lx: 0, ly: 0.95, lz: -0.3, fov: 36, studio: 1, set: 0.5, env: 0.35, fb: 0.2, bk: 2.2, roll: 0 },
  /* 3. onto the notes */
  notes: { px: 0.2, py: 1.8, pz: 0.4, lx: 0.2, ly: 0.76, lz: -0.12, fov: 38, studio: 1, set: 0.5, env: 0.35, fb: 0, bk: 3.2, roll: 0 },
  notes2: { px: 0.27, py: 1.74, pz: 0.36, lx: 0.25, ly: 0.76, lz: -0.14, fov: 38, studio: 1, set: 0.5, env: 0.35, fb: 0, bk: 3.2, roll: 0 },
  /* 4a. crane up and out of the studio */
  rise: { px: 4.6, py: 3.5, pz: 10.5, lx: 3.6, ly: 1.0, lz: 2.0, fov: 44, studio: 0.95, set: 0.7, env: 0.5, fb: 0.4, bk: 0.8, roll: -1.1 },
  /* 4b. the reveal: studio on the left, film set on the right, both lit */
  pullMid: { px: 7.6, py: 5.4, pz: 21, lx: 7.6, ly: 0.9, lz: 4.2, fov: 50, studio: 0.9, set: 0.9, env: 0.7, fb: 0.5, bk: 0.4, roll: 0 },
  /* 4c. swooping down towards the lens, banking slightly */
  dive: { px: 10.3, py: 2.7, pz: 15.6, lx: 12.2, ly: 0.9, lz: 8.2, fov: 38, studio: 0.55, set: 1, env: 0.9, fb: 0.7, bk: 1.0, roll: 1.4 },
  /* 5. inside the camera: the viewfinder shot of the car */
  lens: {
    px: LENS_POS.x, py: LENS_POS.y, pz: LENS_POS.z,
    lx: CAR_POS.x, ly: 0.82, lz: CAR_POS.z,
    fov: 26, studio: 0.4, set: 1, env: 1, fb: 0.9, bk: 1.2, roll: 0,
  },
  /* 6a. scrolling out of the lens, swinging round the operator */
  orbit: {
    px: OP_POS.x + SIDE.x * 2.4 + BACK.x * 1.6, py: 1.55, pz: OP_POS.z + SIDE.z * 2.4 + BACK.z * 1.6,
    lx: lerp(OP_POS.x, CAR_POS.x, 0.5), ly: 1.0, lz: lerp(OP_POS.z, CAR_POS.z, 0.5),
    fov: 38, studio: 0.5, set: 1, env: 0.9, fb: 0.5, bk: 1.6, roll: 0.8,
  },
  /* 6b. third person, behind the operator shooting the car */
  behind: {
    px: OP_POS.x + BACK.x * 4.1, py: 1.9, pz: OP_POS.z + BACK.z * 4.1,
    lx: lerp(OP_POS.x, CAR_POS.x, 0.6), ly: 1, lz: lerp(OP_POS.z, CAR_POS.z, 0.6),
    fov: 40, studio: 0.5, set: 1, env: 0.85, fb: 0.5, bk: 1.8, roll: 0,
  },
  /* 7. hero frame of the car */
  hero: {
    px: CAR_POS.x + HERO_DIR.x * 6.1, py: 0.8, pz: CAR_POS.z + HERO_DIR.z * 6.1,
    lx: CAR_POS.x - HERO_RIGHT.x * 1.5, ly: 0.78, lz: CAR_POS.z - HERO_RIGHT.z * 1.5,
    fov: 30, studio: 0.4, set: 1, env: 1, fb: 0, bk: 1.4, roll: 0,
  },
};
const POSE_KEYS = ["px", "py", "pz", "lx", "ly", "lz", "fov", "studio", "set", "env", "fb", "bk", "roll"];
const pick = (p) => POSE_KEYS.reduce((o, k) => ((o[k] = p[k] ?? 0), o), {});
const STATE = { ...pick(POSE.wide), intro: 0 };
const FOCUS = new THREE.Vector3();
const PTR = new THREE.Vector2();

const T_TOTAL = 118; // master timeline length (arbitrary units, scrubbed by scroll)
const STAGES = [
  { t: 0, n: "Idea" },
  { t: 5, n: "Collaboration" },
  { t: 18, n: "Storyboard" },
  { t: 53, n: "The camera" },
  { t: 66, n: "Through the lens" },
  { t: 80, n: "On set" },
  { t: 102, n: "Final frame" },
];

/* The camera path: [time, pose]. Repeated poses are "holds". Between keys the
   path is a monotone cubic spline (PCHIP), so velocity is continuous through
   every waypoint, there is no stop-start and nothing ever overshoots. */
const PATH = [
  [0, "wide"],
  [4, "wide"],
  [11, "arcA"],
  [18, "table"],
  [34, "notes"],
  [44, "notes2"],
  [51, "table"],
  [58, "rise"],
  [66, "pullMid"],
  [71, "dive"],
  [76, "lens"],
  [81, "lens"],
  [90, "orbit"],
  [98, "behind"],
  [101, "behind"],
  [112, "hero"],
  [T_TOTAL, "hero"],
];

function makeTrack(ts, vs) {
  const n = ts.length;
  const h = [], d = [], m = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) { h[i] = ts[i + 1] - ts[i]; d[i] = (vs[i + 1] - vs[i]) / h[i]; }
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) m[i] = 0;
    else {
      const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1];
      m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
    }
  }
  return (t) => {
    if (t <= ts[0]) return vs[0];
    if (t >= ts[n - 1]) return vs[n - 1];
    let i = 0;
    while (t > ts[i + 1]) i++;
    const hh = h[i], s = (t - ts[i]) / hh, s2 = s * s, s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * vs[i] + (s3 - 2 * s2 + s) * hh * m[i] + (-2 * s3 + 3 * s2) * vs[i + 1] + (s3 - s2) * hh * m[i + 1];
  };
}
const TRACKS = POSE_KEYS.reduce((o, k) => {
  o[k] = makeTrack(PATH.map((p) => p[0]), PATH.map((p) => POSE[p[1]][k] ?? 0));
  return o;
}, {});
const sampleTrack = (t) => { for (const k of POSE_KEYS) STATE[k] = TRACKS[k](t); };

/* ====================================================================
   2. PROCEDURAL TEXTURES (canvas): storyboards, notes, photos, wood
   ==================================================================== */

const FD = "'Inter Tight','Helvetica Neue',Arial,sans-serif"; // display + UI (light neo-grotesque)
const FS = FD; // editorial text on textures uses the same family
const FI = FD; // UI
const FH = "'Caveat','Segoe Script',cursive"; // handwriting

const rnd = (seed) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

function paper(g, w, h, base = "#efe8d6", grain = 0.07, seed = 3) {
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  const r = rnd(seed);
  for (let i = 0; i < (w * h) / 110; i++) {
    g.fillStyle = `rgba(${r() > 0.5 ? "90,70,40" : "255,255,255"},${r() * grain})`;
    g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
  const gr = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  gr.addColorStop(0, "rgba(0,0,0,0)");
  gr.addColorStop(1, "rgba(70,45,20,.22)");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
}

function stroke(g, pts, { close = false, color = "#2a2a2c", lw = 3, jit = 1.3, seed = 1 } = {}) {
  const r = rnd(seed + 7);
  for (let pass = 0; pass < 2; pass++) {
    g.beginPath();
    pts.forEach(([x, y], i) => {
      const jx = (r() - 0.5) * jit * 2, jy = (r() - 0.5) * jit * 2;
      if (i) g.lineTo(x + jx, y + jy);
      else g.moveTo(x + jx, y + jy);
    });
    if (close) g.closePath();
    g.strokeStyle = color;
    g.globalAlpha = pass ? 0.5 : 0.9;
    g.lineWidth = lw * (pass ? 0.7 : 1);
    g.lineCap = "round";
    g.lineJoin = "round";
    g.stroke();
  }
  g.globalAlpha = 1;
}

function hatch(g, x, y, w, h, gap = 14, color = "rgba(40,40,45,.35)") {
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.strokeStyle = color;
  g.lineWidth = 2;
  for (let i = -h; i < w; i += gap) {
    g.beginPath();
    g.moveTo(x + i, y + h);
    g.lineTo(x + i + h, y);
    g.stroke();
  }
  g.restore();
}

function arrow(g, x1, y1, x2, y2, color = "#1d3f6e", lw = 4) {
  g.strokeStyle = color;
  g.fillStyle = color;
  g.lineWidth = lw;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1);
  g.beginPath();
  g.moveTo(x2, y2);
  g.lineTo(x2 - 18 * Math.cos(a - 0.4), y2 - 18 * Math.sin(a - 0.4));
  g.lineTo(x2 - 18 * Math.cos(a + 0.4), y2 - 18 * Math.sin(a + 0.4));
  g.closePath();
  g.fill();
}

function text(g, s, x, y, { font = FH, size = 44, color = "#222", weight = 500, rot = 0, align = "left" } = {}) {
  const sz = font === FH ? size * 1.22 : size; // handwriting face runs small
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.font = `${weight} ${sz}px ${font}`;
  g.fillStyle = color;
  g.textAlign = align;
  g.fillText(s, 0, 0);
  g.restore();
}

function tape(g, x, y, rot = 0.3, w = 120, h = 38) {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.fillStyle = "rgba(228,212,160,.62)";
  g.fillRect(-w / 2, -h / 2, w, h);
  g.restore();
}

function swatch(g, x, y, s, color, label) {
  g.fillStyle = "rgba(0,0,0,.18)";
  g.fillRect(x + 5, y + 6, s, s);
  g.fillStyle = color;
  g.fillRect(x, y, s, s);
  g.strokeStyle = "rgba(255,255,255,.75)";
  g.lineWidth = 4;
  g.strokeRect(x, y, s, s);
  if (label) text(g, label, x, y + s + 30, { font: FI, size: 20, color: "#444" });
}

const CAR_SIDE = [[-1, 0], [-0.98, -0.1], [-0.88, -0.17], [-0.55, -0.24], [-0.38, -0.42], [-0.1, -0.5], [0.22, -0.5], [0.5, -0.27], [0.9, -0.2], [1, -0.09], [1, 0]];
const scaled = (pts, cx, cy, s) => pts.map(([x, y]) => [cx + x * s, cy + y * s]);

function carSide(g, cx, cy, s, { color = "#222", lw = 3, seed = 1 } = {}) {
  stroke(g, scaled(CAR_SIDE, cx, cy, s), { color, lw, seed });
  [-0.6, 0.62].forEach((wx) => {
    g.strokeStyle = color;
    g.lineWidth = lw;
    g.beginPath();
    g.arc(cx + wx * s, cy, 0.17 * s, 0, 7);
    g.stroke();
    g.beginPath();
    g.arc(cx + wx * s, cy, 0.07 * s, 0, 7);
    g.stroke();
  });
  stroke(g, scaled([[-0.34, -0.4], [-0.1, -0.47], [0.2, -0.47], [0.43, -0.27], [-0.34, -0.27]], cx, cy, s), { color, lw: lw * 0.7, seed: seed + 2 });
}

function carSolid(g, cx, cy, s, fill = "#040405") {
  g.fillStyle = fill;
  g.beginPath();
  scaled(CAR_SIDE, cx, cy, s).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.fill();
  [-0.6, 0.62].forEach((wx) => {
    g.beginPath();
    g.arc(cx + wx * s, cy, 0.17 * s, 0, 7);
    g.fill();
  });
}

function carFront(g, cx, cy, s, { color = "#222", seed = 1 } = {}) {
  const o = { color, lw: 4, seed };
  stroke(g, scaled([[-0.8, 0], [-0.82, -0.3], [-0.6, -0.52], [-0.42, -0.68], [0.42, -0.68], [0.6, -0.52], [0.82, -0.3], [0.8, 0]], cx, cy, s), { ...o, close: true });
  stroke(g, scaled([[-0.5, -0.5], [-0.38, -0.63], [0.38, -0.63], [0.5, -0.5]], cx, cy, s), o);
  stroke(g, scaled([[-0.74, -0.26], [-0.52, -0.33], [-0.46, -0.22], [-0.7, -0.16]], cx, cy, s), { ...o, close: true });
  stroke(g, scaled([[0.74, -0.26], [0.52, -0.33], [0.46, -0.22], [0.7, -0.16]], cx, cy, s), { ...o, close: true });
  stroke(g, scaled([[-0.2, -0.22], [-0.04, -0.22], [-0.04, -0.08], [-0.2, -0.08]], cx, cy, s), { ...o, close: true });
  stroke(g, scaled([[0.2, -0.22], [0.04, -0.22], [0.04, -0.08], [0.2, -0.08]], cx, cy, s), { ...o, close: true });
  stroke(g, scaled([[-0.74, 0], [-0.74, 0.1], [-0.55, 0.1], [-0.55, 0]], cx, cy, s), o);
  stroke(g, scaled([[0.74, 0], [0.74, 0.1], [0.55, 0.1], [0.55, 0]], cx, cy, s), o);
}

function carTop(g, cx, cy, s, color = "#222") {
  stroke(g, scaled([[-1, -0.38], [-0.9, -0.46], [0.9, -0.46], [1, -0.38], [1, 0.38], [0.9, 0.46], [-0.9, 0.46], [-1, 0.38]], cx, cy, s), { color, lw: 4, close: true });
  stroke(g, scaled([[-0.3, -0.34], [0.35, -0.34], [0.5, -0.24], [0.5, 0.24], [0.35, 0.34], [-0.3, 0.34]], cx, cy, s), { color, lw: 3, close: true });
}

function photo(g, w, h, kind = 0) {
  const pal = [["#070b14", "#16294a", "#4a86d9"], ["#0a0908", "#2b1c12", COL.amber], ["#06080d", "#10213b", "#6fa4ff"]][kind % 3];
  const bg = g.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, pal[0]);
  bg.addColorStop(1, pal[1]);
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  const sh = g.createRadialGradient(w * 0.75, h * 0.1, 5, w * 0.75, h * 0.1, w * 0.7);
  sh.addColorStop(0, "rgba(120,160,230,.38)");
  sh.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = sh;
  g.fillRect(0, 0, w, h);
  const fl = g.createLinearGradient(0, h * 0.66, 0, h);
  fl.addColorStop(0, "rgba(255,255,255,.08)");
  fl.addColorStop(1, "rgba(0,0,0,.5)");
  g.fillStyle = fl;
  g.fillRect(0, h * 0.66, w, h * 0.34);
  const s = w * 0.36, cx = w * 0.5, cy = h * 0.7;
  carSolid(g, cx, cy, s);
  g.strokeStyle = pal[2];
  g.lineWidth = Math.max(2, w * 0.007);
  g.globalAlpha = 0.9;
  g.beginPath();
  scaled(CAR_SIDE.slice(3, 9), cx, cy, s).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.stroke();
  g.globalAlpha = 1;
  const gl = g.createRadialGradient(cx + 0.95 * s, cy - 0.12 * s, 1, cx + 0.95 * s, cy - 0.12 * s, s * 0.35);
  gl.addColorStop(0, "rgba(255,230,180,.95)");
  gl.addColorStop(1, "rgba(217,164,65,0)");
  g.fillStyle = gl;
  g.fillRect(0, 0, w, h);
  const r = rnd(kind + 40);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(255,255,255,${r() * 0.06})`;
    g.fillRect(r() * w, r() * h, 2, 2);
  }
}

function photoCard(g, x, y, w, h, kind) {
  g.save();
  g.translate(x, y);
  g.fillStyle = "rgba(0,0,0,.35)";
  g.fillRect(6, 8, w, h);
  g.beginPath();
  g.rect(0, 0, w, h);
  g.clip();
  photo(g, w, h, kind);
  g.restore();
  g.strokeStyle = "#ece7d8";
  g.lineWidth = 8;
  g.strokeRect(x, y, w, h);
}

function sketchFrame(g, x, y, w, h, i) {
  g.fillStyle = "#f7f3e6";
  g.fillRect(x, y, w, h);
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  const cx = x + w / 2, cy = y + h * 0.72;
  hatch(g, x, y + h * 0.76, w, h * 0.24, 12, "rgba(40,40,50,.3)");
  if (i === 0 || i === 4) carFront(g, cx, cy, w * 0.34, { seed: i });
  else if (i === 3) carTop(g, cx, y + h / 2, w * 0.3);
  else if (i === 2) {
    stroke(g, [[x + w * 0.12, y + h * 0.55], [x + w * 0.38, y + h * 0.38], [x + w * 0.46, y + h * 0.6], [x + w * 0.16, y + h * 0.7]], { close: true, lw: 5, seed: 4 });
    stroke(g, [[x + w * 0.88, y + h * 0.55], [x + w * 0.62, y + h * 0.38], [x + w * 0.54, y + h * 0.6], [x + w * 0.84, y + h * 0.7]], { close: true, lw: 5, seed: 5 });
    stroke(g, [[x + w * 0.4, y + h * 0.75], [x + w * 0.6, y + h * 0.75], [x + w * 0.6, y + h * 0.85], [x + w * 0.4, y + h * 0.85]], { close: true, lw: 4, seed: 6 });
  } else carSide(g, cx, cy, w * 0.36, { seed: i });
  g.strokeStyle = "rgba(30,70,130,.4)";
  g.lineWidth = 2;
  g.setLineDash([10, 8]);
  g.beginPath();
  g.moveTo(x + w / 3, y);
  g.lineTo(x + w / 3, y + h);
  g.moveTo(x + (2 * w) / 3, y);
  g.lineTo(x + (2 * w) / 3, y + h);
  g.stroke();
  g.setLineDash([]);
  g.restore();
  g.strokeStyle = "#1b1b1d";
  g.lineWidth = 5;
  g.strokeRect(x, y, w, h);
}

function drawHero(g, w, h) {
  paper(g, w, h, "#efe8d6", 0.08, 11);
  g.strokeStyle = "rgba(50,90,150,.09)";
  g.lineWidth = 1.5;
  for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  text(g, "Night Drive", 110, 140, { font: FS, size: 120, weight: 300, color: "#1a1a1c" });
  text(g, "30 sec automotive spot  /  storyboard v3  /  RCS", 114, 192, { font: FI, size: 28, color: "#555", weight: 600 });
  stroke(g, [[110, 160], [760, 154]], { color: COL.blue, lw: 6, seed: 3 });

  const fw = 372, fh = 252, gx = 110, gy = 250, gap = 34;
  const caps = ["01  low 3/4 push-in", "02  side track, 85mm", "03  headlight detail", "04  top-down reveal", "05  rear, rim lit", "06  hero front 3/4"];
  caps.forEach((c, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = gx + col * (fw + gap), y = gy + row * (fh + 180);
    sketchFrame(g, x, y, fw, fh, i);
    tape(g, x + fw * 0.5, y - 4, (i % 2 ? 1 : -1) * 0.08, 110, 34);
    text(g, c, x + 4, y + fh + 52, { size: 44, color: "#1b2a44" });
    text(g, ["slow dolly, rig low", "lens flare ok", "blue glass, amber ring", "crane up 2m", "tail lights breathe", "hold. let it land."][i], x + 4, y + fh + 100, { size: 36, color: "#7C3F30" });
    if (col < 2) arrow(g, x + fw + 4, y + fh / 2, x + fw + gap - 4, y + fh / 2, "#1d3f6e", 4);
  });
  arrow(g, gx + 2 * (fw + gap) + fw / 2, gy + fh + 130, gx + fw / 2, gy + fh + 190, "#1d3f6e", 4);

  text(g, "Scene sequence", 110, 1086, { font: FI, size: 24, color: "#666", weight: 700 });
  ["Idea", "People", "Board", "Set", "Film", "Frame"].forEach((s, i) => {
    const x = 110 + i * 205;
    g.strokeStyle = "#1b1b1d";
    g.lineWidth = 4;
    g.strokeRect(x, 1112, 170, 70);
    text(g, s, x + 85, 1158, { font: FH, size: 40, align: "center", color: "#1b1b1d" });
    if (i < 5) arrow(g, x + 172, 1147, x + 203, 1147, COL.copper, 4);
  });
  const notes = ["blue rim + amber kicker. keep reflections clean", "slow dolly, 85mm, f/2.0, no shake", "black paint = shape. let the light draw it", "end low and wide. patient."];
  notes.forEach((n, i) => {
    g.fillStyle = COL.amber;
    g.beginPath();
    g.arc(124, 1266 + i * 62, 8, 0, 7);
    g.fill();
    text(g, n, 150, 1280 + i * 62, { size: 50, color: "#1b2a44" });
  });

  g.save();
  g.translate(1700, 470);
  g.strokeStyle = "#1b1b1d";
  g.lineWidth = 4;
  g.fillStyle = "rgba(255,255,255,.35)";
  g.beginPath();
  g.arc(0, 0, 250, 0, 7);
  g.fill();
  g.stroke();
  carTop(g, 0, 0, 100);
  [[-200, -160, "blue rim", "#234A78"], [200, -160, "blue rim", "#234A78"], [-210, 150, "amber kick", "#c78a20"], [0, -235, "overhead", "#555"]].forEach(([lx, ly, lb, c]) => {
    g.fillStyle = c;
    g.beginPath();
    g.arc(lx, ly, 26, 0, 7);
    g.fill();
    g.setLineDash([8, 8]);
    g.strokeStyle = c;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(lx, ly);
    g.lineTo(lx * 0.35, ly * 0.35);
    g.stroke();
    g.setLineDash([]);
    text(g, lb, lx, ly + (ly < 0 ? -42 : 56), { font: FH, size: 36, align: "center", color: c });
  });
  g.restore();
  text(g, "Lighting plan", 1450, 220, { font: FI, size: 24, color: "#666", weight: 700 });

  text(g, "Camera angles", 1450, 800, { font: FI, size: 24, color: "#666", weight: 700 });
  g.strokeStyle = "#1b1b1d";
  g.lineWidth = 4;
  g.beginPath();
  g.arc(1560, 1040, 200, -1.25, -0.2);
  g.stroke();
  g.beginPath();
  g.arc(1560, 1040, 130, -1.25, -0.2);
  g.stroke();
  carSide(g, 1560, 1040, 70, { seed: 9 });
  arrow(g, 1830, 880, 1780, 960, COL.copper, 5);
  text(g, "35deg", 1840, 868, { size: 44, color: COL.copper });
  text(g, "low 0.8m", 1700, 1110, { size: 42, color: "#1b2a44" });

  const sx = 1450, sy = 1250;
  [["#0B0B0C", "obsidian"], ["#F1EFE9", "ivory"], ["#234A78", "blue"], ["#D9A441", "amber"], ["#7C3F30", "copper"]].forEach(([c, l], i) => swatch(g, sx + i * 108, sy, 88, c, l));
  photoCard(g, 1450, 1384, 150, 90, 0);
  photoCard(g, 1620, 1384, 150, 90, 2);

  g.save();
  g.translate(1830, 1330);
  g.rotate(0.07);
  g.fillStyle = "rgba(0,0,0,.2)";
  g.fillRect(8, 10, 200, 190);
  g.fillStyle = "#e9c46a";
  g.fillRect(0, 0, 200, 190);
  text(g, "slow", 22, 70, { size: 54, color: "#4a3200" });
  text(g, "push-in.", 22, 126, { size: 54, color: "#4a3200" });
  text(g, "85mm", 22, 176, { size: 46, color: "#7C3F30" });
  g.restore();
  tape(g, w - 80, 70, 0.6, 150, 40);
  tape(g, 80, h - 70, 0.6, 150, 40);
}

function drawSketchSheet(g, w, h) {
  paper(g, w, h, "#ece5d2", 0.07, 17);
  text(g, "Sketches", 44, 84, { font: FS, size: 70, weight: 300, color: "#1b1b1d" });
  carSide(g, 300, 330, 190, { seed: 2 });
  carSide(g, 700, 250, 120, { seed: 5 });
  carFront(g, 700, 560, 140, { seed: 6 });
  carTop(g, 240, 590, 120);
  arrow(g, 520, 140, 600, 170, COL.copper, 4);
  text(g, "stance!", 470, 120, { size: 40, color: COL.copper, rot: -0.1 });
  text(g, "long hood, short deck", 60, 460, { size: 36, color: "#1b2a44" });
}

function drawCameraList(g, w, h) {
  paper(g, w, h, "#f0ead8", 0.06, 23);
  text(g, "Camera list", 44, 84, { font: FS, size: 70, weight: 300, color: "#1b1b1d" });
  ["A-cam: slow dolly in", "B-cam: low track left", "C-cam: detail, lights", "lens: 35 / 50 / 85", "stabiliser for hero pass", "blue rim, amber kicker"].forEach((s, i) => {
    g.strokeStyle = "#1b1b1d";
    g.lineWidth = 4;
    g.strokeRect(50, 130 + i * 88, 40, 40);
    if (i < 4) stroke(g, [[56, 150 + i * 88], [68, 164 + i * 88], [96, 126 + i * 88]], { color: COL.blue, lw: 6, seed: i });
    text(g, s, 120, 166 + i * 88, { size: 50, color: "#1b2a44" });
  });
}

function drawContact(g, w, h) {
  paper(g, w, h, "#e6e0cf", 0.06, 31);
  for (let i = 0; i < 6; i++) photoCard(g, 50 + (i % 3) * 315, 70 + Math.floor(i / 3) * 300, 290, 250, i);
}

function drawBoard(g, w, h) {
  g.fillStyle = "#2b2824";
  g.fillRect(0, 0, w, h);
  const r = rnd(21);
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = `rgba(${r() > 0.5 ? "0,0,0" : "120,100,80"},${r() * 0.12})`;
    g.fillRect(r() * w, r() * h, 2, 2);
  }
  const cols = 7, rows = 3, cw = w / cols, ch = h / rows;
  const words = ["Light", "Speed", "Silence", "Precision", "Night", "Chrome"];
  for (let ri = 0; ri < rows; ri++) {
    for (let c = 0; c < cols; c++) {
      const k = ri * cols + c;
      const iw = cw * (0.62 + r() * 0.22), ih = ch * (0.6 + r() * 0.2);
      const x = c * cw + (cw - iw) / 2 + (r() - 0.5) * 24, y = ri * ch + (ch - ih) / 2 + (r() - 0.5) * 20;
      g.save();
      g.translate(x + iw / 2, y + ih / 2);
      g.rotate((r() - 0.5) * 0.12);
      g.translate(-iw / 2, -ih / 2);
      const t = k % 5;
      if (t === 0 || t === 3) photoCard(g, 0, 0, iw, ih, k % 3);
      else if (t === 1) {
        g.fillStyle = "rgba(0,0,0,.4)";
        g.fillRect(8, 10, iw, ih);
        g.fillStyle = "#efe8d6";
        g.fillRect(0, 0, iw, ih);
        carSide(g, iw / 2, ih * 0.62, iw * 0.34, { seed: k });
      } else if (t === 2) {
        g.fillStyle = "#efe8d6";
        g.fillRect(0, 0, iw, ih);
        ["#0B0B0C", "#234A78", "#D9A441", "#7C3F30"].forEach((c2, i) => { g.fillStyle = c2; g.fillRect(14 + i * (iw - 28) / 4, 14, (iw - 28) / 4 - 6, ih - 28); });
      } else {
        g.fillStyle = "#efe8d6";
        g.fillRect(0, 0, iw, ih);
        text(g, words[k % words.length], iw / 2, ih * 0.62, { font: FS, size: Math.min(84, iw / 4), align: "center", color: "#1b2a44", weight: 300 });
      }
      tape(g, iw / 2, 0, (r() - 0.5) * 0.6, 90, 30);
      g.restore();
    }
  }
}

function drawLaptop(g, w, h) {
  g.fillStyle = "#0c0d10";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#16181d";
  g.fillRect(0, 0, w, 54);
  text(g, "References / Night Drive", 24, 36, { font: FI, size: 22, color: "#8fa4c4", weight: 600 });
  for (let i = 0; i < 6; i++) photoCard(g, 24 + (i % 3) * 330, 80 + Math.floor(i / 3) * 260, 310, 240, i);
}

function drawWood(g, w, h) {
  g.fillStyle = "#4a3426";
  g.fillRect(0, 0, w, h);
  const r = rnd(5);
  for (let i = 0; i < 260; i++) {
    const y = r() * h;
    g.strokeStyle = `rgba(${r() > 0.5 ? "20,10,5" : "120,80,50"},${0.05 + r() * 0.12})`;
    g.lineWidth = 1 + r() * 3;
    g.beginPath();
    g.moveTo(0, y);
    g.bezierCurveTo(w * 0.3, y + (r() - 0.5) * 14, w * 0.7, y + (r() - 0.5) * 14, w, y + (r() - 0.5) * 8);
    g.stroke();
  }
}

function drawBlob(g, w, h) {
  const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
  gr.addColorStop(0, "rgba(0,0,0,.7)");
  gr.addColorStop(0.6, "rgba(0,0,0,.35)");
  gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
}

/* soft blue-to-black glow used behind the film set */
function drawGlow(g, w, h) {
  const gr = g.createRadialGradient(w / 2, h * 0.78, 10, w / 2, h * 0.78, w * 0.62);
  gr.addColorStop(0, "rgba(66,112,190,.55)");
  gr.addColorStop(0.45, "rgba(30,56,104,.28)");
  gr.addColorStop(1, "rgba(5,8,14,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
}

/* scuffed, streaky roughness map: makes the black floors read as real polished concrete */
function drawFloorRough(g, w, h) {
  g.fillStyle = "rgb(78,78,78)";
  g.fillRect(0, 0, w, h);
  const r = rnd(77);
  for (let i = 0; i < 2600; i++) {
    const v = 70 + r() * 70;
    g.fillStyle = `rgba(${v},${v},${v},${0.12 + r() * 0.2})`;
    g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3);
  }
  for (let i = 0; i < 110; i++) {
    const x = r() * w, y = r() * h, l = 40 + r() * 170, v = 120 + r() * 70;
    g.strokeStyle = `rgba(${v},${v},${v},${0.08 + r() * 0.18})`;
    g.lineWidth = 0.6 + r() * 1.8;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + l, y + (r() - 0.5) * 30);
    g.stroke();
  }
}

/* glowing studio sign behind the car */
function drawSign(g, w, h) {
  g.clearRect(0, 0, w, h);
  g.textAlign = "center";
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#ffe3a6");
  gr.addColorStop(1, "#d9a441");
  g.fillStyle = gr;
  g.font = `300 ${h * 0.7}px ${FS}`;
  g.fillText("RCS", w / 2, h * 0.62);
  g.fillStyle = "rgba(241,239,233,.92)";
  g.font = `600 ${h * 0.09}px ${FI}`;
  if ("letterSpacing" in g) g.letterSpacing = `${h * 0.03}px`;
  g.fillText("RARE CREATIVE STUDIOS", w / 2, h * 0.92);
}

function makeTextures(q) {
  if (typeof document === "undefined") return null;
  const T = {};
  const mk = (bw, bh, draw) => {
    const w = Math.round(bw * q), h = Math.round(bh * q);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    g.scale(w / bw, h / bh);
    draw(g, bw, bh);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };
  T.hero = mk(2048, 1490, drawHero);
  T.sheetB = mk(1024, 724, drawSketchSheet);
  T.sheetC = mk(1024, 724, drawCameraList);
  T.sheetD = mk(1024, 724, drawContact);
  T.board = mk(2048, 860, drawBoard);
  T.photoA = mk(512, 362, (g, w, h) => photo(g, w, h, 0));
  T.photoB = mk(512, 362, (g, w, h) => photo(g, w, h, 1));
  T.photoC = mk(512, 362, (g, w, h) => photo(g, w, h, 2));
  T.poster = mk(1024, 680, (g, w, h) => photo(g, w, h, 2));
  T.laptop = mk(1024, 640, drawLaptop);
  T.wood = mk(512, 512, drawWood);
  T.wood.wrapS = T.wood.wrapT = THREE.RepeatWrapping;
  T.wood.repeat.set(2, 1);
  T.blob = mk(256, 256, drawBlob);
  T.glow = mk(512, 256, drawGlow);
  T.sign = mk(1024, 256, drawSign);
  T.floorRough = mk(512, 512, drawFloorRough);
  T.floorRough.colorSpace = THREE.NoColorSpace;
  T.floorRough.wrapS = T.floorRough.wrapT = THREE.RepeatWrapping;
  T.floorRough.repeat.set(3, 3);
  T.hallRough = T.floorRough.clone();
  T.hallRough.repeat.set(40, 40);
  T.hallRough.needsUpdate = true;
  return T;
}

/* ====================================================================
   3. 3D PARTS
   ==================================================================== */

const HOT_WHITE = new THREE.Color("#dbe8ff").multiplyScalar(2.6);
const HOT_BLUE = new THREE.Color("#6a9be8").multiplyScalar(2.4);
const HOT_AMBER = new THREE.Color(COL.amber).multiplyScalar(2.2);
const BLUE_GLOW = new THREE.Color("#4f86d6").multiplyScalar(1.1);
const yawTo = (a, b) => Math.atan2(-(b[0] - a[0]), -(b[2] - a[2]));

/* lights whose level follows the timeline (studio / set channel) */
function ChLight({ as: As = "pointLight", base, ch, ...p }) {
  const r = useRef();
  useFrame(() => { if (r.current) r.current.intensity = base * GAIN * STATE[ch]; });
  return <As ref={r} intensity={base * GAIN} {...p} />;
}

function Spot({ pos, aim, base, ch, ...p }) {
  const ref = useRef();
  const tgt = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    tgt.position.set(aim[0], aim[1], aim[2]);
    tgt.updateMatrixWorld();
    if (ref.current) ref.current.target = tgt;
  }, [aim, tgt]);
  useFrame(() => { if (ref.current) ref.current.intensity = base * GAIN * STATE[ch]; });
  return (
    <>
      <spotLight ref={ref} position={pos} intensity={base * GAIN} {...p} />
      <primitive object={tgt} />
    </>
  );
}

/* faint volumetric light cone: sells the "studio haze" and gives depth */
const SHAFT_VS = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
const SHAFT_FS = "uniform vec3 uColor; uniform float uOp; varying vec2 vUv; void main(){ float a = pow(vUv.y, 1.7) * uOp; gl_FragColor = vec4(uColor, a); }";

function Shaft({ from, to, r = 1.2, color = "#ffd9a0", op = 0.12, ch = "studio" }) {
  const geo = useMemo(() => {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const d = b.clone().sub(a);
    const len = d.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), d.clone().normalize());
    return { len, quat, mid: a.clone().add(b).multiplyScalar(0.5).toArray() };
  }, [from, to]);
  const mat = useMemo(
    () => new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(color) }, uOp: { value: op } },
      vertexShader: SHAFT_VS, fragmentShader: SHAFT_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    }),
    [color, op]
  );
  useFrame(() => { mat.uniforms.uOp.value = op * STATE[ch]; });
  return (
    <mesh position={geo.mid} quaternion={geo.quat} renderOrder={5}>
      <coneGeometry args={[r, geo.len, 40, 1, true]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

function GlbModel({ url, ...p }) {
  const { scene } = useGLTF(url);
  const c = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={c} {...p} />;
}

/* ---------- people: articulated procedural figures (GLB-swappable) ---------- */

const ARM = {
  rest: { f: 0.06, a: 0.09, e: 0.28 },
  table: { f: 0.5, a: 0.12, e: 1.1 },
  mug: { f: 0.55, a: 0.05, e: 1.75 },
  cross: { f: 0.7, a: -0.15, e: 2.0 },
  cam: { f: 0.85, a: 0.12, e: 0.55 },
  talk: { f: 0.8, a: 0.2, e: 1.0 },
  point: { f: 0.95, a: 0.18, e: 0.3 },
  hip: { f: -0.1, a: 0.5, e: 0.6 },
};

function Limb({ len, r, mat, rot = [0, 0, 0], pos = [0, 0, 0], gref, children }) {
  return (
    <group ref={gref} position={pos} rotation={rot}>
      <mesh position={[0, -len / 2, 0]} material={mat} castShadow>
        <capsuleGeometry args={[r, Math.max(0.01, len - 2 * r), 4, 10]} />
      </mesh>
      <group position={[0, -len, 0]}>{children}</group>
    </group>
  );
}

/* gestL / gestR switch on conversation: the figure takes turns "speaking"
   (phase offsets stagger who talks), gestures with that arm, leans in and turns
   the head; while listening it nods slowly. */
function Figure({ id, pose = "standing", pos, yaw = 0, scale = 1, palette, armL = "rest", armR = "rest", head = 0, lean = 0, long = false, animate = true, phase = 0, gestL = false, gestR = false }) {
  const glb = ASSETS.people[id];
  const m = useMemo(() => {
    const std = (color, roughness = 0.85) => new THREE.MeshStandardMaterial({ color, roughness });
    return { top: std(palette.top), bottom: std(palette.bottom), skin: std(palette.skin, 0.6), hair: std(palette.hair, 0.55), shoe: std("#0c0c0d", 0.5) };
  }, [palette]);
  const torso = useRef(), headRef = useRef(), aR = useRef(), aL = useRef();
  useFrame(({ clock }) => {
    if (!animate || !torso.current) return;
    const t = clock.elapsedTime + phase;
    const sp = THREE.MathUtils.smoothstep(Math.sin(t * 0.42 + phase * 1.9), -0.15, 0.5); // 0 listening .. 1 speaking
    torso.current.scale.y = 1 + Math.sin(t * 1.6) * 0.004;
    torso.current.rotation.x = lean + Math.sin(t * 0.7) * 0.01 + sp * 0.05;
    headRef.current.rotation.y = head + Math.sin(t * 0.5) * 0.07 + sp * Math.sin(t * 0.9) * 0.08;
    headRef.current.rotation.x = Math.sin(t * 0.43) * 0.03 + (1 - sp) * Math.max(0, Math.sin(t * 2.1)) * 0.06 - sp * 0.02;
    const g = (ref, key, side, on) => {
      if (!on || !ref.current) return;
      const b = ARM[key];
      ref.current.rotation.x = b.f + sp * (0.08 + Math.sin(t * 3.1 + side) * 0.17);
      ref.current.rotation.z = side * b.a + sp * Math.sin(t * 2.2 + side * 2) * 0.07;
    };
    g(aR, armR, 1, gestR);
    g(aL, armL, -1, gestL);
  });
  if (glb) return <GlbModel url={glb} position={pos} rotation-y={yaw} scale={scale} />;
  const seated = pose === "seated";
  const hipY = seated ? 0.5 : 0.92;
  const arm = (side, key, ref) => {
    const a = ARM[key];
    return (
      <Limb gref={ref} len={0.3} r={0.05} mat={m.top} pos={[0.21 * side, 0.55, 0]} rot={[a.f, 0, side * a.a]}>
        <Limb len={0.27} r={0.042} mat={m.top} rot={[a.e, 0, -side * 0.12]}>
          <mesh material={m.skin}><sphereGeometry args={[0.045, 10, 10]} /></mesh>
        </Limb>
      </Limb>
    );
  };
  const leg = (side) => (
    <Limb len={0.44} r={0.075} mat={m.bottom} pos={[0.09 * side, 0, 0]} rot={seated ? [Math.PI / 2 - 0.03, 0, side * 0.05] : [0, 0, side * 0.03]}>
      <Limb len={0.42} r={0.06} mat={m.bottom} rot={seated ? [-1.5, 0, 0] : [0, 0, 0]}>
        <mesh material={m.shoe} position={[0, -0.03, -0.06]} castShadow><boxGeometry args={[0.1, 0.07, 0.26]} /></mesh>
      </Limb>
    </Limb>
  );
  return (
    <group position={pos} rotation-y={yaw} scale={scale}>
      <group position={[0, hipY, 0]}>
        <mesh material={m.bottom} castShadow><boxGeometry args={[0.34, 0.16, 0.22]} /></mesh>
        {leg(-1)}
        {leg(1)}
        <group ref={torso}>
          <mesh position={[0, 0.29, 0]} material={m.top} scale={[1, 1, 0.62]} castShadow><cylinderGeometry args={[0.17, 0.155, 0.58, 18]} /></mesh>
          <mesh position={[0, 0.56, 0]} material={m.top} scale={[1, 0.5, 0.6]}><sphereGeometry args={[0.2, 16, 10]} /></mesh>
          <mesh position={[0, 0.62, 0]} material={m.skin}><cylinderGeometry args={[0.045, 0.05, 0.1, 10]} /></mesh>
          {arm(-1, armL, aL)}
          {arm(1, armR, aR)}
          <group ref={headRef} position={[0, 0.69, 0]}>
            <mesh position={[0, 0.1, 0]} material={m.skin} scale={[1, 1.12, 1]} castShadow><sphereGeometry args={[0.1, 18, 16]} /></mesh>
            <mesh position={[0, 0.095, -0.1]} material={m.skin}><sphereGeometry args={[0.014, 8, 8]} /></mesh>
            <mesh position={[0, 0.125, 0.025]} material={m.hair} scale={[1.02, 1, 1.04]}><sphereGeometry args={[0.108, 18, 16]} /></mesh>
            {long && (
              <mesh position={[0, 0.0, 0.075]} material={m.hair}><capsuleGeometry args={[0.085, 0.24, 4, 10]} /></mesh>
            )}
          </group>
        </group>
      </group>
    </group>
  );
}

const CHAIR_MAT = new THREE.MeshStandardMaterial({ color: "#16171a", roughness: 0.6, metalness: 0.1 });
const METAL = new THREE.MeshStandardMaterial({ color: "#2a2b2e", roughness: 0.4, metalness: 0.85 });

function Chair({ pos, yaw }) {
  return (
    <group position={pos} rotation-y={yaw}>
      <mesh position={[0, 0.44, 0.04]} material={CHAIR_MAT} castShadow><boxGeometry args={[0.5, 0.06, 0.5]} /></mesh>
      <mesh position={[0, 0.74, 0.27]} material={CHAIR_MAT} castShadow><boxGeometry args={[0.48, 0.5, 0.05]} /></mesh>
      <mesh position={[0, 0.22, 0.04]} material={METAL}><cylinderGeometry args={[0.035, 0.035, 0.44, 8]} /></mesh>
      <mesh position={[0, 0.03, 0.04]} material={METAL}><boxGeometry args={[0.6, 0.03, 0.06]} /></mesh>
      <mesh position={[0, 0.03, 0.04]} rotation-y={Math.PI / 2} material={METAL}><boxGeometry args={[0.6, 0.03, 0.06]} /></mesh>
    </group>
  );
}

/* ---------- table props ---------- */

function Sheet({ pos, rot = 0, size, map, glow = 0.07 }) {
  return (
    <group position={pos} rotation-y={rot}>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={size} />
        <meshStandardMaterial map={map} emissiveMap={map} emissive="#ffffff" emissiveIntensity={glow} roughness={0.92} />
      </mesh>
    </group>
  );
}

function ContactShadow({ pos, size, blob, opacity = 0.8 }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={pos}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={blob} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

function Mug({ pos }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.045, 0]} castShadow><cylinderGeometry args={[0.04, 0.033, 0.09, 20]} /><meshStandardMaterial color="#e9e4d8" roughness={0.35} /></mesh>
      <mesh position={[0, 0.088, 0]} rotation-x={-Math.PI / 2}><circleGeometry args={[0.034, 20]} /><meshStandardMaterial color="#2a160c" roughness={0.3} /></mesh>
      <mesh position={[0.05, 0.05, 0]}><torusGeometry args={[0.022, 0.006, 8, 16]} /><meshStandardMaterial color="#e9e4d8" roughness={0.35} /></mesh>
    </group>
  );
}

function Pencil({ pos, rot, color = "#d6a23a", len = 0.17 }) {
  return (
    <mesh position={pos} rotation={[Math.PI / 2, 0, rot]}>
      <cylinderGeometry args={[0.004, 0.004, len, 6]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  );
}

function Laptop({ pos, rot, map }) {
  return (
    <group position={pos} rotation-y={rot}>
      <mesh position={[0, 0.007, 0]} castShadow material={METAL}><boxGeometry args={[0.34, 0.014, 0.23]} /></mesh>
      <group position={[0, 0.014, -0.115]} rotation-x={-0.28}>
        <mesh position={[0, 0.11, 0]} material={METAL}><boxGeometry args={[0.34, 0.22, 0.008]} /></mesh>
        <mesh position={[0, 0.11, 0.0045]}>
          <planeGeometry args={[0.32, 0.2]} />
          <meshBasicMaterial map={map} toneMapped={false} color={new THREE.Color(1.15, 1.15, 1.15)} />
        </mesh>
      </group>
    </group>
  );
}

function DeskLamp({ pos }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.01, 0]} material={METAL}><cylinderGeometry args={[0.08, 0.09, 0.02, 20]} /></mesh>
      <mesh position={[0.02, 0.17, 0]} rotation-z={-0.18} material={METAL}><cylinderGeometry args={[0.007, 0.007, 0.34, 8]} /></mesh>
      <mesh position={[-0.07, 0.33, 0]} rotation-z={0.9} material={METAL}><cylinderGeometry args={[0.007, 0.007, 0.26, 8]} /></mesh>
      <mesh position={[-0.15, 0.4, 0]} rotation-z={0.55}>
        <cylinderGeometry args={[0.03, 0.09, 0.12, 20, 1, true]} />
        <meshStandardMaterial color="#111" metalness={0.7} roughness={0.35} side={THREE.DoubleSide} emissive={COL.amber} emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[-0.158, 0.37, 0]}><sphereGeometry args={[0.03, 12, 12]} /><meshBasicMaterial color={HOT_AMBER} toneMapped={false} /></mesh>
      <ChLight base={0.5} ch="studio" position={[-0.17, 0.36, 0]} color="#ffb85c" distance={4} decay={2} />
    </group>
  );
}

/* the pendant lamp sways a hair, so the room feels alive */
function Pendant({ reduced }) {
  const g = useRef();
  useFrame(({ clock }) => {
    if (!g.current || reduced) return;
    const t = clock.elapsedTime;
    g.current.rotation.z = Math.sin(t * 0.6) * 0.004;
    g.current.rotation.x = Math.sin(t * 0.47 + 1) * 0.004;
  });
  return (
    <group position={[0, 0, -0.2]}>
      <group ref={g} position={[0, 5.7, 0]}>
        <group position={[0, -5.7, 0]}>
          <mesh position={[0, 5.5, 0]}><cylinderGeometry args={[0.004, 0.004, 6.4, 6]} /><meshBasicMaterial color="#050505" /></mesh>
          <mesh position={[0, 2.32, 0]}>
            <sphereGeometry args={[0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#101012" metalness={0.7} roughness={0.35} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 2.23, 0]}><sphereGeometry args={[0.07, 16, 16]} /><meshBasicMaterial color={HOT_AMBER} toneMapped={false} /></mesh>
        </group>
      </group>
    </group>
  );
}

/* ---------- camera equipment ---------- */

function Tripod({ pos, yaw = 0, h = 1.25, children }) {
  const legs = useMemo(
    () => [0, 1, 2].map((i) => {
      const a = i * 2.0944 + 0.4;
      const v = new THREE.Vector3(Math.sin(a) * 0.5, -h, Math.cos(a) * 0.5);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize());
      return { mid: [v.x / 2, h + v.y / 2, v.z / 2], q, len: v.length() };
    }),
    [h]
  );
  return (
    <group position={pos} rotation-y={yaw}>
      {legs.map((l, i) => (
        <mesh key={i} position={l.mid} quaternion={l.q} material={METAL}>
          <cylinderGeometry args={[0.015, 0.012, l.len, 8]} />
        </mesh>
      ))}
      <mesh position={[0, h, 0]} material={METAL}><cylinderGeometry args={[0.06, 0.05, 0.08, 12]} /></mesh>
      <group position={[0, h + 0.05, 0]}>{children}</group>
    </group>
  );
}

function CinemaCamera({ scale = 1 }) {
  const led = useRef();
  useFrame(({ clock }) => { if (led.current) led.current.visible = Math.sin(clock.elapsedTime * 4) > -0.2; });
  return (
    <group scale={scale}>
      <mesh position={[0, 0.12, 0]} castShadow material={METAL}><boxGeometry args={[0.16, 0.17, 0.3]} /></mesh>
      <mesh position={[0, 0.12, -0.27]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.055, 0.06, 0.24, 18]} /><meshStandardMaterial color="#0a0a0b" roughness={0.4} metalness={0.5} /></mesh>
      <mesh position={[0, 0.12, -0.45]}><boxGeometry args={[0.22, 0.2, 0.12]} /><meshStandardMaterial color="#0a0a0b" roughness={0.8} /></mesh>
      <mesh position={[0, 0.24, 0]} material={METAL}><boxGeometry args={[0.03, 0.05, 0.22]} /></mesh>
      <mesh position={[0.13, 0.17, 0.02]}><boxGeometry args={[0.02, 0.13, 0.17]} /><meshBasicMaterial color={HOT_BLUE} toneMapped={false} /></mesh>
      <mesh ref={led} position={[0, 0.2, -0.14]}><sphereGeometry args={[0.009, 8, 8]} /><meshBasicMaterial color={new THREE.Color("#ff2a1a").multiplyScalar(3)} toneMapped={false} /></mesh>
    </group>
  );
}

function Softbox({ pos, aim, size = [1.6, 1.2], hot = HOT_WHITE }) {
  const yaw = yawTo(pos, aim);
  return (
    <group position={pos} rotation-y={yaw}>
      <mesh position={[0, 0, 0.1]}><boxGeometry args={[size[0] + 0.12, size[1] + 0.12, 0.22]} /><meshStandardMaterial color="#070708" roughness={0.9} /></mesh>
      <mesh position={[0, 0, -0.012]}><planeGeometry args={size} /><meshBasicMaterial color={hot} toneMapped={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, -pos[1] / 2, 0.15]} material={METAL}><cylinderGeometry args={[0.025, 0.025, pos[1], 8]} /></mesh>
    </group>
  );
}

/* ---------- studio set (the meeting room) ---------- */

/* Seating plan, seen from the camera (which sits behind everyone, on +z):
   two people sit at the short ends of a compact table FACING EACH OTHER
   (profile to the camera); two people stand close behind the table, angled in
   towards the notes. Everyone is huddled around the same table and talking.
   Figure faces local -z, so yaw -PI/2 faces +x and yaw +PI/2 faces -x. */
const SEAT_X = 1.5;
const TABLE_Z = -0.2;
const NOTES_AT = [0.1, 0, -0.1];
const STAND_A = [-1.2, 0, 0.95];
const STAND_B = [1.2, 0, 0.95];
const PEOPLE = [
  { id: "seatA", pose: "seated", pos: [-SEAT_X, 0, TABLE_Z], yaw: -Math.PI / 2, head: 0.1, armL: "table", armR: "talk", gestR: true, lean: -0.05, palette: { top: "#2b2f36", bottom: "#15171b", skin: "#c58f6d", hair: "#17110d" }, phase: 0 },
  { id: "seatB", pose: "seated", pos: [SEAT_X, 0, TABLE_Z], yaw: Math.PI / 2, head: -0.1, armL: "talk", armR: "table", gestL: true, lean: -0.04, long: true, palette: { top: "#6b5642", bottom: "#1c1d22", skin: "#8a5a3f", hair: "#0d0b0a" }, phase: 1.3 },
  { id: "standA", pose: "standing", pos: STAND_A, yaw: yawTo(STAND_A, NOTES_AT), head: -0.3, armL: "cross", armR: "point", gestR: true, palette: { top: "#2f4358", bottom: "#17181c", skin: "#d1a07c", hair: "#2a1d14" }, phase: 2.1 },
  { id: "standB", pose: "standing", pos: STAND_B, yaw: yawTo(STAND_B, NOTES_AT), head: 0.3, armL: "talk", armR: "mug", gestL: true, scale: 1.04, palette: { top: "#1b1c20", bottom: "#222428", skin: "#a8734f", hair: "#0f0c0a" }, phase: 3.4 },
];

function StudioSet({ tx, low, reduced }) {
  const shelfItems = useMemo(() => {
    const r = rnd(9), out = [];
    for (let s = 0; s < 4; s++) for (let i = 0; i < 9; i++) {
      out.push({ s, z: -2.9 + i * 0.62 + r() * 0.1, w: 0.1 + r() * 0.2, h: 0.14 + r() * 0.2, c: ["#2b2f36", "#7C3F30", "#d9d4c4", "#234A78", "#15161a", "#D9A441"][Math.floor(r() * 6)] });
    }
    return out;
  }, []);
  const trim = <meshBasicMaterial color={HOT_AMBER} toneMapped={false} />;
  return (
    <group>
      {/* floor, rug, walls */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.003, -0.05]} receiveShadow><planeGeometry args={[9.6, 7]} /><meshStandardMaterial color="#1f1d1b" roughness={0.55} metalness={0.1} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, 0.1]} receiveShadow><planeGeometry args={[5.6, 3.6]} /><meshStandardMaterial color="#2a1f1b" roughness={1} /></mesh>
      <mesh position={[0, 1.9, -3.45]} receiveShadow><boxGeometry args={[9.8, 3.8, 0.12]} /><meshStandardMaterial color="#17181a" roughness={0.9} /></mesh>
      <mesh position={[-4.8, 1.9, -0.05]}><boxGeometry args={[0.12, 3.8, 7]} /><meshStandardMaterial color="#141517" roughness={0.9} /></mesh>
      <mesh position={[4.8, 1.9, -0.05]}><boxGeometry args={[0.12, 3.8, 7]} /><meshStandardMaterial color="#141517" roughness={0.9} /></mesh>

      {/* amber trim: defines the studio as a lit set when seen from outside */}
      <mesh position={[0, 3.82, -3.45]}><boxGeometry args={[9.84, 0.05, 0.14]} />{trim}</mesh>
      <mesh position={[-4.8, 3.82, -0.05]}><boxGeometry args={[0.14, 0.05, 7.04]} />{trim}</mesh>
      <mesh position={[4.8, 3.82, -0.05]}><boxGeometry args={[0.14, 0.05, 7.04]} />{trim}</mesh>
      <mesh position={[0, 0.02, 3.46]}><boxGeometry args={[9.8, 0.03, 0.05]} />{trim}</mesh>

      {/* wall: board, framed photos */}
      <mesh position={[-0.3, 1.8, -3.37]}>
        <planeGeometry args={[6.2, 2.5]} />
        <meshStandardMaterial map={tx.board} emissiveMap={tx.board} emissive="#ffffff" emissiveIntensity={0.2} roughness={0.95} />
      </mesh>
      <mesh position={[3.35, 1.9, -3.38]}><boxGeometry args={[1.68, 1.18, 0.04]} /><meshStandardMaterial color="#0a0a0b" roughness={0.5} /></mesh>
      <mesh position={[3.35, 1.9, -3.355]}>
        <planeGeometry args={[1.5, 1]} />
        <meshStandardMaterial map={tx.poster} emissiveMap={tx.poster} emissive="#ffffff" emissiveIntensity={0.25} />
      </mesh>
      {[[-3.55, 0.45, 0.9, tx.photoA], [-3.55, -0.7, 0.9, tx.photoB]].map(([x, y, w, m], i) => (
        <mesh key={i} position={[x, 2.1 + y, -3.37]}><planeGeometry args={[w, w * 0.7]} /><meshStandardMaterial map={m} emissiveMap={m} emissive="#fff" emissiveIntensity={0.2} /></mesh>
      ))}

      {/* right wall: window glow */}
      <mesh position={[4.73, 1.9, -0.9]} rotation-y={-Math.PI / 2}><planeGeometry args={[2.4, 1.7]} /><meshBasicMaterial color={BLUE_GLOW} toneMapped={false} /></mesh>
      <mesh position={[4.72, 1.9, -0.9]} rotation-y={-Math.PI / 2}><boxGeometry args={[0.05, 1.7, 0.04]} /><meshStandardMaterial color="#050505" /></mesh>
      <mesh position={[4.72, 1.9, -0.9]} rotation-y={-Math.PI / 2}><boxGeometry args={[2.4, 0.05, 0.04]} /><meshStandardMaterial color="#050505" /></mesh>

      {/* left wall: shelving */}
      {[0.5, 1.1, 1.7, 2.3].map((y) => (
        <mesh key={y} position={[-4.55, y, -0.2]}><boxGeometry args={[0.36, 0.04, 6]} /><meshStandardMaterial color="#2a2018" roughness={0.7} /></mesh>
      ))}
      {shelfItems.map((b, i) => (
        <mesh key={i} position={[-4.55, 0.5 + b.s * 0.6 + b.h / 2 + 0.02, b.z]}><boxGeometry args={[0.22, b.h, b.w]} /><meshStandardMaterial color={b.c} roughness={0.8} /></mesh>
      ))}

      {/* production equipment + props in the room */}
      <mesh position={[-3.6, 0.3, -2.7]}><boxGeometry args={[1.0, 0.6, 0.6]} /><meshStandardMaterial color="#0d0e10" roughness={0.6} metalness={0.4} /></mesh>
      <mesh position={[-3.5, 0.78, -2.6]}><boxGeometry args={[0.8, 0.32, 0.5]} /><meshStandardMaterial color="#111214" roughness={0.6} metalness={0.4} /></mesh>
      <Tripod pos={[3.7, 0, -2.4]} yaw={0.6} h={1.3}><CinemaCamera scale={0.8} /></Tripod>
      <group position={[4.1, 0, -2.9]}>
        <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.2, 0.15, 0.4, 14]} /><meshStandardMaterial color="#1a1613" roughness={0.8} /></mesh>
        {[[0, 0.75, 0, 0.42], [0.2, 0.62, 0.1, 0.3], [-0.2, 0.66, -0.08, 0.32], [0.05, 0.98, 0.05, 0.28]].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]}><sphereGeometry args={[r, 10, 10]} /><meshStandardMaterial color="#10201a" roughness={0.9} /></mesh>
        ))}
      </group>

      {/* table (compact, so everyone is close), chairs */}
      <group position={[0, 0, TABLE_Z]}>
        <mesh position={[0, 0.72, 0]} castShadow receiveShadow><boxGeometry args={[2.6, 0.06, 1.3]} /><meshStandardMaterial map={tx.wood} color="#c9b0a0" roughness={0.42} metalness={0.05} /></mesh>
        {[[-1.15, -0.55], [1.15, -0.55], [-1.15, 0.55], [1.15, 0.55]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.345, z]} castShadow><boxGeometry args={[0.08, 0.69, 0.08]} /><meshStandardMaterial color="#1a1512" roughness={0.6} /></mesh>
        ))}
      </group>
      <Pendant reduced={reduced} />
      {/* chairs sit just behind each seated person, backs away from the table */}
      <Chair pos={[-SEAT_X - 0.06, 0, TABLE_Z]} yaw={-Math.PI / 2} />
      <Chair pos={[SEAT_X + 0.06, 0, TABLE_Z]} yaw={Math.PI / 2} />

      {/* notes, storyboards and references on the table */}
      <ContactShadow pos={[0.2, 0.7545, -0.1]} size={[1.34, 1.04]} blob={tx.blob} />
      <group position={[0.2, 0.7585, -0.12]} rotation-y={0.05}><Sheet pos={[0, 0, 0]} size={[1.1, 0.8]} map={tx.hero} glow={0.1} /></group>
      <ContactShadow pos={[-0.62, 0.7545, -0.5]} size={[0.66, 0.5]} blob={tx.blob} opacity={0.6} />
      <Sheet pos={[-0.62, 0.7575, -0.5]} rot={0.38} size={[0.52, 0.37]} map={tx.sheetB} />
      <ContactShadow pos={[0.98, 0.7545, 0.02]} size={[0.66, 0.5]} blob={tx.blob} opacity={0.6} />
      <Sheet pos={[0.98, 0.7575, 0.02]} rot={-0.3} size={[0.52, 0.37]} map={tx.sheetC} />
      <Sheet pos={[0.93, 0.7595, -0.55]} rot={0.5} size={[0.4, 0.28]} map={tx.sheetD} />
      <Sheet pos={[-0.58, 0.7595, 0.12]} rot={-0.15} size={[0.22, 0.155]} map={tx.photoB} glow={0.2} />
      <Sheet pos={[-0.3, 0.7605, 0.14]} rot={0.3} size={[0.22, 0.155]} map={tx.photoC} glow={0.2} />
      <Laptop pos={[-0.98, 0.752, -0.5]} rot={0.25} map={tx.laptop} />
      <DeskLamp pos={[1.08, 0.752, -0.55]} />
      <Mug pos={[-0.32, 0.752, 0.22]} />
      <Mug pos={[0.9, 0.752, 0.3]} />
      <Mug pos={[-1.1, 0.752, 0.0]} />
      <Pencil pos={[0.7, 0.76, 0.3]} rot={0.4} />
      <Pencil pos={[0.74, 0.76, 0.33]} rot={0.6} color="#7C3F30" />
      <Pencil pos={[-0.1, 0.76, 0.34]} rot={-0.3} color="#234A78" len={0.14} />
      <Pencil pos={[0.45, 0.76, 0.34]} rot={1.2} color="#111" len={0.14} />

      {/* the four people */}
      {PEOPLE.map((p) => <Figure key={p.id} {...p} animate={!reduced} />)}

      {/* atmosphere: light cone under the pendant + floating dust */}
      <Shaft from={[0, 2.25, -0.2]} to={[0, 0.76, -0.2]} r={1.35} color="#ffd9a0" op={0.16} ch="studio" />
      {!low && <Sparkles count={70} scale={[7, 3.4, 5]} position={[0, 1.8, 0]} size={1.8} speed={reduced ? 0 : 0.25} opacity={0.55} color="#ffd9a0" />}

      {/* soft area lights: window spill + ceiling bounce */}
      <ChLight as="rectAreaLight" base={7} ch="studio" position={[4.6, 1.9, -0.9]} rotation-y={Math.PI / 2} width={2.4} height={1.7} color="#6f9be8" />
      <ChLight as="rectAreaLight" base={3} ch="studio" position={[0, 2.35, -0.2]} rotation-x={-Math.PI / 2} width={1.6} height={1.0} color="#ffd9a0" />

      {/* practical lights */}
      <Spot pos={[0, 2.22, -0.2]} aim={[0, 0.75, -0.2]} base={9} ch="studio" angle={0.8} penumbra={0.9} decay={2} color="#ffd9a0" castShadow={!low} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0006} />
      <Spot pos={[-1.6, 3.4, -1.6]} aim={[-1.6, 1.9, -3.4]} base={40} ch="studio" angle={0.7} penumbra={0.8} decay={2} color="#ffc98a" />
      <Spot pos={[2.6, 3.4, -1.6]} aim={[2.6, 1.9, -3.4]} base={40} ch="studio" angle={0.7} penumbra={0.8} decay={2} color="#ffc98a" />
      {/* soft front fill so the four people read clearly from behind at the open */}
      <Spot pos={[0, 3.4, 4.2]} aim={[0, 0.9, 0.4]} base={28} ch="studio" angle={0.75} penumbra={1} decay={2} color="#b9ccf0" />
      <ChLight as="directionalLight" base={2.4} ch="studio" position={[-6, 3, 1]} color="#5d8ed0" />
      <ChLight as="directionalLight" base={1.5} ch="studio" position={[0.5, 3, 9]} color="#8aa6d6" />
    </group>
  );
}

/* ---------- the car (procedural stand-in, GLB-swappable) ---------- */

function ProceduralCar() {
  const geo = useMemo(() => {
    const bt = 0.12;
    const lower = new THREE.Shape();
    lower.moveTo(-2.3, 0.3);
    lower.lineTo(2.34, 0.3);
    lower.lineTo(2.4, 0.52);
    lower.quadraticCurveTo(2.42, 0.7, 2.25, 0.76);
    lower.quadraticCurveTo(1.4, 0.88, 0.9, 0.98);
    lower.lineTo(-1.6, 1.0);
    lower.quadraticCurveTo(-2.25, 0.98, -2.34, 0.8);
    lower.lineTo(-2.38, 0.55);
    lower.lineTo(-2.3, 0.3);
    const cabin = new THREE.Shape();
    cabin.moveTo(0.95, 0.98);
    cabin.quadraticCurveTo(0.45, 1.3, 0.2, 1.36);
    cabin.lineTo(-0.95, 1.38);
    cabin.quadraticCurveTo(-1.5, 1.2, -1.8, 1.02);
    cabin.lineTo(0.95, 0.98);
    const mk = (shape, width) => {
      const g = new THREE.ExtrudeGeometry(shape, { depth: width - 2 * bt, bevelEnabled: true, bevelThickness: bt, bevelSize: bt, bevelSegments: 10, curveSegments: 40 });
      g.translate(0, 0, -(width - 2 * bt) / 2);
      g.rotateY(-Math.PI / 2);
      g.computeVertexNormals();
      return g;
    };
    return { body: mk(lower, 1.9), cabin: mk(cabin, 1.52) };
  }, []);
  const M = useMemo(() => ({
    paint: new THREE.MeshPhysicalMaterial({ color: "#07080a", metalness: 0.92, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.7 }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#05080e", metalness: 0.95, roughness: 0.04, clearcoat: 1, envMapIntensity: 2 }),
    tire: new THREE.MeshStandardMaterial({ color: "#09090a", roughness: 0.8 }),
    rim: new THREE.MeshStandardMaterial({ color: "#9a9da3", metalness: 1, roughness: 0.18 }),
    rotor: new THREE.MeshStandardMaterial({ color: "#6b6e74", metalness: 1, roughness: 0.35 }),
    caliper: new THREE.MeshStandardMaterial({ color: "#b8872a", metalness: 0.3, roughness: 0.4 }),
    chrome: new THREE.MeshStandardMaterial({ color: "#c9ccd2", metalness: 1, roughness: 0.12 }),
    black: new THREE.MeshStandardMaterial({ color: "#020203", roughness: 0.35, metalness: 0.6 }),
  }), []);
  const wheels = [[0.92, 1.46], [-0.92, 1.46], [0.92, -1.4], [-0.92, -1.4]];
  const seam = <meshBasicMaterial color="#010102" />;
  return (
    <group>
      <mesh geometry={geo.body} material={M.paint} castShadow />
      <mesh geometry={geo.cabin} material={M.glass} />
      <mesh position={[0, 1.395, -0.35]} material={M.paint}><boxGeometry args={[1.18, 0.035, 1.35]} /></mesh>
      <mesh position={[0, 0.31, 0]}><boxGeometry args={[1.7, 0.1, 4.5]} /><meshStandardMaterial color="#020203" roughness={1} /></mesh>

      {/* wheels, arches, brakes */}
      {wheels.map(([x, z], i) => {
        const s = Math.sign(x);
        return (
          <group key={i}>
            <mesh position={[s * 0.956, 0.38, z]} rotation-y={s * Math.PI / 2}><circleGeometry args={[0.4, 32]} />{seam}</mesh>
            <group position={[x, 0.34, z]}>
              <mesh rotation-z={Math.PI / 2} material={M.tire}><cylinderGeometry args={[0.34, 0.34, 0.26, 36]} /></mesh>
              <mesh rotation-z={Math.PI / 2} position={[s * 0.02, 0, 0]} material={M.rim}><cylinderGeometry args={[0.23, 0.23, 0.27, 28]} /></mesh>
              <mesh rotation-y={Math.PI / 2} position={[s * 0.135, 0, 0]} material={M.rim}><torusGeometry args={[0.232, 0.014, 8, 36]} /></mesh>
              <mesh rotation-z={Math.PI / 2} position={[s * 0.07, 0, 0]} material={M.rotor}><cylinderGeometry args={[0.19, 0.19, 0.02, 28]} /></mesh>
              <mesh position={[s * 0.07, 0.12, 0]} material={M.caliper}><boxGeometry args={[0.05, 0.12, 0.1]} /></mesh>
              {[0, 1, 2, 3, 4].map((k) => (
                <mesh key={k} position={[s * 0.15, 0, 0]} rotation-x={(k * Math.PI * 2) / 5} material={M.rim}><boxGeometry args={[0.02, 0.45, 0.045]} /></mesh>
              ))}
              <mesh rotation-z={Math.PI / 2} position={[s * 0.16, 0, 0]} material={M.chrome}><cylinderGeometry args={[0.05, 0.05, 0.02, 16]} /></mesh>
            </group>
          </group>
        );
      })}

      {/* panel seams, handles, window trim */}
      {[-1, 1].map((s) => (
        <group key={s}>
          {[0.9, -0.4].map((zz) => (
            <mesh key={zz} position={[s * 0.953, 0.72, zz]}><boxGeometry args={[0.006, 0.3, 0.012]} />{seam}</mesh>
          ))}
          <mesh position={[s * 0.953, 0.6, -0.2]}><boxGeometry args={[0.006, 0.012, 2.9]} />{seam}</mesh>
          {[0.45, -0.85].map((zz) => (
            <mesh key={zz} position={[s * 0.957, 0.82, zz]} material={M.chrome}><boxGeometry args={[0.012, 0.02, 0.16]} /></mesh>
          ))}
          <mesh position={[s * 0.765, 1.0, -0.4]} material={M.chrome}><boxGeometry args={[0.012, 0.018, 2.6]} /></mesh>
          <mesh position={[s * 0.9, 1.0, 0.85]} material={M.paint}><boxGeometry args={[0.14, 0.09, 0.2]} /></mesh>
        </group>
      ))}

      {/* front: kidney grille, hex headlights, splitter, fog lamps, plate */}
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.6, 2.5]}><boxGeometry args={[0.32, 0.17, 0.05]} /><meshStandardMaterial color="#020202" metalness={0.9} roughness={0.3} /></mesh>
      ))}
      <mesh position={[0, 0.6, 2.47]} material={M.chrome}><boxGeometry args={[0.78, 0.2, 0.03]} /></mesh>
      <mesh position={[0, 0.38, 2.55]} material={M.black}><boxGeometry args={[1.3, 0.14, 0.04]} /></mesh>
      <mesh position={[0, 0.27, 2.5]} material={M.black}><boxGeometry args={[1.7, 0.03, 0.26]} /></mesh>
      <mesh position={[0, 0.5, 2.565]}><boxGeometry args={[0.46, 0.11, 0.01]} /><meshStandardMaterial color="#e9e7df" roughness={0.5} /></mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.72, 0.8, 2.22]} rotation-x={-0.4}><boxGeometry args={[0.46, 0.05, 0.13]} /><meshBasicMaterial color={HOT_WHITE} toneMapped={false} /></mesh>
          <mesh position={[s * 0.72, 0.72, 2.3]} rotation-x={-0.4}><boxGeometry args={[0.4, 0.016, 0.1]} /><meshBasicMaterial color={HOT_BLUE} toneMapped={false} /></mesh>
          <mesh position={[s * 0.7, 0.38, 2.57]}><boxGeometry args={[0.14, 0.04, 0.01]} /><meshBasicMaterial color={HOT_WHITE.clone().multiplyScalar(0.6)} toneMapped={false} /></mesh>
          <mesh position={[s * 0.7, 0.88, -2.36]}><boxGeometry args={[0.5, 0.05, 0.04]} /><meshBasicMaterial color={new THREE.Color("#ff2a1a").multiplyScalar(1.8)} toneMapped={false} /></mesh>
        </group>
      ))}

      {/* rear: light bar, lip spoiler, plate */}
      <mesh position={[0, 0.88, -2.37]}><boxGeometry args={[0.9, 0.018, 0.03]} /><meshBasicMaterial color={new THREE.Color("#ff2a1a").multiplyScalar(1.1)} toneMapped={false} /></mesh>
      <mesh position={[0, 0.99, -2.15]} material={M.paint}><boxGeometry args={[1.5, 0.04, 0.22]} /></mesh>
      <mesh position={[0, 0.55, -2.51]}><boxGeometry args={[0.46, 0.11, 0.01]} /><meshStandardMaterial color="#e9e7df" roughness={0.5} /></mesh>

      {/* headlight spill on the floor */}
      <ChLight base={5} ch="set" position={[0, 0.5, 3.4]} color="#6a9be8" distance={7} decay={2} />
    </group>
  );
}

function Car() {
  const g = useRef();
  useFrame(({ clock }) => { if (g.current) g.current.rotation.y = Math.sin(clock.elapsedTime * 0.25) * 0.03; });
  return (
    <group ref={g}>
      {ASSETS.car ? <GlbModel url={ASSETS.car} scale={ASSETS.carScale} /> : <ProceduralCar />}
    </group>
  );
}

/* ---------- the film set (a soundstage built around the studio) ---------- */

function FilmSet({ tx, low, reduced }) {
  const ring = useRef();
  useFrame((_, dt) => { if (ring.current && !reduced) ring.current.rotation.y += dt * 0.12; });
  const cx = C.x, cz = C.z;
  const opCam = [OP_POS.x + TO_CAR.x * 0.85, 0, OP_POS.z + TO_CAR.z * 0.85];
  const A = rel(-5.3, 2.3), B = rel(4.3, 2.2);
  const crewA = [A[0], 0, A[1]], crewB = [B[0], 0, B[1]];
  const crew = { palette: { top: "#1c1d21", bottom: "#141518", skin: "#b8845f", hair: "#1a120d" } };
  const sbA = rel(-5.4, -4.2), sbB = rel(5.6, -4.4), sbC = rel(-3, -5);
  const flag = rel(-4.6, -0.6), refl = rel(3, 1.2), mon = rel(5.2, 3.2);
  const ticks = useMemo(() => Array.from({ length: 48 }, (_, i) => i * (Math.PI * 2) / 48), []);
  const backZ = cz - 7.2;
  return (
    <group>
      {/* always-on fill so the stage is legible during the whole transition */}
      <pointLight position={[cx, 5.5, cz + 1]} color="#7897c7" intensity={22 * GAIN} distance={30} decay={2} />
      <pointLight position={[cx - 5, 3.2, cz - 2]} color="#d9a441" intensity={9 * GAIN} distance={18} decay={2} />

      {/* polished black stage floor */}
      <mesh rotation-x={-Math.PI / 2} position={[cx, 0.004, cz]} receiveShadow>
        <circleGeometry args={[9, 96]} />
        <meshStandardMaterial color="#0c0d10" roughness={1} roughnessMap={tx.floorRough} metalness={0.72} envMapIntensity={1.4} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[cx, 0.007, cz]}>
        <ringGeometry args={[8.85, 9, 96]} />
        <meshBasicMaterial color={HOT_BLUE} toneMapped={false} />
      </mesh>

      {/* turntable with rotating amber ring */}
      <mesh position={[cx, 0.03, cz]} receiveShadow><cylinderGeometry args={[3.2, 3.2, 0.06, 64]} /><meshStandardMaterial color="#0a0a0b" roughness={0.3} metalness={0.8} /></mesh>
      <mesh position={[cx, 0.062, cz]} rotation-x={Math.PI / 2}><torusGeometry args={[3.18, 0.012, 8, 96]} /><meshBasicMaterial color={HOT_AMBER} toneMapped={false} /></mesh>
      <group ref={ring} position={[cx, 0.066, cz]}>
        {ticks.map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 2.9, 0, Math.sin(a) * 2.9]} rotation-y={-a}>
            <boxGeometry args={[i % 6 === 0 ? 0.22 : 0.08, 0.006, 0.02]} />
            <meshBasicMaterial color={i % 6 === 0 ? HOT_AMBER : BLUE_GLOW} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <ContactShadow pos={[cx, 0.07, cz]} size={[6.4, 3.4]} blob={tx.blob} opacity={0.9} />

      {/* backdrop: stays fully behind the car and clear of the studio walls */}
      <mesh position={[cx + 1, 4.2, backZ]}><planeGeometry args={[22, 8.4]} /><meshStandardMaterial color="#070a10" roughness={1} /></mesh>
      <mesh position={[cx, 3.2, backZ + 0.02]}><planeGeometry args={[18, 7]} /><meshBasicMaterial map={tx.glow} transparent depthWrite={false} toneMapped={false} /></mesh>
      {[-4.2, 4.2].map((dx) => (
        <mesh key={dx} position={[cx + dx, 2.2, backZ + 0.4]}><boxGeometry args={[0.08, 4.4, 0.08]} /><meshBasicMaterial color={HOT_BLUE} toneMapped={false} /></mesh>
      ))}
      <mesh position={[cx, 3.1, backZ + 0.05]}><planeGeometry args={[5.4, 1.35]} /><meshBasicMaterial map={tx.sign} color={new THREE.Color(1.6, 1.6, 1.6)} transparent depthWrite={false} toneMapped={false} /></mesh>
      <mesh position={[cx, 0.12, backZ + 0.4]}><boxGeometry args={[9, 0.04, 0.04]} /><meshBasicMaterial color={HOT_AMBER} toneMapped={false} /></mesh>
      {[-2.4, 2.4].map((dx) => (
        <mesh key={dx} position={[cx + dx, 4.2, cz]}><boxGeometry args={[0.7, 0.1, 5]} /><meshBasicMaterial color={HOT_WHITE} toneMapped={false} /></mesh>
      ))}
      <mesh position={[cx, 4.5, cz]}><boxGeometry args={[7.4, 0.06, 0.06]} /><meshStandardMaterial color="#050505" metalness={0.8} /></mesh>

      {/* lighting equipment: softboxes, flag, reflector */}
      <Softbox pos={[sbA[0], 2.6, sbA[1]]} aim={[cx, 1, cz]} size={[1.8, 1.3]} />
      <Softbox pos={[sbB[0], 2.3, sbB[1]]} aim={[cx, 1, cz]} size={[1.2, 1.6]} hot={HOT_BLUE} />
      <Softbox pos={[sbC[0], 1.4, sbC[1]]} aim={[cx, 0.7, cz]} size={[0.5, 1.6]} hot={HOT_AMBER} />
      <group position={[flag[0], 0, flag[1]]}>
        <mesh position={[0, 1.2, 0]} material={METAL}><cylinderGeometry args={[0.02, 0.02, 2.4, 8]} /></mesh>
        <mesh position={[0, 2.0, 0]}><boxGeometry args={[0.9, 1.1, 0.02]} /><meshStandardMaterial color="#030303" roughness={1} /></mesh>
      </group>
      <group position={[refl[0], 0, refl[1]]} rotation-y={yawTo([refl[0], 0, refl[1]], [cx, 0, cz])}>
        <mesh position={[0, 0.9, 0]} material={METAL}><cylinderGeometry args={[0.02, 0.02, 1.8, 8]} /></mesh>
        <mesh position={[0, 1.4, -0.05]} rotation-x={-0.12}><cylinderGeometry args={[0.6, 0.6, 0.015, 32]} /><meshStandardMaterial color="#d8dde6" metalness={1} roughness={0.2} /></mesh>
      </group>

      {/* video village */}
      <group position={[mon[0], 0, mon[1]]} rotation-y={yawTo([mon[0], 0, mon[1]], [cx, 0, cz])}>
        <mesh position={[0, 0.7, 0]} material={METAL}><cylinderGeometry args={[0.02, 0.02, 1.4, 8]} /></mesh>
        <mesh position={[0, 1.5, 0]}><boxGeometry args={[0.55, 0.34, 0.03]} /><meshStandardMaterial color="#050505" /></mesh>
        <mesh position={[0, 1.5, -0.018]}><planeGeometry args={[0.5, 0.29]} /><meshBasicMaterial color={HOT_BLUE} toneMapped={false} side={THREE.DoubleSide} /></mesh>
      </group>

      {/* cinema camera on tripod, operator filming the car */}
      <Tripod pos={opCam} yaw={SET_YAW} h={1.22}><CinemaCamera /></Tripod>
      <Figure id="operator" pose="standing" pos={[OP_POS.x, 0, OP_POS.z]} yaw={SET_YAW} armL="cam" armR="cam" lean={-0.14} head={0} palette={{ top: "#14151a", bottom: "#101114", skin: "#c08a64", hair: "#1a120d" }} animate={!reduced} />
      <Figure id="crewA" pose="standing" pos={crewA} yaw={yawTo(crewA, [cx, 0, cz])} armL="hip" armR="rest" {...crew} animate={!reduced} />
      <Figure id="crewB" pose="standing" pos={crewB} yaw={yawTo(crewB, [cx, 0, cz])} armL="rest" armR="mug" palette={{ top: "#2d2a26", bottom: "#17181b", skin: "#8f5e41", hair: "#0c0a09" }} animate={!reduced} />

      {/* the car */}
      <group position={[cx, 0.06, cz]} rotation-y={SET_YAW}><Car /></group>

      {/* atmosphere */}
      <Shaft from={[sbA[0], 3.2, sbA[1]]} to={[cx, 0.1, cz]} r={1.6} color="#6f9be0" op={0.1} ch="set" />
      <Shaft from={[sbB[0], 3.0, sbB[1]]} to={[cx, 0.1, cz]} r={1.5} color="#5f8fdc" op={0.09} ch="set" />
      <Shaft from={[cx, 6, cz]} to={[cx, 0.05, cz]} r={3.1} color="#cfe0ff" op={0.07} ch="set" />
      {!low && <Sparkles count={110} scale={[14, 5, 12]} position={[cx, 2.4, cz]} size={2} speed={reduced ? 0 : 0.3} opacity={0.5} color="#9fc0ff" />}

      {/* set lights */}
      <Spot pos={[sbA[0], 3.2, sbA[1] + 0.2]} aim={[cx, 0.9, cz]} base={150} ch="set" angle={0.5} penumbra={0.8} decay={2} color="#4a82d6" />
      <Spot pos={[sbB[0] + 0.2, 3.0, sbB[1] + 0.2]} aim={[cx, 0.9, cz]} base={140} ch="set" angle={0.5} penumbra={0.8} decay={2} color="#3f74c4" />
      <Spot pos={[cx, 6, cz + 1]} aim={[cx, 0.6, cz]} base={110} ch="set" angle={0.5} penumbra={0.9} decay={2} color="#cfe0ff" castShadow={!low} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} />
      <Spot pos={[cx - 4.8, 1.2, cz + 5.5]} aim={[cx, 0.6, cz]} base={55} ch="set" angle={0.6} penumbra={0.9} decay={2} color={COL.amber} />
      <Spot pos={[cx - 6, 3.0, cz + 9.5]} aim={[OP_POS.x, 1.2, OP_POS.z]} base={90} ch="set" angle={0.5} penumbra={0.9} decay={2} color="#ffcf8f" />
      <ChLight as="hemisphereLight" base={1.1} ch="set" args={["#3a557f", "#1b140e", 1]} />
    </group>
  );
}

/* ---------- the soundstage hall around everything ---------- */

const DOME_VS = "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
const DOME_FS = `uniform vec3 uTop; uniform vec3 uHor; uniform vec3 uBot; varying vec3 vP;
void main(){
  float y = vP.y;
  vec3 c = mix(uHor, uTop, smoothstep(0.0, 0.55, y));
  c = mix(c, uBot, smoothstep(0.0, -0.35, y));
  gl_FragColor = vec4(c, 1.0);
}`;

function Dome() {
  const mat = useMemo(
    () => new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { uTop: { value: new THREE.Color("#04060b") }, uHor: { value: new THREE.Color("#15253f") }, uBot: { value: new THREE.Color("#080c14") } },
      vertexShader: DOME_VS, fragmentShader: DOME_FS,
    }),
    []
  );
  return (
    <mesh position={[7.5, 0, 6]} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[160, 32, 16]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

function Hall({ tx }) {
  const pillars = useMemo(() => {
    const out = [];
    const n = 18;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.2;
      const rad = 34 + (i % 3) * 7;
      out.push({ x: 7.5 + Math.cos(a) * rad, z: 6 + Math.sin(a) * rad, h: 8 + (i % 4) * 3, hot: i % 3 === 0 ? HOT_AMBER : HOT_BLUE });
    }
    return out;
  }, []);
  return (
    <group>
      <Dome />
      {/* hall floor + faint grid for parallax and scale */}
      <mesh rotation-x={-Math.PI / 2} position={[7.5, -0.001, 6]} receiveShadow>
        <planeGeometry args={[260, 260]} />
        <meshStandardMaterial color="#13161c" roughness={1} roughnessMap={tx.hallRough} metalness={0.4} envMapIntensity={1.2} />
      </mesh>
      <gridHelper args={[200, 100, "#22324d", "#151d2c"]} position={[7.5, 0.0005, 6]} />
      {pillars.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <mesh position={[0, p.h / 2, 0]}><boxGeometry args={[0.5, p.h, 0.5]} /><meshStandardMaterial color="#0a0c11" roughness={0.8} /></mesh>
          <mesh position={[0, p.h / 2, 0.27]}><boxGeometry args={[0.07, p.h, 0.03]} /><meshBasicMaterial color={p.hot} toneMapped={false} /></mesh>
        </group>
      ))}
      {/* overhead truss lines */}
      {[-12, 0, 12, 24].map((z) => (
        <mesh key={z} position={[7.5, 9.5, z]}><boxGeometry args={[70, 0.12, 0.12]} /><meshStandardMaterial color="#0a0c11" metalness={0.8} roughness={0.4} /></mesh>
      ))}
      {[-22, -4, 14, 32].map((x) => (
        <mesh key={x} position={[x, 9.5, 6]}><boxGeometry args={[0.12, 0.12, 70]} /><meshStandardMaterial color="#0a0c11" metalness={0.8} roughness={0.4} /></mesh>
      ))}
    </group>
  );
}

/* ====================================================================
   4. SCENE, CAMERA RIG, EFFECTS
   ==================================================================== */

function CameraRig({ reduced }) {
  const { camera, size, scene } = useThree();
  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), ptr: new THREE.Vector2() }), []);
  useFrame(({ clock }) => {
    const s = STATE;
    const aspect = size.width / Math.max(1, size.height);
    /* responsive framing: below a 1.6 aspect we widen the lens AND dolly back,
       splitting the extra horizontal coverage between the two so nothing distorts.
       Inside the camera lens we skip the dolly-back so we never leave the lens;
       the blend is continuous so there is no pop entering or leaving the shot. */
    const need = Math.max(1, 1.6 / aspect);
    const lensMix = THREE.MathUtils.clamp((29 - s.fov) / 3, 0, 1);
    const f = lerp(Math.min(Math.sqrt(need), 1.8), 1, lensMix);
    tmp.look.set(s.lx, s.ly, s.lz);
    tmp.pos.set(s.px, s.py, s.pz).sub(tmp.look).multiplyScalar(f).add(tmp.look);
    tmp.pos.z += s.intro * 1.6;
    tmp.pos.y += s.intro * 0.1;
    let sway = 0;
    if (!reduced) {
      const t = clock.elapsedTime;
      tmp.ptr.lerp(PTR, 0.05);
      /* gentle handheld breathing + pointer parallax */
      tmp.pos.x += tmp.ptr.x * 0.06 + Math.sin(t * 0.37) * 0.012 + Math.sin(t * 1.1) * 0.003;
      tmp.pos.y += tmp.ptr.y * 0.035 + Math.sin(t * 0.51) * 0.01 + Math.sin(t * 1.3) * 0.002;
      sway = Math.sin(t * 0.43) * 0.18 + Math.sin(t * 0.97) * 0.05;
    }
    camera.position.copy(tmp.pos);
    camera.lookAt(tmp.look);
    camera.rotateZ(THREE.MathUtils.degToRad(s.roll + sway));
    const fov = Math.min(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(s.fov) / 2) * f) * (180 / Math.PI), 78);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    FOCUS.copy(tmp.pos).sub(tmp.look).multiplyScalar(s.fb).add(tmp.look);
    scene.environmentIntensity = s.env;
  });
  return null;
}

const CA_OFFSET = new THREE.Vector2(0.0005, 0.0007);
function Effects() {
  const dof = useRef();
  useFrame(() => { if (dof.current) dof.current.bokehScale = STATE.bk; });
  return (
    <EffectComposer multisampling={0} disableNormalPass>
      <DepthOfField ref={dof} target={FOCUS} focalLength={0.045} bokehScale={1} focusRange={0.025} height={480} />
      <Bloom intensity={0.85} luminanceThreshold={0.82} luminanceSmoothing={0.25} mipmapBlur />
      <ChromaticAberration offset={CA_OFFSET} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.3} darkness={0.6} />
      <SMAA />
    </EffectComposer>
  );
}

function Scene({ low, reduced }) {
  const tx = useMemo(() => makeTextures(low ? 0.5 : 1), [low]);
  useEffect(() => () => { if (tx) Object.values(tx).forEach((t) => t.dispose()); }, [tx]);
  if (!tx) return null;
  return (
    <>
      <color attach="background" args={["#0a111c"]} />
      <fog attach="fog" args={["#0a111c", 30, 130]} />
      <CameraRig reduced={reduced} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#9bbcf0" position={[-7, 3, -1]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={2.2} color={COL.amber} position={[7, 2, 2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={2.6} color="#ffffff" position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1.8} color="#4d7fd0" position={[0, 1.5, -8]} scale={[12, 1.2, 1]} />
        {/* long strip softboxes: these are the streaks you see running along the car paint */}
        <Lightformer form="rect" intensity={4.2} color="#ffffff" position={[0, 5, -3]} rotation-x={Math.PI / 2} scale={[16, 0.7, 1]} />
        <Lightformer form="rect" intensity={3.4} color="#b8d2ff" position={[0, 5, 3]} rotation-x={Math.PI / 2} scale={[16, 0.5, 1]} />
        <Lightformer form="rect" intensity={2.6} color="#ffd9a0" position={[-6, 1, 6]} rotation-y={Math.PI / 2} scale={[10, 0.35, 1]} />
        <Lightformer form="rect" intensity={2.6} color="#6f9be8" position={[6, 1.2, 6]} rotation-y={-Math.PI / 2} scale={[10, 0.35, 1]} />
      </Environment>
      <ambientLight intensity={0.5} color="#aab7ca" />
      <hemisphereLight args={["#2c4468", "#14110e", 0.7 * GAIN]} />
      <ChLight as="hemisphereLight" base={1.6} ch="studio" args={["#3a4f73", "#2a1d14", 1]} />
      <Hall tx={tx} />
      <StudioSet tx={tx} low={low} reduced={reduced} />
      <FilmSet tx={tx} low={low} reduced={reduced} />
      {!low && <Effects />}
    </>
  );
}

/* ====================================================================
   5. PAGE
   ==================================================================== */

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/* loads the web fonts and resolves once they are ready (3 s failsafe) */
function useFonts() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let dead = false;
    const done = () => { if (!dead) setOk(true); };
    const timer = setTimeout(done, 3000);
    let link = document.getElementById("rcs-fonts");
    const load = () =>
      Promise.all([
        document.fonts.load("300 48px 'Inter Tight'"),
        document.fonts.load("400 48px 'Inter Tight'"),
        document.fonts.load("500 20px 'Inter Tight'"),
        document.fonts.load("600 20px 'Inter Tight'"),
        document.fonts.load("500 40px Caveat"),
      ])
        .catch(() => {})
        .then(() => { clearTimeout(timer); done(); });
    if (!link) {
      link = document.createElement("link");
      link.id = "rcs-fonts";
      link.rel = "stylesheet";
      link.href = FONT_LINK;
      link.onload = load;
      link.onerror = done;
      document.head.appendChild(link);
    } else load();
    return () => { dead = true; clearTimeout(timer); };
  }, []);
  return ok;
}

/* viewport width WITHOUT the scrollbar: fixes the horizontal scrollbar / clipped canvas */
function useViewportWidth() {
  const [vw, setVw] = useState(0);
  useEffect(() => {
    const set = () => setVw(document.documentElement.clientWidth || window.innerWidth);
    set();
    window.addEventListener("resize", set);
    window.addEventListener("orientationchange", set);
    return () => {
      window.removeEventListener("resize", set);
      window.removeEventListener("orientationchange", set);
    };
  }, []);
  return vw;
}

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? (
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,#234A78_0%,#191A1C_45%,#0B0B0C_100%)]" />
    ) : (
      this.props.children
    );
  }
}

const CHAPTERS = [
  ["Idea", "Every project starts in a room full of people, paper and warm light."],
  ["Collaboration", "Ideas get sharper when they are argued over, drawn and pinned to a wall."],
  ["Storyboard", "Every frame begins with an idea."],
  ["The camera", "Then the idea leaves the table and meets the camera."],
  ["Through the lens", "A black performance coupe, framed exactly as imagined."],
  ["On set", "From concept to creation: the crew, the lights, the camera."],
  ["Final frame", "We don’t just make content. We create what people remember."],
];

function ContactCTA({ className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-8 gap-y-4 ${className}`}>
      <Link to="/contact" className="rcs-ui group inline-flex min-h-12 items-center gap-3 rounded-full border border-[#D9A441]/70 bg-[#D9A441] px-7 text-[14px] font-semibold text-[#0B0B0C] shadow-[0_10px_40px_-10px_rgba(217,164,65,.7)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#F1EFE9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9A441]">
        Start a project
        <ArrowUpRight size={16} strokeWidth={2.2} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
      <a href={`mailto:${CONTACT_EMAIL}`} className="rcs-ui break-all text-[14px] font-medium text-[#F1EFE9]/75 underline decoration-[#D9A441]/60 underline-offset-[6px] transition-colors hover:text-[#F1EFE9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9A441]">
        {CONTACT_EMAIL}
      </a>
    </div>
  );
}

/* shown when WebGL is unavailable: the same story as a calm, readable stack */
function FallbackStory() {
  return (
    <main className="bg-[#0B0B0C] text-[#F1EFE9]">
      <style>{`@import url('${FONT_LINK}'); .rcs-display{font-family:'Inter Tight','Helvetica Neue',Arial,sans-serif;font-weight:300;letter-spacing:-0.045em} .rcs-mute{color:#8d8d89} .rcs-ui{font-family:'Inter Tight','Helvetica Neue',Arial,sans-serif}`}</style>
      <section className="flex min-h-[100svh] flex-col justify-end bg-[radial-gradient(ellipse_at_60%_30%,#1d3558_0%,#191A1C_45%,#0B0B0C_100%)] px-5 pb-16 sm:px-[5vw]">
        <p className="rcs-ui text-[14px] font-medium text-[#D9A441]">Rare Creative Studios</p>
        <h1 className="rcs-display mt-4 text-[clamp(2.4rem,7vw,5rem)] leading-[1]">Ideas, framed<br /><span className="rcs-mute">in motion.</span></h1>
        <p className="rcs-ui mt-4 max-w-[34ch] text-[15px] text-[#F1EFE9]/75">From the first thought to the final frame.</p>
      </section>
      {CHAPTERS.map(([n, d], i) => (
        <section key={n} className={`border-t border-white/10 px-5 py-16 sm:px-[5vw] sm:py-24 ${i % 2 ? "bg-[#101113]" : "bg-[#0B0B0C]"}`}>
          <p className="rcs-ui text-[13px] font-medium text-[#D9A441]">{String(i + 1).padStart(2, "0")} / {n}</p>
          <p className="rcs-display mt-4 max-w-[24ch] text-[clamp(1.7rem,5vw,3.2rem)] leading-[1.1]">{d}</p>
        </section>
      ))}
      <section className="bg-[radial-gradient(ellipse_at_50%_100%,#234A78_0%,#0B0B0C_70%)] px-5 pb-24 pt-8 sm:px-[5vw]">
        <ContactCTA />
      </section>
    </main>
  );
}

function Loader({ fade = false }) {
  return (
    <div className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#0B0B0C] transition-opacity duration-1000 ${fade ? "pointer-events-none opacity-0" : "opacity-100"}`}>
      <p className="animate-pulse text-[clamp(1.8rem,4.4vw,2.9rem)] text-[#F1EFE9]" style={{ fontFamily: "'Inter Tight',Arial,sans-serif", fontWeight: 300, letterSpacing: "-0.045em" }}>RCS</p>
      <span className="mt-5 block h-px w-24 overflow-hidden bg-white/10"><span className="block h-full w-1/2 animate-[rcs-load_1.2s_ease-in-out_infinite] bg-[#D9A441]" /></span>
    </div>
  );
}

export default function Home() {
  const rootRef = useRef(null);
  const railRef = useRef(null);
  const stageNoRef = useRef(null);
  const stageNameRef = useRef(null);
  const [cfg, setCfg] = useState(null);
  const [inView, setInView] = useState(true);
  const [ready, setReady] = useState(false); // first 3D frame painted
  const [ctxKey, setCtxKey] = useState(0); // bump to remount the canvas after a GPU context loss
  const fontsOk = useFonts();
  const vw = useViewportWidth();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 820;
    const mem = navigator.deviceMemory || 8;
    const cores = navigator.hardwareConcurrency || 8;
    setCfg({ mode: hasWebGL() ? "webgl" : "fallback", low: mobile || mem <= 4 || cores <= 4, reduced, vh: mobile ? 850 : 1100 });
  }, []);

  /* no sideways scrolling while this page is mounted */
  useEffect(() => {
    const h = document.documentElement, b = document.body;
    const prev = [h.style.overflowX, b.style.overflowX];
    h.style.overflowX = "clip";
    b.style.overflowX = "clip";
    return () => { h.style.overflowX = prev[0]; b.style.overflowX = prev[1]; };
  }, []);

  /* inertial smooth scrolling, wired into ScrollTrigger and the GSAP ticker */
  useEffect(() => {
    if (!cfg || cfg.mode !== "webgl" || cfg.reduced) return;
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [cfg]);

  useEffect(() => {
    const on = (e) => PTR.set((e.clientX / window.innerWidth - 0.5) * 2, -(e.clientY / window.innerHeight - 0.5) * 2);
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);

  useEffect(() => {
    if (!rootRef.current || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "1000px 0px" });
    io.observe(rootRef.current);
    return () => io.disconnect();
  }, [cfg, fontsOk]);

  /* loader failsafe: never leave the visitor on a black screen */
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 6000);
    return () => clearTimeout(t);
  }, []);

  /* keep ScrollTrigger in sync with size changes */
  useEffect(() => {
    if (!vw) return;
    const t = setTimeout(() => ScrollTrigger.refresh(), 150);
    return () => clearTimeout(t);
  }, [vw]);

  /* ---- the master timeline: scroll position is the only clock ---- */
  useEffect(() => {
    if (!cfg || cfg.mode !== "webgl" || !fontsOk || !rootRef.current) return;
    const root = rootRef.current;
    Object.assign(STATE, pick(POSE.wide), { intro: cfg.reduced ? 0 : 1 });
    const ctx = gsap.context(() => {
      let lastStage = -1;
      const hud = (p) => {
        const t = p * T_TOTAL;
        let idx = 0;
        STAGES.forEach((s, i) => { if (t >= s.t) idx = i; });
        if (railRef.current) railRef.current.style.transform = `scaleY(${p})`;
        if (idx !== lastStage) {
          lastStage = idx;
          if (stageNoRef.current) stageNoRef.current.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(STAGES.length).padStart(2, "0")}`;
          if (stageNameRef.current) stageNameRef.current.textContent = STAGES[idx].n;
        }
      };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: cfg.reduced ? true : 1.1, onUpdate: (self) => hud(self.progress) },
      });
      hud(0);
      sampleTrack(0);

      /* the whole camera journey is ONE tween over the spline in PATH:
         continuous velocity, no stop-start between legs. */
      const proxy = { t: 0 };
      tl.to(proxy, { t: T_TOTAL, duration: T_TOTAL, ease: "none", onUpdate: () => sampleTrack(proxy.t) }, 0);

      const cap = (sel, inAt, outAt, dur = 2.8) => {
        const el = root.querySelector(`[data-cap="${sel}"]`);
        if (!el) return;
        gsap.set(el, { autoAlpha: 0, y: 34, filter: "blur(12px)" });
        tl.fromTo(el, { autoAlpha: 0, y: 34, filter: "blur(12px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: dur, ease: "power3.out", immediateRender: false }, inAt);
        if (outAt != null) tl.to(el, { autoAlpha: 0, y: -22, filter: "blur(10px)", duration: dur, ease: "power2.in", immediateRender: false }, outAt);
      };
      const open = root.querySelector('[data-cap="open"]');
      const cue = root.querySelector('[data-cap="cue"]');
      if (open) tl.to(open, { autoAlpha: 0, y: -28, filter: "blur(8px)", duration: 3.2, ease: "power2.in", immediateRender: false }, 3);
      if (cue) tl.to(cue, { autoAlpha: 0, duration: 1.5, immediateRender: false }, 1);
      cap("collab", 8, 16);
      cap("notes", 28, 42);
      cap("camera", 55, 64);
      cap("lens", 70, 79);
      cap("film", 91, 99);
      cap("rec", 68, 104, 1.6);
      cap("vf", 70, 82, 2);

      /* iris: the frame closes in around us as we dive into the lens,
         then opens again as we scroll back out */
      const iris = root.querySelector("[data-iris]");
      if (iris) {
        gsap.set(iris, { autoAlpha: 0, scale: 1.6 });
        tl.to(iris, { autoAlpha: 1, scale: 1, duration: 6, ease: "power2.in", immediateRender: false }, 68);
        tl.to(iris, { autoAlpha: 0, scale: 1.5, duration: 6, ease: "power2.out", immediateRender: false }, 80);
      }

      // cinematic letterbox slides in as we leave the studio and out for the final frame
      const bars = root.querySelectorAll("[data-bar]");
      if (bars.length) {
        gsap.set(bars, { scaleY: 0 });
        tl.to(bars, { scaleY: 1, duration: 6, ease: "power2.inOut", immediateRender: false }, 60);
        tl.to(bars, { scaleY: 0, duration: 4, ease: "power2.inOut", immediateRender: false }, 104);
      }
      cap("final", 107, null, 5);

      if (!cfg.reduced) gsap.to(STATE, { intro: 0, duration: 3.8, ease: "power3.out", delay: 0.4 });
    }, root);
    const refresh = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => { clearTimeout(refresh); ctx.revert(); };
  }, [cfg, fontsOk]);

  if (!cfg) return <div className="min-h-[100svh] bg-[#0B0B0C]" />;
  if (cfg.mode === "fallback") return <FallbackStory />;
  if (!fontsOk) return <Loader />; // canvas textures need the fonts first

  const onCreated = ({ gl }) => {
    const el = gl.domElement;
    el.addEventListener("webglcontextlost", (e) => { e.preventDefault(); setReady(false); setCtxKey((k) => k + 1); });
    requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
  };

  const width = vw ? `${vw}px` : "100%";
  const margin = vw ? `calc(50% - ${vw / 2}px)` : 0;

  return (
    <>
      <Loader fade={ready} />
      <main
        ref={rootRef}
        className="rcs-cine relative isolate block min-w-0 bg-[#0B0B0C] text-[#F1EFE9]"
        style={{ height: `${cfg.vh}vh`, width, maxWidth: "none", marginLeft: margin, overflowX: "clip" }}
      >
        <style>{`
          .rcs-cine { font-family: 'Inter Tight', 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
          .rcs-cine ::selection { background: #D9A441; color: #0B0B0C; }
          .rcs-ui { font-family: 'Inter Tight', 'Helvetica Neue', Arial, sans-serif; }
          .rcs-display { font-family: 'Inter Tight', 'Helvetica Neue', Arial, sans-serif; font-weight: 300; letter-spacing: -0.045em; }
          /* caption face: same light grotesque, kept as a separate class so captions can be tuned alone */
          .rcs-serif { font-family: 'Inter Tight', 'Helvetica Neue', Arial, sans-serif; font-style: normal; font-weight: 300; letter-spacing: -0.04em; }
          .rcs-mute { background: linear-gradient(180deg, #a6a6a1 0%, #6f6f6b 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; text-shadow: none; filter: drop-shadow(0 2px 22px rgba(0,0,0,.75)); }
          .rcs-hand { font-family: 'Caveat', cursive; font-weight: 600; }
          .rcs-shadow { text-shadow: 0 2px 28px rgba(0,0,0,.9), 0 0 3px rgba(0,0,0,.55); }
          .rcs-mask { display: block; overflow: hidden; padding: .04em 0 .14em; margin-bottom: -.1em; }
          .rcs-line { display: block; animation: rcs-line 1.8s cubic-bezier(.19,.72,.2,1) var(--d, 0s) backwards; }
          @keyframes rcs-line { from { transform: translateY(112%); } to { transform: none; } }
          @keyframes rcs-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
          .rcs-a { animation: rcs-rise 1.8s cubic-bezier(.2,.65,.25,1) var(--d, 0s) backwards; }
          @keyframes rcs-cue { 0% { transform: scaleY(0); transform-origin: top; } 50% { transform: scaleY(1); transform-origin: top; } 51% { transform-origin: bottom; } 100% { transform: scaleY(0); transform-origin: bottom; } }
          .rcs-cue-line { animation: rcs-cue 2.2s ease-in-out infinite; }
          @keyframes rcs-load { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
          .rcs-grain { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); mix-blend-mode: overlay; opacity: .09; }
          .rcs-corner { position: absolute; width: clamp(22px, 3vw, 40px); height: clamp(22px, 3vw, 40px); border-color: rgba(241,239,233,.85); }
          @media (prefers-reduced-motion: reduce) { .rcs-a, .rcs-line, .rcs-cue-line { animation: none; } }
        `}</style>

        <div className="sticky top-0 isolate h-[100svh] min-h-[520px] w-full min-w-0 overflow-hidden bg-[#0a111c]">
          {/* ---------- the 3D world ---------- */}
          <div className="absolute inset-0" style={{ pointerEvents: "none", touchAction: "pan-y" }}>
            <SceneBoundary>
              <Canvas
                key={ctxKey}
                style={{ width: "100%", height: "100%", display: "block" }}
                shadows={!cfg.low}
                flat={!cfg.low}
                dpr={cfg.low ? [1, 1.4] : [1, 2]}
                frameloop={inView ? "always" : "never"}
                gl={{ antialias: !cfg.low, powerPreference: "high-performance" }}
                camera={{ fov: 36, near: 0.05, far: 320, position: [0, 1.7, 6.4] }}
                onCreated={onCreated}
              >
                <Scene low={cfg.low} reduced={cfg.reduced} />
              </Canvas>
            </SceneBoundary>
          </div>

          {/* legibility scrim, grain, vignette */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div aria-hidden="true" className="rcs-grain pointer-events-none absolute inset-0" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_58%,rgba(0,0,0,.5)_100%)]" />

          {/* iris vignette: closes in around the viewfinder shot */}
          <div data-iris aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: 0, background: "radial-gradient(ellipse at 50% 50%, transparent 46%, rgba(0,0,0,.82) 100%)" }} />

          {/* cinematic letterbox */}
          <div data-bar="top" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 hidden h-[5.5svh] bg-black sm:block" style={{ transform: "scaleY(0)", transformOrigin: "top" }} />
          <div data-bar="bot" aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[5.5svh] bg-black sm:block" style={{ transform: "scaleY(0)", transformOrigin: "bottom" }} />

          {/* viewfinder frame: only visible while we are inside the camera */}
          <div data-cap="vf" aria-hidden="true" className="pointer-events-none absolute inset-[7svh] sm:inset-x-[6vw]">
            <span className="rcs-corner left-0 top-0 border-l-2 border-t-2" />
            <span className="rcs-corner right-0 top-0 border-r-2 border-t-2" />
            <span className="rcs-corner bottom-0 left-0 border-b-2 border-l-2" />
            <span className="rcs-corner bottom-0 right-0 border-b-2 border-r-2" />
            <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2">
              <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#F1EFE9]/70" />
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[#F1EFE9]/70" />
            </span>
            <p className="rcs-ui absolute bottom-3 left-4 text-[12px] font-medium tracking-wide text-[#F1EFE9]/80 sm:bottom-5 sm:left-6">A-cam  85mm  f/2.0  ISO 800</p>
            <p className="rcs-ui absolute bottom-3 right-4 text-[12px] font-medium tracking-wide text-[#F1EFE9]/80 sm:bottom-5 sm:right-6">00:00:24:12</p>
          </div>

          {/* ---------- typography: driven by the same timeline ---------- */}
          <div data-cap="open" className="pointer-events-none absolute left-5 top-[11svh] max-w-[90vw] sm:left-[5vw] sm:top-[13svh] sm:max-w-[64vw]">
            <p className="rcs-ui rcs-a rcs-shadow text-[14px] font-medium text-[#D9A441] sm:text-[16px]" style={{ "--d": "0.5s" }}>Rare Creative Studios</p>
            <h1 className="rcs-display rcs-shadow mt-4 text-[clamp(2.6rem,6.6vw,6.2rem)] leading-[0.98] text-[#F1EFE9]">
              <span className="rcs-mask"><span className="rcs-line" style={{ "--d": "0.7s" }}>Ideas, framed</span></span>
              <span className="rcs-mask"><span className="rcs-line rcs-mute" style={{ "--d": "0.9s" }}>in motion.</span></span>
            </h1>
            <p className="rcs-ui rcs-a rcs-shadow mt-6 max-w-[34ch] text-[15px] font-normal leading-relaxed text-[#F1EFE9]/80 sm:text-[17px]" style={{ "--d": "1.6s" }}>
              From the first thought to the final frame.
            </p>
          </div>

          <div data-cap="cue" className="pointer-events-none absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
            <span className="rcs-ui rcs-shadow text-[13px] font-medium text-[#F1EFE9]/75">Scroll to explore</span>
            <span className="rcs-cue-line block h-10 w-px bg-[#D9A441]" />
          </div>

          <p data-cap="collab" className="rcs-serif rcs-shadow pointer-events-none absolute bottom-[10svh] left-5 max-w-[12ch] text-[clamp(2.2rem,4.8vw,4.4rem)] leading-[0.98] text-[#F1EFE9] sm:left-[5vw]">
            Four minds. One table.
          </p>

          <p data-cap="notes" className="rcs-serif rcs-shadow pointer-events-none absolute bottom-[10svh] left-5 max-w-[13ch] text-[clamp(2.2rem,4.8vw,4.4rem)] leading-[0.98] text-[#F1EFE9] sm:left-[5vw]">
            Every frame begins with an idea.
          </p>

          <p data-cap="camera" className="rcs-serif rcs-shadow pointer-events-none absolute bottom-[10svh] left-5 max-w-[13ch] text-[clamp(2.2rem,4.8vw,4.4rem)] leading-[0.98] text-[#F1EFE9] sm:left-[5vw]">
            Then it meets the camera.
          </p>

          <p data-cap="lens" className="rcs-serif rcs-shadow pointer-events-none absolute bottom-[14svh] left-1/2 max-w-[90vw] -translate-x-1/2 text-center text-[clamp(1.9rem,4vw,3.6rem)] leading-[1] text-[#F1EFE9]">
            Exactly as imagined.
          </p>

          <div data-cap="film" className="pointer-events-none absolute bottom-[10svh] left-5 sm:left-[5vw]">
            <p className="rcs-display rcs-shadow max-w-[12ch] text-[clamp(2rem,4.3vw,3.9rem)] leading-[0.98]">From concept to creation.</p>
            <p className="rcs-ui rcs-shadow mt-4 text-[14px] font-medium text-[#D9A441] sm:text-[16px]">Behind the scenes</p>
          </div>

          <div data-cap="rec" className="pointer-events-none absolute left-5 top-[9svh] flex items-center gap-2.5 sm:left-[5vw] sm:top-[8.5svh]">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#ff3b2a] shadow-[0_0_14px_#ff3b2a]" />
            <span className="rcs-ui text-[12px] font-semibold tracking-[0.12em] text-[#F1EFE9]/90">REC  24 FPS  2.39:1</span>
          </div>

          <div data-cap="final" className="pointer-events-none absolute inset-x-0 bottom-0">
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0B0B0C]/92 via-[#0B0B0C]/55 to-transparent" />
            <div className="max-w-[60rem] px-5 pb-[max(2.2rem,env(safe-area-inset-bottom))] pt-32 sm:px-[5vw] lg:pb-[8svh]">
              <h2 className="rcs-display text-[clamp(2rem,4.8vw,4.5rem)] leading-[0.98]">
                We don’t just make content.
              </h2>
              <p className="rcs-display mt-2 text-[clamp(2rem,4.8vw,4.5rem)] leading-[0.98] text-[#EBC36F]">We create what people remember.</p>
              <p className="rcs-ui mt-6 max-w-[44ch] text-[15px] font-normal leading-relaxed text-[#F1EFE9]/78 sm:text-[16px]">Rare Creative Studios turns ideas into films, campaigns and experiences.</p>
              <ContactCTA className="pointer-events-auto mt-8" />
            </div>
          </div>

          {/* scroll progress + stage name */}
          <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-full w-[2px] bg-white/10 sm:right-6 sm:top-1/2 sm:h-40 sm:-translate-y-1/2">
            <span ref={railRef} className="block h-full w-full origin-top bg-[#D9A441]" style={{ transform: "scaleY(0)" }} />
          </div>
          <div aria-hidden="true" className="rcs-shadow pointer-events-none absolute bottom-[8svh] right-12 hidden text-right sm:block">
            <p ref={stageNameRef} className="rcs-serif text-[clamp(1.4rem,1.9vw,1.95rem)] leading-none text-[#F1EFE9]">Idea</p>
            <p ref={stageNoRef} className="rcs-ui mt-2 text-[12px] font-medium tracking-wide text-[#F1EFE9]/55">01 / 07</p>
          </div>

          <p className="sr-only">
            An interactive film. Four people in a creative studio gather close around a table and talk: two sit facing each other, two stand beside them. The camera glides in to the storyboards and notes, cranes up out of the studio, dives into a cinema camera to see a black luxury car through the viewfinder, scrolls out to a third person view of the operator filming, and ends on a hero shot of the car. Scroll to move the camera.
          </p>
        </div>
      </main>
    </>
  );
}