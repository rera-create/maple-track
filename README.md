# Abyss Guild Tracker
### MapleStory GMS — Crown Patch · Personal Guild Dashboard

---

## What This Is

A single-page web app for tracking characters, boss clears, dailies, and weeklies across a MapleStory account. Built as a React artifact with a custom Crown-themed aesthetic matching the new MapleStory Crown patch boss (찬란한 흥성).

---

## Current State

### ✅ What's Working Well

**Visual Design**
- Crown theme: warm olive-black `#0F0C06` base, `#FFFEE3` near-white gold accents
- Two floating light bars on the sidebar (`::before` / `.sidebar-floor`) — pure `box-shadow` with no fill, clipped at sidebar edge with `overflow: hidden`
- Sidebar dust particle system (`SidebarDust` component) — canvas mounted *inside* the sidebar at `z-index: 5`, 120 particles that glow brighter near the light bars
- Animated magic circle (`Circuitry` component) — 5 concentric rings, 3 dense Greek letter bands, cardinal/diagonal spears with stars at tips, 4-spoke gear wheels, all rotating at different speeds. Shimmering pulse animation, three-tone gold/amber/white color palette
- `PrismCard` — character cards with sprite images from R2 CDN, tier-colored badge glows, hover/select states
- Sidebar navigation with active states, section labels, icon+label+shortcode layout

**Architecture**
- SPA navigation — `navPage` state controls which page renders in the right panel, no routing library needed
- Character data as a static array — easy to edit manually for now
- Separate canvas components for background (`Background`), sidebar dust (`SidebarDust`), and magic circle (`Circuitry`) — clean separation
- All scroll locked to the right panel only — `document.body.style.overflow = 'hidden'` enforced on mount

**Pages Wired Up**
- Experience (characters page) — fully built, filter by All/Main/Farming/In Progress
- Equipment, Dailies, Weeklies, Bosses — placeholder shells ready to build

---

### ⚠️ What Was Painful / Lessons Learned

**Canvas rendering**
- `ctx.strokeStyle = linearGradient` throws a silent TypeError — gradients only work as `fillStyle`. Fix: use a thin `fillRect` instead of `stroke` for gradient lines
- `rgba(225,205,155,NaN)` in `addColorStop` crashes the whole draw loop silently. Always guard alpha values with `isFinite()` before passing to canvas gradient APIs
- `position: fixed` canvas elements do NOT follow scroll — they're always viewport-relative. The "bar following scroll" issue was actually the *page* scrolling, not the canvas moving. Fix: lock `html`, `body`, `.root`, and `.layout` to `height: 100vh; overflow: hidden`, and give the right panel its own `overflow-y: auto`
- `mix-blend-mode: screen` on pseudo-elements doesn't work reliably when the parent has `backdrop-filter`. Use pure `box-shadow` with no background fill instead
- Canvas mounted behind the sidebar (`z-index: 0`) is invisible — dust particles must live inside the sidebar as their own canvas component

**CSS specificity traps**
- `min-height: 100vh` on any ancestor allows page scroll even when `overflow: hidden` is set. Must use `height: 100vh` (not min-height) everywhere in the layout chain
- Pseudo-element `box-shadow` bleeds past parent edges unless parent has `overflow: hidden` — but `overflow: hidden` on sidebar clips the dust canvas too, so order of fixes matters

**Artifact caching**
- The Claude.ai artifact viewer sometimes serves a cached version of the file. Workaround: present the file under a new name (e.g. `App_fresh.jsx`) to force a fresh load

**What didn't work visually**
- Radar/scanning arc background — too busy, replaced
- Pillar-of-light columns — canvas strokeStyle gradient crash, replaced
- Hexagonal wireframe pattern — looked messy, removed
- Lances/diamond pointers on the magic circle — overpowered the letters, removed in favor of narrower spears
- Top/bottom event horizon bars on the full page — canvas approach was flawed; moving them to the sidebar as CSS was the right call

