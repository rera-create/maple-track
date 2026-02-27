import { useState, useEffect, useRef } from "react";

// ── Animated background ───────────────────────────────────────────────────────
function Background() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const TWO_PI = Math.PI * 2;
    const G  = (a) => `rgba(240,215,110,${a})`;
    const Gw = (a) => `rgba(255,242,168,${a})`;

    // Drifting orbs — ambient warmth
    const orbs = [
      { x:0.18, y:0.22, vx: 0.00040, vy: 0.00028, r:0.42, ph:0.0 },
      { x:0.78, y:0.62, vx:-0.00035, vy:-0.00025, r:0.48, ph:1.8 },
      { x:0.52, y:0.85, vx: 0.00025, vy:-0.00038, r:0.36, ph:3.5 },
      { x:0.88, y:0.18, vx:-0.00030, vy: 0.00036, r:0.40, ph:5.2 },
      { x:0.32, y:0.52, vx: 0.00038, vy: 0.00020, r:0.32, ph:2.4 },
    ];

    // Ring clusters
    const clusters = [
      {
        cx:0.84, cy:0.22,
        rings:[
          { r:130, spd: 0.0004, ticks:72, tkLen:6, al:0.18 },
          { r:100, spd:-0.0007, ticks:36, tkLen:5, al:0.22 },
          { r: 68, spd: 0.0012, ticks:24, tkLen:4, al:0.28 },
          { r: 38, spd:-0.0020, ticks:12, tkLen:4, al:0.34 },
        ],
        scanSpd:0.0018, scanAl:0.16, scanArc:0.55, angle:0,
      },
      {
        cx:0.12, cy:0.72,
        rings:[
          { r:110, spd:-0.0005, ticks:60, tkLen:5, al:0.16 },
          { r: 80, spd: 0.0009, ticks:30, tkLen:5, al:0.20 },
          { r: 50, spd:-0.0015, ticks:20, tkLen:4, al:0.26 },
          { r: 24, spd: 0.0025, ticks:8,  tkLen:3, al:0.32 },
        ],
        scanSpd:-0.0022, scanAl:0.15, scanArc:0.45, angle:2.1,
      },
      {
        cx:0.50, cy:0.50,
        rings:[
          { r:190, spd: 0.0002, ticks:90, tkLen:7, al:0.09 },
          { r:152, spd:-0.0004, ticks:72, tkLen:6, al:0.12 },
          { r:112, spd: 0.0006, ticks:48, tkLen:5, al:0.16 },
          { r: 74, spd:-0.0010, ticks:36, tkLen:5, al:0.21 },
          { r: 40, spd: 0.0016, ticks:16, tkLen:4, al:0.27 },
        ],
        scanSpd:0.0013, scanAl:0.12, scanArc:0.65, angle:4.5,
      },
    ];
    // init ring rotations
    clusters.forEach(cl => cl.rings.forEach(r => { r.rot = 0; }));

    // Floating reticles
    const reticles = [
      { x:0.65, y:0.35, vx: 0.00020, vy: 0.00014, sz:18, ph:0.0 },
      { x:0.27, y:0.14, vx:-0.00018, vy: 0.00022, sz:14, ph:1.2 },
      { x:0.91, y:0.74, vx: 0.00015, vy:-0.00018, sz:22, ph:2.6 },
      { x:0.42, y:0.88, vx:-0.00022, vy:-0.00012, sz:12, ph:4.1 },
    ];

    // Data streaks
    const streaks = Array.from({length:10}, (_, i) => ({
      y: 0.06 + i * 0.092,
      x: Math.random(),
      w: 0.05 + Math.random() * 0.12,
      ph: Math.random() * TWO_PI,
      spd: 0.00018 + Math.random() * 0.00022,
    }));

    const drawRing = (cx, cy, ring, rot) => {
      ctx.beginPath();
      ctx.arc(cx, cy, ring.r, 0, TWO_PI);
      ctx.strokeStyle = G(ring.al);
      ctx.lineWidth = 0.8;
      ctx.stroke();
      for (let i = 0; i < ring.ticks; i++) {
        const angle = rot + (i / ring.ticks) * TWO_PI;
        const major = i % (ring.ticks / 4) === 0;
        const len = major ? ring.tkLen * 1.8 : ring.tkLen;
        const al  = major ? Math.min(ring.al * 1.7, 1) : ring.al;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * ring.r, cy + Math.sin(angle) * ring.r);
        ctx.lineTo(cx + Math.cos(angle) * (ring.r - len), cy + Math.sin(angle) * (ring.r - len));
        ctx.strokeStyle = G(al);
        ctx.lineWidth = major ? 1.2 : 0.6;
        ctx.stroke();
      }
    };

    const drawScan = (cx, cy, maxR, angle, arc, al) => {
      const steps = 24;
      for (let i = 0; i < steps; i++) {
        const frac = i / steps;
        const a0 = (angle - arc) + frac * arc;
        const a1 = (angle - arc) + (frac + 1 / steps) * arc;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxR, a0, a1);
        ctx.closePath();
        ctx.fillStyle = G(al * frac * frac);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.strokeStyle = Gw(al * 2.2);
      ctx.lineWidth = 1.4;
      ctx.stroke();
    };

    const drawReticle = (rx, ry, sz, al) => {
      const h = sz * 0.4, gap = sz * 0.25;
      ctx.strokeStyle = G(al);
      ctx.lineWidth = 0.9;
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sy]) => {
        const ox = rx + sx * gap, oy = ry + sy * gap;
        ctx.beginPath();
        ctx.moveTo(ox + sx * h, oy);
        ctx.lineTo(ox, oy);
        ctx.lineTo(ox, oy + sy * h);
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.arc(rx, ry, 1.5, 0, TWO_PI);
      ctx.fillStyle = G(al * 1.6);
      ctx.fill();
    };

    let t = 0;
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, W, H);

      // Orbs
      for (const o of orbs) {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -0.2) o.vx = Math.abs(o.vx);
        if (o.x >  1.2) o.vx =-Math.abs(o.vx);
        if (o.y < -0.2) o.vy = Math.abs(o.vy);
        if (o.y >  1.2) o.vy =-Math.abs(o.vy);
        const al = 0.20 + 0.07 * Math.sin(t * 0.0006 + o.ph);
        const cx = o.x*W, cy = o.y*H, rad = o.r * Math.max(W,H);
        const g = ctx.createRadialGradient(cx,cy,0,cx,cy,rad);
        g.addColorStop(0,   `rgba(240,210,100,${al})`);
        g.addColorStop(0.4, `rgba(240,215,110,${al*0.45})`);
        g.addColorStop(1,   "rgba(240,220,128,0)");
        ctx.beginPath(); ctx.arc(cx,cy,rad,0,TWO_PI);
        ctx.fillStyle = g; ctx.fill();
      }

      // Clusters
      for (const cl of clusters) {
        const cx = cl.cx * W, cy = cl.cy * H;
        cl.angle += cl.scanSpd;
        for (const ring of cl.rings) {
          ring.rot += ring.spd;
          drawRing(cx, cy, ring, ring.rot);
        }
        drawScan(cx, cy, cl.rings[0].r, cl.angle, cl.scanArc, cl.scanAl);
        ctx.beginPath(); ctx.arc(cx, cy, 3, 0, TWO_PI);
        ctx.fillStyle = G(0.5); ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, 1.5, 0, TWO_PI);
        ctx.fillStyle = Gw(0.9); ctx.fill();
      }

      // Streaks
      for (const s of streaks) {
        s.x += s.spd;
        if (s.x > 1.3) s.x = -0.3;
        const al = 0.07 + 0.05 * Math.sin(t * 0.002 + s.ph);
        const sx = s.x*W, sy = s.y*H, sw = s.w*W;
        const grad = ctx.createLinearGradient(sx,sy,sx+sw,sy);
        grad.addColorStop(0, G(0));
        grad.addColorStop(0.3, G(al));
        grad.addColorStop(0.7, G(al));
        grad.addColorStop(1, G(0));
        ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx+sw,sy);
        ctx.strokeStyle = grad; ctx.lineWidth = 0.8; ctx.stroke();
      }

      // Reticles
      for (const re of reticles) {
        re.x += re.vx; re.y += re.vy;
        if (re.x < 0.02) re.vx = Math.abs(re.vx);
        if (re.x > 0.98) re.vx =-Math.abs(re.vx);
        if (re.y < 0.02) re.vy = Math.abs(re.vy);
        if (re.y > 0.98) re.vy =-Math.abs(re.vy);
        const al = 0.20 + 0.10 * Math.sin(t * 0.0012 + re.ph);
        drawReticle(re.x*W, re.y*H, re.sz, al);
      }

      t++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} style={{position:"fixed",inset:0,width:"100%",height:"100%",zIndex:0,pointerEvents:"none"}}/>;
}

