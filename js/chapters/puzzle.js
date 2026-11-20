// Chapter 1: the puzzle. A cat let go upside down, with no spin at all, turns over and lands on its feet.
// Its angular momentum is zero at release and nothing outside can change it in the air, yet it turns.
// The cat here is driven by fall.js: a two-half body whose shape changes (a bend swept around the spine, plus
// tucking and stretching legs) are fed through the conservation law, step by step. The readout shows the total
// angular momentum the simulation keeps (zero, to rounding) and the two halves' equal and opposite spins.
// Timing: in high-speed films from a 2026 Yamaguchi University study, cats dropped from about 1 m landed
// roughly 0.32-0.34 s after release, already upright, with the front half finishing its turn first.
// The model cat takes 0.3 s to turn over.
import { THREE, M } from '../kit.js';
import { makeCat, poseFrom, spinArrow, COL, SCALE, G, DEG, clamp, smooth } from '../cat.js';
import { rightingRun, annotate, rollAt, upright } from '../fall.js';

export const RIGHT_T = 0.3; // seconds the model cat takes to turn over
const Y_LAND = 0.78;          // centre-of-mass height (scene units) when the paws touch

export default {
  id: 'puzzle',
  short: 'The puzzle',
  title: 'A cat that turns over on nothing',
  subtitle: 'Dropped upside down with no spin, a cat still lands on its feet. For a while that looked impossible.',
  view: { pos: [5.5, 4.2, 9], target: [0.4, 2.9, 0] },
  learn: `<p>Hold a cat upside down, let go without any twist, and in a fraction of a second it is the right way up with its feet under it. The question sounds childish, but in 1894 it started an argument among physicists in Paris.</p>
    <p>The trouble is <b>angular momentum</b>: the amount of spin a body has. With nothing to push against, a spinning body keeps its spin and a still body stays without spin. A cat dropped with none has none, and air resistance is far too weak to help. A cat cannot grab the air to turn, any more than you can lift yourself by your shoelaces.</p>
    <p>In a 2026 study, cats let go from about a metre were down about a third of a second later, already the right way up. So how does it end up turned 180°? The answer is that it <b>changes shape</b>. A body that can bend can end up facing a new way even though its total spin stays at zero the whole time. The next two chapters take the trick apart.</p>
    <p class="tip"><b>Try it:</b> press <b>Drop</b>, slow it down, and drag the timeline. Watch the readout: the front half and the back half spin in opposite directions, and the total stays at zero. Then lower the drop until the cat runs out of time.</p>
    <p class="note">This cat is a computer model: two body halves and four legs. Its movements are a simplified version of what films of real cats show, but its physics is computed honestly.</p>`,
  terms: [
    { t: 'Angular momentum', d: 'How much spin a body has. With no outside twist, it cannot change.' },
    { t: 'Righting reflex', d: 'The automatic movement an animal makes to turn itself the right way up.' },
    { t: 'Chronophotography', d: 'A series of photographs taken at quick, regular intervals to study movement.' },
  ],
  defaults: { h: 1.2, play: true, slow: 0.25, scrub: 0.5, strobe: false },
  controls: [
    { key: 'go', type: 'buttons', label: 'Let go', items: [{ label: 'Drop the cat', act: (s, inst) => { s.play = true; inst.restart(); } }] },
    { key: 'h', type: 'range', label: 'Drop height', min: 0.15, max: 2, step: 0.05, fmt: (v) => `${(v * 100).toFixed(0)} cm` },
    { key: 'slow', type: 'seg', label: 'Speed', options: [{ v: 1, label: 'Real time' }, { v: 0.25, label: '¼ speed' }, { v: 0.1, label: '1/10' }] },
    { key: 'play', type: 'toggle', label: 'Play (off: drag the timeline)' },
    { key: 'scrub', type: 'range', label: 'Timeline', min: 0, max: 1, step: 0.001, fmt: (v, s) => `${(v * 1000 * timeline(s).total - 250).toFixed(0)} ms`, hint: 'Turn Play off and drag to step through the fall.' },
    { key: 'strobe', type: 'toggle', label: 'Chronophotograph', hint: 'Show the cat every 50 ms, like a photographic plate exposed again and again.' },
  ],
  quiz: [
    { q: 'A cat is let go upside down with no spin. What is its total angular momentum while it falls?', options: ['It grows as it turns', 'Zero the whole time', 'It flips sign halfway', 'It depends on its weight'], answer: 1, why: 'With nothing outside to twist it, the total spin it starts with (none) is kept all the way down.' },
    { q: 'How can it turn over without any spin?', options: ['It pushes on the air', 'It changes its shape while it falls', 'Gravity turns it', 'It cannot, it is a myth'], answer: 1, why: 'A body that bends and twists can change the way it faces while its total spin stays zero.' },
    { q: 'Why does a very short drop go badly in the model?', options: ['The cat falls too fast', 'There is not enough time to finish turning', 'Air resistance is too strong', 'Cats cannot see the floor'], answer: 1, why: 'The turn takes a few tenths of a second. From a small height the cat lands before it has finished.' },
  ],
  reel: [
    { ms: 5200, caption: 'Drop a cat upside down with no spin, and it still lands on its feet.', set: { h: 1.2, slow: 0.25, play: true, strobe: false }, act: (s, inst) => inst.restart(0.05), view: { pos: [6, 4.4, 9.5], target: [0, 2.8, 0] }, spin: 0.25 },
    { ms: 5200, caption: 'But physics says its spin must stay at zero. So how does it turn?', set: { h: 1.2, slow: 0.1, play: true, strobe: true }, act: (s, inst) => inst.restart(0.08), view: { pos: [3.5, 4.2, 10.5], target: [0, 3.0, 0] }, spin: 0 },
  ],
  build({ stage, s }) {
    stage.floor.visible = true;
    stage.setShift(0.12, 0);
    const root = new THREE.Group(); stage.root.add(root);
    const run = annotate(rightingRun(1));
    const cat = makeCat('cat'); root.add(cat);
    const arF = spinArrow(COL.front), arB = spinArrow(COL.back);
    arF.position.x = 0.45; arB.position.x = -0.45; cat.add(arF, arB);
    const ghosts = Array.from({ length: 8 }, () => { const g = makeCat('cat', { opacity: 0.28 }); g.visible = false; root.add(g); return g; });
    // a ruler, and the hand that lets go
    const ruler = new THREE.Group(); root.add(ruler);
    const rulerMat = M.glow(0x56607a);
    const tickLbls = [];
    for (let i = 0; i <= 20; i++) { const t = new THREE.Mesh(new THREE.BoxGeometry(i % 5 ? 0.12 : 0.28, 0.015, 0.015), rulerMat); t.position.set(2.6, (i / 10) * SCALE, 0); ruler.add(t); if (i % 5 === 0) tickLbls.push(stage.label(`${i * 10} cm`, [3.3, (i / 10) * SCALE, 0], ruler, 'dim')); }
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 2 * SCALE, 0.03), rulerMat); bar.position.set(2.6, 1 * SCALE, 0); ruler.add(bar);
    const flag = stage.label('', [0, 0, 0], root, 'hot'); flag.visible = false;
    let t = -0.25, smp = null, landed = false;

    function stateAt(tt, st) {
      const Tf = fallT(st.h), y0 = Y_LAND + st.h * SCALE;
      if (tt <= 0) return { y: y0, u: 0, phase: 'held' };
      if (tt < Tf) return { y: y0 - 0.5 * G * tt * tt * SCALE, u: tt / RIGHT_T, phase: 'fall' };
      return { y: Y_LAND, u: Tf / RIGHT_T, phase: 'land', after: tt - Tf };
    }
    function place(c, tt, st) {
      const S = stateAt(tt, st);
      const sm = poseFrom(c, run, Math.min(1, S.u));
      let y = S.y;
      if (S.phase === 'land' && S.u >= 1) { const a = S.after; y -= Math.sin(clamp(a / 0.18, 0, 1) * Math.PI) * 0.16; }
      c.position.set(0, y, 0);
      return { ...S, sm };
    }
    return {
      restart(scrub) { t = scrub !== undefined ? scrub * timelineOf(s).total - 0.25 : -0.25; },
      update(dt, st) {
        const T = timelineOf(st);
        if (st.play) { t += dt * st.slow; if (t > T.total - 0.25) t = -0.25; st.scrub = (t + 0.25) / T.total; }
        else t = st.scrub * T.total - 0.25;
        const S = place(cat, t, st); smp = S;
        landed = S.phase === 'land';
        arF.set(S.phase === 'fall' ? S.sm.spin[0] : 0, 0.25); arB.set(S.phase === 'fall' ? S.sm.spin[1] : 0, 0.25);
        const short = S.phase === 'land' && S.u < 1;
        flag.visible = short || (S.phase === 'land' && S.after < 0.6);
        flag.element.textContent = short ? 'Ran out of height: landed mid-turn' : 'Feet first';
        flag.element.className = 'lbl ' + (short ? 'hot' : 'ok');
        flag.position.set(0, Y_LAND + 1.4, 0);
        ghosts.forEach((g, i) => {
          g.visible = st.strobe;
          if (!st.strobe) return;
          const tg = i * 0.05; // every 50 ms
          if (tg > T.fall) { g.visible = false; return; }
          place(g, tg, st);
          g.position.x = 0;
        });
      },
      readout(st) {
        if (!smp) return '';
        const T = timelineOf(st), turned = Math.abs(rollAt(run, Math.min(1, smp.u))[0] - run[0].roll[0]) * DEG;
        const ms = (Math.max(0, t) * 1000).toFixed(0);
        const head = smp.phase === 'held' ? 'Held upside down' : smp.phase === 'fall' ? (smp.u < 1 ? 'Turning…' : 'Upright, legs out') : smp.u >= 1 ? 'Landed on its feet' : 'Landed before it finished';
        const L = smp.phase === 'fall' ? smp.sm.resid : 0;
        return `<div class="big">${head}</div>
          <div class="row"><span>Time since release</span><b>${smp.phase === 'held' ? '0' : ms} ms</b></div>
          <div class="row"><span>Turned so far</span><b>${turned.toFixed(0)}° of 180°</b></div>
          <div class="row"><span>Fall time from ${(st.h * 100).toFixed(0)} cm</span><b>${(T.fall * 1000).toFixed(0)} ms</b></div>
          <div class="row"><span>Front half spin</span><b style="color:#ff7a59">${smp.phase === 'fall' ? fmtL(smp.sm.spin[0]) : '0.000'}</b></div>
          <div class="row"><span>Back half spin</span><b style="color:#8ef0ff">${smp.phase === 'fall' ? fmtL(smp.sm.spin[1]) : '0.000'}</b></div>
          <div class="row"><span>Total angular momentum</span><b>${L < 5e-4 ? '0.000' : L.toFixed(3)}</b></div>
          <p class="r-say">Model units. The two halves always cancel.</p>`;
      },
    };
  },
};

const fmtL = (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(3);
const fallT = (h) => Math.sqrt((2 * h) / G);
function timelineOf(st) { const fall = fallT(st.h); return { fall, total: 0.25 + fall + 0.7 }; }
function timeline(st) { return timelineOf(st); }
