import { useState } from "react";

// MapleStory job categories → card accent color
const JOB_COLORS = {
  Warrior:  "#e05048",
  Thief:    "#9060d8",
  Magician: "#3b9fd6",
  Mage:     "#3b9fd6",
  Pirate:   "#e09020",
};

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

// ── Palette ───────────────────────────────────────────────────────────────────
const SKY    = "#e8f4fd";
const SKY2   = "#d0eaf8";
const ACCENT = "#3b9fd6";
const ACCENT_L = "#6dbfe8";
const ACCENT_D = "#1a6fa0";
const WHITE  = "#ffffff";
const BORDER = "#dbeaf5";
const TEXT_D = "#1a2a3a";
const TEXT_M = "#4a6a80";
const TEXT_L = "#8aaabb";
const GOLD   = "#f0b429";
const GOLD_D = "#c48a10";

// Halo by badge
const HALO = {
  Main:  { inner:"#ffe066", outer:"#f0b429" },
  Champ: { inner:"#90d0f8", outer:"#3b9fd6" },
  WIP:   { inner:"#e0e8f0", outer:"#a0b8c8" },
};

// Type pill colors
const TYPE_COLORS = {
  Warrior:  { bg:"#fff0f0", text:"#c03040", border:"#f8c0c8" },
  Thief:    { bg:"#f8f0ff", text:"#7040c8", border:"#d8c0f8" },
  Magician: { bg:"#f0f6ff", text:"#2060c0", border:"#b8d4f8" },
  Mage:     { bg:"#f0f6ff", text:"#2060c0", border:"#b8d4f8" },
  Pirate:   { bg:"#fff8ec", text:"#c07010", border:"#f8dca0" },
};

// ── Background ────────────────────────────────────────────────────────────────
function BGDecor() {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, overflow:"hidden", pointerEvents:"none" }}>
      {[
        { cx:"8%",  cy:"12%", r:220, color:"rgba(59,159,214,0.07)" },
        { cx:"92%", cy:"8%",  r:180, color:"rgba(59,159,214,0.05)" },
        { cx:"85%", cy:"88%", r:240, color:"rgba(59,159,214,0.06)" },
        { cx:"15%", cy:"80%", r:160, color:"rgba(59,159,214,0.04)" },
      ].map((c,i) => (
        <div key={i} style={{
          position:"absolute",
          left:`calc(${c.cx} - ${c.r}px)`, top:`calc(${c.cy} - ${c.r}px)`,
          width:c.r*2, height:c.r*2, borderRadius:"50%",
          background:c.color,
        }}/>
      ))}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.4 }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={BORDER} strokeWidth="0.5"/>
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
          border:`1.5px solid ${ACCENT}`,
          transform:"rotate(45deg)", opacity:0.12,
        }}/>
      ))}
    </div>
  );
}

