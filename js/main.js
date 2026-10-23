import { BarbellSceneController } from './barbell-scene.js';
import { FloorCutawayScene } from './floor-scene.js';

/* ==========================================================================
   DATA DICTIONARIES: FLOOR ZONES, PROGRAMS, COACHES
   ========================================================================== */

const FLOOR_ZONES_DATA = {
  racks: {
    code: 'ZONE 01 // SECTOR NORTH-WEST',
    title: 'Power Racks',
    coords: 'COORDS: X +06.40m / Y +00.00m / Z -04.20m · AREA: 185 m²',
    capacityText: '06 / 08 PLATFORMS ACTIVE (75%)',
    capacityPct: 75,
    stripeColor: '#D92626',
    equipment: [
      ['RACK SPEC', '8× Eleiko Prestera Combo Racks'],
      ['BARBELLS', 'IWF 20kg Power & Weightlifting Bars'],
      ['TRANSDUCERS', 'GymAware VBT Optical Tethers Active'],
      ['PLATES', '3,800 kg Calibrated Steel + Bumpers']
    ],
    etiquette:
      'Strip all bars to 20kg empty shaft upon completion. Re-rack bumper plates in strict IWF chromatic order (25kg Red innermost → 5kg White outermost). Chalk remains over the oak platform.'
  },
  freeweights: {
    code: 'ZONE 02 // SECTOR NORTH-EAST',
    title: 'Free Weights',
    coords: 'COORDS: X +14.80m / Y +00.00m / Z -03.80m · AREA: 210 m²',
    capacityText: '09 / 14 STATIONS ACTIVE (64%)',
    capacityPct: 64,
    stripeColor: '#0052CC',
    equipment: [
      ['DUMBBELLS', '2.5 kg – 75 kg Urethane & Raw Iron'],
      ['BENCHES', '6× Competition IPF Wide-Pad Benches'],
      ['SPECIALTY BARS', 'Kabuki Transformer, Duffalo & Trap Bars'],
      ['CABLE TOWERS', 'Dual-Stack 1:1 Ratio Heavy Pulleys']
    ],
    etiquette:
      'Return dumbbells to their exact laser-etched saddle number. Do not drop iron dumbbells on bare concrete expansion joints. Use spotter arms on all solo bench efforts above RPE 8.5.'
  },
  turf: {
    code: 'ZONE 03 // SECTOR SOUTH-LONGITUDINAL',
    title: 'Turf Track',
    coords: 'COORDS: X +00.00m / Y +00.00m / Z +04.60m · AREA: 160 m²',
    capacityText: '02 / 04 LANES ACTIVE (50%)',
    capacityPct: 50,
    stripeColor: '#008751',
    equipment: [
      ['TRACK SURFACE', '40m × 4m Mondo Acoustic Sprint Turf'],
      ['SLEDS', '4× Torque Tank & Rogue Dog Sleds'],
      ['STRONGMAN', '2× Competition Yokes, Farmers Handles'],
      ['ERGOMETERS', 'Concept2 RowErg, SkiErg & Echo Bikes']
    ],
    etiquette:
      'Northbound lanes reserved for loaded prowler pushes; southbound lanes for return carries and sprint acceleration. Unload sled horns completely after conditioning intervals.'
  },
  recovery: {
    code: 'ZONE 04 // SECTOR SOUTH-EAST',
    title: 'Recovery Lounge',
    coords: 'COORDS: X +18.20m / Y -00.45m / Z +05.10m · AREA: 115 m²',
    capacityText: '03 / 08 BAYS OCCUPIED (38%)',
    capacityPct: 38,
    stripeColor: '#F0B800',
    equipment: [
      ['COLD PLUNGE', '2× 4.0°C Ozone-Filtered Monolith Tubs'],
      ['THERMAL SAUNA', '92°C Finnish Cedar & Dark Slate Chamber'],
      ['COMPRESSION', '6× Normatec Pulse Pro Pneumatic Chairs'],
      ['DIAGNOSTICS', 'HRV & Blood Lactate Post-Session Desk']
    ],
    etiquette:
      'Mandatory cold shower rinse before entering the 4.0°C plunge to remove all magnesium carbonate chalk residue. Maximum contrast cycle duration: 15 minutes sauna / 4 minutes plunge.'
  }
};