// Swap this for your R2 public bucket URL when ready
const IMG_BASE = "https://pub-2f8b565f5d5e4601814c638f74967ba9.r2.dev";

const characters = [
  { name: "Yunli",    cls: "Ren",          type: "Warrior",  level: 288, badge: "Main",         img: "ren"       },
  { name: "Lecia",    cls: "Hero",         type: "Warrior",  level: 287, badge: "Farming",      img: "hero"      },
  { name: "Gremory",  cls: "Cadena",       type: "Thief",    level: 270, badge: "Farming",      img: "cadena"    },
  { name: "Guilty",   cls: "Bishop",       type: "Magician", level: 268, badge: "Farming",      img: "bishop"    },
  { name: "Iono",     cls: "Lynn",         type: "Magician", level: 263, badge: "Farming",      img: "lynn"      },
  { name: "Yutet",    cls: "Demon Slayer", type: "Warrior",  level: 262, badge: "In Progress",  img: "ds"        },
  { name: "Kisaki",   cls: "Khali",        type: "Thief",    level: 260, badge: "In Progress",  img: "khali"     },
  { name: "Kasel",    cls: "Kanna",        type: "Magician", level: 260, badge: "In Progress",  img: "kanna"     },
  { name: "Filene",   cls: "Fire/Poison",  type: "Mage",     level: 260, badge: "In Progress",  img: "fp"        },
  { name: "Aijou",    cls: "Battle Mage",  type: "Magician", level: 260, badge: "In Progress",  img: "bam"       },
  { name: "Fuyuko",   cls: "Aran",         type: "Warrior",  level: 260, badge: "In Progress",  img: "aran"      },
  { name: "Solais",   cls: "Sia Astelle",  type: "Magician", level: 253, badge: "In Progress",  img: "sia"       },
  { name: "Cordelia", cls: "Adele",        type: "Warrior",  level: 252, badge: "In Progress",  img: "adele"     },
  { name: "Ramizel",  cls: "Lara",         type: "Magician", level: 251, badge: "In Progress",  img: "lara"      },
  { name: "Yubel",    cls: "Shade",        type: "Warrior",  level: 251, badge: "In Progress",  img: "shade"     },
  { name: "Ramuh",    cls: "Buccaneer",    type: "Pirate",   level: 250, badge: "In Progress",  img: "buccaneer" },
];

