import React, { useEffect, useRef, useState, useCallback } from 'react';

const GLUON_STATES = [
  { id: 1, name: "r-ḡ", colors: [0, 1] },
  { id: 2, name: "g-r̄", colors: [1, 0] },
  { id: 3, name: "r-b̄", colors: [0, 2] },
  { id: 4, name: "b-r̄", colors: [2, 0] },
  { id: 5, name: "g-b̄", colors: [1, 2] },
  { id: 6, name: "b-ḡ", colors: [2, 1] },
  { id: 7, name: "(rr̄-gḡ)/√2", colors: [0, 0] },
  { id: 8, name: "(rr̄+gḡ-2bb̄)/√6", colors: [2, 2] }
];

const DEFAULT_SETTINGS = {
  numQuarks: 60,
  bjorkenX: 0.6,
  quarkSize: 5,
  confinementRadius: 140,
  stringTension: 0.05,
  bunchingForce: 0.08,
  colorRepulsion: 150,
  repelRadius: 120,
  quantumJitter: 2.0,
  glowEffect: false,
  smoothColorTransition: false,
  timeScale: 1.0,
  maxAntiquarks: 20,
  stretchThreshold: 220,
  annihilationDistance: 14, 
  gluonThickness: 2.0, 
};

const QUARK_COLORS = [
  { r: 255, g: 50, b: 50, rgb: '255, 50, 50', hex: '#ff3232', name: 'Red' },
  { r: 50, g: 255, b: 50, rgb: '50, 255, 50', hex: '#32ff32', name: 'Green' },
  { r: 50, g: 150, b: 255, rgb: '50, 150, 255', hex: '#3296ff', name: 'Blue' }
];

const ANTIQUARK_COLORS = [
  { r: 50, g: 255, b: 255, rgb: '50, 255, 255', hex: '#32ffff', name: 'Anti-Red' },
  { r: 255, g: 50, b: 255, rgb: '255, 50, 255', hex: '#ff32ff', name: 'Anti-Green' },
  { r: 255, g: 255, b: 50, rgb: '255, 255, 50', hex: '#ffff32', name: 'Anti-Blue' }
];