const PROGRAMS_DOSSIER_DATA = {
  '01': {
    code: 'REF // STR-FDN-01',
    title: '01 // Strength Foundations',
    subtitle: 'SQUAT · BENCH PRESS · DEADLIFT // VELOCITY-REGULATED PERIODIZATION',
    summary:
      'Engineered for lifters seeking maximal absolute force production across the three powerlifts. Every top set is governed by linear position transducers to keep bar speed inside optimal neuromuscular adaptation zones.',
    specs: [
      ['BLOCK STRUCTURE', '4-Wk Accumulation → 4-Wk Transmutation → 4-Wk Realization'],
      ['PRIMARY METRIC', 'Estimated 1RM + Mean Concentric Velocity (m/s)'],
      ['EQUIPMENT', 'Eleiko IPF Power Bar (29mm Aggressive Knurl) + Calibrated Steel'],
      ['COACH RATIO', 'Max 6 Athletes per Platform Coach']
    ],
    schedule: 'MON / TUE / THU / SAT — 90 Minute Blocks'
  },
  '02': {
    code: 'REF // OLY-BBC-02',
    title: '02 // Barbell Club',
    subtitle: 'SNATCH & CLEAN & JERK // IWF TECHNICAL WEIGHTLIFTING',
    summary:
      'Dedicated Olympic weightlifting curriculum emphasizing first-pull posture, explosive triple extension, rapid third-pull turnover under the bar, and rock-solid overhead receiving mechanics.',
    specs: [
      ['BLOCK STRUCTURE', 'Positional Complexes → Hang Variations → Competition Singles'],
      ['PRIMARY METRIC', 'Peak Bar Velocity (>1.85 m/s) & Fixation Stability'],
      ['EQUIPMENT', 'IWF Needle-Bearing Bars (28mm Men / 25mm Women) + IWF Bumpers'],
      ['VIDEO TELEMETRY', 'High-Speed 240fps Bar-Path S-Curve Overlay']
    ],
    schedule: 'MON / TUE / WED / FRI / SAT — Coached Platform Sessions'
  },
  '03': {
    code: 'REF // CAL-CND-03',
    title: '03 // Calisthenics / Conditioning',
    subtitle: 'RELATIVE GYMNASTIC STRENGTH & ANAEROBIC WORK CAPACITY',
    summary:
      'Combines straight-arm and bent-arm weighted calisthenics (ring muscle-ups, front levers, +60kg weighted dips) with brutal alactic sled sprints and threshold ergometer intervals.',
    specs: [
      ['BLOCK STRUCTURE', 'Scapular Torque & Levers + Glycolytic Sled Intervals'],
      ['PRIMARY METRIC', 'Relative Pull/Dip Ratio (% BW) & 40m Sled Split Times'],
      ['EQUIPMENT', 'Competition Wood Rings, Dip Belts, 40m Turf Prowlers'],
      ['METABOLIC TARGET', 'VO2 Max > 58 ml/kg/min + Rapid HR Recovery']
    ],
    schedule: 'DAILY BLOCKS AT 06:30 / 12:30 / 18:30'
  },
  '04': {
    code: 'REF // ARM-HYP-04',
    title: '04 // Structural Armor',
    subtitle: 'MYOFIBRILLAR HYPERTROPHY · TENDON DENSITY · POSTERIOR CHAIN',
    summary:
      'Designed to build dense contractile tissue and injury-proof joint architecture. Utilizes specialty cambered bars, heavy eccentric tempos, isometric yielding holds, and heavy yoke carries.',
    specs: [
      ['BLOCK STRUCTURE', 'Eccentric Overload (5s Lowering) + Myo-Rep Density Sets'],
      ['PRIMARY METRIC', 'Cross-Sectional Muscle Area & Isometric Mid-Thigh Pull (N)'],
      ['EQUIPMENT', 'Safety Squat Bar, Reverse Hyper, GHD, 400kg Strongman Yoke'],
      ['RECOVERY SYNC', 'Includes Post-Session Cold Plunge & Sauna Protocol']
    ],
    schedule: 'MON / WED / FRI / SUN — 75 Minute Sessions'
  }
};

const COACHES_DOSSIER_DATA = {
  '01': {
    id: 'DOS-01 // DIRECTORATE',
    name: 'MARCUS VANCE',
    role: 'Head of Strength & Force Diagnostics',
    totals: 'COMPETITION BESTS: SQUAT 295 KG · BENCH 192.5 KG · DEADLIFT 335 KG (822.5 KG TOTAL @ 100KG)',
    philosophy:
      'Strength is not an emotional state—it is applied physics. We measure joint moment arms, track bar speed to the hundredth of a meter per second, and add iron only when technical execution is indistinguishable at 95% from 70%.',
    credentials: [
      'M.Sc. Sports Biomechanics — ETH Zürich',
      '11× National Powerlifting Medalist & Head National Coach (2019–2024)',
      'Certified Strength & Conditioning Specialist (NSCA-CSCS*D)'
    ]
  },
  '02': {
    id: 'DOS-02 // BARBELL CLUB',
    name: 'ELENA ROSTOVA',
    role: 'Director of Barbell Club & Weightlifting',
    totals: 'COMPETITION BESTS: SNATCH 118 KG · CLEAN & JERK 146 KG · FRONT SQUAT 185 KG',
    philosophy:
      'The Olympic lifts reward precision under maximal acceleration. Our platform blocks dissect every millimeter of the pull so the barbell arrives overhead weightless and locked.',
    credentials: [
      'IWF Level 3 International Weightlifting Coach',
      'Former European Championship Finalist (-71kg Category)',
      'Lead Researcher in High-Speed Bar Trajectory Kinematics'
    ]
  },
  '03': {
    id: 'DOS-03 // CONDITIONING',
    name: 'SÖREN LINDQVIST',
    role: 'Lead Conditioning & Relative Strength Architect',
    totals: 'BENCHMARKS: +40 KG RING MUSCLE-UP · +90 KG PARALLEL DIP · 5:58.4 2000M ROW',
    philosophy:
      'True athletic armor requires both extreme relative leverage and the metabolic engine to repeat high-force output when blood lactate crosses 14 mmol/L.',
    credentials: [
      'M.Sc. Exercise Physiology — Karolinska Institutet',
      'Former Nordic Gymnastics & Tactical Conditioning Specialist',
      'Architect of the KILO 40m Turf Anaerobic Protocol'
    ]
  },
  '04': {
    id: 'DOS-04 // RECONSTRUCTION',
    name: 'DR. KENJI TAKAHASHI',
    role: 'Chief of Tissue Resilience & Structural Armor',
    totals: 'BENCHMARKS: 280 KG DEADLIFT · 240 KG SQUAT · 400 KG × 20M YOKE CARRY',
    philosophy:
      'Tendons and ligaments adapt to progressive mechanical tension, not passive rest. We bridge clinical orthopedic diagnostics with heavy eccentric barbell loading.',
    credentials: [
      'Doctor of Physical Therapy (DPT) & Orthopedic Manual Specialist',
      'Force-Plate Asymmetry & Return-to-Platform Lead',
      'Published Author on Supramaximal Eccentric Tendon Remodeling'
    ]
  }
};

