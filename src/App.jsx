import { useState, useEffect, useRef } from "react";

// ── Animated background — base + floating dust only ─────────────────────────
function Background() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const PI2 = Math.PI * 2;

    // no dust here — rendered in SidebarDust component above sidebar

    let t = 0;
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Warm near-black base
      ctx.fillStyle = "#0F0C06";
      ctx.fillRect(0, 0, W, H);
      const warm = ctx.createRadialGradient(W*0.5, H*0.5, 0, W*0.5, H*0.5, W*0.7);
      warm.addColorStop(0,  "rgba(55,42,12,0.20)");
      warm.addColorStop(0.6,"rgba(32,24, 6,0.08)");
      warm.addColorStop(1,  "rgba(0,0,0,0)");
      ctx.fillStyle = warm; ctx.fillRect(0, 0, W, H);



      t++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{position:"fixed",inset:0,width:"100%",height:"100%",zIndex:0,pointerEvents:"none"}}/>;
}


// ── Dust canvas rendered inside the sidebar, above sidebar content ────────────
function SidebarDust() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const PI2 = Math.PI * 2;

    const dust = Array.from({length: 55}, () => ({
      x:  Math.random(),
      y:  Math.random(),
      r:  0.2 + Math.random() * 0.55,
      vx: (Math.random() - 0.5) * 0.00008,
      vy: -(0.00014 + Math.random() * 0.00024),
      ph: Math.random() * PI2,
      al: 0.06 + Math.random() * 0.22,
    }));

    let t = 0;
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      for (const d of dust) {
        d.x += d.vx; d.y += d.vy;
        if (d.y < -0.01) { d.y = 1.01; d.x = Math.random(); }
        if (d.x < 0) d.x = 1; if (d.x > 1) d.x = 0;

        // Brighter near the two light bars (top: 22px, bottom: 22px)
        const nearTop = Math.max(0, 1 - Math.abs(d.y * H - 22)  / 80);
        const nearBtm = Math.max(0, 1 - Math.abs(d.y * H - (H - 22)) / 80);
        const boost   = 1 + (nearTop + nearBtm) * 2.8;
        const shimmer = 0.35 + 0.65 * Math.sin(t * 0.0020 + d.ph);
        const al = d.al * shimmer * boost;
        if (al < 0.008) continue;

        ctx.beginPath();
        ctx.arc(d.x * W, d.y * H, d.r, 0, PI2);
        ctx.fillStyle = `rgba(255,254,227,${Math.min(al, 0.78)})`;
        ctx.fill();
      }

      t++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        zIndex: 5, pointerEvents: "none",
      }}
    />
  );
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

  // Lock page scroll — bar must stay fixed at viewport bottom
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

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

        html, body { background: #0a0804; margin:0; padding:0; overflow:hidden; height:100vh; }
        body {
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          color: var(--text);
          background: var(--bg);
        }

        /* Root transparent so canvas orbs show through */
        .root {
          height: 100vh;
          background: transparent;
          position: relative;
          z-index: 1;
          overflow: hidden;
        }

        /* ── Root layout — full viewport, two columns ── */
        .layout {
          display: flex;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        /* ── Left panel — dashboard, fixed width ── */
        .sidebar {
          width: 380px;
          min-width: 380px;
          height: 100vh;
          background: var(--sidebar-bg);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-right: 1px solid var(--border);
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          opacity: 0; transform: translateX(-12px);
          transition: opacity .5s ease, transform .5s ease;
        }
        .sidebar.in { opacity:1; transform:translateX(0); }

        /* TOP bar — sits just above eyebrow text, flush with sidebar */
        .sidebar::before {
          content: '';
          position: absolute;
          top: 22px; left: 0; right: 0;
          height: 1px;
          background: rgba(255,254,227,0.95);
          box-shadow:
            0 0 4px 2px   rgba(255,254,227,1.00),
            0 0 12px 6px  rgba(252,240,175,0.70),
            0 0 30px 14px rgba(245,222,135,0.40),
            0 0 60px 28px rgba(232,205,100,0.18),
            0 0 100px 45px rgba(218,188,75,0.07);
          z-index: 10;
          pointer-events: none;
        }

        /* BOTTOM bar — mirrors top, same distance from bottom edge */
        .sidebar-floor {
          position: absolute;
          bottom: 22px; left: 0; right: 0;
          height: 1px;
          background: rgba(255,254,227,0.95);
          box-shadow:
            0 0 4px 2px   rgba(255,254,227,1.00),
            0 0 12px 6px  rgba(252,240,175,0.70),
            0 0 30px 14px rgba(245,222,135,0.40),
            0 0 60px 28px rgba(232,205,100,0.18),
            0 0 100px 45px rgba(218,188,75,0.07);
          z-index: 10;
          pointer-events: none;
        }

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
          height: 100vh;
          min-width: 0;
          padding: 40px 48px 80px 52px;
          overflow-y: auto;
          box-sizing: border-box;
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
          letter-spacing: .02em;
          color: #f0e8d0;
          filter: drop-shadow(0 0 6px rgba(212,175,90,0.45));
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

      <div className="root" style={{height:"100vh",overflow:"hidden",position:"relative"}}>
        <Background/>

        <div className="layout">

          {/* ── Left: Sidebar dashboard ── */}
          <aside className={`sidebar ${mounted ? "in" : ""}`}><div className="sidebar-floor"/><SidebarDust/>
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