---

## File Structure

```
App_fresh.jsx          — main file, everything in one component
```

**Component tree:**
```
App
├── Background          — fixed canvas: warm base color + floating dust (full page)
├── SidebarDust         — canvas inside sidebar: 120 dust particles, glow near bars  
├── Circuitry           — canvas inside .content: animated magic circle
├── PlaceholderPage     — shell for unbuilt pages
└── PrismCard           — individual character card with sprite + stats
```

**State:**
```
navPage    — which page is active (experience / equipment / dailies / weeklies / bosses)
filter     — character filter (All / Main / Farming / In Progress)
selected   — selected character for detail panel
mounted    — animation entry trigger
hovered    — hovered card for detail panel preview
```

---

## Character Data

Stored as a static array in `App_fresh.jsx`. Each character:
```js
{ name, cls, type, level, badge, img }
// badge: "Main" | "Farming" | "In Progress"
// img: key for R2 CDN sprite URL
```

Sprites served from: `https://pub-2f8b565f5d5e4601814c638f74967ba9.r2.dev`

---

## Pages — What To Build Next

### Bosses (highest priority for daily use)
Track which characters have cleared which bosses each week. 

**Suggested structure:**
- Row per character, column per boss
- Bosses: Zakum, Chaos Zakum, Horntail, Chaos Horntail, Pink Bean, Chaos Pink Bean, Cygnus, Lotus, Damien, Lucid, Will, Gloom, Verus Hilla, Chosen Seren, Kalos, Kaling, Limbo (Crown boss)
- Checkboxes that reset weekly (Sunday midnight KST)
- Crystal meso value calculated automatically
- Filter to show only characters above minimum level for each boss

### Dailies
Per-character daily task checklist.

**Suggested structure:**
- Arcane Symbol quests (characters 200+)
- Sacred Symbol quests (characters 260+)  
- Daily attendance / maple reward
- Legion coin dailies
- Checkboxes reset at midnight KST

### Weeklies
- Weekly boss crystals (links to Bosses page)
- Guild quest contribution
- Maple Tour
- Resets Sunday midnight KST

### Equipment
Less urgent — very complex to do well.

**Options:**
- Simple: manually log Star Force count, flame score per character
- Complex: equipment set tracker (Arcane, Sacred, Eternal)
- Probably not worth building until the other pages are done

### Experience
Currently shows the character grid. Could add:
- EXP bar per character (would need manual input or API)
- Level history graph
- % to next level

---

## Data Persistence — Decision Needed

Currently all data resets on page refresh. Options:

| Option | Complexity | Best for |
|--------|-----------|----------|
| `localStorage` | Low | Personal use, single device |
| Cloudflare D1 (SQL) | Medium | Multi-device, persistent |
| MapleStory API (GMS) | High | Automated — but GMS API is unreliable/unofficial |

**Recommendation:** Start with `localStorage` for boss/daily checkboxes. It's instant, zero backend, and can be migrated to D1 later without changing the UI components.

---

## Known Issues / Tech Debt

- Character data is hardcoded — needs a way to add/edit/remove characters
- No data persistence — boss clears, dailies reset on refresh
- Magic circle only renders in the Experience page — should probably persist across all pages
- Mobile layout not considered yet
- No dark/light theme toggle (Crown theme only)
- R2 sprite URLs are public but unprotected

---

## Color Reference

```
Background:   #0F0C06  (warm olive-black)
Gold primary: #F0DC80  (luminescent pale gold)
Gold accent:  rgba(240,220,128,...)
Light bars:   #FFFEE3  (near-white gold)
Magic circle: rgba(255,254,227) / rgba(255,220,80) / rgba(255,180,40)
Tier colors:
  Main (Legendary): #7eff7e
  Farming (Unique): #ffe080  
  In Progress (Epic): #c89fff
```
