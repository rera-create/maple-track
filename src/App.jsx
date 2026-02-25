import { useState, createContext, useContext } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Job colors
// ─────────────────────────────────────────────────────────────────────────────
const JOB_COLORS = {
  Warrior:  "#e05048",
  Thief:    "#9060d8",
  Magician: "#3b9fd6",
  Mage:     "#3b9fd6",
  Pirate:   "#e09020",
};

// ─────────────────────────────────────────────────────────────────────────────
// Characters
// ─────────────────────────────────────────────────────────────────────────────
const characters = [
  { name: "Yunli",    cls: "Ren",          type: "Warrior",  level: 288, badge: "Main"  },
  { name: "Lecia",    cls: "Hero",         type: "Warrior",  level: 287, badge: "Champ" },
  { name: "Gremory",  cls: "Cadena",       type: "Thief",    level: 270, badge: "Champ" },
  { name: "Guilty",   cls: "Bishop",       type: "Magician", level: 268, badge: "Champ" },
  { name: "Iono",     cls: "Lynn",         type: "Magician", level: 263, badge: "Champ" },
  { name: "Yutet",    cls: "Demon Slayer", type: "Warrior",  level: 262, badge: "WIP"   },
  { name: "Kisaki",   cls: "Khali",        type: "Thief",    level: 260, badge: "WIP"   },
  { name: "Kasel",    cls: "Kanna",        type: "Magician", level: 260, badge: "WIP"   },
  { name: "Filene",   cls: "Fire/Poison",  type: "Mage",     level: 260, badge: "WIP"   },
  { name: "Aijou",    cls: "Battle Mage",  type: "Magician", level: 260, badge: "WIP"   },
  { name: "Fuyuko",   cls: "Aran",         type: "Warrior",  level: 260, badge: "WIP"   },
  { name: "Solais",   cls: "Sia Astelle",  type: "Magician", level: 253, badge: "WIP"   },
  { name: "Cordelia", cls: "Adele",        type: "Warrior",  level: 252, badge: "WIP"   },
  { name: "Ramizel",  cls: "Lara",         type: "Magician", level: 251, badge: "WIP"   },
  { name: "Yubel",    cls: "Shade",        type: "Warrior",  level: 251, badge: "WIP"   },
  { name: "Ramuh",    cls: "Buccaneer",    type: "Pirate",   level: 250, badge: "WIP"   },
];

// ─────────────────────────────────────────────────────────────────────────────
// Default palette (sky blue / Blue Archive vibes)
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_THEME = {
  id: null,
  label: "Default",
  // Backgrounds
  bgFrom:    "#e8f4fd",
  bgMid:     "#f0f8ff",
  bgTo:      "#d0eaf8",
  // Blobs
  blobColor: "rgba(59,159,214,0.07)",
  // Grid
  gridColor: "#dbeaf5",
  // Accent (links, active states, filters)
  accent:    "#3b9fd6",
  accentL:   "#6dbfe8",
  accentD:   "#1a6fa0",
  // Cards
  cardBg:    "#ffffff",
  cardBorder:"#dbeaf5",
  // Portrait gradient overlay (mixed with job color)
  portraitFrom: "rgba(59,159,214,0.13)",
  portraitTo:   "rgba(208,234,248,1)",
  // Breadcrumb label color
  crumbAccent: "#1a6fa0",
  // Nav pills/bg
  navBg:     "#ffffff",
  // Swatch color in dropdown
  swatch:    "#dbeaf5",
  // Text
  textD:     "#1a2a3a",
  textM:     "#4a6a80",
  textL:     "#8aaabb",
  // Decor diamond color
  diamondColor: "#3b9fd6",
};

