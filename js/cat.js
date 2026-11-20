// Shared parts for CatLandingClear: a procedural cat (or astronaut, diver, robot, or plain cylinders)
// built over the two-half body of fall.js, so what you see is exactly what the physics computes.
// Every shape here is drawn from primitives; no photographs or third-party models are used.
import { THREE, M, sphere, canvasTexture } from './kit.js';
import { BODY, halfFrames, shapePoints, legDir, legRoot, qaxis, sample, clamp, lerp, smooth } from './fall.js';

export { clamp, lerp, smooth };
export const COL = { fur: 0xe39448, stripe: 0x9a4f1c, cream: 0xf4dfc0, pink: 0xf2a0a8, eye: 0x9be35a, front: 0xff7a59, back: 0x8ef0ff, amber: 0xffb547, lime: 0xa3e635, violet: 0xc49bff, white: 0xf3f6fb };
export const DEG = 180 / Math.PI;
export const SCALE = 4; // scene units per metre in the falling chapters (the cat model is about 0.46 m long)
export const G = 9.81;

let furTex = null;
function tabby() {
  if (furTex) return furTex;
  furTex = canvasTexture(256, 128, (g, w, h) => {
    g.fillStyle = '#e39448'; g.fillRect(0, 0, w, h);
    // the texture wraps around the spine: v runs along the body, u around it (u = 0.5 is the back, 0 and 1 the belly).
    for (let i = 0; i < 9; i++) {
      const y = (i + 0.5) * (h / 9);
      g.fillStyle = 'rgba(140,66,20,0.85)';
      g.beginPath(); g.ellipse(w * 0.5, y, w * 0.19, h / 40 + (i % 2) * 2, 0, 0, Math.PI * 2); g.fill();
    }
    for (const [x0, x1] of [[0, w * 0.22], [w, w * 0.78]]) {
      const grd = g.createLinearGradient(x0, 0, x1, 0);
      grd.addColorStop(0, 'rgba(244,223,192,0.95)'); grd.addColorStop(0.5, 'rgba(244,223,192,0.8)'); grd.addColorStop(1, 'rgba(244,223,192,0)');
      g.fillStyle = grd; g.fillRect(Math.min(x0, x1), 0, Math.abs(x1 - x0), h);
    }
  }).tex;
  return furTex;
}

// An ellipsoid stretched along x (the spine). Its texture's u runs round the spine with u = 0.25 on the back.
function bodyBlob(rx, ry, rz, mat) {
  const g = new THREE.SphereGeometry(1, 40, 24);
  g.rotateZ(-Math.PI / 2); // poles to ±x
  g.rotateX(Math.PI);
  const m = new THREE.Mesh(g, mat); m.scale.set(rx, ry, rz); m.castShadow = true; m.receiveShadow = true;
  return m;
}
const cone = (r, h, mat) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 16), mat); m.castShadow = true; return m; };
// A limb along +x from 0 to L.
function limb(L, r0, r1, mat, end = null) {
  const g = new THREE.Group();
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, L, 12), mat); c.rotation.z = -Math.PI / 2; c.position.x = L / 2; c.castShadow = true;
  g.add(c);
  if (end) { end.position.x = L; g.add(end); }
  return g;
}

