# 🍁 Maple Track — Developer Handoff

Live: **maple-track.pages.dev** · Repo: **github.com/rera-create/maple-track**
Stack: React 18 + Vite 5 · Deployed on Cloudflare Pages (auto-deploys on push to main)

---

## Project Structure

```
maple-track/
├── src/
│   ├── App.jsx              # Main file — all components currently live here
│   ├── main.jsx             # React entry point
│   ├── index.css            # Global reset
│   ├── components/          # Empty — ready for splitting
│   ├── data/
│   │   └── characters.js    # Character data (currently inlined in App.jsx)
│   └── styles/
│       └── palette.js       # Colour tokens (currently inlined in App.jsx)
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js
└── package.json
```

---

## Design System

Inspired by the **Blue Archive** game UI — clean white cards, soft sky-blue palette,
rounded corners, minimal shadows. All BA references removed; replaced with MapleStory content.

### Default Palette
| Token | Value | Use |
|-------|-------|-----|
| accent | `#3b9fd6` | Active states, links, highlights |
| accentL | `#6dbfe8` | Hover borders |
| accentD | `#1a6fa0` | Dark accent, text |
| bg gradient | `#e8f4fd → #f0f8ff → #d0eaf8` | Page background |
| cardBg | `#ffffff` | Card backgrounds |
| cardBorder | `#dbeaf5` | Card / UI borders |
| textD | `#1a2a3a` | Primary text |
| textM | `#4a6a80` | Secondary text |
| textL | `#8aaabb` | Muted / label text |
| GOLD | `#f0b429` | Main badge, halo |

### Job Colors (fixed, never themed)
- Warrior `#e05048` · Thief `#9060d8` · Magician/Mage `#3b9fd6` · Pirate `#e09020`

### Card anatomy
- Portrait area: diagonal corner cut bottom-right, job-colour side stripe, diagonal texture, halo ring + avatar initial
- Info area: name, class, job type pill, divider, level + badge pill
- Bottom bar: 3px gradient strip (job colour → theme accent)
- Halo: gold = Main, blue = Champ, grey = WIP

---

## Characters (16 total, all Grandis-level 250+)

| Name | Class | Type | Level | Badge |
|------|-------|------|-------|-------|
| Yunli | Ren | Warrior | 288 | Main |
| Lecia | Hero | Warrior | 287 | Champ |
| Gremory | Cadena | Thief | 270 | Champ |
| Guilty | Bishop | Magician | 268 | Champ |
| Iono | Lynn | Magician | 263 | Champ |
| Yutet | Demon Slayer | Warrior | 262 | WIP |
| Kisaki | Khali | Thief | 260 | WIP |
| Kasel | Kanna | Magician | 260 | WIP |
| Filene | Fire/Poison | Mage | 260 | WIP |
| Aijou | Battle Mage | Magician | 260 | WIP |
| Fuyuko | Aran | Warrior | 260 | WIP |
| Solais | Sia Astelle | Magician | 253 | WIP |
| Cordelia | Adele | Warrior | 252 | WIP |
| Ramizel | Lara | Magician | 251 | WIP |
| Yubel | Shade | Warrior | 251 | WIP |
| Ramuh | Buccaneer | Pirate | 250 | WIP |

---

## ⚠️ CURRENT BUG — Top Priority Fix

### Grandis Theme Switcher is broken for Default + Cernium

**What exists:** A theme dropdown in the top-right `NavIcons` component lists 9 Grandis
areas plus a "Default" option. Selecting a theme is supposed to apply a full visual skin
to the entire UI (background, cards, accents, etc.) via React Context.

**What's broken:** Selecting **Default** or **Cernium** does not apply any visual change.
All other 7 themes (Burning Cernium through Geardrak) appear to work.

**Root cause (suspected):** The previous implementation was written under Claude.ai artifact
constraints (no file splitting, no external libs, everything in one JSX file). The theme
system used `useState(null)` for the default state, and several components defined
data structures (like `NAV_ITEMS`) inside component bodies that referenced theme context
values — causing stale closures and re-render loops that prevented state updates from
committing for `null` (Default) and the first real theme entry (Cernium).

**The fix:** Now that you're working directly in the repo with no constraints, please
rewrite the theme system cleanly:

1. **Use `useState("default")` instead of `useState(null)`** — never use null as a
   meaningful state value when it doubles as "no selection".

2. **Move all static data outside components** — `NAV_ITEMS`, icon arrays, anything
   that doesn't need to be recreated on every render.

3. **Consider replacing React Context with simple prop drilling or Zustand** — the
   component tree is shallow enough that prop drilling is clean, or a tiny Zustand
   store would be more reliable than context for this use case.

