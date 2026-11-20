// Chapter 2: tuck and turn. Two halves joined at the waist twist against each other about the spine.
// Angular momentum about the spine is I_front·ω_front + I_back·ω_back = 0, so the half with the smaller
// moment of inertia (legs tucked in) turns further than the half with the larger one (legs stretched out).
// Swap the legs and twist back, and the halves' share of the turn swaps, so the whole cat keeps a net turn.
// Without the swap, untwisting undoes everything. Every angle in the readout comes from fall.js's simulation
// (point masses, J·Ω = −Σ m p × v at every step), not from a formula.
// Marey (1894) saw cats turn the front half with legs tucked against the stretched back half, and Guyou (1894)
// explained why that leaves a net turn; real cats combine it with the bend of the next chapter.
import { THREE, M } from '../kit.js';
import { makeCat, poseFrom, spinArrow, COL, DEG, clamp, smooth, lerp } from '../cat.js';
import { simulate, annotate, rollAt, halfInertia, qaxis } from '../fall.js';

const runs = new Map();
function runFor(st) {
  const key = [st.tuck, st.twist, st.swap, st.cycles].join('|');
  if (runs.has(key)) return runs.get(key);
  const n = st.cycles, lo = 1 - st.tuck, psiMax = st.twist / DEG;
  const prog = (u) => {
    const c = Math.min(n - 1, Math.floor(u * n)), w = u * n - c, A = w < 0.5, k = A ? w * 2 : (w - 0.5) * 2;
    const legsK = smooth(k / 0.25), twistK = smooth((k - 0.3) / 0.65);
    // half A: tuck the front, stretch the back, twist the front one way.
    // half B: (with swap) stretch the front, tuck the back, twist back to straight.
    const prevB = { ef: st.swap ? 1 : lo, eb: st.swap ? lo : 1 };
    const tgtA = { ef: lo, eb: 1 }, tgtB = st.swap ? { ef: 1, eb: lo } : { ef: lo, eb: 1 };
    const from = A ? (c === 0 && A ? { ef: 1, eb: 1 } : prevB) : tgtA, to = A ? tgtA : tgtB;
    return { beta: 0, phi: 0, psi: A ? psiMax * twistK : psiMax * (1 - twistK), ef: lerp(from.ef, to.ef, legsK), eb: lerp(from.eb, to.eb, legsK) };
  };
  const run = annotate(simulate(prog, qaxis([1, 0, 0], Math.PI), 220 * n));
  run.phase = (u) => { const c = Math.min(n - 1, Math.floor(u * n)), w = u * n - c; return { c: c + 1, A: w < 0.5 }; };
  if (runs.size > 40) runs.clear();
  runs.set(key, run);
  return run;
}

