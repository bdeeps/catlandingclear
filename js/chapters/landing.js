// Chapter 5: the landing. Once upright, the cat stretches its legs toward the ground and arches its back,
// so that on impact the legs bend and the body sinks a few centimetres while it stops. Stopping over a
// longer distance means a smaller force: a = v² / (2d).
// Falling speed: v(h) = vt·√(1 − e^(−2gh/vt²)) for a body with quadratic air drag and terminal speed vt.
// A cat's terminal speed is commonly quoted as about 60 mph (≈ 97 km/h); a rough estimate, used here as 97 km/h.
// The stopping distances are illustrative round numbers, not measurements.
// High-rise syndrome: Whitney & Mehlhaff (1987, JAVMA) reviewed 132 cats brought to a New York vet hospital
// after falls (mean 5.5 storeys) over five months; 90% of treated cats survived. The idea that cats relax and
// spread out at terminal speed is a widely repeated hypothesis. Only cats that reached the vet were counted
// (survivorship bias); Vnuk et al. (2004, Zagreb, 119 cats) found injuries got much worse from 7 storeys up.
import { THREE, M } from '../kit.js';
import { makeCat, COL, G, clamp, smooth, lerp } from '../cat.js';

export const VT_KMH = 97;
const VT = VT_KMH / 3.6, STOREY = 3;
const DIST = { flex: 0.12, stiff: 0.03 }; // metres the body travels while stopping (illustrative)
export const speedAt = (h) => VT * Math.sqrt(1 - Math.exp((-2 * G * h) / (VT * VT)));

function chart(h) {
  const W = 260, Hh = 90, maxH = 30 * STOREY, x = (m) => 8 + (m / maxH) * (W - 16), y = (v) => Hh - 14 - (v / (VT * 3.6 * 1.1)) * (Hh - 24);
  let d = '';
  for (let m = 0; m <= maxH; m += 1.5) d += `${m ? 'L' : 'M'}${x(m).toFixed(1)},${y(speedAt(m) * 3.6).toFixed(1)}`;
  return `<svg class="spark" viewBox="0 0 ${W} ${Hh}" aria-label="Landing speed against height">
    <line x1="8" x2="${W - 8}" y1="${y(VT_KMH)}" y2="${y(VT_KMH)}" stroke="#737a8e" stroke-dasharray="3 3"/><text x="${W - 8}" y="${y(VT_KMH) - 4}" fill="#737a8e" font-size="10" text-anchor="end">terminal speed</text>
    <path d="${d}" fill="none" stroke="#a3e635" stroke-width="2"/><circle cx="${x(h)}" cy="${y(speedAt(h) * 3.6)}" r="4" fill="#ffb547"/>
    <text x="8" y="${Hh - 2}" fill="#737a8e" font-size="10">ground</text><text x="${W - 8}" y="${Hh - 2}" fill="#737a8e" font-size="10" text-anchor="end">30 storeys</text></svg>`;
}

