// Chapter 6: the same trick elsewhere. Any body that can change shape can reorient itself with zero angular
// momentum: astronauts in free fall, divers and gymnasts in the air, and robots built to land the right way up.
// Each figure here runs the bend-and-twist move of chapter 3 through the same simulation (fall.js), dressed
// differently; the body is still the two-half model, so the figures are illustrations of the principle.
// Lévy (1894) already described a person turning in a vacuum; a 1962 US Air Force report listed a "cat reflex"
// among astronaut self-rotation methods; Kane extended his cat model to astronauts for NASA (1970). Robots:
// Kawamura's robot cat (2014), Mini Cheetah (Kurtz et al. 2021).
import { THREE, M } from '../kit.js';
import { makeCat, poseFrom, COL, DEG, smooth } from '../cat.js';
import { simulate, annotate, rollAt, qaxis } from '../fall.js';

const WHO = {
  astro: { n: 'Astronaut', bend: 100, say: 'In free fall an astronaut can turn round without touching anything, by bending at the hips and circling the bend, or by swinging the arms in loops.' },
  diver: { n: 'Diver', bend: 70, say: 'Divers and gymnasts can start a twist in mid-air by moving their arms and hips unevenly. The total spin stays the same; how it is shared out changes.' },
  robot: { n: 'Robot', bend: 100, say: 'Engineers have built falling-cat robots and legged robots that turn in mid-air the same way, so they land on their feet.' },
  cat: { n: 'Cat', bend: 100, say: 'The original. A real cat mixes the bend, the leg tuck and a twist of its spine.' },
};
const runs = new Map();
const prog = (B) => (u) => ({ beta: B * smooth(u / 0.15) * (1 - smooth((u - 0.85) / 0.15)), phi: -2 * Math.PI * smooth((u - 0.15) / 0.7), psi: 0, ef: 1, eb: 1 });
const runFor = (b) => { if (!runs.has(b)) runs.set(b, annotate(simulate(prog(b / DEG), qaxis([1, 0, 0], Math.PI), 260))); return runs.get(b); };

