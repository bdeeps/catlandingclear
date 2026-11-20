// The physics of a falling cat, with no libraries, so it can be checked on its own.
//
// The cat is a cloud of point masses in two rigid halves (front and back) joined at the waist, plus four legs.
// Its "shape" is a handful of joint angles the cat controls with its muscles:
//   beta  the bend at the waist (radians), phi  which way the bend points around the spine,
//   psi   the twist of the front half against the back half about the spine,
//   ef/eb how far the front/back legs are stretched out (0 tucked, 1 straight out).
// Nothing outside touches the cat in the air (gravity pulls on its centre of mass and makes no torque about it),
// so its total angular momentum about the centre of mass stays exactly what it was at release: zero.
// For every small change of shape we solve J·Ω = −Σ m p × v for the body's rotation rate Ω (J is the inertia
// tensor of the current shape, v the shape velocities), which keeps the total at zero, and integrate Ω.
// This is the reasoning of Kane & Scher (1969) and of the later "tuck and turn" models, done numerically.

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const smooth = (k) => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };

// ---------------------------------------------------------------- tiny 3-vector / 3x3 / quaternion kit
const rx = (t) => { const c = Math.cos(t), s = Math.sin(t); return [1, 0, 0, 0, c, -s, 0, s, c]; };
const rz = (t) => { const c = Math.cos(t), s = Math.sin(t); return [c, -s, 0, s, c, 0, 0, 0, 1]; };
export const mul = (A, B) => { const C = new Array(9); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]; return C; };
export const mv = (A, v) => [A[0] * v[0] + A[1] * v[1] + A[2] * v[2], A[3] * v[0] + A[4] * v[1] + A[5] * v[2], A[6] * v[0] + A[7] * v[1] + A[8] * v[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (v) => { const l = Math.hypot(...v) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
function solve3(A, b) {
  const [a, bb, c, d, e, f, g, h, i] = A;
  const det = a * (e * i - f * h) - bb * (d * i - f * g) + c * (d * h - e * g);
  const inv = [e * i - f * h, c * h - bb * i, bb * f - c * e, f * g - d * i, a * i - c * g, c * d - a * f, d * h - e * g, bb * g - a * h, a * e - bb * d];
  return mv(inv, b).map((x) => x / det);
}
export const qmul = (a, b) => [a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3], a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2], a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1], a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0]];
export const qaxis = (ax, t) => { const s = Math.sin(t / 2), n = norm(ax); return [Math.cos(t / 2), n[0] * s, n[1] * s, n[2] * s]; };
export const qrot = (q, v) => { const p = qmul(qmul(q, [0, ...v]), [q[0], -q[1], -q[2], -q[3]]); return [p[1], p[2], p[3]]; };
const qnorm = (q) => { const l = Math.hypot(...q); return q.map((x) => x / l); };
export const qslerp = (a, b, k) => {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  if (d < 0) { b = b.map((x) => -x); d = -d; }
  if (d > 0.9995) return qnorm(a.map((x, i) => x + (b[i] - x) * k));
  const th = Math.acos(d), s = Math.sin(th);
  return a.map((x, i) => (x * Math.sin((1 - k) * th) + b[i] * Math.sin(k * th)) / s);
};

// ---------------------------------------------------------------- the body plan (units: cat lengths ≈ 2)
export const BODY = { half: 0.9, rf: 0.22, rb: 0.25, leg: 0.6, legMass: 0.09, halfMass: 1 };
const LEG = {
  front: { root: [0.62, -0.16], ext: [0, -1, 0.85], tuck: [0.95, -0.3, 0.12] },   // paws folded forward under the chin
  back: { root: [-0.6, -0.17], ext: [0, -1, 0.85], tuck: [0.95, -0.32, 0.14] },   // hind legs drawn forward under the belly
};
// Leg direction (in the half's own frame) for extension e, side ±1.
export function legDir(which, e, side) {
  const L = LEG[which], a = norm(L.tuck), b = norm(L.ext);
  const d = norm([lerp(a[0], b[0], e), lerp(a[1], b[1], e), lerp(a[2], b[2], e)]);
  return [d[0], d[1], d[2] * side];
}
export function legRoot(which, side) { const L = LEG[which]; return [L.root[0], L.root[1], 0.11 * side]; }