// ── Top nav ───────────────────────────────────────────────────────────────────
function TopNav({ filter, setFilter, sortBy, setSortBy }) {
  const tabs = ["All", "Main", "Champ", "WIP"];
  return (
    <div style={{ position:"relative", zIndex:20, width:"100%", maxWidth:900, marginBottom:20 }}>
      {/* Breadcrumb */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <div style={{
          width:4, height:20,
          background:`linear-gradient(180deg, ${ACCENT}, ${ACCENT_D})`,
          borderRadius:2,
        }}/>
        <span style={{
          fontSize:10, fontWeight:800, color:ACCENT_D,
          letterSpacing:"0.18em", textTransform:"uppercase",
        }}>Maple World</span>
        <span style={{ fontSize:10, color:TEXT_L }}>›</span>
        <span style={{ fontSize:10, color:TEXT_M, letterSpacing:"0.08em" }}>Character Roster</span>
      </div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        {/* Filter tabs */}
        <div style={{
          display:"flex", gap:4,
          background:WHITE, borderRadius:10, padding:3,
          boxShadow:`0 2px 8px rgba(0,0,0,0.06)`,
          border:`1px solid ${BORDER}`,
        }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding:"6px 16px", borderRadius:8,
              border:"none", cursor:"pointer",
              fontSize:11, fontWeight: filter===t ? 700 : 500,
              background: filter===t
                ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_D})`
                : "transparent",
              color: filter===t ? WHITE : TEXT_M,
              transition:"all 0.18s ease",
              boxShadow: filter===t ? `0 2px 8px ${ACCENT}44` : "none",
            }}>{t}</button>
          ))}
        </div>

        {/* Sort */}
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          background:WHITE, borderRadius:8, padding:"6px 12px",
          border:`1px solid ${BORDER}`,
          boxShadow:`0 2px 6px rgba(0,0,0,0.05)`,
        }}>
          <span style={{ fontSize:10, color:TEXT_L }}>Sort</span>
          {["Level","Name"].map(s => (
            <button key={s} onClick={() => setSortBy(s)} style={{
              fontSize:10, padding:"3px 10px", borderRadius:6,
              border:"none", cursor:"pointer",
              fontWeight: sortBy===s ? 700 : 400,
              background: sortBy===s ? BORDER : "transparent",
              color: sortBy===s ? ACCENT_D : TEXT_L,
              transition:"all 0.15s",
            }}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Halo ring ─────────────────────────────────────────────────────────────────
function HaloRing({ badge, size }) {
  const h = HALO[badge];
  const r = size / 2 - 3;
  const cx = size / 2;
  const id = `halo-${badge}`;
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

// ── Character card ────────────────────────────────────────────────────────────
function CharCard({ char, index }) {
  const [hovered, setHovered] = useState(false);
  const jobColor = JOB_COLORS[char.type] || ACCENT;
  const typeStyle = TYPE_COLORS[char.type] || TYPE_COLORS.Magician;
  const isMain   = char.badge === "Main";
  const PORTRAIT_H = 130;

  // Badge label + color
  const badgeInfo = {
    Main:  { label:"Main",     color:GOLD,   bg:`${GOLD}18`,   border:`${GOLD}44`   },
    Champ: { label:"Champion", color:ACCENT, bg:`${ACCENT}12`, border:`${ACCENT}44` },
    WIP:   { label:"In Progress", color:TEXT_L, bg:"#f0f4f8", border:BORDER         },
  }[char.badge];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:155, borderRadius:16,
        background:WHITE,
        border:`1.5px solid ${hovered ? ACCENT_L : BORDER}`,
        boxShadow: hovered
          ? `0 12px 32px rgba(59,159,214,0.18), 0 2px 8px rgba(0,0,0,0.08)`
          : `0 2px 12px rgba(0,0,0,0.06)`,
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition:"all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        animation:`card-rise 0.4s cubic-bezier(0.34,1.56,0.64,1) ${index*0.04+0.05}s both`,
        cursor:"pointer", overflow:"hidden", position:"relative",
      }}
    >
      {/* Portrait */}
      <div style={{
        height:PORTRAIT_H, position:"relative",
        background:`linear-gradient(155deg, ${jobColor}22 0%, ${jobColor}08 60%, ${SKY2} 100%)`,
        overflow:"hidden",
      }}>
        {/* Diagonal corner cut */}
        <div style={{
          position:"absolute", bottom:0, right:0, width:0, height:0,
          borderStyle:"solid", borderWidth:"0 0 28px 28px",
          borderColor:`transparent transparent ${WHITE} transparent`,
          zIndex:5,
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
            fontWeight:800, color:WHITE,
            textShadow:"0 1px 4px rgba(0,0,0,0.2)",
            boxShadow:`inset 0 2px 8px rgba(0,0,0,0.15), 0 0 0 2px ${WHITE}`,
          }}>{char.name[0]}</div>
        </div>

        {/* Main badge ribbon */}
        {isMain && (
          <div style={{
            position:"absolute", top:8, right:10, zIndex:4,
            background:`linear-gradient(135deg, ${GOLD}, ${GOLD_D})`,
            color:WHITE, fontSize:7, fontWeight:800,
            padding:"3px 8px", borderRadius:4,
            letterSpacing:"0.12em",
            boxShadow:`0 2px 6px ${GOLD}66`,
          }}>MAIN</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:"10px 12px 12px" }}>
        {/* Name */}
        <div style={{
          fontSize: isMain ? 14 : 13, fontWeight:800, color:TEXT_D,
          letterSpacing:"0.01em", marginBottom:2,
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
        }}>{char.name}</div>

        {/* Class */}
        <div style={{
          fontSize:10, color:TEXT_L, marginBottom:8,
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
        }}>{char.cls}</div>

        {/* Type pill */}
        <div style={{ display:"flex", gap:4, marginBottom:9 }}>
          <span style={{
            fontSize:9, fontWeight:700,
            padding:"2px 8px", borderRadius:20,
            background:typeStyle.bg, color:typeStyle.text,
            border:`1px solid ${typeStyle.border}`,
            letterSpacing:"0.04em",
          }}>{char.type}</span>
        </div>

        {/* Divider */}
        <div style={{ height:1, background:BORDER, marginBottom:8 }}/>

        {/* Level + badge */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:3 }}>
            <span style={{
              fontSize:8, color:TEXT_L,
              letterSpacing:"0.08em", textTransform:"uppercase",
            }}>Lv.</span>
            <span style={{
              fontSize:16, fontWeight:800,
              color: hovered ? ACCENT : TEXT_D,
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
        background:`linear-gradient(90deg, ${jobColor}, ${jobColor}22)`,
        opacity: hovered ? 1 : 0.5,
        transition:"opacity 0.2s",
      }}/>
    </div>
  );
}

// ── Nav icons ─────────────────────────────────────────────────────────────────
const GRANDIS_THEMES = [
  { id:"cernium",         label:"Cernium"         },
  { id:"burning-cernium", label:"Burning Cernium"  },
  { id:"hotel-arcus",     label:"Hotel Arcus"      },
  { id:"odium",           label:"Odium"            },
  { id:"shangri-la",      label:"Shangri-La"       },
  { id:"arteria",         label:"Arteria"          },
  { id:"carcion",         label:"Carcion"          },
  { id:"tallahart",       label:"Tallahart"        },
  { id:"geardrak",        label:"Geardrak"         },
];

const NAV_ITEMS = [
  {
    label: "Roster",
    color: ACCENT,
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
    color: TEXT_M,
    icon: (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    ),
  },
];

function NavIcons() {
  const [activeIdx,    setActiveIdx]    = useState(0);
  const [themeOpen,    setThemeOpen]    = useState(false);
  const [activeTheme,  setActiveTheme]  = useState(null);

  return (
    <div style={{ display:"flex", gap:8, alignItems:"center" }}>

      {/* ── Themes dropdown — far left ── */}
      <div style={{ position:"relative" }}>
        <button
          onClick={() => setThemeOpen(o => !o)}
          style={{
            display:"flex", flexDirection:"column",
            alignItems:"center", gap:4,
            padding:"8px 12px",
            borderRadius:12,
            border:`1.5px solid ${themeOpen ? ACCENT_L : BORDER}`,
            cursor:"pointer",
            background: themeOpen ? `${ACCENT}10` : WHITE,
            color: themeOpen ? ACCENT : TEXT_L,
            boxShadow: themeOpen
              ? `0 4px 16px ${ACCENT}22`
              : "0 2px 8px rgba(0,0,0,0.05)",
            transition:"all 0.18s ease",
            minWidth:52,
          }}
        >
          {/* Palette icon */}
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
            style={{ color: themeOpen ? ACCENT : TEXT_L, transition:"color 0.18s" }}>
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
            color: themeOpen ? ACCENT : TEXT_L, transition:"color 0.18s",
          }}>Theme</span>
          {activeTheme && (
            <div style={{
              position:"absolute", top:4, right:4,
              width:6, height:6, borderRadius:"50%",
              background:ACCENT, boxShadow:`0 0 6px ${ACCENT}`,
            }}/>
          )}
        </button>

        {/* Dropdown panel */}
        {themeOpen && (
          <div style={{
            position:"absolute", top:"calc(100% + 8px)", left:0,
            background:WHITE,
            border:`1.5px solid ${BORDER}`,
            borderRadius:14,
            boxShadow:`0 8px 28px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)`,
            overflow:"hidden",
            zIndex:100,
            minWidth:170,
            animation:"dropdown-open 0.18s cubic-bezier(0.34,1.56,0.64,1) both",
          }}>
            {/* Header row */}
            <div style={{
              padding:"8px 12px 6px",
              borderBottom:`1px solid ${BORDER}`,
              fontSize:8, fontWeight:700, color:TEXT_L,
              letterSpacing:"0.12em", textTransform:"uppercase",
            }}>Grandis Area</div>
            {GRANDIS_THEMES.map(theme => {
              const isSelected = activeTheme === theme.id;
              return (
                <button key={theme.id}
                  onClick={() => { setActiveTheme(theme.id); setThemeOpen(false); }}
                  style={{
                    display:"flex", alignItems:"center", gap:10,
                    width:"100%", padding:"8px 12px",
                    border:"none", cursor:"pointer", textAlign:"left",
                    background: isSelected ? `${ACCENT}10` : "transparent",
                    transition:"background 0.14s",
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = `${ACCENT}08`; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Color swatch — placeholder, will be themed later */}
                  <div style={{
                    width:10, height:10, borderRadius:3, flexShrink:0,
                    background: isSelected ? ACCENT : BORDER,
                    border:`1px solid ${isSelected ? ACCENT_D : TEXT_L}33`,
                    transition:"background 0.14s",
                  }}/>
                  <span style={{
                    fontSize:11, fontWeight: isSelected ? 700 : 400,
                    color: isSelected ? ACCENT_D : TEXT_D,
                    letterSpacing:"0.01em",
                  }}>{theme.label}</span>
                  {isSelected && (
                    <svg width={12} height={12} viewBox="0 0 12 12" style={{ marginLeft:"auto", flexShrink:0 }}>
                      <path d="M2 6 L5 9 L10 3" stroke={ACCENT} strokeWidth="1.8"
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
      <div style={{ width:1, height:40, background:BORDER, flexShrink:0 }}/>

      {/* ── Regular nav icons ── */}
      <div style={{
        display:"flex", gap:4, alignItems:"center",
        background:WHITE,
        border:`1.5px solid ${BORDER}`,
        borderRadius:16,
        padding:"6px 8px",
        boxShadow:"0 2px 12px rgba(0,0,0,0.06)",
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
                color: isActive ? item.color : TEXT_L,
                transition:"all 0.18s ease",
                position:"relative", minWidth:46,
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.background = `${item.color}0a`;
                e.currentTarget.style.color = item.color;
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = isActive ? item.color : TEXT_L;
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

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Level");

  const filtered = characters
    .filter(c => filter === "All" || c.badge === filter)
    .sort((a,b) => sortBy === "Level" ? b.level - a.level : a.name.localeCompare(b.name));



  return (
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
      `}</style>

      <div style={{
        minHeight:"100vh",
        background:`linear-gradient(160deg, ${SKY} 0%, #f0f8ff 50%, ${SKY2} 100%)`,
        display:"flex", flexDirection:"column", alignItems:"center",
        padding:"36px 24px 60px",
        fontFamily:"'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        position:"relative",
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
            {/* MapleStory maple leaf — clean filled logo mark */}
            <svg width={42} height={42} viewBox="0 0 100 100" fill="none"
              style={{ flexShrink:0 }}>
              <path
                d="M50 8
                   L57 28
                   L72 20
                   L64 36
                   L82 34
                   L68 46
                   L78 60
                   L60 56
                   L56 76
                   L50 62
                   L44 76
                   L40 56
                   L22 60
                   L32 46
                   L18 34
                   L36 36
                   L28 20
                   L43 28 Z"
                fill={ACCENT}
                style={{ filter:`drop-shadow(0 3px 10px ${ACCENT}66)` }}
              />
              {/* Stem */}
              <rect x="47" y="76" width="6" height="14" rx="3" fill={ACCENT}/>
            </svg>
            <div>
              <h1 style={{
                fontSize:20, fontWeight:900, color:TEXT_D,
                letterSpacing:"-0.01em", lineHeight:1,
              }}>Character Roster</h1>
              <div style={{
                fontSize:10, color:TEXT_L,
                letterSpacing:"0.08em", textTransform:"uppercase", marginTop:2,
              }}>MapleStory · Grandis</div>
            </div>
          </div>

          <NavIcons />
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
          <div style={{ width:24, height:1, background:BORDER }}/>
          <span style={{ fontSize:9, color:TEXT_L, letterSpacing:"0.16em", textTransform:"uppercase" }}>
            {filtered.length} characters displayed
          </span>
          <div style={{ width:24, height:1, background:BORDER }}/>
        </div>
      </div>
    </>
  );
}