export default {
  id: 'beyond',
  short: 'Astronauts, divers, robots',
  title: 'The same trick in space and in robots',
  subtitle: 'Anything that can change its shape can turn itself in mid-air. Please never drop a cat to test it.',
  view: { pos: [4.4, 3.2, 6], target: [0, 2.4, 0] },
  learn: `<p>The falling cat is not just a curiosity. Its physics applies to any body that can change shape with nothing to push against.</p>
    <p><b>Astronauts</b> floating in a spacecraft can turn to face a new way without touching a wall. In 1894 Maurice Lévy already described how a person in a vacuum could do it. A 1962 US Air Force report listed a “cat reflex” among ways for astronauts to turn, and Thomas Kane carried his cat model over to astronauts for NASA. Bending at the hips and circling the bend, or swinging the arms in big loops, turns the body the other way.</p>
    <p><b>Divers, trampolinists and gymnasts</b> do something related. A diver who leaves the board somersaulting with no twist can start twisting in the air by dropping one arm and swinging the hips. The total spin is fixed at take-off, but it can be shared out differently.</p>
    <p><b>Robots</b> use it too. In 2014 a Japanese team built a robot cat that turned over in mid-air, and in 2021 researchers taught the Mini Cheetah robot dog to twist in mid-air and land on its feet. Mathematicians, meanwhile, still use the falling cat as a textbook example of a <b>geometric phase</b>.</p>
    <p class="tip"><b>Animal welfare:</b> never drop or throw a cat to see this. Falls hurt cats, even from low heights, and stressed or old cats may not turn in time. Every motion in this box is a simulation.</p>`,
  terms: [
    { t: 'Self-rotation', d: 'Turning your body to face a new way with no outside push, by changing shape.' },
    { t: 'Free fall', d: 'Falling with only gravity acting, as astronauts in orbit are all the time.' },
    { t: 'Twisting somersault', d: 'A somersault with a twist about the long axis of the body, which a diver can start in mid-air.' },
  ],
  defaults: { who: 'astro', u: 0, play: true },
  controls: [
    { key: 'who', type: 'seg', label: 'Who', options: Object.entries(WHO).map(([v, w]) => ({ v, label: w.n })) },
    { key: 'play', type: 'toggle', label: 'Play' },
    { key: 'u', type: 'range', label: 'Step through', min: 0, max: 1, step: 0.001, fmt: (v) => `${(v * 100).toFixed(0)}%`, hint: 'Turn Play off to drag.' },
  ],
  quiz: [
    { q: 'Can an astronaut floating in the middle of a cabin turn round without touching anything?', options: ['No, never', 'Yes, by changing shape in a loop', 'Only by blowing air', 'Only with a jetpack'], answer: 1, why: 'Like the cat, a loop of shape changes leaves the body facing a new way with zero total spin.' },
    { q: 'A diver leaves the board with no twist. Can they start twisting in the air?', options: ['Yes, by moving arms and hips unevenly', 'No, it is fixed at take-off', 'Only if they push off the water', 'Only on the way up'], answer: 0, why: 'The total spin is fixed, but asymmetric movements can share it out so that a twist appears.' },
    { q: 'What should you never do?', options: ['Watch a slow-motion video of a cat', 'Drop a cat to test the reflex', 'Read about angular momentum', 'Build a robot cat'], answer: 1, why: 'Falls injure cats. The model is here so that no cat has to be dropped.' },
  ],
  reel: [
    { ms: 5400, caption: 'Astronauts, divers and robots use the same trick. And please: never drop a cat to test it.', set: { who: 'astro', play: false }, anim: { u: [0, 1] }, view: { pos: [4.4, 3.2, 6], target: [0, 2.4, 0] }, spin: 0.4 },
  ],
  build({ stage, s }) {
    stage.floor.visible = false;
    stage.setShift(document.body.classList.contains('gb-reel') ? 0 : 0.12, 0);
    const root = new THREE.Group(); root.position.y = 2.4; stage.root.add(root);
    const figs = { astro: makeCat('astro'), diver: makeCat('diver'), robot: makeCat('robot'), cat: makeCat('cat') };
    Object.values(figs).forEach((f) => root.add(f));
    // a few stars for the astronaut, a pool for the diver, a floor tile for the robot
    const stars = new THREE.Group(); root.add(stars);
    const sg = new THREE.SphereGeometry(0.025, 6, 4), sm = M.glow(0xffffff);
    for (let i = 0; i < 160; i++) { const st = new THREE.Mesh(sg, sm); const a = i * 2.39996, z = 1 - (i / 160) * 2, r = Math.sqrt(1 - z * z) * 14; st.position.set(Math.cos(a) * r, z * 14, Math.sin(a) * r); stars.add(st); }
    const pool = new THREE.Mesh(new THREE.BoxGeometry(8, 0.05, 6), M.clear(0x2a7bd7, 0.5)); pool.position.y = -2.3; root.add(pool);
    const pad = new THREE.Mesh(new THREE.BoxGeometry(5, 0.08, 5), M.matte(0x30384a)); pad.position.y = -2.3; root.add(pad);
    let u = 0, last = null, run = null;
    return {
      update(dt, st) {
        const w = WHO[st.who] || WHO.astro;
        run = runFor(w.bend);
        if (st.play) { u += dt / 4.5; if (u > 1.3) u = 0; st.u = Math.min(1, u); } else u = st.u;
        Object.entries(figs).forEach(([k, f]) => { f.visible = k === st.who; });
        last = poseFrom(figs[st.who], run, Math.min(1, u));
        stars.visible = st.who === 'astro'; pool.visible = st.who === 'diver'; pad.visible = st.who === 'robot' || st.who === 'cat';
        stars.rotation.y += dt * 0.01;
      },
      readout(st) {
        if (!run || !last) return '';
        const w = WHO[st.who], r = rollAt(run, Math.min(1, u)), r0 = run[0].roll;
        return `<div class="big">${w.n}</div><p class="r-say">${w.say}</p>
          <div class="row"><span>Has turned</span><b>${Math.abs((r[0] - r0[0]) * DEG).toFixed(0)}°</b></div>
          <div class="row"><span>Total angular momentum</span><b>${last.resid < 5e-4 ? '0.000' : last.resid.toFixed(3)}</b></div>
          <p class="r-say">Computed with the same two-part body as the cat, so the figure is an illustration.</p>`;
      },
    };
  },
};