/* ==========================================================================
   OPTIONAL WEB AUDIO API MECHANICAL BARBELL CLANK SYNTHESIZER
   ========================================================================== */
class BarbellSoundEngine {
  constructor() {
    this.enabled = false;
    this.ctx = null;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled && !this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.enabled) {
      this.playClank(180);
    }
    return this.enabled;
  }

  playClank(weight = 50) {
    if (!this.enabled || !this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    // Low rubber thud + high metallic sleeve ring
    const oscLow = this.ctx.createOscillator();
    const gainLow = this.ctx.createGain();
    oscLow.type = 'triangle';
    const baseFreq = Math.max(48, 95 - weight * 0.22);
    oscLow.frequency.setValueAtTime(baseFreq, now);
    oscLow.frequency.exponentialRampToValueAtTime(24, now + 0.18);

    gainLow.gain.setValueAtTime(0.28, now);
    gainLow.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    oscLow.connect(gainLow);
    gainLow.connect(this.ctx.destination);
    oscLow.start(now);
    oscLow.stop(now + 0.23);

    // Metallic ring harmonic
    const oscMetal = this.ctx.createOscillator();
    const gainMetal = this.ctx.createGain();
    oscMetal.type = 'sine';
    oscMetal.frequency.setValueAtTime(640 + (weight % 7) * 45, now);
    oscMetal.frequency.exponentialRampToValueAtTime(310, now + 0.14);

    gainMetal.gain.setValueAtTime(0.09, now);
    gainMetal.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    oscMetal.connect(gainMetal);
    gainMetal.connect(this.ctx.destination);
    oscMetal.start(now);
    oscMetal.stop(now + 0.16);
  }
}

/* ==========================================================================
   PROCEDURAL MONOCHROME HIGH-CONTRAST COACH PORTRAIT RENDERER
   ========================================================================== */
