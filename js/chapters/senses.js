// Chapter 4: how the cat knows which way is up. The inner ear holds the vestibular system: three fluid-filled
// semicircular canals at right angles, which sense turning, and two otolith organs (utricle and saccule),
// whose tiny crystals rest on hair cells and sense gravity and linear acceleration. The eyes help too.
// Magnus (1924) showed the inner-ear labyrinth is the main sense organ for posture. Kittens blind from birth
// develop air righting on the same timetable as sighted ones, so the reflex is mainly vestibular
// (Cremieux, Veraart & Wanet 1984). Kittens: air righting first appears around day 25 and is mature by about
// day 33-35, i.e. about 5 weeks (Villablanca & Olmstead 1979; Sechzer et al. 1984); popular sources give later ages.
// Switching off the inner ear here stops the move entirely: a simplification of "mainly vestibular".
// The kitten's weaker move is the same simulated move with a smaller bend, an illustration, not a measurement.
// Free fall: once falling, the otolith crystals no longer press on their hair cells, so the ear "feels"
// the loss of weight; the drawing shows the crystals lifting off.
import { THREE, M, sphere, torus } from '../kit.js';
import { makeCat, poseFrom, COL, SCALE, G, DEG, clamp, smooth } from '../cat.js';
import { rightingRun, annotate, rollAt, mv } from '../fall.js';

const ONSET = 3.5, FULL = 5; // weeks, approximate
const H = 1.0;                  // the kitten's drop, metres
const RIGHT_T = 0.3;
const Y_LAND = 0.78 * 0.75;

export function ability(st) {
  const age = clamp((st.age - ONSET) / (FULL - ONSET), 0, 1);
  const sense = st.ears ? 1 : 0;
  return age * sense;
}

