# AbyssGuild Tracker

A character select screen for tracking MapleStory characters across the AbyssGuild on Bera. Built with React.

![preview](preview.png)

---

## What it does

- Displays all guild characters with level, job, and potential tier
- Filter by role: **Main**, **Farming**, or **In Progress**
- Click any character to see their details and log in
- Animated background with rotating radar rings and drifting gold light

---

## Setup

Requires Node.js and a React project scaffold (Vite recommended).

```bash
npm create vite@latest maple-tracker -- --template react
cd maple-tracker
npm install
```

Replace `src/App.jsx` with `CharSelect.jsx` from this repo, then rename the component export or update your `main.jsx` import accordingly:

```jsx
// src/main.jsx
import App from './CharSelect'
```

Then run:

```bash
npm run dev
```

---

## Adding your characters

Edit the `characters` array at the top of `CharSelect.jsx`:

```js
const characters = [
  { name: "Yunli", cls: "Ren", type: "Warrior", level: 288, badge: "Main" },
  // ...
];
```

| Field   | Description                                      |
|---------|--------------------------------------------------|
| `name`  | Character name (also used as image filename)     |
| `cls`   | Class name as it appears in-game                 |
| `type`  | Job branch: `Warrior`, `Magician`, `Thief`, `Pirate` |
| `level` | Current level                                    |
| `badge` | `Main`, `Farming`, or `In Progress`              |

---

## Adding character images

Images are loaded from a Cloudflare R2 bucket. To set this up:

1. Go to your Cloudflare dashboard → **R2** → create a bucket (e.g. `maple-chars`)
2. Upload PNGs named to match the character's `name` field, lowercase:
   ```
   yunli.png
   lecia.png
   gremory.png
   ```
3. Enable **Public Access** on the bucket and copy the public URL
4. In `CharSelect.jsx`, set the image base URL constant near the top of the file:
   ```js
   const IMG_BASE = "https://pub-xxxx.r2.dev";
   ```

Images are designed to overflow out of the top of each card. Recommended sprite size: **160×220px** with the character centered and transparent background.

---

## Potential tiers

Tier colors match the in-game potential system:

| Badge         | Potential  | Color  |
|---------------|------------|--------|
| Main          | Legendary  | Green  |
| Farming       | Unique     | Amber  |
| In Progress   | Epic       | Purple |

---

## Built with

- [React](https://react.dev) + [Vite](https://vitejs.dev)
- Canvas API for background animation
- Google Fonts: Bebas Neue, DM Sans, DM Mono
- No external UI libraries