// The masses of each half in its own frame (waist at the origin, spine along ±x, back up +y).
function halfPoints(which, e) {
  const pts = [];
  const sign = which === 'front' ? 1 : -1, r = which === 'front' ? BODY.rf : BODY.rb;
  const rings = 6, around = 8, m = BODY.halfMass / (rings * around + 1);
  for (let i = 0; i < rings; i++) {
    const x = sign * BODY.half * (i + 0.5) / rings;
    for (let j = 0; j < around; j++) { const t = (j / around) * Math.PI * 2; pts.push([[x, Math.cos(t) * r * 0.72, Math.sin(t) * r * 0.72], m]); }
  }
  if (which === 'front') pts.push([[1.05, 0.08, 0], 0.18]); // head
  for (const side of [-1, 1]) {
    const o = legRoot(which, side), d = legDir(which, e, side);
    for (let k = 1; k <= 3; k++) { const s = (BODY.leg * k) / 3; pts.push([[o[0] + d[0] * s, o[1] + d[1] * s, o[2] + d[2] * s], BODY.legMass / 3]); }
  }
  return pts;
}

// Orientation of each half inside the body frame for a shape.
// The bend tilts the halves towards direction (0, −cos φ, −sin φ) without twisting them (the Kane–Scher
// "no twist at the waist" bend), and psi twists the front by +psi/2 and the back by −psi/2 about the spine.
export function halfFrames(sh) {
  const a = (sh.beta || 0) / 2, phi = sh.phi || 0, psi = sh.psi || 0;
  const front = mul(mul(mul(rx(phi), rz(-a)), rx(-phi)), rx(psi / 2));
  const back = mul(mul(mul(rx(phi), rz(a)), rx(-phi)), rx(-psi / 2));
  return { front, back };
}

// All the masses for a shape, in the body frame, with the centre of mass moved to the origin.
export function shapePoints(sh) {
  const F = halfFrames(sh), out = [];
  for (const [w, R, e] of [['front', F.front, sh.ef ?? 1], ['back', F.back, sh.eb ?? 1]]) {
    for (const [p, m] of halfPoints(w, e)) out.push({ p: mv(R, p), m, half: w });
  }
  let M = 0; const c = [0, 0, 0];
  out.forEach((q) => { M += q.m; for (let k = 0; k < 3; k++) c[k] += q.m * q.p[k]; });
  for (let k = 0; k < 3; k++) c[k] /= M;
  out.forEach((q) => { q.p = [q.p[0] - c[0], q.p[1] - c[1], q.p[2] - c[2]]; });
  out.com = c; out.mass = M;
  return out;
}

// Moment of inertia of one half (with its legs) about the spine, for extension e.
export function halfInertia(which, e) { return halfPoints(which, e).reduce((s, [p, m]) => s + m * (p[1] * p[1] + p[2] * p[2]), 0); }

// One step: the body rotation rate that keeps angular momentum zero while the shape goes from A to B over dt.
function omegaFor(A, B, dt) {
  const J = [0, 0, 0, 0, 0, 0, 0, 0, 0], L = [0, 0, 0];
  for (let i = 0; i < A.length; i++) {
    const p = A[i].p.map((x, k) => (x + B[i].p[k]) / 2), m = A[i].m;
    const v = B[i].p.map((x, k) => (x - A[i].p[k]) / dt);
    const r2 = p[0] * p[0] + p[1] * p[1] + p[2] * p[2];
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) J[a * 3 + b] += m * ((a === b ? r2 : 0) - p[a] * p[b]);
    const c = cross(p, v); L[0] += m * c[0]; L[1] += m * c[1]; L[2] += m * c[2];
  }
  return { omega: solve3(J, L.map((x) => -x)), J, L };
}

// Integrate a shape program shapeAt(u), u from 0 to 1, starting from orientation q0.
// Returns samples { u, q, sh } you can interpolate, plus each half's spin about the spine for the readouts.
export function simulate(shapeAt, q0 = [1, 0, 0, 0], steps = 240) {
  const out = [];
  let q = q0.slice(), A = shapePoints(shapeAt(0));
  out.push({ u: 0, q: q.slice(), sh: shapeAt(0), spin: [0, 0], resid: 0 });
  for (let i = 1; i <= steps; i++) {
    const u = i / steps, sh = shapeAt(u), B = shapePoints(sh), dt = 1 / steps;
    const { omega } = omegaFor(A, B, dt);
    const w = Math.hypot(...omega);
    if (w > 1e-12) q = qnorm(qmul(q, qaxis(omega, w * dt)));
    // spin of each half about the body's spine axis (x), and a check that the total really is zero
    const spin = [0, 0], tot = [0, 0, 0];
    for (let k = 0; k < B.length; k++) {
      const p = B[k].p.map((x, j) => (x + A[k].p[j]) / 2), v = B[k].p.map((x, j) => (x - A[k].p[j]) / dt);
      const vel = cross(omega, p).map((x, j) => x + v[j]), c = cross(p, vel).map((x) => x * B[k].m);
      spin[B[k].half === 'front' ? 0 : 1] += c[0];
      for (let j = 0; j < 3; j++) tot[j] += c[j];
    }
    out.push({ u, q: q.slice(), sh, spin, resid: Math.hypot(...tot) });
    A = B;
  }
  return out;
}