function renderCoachPortraits() {
  const canvases = document.querySelectorAll('.coach-portrait-canvas');
  canvases.forEach((canvas) => {
    const id = canvas.getAttribute('data-portrait');
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Brutalist dark studio backdrop with subtle architectural grid
    ctx.fillStyle = '#141413';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(237, 236, 232, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Dramatic rim-lit geometric halo behind athlete silhouette
    const haloGrad = ctx.createRadialGradient(w * 0.5, h * 0.42, 10, w * 0.5, h * 0.42, 210);
    haloGrad.addColorStop(0, 'rgba(244, 243, 239, 0.35)');
    haloGrad.addColorStop(0.6, 'rgba(244, 243, 239, 0.08)');
    haloGrad.addColorStop(1, 'rgba(20, 20, 19, 0)');
    ctx.fillStyle = haloGrad;
    ctx.fillRect(0, 0, w, h);

    // Distinct anatomical/editorial brutalist portrait composition per coach
    ctx.save();
    const cx = w * 0.5;

    // Traps & Shoulders Monolith Silhouette
    ctx.fillStyle = '#252523';
    ctx.beginPath();
    ctx.moveTo(cx - 175, h);
    ctx.quadraticCurveTo(cx - 155, h * 0.68, cx - 65, h * 0.62);
    ctx.lineTo(cx + 65, h * 0.62);
    ctx.quadraticCurveTo(cx + 155, h * 0.68, cx + 175, h);
    ctx.closePath();
    ctx.fill();

    // High-contrast key light side of torso/shoulders
    ctx.fillStyle = '#dedcd6';
    ctx.beginPath();
    if (id === '01' || id === '03') {
      ctx.moveTo(cx - 65, h * 0.62);
      ctx.quadraticCurveTo(cx - 145, h * 0.69, cx - 165, h);
      ctx.lineTo(cx - 15, h);
      ctx.lineTo(cx - 10, h * 0.62);
    } else {
      ctx.moveTo(cx + 65, h * 0.62);
      ctx.quadraticCurveTo(cx + 145, h * 0.69, cx + 165, h);
      ctx.lineTo(cx + 15, h);
      ctx.lineTo(cx + 10, h * 0.62);
    }
    ctx.closePath();
    ctx.fill();

    // Neck column
    ctx.fillStyle = '#8e8d88';
    ctx.fillRect(cx - 32, h * 0.48, 64, h * 0.16);

    // Sculpted Head & Jawline (Chiaroscuro lighting)
    ctx.fillStyle = '#2a2a28';
    ctx.beginPath();
    ctx.ellipse(cx, h * 0.37, 62, 78, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lit half of face (high-contrast Swiss photo-stencil aesthetic)
    ctx.fillStyle = '#f2f0ea';
    ctx.beginPath();
    ctx.ellipse(
      cx + (id === '02' ? 6 : -6),
      h * 0.37,
      58,
      74,
      0,
      id === '02' || id === '04' ? -Math.PI / 2 : Math.PI / 2,
      id === '02' || id === '04' ? Math.PI / 2 : (Math.PI * 3) / 2
    );
    ctx.fill();

    // Eye shadow bar (intense brutalist editorial gaze)
    ctx.fillStyle = '#111111';
    ctx.fillRect(cx - 44, h * 0.33, 88, 12);

    // Barbell shaft resting across traps (for Coach 01 & 02) or Gymnastic Rings / Telemetry Crosshairs
    ctx.strokeStyle = '#f4f3ef';
    ctx.lineWidth = 4;
    if (id === '01' || id === '02') {
      ctx.beginPath();
      ctx.moveTo(0, h * 0.64);
      ctx.lineTo(w, h * 0.64);
      ctx.stroke();
    } else {
      // Biometric targeting reticle
      ctx.strokeStyle = 'rgba(244, 243, 239, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, h * 0.38, 105, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Halftone scanline overlay
    ctx.fillStyle = 'rgba(17, 17, 17, 0.22)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1.5);
    }

    ctx.restore();
  });
}

/* ==========================================================================
   MAIN APPLICATION INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const soundEngine = new BarbellSoundEngine();

  // 1. Initialize Lenis Smooth Inertial Scroll + GSAP ScrollTrigger Sync
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.12,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      lenis.on('scroll', window.ScrollTrigger.update);
    }
  }

  // DOM References for Stage A Barbell Load Telemetry
  const weightNumberEl = document.getElementById('barbell-weight-number');
  const weightLbsEl = document.getElementById('barbell-weight-lbs');
  const weightDescEl = document.getElementById('barbell-weight-desc');
  const stateBadgeEl = document.getElementById('barbell-state-badge');
  const navWeightReadout = document.getElementById('nav-weight-readout');
  const heroScrollPctEl = document.getElementById('hero-scroll-pct');
  const activePlatesFormulaEl = document.getElementById('active-plates-formula');
  const stagePills = document.querySelectorAll('.stage-pill');

  const plateChips = {
    0: document.getElementById('chip-5kg'),
    1: document.getElementById('chip-10kg'),
    2: document.getElementById('chip-15kg'),
    3: document.getElementById('chip-20kg'),
    4: document.getElementById('chip-25kg')
  };

  // 2. Instantiate Stage A: 3D Barbell Scene
  const barbellCanvas = document.getElementById('barbell-canvas');
  const chalkCanvas = document.getElementById('chalk-canvas');

  const barbellScene = new BarbellSceneController({
    canvas: barbellCanvas,
    chalkCanvas,
    onPlateLock: (weight, stageIdx) => {
      soundEngine.playClank(weight);
    }
  });

  // Update Hero Readout UI based on Barbell State
  function updateHeroBarbellUI(progress) {
    barbellScene.setScrollProgress(progress);

    const w = barbellScene.currentWeight;
    const lbs = (w * 2.20462).toFixed(1);
    const pct = Math.round(progress * 100)
      .toString()
      .padStart(3, '0');

    weightNumberEl.textContent = w;
    weightLbsEl.textContent = `${lbs} LBS`;
    navWeightReadout.textContent = `${w} KG`;

    // Stage descriptions & badges
    let desc = '20 kg / Empty Olympic Bar (Men’s 28mm)';
    let badge = 'EMPTY BAR';
    let formula = 'STACK: [ BAR 20KG ]';
    let activePillWeight = 20;

    if (w >= 175) {
      desc = '180 kg / Fully Loaded Competition Stack (+2×25kg Red & Collars)';
      badge = 'FULLY LOADED // 180 KG';
      formula = 'STACK: [25][20][15][10][5] ══ 20KG ══ [5][10][15][20][25] + COLLARS';
      activePillWeight = 180;
    } else if (w >= 115) {
      desc = `${w} kg / Heavy Block (+2×20kg Blue IWF Bumpers Locked)`;
      badge = 'STAGE 04 // +20KG BLUE';
      formula = 'STACK: [20][15][10][5] ══ 20KG ══ [5][10][15][20]';
      activePillWeight = 120;
    } else if (w >= 75) {
      desc = `${w} kg / Working Load (+2×15kg Yellow IWF Bumpers Locked)`;
      badge = 'STAGE 03 // +15KG YELLOW';
      formula = 'STACK: [15][10][5] ══ 20KG ══ [5][10][15]';
      activePillWeight = 80;
    } else if (w >= 45) {
      desc = `${w} kg / Warmup Build (+2×10kg Green IWF Bumpers Locked)`;
      badge = 'STAGE 02 // +10KG GREEN';
      formula = 'STACK: [10][5] ══ 20KG ══ [5][10]';
      activePillWeight = 50;
    } else if (w >= 28) {
      desc = `${w} kg / Technical Primer (+2×5kg White IWF Bumpers Locked)`;
      badge = 'STAGE 01 // +5KG WHITE';
      formula = 'STACK: [5] ══ 20KG ══ [5]';
      activePillWeight = 30;
    }

    weightDescEl.textContent = desc;
    stateBadgeEl.textContent = badge;
    activePlatesFormulaEl.textContent = formula;
    heroScrollPctEl.textContent = `${pct}% — ${badge}`;

    stagePills.forEach((pill) => {
      const targetW = Number(pill.getAttribute('data-target-weight'));
      pill.classList.toggle('active', targetW === activePillWeight);
    });

    // Highlight loaded plate chips in the bottom bar
    const thresholds = [0.16, 0.36, 0.56, 0.76, 0.94];
    thresholds.forEach((t, idx) => {
      if (plateChips[idx]) {
        plateChips[idx].classList.toggle('loaded', progress >= t);
      }
    });
  }

  // Bind GSAP ScrollTrigger to Hero Runway (#home)
  const heroRunway = document.getElementById('home');
  if (window.gsap && window.ScrollTrigger && heroRunway) {
    window.ScrollTrigger.create({
      trigger: heroRunway,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.25,
      onUpdate: (self) => {
        updateHeroBarbellUI(self.progress);
      }
    });
  }

  // Clickable Weight Stage Pills (20kg, 30kg, 50kg, 80kg, 120kg, 180kg)
  const stageProgressMap = {
    20: 0.0,
    30: 0.21,
    50: 0.41,
    80: 0.61,
    120: 0.81,
    180: 1.0
  };

  stagePills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const targetWeight = Number(pill.getAttribute('data-target-weight'));
      const targetP = stageProgressMap[targetWeight] ?? 0;

      // Immediately update the 3D barbell & UI AND scroll to matching position in runway
      updateHeroBarbellUI(targetP);
      barbellScene.spawnChalkBurst2D([0.28, 0.72], 0.95);
      soundEngine.playClank(targetWeight);

      if (heroRunway) {
        const runwayTop = heroRunway.offsetTop;
        const scrollable = heroRunway.offsetHeight - window.innerHeight;
        const targetScrollY = runwayTop + scrollable * targetP;
        if (lenis) {
          lenis.scrollTo(targetScrollY, { duration: 0.9 });
        } else {
          window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
        }
      }
    });
  });

  // Drop Bar & Chalk Burst Button
  const dropBarBtn = document.getElementById('btn-drop-bar');
  if (dropBarBtn) {
    dropBarBtn.addEventListener('click', () => {
      barbellScene.triggerBarDrop();
      barbellScene.spawnChalkBurst2D([0.22, 0.5, 0.78], 1.45);
      soundEngine.playClank(barbellScene.currentWeight);
    });
  }

  // Sound Effects Toggle Button in Header
  const sfxToggleBtn = document.getElementById('btn-sfx-toggle');
  const sfxLabel = document.getElementById('sfx-label');
  if (sfxToggleBtn) {
    sfxToggleBtn.addEventListener('click', () => {
      const isOn = soundEngine.toggle();
      sfxToggleBtn.setAttribute('aria-pressed', String(isOn));
      sfxLabel.textContent = isOn ? 'SFX: ON' : 'SFX: OFF';
    });
  }

  // 3. Instantiate Stage B: 3D Floor Architectural Cutaway Scene
  const floorCanvas = document.getElementById('floor-canvas');
  const floorViewportBox = document.getElementById('floor-viewport-box');
  const hotspotElements = {
    racks: document.getElementById('hotspot-racks'),
    freeweights: document.getElementById('hotspot-freeweights'),
    turf: document.getElementById('hotspot-turf'),
    recovery: document.getElementById('hotspot-recovery')
  };

  function updateFloorTelemetryCard(zoneKey) {
    const data = FLOOR_ZONES_DATA[zoneKey];
    if (!data) return;

    document.getElementById('zone-code').textContent = data.code;
    document.getElementById('zone-title').textContent = data.title;
    document.getElementById('zone-coords').textContent = data.coords;
    document.getElementById('zone-capacity-text').textContent = data.capacityText;

    const capBar = document.getElementById('zone-capacity-bar');
    capBar.style.width = `${data.capacityPct}%`;
    capBar.style.backgroundColor = data.stripeColor;

    document.getElementById('zone-card-stripe').style.backgroundColor = data.stripeColor;
    document.getElementById('zone-etiquette-text').textContent = data.etiquette;

    const eqList = document.getElementById('zone-equipment-list');
    eqList.innerHTML = data.equipment
      .map(([k, v]) => `<li><span>${k}</span><strong>${v}</strong></li>`)
      .join('');

    // Sync active states on hotspot nodes & bottom quick tabs
    Object.entries(hotspotElements).forEach(([k, el]) => {
      if (el) el.classList.toggle('active', k === zoneKey);
    });
    document.querySelectorAll('.zone-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.getAttribute('data-zone-select') === zoneKey);
    });
  }

  const floorScene = new FloorCutawayScene({
    canvas: floorCanvas,
    viewportBox: floorViewportBox,
    hotspotElements,
    onSelectZone: (zoneKey) => {
      updateFloorTelemetryCard(zoneKey);
    }
  });

  // Bind Hotspot Node Hover & Click Events
  Object.entries(hotspotElements).forEach(([zoneKey, btn]) => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      floorScene.focusZone(zoneKey);
      soundEngine.playClank(60);
    });
    btn.addEventListener('mouseenter', () => {
      floorScene.focusZone(zoneKey);
    });
  });

  // Bind Bottom Quick Zone Tabs
  document.querySelectorAll('.zone-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const zoneKey = tab.getAttribute('data-zone-select');
      floorScene.focusZone(zoneKey);
      soundEngine.playClank(60);
    });
  });

  // Bind Camera View Preset Buttons
  document.querySelectorAll('[data-cam-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-cam-view]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-cam-view');
      floorScene.setCameraView(mode);
    });
  });

  // Wireframe Toggle Button
  const wireframeBtn = document.getElementById('btn-floor-wireframe');
  if (wireframeBtn) {
    wireframeBtn.addEventListener('click', () => {
      const isWire = floorScene.toggleWireframe();
      wireframeBtn.textContent = isWire ? 'WIREFRAME: ON' : 'WIREFRAME: OFF';
      wireframeBtn.classList.toggle('active', isWire);
    });
  }

  // 4. Interactive Olympic Barbell Plate Calculator (#assess)
  const calcInput = document.getElementById('calc-weight-input');
  const calcMinusBtn = document.getElementById('calc-minus-btn');
  const calcPlusBtn = document.getElementById('calc-plus-btn');
  const calcSleeveGraphic = document.getElementById('calc-sleeve-graphic');
  const calcPlateSummary = document.getElementById('calc-plate-summary');
  const presetChips = document.querySelectorAll('.calc-preset-chip');

  const IWF_DENOMINATIONS = [
    { weight: 25, label: '25', name: '25KG RED', bg: '#D92626', fg: '#FFFFFF', h: 74, w: 24 },
    { weight: 20, label: '20', name: '20KG BLUE', bg: '#0052CC', fg: '#FFFFFF', h: 70, w: 21 },
    { weight: 15, label: '15', name: '15KG YEL', bg: '#F0B800', fg: '#111111', h: 64, w: 19 },
    { weight: 10, label: '10', name: '10KG GRN', bg: '#008751', fg: '#FFFFFF', h: 58, w: 17 },
    { weight: 5, label: '5', name: '5KG WHT', bg: '#F4F3EF', fg: '#111111', h: 48, w: 15 },
    { weight: 2.5, label: '2.5', name: '2.5KG BLK', bg: '#1E1E1D', fg: '#FFFFFF', h: 38, w: 13 }
  ];

  function updatePlateCalculator(rawWeight) {
    const targetWeight = Math.max(20, Math.min(340, Math.round(rawWeight / 5) * 5));
    calcInput.value = targetWeight;

    let perSideRemaining = (targetWeight - 20) / 2;
    const platesPerSide = [];
    const summaryCounts = [];

    IWF_DENOMINATIONS.forEach((denom) => {
      let count = 0;
      while (perSideRemaining >= denom.weight - 0.01) {
        platesPerSide.push(denom);
        perSideRemaining -= denom.weight;
        count++;
      }
      if (count > 0) {
        summaryCounts.push(`${count}×${denom.name}`);
      }
    });

    if (platesPerSide.length === 0) {
      calcSleeveGraphic.innerHTML = `<span style="position:relative;z-index:2;background:#111;color:#fff;padding:4px 10px;font-family:var(--font-mono);font-size:0.72rem;">EMPTY 20KG OLYMPIC SHAFT</span>`;
      calcPlateSummary.textContent = 'PER SIDE: NO PLATES (EMPTY 20KG BAR)';
    } else {
      calcSleeveGraphic.innerHTML = platesPerSide
        .map(
          (p) =>
            `<div class="visual-plate-block" style="height:${p.h}px;width:${p.w}px;background:${p.bg};color:${p.fg};">${p.label}</div>`
        )
        .join('');
      calcPlateSummary.textContent = `PER SIDE: ${summaryCounts.join(' + ')}`;
    }

    // Update Warmup Ramp Percentages
    document.getElementById('w-50').textContent = `${Math.max(20, Math.round((targetWeight * 0.5) / 2.5) * 2.5)} KG`;
    document.getElementById('w-70').textContent = `${Math.max(20, Math.round((targetWeight * 0.7) / 2.5) * 2.5)} KG`;
    document.getElementById('w-85').textContent = `${Math.max(20, Math.round((targetWeight * 0.85) / 2.5) * 2.5)} KG`;
    document.getElementById('w-100').textContent = `${targetWeight} KG`;

    presetChips.forEach((chip) => {
      chip.classList.toggle('active', Number(chip.getAttribute('data-calc-preset')) === targetWeight);
    });
  }

  if (calcInput) {
    updatePlateCalculator(140);
    calcInput.addEventListener('change', () => updatePlateCalculator(Number(calcInput.value)));
    calcMinusBtn.addEventListener('click', () => updatePlateCalculator(Number(calcInput.value) - 10));
    calcPlusBtn.addEventListener('click', () => updatePlateCalculator(Number(calcInput.value) + 10));
    presetChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        updatePlateCalculator(Number(chip.getAttribute('data-calc-preset')));
      });
    });
  }

  // 5. Programs Category Filtering
  const filterBtns = document.querySelectorAll('.prog-filter-btn');
  const programCards = document.querySelectorAll('.program-card');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');

      programCards.forEach((card) => {
        const cardCat = card.getAttribute('data-category');
        card.style.display = cat === 'all' || cardCat === cat ? 'flex' : 'none';
      });
    });
  });

  // 6. Render Monochrome Coach Portraits
  renderCoachPortraits();

  // 7. Brutalist Dossier Modal Controller (Programs, Coaches, Auth)
  const modalBackdrop = document.getElementById('dossier-modal');
  const modalRefCode = document.getElementById('modal-ref-code');
  const modalContentBody = document.getElementById('modal-content-body');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  function openModal(refCode, htmlContent) {
    modalRefCode.textContent = refCode;
    modalContentBody.innerHTML = htmlContent;
    modalBackdrop.hidden = false;
  }

  function closeModal() {
    modalBackdrop.hidden = true;
  }

  modalCloseBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalBackdrop.hidden) closeModal();
  });

  // Program "View More" Buttons
  document.querySelectorAll('[data-program-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-program-modal');
      const p = PROGRAMS_DOSSIER_DATA[id];
      if (!p) return;

      openModal(
        p.code,
        `
          <h3 class="modal-title" id="modal-title">${p.title}</h3>
          <div class="modal-subtitle">${p.subtitle}</div>
          <p style="margin-bottom:1rem;line-height:1.5;">${p.summary}</p>
          <div class="modal-spec-grid">
            ${p.specs
              .map(([k, v]) => `<div class="modal-spec-box"><span>${k}</span><strong>${v}</strong></div>`)
              .join('')}
          </div>
          <div style="font-family:var(--font-mono);font-size:0.76rem;background:var(--bg-concrete);border:1.5px solid #111;padding:0.75rem;margin-bottom:1.25rem;">
            <strong>CADENCE //</strong> ${p.schedule}
          </div>
          <a href="#contact" class="btn-join-now" style="text-decoration:none;" onclick="document.getElementById('dossier-modal').hidden=true;">
            <span>ALLOCATE THIS BLOCK</span>
            <span class="submit-tag">PROCEED TO BOOKING →</span>
          </a>
        `
      );
    });
  });

  // Coach "Inspect Profile" Buttons
  document.querySelectorAll('[data-coach-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-coach-modal');
      const c = COACHES_DOSSIER_DATA[id];
      if (!c) return;

      openModal(
        c.id,
        `
          <h3 class="modal-title" id="modal-title">${c.name}</h3>
          <div class="modal-subtitle">${c.role}</div>
          <div style="font-family:var(--font-mono);font-size:0.74rem;font-weight:700;background:#111;color:#F0B800;padding:0.65rem;margin-bottom:1rem;">
            ${c.totals}
          </div>
          <blockquote style="border-left:4px solid #D92626;padding-left:0.85rem;font-style:italic;margin-bottom:1.25rem;">
            "${c.philosophy}"
          </blockquote>
          <div style="font-family:var(--font-mono);font-size:0.76rem;margin-bottom:1.25rem;">
            <strong style="display:block;margin-bottom:0.4rem;">VERIFIED CLEARANCE & CREDENTIALS:</strong>
            <ul style="padding-left:1.1rem;line-height:1.6;">
              ${c.credentials.map((item) => `<li>${item}</li>`).join('')}
            </ul>
          </div>
          <a href="#contact" class="btn-join-now" style="text-decoration:none;" onclick="document.getElementById('dossier-modal').hidden=true;">
            <span>BOOK ASSESSMENT WITH ${c.name.split(' ')[0]}</span>
            <span class="submit-tag">SELECT SLOT →</span>
          </a>
        `
      );
    });
  });

  // Header Log In / Sign Up Buttons
  document.querySelectorAll('[data-auth-trigger]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-auth-trigger');
      const isLogin = mode === 'login';
      openModal(
        isLogin ? 'AUTH // TELEMETRY PORTAL' : 'ONBOARD // NEW LIFTER REGISTRATION',
        `
          <h3 class="modal-title" id="modal-title">${isLogin ? 'Athlete Telemetry Log In' : 'Create KILO // 01 Account'}</h3>
          <div class="modal-subtitle">${
            isLogin
              ? 'ACCESS VELOCITY LOGS, 1RM PROGRESSION & PLATFORM RESERVATIONS'
              : 'REGISTER YOUR BIOMETRIC PROFILE & INITIALIZE FORCE-PLATE ASSESSMENT'
          }</div>
          <form class="chalk-form" onsubmit="event.preventDefault(); document.getElementById('dossier-modal').hidden=true;">
            <div class="form-field">
              <label class="field-label"><span>ATHLETE EMAIL / ID</span></label>
              <input type="email" class="chalk-input" placeholder="lifter@kilo-lab.ch" required />
            </div>
            <div class="form-field">
              <label class="field-label"><span>ACCESS PASSKEY</span></label>
              <input type="password" class="chalk-input" placeholder="••••••••••••" required />
            </div>
            <button type="submit" class="btn-join-now">
              <span>${isLogin ? 'AUTHENTICATE TELEMETRY' : 'INITIALIZE PROFILE'}</span>
              <span class="submit-tag">ENTER LAB →</span>
            </button>
          </form>
        `
      );
    });
  });

  // 8. Membership Tier Selection & Join Booking Form Submission
  const tierCards = document.querySelectorAll('.tier-card');
  const formSelectedTier = document.getElementById('form-selected-tier');
  let activeTierName = 'BARBELL CLUB + VBT';

  tierCards.forEach((card) => {
    card.addEventListener('click', () => {
      tierCards.forEach((c) => {
        c.classList.remove('active');
        c.setAttribute('aria-checked', 'false');
      });
      card.classList.add('active');
      card.setAttribute('aria-checked', 'true');
      activeTierName = card.getAttribute('data-tier');
      if (formSelectedTier) formSelectedTier.textContent = activeTierName;
    });
  });

  const bookingForm = document.getElementById('join-booking-form');
  const bookingPassOutput = document.getElementById('booking-pass-output');
  const resetBookingBtn = document.getElementById('btn-reset-booking');

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameVal = document.getElementById('booking-name').value.trim() || 'ATHLETE // UNNAMED';
      const slotVal = document.getElementById('booking-slot').value;
      const expVal = document.getElementById('booking-experience').value;

      document.getElementById('pass-athlete-name').textContent = nameVal;
      document.getElementById('pass-tier').textContent = activeTierName;
      document.getElementById('pass-exp').textContent = expVal.toUpperCase();
      document.getElementById('pass-slot').textContent = slotVal.split('(')[0].trim();
      document.getElementById('pass-id-code').textContent = `REF #KILO-${Math.floor(1000 + Math.random() * 9000)}`;

      bookingForm.hidden = true;
      bookingPassOutput.hidden = false;
      soundEngine.playClank(180);
    });
  }

  if (resetBookingBtn) {
    resetBookingBtn.addEventListener('click', () => {
      bookingForm.reset();
      bookingPassOutput.hidden = true;
      bookingForm.hidden = false;
    });
  }

  // 9. Header Navigation Smooth Scroll & Active Section Highlighting
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const headerNav = document.getElementById('header-nav');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = headerNav.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        headerNav.classList.remove('open');
        const targetEl = document.querySelector(href);
        if (targetEl) {
          if (lenis) {
            lenis.scrollTo(targetEl, { offset: -64 });
          } else {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });

  // Update Global Top Scroll Progress Bar & Active Nav Link
  const scrollProgressBar = document.getElementById('scroll-progress-bar');
  const sectionIds = ['home', 'assess', 'programs', 'the-floor', 'contact'];

  window.addEventListener(
    'scroll',
    () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (scrollProgressBar) {
        scrollProgressBar.style.width = `${pct}%`;
      }

      let currentSection = 'home';
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el && scrollTop >= el.offsetTop - 220) {
          currentSection = id;
        }
      });

      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('data-section') === currentSection);
      });
    },
    { passive: true }
  );

  // 10. Master Hardware-Accelerated Animation Loop
  const clock = { start: performance.now() };

  function animate(now) {
    requestAnimationFrame(animate);
    if (lenis) {
      lenis.raf(now);
    }

    const elapsed = (now - clock.start) * 0.001;
    barbellScene.update(elapsed);
    floorScene.update(elapsed);
  }

  requestAnimationFrame(animate);
});