const TIER = {
  Main:  { label: "Legendary", dim: "rgba(0,180,0,0.55)",    lit: "#7eff7e" },
  Farming:        { label: "Unique",    dim: "rgba(220,160,0,0.55)",  lit: "#ffe080" },
  "In Progress":  { label: "Epic",      dim: "rgba(160,80,255,0.55)", lit: "#c89fff" },
};

const JOB_HUE = {
  Warrior: 350, Thief: 270, Magician: 210, Mage: 210, Pirate: 38,
};

const G      = "#F0DC80";   // luminescent pale gold — the edge color
const G_DIM  = "rgba(240,220,128,0.18)";
const G_GLOW = "rgba(240,220,128,0.7)";

// A single prism card — the card face IS the monolith face
// Gold lines the edges and optionally bisects the face vertically
function PrismCard({ char, index, isSel, isHov, onClick, onEnter, onLeave }) {
  const tier  = TIER[char.badge];
  const hue   = JOB_HUE[char.type] ?? JOB_HUE.Magician;
  const lit   = isSel || isHov;
  const [imgErr, setImgErr] = useState(false);

  // Which cards get the center seam (every 3rd)
  const hasSeam = index % 3 === 1;

  const edgeOpacity  = lit ? 1   : 0.22;
  const glowStrength = lit ? "drop-shadow(0 0 4px rgba(240,220,128,0.9)) drop-shadow(0 0 12px rgba(240,220,128,0.5))" : "none";

  const isMain = char.badge === "Main";
  const riseDelay = `${index * 0.03 + 0.06}s`;

  return (
    <div
      className={`prism${isSel ? " sel" : ""}${isMain ? " is-main" : ""}`}
      style={{ animationDelay: riseDelay, "--rise-delay": riseDelay }}
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* ── Edge geometry — SVG overlay traces the prism edges ── */}
      <svg className="edges" viewBox="0 0 100 160" preserveAspectRatio="none">
        <defs>
          <filter id={`eg${index}`} x="-40%" y="-10%" width="180%" height="120%">
            <feGaussianBlur stdDeviation={lit ? "2" : "0.5"} result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Four bounding edges of the prism face */}
        {/* Left edge — full height, primary structural line */}
        <line x1="0" y1="0" x2="0" y2="160"
          stroke={G} strokeWidth={lit ? "1.5" : "0.8"}
          opacity={edgeOpacity}
          filter={`url(#eg${index})`}
          style={{ transition: "opacity .35s ease, stroke-width .35s ease" }}
        />
        {/* Top edge */}
        <line x1="0" y1="0" x2="100" y2="0"
          stroke={G} strokeWidth={lit ? "1.2" : "0.7"}
          opacity={edgeOpacity * 0.85}
          filter={`url(#eg${index})`}
          style={{ transition: "opacity .35s ease, stroke-width .35s ease" }}
        />
        {/* Right edge — subtler, suggests depth */}
        <line x1="100" y1="0" x2="100" y2="160"
          stroke={G} strokeWidth={lit ? "0.9" : "0.5"}
          opacity={edgeOpacity * 0.6}
          filter={`url(#eg${index})`}
          style={{ transition: "opacity .35s ease, stroke-width .35s ease" }}
        />
        {/* Bottom edge */}
        <line x1="0" y1="160" x2="100" y2="160"
          stroke={G} strokeWidth={lit ? "1.0" : "0.6"}
          opacity={edgeOpacity * 0.7}
          filter={`url(#eg${index})`}
          style={{ transition: "opacity .35s ease, stroke-width .35s ease" }}
        />

        {/* Corner nodes — where edges meet */}
        {[[0,0],[100,0],[0,160],[100,160]].map(([cx,cy],i) => (
          <rect key={i}
            x={cx === 0 ? 0 : cx - 3} y={cy === 0 ? 0 : cy - 3}
            width="3" height="3"
            fill={G}
            opacity={lit ? 0.95 : 0.25}
            filter={lit ? `url(#eg${index})` : undefined}
            style={{ transition: "opacity .35s ease" }}
          />
        ))}

        {/* Center vertical seam — runs down the middle of the face */}
        {hasSeam && (
          <line x1="50" y1="0" x2="50" y2="160"
            stroke={G} strokeWidth={lit ? "0.7" : "0.3"}
            opacity={lit ? 0.45 : 0.08}
            filter={`url(#eg${index})`}
            strokeDasharray={lit ? "none" : "4 6"}
            style={{ transition: "opacity .35s ease, stroke-width .35s ease" }}
          />
        )}

        {/* Horizontal divider — one third down, separates avatar zone */}
        <line x1="0" y1="72" x2="100" y2="72"
          stroke={G} strokeWidth={lit ? "0.8" : "0.4"}
          opacity={lit ? 0.50 : 0.10}
          filter={`url(#eg${index})`}
          style={{ transition: "opacity .35s ease, stroke-width .35s ease" }}
        />
        {/* Node on the divider — left side */}
        <rect x="0" y="70" width="3" height="3"
          fill={G} opacity={lit ? 0.8 : 0.15}
          filter={lit ? `url(#eg${index})` : undefined}
          style={{ transition: "opacity .35s ease" }}
        />
      </svg>

      {/* ── Inner glow: the prism radiates light from within ── */}
      <div className="prism-glow" style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 35%,
          rgba(240,220,128,${lit ? "0.07" : "0.02"}) 0%, transparent 70%)`,
        transition: "background .4s ease",
      }}/>

      {/* ── Card content ── */}
      <div className="prism-body">

        {/* Sprite — overflows top and sides, anchored to bottom of upper zone */}
        <div className="prism-sprite-wrap">
          {!imgErr ? (
            <img
              className="prism-sprite"
              src={`${IMG_BASE}/${char.img}.png`}
              alt={char.name}
              onError={() => setImgErr(true)}
            />
          ) : (
            /* Fallback initial if image not uploaded yet */
            <div className="prism-av-fallback"
              style={{ background: `hsl(${hue}deg 45% 38%)` }}>
              {char.name[0]}
            </div>
          )}
        </div>

        {/* Lower zone — data */}
        <div className="prism-lower">
          <div className="prism-tier" style={{
            color: lit ? tier.lit : tier.dim,
            filter: lit ? `drop-shadow(0 0 5px ${tier.lit})` : "none",
            transition: "color .3s, filter .3s",
          }}>
            {tier.label}
          </div>
          <div className="prism-name">{char.name}</div>
          <div className="prism-cls">{char.cls}</div>
          <div className="prism-lv">
            <span className="prism-lv-l">Lv</span>
            <span className="prism-lv-n" style={{
              color: lit ? G : "#1a1a1a",
              filter: lit ? `drop-shadow(0 0 8px ${G_GLOW})` : "none",
              transition: "color .3s, filter .3s",
            }}>{char.level}</span>
          </div>
        </div>
      </div>

      {/* Particle shimmer — only rendered on Main, CSS controls visibility */}
      {char.badge === "Main" && (
        <div className="prism-particles" aria-hidden="true">
          {[
            { tx: "-8px",  delay: "0.0s", dur: "1.6s", left: "22%" },
            { tx:  "5px",  delay: "0.3s", dur: "1.9s", left: "38%" },
            { tx: "-4px",  delay: "0.7s", dur: "1.4s", left: "50%" },
            { tx:  "9px",  delay: "0.2s", dur: "2.0s", left: "62%" },
            { tx: "-6px",  delay: "0.9s", dur: "1.7s", left: "74%" },
            { tx:  "3px",  delay: "0.5s", dur: "1.5s", left: "30%" },
            { tx: "-10px", delay: "1.1s", dur: "1.8s", left: "58%" },
            { tx:  "7px",  delay: "0.4s", dur: "1.6s", left: "44%" },
          ].map((p, i) => (
            <div key={i} className="particle" style={{
              left: p.left,
              "--tx":    p.tx,
              "--delay": p.delay,
              "--dur":   p.dur,
            }}/>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CharSelect() {
  const [filter,   setFilter]  = useState("All");
  const [selected, setSelected] = useState(null);
  const [mounted,  setMounted]  = useState(false);
  const [hovered,  setHovered]  = useState(null);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const filtered = characters.filter(c => filter === "All" || c.badge === filter);
  const sel = selected;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --G:    #F0DC80;
          --Gdim: rgba(240,220,128,0.18);
          --Glo:  rgba(240,220,128,0.65);
          --text: #111;
          --dim:  #999;
          --mono: 'DM Mono', monospace;
        }

        html, body { background: #fff; }
        body {
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          color: var(--text);
        }

        /* Root transparent so canvas orbs show through */
        .root {
          min-height: 100vh;
          background: transparent;
          position: relative;
          z-index: 1;
        }

        /* ── Header — frosted glass ── */
        .hdr {
          padding: 48px 56px 40px;
          border-bottom: 1px solid rgba(240,220,128,0.20);
          position: relative;
          opacity: 0; transform: translateY(-8px);
          transition: opacity .5s ease, transform .5s ease;
          background: rgba(255,255,255,0.70);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .hdr.in { opacity: 1; transform: translateY(0); }

        /* The single gold line at the bottom of the header — the monolith's horizon */
        .hdr::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 56px; right: 56px;
          height: 1px;
          background: linear-gradient(90deg,
            transparent,
            rgba(240,220,128,0.5) 15%,
            rgba(240,220,128,1)   50%,
            rgba(240,220,128,0.5) 85%,
            transparent);
          filter: drop-shadow(0 0 8px rgba(240,220,128,0.9));
        }

        .hdr-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .hdr-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 52px;
          letter-spacing: .08em;
          line-height: 1;
          color: #0a0a0a;
          /* Very faint warm shadow — like light beneath the letters */
          text-shadow: 0 0 60px rgba(240,220,128,0.20);
        }

        .hdr-sub {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: .26em;
          text-transform: uppercase;
          color: rgba(240,220,128,0.8);
          filter: drop-shadow(0 0 6px rgba(240,220,128,0.6));
          margin-top: 8px;
        }

        .hdr-right {
          text-align: right;
          padding-bottom: 4px;
        }
        .hdr-online {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 7px;
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--dim);
          margin-bottom: 6px;
        }
        .hdr-dot {
          width: 5px; height: 5px;
          background: #6ee7b7;
          box-shadow: 0 0 5px #6ee7b7, 0 0 12px rgba(110,231,183,.4);
          animation: pulse 2.5s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 55%{opacity:.3} }
        .hdr-count {
          font-family: var(--mono);
          font-size: 11px;
          color: var(--dim);
        }
        .hdr-count strong {
          color: var(--G);
          font-weight: 500;
          filter: drop-shadow(0 0 5px rgba(240,220,128,.6));
        }

        /* ── Page body ── */
        .body {
          max-width: 1080px;
          margin: 0 auto;
          padding: 36px 56px 80px;
          opacity: 0; transform: translateY(6px);
          transition: opacity .45s .08s ease, transform .45s .08s ease;
        }
        .body.in { opacity:1; transform:translateY(0); }

        /* ── Filter bar ── */
        .bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .filters {
          display: flex;
          gap: 0;
          border: 1px solid rgba(240,220,128,0.22);
          position: relative;
        }
        .fbtn {
          padding: 8px 26px;
          border: none;
          border-right: 1px solid rgba(240,220,128,0.14);
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: .22em;
          text-transform: uppercase;
          cursor: pointer;
          background: transparent;
          color: #bbb;
          transition: color .14s, background .14s;
          position: relative;
        }
        .fbtn:last-child { border-right: none; }
        .fbtn:hover { color: #666; background: rgba(240,220,128,0.04); }
        .fbtn.on {
          color: #111;
          background: rgba(240,220,128,0.07);
        }
        .fbtn.on::after {
          content: '';
          position: absolute;
          left: 0; right: 0; bottom: -1px;
          height: 1.5px;
          background: var(--G);
          filter: drop-shadow(0 0 5px var(--G));
        }

        .bar-ct {
          font-family: var(--mono);
          font-size: 9px;
          color: #ccc;
          letter-spacing: .12em;
        }
        .bar-ct strong {
          color: var(--G);
          font-weight: 400;
          filter: drop-shadow(0 0 4px rgba(240,220,128,.7));
        }

        /* ── Prism grid — tall narrow cards ── */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
          /* Column gap must be wider than the sprite side overflow to prevent overlap */
          gap: 24px;
          /* Top padding = sprite overflow height so first row has room */
          padding-top: 100px;
          /* Side padding mirrors column gap so edge cards don't clip */
          padding-left: 4px;
          padding-right: 4px;
        }

        /* ── Prism card ── */
        .prism {
          position: relative;
          background: rgba(255,255,255,0.52);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(240,220,128,0.18);
          cursor: pointer;
          overflow: visible;
          opacity: 0;
          animation: rise .38s ease forwards;
          transition: border-color .28s ease, box-shadow .28s ease, transform .22s ease;
          /* Each hovered card rises above its neighbours */
          z-index: 1;
        }
        .prism:hover, .prism.sel { z-index: 10; }
        @keyframes rise {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ── Default hover / selected ── */
        .prism:hover, .prism.sel {
          background: rgba(255,255,255,0.72);
          border-color: rgba(240,220,128,0.55);
          box-shadow:
            inset 0 0 60px rgba(240,220,128,0.06),
            0 0 0 1px rgba(240,220,128,0.14),
            0 8px 32px rgba(240,220,128,0.12);
          transform: translateY(-3px);
        }

        /* ── Main card — idle gold pulse on edges ── */
        .prism.is-main {
          border-color: rgba(240,220,128,0.35);
          animation: rise .38s ease forwards, edge-pulse 3s ease-in-out infinite;
          animation-delay: var(--rise-delay), 1s;
        }
        @keyframes edge-pulse {
          0%, 100% {
            box-shadow:
              0 0 0 1px rgba(240,220,128,0.12),
              0 0 12px rgba(240,220,128,0.08);
          }
          50% {
            box-shadow:
              0 0 0 1px rgba(240,220,128,0.45),
              0 0 22px rgba(240,220,128,0.20),
              inset 0 0 30px rgba(240,220,128,0.06);
          }
        }

        /* ── Particle shimmer — floats up from bottom of Main card on hover ── */
        .prism-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 6;
          overflow: visible;
        }
        .particle {
          position: absolute;
          bottom: 20%;
          width: 3px; height: 3px;
          border-radius: 50%;
          background: var(--G);
          opacity: 0;
        }
        .prism.is-main:hover .particle,
        .prism.is-main.sel   .particle {
          animation: shimmer-rise var(--dur) ease-out var(--delay) infinite;
        }
        @keyframes shimmer-rise {
          0%   { transform: translate(var(--tx), 0)   scale(1);   opacity: 0; }
          15%  { opacity: 0.9; }
          80%  { opacity: 0.4; }
          100% { transform: translate(var(--tx), -90px) scale(0); opacity: 0; }
        }

        /* ── Main card hover — full bloom ── */
        .prism.is-main:hover, .prism.is-main.sel {
          border-color: rgba(240,220,128,0.90);
          box-shadow:
            0 0 0 1px rgba(240,220,128,0.55),
            0 0 32px rgba(240,220,128,0.28),
            0 0 60px rgba(240,220,128,0.12),
            inset 0 0 40px rgba(240,220,128,0.09);
          animation: rise .38s ease forwards;
        }

        /* SVG edge overlay — fills the card exactly */
        .edges {
          position: absolute;
          inset: 0; width: 100%; height: 100%;
          pointer-events: none;
          z-index: 2;
        }

        /* Radial inner glow — the energy inside the monolith */
        .prism-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        /* Content sits above everything */
        .prism-body {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        /* Sprite wrapper — anchored to card, sprite floats above */
        .prism-sprite-wrap {
          position: relative;
          width: 100%;
          height: 90px;           /* visible zone inside the card border */
          display: flex;
          align-items: flex-end;
          justify-content: center;
          pointer-events: none;
          overflow: visible;      /* sprite escapes upward freely */
        }

        /* The sprite itself sits centred and overflows upward */
        .prism-sprite {
          display: block;
          height: 200px;
          width: auto;
          object-fit: contain;
          object-position: bottom center;
          position: relative;
          bottom: 0;
          filter: drop-shadow(0 6px 14px rgba(0,0,0,0.22))
                  drop-shadow(0 1px 3px rgba(0,0,0,0.14));
          transition: filter .30s ease, transform .30s ease;
          pointer-events: none;
          z-index: 4;
        }

        /* Hover lift — all cards */
        .prism:hover .prism-sprite,
        .prism.sel   .prism-sprite {
          transform: translateY(-8px) scale(1.04);
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.18))
                  drop-shadow(0 0 14px rgba(240,220,128,0.30))
                  drop-shadow(0 0 30px rgba(240,220,128,0.14));
        }

        /* Main card hover — stronger gold aura on sprite */
        .prism.is-main:hover .prism-sprite,
        .prism.is-main.sel   .prism-sprite {
          transform: translateY(-10px) scale(1.06);
          filter: drop-shadow(0 10px 22px rgba(0,0,0,0.16))
                  drop-shadow(0 0 20px rgba(240,220,128,0.55))
                  drop-shadow(0 0 40px rgba(240,220,128,0.28));
        }

        /* Side vignettes — gradient overlays that simulate wrap-around shadow */
        .prism-sprite-wrap::before,
        .prism-sprite-wrap::after {
          content: '';
          position: absolute;
          top: -110px;            /* reach up to cover the full sprite height */
          bottom: 0;
          width: 28%;
          pointer-events: none;
          z-index: 5;
        }
        /* Left vignette */
        .prism-sprite-wrap::before {
          left: 0;
          background: linear-gradient(to right,
            rgba(255,255,255,0.72) 0%,
            rgba(255,255,255,0.38) 40%,
            transparent 100%);
        }
        /* Right vignette */
        .prism-sprite-wrap::after {
          right: 0;
          background: linear-gradient(to left,
            rgba(255,255,255,0.72) 0%,
            rgba(255,255,255,0.38) 40%,
            transparent 100%);
        }
        /* On hover, soften the vignettes so we see more of the sprite */
        .prism:hover .prism-sprite-wrap::before,
        .prism.sel   .prism-sprite-wrap::before {
          background: linear-gradient(to right,
            rgba(255,255,255,0.55) 0%,
            rgba(255,255,255,0.20) 40%,
            transparent 100%);
        }
        .prism:hover .prism-sprite-wrap::after,
        .prism.sel   .prism-sprite-wrap::after {
          background: linear-gradient(to left,
            rgba(255,255,255,0.55) 0%,
            rgba(255,255,255,0.20) 40%,
            transparent 100%);
        }

        /* Fallback initial circle when image not yet uploaded */
        .prism-av-fallback {
          width: 64px; height: 64px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 26px;
          letter-spacing: .04em;
          color: rgba(255,255,255,0.88);
          margin-bottom: 16px;
        }

        /* Lower zone — text data */
        .prism-lower {
          padding: 10px 13px 16px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .prism-tier {
          font-family: var(--mono);
          font-size: 7.5px;
          letter-spacing: .22em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .prism-name {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: -.01em;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: letter-spacing .3s ease, filter .3s ease, color .3s ease;
        }
        .prism:hover .prism-name,
        .prism.sel   .prism-name {
          letter-spacing: .01em;
          color: #000;
        }
        /* Main card — name lights up gold on hover */
        .prism.is-main:hover .prism-name,
        .prism.is-main.sel   .prism-name {
          color: #c8a030;
          filter: drop-shadow(0 0 8px rgba(240,220,128,0.7));
          letter-spacing: .04em;
        }

        .prism-cls {
          font-family: var(--mono);
          font-size: 8.5px;
          color: #bbb;
          letter-spacing: .04em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 10px;
        }

        .prism-lv {
          display: flex;
          align-items: baseline;
          gap: 3px;
        }
        .prism-lv-l {
          font-family: var(--mono);
          font-size: 8px;
          color: #ccc;
          letter-spacing: .14em;
          text-transform: uppercase;
        }
        .prism-lv-n {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 26px;
          line-height: 1;
          letter-spacing: .04em;
        }

        /* ── Detail panel ── */
        .det-wrap {
          margin-top: 10px;
          opacity: 0; transform: translateY(5px);
          transition: opacity .22s ease, transform .22s ease;
          pointer-events: none;
        }
        .det-wrap.vis { opacity:1; transform:translateY(0); pointer-events:auto; }

        .det {
          border: 1px solid rgba(240,220,128,0.45);
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          position: relative;
          overflow: hidden;
          box-shadow:
            inset 0 0 80px rgba(240,220,128,0.04),
            0 0 0 1px rgba(240,220,128,0.10);
        }

        /* Top beam */
        .det-beam {
          height: 1.5px;
          background: linear-gradient(90deg,
            transparent,
            rgba(240,220,128,0.4) 10%,
            rgba(240,220,128,1) 50%,
            rgba(240,220,128,0.4) 90%,
            transparent);
          filter: drop-shadow(0 0 8px rgba(240,220,128,1));
        }

        /* Vertical left edge inside detail panel */
        .det-edge {
          position: absolute;
          top: 0; bottom: 0; left: 0;
          width: 1.5px;
          background: linear-gradient(180deg,
            rgba(240,220,128,0.8),
            rgba(240,220,128,0.3) 50%,
            rgba(240,220,128,0.6));
          filter: drop-shadow(0 0 4px rgba(240,220,128,0.8));
        }

        .det-body {
          display: flex;
          align-items: center;
          gap: 22px;
          padding: 18px 28px 18px 32px;
          position: relative; z-index: 2;
        }

        .det-av {
          width: 52px; height: 52px;
          border-radius: 50%;
          display: flex; align-items:center; justify-content:center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: .04em;
          color: rgba(255,255,255,0.88);
          flex-shrink: 0;
          box-shadow: 0 0 0 1.5px rgba(240,220,128,0.5),
                      0 0 12px rgba(240,220,128,0.2);
        }

        .det-info { flex:1; min-width:0; }
        .det-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 26px; letter-spacing: .06em;
          color: #0a0a0a; line-height:1;
          margin-bottom: 4px;
          text-shadow: 0 0 40px rgba(240,220,128,0.15);
        }
        .det-sub {
          font-family: var(--mono);
          font-size: 9px; color: #bbb;
          letter-spacing: .12em; text-transform: uppercase;
        }

        .det-sep {
          width: 1px; height: 44px; flex-shrink:0;
          background: rgba(240,220,128,0.25);
          filter: drop-shadow(0 0 4px rgba(240,220,128,0.3));
        }

        .det-stats { display:flex; gap:24px; align-items:center; flex-shrink:0; }
        .det-stat { text-align: center; }
        .det-val {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px; letter-spacing: .04em;
          line-height:1; margin-bottom:3px;
          filter: drop-shadow(0 0 5px currentColor);
        }
        .det-lbl {
          font-family: var(--mono);
          font-size: 8px; letter-spacing: .18em;
          text-transform: uppercase; color: #ccc;
        }

        /* Enter button */
        .enter {
          position: relative;
          padding: 10px 22px;
          border: 1px solid rgba(240,220,128,0.45);
          background: transparent;
          font-family: var(--mono);
          font-size: 9px; letter-spacing: .24em;
          text-transform: uppercase;
          color: var(--G);
          cursor: pointer; flex-shrink:0;
          overflow: hidden;
          transition: filter .18s ease, border-color .18s ease;
          filter: drop-shadow(0 0 3px rgba(240,220,128,0.2));
        }
        .enter::before {
          content:'';
          position:absolute; inset:0;
          background: rgba(240,220,128,0.09);
          transform: scaleX(0); transform-origin:left;
          transition: transform .22s ease;
        }
        .enter:hover::before { transform: scaleX(1); }
        .enter:hover {
          border-color: rgba(240,220,128,0.8);
          filter: drop-shadow(0 0 10px rgba(240,220,128,0.5));
        }
        .enter span { position:relative; z-index:1; }

        /* Empty state */
        .det-empty {
          display: flex; align-items:center; gap:14px;
          padding: 16px 32px;
          position: relative; z-index:2;
        }
        .det-empty-line {
          flex:1; height:1px;
          background: rgba(240,220,128,0.12);
        }
        .det-empty-txt {
          font-family: var(--mono);
          font-size: 9px; color: #ccc;
          letter-spacing: .24em; text-transform: uppercase;
        }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(240,220,128,0.25); }
      `}</style>

      <div className="root">
        <Background/>

        {/* Header */}
        <header className={`hdr ${mounted ? "in" : ""}`}>
          <div className="hdr-row">
            <div>
              <div className="hdr-name">AbyssGuild</div>
              <div className="hdr-sub">AbyssGuild · Bera</div>
            </div>
            <div className="hdr-right">
              <div className="hdr-online">
                <div className="hdr-dot"/>
                Online
              </div>
              <div className="hdr-count">
                <strong>{characters.length}</strong> characters
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className={`body ${mounted ? "in" : ""}`}>

          {/* Filter bar */}
          <div className="bar">
            <div className="filters">
              {["All","Main","Farming","In Progress"].map(f => (
                <button key={f}
                  className={`fbtn ${filter === f ? "on" : ""}`}
                  onClick={() => setFilter(f)}
                >{f}</button>
              ))}
            </div>
            <span className="bar-ct"><strong>{filtered.length}</strong> / {characters.length}</span>
          </div>

          {/* Prism grid */}
          <div className="grid">
            {filtered.map((char, i) => (
              <PrismCard
                key={char.name}
                char={char}
                index={i}
                isSel={selected?.name === char.name}
                isHov={hovered === char.name}
                onClick={() => setSelected(selected?.name === char.name ? null : char)}
                onEnter={() => setHovered(char.name)}
                onLeave={() => setHovered(null)}
              />
            ))}
          </div>

          {/* Detail panel */}
          <div className={`det-wrap ${sel ? "vis" : ""}`}>
            <div className="det">
              <div className="det-beam"/>
              <div className="det-edge"/>
              {sel ? (() => {
                const tier = TIER[sel.badge];
                const hue  = JOB_HUE[sel.type] ?? JOB_HUE.Magician;
                return (
                  <div className="det-body">
                    <div className="det-av" style={{ background: `hsl(${hue}deg 45% 38%)` }}>
                      {sel.name[0]}
                    </div>
                    <div className="det-info">
                      <div className="det-name">{sel.name}</div>
                      <div className="det-sub">{sel.cls} · {sel.type}</div>
                    </div>
                    <div className="det-sep"/>
                    <div className="det-stats">
                      <div className="det-stat">
                        <div className="det-val" style={{ color: G }}>{sel.level}</div>
                        <div className="det-lbl">Level</div>
                      </div>
                      <div className="det-stat">
                        <div className="det-val" style={{ color: tier.lit, filter: `drop-shadow(0 0 5px ${tier.lit})` }}>
                          {tier.label}
                        </div>
                        <div className="det-lbl">Tier</div>
                      </div>
                      <div className="det-stat">
                        <div className="det-val" style={{ color: "#999" }}>{sel.type}</div>
                        <div className="det-lbl">Class</div>
                      </div>
                    </div>
                    <div className="det-sep"/>
                    <button className="enter"><span>Log In →</span></button>
                  </div>
                );
              })() : (
                <div className="det-empty">
                  <div className="det-empty-line"/>
                  <span className="det-empty-txt">Select a character</span>
                  <div className="det-empty-line"/>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