export default {
  id: 'tuck',
  short: 'Tuck and turn',
  title: 'Tuck one end, turn the other',
  subtitle: 'Two halves twist against each other. The half with its legs pulled in turns further.',
  view: { pos: [3.7, 2.1, 3.9], target: [-0.2, 2.4, 0] },
  learn: `<p>Think of the cat as two short cylinders, front and back, joined at a flexible waist. If the front half twists one way, the back half must twist the other way, so that their spins cancel and the total stays at zero.</p>
    <p>The halves do not have to turn by the same <i>angle</i>, though. What cancels is spin, and spin depends on the <b>moment of inertia</b>: how far the mass sits from the axis it turns about. A half with its legs <b>tucked in</b> is easy to turn, so it swings a long way. A half with its legs <b>stretched out</b> is hard to turn, so it barely moves.</p>
    <p>So the cat tucks its front legs, stretches its back legs and twists: the front turns a lot, the back a little. Then it <b>swaps</b>: it stretches the front legs, tucks the back legs and twists back. Now the back catches up while the front hardly moves back. When the twist is undone the whole cat has turned.</p>
    <p>This is what Marey’s 1894 photographs showed, and what the naval officer Guyou explained to the Paris Academy that autumn: the turn is made in steps, and the halves’ changing moments of inertia leave a net turn while the total spin stays zero.</p>
    <p class="tip"><b>Try it:</b> turn <b>Swap the legs</b> off and the net turn drops to zero. Turn it on and pull the <b>tuck</b> slider: the bigger the difference between the halves, the bigger the turn. More twists add more turn.</p>
    <p class="note">Pure tuck and turn needs a lot of twist in the spine to reach 180°. Real cats combine it with the bend of the next chapter.</p>`,
  terms: [
    { t: 'Moment of inertia', d: 'How hard something is to set turning about an axis. Mass far from the axis makes it larger.' },
    { t: 'Tuck and turn', d: 'Pulling the legs in on one half and stretching them on the other, so the two halves turn by different angles.' },
    { t: 'Conservation of angular momentum', d: 'With no outside twist, the total spin of a body stays the same.' },
  ],
  defaults: { tuck: 1, twist: 180, swap: true, cycles: 1, u: 0, play: true, style: 'cyl' },
  controls: [
    { key: 'tuck', type: 'range', label: 'How far the legs tuck in', min: 0, max: 1, step: 0.05, fmt: (v) => { const a = halfInertia('front', 1 - v), b = halfInertia('front', 1); return `${(b / a).toFixed(1)}× easier to turn`; }, hint: 'The moment of inertia of a tucked half compared with a stretched one.' },
    { key: 'twist', type: 'range', label: 'Twist in the spine', min: 30, max: 180, step: 5, fmt: (v) => `${v}°` },
    { key: 'swap', type: 'toggle', label: 'Swap the legs before twisting back' },
    { key: 'cycles', type: 'seg', label: 'Repeat', options: [{ v: 1, label: 'Once' }, { v: 2, label: 'Twice' }, { v: 3, label: '3 times' }] },
    { key: 'style', type: 'seg', label: 'Show as', options: [{ v: 'cyl', label: 'Two cylinders' }, { v: 'cat', label: 'Cat' }] },
    { key: 'play', type: 'toggle', label: 'Play' },
    { key: 'u', type: 'range', label: 'Step through', min: 0, max: 1, step: 0.001, fmt: (v) => `${(v * 100).toFixed(0)}%`, hint: 'Turn Play off to drag.' },
  ],
  quiz: [
    { q: 'Two halves twist against each other. Which one turns further?', options: ['The one with its legs stretched out', 'The one with its legs tucked in', 'They always turn the same angle', 'The heavier one'], answer: 1, why: 'Tucked legs mean a small moment of inertia, so that half needs a bigger angle to carry the same spin.' },
    { q: 'What happens if the cat twists and then untwists without swapping its legs?', options: ['It turns twice as far', 'It ends up where it started', 'It spins forever', 'It turns 180°'], answer: 1, why: 'The untwist exactly reverses the twist. The swap is what leaves a net turn.' },
    { q: 'What stays at zero the whole time?', options: ['The angle of the front half', 'The angle of the back half', 'The total angular momentum', 'The twist in the spine'], answer: 2, why: 'The halves turn by different angles, but their spins always cancel.' },
  ],
  reel: [
    { ms: 5600, caption: 'Trick one: tuck the front legs and twist. The front turns a lot, the back a little.', set: { tuck: 1, twist: 180, swap: true, cycles: 1, play: true, style: 'cyl' }, act: (s, inst) => inst.restart(0), anim: { u: [0, 0.5] }, view: { pos: [3.7, 2.1, 3.9], target: [-0.2, 2.4, 0] }, spin: 0 },
    { ms: 5600, caption: 'Then swap: stretch the front, tuck the back, twist back. The cat has turned.', set: { play: false, style: 'cat' }, anim: { u: [0.5, 1] }, view: { pos: [3.4, 2.0, -4.0], target: [-0.2, 2.4, 0] }, spin: 0 },
  ],
  build({ stage, s }) {
    stage.floor.visible = false;
    stage.setShift(document.body.classList.contains('gb-reel') ? 0 : 0.12, 0);
    const root = new THREE.Group(); root.position.y = 2.4; stage.root.add(root);
    const cats = { cyl: makeCat('cyl'), cat: makeCat('cat') };
    Object.values(cats).forEach((c) => root.add(c));
    const arF = spinArrow(COL.front, 0.5), arB = spinArrow(COL.back, 0.5);
    // the axis: a thin line through the spine, and a ring with an "up" tick showing where we started
    const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 4.6, 6), M.glow(0x56607a)); axis.rotation.z = Math.PI / 2; root.add(axis);
    const dial = new THREE.Group(); root.add(dial); dial.position.x = -1.9;
    dial.add(new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.008, 6, 64), M.glow(0x56607a)).rotateY(Math.PI / 2));
    const needle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.62, 0.04), M.glow(COL.lime)); needle.geometry.translate(0, 0.31, 0);
    const needleG = new THREE.Group(); needleG.add(needle); dial.add(needleG);
    const lblUp = stage.label('back up', [-1.9, 0.78, 0], root, 'dim'), lblDown = stage.label('upside down', [-1.9, -0.8, 0], root, 'dim');
    let u = 0, run = null, last = null;
    return {
      restart(v = 0) { u = v; s.u = v; },
      update(dt, st) {
        run = runFor(st);
        if (st.play) { u += dt / (3.2 * st.cycles); if (u > 1.25) u = 0; st.u = Math.min(1, u); } else u = st.u;
        const cat = cats[st.style] || cats.cyl;
        Object.entries(cats).forEach(([k, c]) => { c.visible = c === cat; });
        if (arF.parent !== cat) { cat.add(arF, arB); arF.position.x = 0.5; arB.position.x = -0.5; }
        last = poseFrom(cat, run, Math.min(1, u));
        arF.set(last.spin[0], 0.06); arB.set(last.spin[1], 0.06);
        const r = rollAt(run, Math.min(1, u));
        needleG.rotation.x = r[0];
      },
      readout(st) {
        if (!run || !last) return '';
        const k = Math.min(1, u), r = rollAt(run, k), r0 = run[0].roll, ph = run.phase(k);
        const d = (i) => ((r[i] - r0[i]) * DEG);
        const net = (run[run.length - 1].roll[0] - r0[0]) * DEG;
        const If = halfInertia('front', last.sh.ef), Ib = halfInertia('back', last.sh.eb);
        return `<div class="big">${ph.A ? 'Front tucked, twisting' : st.swap ? 'Swapped, twisting back' : 'Same legs, twisting back'}</div>
          <p class="r-say">Twist ${ph.c} of ${st.cycles}. ${If < Ib ? 'Front is easier to turn' : If > Ib * 1.05 ? 'Back is easier to turn' : 'Both halves alike'} (I front ${If.toFixed(3)}, I back ${Ib.toFixed(3)}).</p>
          <div class="row"><span>Front half has turned</span><b style="color:#ff7a59">${d(1).toFixed(0)}°</b></div>
          <div class="row"><span>Back half has turned</span><b style="color:#8ef0ff">${d(2).toFixed(0)}°</b></div>
          <div class="row"><span>Whole cat has turned</span><b>${d(0).toFixed(0)}°</b></div>
          <div class="row"><span>Net turn at the end</span><b>${Math.abs(net).toFixed(0)}°</b></div>
          <div class="row"><span>Total angular momentum</span><b>${last.resid < 5e-4 ? '0.000' : last.resid.toFixed(3)}</b></div>`;
      },
    };
  },
};