export default {
  id: 'senses',
  short: 'Which way is up?',
  title: 'A spirit level in each ear',
  subtitle: 'The inner ear senses turning and gravity, the eyes help, and kittens learn the move by about five weeks old.',
  view: { pos: [0.9, 2.6, 8.6], target: [0.6, 2.2, 0] },
  learn: `<p>To turn the right way the cat must know where "up" is. The answer sits deep inside each ear, in the <b>vestibular system</b>.</p>
    <p>Three tiny rings filled with fluid, the <b>semicircular canals</b>, sit at right angles to each other, one for each direction of turning. When the head turns, the fluid lags behind and bends a little gate of hair cells. Next to them, two small sacs called <b>otolith organs</b> carry a layer of tiny crystals that rest on hair cells. Gravity pulls the crystals, so the ear can tell which way is down.</p>
    <p>Just before the drop, the otoliths say which way down is. The moment the cat falls, the crystals stop pressing (everything falls together), and that sudden lightness is a signal too. During the turn, the canals report how fast the head is rotating. The head turns first, then the body follows it.</p>
    <p><b>Eyes help, but the ear leads.</b> Kittens that were blind from birth learned the move at the same age as sighted kittens, which shows the reflex runs mainly on the inner ear. In weightlessness, where the otoliths lose their sense of down, the reflex can go wrong.</p>
    <p><b>Kittens</b> are not born with the trick. In laboratory studies it first shows up at around <b>3½ weeks</b> old and is mature by about <b>5 weeks</b> (popular sources often quote later ages).</p>
    <p class="tip"><b>Try it:</b> move the <b>age</b> slider, then switch off the eyes or the inner ear and drop the kitten again.</p>`,
  terms: [
    { t: 'Vestibular system', d: 'The balance organs of the inner ear: three semicircular canals and two otolith organs.' },
    { t: 'Semicircular canal', d: 'A fluid-filled loop in the inner ear that senses the head turning.' },
    { t: 'Otolith', d: 'A tiny crystal of calcium carbonate in the inner ear whose weight tells the brain which way is down.' },
  ],
  defaults: { age: 10, eyes: true, ears: true },
  controls: [
    { key: 'drop', type: 'buttons', label: 'Let go', items: [{ label: 'Drop the kitten', act: (s, inst) => inst.restart() }] },
    { key: 'age', type: 'range', label: 'Kitten’s age', min: 1, max: 12, step: 0.5, fmt: (v) => `${v} weeks` },
    { key: 'eyes', type: 'toggle', label: 'Eyes open' },
    { key: 'ears', type: 'toggle', label: 'Inner ear working' },
  ],
  quiz: [
    { q: 'Which part of the inner ear senses turning?', options: ['The otoliths', 'The semicircular canals', 'The eardrum', 'The whiskers'], answer: 1, why: 'Fluid in the three canals lags behind when the head turns and bends their hair cells.' },
    { q: 'Kittens blind from birth are tested. When do they learn the mid-air turn?', options: ['Never', 'At about the same age as sighted kittens', 'Only as adults', 'Earlier than sighted kittens'], answer: 1, why: 'They develop it on the same timetable, which shows the reflex relies mainly on the inner ear.' },
    { q: 'Roughly when is a kitten’s mid-air righting reflex mature?', options: ['At birth', 'At about 5 weeks', 'At about 6 months', 'Only as adults'], answer: 1, why: 'Studies find it first appears at about 3½ weeks and is mature by about 5 weeks.' },
  ],
  reel: [
    { ms: 5200, caption: 'It knows which way is up from its inner ear: three tiny canals sense turning, crystals sense gravity.', set: { age: 10, eyes: true, ears: true }, act: (s, inst) => inst.restart(0.15), view: { pos: [0.6, 2.4, 8.4], target: [0.5, 2.1, 0] }, spin: 0 },
  ],
  build({ stage, s }) {
    stage.floor.visible = true;
    stage.setShift(document.body.classList.contains('gb-reel') ? 0 : 0.12, 0);
    const root = new THREE.Group(); stage.root.add(root);
    // ---- a big see-through head with the inner ear inside
    const headG = new THREE.Group(); headG.position.set(-1.6, 2.6, 0); root.add(headG);
    const shell = sphere(1.35, M.clear(0xe39448, 0.13), 48); shell.castShadow = false; shell.scale.set(1, 0.9, 1.05); headG.add(shell);
    const eyes = [];
    for (const z of [-1, 1]) {
      const e = sphere(0.22, M.plastic(COL.eye, { emissive: 0x2a4a10 }), 20); e.position.set(1.05, 0.25, z * 0.5); headG.add(e);
      const p = sphere(0.09, M.matte(0x111111), 10); p.scale.set(0.5, 1.6, 1); p.position.set(1.26, 0.25, z * 0.52); headG.add(p);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.5, 24, 1, true), M.ghost(COL.lime, 0.05)); cone.rotation.z = Math.PI / 2; cone.position.set(1.95, 0.25, z * 0.55); headG.add(cone);
      eyes.push(e, p, cone);
    }
    const nose = sphere(0.1, M.matte(COL.pink), 10); nose.position.set(1.33, -0.15, 0); headG.add(nose);
    // inner ear (drawn on one side, large)
    const ear = new THREE.Group(); ear.position.set(-0.25, 0.2, 0.5); ear.scale.setScalar(1.6); headG.add(ear);
    const canalCol = [0xff7a59, 0x8ef0ff, 0xc49bff];
    const canals = [[0, 0, 0], [Math.PI / 2, 0, 0], [0, Math.PI / 2, 0]].map((r, i) => {
      const c = torus(0.32, 0.04, M.plastic(canalCol[i], { emissive: canalCol[i], emissiveIntensity: 0.1 }), 48); c.rotation.set(...r);
      c.position.set(i === 2 ? 0.0 : 0.1, i === 1 ? 0.25 : 0.32, i === 0 ? -0.1 : 0.05); ear.add(c); return c;
    });
    const sac = sphere(0.16, M.clear(0xfff3d6, 0.5), 20); sac.scale.set(1.3, 0.8, 1); ear.add(sac);
    const crystals = new THREE.Group(); ear.add(crystals);
    for (let i = 0; i < 14; i++) { const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.03), M.glow(0xffffff)); c.position.set((i % 5) * 0.05 - 0.1, 0, (Math.floor(i / 5) - 1) * 0.05); crystals.add(c); }
    const cochlea = torus(0.12, 0.035, M.plastic(0xf2c3a0), 32); cochlea.position.set(0.2, -0.22, 0); ear.add(cochlea);
    stage.label('semicircular canals', [-0.25, 1.0, 0.9], headG, 'dim');
    stage.label('otoliths', [-0.25, -0.25, 1.1], headG, 'dim');
    stage.label('eyes', [1.3, 0.75, 0.6], headG, 'dim');
    const gArrow = new THREE.Group(); root.add(gArrow); gArrow.position.set(-3.5, 3.5, 0);
    const gs = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), M.glow(COL.amber)); gs.position.y = -0.45;
    const gt = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 12), M.glow(COL.amber)); gt.position.y = -1; gt.rotation.z = Math.PI;
    gArrow.add(gs, gt); stage.label('down', [-3.5, 2.2, 0], root, 'dim');
    // ---- the kitten, dropped next to it
    const kit = makeCat('cat'); kit.scale.setScalar(0.75); root.add(kit);
    const KX = 2.6;
    let t = -0.3, smp = null, run = null, key = '';
    const fallT = Math.sqrt((2 * H) / G);
    return {
      restart(v = 0) { t = -0.3 + v; },
      update(dt, st) {
        const a = ability(st), k = Math.round(a * 20) / 20;
        if (key !== k) { key = k; run = annotate(rightingRun(k)); }
        t += dt * 0.25; if (t > fallT + 1.2) t = -0.3;
        const tt = Math.max(0, Math.min(t, fallT)), y0 = Y_LAND + H * SCALE * 0.55;
        const uu = Math.min(1, tt / RIGHT_T);
        smp = poseFrom(kit, run, uu);
        kit.position.set(KX, t <= 0 ? y0 : t < fallT ? y0 - 0.5 * G * tt * tt * SCALE * 0.55 : Y_LAND, 0);
        // the big head copies the kitten's front half, so you see what its ear feels
        const F = kit.frames().front;
        const m = new THREE.Matrix4().set(F[0], F[1], F[2], 0, F[3], F[4], F[5], 0, F[6], F[7], F[8], 0, 0, 0, 0, 1);
        headG.quaternion.copy(kit.quaternion).multiply(new THREE.Quaternion().setFromRotationMatrix(m));
        // canals glow with the turning rate; crystals sink to "down" when supported, float when falling
        const rate = t > 0 && t < fallT ? Math.abs(rollAt(run, Math.min(1, (tt + 0.01) / RIGHT_T))[1] - rollAt(run, uu)[1]) / 0.01 : 0;
        canals.forEach((c, i) => { c.material.emissiveIntensity = st.ears ? 0.1 + Math.min(1.5, rate * (i === 2 ? 0.12 : 0.04)) : 0.02; c.material.color.setHex(st.ears ? canalCol[i] : 0x555a66); });
        const falling = t > 0 && t < fallT;
        const down = new THREE.Vector3(0, -1, 0).applyQuaternion(headG.quaternion.clone().invert());
        crystals.position.copy(falling ? new THREE.Vector3(0, 0.05 * Math.sin(t * 30), 0) : down.multiplyScalar(0.09));
        crystals.visible = st.ears;
        eyes.forEach((e, i) => { if (i % 3 === 2) e.visible = st.eyes; else e.scale.y = st.eyes ? (i % 3 === 1 ? 1.6 : 1) : 0.15; });
      },
      readout(st) {
        const a = ability(st), landedOk = a > 0.97;
        const turned = smp && run ? Math.abs(rollAt(run, 1)[0] - run[0].roll[0]) * DEG : 0;
        const age = st.age < ONSET ? 'too young: no mid-air righting yet' : st.age < FULL ? 'learning: the move is still developing' : 'old enough: the reflex is mature';
        const sense = st.ears ? (st.eyes ? 'Ear and eyes both working' : 'Ear alone is enough') : 'No inner ear: no sense of up (simplified)';
        return `<div class="big">${landedOk ? 'Lands on its feet' : turned > 30 ? 'Lands partly turned' : 'Does not turn'}</div>
          <div class="row"><span>Age</span><b>${st.age} weeks</b></div><p class="r-say">${age}.</p>
          <div class="row"><span>Senses</span><b>${sense}</b></div>
          <div class="row"><span>Turn before landing</span><b>${turned.toFixed(0)}° of 180°</b></div>
          <p class="r-say">The kitten’s weaker move is an illustration: the same simulated move with less bend.</p>`;
      },
    };
  },
};