export default function App() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
  }, []);

  const [numQuarks, setNumQuarks] = useState(DEFAULT_SETTINGS.numQuarks);
  const [bjorkenX, setBjorkenX] = useState(DEFAULT_SETTINGS.bjorkenX);
  const [quarkSize, setQuarkSize] = useState(DEFAULT_SETTINGS.quarkSize);
  const [confinementRadius, setConfinementRadius] = useState(DEFAULT_SETTINGS.confinementRadius);
  const [stringTension, setStringTension] = useState(DEFAULT_SETTINGS.stringTension);
  const [bunchingForce, setBunchingForce] = useState(DEFAULT_SETTINGS.bunchingForce);
  const [colorRepulsion, setColorRepulsion] = useState(DEFAULT_SETTINGS.colorRepulsion);
  const [repelRadius, setRepelRadius] = useState(DEFAULT_SETTINGS.repelRadius);
  const [quantumJitter, setQuantumJitter] = useState(DEFAULT_SETTINGS.quantumJitter);
  const [glowEffect, setGlowEffect] = useState(DEFAULT_SETTINGS.glowEffect);
  const [smoothColorTransition, setSmoothColorTransition] = useState(DEFAULT_SETTINGS.smoothColorTransition);
  const [timeScale, setTimeScale] = useState(DEFAULT_SETTINGS.timeScale);
  const [maxAntiquarks, setMaxAntiquarks] = useState(DEFAULT_SETTINGS.maxAntiquarks);
  const [stretchThreshold, setStretchThreshold] = useState(DEFAULT_SETTINGS.stretchThreshold);
  const [annihilationDistance, setAnnihilationDistance] = useState(DEFAULT_SETTINGS.annihilationDistance);
  const [gluonThickness, setGluonThickness] = useState(DEFAULT_SETTINGS.gluonThickness);

  const [isRunning, setIsRunning] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showGluons, setShowGluons] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [activeGluonCounts, setActiveGluonCounts] = useState(new Array(8).fill(0));
  const [antiquarkCount, setAntiquarkCount] = useState(0);

  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600
  });

  const simState = useRef({
    quarks: [],
    antiquarks: [],
    gluons: [],
    width: dimensions.width,
    height: dimensions.height,
  });

  const configRef = useRef({
    bjorkenX, quarkSize, confinementRadius, stringTension, bunchingForce, colorRepulsion, repelRadius, quantumJitter, glowEffect, smoothColorTransition, timeScale, maxAntiquarks, stretchThreshold, annihilationDistance, gluonThickness
  });

  useEffect(() => {
    configRef.current = { bjorkenX, quarkSize, confinementRadius, stringTension, bunchingForce, colorRepulsion, repelRadius, quantumJitter, glowEffect, smoothColorTransition, timeScale, maxAntiquarks, stretchThreshold, annihilationDistance, gluonThickness };
  }, [bjorkenX, quarkSize, confinementRadius, stringTension, bunchingForce, colorRepulsion, repelRadius, quantumJitter, glowEffect, smoothColorTransition, timeScale, maxAntiquarks, stretchThreshold, annihilationDistance, gluonThickness]);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setDimensions({ width: w, height: h });
      simState.current.width = w;
      simState.current.height = h;
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initSimulation = useCallback(() => {
    const state = simState.current;
    state.quarks = [];
    state.antiquarks = [];
    state.gluons = [];
    const cx = state.width / 2;
    const cy = state.height / 2;
    for (let i = 0; i < numQuarks; i++) {
      const colorIdx = i % 3;
      const r = Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const initialColor = QUARK_COLORS[colorIdx];
      state.quarks.push({
        id: Math.random(),
        x: cx + r * Math.cos(theta),
        y: cy + r * Math.sin(theta),
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        colorIdx: colorIdx,
        r: initialColor.r,
        g: initialColor.g,
        b: initialColor.b,
        isSea: false,
        isAnti: false,
        dead: false
      });
    }
  }, [numQuarks]);

  useEffect(() => {
    initSimulation();
  }, [initSimulation]);

  const updateSimulation = useCallback(() => {
    const state = simState.current;
    const cfg = configRef.current;
    const friction = 0.90;
    
    let cx = 0, cy = 0;
    let colorCoM = [{ x: 0, y: 0, count: 0 }, { x: 0, y: 0, count: 0 }, { x: 0, y: 0, count: 0 }];

    let aliveQuarks = 0;
    for (let q of state.quarks) {
      if (q.dead) continue;
      aliveQuarks++;
      cx += q.x; cy += q.y;
      colorCoM[q.colorIdx].x += q.x;
      colorCoM[q.colorIdx].y += q.y;
      colorCoM[q.colorIdx].count += 1;
    }

    if (aliveQuarks > 0) {
      cx /= aliveQuarks; cy /= aliveQuarks;
    } else {
      cx = state.width / 2; cy = state.height / 2;
    }

    for (let i = 0; i < 3; i++) {
      if (colorCoM[i].count > 0) {
        colorCoM[i].x /= colorCoM[i].count;
        colorCoM[i].y /= colorCoM[i].count;
      }
    }

    const driftFx = (state.width / 2 - cx) * 0.01;
    const driftFy = (state.height / 2 - cy) * 0.01;

    for (let i = 0; i < state.quarks.length; i++) {
      let q1 = state.quarks[i];
      if (q1.dead) continue;
      let fx = 0, fy = 0;

      let myColorCoM = colorCoM[q1.colorIdx];
      if (myColorCoM.count > 0 && !q1.isSea) {
        fx += (myColorCoM.x - q1.x) * cfg.bunchingForce;
        fy += (myColorCoM.y - q1.y) * cfg.bunchingForce;
      }

      let dx = q1.x - cx, dy = q1.y - cy;
      let distFromCenter = Math.sqrt(dx * dx + dy * dy);
      if (distFromCenter > cfg.confinementRadius) {
        let excess = distFromCenter - cfg.confinementRadius;
        fx -= (dx / distFromCenter) * excess * cfg.stringTension;
        fy -= (dy / distFromCenter) * excess * cfg.stringTension;
      }

      for (let j = 0; j < state.quarks.length; j++) {
        if (i === j) continue;
        let q2 = state.quarks[j];
        if (q2.dead) continue;
        if (q1.colorIdx !== q2.colorIdx) {
          let rdx = q1.x - q2.x, rdy = q1.y - q2.y;
          let distSq = rdx * rdx + rdy * rdy;
          if (distSq > 0.1 && distSq < cfg.repelRadius * cfg.repelRadius) {
            let repForce = cfg.colorRepulsion / distSq;
            fx += rdx * repForce; fy += rdy * repForce;
          }
        }
      }

      fx += (Math.random() - 0.5) * cfg.quantumJitter;
      fy += (Math.random() - 0.5) * cfg.quantumJitter;

      const targetC = QUARK_COLORS[q1.colorIdx];
      if (cfg.smoothColorTransition) {
        const lerpRate = 0.15 * cfg.timeScale;
        q1.r += (targetC.r - q1.r) * lerpRate;
        q1.g += (targetC.g - q1.g) * lerpRate;
        q1.b += (targetC.b - q1.b) * lerpRate;
      } else {
        q1.r = targetC.r;
        q1.g = targetC.g;
        q1.b = targetC.b;
      }

      const currentFriction = Math.pow(friction, cfg.timeScale);
      q1.vx = (q1.vx + (fx + driftFx) * cfg.timeScale) * currentFriction;
      q1.vy = (q1.vy + (fy + driftFy) * cfg.timeScale) * currentFriction;
      q1.x += q1.vx * cfg.timeScale;
      q1.y += q1.vy * cfg.timeScale;
    }

    const annihilationSq = cfg.annihilationDistance * cfg.annihilationDistance;

    for (let k = state.antiquarks.length - 1; k >= 0; k--) {
      let aq = state.antiquarks[k];
      let annihilated = false;
      let fx = 0, fy = 0;

      let myMatterCoM = colorCoM[aq.colorIdx];
      if (myMatterCoM.count > 0) {
        fx += (myMatterCoM.x - aq.x) * cfg.bunchingForce;
        fy += (myMatterCoM.y - aq.y) * cfg.bunchingForce;
      }

      let dx = aq.x - cx, dy = aq.y - cy;
      let distFromCenter = Math.sqrt(dx * dx + dy * dy);
      if (distFromCenter > cfg.confinementRadius) {
        let excess = distFromCenter - cfg.confinementRadius;
        fx -= (dx / distFromCenter) * excess * cfg.stringTension;
        fy -= (dy / distFromCenter) * excess * cfg.stringTension;
      }

      for (let i = 0; i < state.quarks.length; i++) {
        let q = state.quarks[i];
        if (q.isSea && !q.dead && q.colorIdx === aq.colorIdx) {
          let dqx = q.x - aq.x, dqy = q.y - aq.y;
          let dSq = dqx*dqx + dqy*dqy;
          
          if (dSq < annihilationSq) {
            q.dead = true;
            aq.dead = true; 
            state.quarks.splice(i, 1);
            state.antiquarks.splice(k, 1);
            annihilated = true;
            break;
          } else if (dSq < 10000) { 
            let attractF = 80 / dSq;
            fx += dqx * attractF;
            fy += dqy * attractF;
          }
        }
      }

      if (annihilated) continue;

      fx += (Math.random() - 0.5) * cfg.quantumJitter;
      fy += (Math.random() - 0.5) * cfg.quantumJitter;

      const targetC = ANTIQUARK_COLORS[aq.colorIdx];
      if (cfg.smoothColorTransition) {
        const lerpRate = 0.15 * cfg.timeScale;
        aq.r += (targetC.r - aq.r) * lerpRate;
        aq.g += (targetC.g - aq.g) * lerpRate;
        aq.b += (targetC.b - aq.b) * lerpRate;
      } else {
        aq.r = targetC.r;
        aq.g = targetC.g;
        aq.b = targetC.b;
      }

      const currentFriction = Math.pow(friction, cfg.timeScale);
      aq.vx = (aq.vx + (fx + driftFx) * cfg.timeScale) * currentFriction;
      aq.vy = (aq.vy + (fy + driftFy) * cfg.timeScale) * currentFriction;
      aq.x += aq.vx * cfg.timeScale;
      aq.y += aq.vy * cfg.timeScale;
    }

    const xFactor = Math.pow((1.01 - cfg.bjorkenX), 4);
    const baseProb = 0.0003; 
    const nScale = 60 / Math.max(state.quarks.length + state.antiquarks.length, 1);
    const exchangeProbability = (baseProb + (0.025 * xFactor)) * nScale * cfg.timeScale; 

    for (let i = 0; i < state.quarks.length; i++) {
      let q1 = state.quarks[i];
      if (q1.dead) continue;

      for (let j = i + 1; j < state.quarks.length; j++) {
        let q2 = state.quarks[j];
        if (q2.dead) continue;

        if (Math.random() < exchangeProbability) {
          let distSq = Math.pow(q1.x - q2.x, 2) + Math.pow(q1.y - q2.y, 2);
          if (distSq < (cfg.confinementRadius * 2.5) ** 2) {
            let gluonType;
            let temp1 = q1.colorIdx, temp2 = q2.colorIdx;

            if (temp1 !== temp2) {
              gluonType = GLUON_STATES.find(s => s.colors[0] === temp1 && s.colors[1] === temp2);
              q1.colorIdx = temp2;
              q2.colorIdx = temp1;
            } else {
              if (temp1 === 0) gluonType = GLUON_STATES[6];
              else if (temp1 === 1) gluonType = GLUON_STATES[6];
              else gluonType = GLUON_STATES[7];
            }

            if (gluonType) {
              state.gluons.push({
                source: q1, target: q2,
                typeId: gluonType.id, typeName: gluonType.name,
                c1: QUARK_COLORS[temp1],         
                c2: ANTIQUARK_COLORS[temp2],     
                life: 0, maxLife: 8 + Math.random() * 15,
                fluctuationOffset: Math.random() * 60 - 30
              });
            }
          }
        }
      }
    }

    for (let i = 0; i < state.antiquarks.length; i++) {
      let aq1 = state.antiquarks[i];
      if (aq1.dead) continue;

      for (let j = i + 1; j < state.antiquarks.length; j++) {
        let aq2 = state.antiquarks[j];
        if (aq2.dead) continue;

        if (Math.random() < exchangeProbability) {
          let distSq = Math.pow(aq1.x - aq2.x, 2) + Math.pow(aq1.y - aq2.y, 2);
          if (distSq < (cfg.confinementRadius * 2.5) ** 2) {
            let gluonType;
            let temp1 = aq1.colorIdx, temp2 = aq2.colorIdx;

            if (temp1 !== temp2) {
              gluonType = GLUON_STATES.find(s => s.colors[0] === temp2 && s.colors[1] === temp1);
              aq1.colorIdx = temp2;
              aq2.colorIdx = temp1;
            } else {
              if (temp1 === 0) gluonType = GLUON_STATES[6];
              else if (temp1 === 1) gluonType = GLUON_STATES[6];
              else gluonType = GLUON_STATES[7];
            }

            if (gluonType) {
              state.gluons.push({
                source: aq1, target: aq2,
                typeId: gluonType.id, typeName: gluonType.name,
                c1: ANTIQUARK_COLORS[temp1], 
                c2: QUARK_COLORS[temp2],     
                life: 0, maxLife: 8 + Math.random() * 15,
                fluctuationOffset: Math.random() * 60 - 30
              });
            }
          }
        }
      }
    }

    const counts = new Array(8).fill(0);
    const snapSq = cfg.stretchThreshold * cfg.stretchThreshold;

    for (let k = state.gluons.length - 1; k >= 0; k--) {
      let g = state.gluons[k];
      
      if (g.source.dead || g.target.dead) {
        state.gluons.splice(k, 1);
        continue;
      }

      let dx = g.target.x - g.source.x;
      let dy = g.target.y - g.source.y;
      if (dx*dx + dy*dy > snapSq && state.antiquarks.length < cfg.maxAntiquarks) {
        let midX = (g.source.x + g.target.x) / 2;
        let midY = (g.source.y + g.target.y) / 2;
        
        let c = Math.floor(Math.random() * 3); 
        let qC = QUARK_COLORS[c];
        let aqC = ANTIQUARK_COLORS[c];

        state.quarks.push({
          id: Math.random(),
          x: midX + 5, y: midY,
          vx: dx * 0.05, vy: dy * 0.05,
          colorIdx: c,
          r: qC.r, g: qC.g, b: qC.b,
          isSea: true, isAnti: false, dead: false
        });

        state.antiquarks.push({
          id: Math.random(),
          x: midX - 5, y: midY,
          vx: -dx * 0.05, vy: -dy * 0.05,
          colorIdx: c,
          r: aqC.r, g: aqC.g, b: aqC.b,
          isAnti: true, dead: false
        });

        state.gluons.splice(k, 1);
        continue;
      }

      counts[g.typeId - 1]++;
      g.life += 1 * cfg.timeScale;
      if (g.life >= g.maxLife) {
        state.gluons.splice(k, 1);
      }
    }

    setActiveGluonCounts(counts);
    setAntiquarkCount(state.antiquarks.length);

    draw(state);
    if (isRunning) animationRef.current = requestAnimationFrame(updateSimulation);
  }, [isRunning]);

  const draw = (state) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cfg = configRef.current;
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, state.width, state.height);
    
    ctx.globalCompositeOperation = cfg.glowEffect ? 'lighter' : 'source-over';

    for (let g of state.gluons) {
      const progress = g.life / g.maxLife;
      const intensity = Math.sin(progress * Math.PI); 
      const startX = g.source.x, startY = g.source.y;
      const endX = g.target.x, endY = g.target.y;
      
      const grad = ctx.createLinearGradient(startX, startY, endX, endY);
      grad.addColorStop(0, `rgba(${g.c1.rgb}, ${intensity * 0.8})`);
      grad.addColorStop(0.5, `rgba(255, 255, 255, ${intensity * 0.9})`);
      grad.addColorStop(1, `rgba(${g.c2.rgb}, ${intensity * 0.8})`);
      ctx.strokeStyle = grad;
      
      const baseWidth = cfg.gluonThickness * (1 + (1 - cfg.bjorkenX) * 4);
      ctx.lineWidth = baseWidth * intensity;
      ctx.lineCap = 'round';
      if (cfg.glowEffect) { ctx.shadowBlur = baseWidth * 3; ctx.shadowColor = `rgba(255, 255, 255, 0.5)`; }
      
      const midX = (startX + endX) / 2, midY = (startY + endY) / 2;
      const dx = endX - startX, dy = endY - startY;
      const len = Math.sqrt(dx*dx + dy*dy) || 1;
      const nx = -dy / len, ny = dx / len;
      const ctrlX = midX + nx * g.fluctuationOffset * intensity;
      const ctrlY = midY + ny * g.fluctuationOffset * intensity;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
    const qSize = cfg.quarkSize;
    
    for (let q of state.quarks) {
      if (q.dead) continue;
      
      const colorObj = QUARK_COLORS[q.colorIdx];
      const currentRgb = colorObj.rgb;
      const currentSolid = colorObj.hex;
      
      const gradient = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, qSize * 2);
      gradient.addColorStop(0, '#ffffff'); 
      gradient.addColorStop(0.3, currentSolid); 
      gradient.addColorStop(1, `rgba(${currentRgb}, 0)`); 
      
      ctx.fillStyle = gradient;
      ctx.beginPath(); 
      ctx.arc(q.x, q.y, qSize * 2, 0, Math.PI * 2);
      if (cfg.glowEffect) { ctx.shadowBlur = qSize * 3; ctx.shadowColor = currentSolid; }
      ctx.fill();
    }

    for (let aq of state.antiquarks) {
      if (aq.dead) continue;

      const colorObj = ANTIQUARK_COLORS[aq.colorIdx];
      const currentRgb = colorObj.rgb;
      const currentSolid = colorObj.hex;
      
      const gradient = ctx.createRadialGradient(aq.x, aq.y, 0, aq.x, aq.y, qSize * 2);
      gradient.addColorStop(0, '#ffffff'); 
      gradient.addColorStop(0.3, currentSolid); 
      gradient.addColorStop(1, `rgba(${currentRgb}, 0)`); 
      
      ctx.fillStyle = gradient;
      ctx.beginPath(); 
      ctx.arc(aq.x, aq.y, qSize * 2, 0, Math.PI * 2);
      if (cfg.glowEffect) { ctx.shadowBlur = qSize * 3; ctx.shadowColor = currentSolid; }
      ctx.fill();
    }
  };

  useEffect(() => {
    if (isRunning) animationRef.current = requestAnimationFrame(updateSimulation);
    else cancelAnimationFrame(animationRef.current);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isRunning, updateSimulation]);

  const normX = (bjorkenX - 0.001) / 0.999;
  const displayBjorkenX = 0.001 * Math.pow(1000, normX);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-gray-200 font-sans selection:bg-gray-700">
      <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} className="absolute inset-0 z-0 bg-black" />

      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-3 items-start">
        <div className="flex flex-row items-center gap-3">
          <h1 className="text-2xl tracking-wider text-white bg-black/50 px-3 py-1 rounded shadow-lg backdrop-blur-sm inline-block m-0 text-center">
            <strong className="font-bold">QCD</strong> <span className="text-gray-400 font-light text-xl">Visualization</span>
          </h1>
          <button 
            onClick={() => setShowInfo(!showInfo)} 
            className={`pointer-events-auto w-8 h-8 rounded-full flex justify-center items-center font-serif italic text-lg transition border shadow-lg backdrop-blur-sm ${showInfo ? 'bg-gray-800 border-gray-400 text-white' : 'bg-black/50 border-gray-600 text-gray-400 hover:text-white hover:border-gray-400'}`}
            title="Information"
          >
            i
          </button>
        </div>

        {showInfo && (
          <div className="text-xs text-gray-400 bg-gray-900/80 backdrop-blur-xl p-4 rounded-xl border border-gray-700 pointer-events-auto max-w-sm shadow-lg leading-relaxed">
            <p> This is a visualization of a baryon (like proton) based on Quantum Chromodynamics (QCD). This is in no way a precise scientific model, but it captures some of the qualitative behaviors of quarks, gluons, and their interactions. It mainly shows how at low x values, the internal structure of the baryon becomes more complex and at high. Also note that there are only 3 valance quarks but here you should interpret them probabilisticallly.</p>
          </div>
        )}
      </div>

      <div className="absolute top-4 right-4 z-20 pointer-events-none flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <button onClick={() => setShowGluons(!showGluons)} className={`pointer-events-auto w-12 h-12 flex justify-center items-center rounded-xl font-bold transition text-xl border shadow-2xl backdrop-blur-xl ${showGluons ? 'bg-gray-800 border-green-500 text-green-400' : 'bg-gray-900/80 border-gray-600 text-gray-400 hover:text-white hover:border-green-400'}`}>
            📊
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className={`pointer-events-auto w-12 h-12 flex justify-center items-center rounded-xl font-bold transition text-xl border shadow-2xl backdrop-blur-xl ${showSettings ? 'bg-gray-800 border-gray-400 text-white' : 'bg-gray-900/80 border-gray-600 text-gray-400 hover:text-white hover:border-gray-400'}`}>
            ⚙️
          </button>
        </div>

        {showGluons && (
          <div className="pointer-events-auto bg-gray-900/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-gray-700 flex flex-col gap-3 w-64">
            <div className="text-xs font-bold text-gray-300 text-center uppercase tracking-wider">Gluon Activity</div>
            <div className="grid grid-cols-4 gap-1.5">
              {GLUON_STATES.map((s, i) => (
                <div key={s.id} className="flex flex-col items-center bg-gray-800 p-1.5 rounded border border-gray-700">
                  <span className="text-[9px] text-gray-400 font-bold">{s.name}</span>
                  <span className={`text-[11px] font-mono ${activeGluonCounts[i] > 0 ? 'text-white' : 'text-gray-600'}`}>
                    {activeGluonCounts[i]}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-1 pt-2 border-t border-gray-700 flex justify-between items-center text-xs text-gray-400">
              <span className="uppercase font-bold tracking-wider">Sea Antiquarks</span>
              <span className="font-mono text-cyan-400">{antiquarkCount} / {maxAntiquarks}</span>
            </div>
          </div>
        )}

        {showSettings && (
          <div className="pointer-events-auto bg-gray-900/80 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-gray-700 flex flex-col gap-4 w-80 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="flex flex-col border-b border-gray-700 pb-3 gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white transition">
                <input type="checkbox" checked={glowEffect} onChange={e => setGlowEffect(e.target.checked)} className="accent-blue-500 w-4 h-4" />
                <span>Visual Glow</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white transition">
                <input type="checkbox" checked={smoothColorTransition} onChange={e => setSmoothColorTransition(e.target.checked)} className="accent-green-500 w-4 h-4" />
                <span>Smooth Color Transition</span>
              </label>
            </div>

            <label className="flex flex-col text-xs text-gray-400">
              <div className="flex justify-between mb-1"><span>Probability Cloud (N)</span><span className="text-white font-mono">{numQuarks}</span></div>
              <input type="range" min="3" max="300" step="3" value={numQuarks} onChange={e => setNumQuarks(Number(e.target.value))} className="accent-red-500" />
            </label>

            <label className="flex flex-col text-xs text-gray-400 border-t border-gray-700 pt-3 mt-1">
              <div className="flex justify-between mb-1"><span>Max Antiquarks</span><span className="text-white font-mono">{maxAntiquarks}</span></div>
              <input type="range" min="0" max="50" step="1" value={maxAntiquarks} onChange={e => setMaxAntiquarks(Number(e.target.value))} className="accent-cyan-400" />
            </label>
            
            <label className="flex flex-col text-xs text-gray-400">
              <div className="flex justify-between mb-1"><span>Annihilation Distance</span><span className="text-white font-mono">{annihilationDistance}</span></div>
              <input type="range" min="1" max="50" step="1" value={annihilationDistance} onChange={e => setAnnihilationDistance(Number(e.target.value))} className="accent-cyan-400" />
            </label>

            <label className="flex flex-col text-xs text-gray-400">
              <div className="flex justify-between mb-1"><span>String Snapping Limit</span><span className="text-white font-mono">{stretchThreshold}</span></div>
              <input type="range" min="100" max="400" step="10" value={stretchThreshold} onChange={e => setStretchThreshold(Number(e.target.value))} className="accent-cyan-400" />
            </label>

            <label className="flex flex-col text-xs text-gray-400 border-t border-gray-700 pt-3 mt-1">
              <div className="flex justify-between mb-1"><span>Gluon Thickness</span><span className="text-white font-mono">{gluonThickness.toFixed(1)}</span></div>
              <input type="range" min="0.5" max="8" step="0.5" value={gluonThickness} onChange={e => setGluonThickness(Number(e.target.value))} className="accent-blue-400" />
            </label>

            <label className="flex flex-col text-xs text-gray-400">
              <div className="flex justify-between mb-1"><span>Color Bunching</span><span className="text-white font-mono">{bunchingForce.toFixed(2)}</span></div>
              <input type="range" min="0.01" max="0.3" step="0.01" value={bunchingForce} onChange={e => setBunchingForce(Number(e.target.value))} className="accent-pink-500" />
            </label>

            <label className="flex flex-col text-xs text-gray-400">
              <div className="flex justify-between mb-1"><span>Confinement Radius</span><span className="text-white font-mono">{confinementRadius}</span></div>
              <input type="range" min="50" max="400" step="10" value={confinementRadius} onChange={e => setConfinementRadius(Number(e.target.value))} className="accent-green-500" />
            </label>

            <label className="flex flex-col text-xs text-gray-400">
              <div className="flex justify-between mb-1"><span>String Tension</span><span className="text-white font-mono">{stringTension.toFixed(2)}</span></div>
              <input type="range" min="0.01" max="0.5" step="0.01" value={stringTension} onChange={e => setStringTension(Number(e.target.value))} className="accent-purple-500" />
            </label>

            <label className="flex flex-col text-xs text-gray-400">
              <div className="flex justify-between mb-1"><span>Particle Size</span><span className="text-white font-mono">{quarkSize}</span></div>
              <input type="range" min="1" max="15" step="1" value={quarkSize} onChange={e => setQuarkSize(Number(e.target.value))} className="accent-yellow-500" />
            </label>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center pointer-events-none px-4">
        <div className="pointer-events-auto bg-gray-900/80 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-gray-700 flex flex-row gap-4 w-full max-w-4xl items-center">
          <div className="flex flex-col md:flex-row flex-1 gap-6 items-center">
            <label className="flex flex-col flex-1 text-xs font-bold text-white w-full">
              <div className="flex justify-between mb-2">
                <span className="text-sm">Bjorken x</span>
                <span className="font-mono text-blue-300 text-sm bg-gray-800 px-2 rounded">{displayBjorkenX.toExponential(2)}</span>
              </div>
              <input type="range" min="0.001" max="1.0" step="0.001" value={bjorkenX} onChange={e => setBjorkenX(Number(e.target.value))} className="accent-blue-500 h-2 w-full cursor-pointer" />
            </label>

            <div className="hidden md:flex flex-row gap-3">
              <button 
                onClick={() => setIsRunning(!isRunning)} 
                className={`w-10 h-10 flex justify-center items-center font-bold rounded-xl transition text-xl ${isRunning ? 'bg-red-600/90 hover:bg-red-500 text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]' : 'bg-green-600/90 hover:bg-green-500 text-white'}`}
                title={isRunning ? "Pause" : "Play"}
              >
                {isRunning ? '⏸' : '▶'}
              </button>
              <button 
                onClick={initSimulation} 
                className="w-10 h-10 flex justify-center items-center bg-blue-600/90 hover:bg-blue-500 text-white font-bold rounded-xl transition text-2xl shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                title="Reset"
              >
                ↺
              </button>
            </div>

            <label className="flex flex-col flex-1 text-xs font-bold text-white w-full">
              <div className="flex justify-between mb-2">
                <span className="text-sm">Time Scale</span>
                <span className="font-mono text-purple-300 text-sm bg-gray-800 px-2 rounded">{timeScale.toFixed(2)}x</span>
              </div>
              <input type="range" min="0.05" max="2.0" step="0.05" value={timeScale} onChange={e => setTimeScale(Number(e.target.value))} className="accent-purple-500 h-2 w-full cursor-pointer" />
            </label>
          </div>

          <div className="flex md:hidden flex-col gap-3">
            <button 
              onClick={() => setIsRunning(!isRunning)} 
              className={`w-12 h-12 flex justify-center items-center font-bold rounded-xl transition text-xl ${isRunning ? 'bg-red-600/90 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-green-600/90 hover:bg-green-500 text-white'}`}
            >
              {isRunning ? '⏸' : '▶'}
            </button>
            <button 
              onClick={initSimulation} 
              className="w-12 h-12 flex justify-center items-center bg-blue-600/90 hover:bg-blue-500 text-white font-bold rounded-xl transition text-2xl shadow-[0_0_15px_rgba(37,99,235,0.5)]"
            >
              ↺
            </button>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
      `}} />
    </div>
  );
}