// ---------------------------------------------------------------- skins
function skinCat(F, B, legs, mats) {
  const fur = mats.fur, cream = mats.cream;
  const chest = bodyBlob(0.56, BODY.rf, BODY.rf * 0.95, fur); chest.position.x = 0.42; F.add(chest);
  const neck = bodyBlob(0.2, 0.15, 0.14, fur); neck.position.set(0.86, 0.04, 0); F.add(neck);
  const head = new THREE.Group(); head.position.set(1.06, 0.1, 0); F.add(head);
  const skull = sphere(0.2, fur, 28); skull.scale.set(1, 0.9, 1.05); head.add(skull);
  const muzzle = sphere(0.1, cream, 18); muzzle.scale.set(0.9, 0.7, 1.1); muzzle.position.set(0.15, -0.06, 0); head.add(muzzle);
  const nose = sphere(0.028, mats.pink, 10); nose.position.set(0.23, -0.02, 0); head.add(nose);
  for (const z of [-1, 1]) {
    const ear = cone(0.08, 0.16, fur); ear.position.set(-0.02, 0.2, z * 0.11); ear.rotation.x = z * -0.35; head.add(ear);
    const inner = cone(0.045, 0.1, mats.pink); inner.position.set(0.02, 0.19, z * 0.11); inner.rotation.x = z * -0.35; head.add(inner);
    const eye = sphere(0.042, mats.eye, 14); eye.position.set(0.15, 0.05, z * 0.09); head.add(eye);
    const pupil = sphere(0.018, mats.dark, 8); pupil.scale.set(0.5, 1.6, 1); pupil.position.set(0.19, 0.05, z * 0.095); head.add(pupil);
  }
  F.userData.head = head;
  const hips = bodyBlob(0.55, BODY.rb, BODY.rb * 0.98, fur); hips.position.x = -0.42; B.add(hips);
  // the tail is drawn but left out of the physics: tailless cats right themselves too
  const tailPts = [[-0.86, 0.06, 0], [-1.2, 0.12, 0], [-1.5, 0.3, 0], [-1.68, 0.58, 0]].map((p) => new THREE.Vector3(...p));
  const tail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tailPts), 30, 0.055, 10), fur); tail.castShadow = true; B.add(tail);
  const tip = sphere(0.055, mats.stripe, 10); tip.position.copy(tailPts[3]); B.add(tip);
  const waist = bodyBlob(0.26, 0.21, 0.2, fur);
  legs.forEach((l) => l.add(limb(BODY.leg, l.userData.which === 'back' ? 0.075 : 0.06, 0.045, fur, (() => { const p = sphere(0.065, cream, 12); p.scale.set(1.2, 0.8, 1); return p; })())));
  return waist;
}
function skinCyl(F, B, legs, mats) {
  const mk = (x0, x1, r, mat) => { const g = new THREE.CylinderGeometry(r, r, Math.abs(x1 - x0), 32, 1); g.rotateZ(-Math.PI / 2); const m = new THREE.Mesh(g, mat); m.position.x = (x0 + x1) / 2; m.castShadow = true; return m; };
  F.add(mk(0.02, BODY.half, BODY.rf * 0.95, mats.front)); B.add(mk(-0.02, -BODY.half, BODY.rb * 0.95, mats.back));
  // a stripe along the top of each cylinder makes its turning visible
  for (const [G, r, s] of [[F, BODY.rf, 1], [B, BODY.rb, -1]]) {
    const st = new THREE.Mesh(new THREE.BoxGeometry(BODY.half * 0.92, 0.035, 0.07), mats.dark); st.position.set(s * BODY.half / 2, r * 0.97, 0); G.add(st);
  }
  const head = sphere(0.14, mats.front, 18); head.position.set(1.02, 0.06, 0); F.add(head);
  legs.forEach((l) => l.add(limb(BODY.leg, 0.04, 0.03, l.userData.which === 'front' ? mats.front : mats.back, sphere(0.05, mats.dark, 10))));
  return sphere(0.17, mats.dark, 18);
}
function skinHuman(F, B, legs, mats, kind) {
  const suit = kind === 'astro' ? mats.suit : mats.skin, trunk = kind === 'astro' ? mats.suit : mats.swim;
  const torso = bodyBlob(0.5, 0.2, 0.27, trunk); torso.position.x = 0.45; F.add(torso);
  const head = sphere(kind === 'astro' ? 0.2 : 0.14, kind === 'astro' ? mats.suit : mats.skin, 24); head.position.set(1.08, 0, 0); F.add(head);
  if (kind === 'astro') { const visor = sphere(0.15, mats.visor, 20); visor.scale.set(0.6, 0.8, 0.9); visor.position.set(1.12, -0.07, 0); visor.rotation.z = -0.3; F.add(visor); const pack = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.42), mats.suitDark); pack.position.set(0.45, 0.25, 0); F.add(pack); }
  const pelvis = bodyBlob(0.35, 0.19, 0.24, trunk); pelvis.position.x = -0.25; B.add(pelvis);
  // lower legs drawn along the spine for a human, splayed only a little
  for (const z of [-1, 1]) { const thigh = limb(0.75, 0.1, 0.075, suit, sphere(0.08, kind === 'astro' ? mats.suitDark : mats.skin, 10)); thigh.rotation.y = Math.PI - z * 0.08; thigh.position.set(-0.45, 0, z * 0.11); B.add(thigh); }
  legs.forEach((l) => l.add(limb(BODY.leg * (l.userData.which === 'front' ? 1.05 : 0.85), 0.07, 0.05, suit, sphere(0.065, kind === 'astro' ? mats.suitDark : mats.skin, 10))));
  return sphere(0.16, trunk, 16);
}
function skinRobot(F, B, legs, mats) {
  const bx = (w, h, d, mat, x, y = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, 0); m.castShadow = true; return m; };
  F.add(bx(0.8, 0.3, 0.42, mats.metal, 0.46), bx(0.22, 0.2, 0.3, mats.dark, 1.0, 0.04));
  const eye = sphere(0.04, mats.glowCyan, 10); eye.position.set(1.12, 0.07, 0); F.add(eye);
  B.add(bx(0.8, 0.32, 0.44, mats.metal, -0.46));
  const stripe = bx(0.7, 0.04, 0.46, mats.glowAmber, 0.45, 0.14); F.add(stripe); const s2 = stripe.clone(); s2.position.x = -0.45; B.add(s2);
  legs.forEach((l) => l.add(limb(BODY.leg, 0.05, 0.04, mats.metalDark, sphere(0.06, mats.dark, 10))));
  return new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.36, 20), mats.metalDark);
}

