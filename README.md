# 🍁 Maple Track

A MapleStory character account tracker. Built with React + Vite.

## Project Structure

```
maple-track/
├── src/
│   ├── App.jsx              # Main tracker UI (roster view)
│   ├── main.jsx             # React entry point
│   ├── index.css            # Global reset
│   ├── components/          # Reusable components (NavIcons, CharCard, etc.)
│   ├── data/
│   │   └── characters.js    # Character data + Grandis theme list
│   └── styles/
│       └── palette.js       # All colors and theme tokens
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js
└── package.json
```

## Getting Started

```bash
npm install
npm run dev
```

## Planned Features

- [ ] Grandis area themes per card
- [ ] Boss tracker
- [ ] Daily / weekly checklist
- [ ] Character detail view
- [ ] Persistent storage

## Tech Stack

- React 18
- Vite 5
- Deployed on Vercel