export default {
  id: 'landing',
  short: 'The landing',
  title: 'Soft legs, arched back',
  subtitle: 'Upright is only half the job. The legs then act as springs, and a cat’s top speed is lower than you might think.',
  view: { pos: [4.6, 2.4, 6.4], target: [0, 1.3, 0] },
  learn: `<p>Once its feet are under it, the cat <b>stretches its legs</b> toward the ground and <b>arches its back</b>. On touchdown the legs bend at every joint and the body sinks before it stops. Stopping over a longer distance means a smaller force, the same reason you bend your knees when you jump off a wall.</p>
    <p>A falling cat speeds up until air drag balances its weight. For a cat this <b>terminal velocity</b> is often quoted as about <b>100 km/h</b> (60 mph), roughly half a skydiver’s, because a cat is light for its size. Treat that as a rough estimate. In this model the cat gets close to it after a fall of around ten storeys.</p>
    <p><b>The high-rise puzzle.</b> In 1987 two New York vets, <b>W. O. Whitney</b> and <b>C. J. Mehlhaff</b>, described 132 cats brought to their hospital after falls from buildings. 90% of the treated cats survived, and the study is often quoted as showing that cats from higher floors did no worse. A popular explanation is that once a cat reaches top speed it relaxes and spreads out like a flying squirrel.</p>
    <p>Be careful with that. Only cats that reached the vet were counted: a cat killed by a fall was less likely to be brought in, so high falls may look safer than they are. This is <b>survivorship bias</b>. A 2004 study of 119 cats in Zagreb found injuries got much worse from the 7th storey up. Falls from windows and balconies badly hurt many cats, so keep windows screened.</p>
    <p class="tip"><b>Try it:</b> raise the cat and watch its landing speed level off. Then switch to <b>stiff legs</b> and see how much bigger the force gets.</p>
    <p class="note">The stopping distances (12 cm and 3 cm) are round numbers for illustration, not measurements.</p>`,
  terms: [
    { t: 'Terminal velocity', d: 'The steady speed at which air drag equals weight, so a falling body stops speeding up.' },
    { t: 'High-rise syndrome', d: 'The pattern of injuries in cats that fall from buildings: often the chest, the jaw and the legs.' },
    { t: 'Survivorship bias', d: 'Drawing conclusions only from the cases that made it into the data, while the others are missing.' },
  ],
  defaults: { storeys: 4, legs: 'flex' },
  controls: [
    { key: 'storeys', type: 'range', label: 'Height of the fall', min: 0.5, max: 30, step: 0.5, fmt: (v) => `${v} storeys (${(v * STOREY).toFixed(0)} m)` },
    { key: 'legs', type: 'seg', label: 'Landing', options: [{ v: 'flex', label: 'Bent legs, arched back' }, { v: 'stiff', label: 'Stiff legs' }] },
  ],
  quiz: [
    { q: 'Why does a cat bend its legs as it lands?', options: ['To jump again', 'To stop over a longer distance, so the force is smaller', 'To look bigger', 'To speed up'], answer: 1, why: 'The same change in speed spread over more distance needs less force.' },
    { q: 'Roughly what is a cat’s terminal velocity?', options: ['About 10 km/h', 'About 100 km/h', 'About 300 km/h', 'There is no limit'], answer: 1, why: 'It is often estimated at about 100 km/h (60 mph), roughly half a skydiver’s top speed.' },
    { q: 'Why is the "high-rise" study hard to read?', options: ['It only counted cats that reached the vet', 'It used computer models', 'The cats were all kittens', 'It measured dogs'], answer: 0, why: 'Cats killed outright were rarely brought in, so the data may make high falls look safer: survivorship bias.' },
  ],
  reel: [
    { ms: 5200, caption: 'Then the landing: legs out, back arched, joints bending. Top speed is only about 100 km/h.', set: { storeys: 2, legs: 'flex' }, act: (s, inst) => inst.restart(0.6), view: { pos: [4.2, 1.6, 5.2], target: [0, 1.0, 0] }, spin: 0.2 },
  ],
  build({ stage, s }) {
    stage.floor.visible = true;
    stage.setShift(document.body.classList.contains('gb-reel') ? 0 : 0.12, 0);
    const root = new THREE.Group(); stage.root.add(root);
    const cat = makeCat('cat'); root.add(cat);
    // speed streaks while falling
    const streaks = new THREE.Group(); root.add(streaks);
    const sMat = M.ghost(0xcfe8ff, 0.35);
    const lines = Array.from({ length: 22 }, (_, i) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.012, 1, 0.012), sMat); l.userData.p = [Math.sin(i * 12.9898) * 2.4, (i * 0.37) % 3.5, Math.cos(i * 78.233) * 2.4]; streaks.add(l); return l; });
    const flag = stage.label('', [0, 3, 0], root, 'hot');
    let t = 0;
    const STAND = 0.78;
    return {
      restart(v = 0) { t = v; },
      update(dt, st) {
        const v = speedAt(st.storeys * STOREY), d = DIST[st.legs];
        t += dt * 0.6; const T = 3.2; if (t > T) t = 0;
        // phase 1 (0–1.2): falling with legs out; phase 2: touchdown and squash over d; phase 3: crouched, then stand
        const spread = st.storeys > 7 && t < 1.0;
        let y, sh;
        if (t < 1.2) {
          y = STAND + (1.2 - t) * 2.2;
          sh = spread ? { beta: 0.25, phi: 0, psi: 0, ef: 1.25, eb: 1.25 } : { beta: 0.35, phi: 0, psi: 0, ef: 0.85, eb: 0.95 };
        } else {
          const k = smooth((t - 1.2) / 0.25), back = smooth((t - 2.2) / 0.8);
          const sink = (st.legs === 'flex' ? 0.42 : 0.1) * k * (1 - back);
          y = STAND - sink;
          sh = st.legs === 'flex' ? { beta: lerp(0.35, 0.55, k) * (1 - back), phi: 0, psi: 0, ef: lerp(0.85, 0.55, k * (1 - back)), eb: lerp(0.95, 0.45, k * (1 - back)) } : { beta: 0, phi: 0, psi: 0, ef: 1, eb: 1 };
        }
        cat.setShape(sh); cat.quaternion.identity(); cat.position.set(0, y, 0);
        streaks.visible = t < 1.2;
        const sp = v / VT;
        lines.forEach((l) => { const [x, y0, z] = l.userData.p; l.scale.y = 0.2 + sp * 0.8; l.position.set(x, 0.6 + ((y0 + t * 9 * sp) % 3.5), z); });
        flag.visible = t > 1.2 && t < 2.6; flag.position.set(0, 2.4, 0);
        const gs = (v * v) / (2 * d) / G;
        flag.element.textContent = `${(v * 3.6).toFixed(0)} km/h → stops in ${(d * 100).toFixed(0)} cm: about ${gs.toFixed(0)} g`;
      },
      readout(st) {
        const h = st.storeys * STOREY, v = speedAt(h), d = DIST[st.legs], gs = (v * v) / (2 * d) / G;
        return `<div class="big">${(v * 3.6).toFixed(0)} km/h at the ground</div>
          <div class="row"><span>Fall</span><b>${h.toFixed(0)} m</b></div>
          <div class="row"><span>Share of terminal speed</span><b>${((v / VT) * 100).toFixed(0)}%</b></div>
          <div class="row"><span>Stopping distance</span><b>${(d * 100).toFixed(0)} cm (illustrative)</b></div>
          <div class="row"><span>Average stopping force</span><b>${gs.toFixed(0)}× its weight</b></div>
          ${chart(h)}<p class="r-say">${st.storeys > 7 ? 'Near top speed. It is often suggested that cats now relax and spread out; that is an idea, not a proven fact.' : 'Still speeding up.'}</p>`;
      },
    };
  },
};