// ---------------------------------------------------------------- the creature
// makeCat(style): a group whose origin is the centre of mass. setShape(sh) poses it; the caller sets its quaternion.
export function makeCat(style = 'cat', { opacity = 1 } = {}) {
  const tr = opacity < 1 ? { transparent: true, opacity, depthWrite: false } : {};
  const mats = {
    fur: M.matte(0xffffff, { map: tabby(), roughness: 0.9, ...tr }), cream: M.matte(COL.cream, tr), pink: M.matte(COL.pink, tr), stripe: M.matte(COL.stripe, tr),
    eye: M.plastic(COL.eye, { emissive: 0x2a4a10, ...tr }), dark: M.matte(0x1c1f26, tr),
    front: M.plastic(COL.front, tr), back: M.plastic(COL.back, tr),
    suit: M.matte(0xeef1f6, tr), suitDark: M.matte(0x8a93a6, tr), visor: M.metal(0xd9a441, { roughness: 0.15, ...tr }),
    skin: M.matte(0xc68a62, tr), swim: M.plastic(0x2a5bd7, tr),
    metal: M.metal(0xb9c0cc, tr), metalDark: M.metal(0x6a7280, tr), glowCyan: M.glow(COL.back, tr), glowAmber: M.glow(COL.amber, tr),
  };
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const F = new THREE.Group(), B = new THREE.Group(); F.matrixAutoUpdate = false; B.matrixAutoUpdate = false; body.add(F, B);
  const legs = [];
  for (const which of ['front', 'back']) for (const side of [-1, 1]) {
    const l = new THREE.Group(); l.userData = { which, side }; l.position.set(...legRoot(which, side)); (which === 'front' ? F : B).add(l); legs.push(l);
  }
  const skin = { cat: skinCat, cyl: skinCyl, astro: (...a) => skinHuman(...a, 'astro'), diver: (...a) => skinHuman(...a, 'diver'), robot: skinRobot }[style] || skinCat;
  const waist = skin(F, B, legs, mats); waist.castShadow = true; body.add(waist);
  const m4 = new THREE.Matrix4(), X = new THREE.Vector3(1, 0, 0), dv = new THREE.Vector3();
  root.shape = {};
  root.setShape = (sh) => {
    root.shape = sh;
    const fr = halfFrames(sh), pts = shapePoints(sh), c = pts.com;
    body.position.set(-c[0], -c[1], -c[2]);
    const set = (G, R) => { m4.set(R[0], R[1], R[2], 0, R[3], R[4], R[5], 0, R[6], R[7], R[8], 0, 0, 0, 0, 1); G.matrix.copy(m4); G.matrixWorldNeedsUpdate = true; };
    set(F, fr.front); set(B, fr.back);
    legs.forEach((l) => { const d = legDir(l.userData.which, l.userData.which === 'front' ? sh.ef ?? 1 : sh.eb ?? 1, l.userData.side); l.quaternion.setFromUnitVectors(X, dv.set(...d)); });
    return pts;
  };
  root.frames = () => halfFrames(root.shape);
  root.front = F; root.back = B; root.mats = mats;
  root.setShape({ beta: 0, phi: 0, psi: 0, ef: 1, eb: 1 });
  return root;
}

// Pose a creature from a simulated run at u (0..1). Returns the sample.
export function poseFrom(cat, run, u) {
  const smp = sample(run, u);
  cat.setShape(smp.sh);
  cat.quaternion.set(smp.q[1], smp.q[2], smp.q[3], smp.q[0]);
  return smp;
}

// A curved arrow round the spine that shows which way, and how hard, a half is spinning.
export function spinArrow(color, radius = 0.42) {
  const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
  const mat = M.glow(color, { transparent: true, opacity: 0.9 });
  const arc = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.025, 8, 48, Math.PI * 1.2), mat);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 14), mat);
  const a = Math.PI * 1.2; head.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0); head.rotation.z = a;
  inner.add(arc, head); inner.rotation.y = Math.PI / 2; // ring in the plane across the spine
  g.set = (v, max = 1) => { const k = clamp(Math.abs(v) / max, 0, 1); g.visible = k > 0.03; inner.scale.set(1, v >= 0 ? 1 : -1, 1); mat.opacity = 0.25 + 0.75 * k; };
  return g;
}

export const upAxis = new THREE.Vector3(0, 1, 0);
export const quat = (q) => new THREE.Quaternion(q[1], q[2], q[3], q[0]);
export { qaxis };
