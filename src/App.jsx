import { useState, useEffect, useRef } from "react";

// ── Animated background — Crown aesthetic ────────────────────────────────────
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
    const G  = (a) => `rgba(220,185, 80,${a})`;   // warm gold
    const Gw = (a) => `rgba(255,235,140,${a})`;   // bright gold highlight

    // God rays — vertical light shafts from top, like Crown title screen
    const rays = [
      { x:0.32, w:0.018, al:0.09, ph:0.0,  spd:0.00035 },
      { x:0.48, w:0.030, al:0.14, ph:1.4,  spd:0.00028 },
      { x:0.62, w:0.016, al:0.08, ph:2.8,  spd:0.00040 },
      { x:0.55, w:0.050, al:0.10, ph:0.8,  spd:0.00022 },
      { x:0.41, w:0.012, al:0.07, ph:3.5,  spd:0.00048 },
      { x:0.70, w:0.022, al:0.09, ph:2.1,  spd:0.00031 },
      { x:0.25, w:0.014, al:0.06, ph:4.2,  spd:0.00038 },
    ];

    // Ambient gold bloom orbs — very dim, deep in background
    const orbs = [
      { x:0.50, y:0.00, r:0.55, ph:0.0, vy: 0 },   // top center crown bloom
      { x:0.18, y:0.55, r:0.30, ph:1.8, vy:-0.00005 },
      { x:0.85, y:0.45, r:0.28, ph:3.2, vy: 0.00004 },
    ];

    // Dust motes — tiny gold particles drifting upward
    const motes = Array.from({length: 55}, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.0,
      vx: (Math.random() - 0.5) * 0.00015,
      vy: -(0.00012 + Math.random() * 0.00020),
      ph: Math.random() * TWO_PI,
      al: 0.15 + Math.random() * 0.35,
    }));

    // Subtle ring clusters — very dim, background texture only
    const clusters = [
      {
        cx:0.84, cy:0.18,
        rings:[
          { r:110, spd: 0.0003, ticks:60, tkLen:5, al:0.08 },
          { r: 72, spd:-0.0006, ticks:30, tkLen:4, al:0.11 },
          { r: 38, spd: 0.0011, ticks:16, tkLen:3, al:0.14 },
        ],
        scanSpd:0.0014, scanAl:0.07, scanArc:0.50, angle:0,
      },
      {
        cx:0.10, cy:0.75,
        rings:[
          { r: 90, spd:-0.0004, ticks:48, tkLen:4, al:0.07 },
          { r: 55, spd: 0.0008, ticks:24, tkLen:3, al:0.10 },
          { r: 26, spd:-0.0014, ticks:10, tkLen:3, al:0.13 },
        ],
        scanSpd:-0.0018, scanAl:0.06, scanArc:0.42, angle:2.1,
      },
    ];
    clusters.forEach(cl => cl.rings.forEach(r => { r.rot = 0; }));

    const drawRing = (cx, cy, ring, rot) => {
      ctx.beginPath();
      ctx.arc(cx, cy, ring.r, 0, TWO_PI);
      ctx.strokeStyle = G(ring.al);
      ctx.lineWidth = 0.6;
      ctx.stroke();
      for (let i = 0; i < ring.ticks; i++) {
        const angle = rot + (i / ring.ticks) * TWO_PI;
        const major = i % (ring.ticks / 4) === 0;
        const len = major ? ring.tkLen * 1.6 : ring.tkLen;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle)*ring.r, cy + Math.sin(angle)*ring.r);
        ctx.lineTo(cx + Math.cos(angle)*(ring.r-len), cy + Math.sin(angle)*(ring.r-len));
        ctx.strokeStyle = G(major ? ring.al*1.5 : ring.al);
        ctx.lineWidth = major ? 0.9 : 0.5;
        ctx.stroke();
      }
    };

    const drawScan = (cx, cy, maxR, angle, arc, al) => {
      for (let i = 0; i < 16; i++) {
        const frac = i/16;
        const a0 = (angle-arc)+frac*arc, a1 = (angle-arc)+(frac+1/16)*arc;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,maxR,a0,a1); ctx.closePath();
        ctx.fillStyle = G(al*frac*frac); ctx.fill();
      }
      ctx.beginPath(); ctx.moveTo(cx,cy);
      ctx.lineTo(cx+Math.cos(angle)*maxR, cy+Math.sin(angle)*maxR);
      ctx.strokeStyle = Gw(al*1.8); ctx.lineWidth = 1.0; ctx.stroke();
    };

    let t = 0;
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0,0,W,H);

      // ── Base: deep black with slight warm vignette center ──
      ctx.fillStyle = "#0a0804";
      ctx.fillRect(0,0,W,H);

      // Warm center bloom (crown light source)
      const bloom = ctx.createRadialGradient(W*0.5,H*0.08,0, W*0.5,H*0.08, H*0.75);
      bloom.addColorStop(0,   "rgba(180,130,30,0.22)");
      bloom.addColorStop(0.3, "rgba(140,100,20,0.10)");
      bloom.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = bloom; ctx.fillRect(0,0,W,H);

      // ── Orbs ──
      for (const o of orbs) {
        o.y += o.vy;
        const al = 0.12 + 0.04 * Math.sin(t*0.0005 + o.ph);
        const cx=o.x*W, cy=o.y*H, rad=o.r*Math.max(W,H);
        const g = ctx.createRadialGradient(cx,cy,0,cx,cy,rad);
        g.addColorStop(0, `rgba(200,155,40,${al})`);
        g.addColorStop(0.5, `rgba(160,120,25,${al*0.3})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(cx,cy,rad,0,TWO_PI);
        ctx.fillStyle=g; ctx.fill();
      }

      // ── God rays ──
      for (const ray of rays) {
        const al = ray.al * (0.7 + 0.3 * Math.sin(t*ray.spd*400 + ray.ph));
        const cx = ray.x * W;
        const rayW = ray.w * W;
        const grad = ctx.createLinearGradient(cx, 0, cx, H*0.85);
        grad.addColorStop(0,   `rgba(220,175,60,${al})`);
        grad.addColorStop(0.25,`rgba(200,155,40,${al*0.6})`);
        grad.addColorStop(0.7, `rgba(180,130,25,${al*0.15})`);
        grad.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.save();
        ctx.globalAlpha = 1;
        // slight taper: wide at top, narrow at bottom
        ctx.beginPath();
        ctx.moveTo(cx - rayW*1.5, 0);
        ctx.lineTo(cx + rayW*1.5, 0);
        ctx.lineTo(cx + rayW*0.3, H*0.85);
        ctx.lineTo(cx - rayW*0.3, H*0.85);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      // ── Dust motes ──
      for (const m of motes) {
        m.x += m.vx; m.y += m.vy;
        if (m.y < -0.01) m.y = 1.01;
        if (m.x < 0)  m.x = 1;
        if (m.x > 1)  m.x = 0;
        const al = m.al * (0.5 + 0.5 * Math.sin(t*0.0018 + m.ph));
        ctx.beginPath();
        ctx.arc(m.x*W, m.y*H, m.r, 0, TWO_PI);
        ctx.fillStyle = Gw(al);
        ctx.fill();
      }

      // ── Ring clusters (very subtle) ──
      for (const cl of clusters) {
        const cx=cl.cx*W, cy=cl.cy*H;
        cl.angle += cl.scanSpd;
        for (const ring of cl.rings) { ring.rot+=ring.spd; drawRing(cx,cy,ring,ring.rot); }
        drawScan(cx, cy, cl.rings[0].r, cl.angle, cl.scanArc, cl.scanAl);
        ctx.beginPath(); ctx.arc(cx,cy,2,0,TWO_PI);
        ctx.fillStyle=G(0.4); ctx.fill();
      }

      // ── Horizon line — faint gold at bottom ──
      const hz = ctx.createLinearGradient(0, H*0.88, 0, H);
      hz.addColorStop(0, "rgba(180,140,40,0.12)");
      hz.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle=hz; ctx.fillRect(0,H*0.88,W,H*0.12);

      t++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
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
          style={{ transition: "opacity .15s ease, stroke-width .15s ease" }}
        />
        {/* Top edge */}
        <line x1="0" y1="0" x2="100" y2="0"
          stroke={G} strokeWidth={lit ? "1.2" : "0.7"}
          opacity={edgeOpacity * 0.85}
          filter={`url(#eg${index})`}
          style={{ transition: "opacity .15s ease, stroke-width .15s ease" }}
        />
        {/* Right edge — subtler, suggests depth */}
        <line x1="100" y1="0" x2="100" y2="160"
          stroke={G} strokeWidth={lit ? "0.9" : "0.5"}
          opacity={edgeOpacity * 0.6}
          filter={`url(#eg${index})`}
          style={{ transition: "opacity .15s ease, stroke-width .15s ease" }}
        />
        {/* Bottom edge */}
        <line x1="0" y1="160" x2="100" y2="160"
          stroke={G} strokeWidth={lit ? "1.0" : "0.6"}
          opacity={edgeOpacity * 0.7}
          filter={`url(#eg${index})`}
          style={{ transition: "opacity .15s ease, stroke-width .15s ease" }}
        />

        {/* Corner nodes — where edges meet */}
        {[[0,0],[100,0],[0,160],[100,160]].map(([cx,cy],i) => (
          <rect key={i}
            x={cx === 0 ? 0 : cx - 3} y={cy === 0 ? 0 : cy - 3}
            width="3" height="3"
            fill={G}
            opacity={lit ? 0.95 : 0.25}
            filter={lit ? `url(#eg${index})` : undefined}
            style={{ transition: "opacity .15s ease" }}
          />
        ))}

        {/* Center vertical seam — runs down the middle of the face */}
        {hasSeam && (
          <line x1="50" y1="0" x2="50" y2="160"
            stroke={G} strokeWidth={lit ? "0.7" : "0.3"}
            opacity={lit ? 0.45 : 0.08}
            filter={`url(#eg${index})`}
            strokeDasharray={lit ? "none" : "4 6"}
            style={{ transition: "opacity .15s ease, stroke-width .15s ease" }}
          />
        )}

        {/* Horizontal divider — one third down, separates avatar zone */}
        <line x1="0" y1="72" x2="100" y2="72"
          stroke={G} strokeWidth={lit ? "0.8" : "0.4"}
          opacity={lit ? 0.50 : 0.10}
          filter={`url(#eg${index})`}
          style={{ transition: "opacity .15s ease, stroke-width .15s ease" }}
        />
        {/* Node on the divider — left side */}
        <rect x="0" y="70" width="3" height="3"
          fill={G} opacity={lit ? 0.8 : 0.15}
          filter={lit ? `url(#eg${index})` : undefined}
          style={{ transition: "opacity .15s ease" }}
        />
      </svg>

      {/* ── Inner glow: the prism radiates light from within ── */}
      <div className="prism-glow" style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 35%,
          rgba(240,220,128,${lit ? "0.07" : "0.02"}) 0%, transparent 70%)`,
        transition: "background .18s ease",
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
            transition: "color .12s, filter .12s",
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
              transition: "color .12s, filter .12s",
            }}>{char.level}</span>
          </div>
        </div>
      </div>

      {/* Particle shimmer — only rendered on Main, CSS controls visibility */}
      {char.badge === "Main" && (
        <div className="prism-particles" aria-hidden="true">
          {[
            { tx: "-8px",  delay: "0.0s", dur: "1.0s", left: "22%" },
            { tx:  "5px",  delay: "0.3s", dur: "1.1s", left: "38%" },
            { tx: "-4px",  delay: "0.7s", dur: "0.9s", left: "50%" },
            { tx:  "9px",  delay: "0.2s", dur: "1.2s", left: "62%" },
            { tx: "-6px",  delay: "0.9s", dur: "1.0s", left: "74%" },
            { tx:  "3px",  delay: "0.5s", dur: "0.9s", left: "30%" },
            { tx: "-10px", delay: "1.1s", dur: "1.1s", left: "58%" },
            { tx:  "7px",  delay: "0.4s", dur: "1.0s", left: "44%" },
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

export default function App() {
  const [filter,   setFilter]  = useState("All");
  const [selected, setSelected] = useState(null);
  const [mounted,  setMounted]  = useState(false);
  const [hovered,  setHovered]  = useState(null);
  const [navPage,  setNavPage]  = useState("experience");

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const filtered = characters.filter(c => filter === "All" || c.badge === filter);
  const sel = selected;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        /* ── Theme: Crown — deep black, warm gold ── */
        :root {
          --G:          #D4AF5A;
          --Gr:         212,175,90;
          --Gdim:       rgba(212,175,90,0.18);
          --Glo:        rgba(212,175,90,0.65);
          --bg:         #0a0804;
          --card-bg:    rgba(18,14,8,0.72);
          --card-hover: rgba(26,20,10,0.88);
          --sidebar-bg: rgba(12,10,5,0.82);
          --border:     rgba(212,175,90,0.20);
          --text:       #f0e8d0;
          --text-mid:   #a89878;
          --dim:        #6a5f4a;
          --dim2:       #3a3328;
          --nav-active-bg: rgba(212,175,90,0.10);
          --nav-active-text: #f0e8d0;
          --mono: 'DM Mono', monospace;
        }

        html, body { background: #0a0804; }
        body {
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          color: var(--text);
          background: var(--bg);
        }

        /* Root transparent so canvas orbs show through */
        .root {
          min-height: 100vh;
          background: transparent;
          position: relative;
          z-index: 1;
        }

        /* ── Root layout — full viewport, two columns ── */
        .layout {
          display: flex;
          width: 100vw;
          min-height: 100vh;
        }

        /* ── Left panel — dashboard, fixed width ── */
        .sidebar {
          width: 380px;
          min-width: 380px;
          min-height: 100vh;
          background: var(--sidebar-bg);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-right: 1px solid var(--border);
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          opacity: 0; transform: translateX(-12px);
          transition: opacity .5s ease, transform .5s ease;
        }
        .sidebar.in { opacity:1; transform:translateX(0); }

        /* Gold right-edge glow on sidebar */
        .sidebar::after {
          content: '';
          position: absolute;
          top: 60px; bottom: 60px; right: -1px;
          width: 1px;
          background: linear-gradient(180deg,
            transparent,
            rgba(212,175,90,0.4) 20%,
            rgba(212,175,90,0.85) 50%,
            rgba(212,175,90,0.4) 80%,
            transparent);
          filter: drop-shadow(0 0 8px rgba(212,175,90,0.6));
        }

        /* Guild name + meta at top of sidebar */
        .sidebar-hdr {
          padding: 44px 36px 32px;
          border-bottom: 1px solid rgba(240,220,128,0.14);
          position: relative;
        }
        .sidebar-hdr::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 36px; right: 36px;
          height: 1px;
          background: linear-gradient(90deg,
            rgba(240,220,128,0.8), transparent);
          filter: drop-shadow(0 0 5px rgba(240,220,128,0.6));
        }
        .sidebar-eyebrow {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: .28em;
          text-transform: uppercase;
          color: rgba(240,220,128,0.75);
          filter: drop-shadow(0 0 5px rgba(240,220,128,0.5));
          margin-bottom: 10px;
        }
        .sidebar-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 56px;
          letter-spacing: .06em;
          line-height: 1;
          color: var(--text);
          text-shadow: 0 0 60px rgba(var(--Gr),0.18);
          margin-bottom: 14px;
        }
        .sidebar-meta {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .sidebar-dot {
          width: 5px; height: 5px;
          background: #6ee7b7;
          box-shadow: 0 0 5px #6ee7b7, 0 0 12px rgba(110,231,183,.4);
          animation: pulse 2.5s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes pulse { 0%,100%{opacity:1} 55%{opacity:.3} }
        .sidebar-server {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: #bbb;
        }
        .sidebar-count {
          font-family: var(--mono);
          font-size: 9px;
          color: #bbb;
          letter-spacing: .10em;
          margin-left: auto;
        }
        .sidebar-count strong {
          color: var(--G);
          font-weight: 400;
          filter: drop-shadow(0 0 4px rgba(240,220,128,.6));
        }

        /* Sidebar scrollable body */
        .sidebar-body {
          flex: 1;
          overflow-y: auto;
          padding: 0 0 40px;
        }

        /* Navigation section */
        .nav {
          padding: 28px 0 0;
        }
        .nav-section-label {
          font-family: var(--mono);
          font-size: 8px;
          letter-spacing: .28em;
          text-transform: uppercase;
          color: var(--dim);
          padding: 0 36px 10px;
          opacity: 0.6;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 36px;
          cursor: pointer;
          position: relative;
          transition: background .1s ease;
          text-decoration: none;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }
        .nav-item:hover {
          background: rgba(var(--Gr),0.06);
        }
        .nav-item.active {
          background: var(--nav-active-bg);
        }
        /* Gold left accent on active item */
        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 4px; bottom: 4px;
          width: 2px;
          background: var(--G);
          filter: drop-shadow(0 0 5px var(--G));
        }
        /* Icon box */
        .nav-icon {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(var(--Gr),0.15);
          flex-shrink: 0;
          transition: border-color .1s, filter .1s;
        }
        .nav-item:hover   .nav-icon,
        .nav-item.active  .nav-icon {
          border-color: rgba(var(--Gr),0.45);
          filter: drop-shadow(0 0 4px rgba(var(--Gr),0.3));
        }
        .nav-icon svg {
          width: 14px; height: 14px;
          stroke: var(--dim);
          fill: none;
          stroke-width: 1.5;
          stroke-linecap: square;
          transition: stroke .1s;
        }
        .nav-item:hover   .nav-icon svg,
        .nav-item.active  .nav-icon svg { stroke: var(--G); }

        .nav-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-mid);
          letter-spacing: .01em;
          transition: color .1s;
        }
        .nav-item:hover  .nav-label { color: var(--text); }
        .nav-item.active .nav-label { color: var(--nav-active-text); }

        .nav-sub {
          font-family: var(--mono);
          font-size: 8px;
          color: var(--dim);
          letter-spacing: .08em;
          margin-left: auto;
        }
        .nav-item.active .nav-sub {
          color: rgba(var(--Gr),0.7);
        }

        /* Thin gold separator between nav groups */
        .nav-sep {
          height: 1px;
          margin: 14px 36px;
          background: linear-gradient(90deg, rgba(var(--Gr),0.25), transparent);
        }



        /* ── Right panel — cards + detail ── */
        .content {
          flex: 1;
          min-width: 0;
          padding: 40px 48px 80px 52px;
          overflow-y: auto;
          opacity: 0; transform: translateY(8px);
          transition: opacity .45s .1s ease, transform .45s .1s ease;
        }
        .content.in { opacity:1; transform:translateY(0); }

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
          color: var(--dim);
          letter-spacing: .12em;
        }
        .bar-ct strong {
          color: var(--G);
          font-weight: 400;
          filter: drop-shadow(0 0 4px rgba(240,220,128,.7));
        }

        /* ── Prism grid — original sizing, 3 cols ── */
        .grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 180px));
          column-gap: 72px;
          row-gap: 140px;
          padding-top: 120px;
          padding-bottom: 40px;
        }

        /* ── Prism card ── */
        .prism {
          position: relative;
          background: var(--card-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border);
          cursor: pointer;
          overflow: visible;
          opacity: 0;
          animation: rise .38s ease forwards;
          transition: border-color .12s ease, box-shadow .12s ease, transform .10s ease;
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
          background: var(--card-hover);
          border-color: rgba(var(--Gr),0.55);
          box-shadow:
            inset 0 0 60px rgba(212,175,90,0.08),
            inset 0 -30px 40px rgba(212,175,90,0.05),
            0 0 0 1px rgba(212,175,90,0.18),
            0 8px 32px rgba(0,0,0,0.6),
            0 0 24px rgba(212,175,90,0.10);
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
          bottom: 18%;
          width: 1px;
          height: 18px;
          border-radius: 1px;
          background: linear-gradient(to top, var(--G), transparent);
          box-shadow: 0 0 3px 0px var(--G);
          opacity: 0;
          z-index: 8;  /* above sprite (4), vignettes (5), edges (2) */
        }
        .prism.is-main:hover .particle,
        .prism.is-main.sel   .particle {
          animation: shimmer-rise var(--dur) ease-in-out var(--delay) infinite;
        }
        @keyframes shimmer-rise {
          0%   { transform: translate(var(--tx), 0)       scaleY(1);   opacity: 0;   }
          10%  { opacity: 0.9; }
          50%  { opacity: 0.6; }
          85%  { opacity: 0.2; }
          100% { transform: translate(var(--tx), -140px)  scaleY(0.3); opacity: 0;   }
        }

        /* ── Main card hover — Crown bloom ── */
        .prism.is-main:hover, .prism.is-main.sel {
          border-color: rgba(212,175,90,0.90);
          box-shadow:
            0 0 0 1px rgba(212,175,90,0.60),
            0 0 40px rgba(212,175,90,0.32),
            0 0 80px rgba(212,175,90,0.14),
            0 0 120px rgba(180,140,50,0.08),
            inset 0 0 50px rgba(212,175,90,0.10),
            inset 0 -40px 60px rgba(212,175,90,0.06);
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
          height: 110px;          /* visible zone inside the card border */
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
          transition: filter .12s ease, transform .12s ease;
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
          top: -100px;            /* reach up to cover the full sprite height */
          bottom: 0;
          width: 28%;
          pointer-events: none;
          z-index: 5;
        }
        /* Left vignette */
        .prism-sprite-wrap::before {
          left: 0;
          background: linear-gradient(to right,
            rgba(10,8,4,0.80) 0%,
            rgba(10,8,4,0.40) 40%,
            transparent 100%);
        }
        /* Right vignette */
        .prism-sprite-wrap::after {
          right: 0;
          background: linear-gradient(to left,
            rgba(10,8,4,0.80) 0%,
            rgba(10,8,4,0.40) 40%,
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
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: letter-spacing .12s ease, filter .12s ease, color .12s ease;
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
          color: var(--dim);
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
          background: var(--card-hover);
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
          color: var(--text); line-height:1;
          margin-bottom: 4px;
          text-shadow: 0 0 40px rgba(240,220,128,0.15);
        }
        .det-sub {
          font-family: var(--mono);
          font-size: 9px; color: var(--dim);
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
          text-transform: uppercase; color: var(--dim);
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
          font-size: 9px; color: var(--dim);
          letter-spacing: .24em; text-transform: uppercase;
        }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(var(--Gr),0.25); }
      `}</style>

      <div className="root">
        <Background/>

        <div className="layout">

          {/* ── Left: Sidebar dashboard ── */}
          <aside className={`sidebar ${mounted ? "in" : ""}`}>
            <div className="sidebar-hdr">
              <div className="sidebar-eyebrow">Bera · AbyssGuild</div>
              <div className="sidebar-name">Abyss<br/>Guild</div>
              <div className="sidebar-meta">
                <div className="sidebar-dot"/>
                <span className="sidebar-server">Online</span>
                <span className="sidebar-count">
                  <strong>{characters.length}</strong> characters
                </span>
              </div>
            </div>

            <div className="sidebar-body">
              <nav className="nav">
                <div className="nav-section-label">Character</div>

                {[
                  { id:"experience", label:"Experience", sub:"EXP",
                    icon:<><line x1="3" y1="12" x2="11" y2="12"/><polyline points="8 8 12 12 8 16"/><rect x="1" y="3" width="14" height="18" rx="0"/></> },
                  { id:"equipment",  label:"Equipment",  sub:"GEAR",
                    icon:<><rect x="2" y="6" width="12" height="8"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="8" y1="14" x2="8" y2="18"/></> },
                ].map(item => (
                  <button key={item.id}
                    className={`nav-item${navPage===item.id?" active":""}`}
                    onClick={() => setNavPage(item.id)}>
                    <div className="nav-icon">
                      <svg viewBox="0 0 16 16">{item.icon}</svg>
                    </div>
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-sub">{item.sub}</span>
                  </button>
                ))}

                <div className="nav-sep"/>
                <div className="nav-section-label">Daily &amp; Weekly</div>

                {[
                  { id:"dailies",  label:"Dailies",  sub:"DAY",
                    icon:<><circle cx="8" cy="8" r="6"/><line x1="8" y1="4" x2="8" y2="8"/><line x1="8" y1="8" x2="11" y2="10"/></> },
                  { id:"weeklies", label:"Weeklies", sub:"WK",
                    icon:<><rect x="2" y="2" width="12" height="12"/><line x1="2" y1="6" x2="14" y2="6"/><line x1="6" y1="2" x2="6" y2="6"/><line x1="10" y1="2" x2="10" y2="6"/></> },
                  { id:"bosses",   label:"Bosses",   sub:"BOSS",
                    icon:<><polygon points="8 2 14 14 2 14"/><line x1="8" y1="7" x2="8" y2="10"/><line x1="8" y1="12" x2="8" y2="13"/></> },
                ].map(item => (
                  <button key={item.id}
                    className={`nav-item${navPage===item.id?" active":""}`}
                    onClick={() => setNavPage(item.id)}>
                    <div className="nav-icon">
                      <svg viewBox="0 0 16 16">{item.icon}</svg>
                    </div>
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-sub">{item.sub}</span>
                  </button>
                ))}
              </nav>


            </div>
          </aside>

          {/* ── Right: Cards + detail ── */}
          <main className={`content ${mounted ? "in" : ""}`}>

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
                          <div className="det-lbl">Potential</div>
                        </div>
                        <div className="det-stat">
                          <div className="det-val" style={{ color: "#999" }}>{sel.type}</div>
                          <div className="det-lbl">Job</div>
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

          </main>
        </div>
      </div>
    </>
  );
}