4. **Alternatively, use CSS custom properties (CSS variables) for theming** — this is
   the most robust approach. Define all theme tokens as CSS vars on `:root`, then swap
   them by setting a `data-theme` attribute on `<html>` or `<body>`. No React state
   involved at all for the visual change — just a one-liner DOM update. This completely
   sidesteps the re-render issue.

### Recommended CSS-var approach (cleanest solution):

```js
// In App.jsx or a themes.js file
const THEMES = {
  default:          { '--accent': '#3b9fd6', '--bg-from': '#e8f4fd', ... },
  cernium:          { '--accent': '#d4920a', '--bg-from': '#fffbf0', ... },
  'burning-cernium': { ... },
  // etc.
};

function applyTheme(id) {
  const vars = THEMES[id] || THEMES.default;
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

// In App component:
const [activeTheme, setActiveTheme] = useState('default');
useEffect(() => applyTheme(activeTheme), [activeTheme]);
```

Then in all component styles, use `var(--accent)` etc. instead of JS theme object lookups.
This means theme changes are instant, require zero re-renders, and have no closure issues.

---

## Grandis Theme Palette Reference

| Area | Vibe | accent | bg-from | cardBg | swatch |
|------|------|--------|---------|--------|--------|
| Default | Sky blue / BA | `#3b9fd6` | `#e8f4fd` | `#ffffff` | `#3b9fd6` |
| Cernium | Holy city, gold, divine | `#d4920a` | `#fffbf0` | `#fffdf5` | `#f0b429` |
| Burning Cernium | Ruins, fire, dark | `#e84030` | `#1a0a08` | `#251010` | `#e03020` |
| Hotel Arcus | Desert, dusty americana | `#b86830` | `#f8f0e0` | `#fdf8f0` | `#c8a060` |
| Odium | Cold steel, navy, sterile | `#2860a0` | `#e8f0f8` | `#f4f8fc` | `#60a8d0` |
| Shangri-La | Cherry blossom, jade | `#c04870` | `#fff0f4` | `#fff8fb` | `#e87890` |
| Arteria | Void purple, dark military | `#8060d0` | `#0e0c14` | `#181428` | `#6048a0` |
| Carcion | Coral reef, tropical teal | `#0090a0` | `#e0faf6` | `#f0fdfb` | `#20c8b0` |
| Tallahart | Phantom night, moonsilver | `#8090d0` | `#0c0e1a` | `#141828` | `#6070b8` |
| Geardrak | Forge, copper, iron black | `#d07828` | `#100c08` | `#1e1408` | `#c06820` |

Each theme also needs: `accentL` (lighter), `accentD` (darker), `bgMid`, `bgTo`,
`blobColor`, `gridColor`, `cardBorder`, `portraitFrom`, `portraitTo`, `crumbAccent`,
`navBg`, `diamondColor`, `textD`, `textM`, `textL`.

Dark themes (Burning Cernium, Arteria, Tallahart, Geardrak) have light text on dark bg.
Light themes (everything else) have dark text on light bg.

---

## Navigation (top-right header)

`NavIcons` renders two sections:

1. **Theme button** (left, separated) — palette icon, opens dropdown of 10 options
   (Default + 9 Grandis areas). Coloured swatches per area.
2. **Nav row**: Roster (active, themed accent) · Bosses (red `#e05048`) ·
   Dailies (green `#20a060`) · Settings (themed textM) — all placeholders except Roster.

---

## Planned Features (priority order)

- [x] Character roster with filtering + sorting
- [x] Grandis theme switcher UI (dropdown exists)
- [ ] **Fix theme switcher** ← DO THIS FIRST (see bug above)
- [ ] Boss tracker page (weekly boss reset checklist per character)
- [ ] Daily / weekly checklist page
- [ ] Character detail view on card click
- [ ] Persistent storage (localStorage → eventually Supabase)
- [ ] Character image slots (transparent PNG from MapleStory Wiki)
- [ ] Split App.jsx into proper component files now that we're off artifact constraints

---

## Code Quality Notes (now that we're off Claude.ai artifact constraints)

The current `App.jsx` was written entirely within Claude.ai's artifact sandbox, which
meant: no file splitting, no npm installs mid-session, everything in one file.

Now that the project runs from GitHub + Cloudflare Pages, feel free to:

- **Split into multiple files** — `components/CharCard.jsx`, `components/NavIcons.jsx`,
  `data/characters.js`, `styles/themes.js`, etc.
- **Install packages** — Zustand for state, Framer Motion for animations, etc.
- **Use proper CSS** — move inline styles to CSS modules or Tailwind
- **Clean up dead code** — the file has some leftover scaffolding from failed theme attempts

The priority is: fix the theme bug first, then optionally refactor structure.

---

## Getting Started

```bash
git clone https://github.com/rera-create/maple-track
cd maple-track
npm install
npm run dev
```
