// Chapter 3: bend and twist, the Kane & Scher (1969) picture. The cat bends at the waist into a V, then swings
// the bend round its spine like a hula hoop: belly side, one flank, back, other flank. Each half then turns
// about its own axis, and the two turns cancel only partly, because the halves are not lined up. To keep the
// total angular momentum at zero, the whole body turns the other way. Straighten out, and it has turned.
// fall.js computes this numerically (Kane and Scher solved the same physics with equations); the legs stay
// stretched here so that the turn comes from the bend alone. The net turn rises with the bend: in this
// model a bend of roughly 100° gives a half turn. The numbers belong to this simple body, not to a real cat.
import { THREE, M } from '../kit.js';
import { makeCat, poseFrom, spinArrow, COL, DEG, smooth } from '../cat.js';
import { simulate, annotate, rollAt, qaxis, mv, halfFrames } from '../fall.js';

const prog = (B) => (u) => ({ beta: B * smooth(u / 0.15) * (1 - smooth((u - 0.85) / 0.15)), phi: -2 * Math.PI * smooth((u - 0.15) / 0.7), psi: 0, ef: 1, eb: 1 });
const runs = new Map();
function runFor(bendDeg) {
  const key = Math.round(bendDeg);
  if (!runs.has(key)) runs.set(key, annotate(simulate(prog(key / DEG), qaxis([1, 0, 0], Math.PI), 260)));
  return runs.get(key);
}
let curve = null; // net turn against bend, for the little chart
function netCurve() {
  if (curve) return curve;
  curve = [];
  for (let b = 0; b <= 130; b += 10) { const r = annotate(simulate(prog(b / DEG), [1, 0, 0, 0], 90)); curve.push([b, Math.abs(r[r.length - 1].roll[0] - r[0].roll[0]) * DEG]); }
  return curve;
}
function spark(bend) {
  const c = netCurve(), W = 260, H = 90, x = (b) => 8 + (b / 130) * (W - 16), y = (v) => H - 14 - (v / 270) * (H - 24);
  const d = c.map(([b, v], i) => `${i ? 'L' : 'M'}${x(b).toFixed(1)},${y(v).toFixed(1)}`).join('');
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-label="Net turn against bend angle">
    <line x1="8" x2="${W - 8}" y1="${y(180)}" y2="${y(180)}" stroke="#737a8e" stroke-dasharray="3 3"/><text x="${W - 8}" y="${y(180) - 4}" fill="#737a8e" font-size="10" text-anchor="end">180°: feet down</text>
    <path d="${d}" fill="none" stroke="#a3e635" stroke-width="2"/>
    <circle cx="${x(bend)}" cy="${y(c.reduce((a, p) => (Math.abs(p[0] - bend) < Math.abs(a[0] - bend) ? p : a))[1])}" r="4" fill="#ffb547"/>
    <text x="8" y="${H - 2}" fill="#737a8e" font-size="10">bend 0°</text><text x="${W - 8}" y="${H - 2}" fill="#737a8e" font-size="10" text-anchor="end">130°</text></svg>`;
}

export default {
  id: 'bend',
  short: 'Bend and twist',
  title: 'Bend, then swing the bend around',
  subtitle: 'Kane and Scher’s 1969 model: two cylinders that bend at the waist turn over with no spin at all.',
  view: { pos: [3.4, 2.8, 4.6], target: [0, 2.4, 0] },
  learn: `<p>In 1969 the engineers <b>Thomas Kane</b> and <b>M. P. Scher</b> at Stanford wrote the falling cat as two identical cylinders joined at the waist, which can bend but not twist against each other. They showed that this simple body can turn itself over with its angular momentum held at zero, and that the motion looks a lot like films of real cats.</p>
    <p>The move goes like this. The cat <b>bends</b> into a V. Then it swings the bend round its body: the V points to the belly, then one side, then the back, then the other side. Each half rolls round its own axis as it goes. Because the halves now point in different directions, their spins do not simply cancel along the spine, and the whole body turns the other way to keep the total at zero. When it straightens out, it is facing a new way.</p>
    <p>It is the same kind of effect as parallel parking: wiggle back and forth in a loop and you end up somewhere new. Physicists call it a <b>geometric phase</b>: the net turn depends on the shape of the loop of movements, not on how fast it is done.</p>
    <p class="tip"><b>Try it:</b> change the <b>bend</b>. A small bend turns the cat only a little. In this model a bend of about 100° gives a half turn, and the chart shows how the turn grows.</p>
    <p class="note">The numbers belong to this simple model, not to a real cat, which also tucks its legs and uses its spine more freely.</p>`,
  terms: [
    { t: 'Bend and twist', d: 'Bending at the waist and swinging the bend around the body, so that the two halves’ rolls leave a net turn.' },
    { t: 'Geometric phase', d: 'A net change that depends only on the shape of a loop of movements, not on how fast it is made.' },
    { t: 'Shape space', d: 'All the shapes a body can take. A loop in shape space can leave the body facing a new way.' },
  ],
  defaults: { bend: 100, u: 0, play: true, style: 'cat' },
  controls: [
    { key: 'bend', type: 'range', label: 'Bend at the waist', min: 0, max: 130, step: 1, fmt: (v) => `${v.toFixed(0)}°` },
    { key: 'style', type: 'seg', label: 'Show as', options: [{ v: 'cat', label: 'Cat' }, { v: 'cyl', label: 'Two cylinders' }] },
    { key: 'play', type: 'toggle', label: 'Play' },
    { key: 'u', type: 'range', label: 'Step through', min: 0, max: 1, step: 0.001, fmt: (v) => `${(v * 100).toFixed(0)}%`, hint: 'Turn Play off to drag.' },
  ],
  quiz: [
    { q: 'In Kane and Scher’s model, what does the cat do?', options: ['Spins its tail like a propeller', 'Bends at the waist and swings the bend around its body', 'Pushes against the air with its paws', 'Nothing: it lands on its back'], answer: 1, why: 'Bending, then sweeping the bend round, makes the halves roll in a way that leaves the whole body turned.' },
    { q: 'What happens with a very small bend?', options: ['A bigger turn', 'Only a small turn', 'No change at all', 'The cat spins faster and faster'], answer: 1, why: 'The net turn grows with the bend. A slight bend turns the body only a little.' },
    { q: 'Does doing the move faster give a bigger turn?', options: ['Yes, twice as fast is twice the turn', 'No, the turn depends on the shape of the movement, not its speed', 'Only above a certain speed', 'It reverses the turn'], answer: 1, why: 'It is a geometric effect: the same loop of shapes gives the same turn at any speed.' },
  ],
  reel: [
    { ms: 5800, caption: 'Trick two: bend into a V and swing the bend round, like a hula hoop.', set: { bend: 100, play: false, style: 'cyl' }, anim: { u: [0, 1] }, view: { pos: [4.2, 3.4, 5.8], target: [0, 2.4, 0] }, spin: 0.3 },
    { ms: 5200, caption: 'The halves roll against each other, and the cat comes out turned over.', set: { bend: 100, play: false, style: 'cat' }, anim: { u: [0, 1] }, view: { pos: [5.6, 2.2, 1.4], target: [0, 2.4, 0] }, spin: 0 },
  ],
  build({ stage, s }) {
    stage.floor.visible = false;
    stage.setShift(document.body.classList.contains('gb-reel') ? 0 : 0.12, 0);
    const root = new THREE.Group(); root.position.y = 2.4; stage.root.add(root);
    const cats = { cyl: makeCat('cyl'), cat: makeCat('cat') };
    Object.values(cats).forEach((c) => root.add(c));
    const arF = spinArrow(COL.front, 0.5), arB = spinArrow(COL.back, 0.5);
    // an arrow from the waist showing which way the V points, and its circle
    const bendArrow = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8), M.glow(COL.amber)); shaft.position.y = 0.35;
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 12), M.glow(COL.amber)); tip.position.y = 0.78;
    bendArrow.add(shaft, tip);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.006, 6, 64), M.glow(0x56607a)); ring.rotation.y = Math.PI / 2;
    const lbl = stage.label('bend points here', [0, 0, 0], root, 'dim');
    let u = 0, run = null, last = null;
    return {
      update(dt, st) {
        run = runFor(st.bend);
        if (st.play) { u += dt / 4.2; if (u > 1.25) u = 0; st.u = Math.min(1, u); } else u = st.u;
        const cat = cats[st.style] || cats.cat;
        Object.values(cats).forEach((c) => { c.visible = c === cat; });
        if (arF.parent !== cat) { cat.add(arF, arB, bendArrow, ring); cat.add(lbl); arF.position.x = 0.5; arB.position.x = -0.5; }
        last = poseFrom(cat, run, Math.min(1, u));
        arF.set(last.spin[0], 0.06); arB.set(last.spin[1], 0.06);
        // the bend direction is (0, −cos φ, −sin φ) in the body frame
        const phi = last.sh.phi, b = last.sh.beta;
        bendArrow.rotation.x = Math.PI + phi; bendArrow.visible = b > 0.08; ring.visible = b > 0.08;
        lbl.visible = b > 0.3;
        lbl.position.set(0, -Math.cos(phi) * 1.05, -Math.sin(phi) * 1.05);
      },
      readout(st) {
        if (!run || !last) return '';
        const k = Math.min(1, u), r = rollAt(run, k), r0 = run[0].roll, net = Math.abs(run[run.length - 1].roll[0] - r0[0]) * DEG;
        const stage_ = k < 0.15 ? 'Bending into a V' : k < 0.85 ? 'Swinging the bend round' : 'Straightening out';
        return `<div class="big">${stage_}</div>
          <div class="row"><span>Whole body has turned</span><b>${Math.abs((r[0] - r0[0]) * DEG).toFixed(0)}°</b></div>
          <div class="row"><span>Net turn for a ${st.bend.toFixed(0)}° bend</span><b>${net.toFixed(0)}°</b></div>
          <div class="row"><span>Total angular momentum</span><b>${last.resid < 5e-4 ? '0.000' : last.resid.toFixed(3)}</b></div>
          ${spark(st.bend)}<p class="r-say">Net turn against bend, computed in this model.</p>`;
      },
    };
  },
};
