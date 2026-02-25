# 🍁 Maple Track

A MapleStory character account tracker. Built with React + Vite.
Live at: **maple-track.pages.dev**

---

## Project Structure

```
maple-track/
├── src/
│   ├── App.jsx              # Main tracker UI — all components currently live here
│   ├── main.jsx             # React entry point
│   ├── index.css            # Global reset
│   ├── components/          # Empty — ready for splitting out components
│   ├── data/
│   │   └── characters.js    # Character data + Grandis theme list
│   └── styles/
│       └── palette.js       # All colors and theme tokens
├── public/
│   └── favicon.svg          # Maple leaf SVG
├── index.html
├── vite.config.js
└── package.json
```

## Getting Started

```bash
npm install
npm run dev
```

---

## Design System

Inspired by the **Blue Archive** game interface — clean white cards, soft sky-blue
palette, rounded corners, minimal shadows. All BA-specific references removed,
replaced with MapleStory content.

### Palette (src/styles/palette.js)
- Primary accent: `#3b9fd6` (sky blue)
- Background: gradient `#e8f4fd` → `#d0eaf8`
- Text: dark `#1a2a3a`, mid `#4a6a80`, light `#8aaabb`
- Gold (Main badge): `#f0b429`

### Card anatomy
- **Portrait area**: diagonal corner cut bottom-right, job color side stripe,
  diagonal stripe texture, halo ring around avatar initial circle
- **Info area**: name, class, job type pill, divider, level + badge pill
- **Bottom bar**: 3px job-color accent strip
- **Halo**: gold = Main, blue = Champ, grey = WIP

### Job colors
- Warrior `#e05048` · Thief `#9060d8` · Magician/Mage `#3b9fd6` · Pirate `#e09020`

---

## Navigation (top-right of header)

`NavIcons` component renders two sections:

1. **Themes button** (separated left) — palette icon, dropdown of 9 Grandis areas.
   Stores selection in state but does NOT yet apply visual changes.
2. **Nav row**: Roster (active, blue) · Bosses (red) · Dailies (green) · Settings (grey)
   — all placeholders except Roster.

---

## Characters (src/data/characters.js)

16 characters, all Grandis-level (250+):

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

## Grandis Themes — NEXT PRIORITY

The dropdown already lists all 9 areas. Next step: selecting a theme applies
a visual skin to the entire UI.

### Planned palettes per area:

| Area | Vibe | Colors |
|------|------|--------|
| Cernium | Holy city, sun god, golden divine | Ivory, gold, cream, amber |
| Burning Cernium | City on fire, ruins, red lightning | Crimson, ember orange, ash grey |
| Hotel Arcus | Desert, retro roadside hotel, dusty americana | Sandy tan, rust, faded turquoise, dusk purple |
| Odium | Cloud laboratory, sterile, oriental robots | Cold steel blue, ivory, navy, mint |
| Shangri-La | Sage realm, four seasons, Chinese myth | Cherry blossom, jade, sunset gold, misty white |
| Arteria | Enemy battleship, military, imposing | Gunmetal, violet-black, cold white, red |
| Carcion | Coral reef, tropical, Anima tribes | Teal, coral, sea green, sandy gold, bioluminescent blue |
| Tallahart | Grave of Gods, ruins, phantasmal night | Deep purple-blue, moonsilver, ghostly white, stone grey |
| Geardrak | Underground workshop, furnace, mechanical | Copper, forge orange, iron black, volcanic amber |

### Implementation plan:
- Add `activeTheme` state in App, pass down as context or prop
- Each theme: `{ bg, bgGradient, accent, portraitBg, decorColor }`
- `BGDecor` blobs + grid tint to theme
- Card portrait gradient shifts to theme colors
- Side stripe blends job color + theme accent
- Header breadcrumb bar uses theme accent

---

## Planned Features

- [ ] **Grandis themes** ← do this next
- [ ] Boss tracker page (weekly boss reset checklist)
- [ ] Daily / weekly checklist page
- [ ] Character detail view on card click
- [ ] Persistent storage (localStorage → Supabase)
- [ ] Character image slots (transparent PNG from MapleStory Wiki)

---

## Stack
- React 18 + Vite 5
- Cloudflare Pages (maple-track.pages.dev)
- Repo: github.com/rera-create/maple-track