// ─────────────────────────────────────────────────────────────────────────────
// Grandis themes
// ─────────────────────────────────────────────────────────────────────────────
const GRANDIS_THEME_DEFS = {
  "cernium": {
    label: "Cernium",
    swatch: "#f0b429",
    bgFrom:    "#fffbf0",
    bgMid:     "#fff8e1",
    bgTo:      "#fef3c7",
    blobColor: "rgba(240,180,41,0.08)",
    gridColor: "#f5e8c0",
    accent:    "#d4920a",
    accentL:   "#f0b429",
    accentD:   "#a06808",
    cardBg:    "#fffdf5",
    cardBorder:"#f0d890",
    portraitFrom: "rgba(240,180,41,0.18)",
    portraitTo:   "rgba(255,251,240,1)",
    crumbAccent: "#a06808",
    navBg:     "#fffdf5",
    diamondColor: "#d4920a",
    textD:     "#2a1e08",
    textM:     "#6a4e18",
    textL:     "#a08040",
  },
  "burning-cernium": {
    label: "Burning Cernium",
    swatch: "#e03020",
    bgFrom:    "#1a0a08",
    bgMid:     "#2a1010",
    bgTo:      "#1e0c0a",
    blobColor: "rgba(224,60,32,0.12)",
    gridColor: "rgba(224,100,60,0.15)",
    accent:    "#e84030",
    accentL:   "#ff6050",
    accentD:   "#c02818",
    cardBg:    "#251010",
    cardBorder:"#6a2018",
    portraitFrom: "rgba(232,64,48,0.28)",
    portraitTo:   "rgba(37,16,16,1)",
    crumbAccent: "#ff7060",
    navBg:     "#201010",
    diamondColor: "#e84030",
    textD:     "#ffe8e0",
    textM:     "#e0a898",
    textL:     "#906858",
  },
  "hotel-arcus": {
    label: "Hotel Arcus",
    swatch: "#c8a060",
    bgFrom:    "#f8f0e0",
    bgMid:     "#f0e4cc",
    bgTo:      "#e8d8b8",
    blobColor: "rgba(200,160,96,0.08)",
    gridColor: "#e0cca0",
    accent:    "#b86830",
    accentL:   "#d08848",
    accentD:   "#884020",
    cardBg:    "#fdf8f0",
    cardBorder:"#ddc890",
    portraitFrom: "rgba(184,104,48,0.14)",
    portraitTo:   "rgba(253,248,240,1)",
    crumbAccent: "#884020",
    navBg:     "#fdf8f0",
    diamondColor: "#b86830",
    textD:     "#281808",
    textM:     "#704030",
    textL:     "#a08060",
  },
  "odium": {
    label: "Odium",
    swatch: "#60a8d0",
    bgFrom:    "#e8f0f8",
    bgMid:     "#dce8f4",
    bgTo:      "#ccdaee",
    blobColor: "rgba(80,140,200,0.07)",
    gridColor: "#b8d0e8",
    accent:    "#2860a0",
    accentL:   "#4890c8",
    accentD:   "#184878",
    cardBg:    "#f4f8fc",
    cardBorder:"#b8d4ec",
    portraitFrom: "rgba(40,96,160,0.12)",
    portraitTo:   "rgba(244,248,252,1)",
    crumbAccent: "#184878",
    navBg:     "#f4f8fc",
    diamondColor: "#2860a0",
    textD:     "#0a1828",
    textM:     "#304868",
    textL:     "#708098",
  },
  "shangri-la": {
    label: "Shangri-La",
    swatch: "#e87890",
    bgFrom:    "#fff0f4",
    bgMid:     "#fde8f0",
    bgTo:      "#f8dce8",
    blobColor: "rgba(232,120,144,0.07)",
    gridColor: "#f8c8d8",
    accent:    "#c04870",
    accentL:   "#e87890",
    accentD:   "#903450",
    cardBg:    "#fff8fb",
    cardBorder:"#f0b8cc",
    portraitFrom: "rgba(192,72,112,0.12)",
    portraitTo:   "rgba(255,248,251,1)",
    crumbAccent: "#903450",
    navBg:     "#fff8fb",
    diamondColor: "#c04870",
    textD:     "#280a18",
    textM:     "#783050",
    textL:     "#b07888",
  },
  "arteria": {
    label: "Arteria",
    swatch: "#6048a0",
    bgFrom:    "#0e0c14",
    bgMid:     "#161220",
    bgTo:      "#100e18",
    blobColor: "rgba(96,72,160,0.14)",
    gridColor: "rgba(96,72,160,0.12)",
    accent:    "#8060d0",
    accentL:   "#a080e8",
    accentD:   "#6040a8",
    cardBg:    "#181428",
    cardBorder:"#3a2c60",
    portraitFrom: "rgba(128,96,208,0.22)",
    portraitTo:   "rgba(24,20,40,1)",
    crumbAccent: "#b090f0",
    navBg:     "#14102080",
    diamondColor: "#8060d0",
    textD:     "#e8e0f8",
    textM:     "#a898d0",
    textL:     "#685898",
  },
  "carcion": {
    label: "Carcion",
    swatch: "#20c8b0",
    bgFrom:    "#e0faf6",
    bgMid:     "#ccf4ee",
    bgTo:      "#b8eee6",
    blobColor: "rgba(32,200,176,0.09)",
    gridColor: "#90dcd4",
    accent:    "#0090a0",
    accentL:   "#20c0b0",
    accentD:   "#006878",
    cardBg:    "#f0fdfb",
    cardBorder:"#90d8cc",
    portraitFrom: "rgba(0,144,160,0.14)",
    portraitTo:   "rgba(240,253,251,1)",
    crumbAccent: "#006878",
    navBg:     "#f0fdfb",
    diamondColor: "#0090a0",
    textD:     "#082028",
    textM:     "#206070",
    textL:     "#609098",
  },
  "tallahart": {
    label: "Tallahart",
    swatch: "#6070b8",
    bgFrom:    "#0c0e1a",
    bgMid:     "#121428",
    bgTo:      "#0e1020",
    blobColor: "rgba(96,112,184,0.12)",
    gridColor: "rgba(96,112,184,0.10)",
    accent:    "#8090d0",
    accentL:   "#a0b0e8",
    accentD:   "#5060a0",
    cardBg:    "#141828",
    cardBorder:"#303860",
    portraitFrom: "rgba(96,112,184,0.20)",
    portraitTo:   "rgba(20,24,40,1)",
    crumbAccent: "#b0c0f0",
    navBg:     "#10142080",
    diamondColor: "#8090d0",
    textD:     "#e0e4f8",
    textM:     "#9098c8",
    textL:     "#506080",
  },
  "geardrak": {
    label: "Geardrak",
    swatch: "#c06820",
    bgFrom:    "#100c08",
    bgMid:     "#1a1008",
    bgTo:      "#140e06",
    blobColor: "rgba(192,104,32,0.12)",
    gridColor: "rgba(192,104,32,0.14)",
    accent:    "#d07828",
    accentL:   "#e89848",
    accentD:   "#a05010",
    cardBg:    "#1e1408",
    cardBorder:"#5a3010",
    portraitFrom: "rgba(208,120,40,0.24)",
    portraitTo:   "rgba(30,20,8,1)",
    crumbAccent: "#f0a850",
    navBg:     "#18100880",
    diamondColor: "#d07828",
    textD:     "#f8e8d0",
    textM:     "#c09060",
    textL:     "#806040",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Theme Context
// ─────────────────────────────────────────────────────────────────────────────
const ThemeCtx = createContext(DEFAULT_THEME);
const useTheme = () => useContext(ThemeCtx);

function getTheme(id) {
  if (!id) return DEFAULT_THEME;
  const def = GRANDIS_THEME_DEFS[id];
  if (!def) return DEFAULT_THEME;
  return { ...DEFAULT_THEME, ...def };
}

// ─────────────────────────────────────────────────────────────────────────────
// Halo colors (badge-driven, don't change with theme)
// ─────────────────────────────────────────────────────────────────────────────
const HALO = {
  Main:  { inner:"#ffe066", outer:"#f0b429" },
  Champ: { inner:"#90d0f8", outer:"#3b9fd6" },
  WIP:   { inner:"#e0e8f0", outer:"#a0b8c8" },
};

const GOLD   = "#f0b429";
const GOLD_D = "#c48a10";

// Type pill colors — fixed regardless of theme
const TYPE_COLORS = {
  Warrior:  { bg:"#fff0f0", text:"#c03040", border:"#f8c0c8" },
  Thief:    { bg:"#f8f0ff", text:"#7040c8", border:"#d8c0f8" },
  Magician: { bg:"#f0f6ff", text:"#2060c0", border:"#b8d4f8" },
  Mage:     { bg:"#f0f6ff", text:"#2060c0", border:"#b8d4f8" },
  Pirate:   { bg:"#fff8ec", text:"#c07010", border:"#f8dca0" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Background decor — theme-aware
// ─────────────────────────────────────────────────────────────────────────────
function BGDecor() {
  const t = useTheme();
  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, overflow:"hidden", pointerEvents:"none" }}>
      {[
        { cx:"8%",  cy:"12%", r:220 },
        { cx:"92%", cy:"8%",  r:180 },
        { cx:"85%", cy:"88%", r:240 },
        { cx:"15%", cy:"80%", r:160 },
      ].map((c,i) => (
        <div key={i} style={{
          position:"absolute",
          left:`calc(${c.cx} - ${c.r}px)`, top:`calc(${c.cy} - ${c.r}px)`,
          width:c.r*2, height:c.r*2, borderRadius:"50%",
          background:t.blobColor,
          transition:"background 0.5s ease",
        }}/>
      ))}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.4 }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={t.gridColor} strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>
      {[
        { x:"4%",  y:"30%", size:8  },
        { x:"96%", y:"20%", size:6  },
        { x:"2%",  y:"70%", size:10 },
        { x:"97%", y:"65%", size:7  },
        { x:"50%", y:"3%",  size:5  },
      ].map((d,i) => (
        <div key={i} style={{
          position:"absolute", left:d.x, top:d.y,
          width:d.size, height:d.size,
          border:`1.5px solid ${t.diamondColor}`,
          transform:"rotate(45deg)", opacity:0.15,
          transition:"border-color 0.5s ease",
        }}/>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Top nav — theme-aware
// ─────────────────────────────────────────────────────────────────────────────
function TopNav({ filter, setFilter, sortBy, setSortBy }) {
  const t = useTheme();
  const tabs = ["All", "Main", "Champ", "WIP"];
  return (
    <div style={{ position:"relative", zIndex:20, width:"100%", maxWidth:900, marginBottom:20 }}>
      {/* Breadcrumb */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, transition:"color 0.4s" }}>
        <div style={{
          width:4, height:20,
          background:`linear-gradient(180deg, ${t.accent}, ${t.accentD})`,
          borderRadius:2, transition:"background 0.4s",
        }}/>
        <span style={{
          fontSize:10, fontWeight:800, color:t.crumbAccent,
          letterSpacing:"0.18em", textTransform:"uppercase",
          transition:"color 0.4s",
        }}>Maple World</span>
        <span style={{ fontSize:10, color:t.textL, transition:"color 0.4s" }}>›</span>
        <span style={{ fontSize:10, color:t.textM, letterSpacing:"0.08em", transition:"color 0.4s" }}>
          Character Roster
        </span>
      </div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        {/* Filter tabs */}
        <div style={{
          display:"flex", gap:4,
          background:t.navBg, borderRadius:10, padding:3,
          boxShadow:`0 2px 8px rgba(0,0,0,0.08)`,
          border:`1px solid ${t.cardBorder}`,
          transition:"background 0.4s, border-color 0.4s",
        }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setFilter(tab)} style={{
              padding:"6px 16px", borderRadius:8,
              border:"none", cursor:"pointer",
              fontSize:11, fontWeight: filter===tab ? 700 : 500,
              background: filter===tab
                ? `linear-gradient(135deg, ${t.accent}, ${t.accentD})`
                : "transparent",
              color: filter===tab ? "#fff" : t.textM,
              transition:"all 0.18s ease",
              boxShadow: filter===tab ? `0 2px 8px ${t.accent}44` : "none",
            }}>{tab}</button>
          ))}
        </div>

        {/* Sort */}
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          background:t.navBg, borderRadius:8, padding:"6px 12px",
          border:`1px solid ${t.cardBorder}`,
          boxShadow:`0 2px 6px rgba(0,0,0,0.06)`,
          transition:"background 0.4s, border-color 0.4s",
        }}>
          <span style={{ fontSize:10, color:t.textL, transition:"color 0.4s" }}>Sort</span>
          {["Level","Name"].map(s => (
            <button key={s} onClick={() => setSortBy(s)} style={{
              fontSize:10, padding:"3px 10px", borderRadius:6,
              border:"none", cursor:"pointer",
              fontWeight: sortBy===s ? 700 : 400,
              background: sortBy===s ? t.cardBorder : "transparent",
              color: sortBy===s ? t.accentD : t.textL,
              transition:"all 0.15s",
            }}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Halo ring
// ─────────────────────────────────────────────────────────────────────────────
function HaloRing({ badge, size }) {
  const h = HALO[badge];
  const r = size / 2 - 3;
  const cx = size / 2;
  const id = `halo-${badge}-${size}`;
  return (
    <svg width={size} height={size} style={{ position:"absolute", inset:0, zIndex:2 }}>
      <defs>
        <radialGradient id={id} cx="50%" cy="50%">
          <stop offset="70%"  stopColor={h.inner} stopOpacity="0"/>
          <stop offset="88%"  stopColor={h.inner} stopOpacity="0.6"/>
          <stop offset="100%" stopColor={h.outer} stopOpacity="1"/>
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cx} r={r+2} fill="none"
        stroke={h.outer} strokeWidth="4" opacity="0.2"/>
      <circle cx={cx} cy={cx} r={r}   fill={`url(#${id})`}/>
      <circle cx={cx} cy={cx} r={r-1} fill="none"
        stroke={h.inner} strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Character card — theme-aware
// ─────────────────────────────────────────────────────────────────────────────
function CharCard({ char, index }) {
  const [hovered, setHovered] = useState(false);
  const t = useTheme();
  const jobColor = JOB_COLORS[char.type] || t.accent;
  const typeStyle = TYPE_COLORS[char.type] || TYPE_COLORS.Magician;
  const isMain   = char.badge === "Main";
  const PORTRAIT_H = 130;

  const badgeInfo = {
    Main:  { label:"Main",        color:GOLD,    bg:`${GOLD}18`,    border:`${GOLD}44`    },
    Champ: { label:"Champion",    color:t.accent, bg:`${t.accent}12`, border:`${t.accent}44` },
    WIP:   { label:"In Progress", color:t.textL,  bg:t.cardBorder,   border:t.cardBorder    },
  }[char.badge];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:155, borderRadius:16,
        background:t.cardBg,
        border:`1.5px solid ${hovered ? t.accentL : t.cardBorder}`,
        boxShadow: hovered
          ? `0 12px 32px ${t.accent}30, 0 2px 8px rgba(0,0,0,0.10)`
          : `0 2px 12px rgba(0,0,0,0.08)`,
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition:"all 0.22s cubic-bezier(0.34,1.56,0.64,1), background 0.4s, border-color 0.3s",
        animation:`card-rise 0.4s cubic-bezier(0.34,1.56,0.64,1) ${index*0.04+0.05}s both`,
        cursor:"pointer", overflow:"hidden", position:"relative",
      }}
    >
      {/* Portrait */}
      <div style={{
        height:PORTRAIT_H, position:"relative",
        background:`linear-gradient(155deg, ${t.portraitFrom} 0%, ${jobColor}10 50%, ${t.portraitTo} 100%)`,
        overflow:"hidden",
        transition:"background 0.4s",
      }}>
        {/* Diagonal corner cut */}
        <div style={{
          position:"absolute", bottom:0, right:0, width:0, height:0,
          borderStyle:"solid", borderWidth:"0 0 28px 28px",
          borderColor:`transparent transparent ${t.cardBg} transparent`,
          zIndex:5, transition:"border-color 0.4s",
        }}/>
        {/* Job color side stripe */}
        <div style={{
          position:"absolute", top:0, right:0,
          width:5, height:"100%",
          background:`linear-gradient(180deg, ${jobColor}, ${jobColor}44)`,
          zIndex:4,
        }}/>
        {/* Diagonal stripe texture */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.06 }}>
          <defs>
            <pattern id={`diag-${index}`} width="12" height="12"
              patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="12" stroke={jobColor} strokeWidth="3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#diag-${index})`}/>
        </svg>
        {/* Theme accent overlay shine */}
        <div style={{
          position:"absolute", inset:0,
          background:`linear-gradient(135deg, ${t.accent}0a 0%, transparent 60%)`,
          zIndex:1, transition:"background 0.4s",
        }}/>

        {/* Halo + avatar */}
        <div style={{
          position:"absolute",
          bottom: isMain ? 10 : 8,
          left:"50%", transform:"translateX(-50%)",
          width: isMain ? 80 : 68,
          height: isMain ? 80 : 68,
          zIndex:3,
        }}>
          <HaloRing badge={char.badge} size={isMain ? 80 : 68}/>
          <div style={{
            position:"absolute",
            inset: isMain ? 6 : 5,
            borderRadius:"50%",
            background:`linear-gradient(135deg, ${jobColor}cc, ${jobColor}66)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize: isMain ? 18 : 15,
            fontWeight:800, color:"#fff",
            textShadow:"0 1px 4px rgba(0,0,0,0.2)",
            boxShadow:`inset 0 2px 8px rgba(0,0,0,0.15), 0 0 0 2px ${t.cardBg}`,
            transition:"box-shadow 0.4s",
          }}>{char.name[0]}</div>
        </div>

        {/* Main badge ribbon */}
        {isMain && (
          <div style={{
            position:"absolute", top:8, right:10, zIndex:4,
            background:`linear-gradient(135deg, ${GOLD}, ${GOLD_D})`,
            color:"#fff", fontSize:7, fontWeight:800,
            padding:"3px 8px", borderRadius:4,
            letterSpacing:"0.12em",
            boxShadow:`0 2px 6px ${GOLD}66`,
          }}>MAIN</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:"10px 12px 12px" }}>
        <div style={{
          fontSize: isMain ? 14 : 13, fontWeight:800, color:t.textD,
          letterSpacing:"0.01em", marginBottom:2,
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          transition:"color 0.4s",
        }}>{char.name}</div>

        <div style={{
          fontSize:10, color:t.textL, marginBottom:8,
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          transition:"color 0.4s",
        }}>{char.cls}</div>

        <div style={{ display:"flex", gap:4, marginBottom:9 }}>
          <span style={{
            fontSize:9, fontWeight:700,
            padding:"2px 8px", borderRadius:20,
            background:typeStyle.bg, color:typeStyle.text,
            border:`1px solid ${typeStyle.border}`,
            letterSpacing:"0.04em",
          }}>{char.type}</span>
        </div>

        <div style={{ height:1, background:t.cardBorder, marginBottom:8, transition:"background 0.4s" }}/>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:3 }}>
            <span style={{
              fontSize:8, color:t.textL,
              letterSpacing:"0.08em", textTransform:"uppercase",
              transition:"color 0.4s",
            }}>Lv.</span>
            <span style={{
              fontSize:16, fontWeight:800,
              color: hovered ? t.accent : t.textD,
              lineHeight:1, transition:"color 0.2s",
            }}>{char.level}</span>
          </div>
          <div style={{
            fontSize:8, fontWeight:700,
            padding:"2px 8px", borderRadius:12,
            background:badgeInfo.bg,
            color:badgeInfo.color,
            border:`1px solid ${badgeInfo.border}`,
            letterSpacing:"0.06em",
          }}>{badgeInfo.label}</div>
        </div>
      </div>

      {/* Bottom job color bar */}
      <div style={{
        height:3,
        background:`linear-gradient(90deg, ${jobColor}, ${t.accent}66, ${jobColor}22)`,
        opacity: hovered ? 1 : 0.5,
        transition:"opacity 0.2s, background 0.4s",
      }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Nav icons — theme-aware, theme state lives here and gets lifted to App
// ─────────────────────────────────────────────────────────────────────────────
const GRANDIS_THEMES_LIST = [
  { id:"cernium",         label:"Cernium"        },
  { id:"burning-cernium", label:"Burning Cernium" },
  { id:"hotel-arcus",     label:"Hotel Arcus"     },
  { id:"odium",           label:"Odium"           },
  { id:"shangri-la",      label:"Shangri-La"      },
  { id:"arteria",         label:"Arteria"         },
  { id:"carcion",         label:"Carcion"         },
  { id:"tallahart",       label:"Tallahart"       },
  { id:"geardrak",        label:"Geardrak"        },
];

function NavIcons({ activeThemeId, setActiveThemeId }) {
  const [activeIdx,  setActiveIdx]  = useState(0);
  const [themeOpen,  setThemeOpen]  = useState(false);
  const t = useTheme();

  const NAV_ITEMS = [
    {
      label: "Roster",
      color: t.accent,
      icon: (
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <circle cx="9"  cy="7"  r="3.5" stroke="currentColor" strokeWidth="1.8"/>
          <circle cx="18" cy="7"  r="2.5" stroke="currentColor" strokeWidth="1.6" opacity="0.6"/>
          <path d="M2 19.5C2 16.5 5 14 9 14s7 2.5 7 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M15 14c2 .5 4 2 4 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.6"/>
        </svg>
      ),
    },
    {
      label: "Bosses",
      color: "#e05048",
      icon: (
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <path d="M12 3 C7 3 4 7 4 11 C4 14 6 16.5 9 17.5 L9 20 L15 20 L15 17.5 C18 16.5 20 14 20 11 C20 7 17 3 12 3Z"
            stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
          <circle cx="9"  cy="11" r="1.5" fill="currentColor"/>
          <circle cx="15" cy="11" r="1.5" fill="currentColor"/>
          <path d="M9 15 Q12 17 15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M6 5 L4 3 M18 5 L20 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7"/>
        </svg>
      ),
    },
    {
      label: "Dailies",
      color: "#20a060",
      icon: (
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="17" rx="3" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M3 9 L21 9" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M8 2 L8 6 M16 2 L16 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M7 13 L10 16 L17 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: "Settings",
      color: t.textM,
      icon: (
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  const handleSelect = (id) => {
    setActiveThemeId(id === activeThemeId ? null : id);
    setThemeOpen(false);
  };

  return (
    <div style={{ display:"flex", gap:8, alignItems:"center" }}>

      {/* ── Themes dropdown ── */}
      <div style={{ position:"relative" }}>
        <button
          onClick={() => setThemeOpen(o => !o)}
          style={{
            display:"flex", flexDirection:"column",
            alignItems:"center", gap:4,
            padding:"8px 12px", borderRadius:12,
            border:`1.5px solid ${themeOpen ? t.accentL : t.cardBorder}`,
            cursor:"pointer",
            background: themeOpen ? `${t.accent}18` : t.navBg,
            color: themeOpen ? t.accent : t.textL,
            boxShadow: themeOpen ? `0 4px 16px ${t.accent}22` : "0 2px 8px rgba(0,0,0,0.07)",
            transition:"all 0.18s ease",
            minWidth:52,
          }}
        >
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
            <circle cx="9"  cy="9"  r="1.5" fill="currentColor"/>
            <circle cx="15" cy="9"  r="1.5" fill="#e05048"/>
            <circle cx="9"  cy="15" r="1.5" fill="#20a060"/>
            <circle cx="15" cy="15" r="1.5" fill="#9060d8"/>
            <circle cx="12" cy="7"  r="1.2" fill="#e09020"/>
          </svg>
          <span style={{
            fontSize:8, fontWeight: themeOpen ? 700 : 500,
            letterSpacing:"0.06em", textTransform:"uppercase", lineHeight:1,
            color: themeOpen ? t.accent : t.textL, transition:"color 0.18s",
          }}>Theme</span>
          {activeThemeId && (
            <div style={{
              position:"absolute", top:4, right:4,
              width:6, height:6, borderRadius:"50%",
              background:t.accent, boxShadow:`0 0 6px ${t.accent}`,
            }}/>
          )}
        </button>

        {themeOpen && (
          <div style={{
            position:"absolute", top:"calc(100% + 8px)", left:0,
            background:t.cardBg,
            border:`1.5px solid ${t.cardBorder}`,
            borderRadius:14,
            boxShadow:`0 8px 28px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)`,
            overflow:"hidden",
            zIndex:100,
            minWidth:180,
            animation:"dropdown-open 0.18s cubic-bezier(0.34,1.56,0.64,1) both",
            transition:"background 0.4s",
          }}>
            <div style={{
              padding:"8px 12px 6px",
              borderBottom:`1px solid ${t.cardBorder}`,
              fontSize:8, fontWeight:700, color:t.textL,
              letterSpacing:"0.12em", textTransform:"uppercase",
              transition:"color 0.4s, border-color 0.4s",
            }}>Grandis Area</div>

            {/* Reset to default option */}
            <button
              onClick={() => handleSelect(null)}
              style={{
                display:"flex", alignItems:"center", gap:10,
                width:"100%", padding:"8px 12px",
                border:"none", cursor:"pointer", textAlign:"left",
                background: !activeThemeId ? `${t.accent}14` : "transparent",
                borderBottom:`1px solid ${t.cardBorder}`,
                transition:"background 0.14s",
              }}
              onMouseEnter={e => { if (activeThemeId) e.currentTarget.style.background = `${t.accent}08`; }}
              onMouseLeave={e => { if (activeThemeId) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{
                width:10, height:10, borderRadius:3, flexShrink:0,
                background: !activeThemeId ? t.accent : "#dbeaf5",
                border:`1px solid ${!activeThemeId ? t.accentD : "#8aaabb"}33`,
              }}/>
              <span style={{
                fontSize:11, fontWeight: !activeThemeId ? 700 : 400,
                color: !activeThemeId ? t.accentD : t.textD,
                fontStyle:"italic",
              }}>Default</span>
              {!activeThemeId && (
                <svg width={12} height={12} viewBox="0 0 12 12" style={{ marginLeft:"auto", flexShrink:0 }}>
                  <path d="M2 6 L5 9 L10 3" stroke={t.accent} strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              )}
            </button>

            {GRANDIS_THEMES_LIST.map(theme => {
              const isSelected = activeThemeId === theme.id;
              const swatchColor = GRANDIS_THEME_DEFS[theme.id]?.swatch || t.accent;
              return (
                <button key={theme.id}
                  onClick={() => handleSelect(theme.id)}
                  style={{
                    display:"flex", alignItems:"center", gap:10,
                    width:"100%", padding:"8px 12px",
                    border:"none", cursor:"pointer", textAlign:"left",
                    background: isSelected ? `${t.accent}14` : "transparent",
                    transition:"background 0.14s",
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = `${t.accent}08`; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{
                    width:10, height:10, borderRadius:3, flexShrink:0,
                    background: swatchColor,
                    border:`1px solid ${swatchColor}88`,
                    boxShadow: isSelected ? `0 0 6px ${swatchColor}88` : "none",
                    transition:"all 0.14s",
                  }}/>
                  <span style={{
                    fontSize:11, fontWeight: isSelected ? 700 : 400,
                    color: isSelected ? t.accentD : t.textD,
                    letterSpacing:"0.01em",
                  }}>{theme.label}</span>
                  {isSelected && (
                    <svg width={12} height={12} viewBox="0 0 12 12" style={{ marginLeft:"auto", flexShrink:0 }}>
                      <path d="M2 6 L5 9 L10 3" stroke={t.accent} strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ width:1, height:40, background:t.cardBorder, flexShrink:0, transition:"background 0.4s" }}/>

      {/* ── Regular nav icons ── */}
      <div style={{
        display:"flex", gap:4, alignItems:"center",
        background:t.navBg,
        border:`1.5px solid ${t.cardBorder}`,
        borderRadius:16, padding:"6px 8px",
        boxShadow:"0 2px 12px rgba(0,0,0,0.07)",
        transition:"background 0.4s, border-color 0.4s",
      }}>
        {NAV_ITEMS.map((item, i) => {
          const isActive = activeIdx === i;
          return (
            <button
              key={item.label}
              onClick={() => setActiveIdx(i)}
              title={item.label}
              style={{
                display:"flex", flexDirection:"column",
                alignItems:"center", gap:4,
                padding:"7px 10px", borderRadius:12,
                border:"none", cursor:"pointer",
                background: isActive ? `${item.color}14` : "transparent",
                color: isActive ? item.color : t.textL,
                transition:"all 0.18s ease",
                position:"relative", minWidth:46,
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.background = `${item.color}0a`;
                e.currentTarget.style.color = item.color;
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = isActive ? item.color : t.textL;
              }}
            >
              {isActive && (
                <div style={{
                  position:"absolute", top:3, left:"50%",
                  transform:"translateX(-50%)",
                  width:4, height:4, borderRadius:"50%",
                  background:item.color, boxShadow:`0 0 6px ${item.color}`,
                }}/>
              )}
              <div style={{ marginTop: isActive ? 5 : 0, transition:"margin 0.18s" }}>
                {item.icon}
              </div>
              <span style={{
                fontSize:8, fontWeight: isActive ? 700 : 500,
                letterSpacing:"0.06em", textTransform:"uppercase",
                lineHeight:1, whiteSpace:"nowrap",
              }}>{item.label}</span>
              {isActive && (
                <div style={{
                  position:"absolute", bottom:3, left:"20%", right:"20%",
                  height:2, borderRadius:1,
                  background:item.color, opacity:0.7,
                }}/>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme transition overlay
// ─────────────────────────────────────────────────────────────────────────────
function ThemeLabel({ activeThemeId }) {
  const t = useTheme();
  if (!activeThemeId) return null;
  const def = GRANDIS_THEME_DEFS[activeThemeId];
  return (
    <div style={{
      position:"fixed", bottom:24, right:24, zIndex:50,
      background:`${t.accent}18`,
      border:`1px solid ${t.accent}44`,
      borderRadius:10, padding:"6px 14px",
      display:"flex", alignItems:"center", gap:8,
      backdropFilter:"blur(8px)",
      animation:"fadeInUp 0.3s ease both",
    }}>
      <div style={{
        width:8, height:8, borderRadius:2,
        background:def?.swatch || t.accent,
        boxShadow:`0 0 8px ${def?.swatch || t.accent}`,
      }}/>
      <span style={{
        fontSize:9, fontWeight:700, color:t.crumbAccent,
        letterSpacing:"0.12em", textTransform:"uppercase",
      }}>{def?.label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [filter,        setFilter]        = useState("All");
  const [sortBy,        setSortBy]        = useState("Level");
  const [activeThemeId, setActiveThemeId] = useState(null);

  const theme = getTheme(activeThemeId);

  const filtered = characters
    .filter(c => filter === "All" || c.badge === filter)
    .sort((a,b) => sortBy === "Level" ? b.level - a.level : a.name.localeCompare(b.name));

  return (
    <ThemeCtx.Provider value={theme}>
      <>
        <style>{`
          * { margin:0; padding:0; box-sizing:border-box; }
          @keyframes card-rise {
            from { opacity:0; transform:translateY(16px) scale(0.97); }
            to   { opacity:1; transform:translateY(0)    scale(1); }
          }
          @keyframes dropdown-open {
            from { opacity:0; transform:translateY(-6px) scale(0.97); }
            to   { opacity:1; transform:translateY(0)    scale(1); }
          }
          @keyframes fadeInUp {
            from { opacity:0; transform:translateY(8px); }
            to   { opacity:1; transform:translateY(0); }
          }
        `}</style>

        <div style={{
          minHeight:"100vh",
          background:`linear-gradient(160deg, ${theme.bgFrom} 0%, ${theme.bgMid} 50%, ${theme.bgTo} 100%)`,
          display:"flex", flexDirection:"column", alignItems:"center",
          padding:"36px 24px 60px",
          fontFamily:"'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          position:"relative",
          transition:"background 0.5s ease",
        }}>
          <BGDecor/>

          {/* Header */}
          <div style={{
            position:"relative", zIndex:10,
            width:"100%", maxWidth:900,
            marginBottom:24,
            display:"flex", alignItems:"flex-start",
            justifyContent:"space-between", flexWrap:"wrap", gap:16,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <svg width={42} height={42} viewBox="0 0 100 100" fill="none" style={{ flexShrink:0 }}>
                <path
                  d="M50 8 L57 28 L72 20 L64 36 L82 34 L68 46 L78 60 L60 56 L56 76 L50 62 L44 76 L40 56 L22 60 L32 46 L18 34 L36 36 L28 20 L43 28 Z"
                  fill={theme.accent}
                  style={{ filter:`drop-shadow(0 3px 10px ${theme.accent}66)`, transition:"fill 0.4s" }}
                />
                <rect x="47" y="76" width="6" height="14" rx="3" fill={theme.accent}
                  style={{ transition:"fill 0.4s" }}/>
              </svg>
              <div>
                <h1 style={{
                  fontSize:20, fontWeight:900, color:theme.textD,
                  letterSpacing:"-0.01em", lineHeight:1,
                  transition:"color 0.4s",
                }}>Character Roster</h1>
                <div style={{
                  fontSize:10, color:theme.textL,
                  letterSpacing:"0.08em", textTransform:"uppercase", marginTop:2,
                  transition:"color 0.4s",
                }}>MapleStory · Grandis</div>
              </div>
            </div>

            <NavIcons activeThemeId={activeThemeId} setActiveThemeId={setActiveThemeId}/>
          </div>

          {/* Nav */}
          <TopNav filter={filter} setFilter={setFilter} sortBy={sortBy} setSortBy={setSortBy}/>

          {/* Cards */}
          <div style={{
            position:"relative", zIndex:5,
            display:"flex", flexWrap:"wrap",
            gap:16, justifyContent:"center", maxWidth:920,
          }}>
            {filtered.map((char, i) => (
              <CharCard key={char.name} char={char} index={i}/>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            position:"relative", zIndex:5, marginTop:36,
            display:"flex", alignItems:"center", gap:8,
          }}>
            <div style={{ width:24, height:1, background:theme.cardBorder, transition:"background 0.4s" }}/>
            <span style={{ fontSize:9, color:theme.textL, letterSpacing:"0.16em", textTransform:"uppercase", transition:"color 0.4s" }}>
              {filtered.length} characters displayed
            </span>
            <div style={{ width:24, height:1, background:theme.cardBorder, transition:"background 0.4s" }}/>
          </div>

          {/* Active theme indicator */}
          <ThemeLabel activeThemeId={activeThemeId}/>
        </div>
      </>
    </ThemeCtx.Provider>
  );
}