// Look up a simulated run at u (0..1).
export function sample(run, u) {
  u = clamp(u, 0, 1);
  const f = u * (run.length - 1), i = Math.min(run.length - 2, Math.floor(f)), k = f - i;
  const a = run[i], b = run[i + 1];
  const sh = {}; for (const key of Object.keys(a.sh)) sh[key] = lerp(a.sh[key], b.sh[key], k);
  return { q: qslerp(a.q, b.q, k), sh, spin: [lerp(a.spin[0], b.spin[0], k), lerp(a.spin[1], b.spin[1], k)], resid: lerp(a.resid, b.resid, k) };
}

// Roll of an orientation: how far the cat's back (+y) has turned about its spine away from "up".
export function upright(q) { const up = qrot(q, [0, 1, 0]); return Math.acos(clamp(up[1], -1, 1)); } // 0 = back up, π = upside down

// ---------------------------------------------------------------- shape programs
// The full righting move used by the cat in the first chapter: bend, sweep the bend round the spine
// (Kane & Scher's bend and twist), while the front legs tuck then reach out and the back legs do the opposite
// (tuck and turn), then straighten and stretch every leg out ready to land.
export function rightingProgram(B = 1.25, sweep = 1) {
  return (u) => {
    const env = smooth(u / 0.18) * (1 - smooth((u - 0.72) / 0.2));
    const s = smooth((u - 0.08) / 0.7);
    return {
      beta: B * env,
      phi: -Math.PI * 2 * sweep * s,
      psi: 0,
      ef: u < 0.45 ? lerp(1, 0.05, smooth(u / 0.15)) : lerp(0.05, 1, smooth((u - 0.45) / 0.15)),
      eb: u < 0.45 ? 1 : lerp(1, 0.15, smooth((u - 0.45) / 0.12)) * (1 - smooth((u - 0.82) / 0.15)) + smooth((u - 0.82) / 0.15),
    };
  };
}

// Pick the bend that brings an upside-down cat exactly back-up, by bisection on the simulated result.
const tuned = new Map();
// For one sweep the answer is a bend of about 83° (1.453 rad); scale < 1 gives a weaker, unfinished move.
export const RIGHTING_BEND = 1.4534;
export function rightingRun(scale = 1) {
  const key = Math.round(scale * 20) / 20;
  if (tuned.has(key)) return tuned.get(key);
  const run = simulate(rightingProgram(RIGHTING_BEND * key, 1), qaxis([1, 0, 0], Math.PI), 300);
  run.bend = RIGHTING_BEND * key; tuned.set(key, run);
  return run;
}
export function tuneRighting(sweep = 1) {
  const q0 = qaxis([1, 0, 0], Math.PI);
  const err = (B) => { const r = simulate(rightingProgram(B, sweep), q0, 160); return upright(r[r.length - 1].q); };
  let best = 1.2, be = 9;
  for (let B = 0.3; B <= 2.4; B += 0.1) { const e = err(B); if (e < be) { be = e; best = B; } }
  let lo = best - 0.1, hi = best + 0.1;
  for (let k = 0; k < 18; k++) { const a = lo + (hi - lo) / 3, b = hi - (hi - lo) / 3; if (err(a) < err(b)) hi = b; else lo = a; }
  const B = (lo + hi) / 2, run = simulate(rightingProgram(B, sweep), q0, 300);
  return { B, run };
}

// Unwrapped roll angles (about the world x axis) of the whole cat and of each half, for readouts.
// The "roll" of a part is the angle of its back (+y) around the spine, measured from straight up.
export function annotate(run) {
  const ang = (q, R) => { const up = qrot(q, R ? mv(R, [0, 1, 0]) : [0, 1, 0]); return Math.atan2(up[2], up[1]); };
  const unwrap = (prev, a) => (prev === null ? a : prev + Math.atan2(Math.sin(a - prev), Math.cos(a - prev)));
  let pb = null, pf = null, pk = null;
  for (const r of run) {
    const F = halfFrames(r.sh);
    pb = unwrap(pb, ang(r.q)); pf = unwrap(pf, ang(r.q, F.front)); pk = unwrap(pk, ang(r.q, F.back));
    r.roll = [pb, pf, pk];
  }
  return run;
}
export function rollAt(run, u) {
  u = clamp(u, 0, 1);
  const f = u * (run.length - 1), i = Math.min(run.length - 2, Math.floor(f)), k = f - i;
  return run[i].roll.map((x, j) => lerp(x, run[i + 1].roll[j], k));
}
