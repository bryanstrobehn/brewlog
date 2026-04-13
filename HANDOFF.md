# Brewlog — handoff prompt for Claude Code

## What this is
A lightweight homebrewing batch tracker. Vanilla JS (ES modules), no framework, no build step. Open `index.html` directly in a browser.

## File structure
```
brewlog/
  index.html          ← entry point
  src/
    data.js           ← all data shapes, localStorage, import/export, share links
    main.js           ← render loop, all views, all event binding
    style.css         ← full styles, clean utilitarian aesthetic
```

## Data model (defined in data.js)
Each batch has:
- **meta**: name, style, status, batchSize, startDate, targetABV, notes
- **ingredients**: [{ id, name, amount, unit }]
- **steps**: [{ id, order, text, note, completed, completedAt }]
- **gravityLog**: [{ id, date, value, type: "OG"|"FG"|"reading" }]
- **tastingNotes**: [{ id, date, text, attributes: string[] }]
- **processLog**: [{ id, date, text }]

All stored to `localStorage` under key `brewlog_v1` as a JSON array of batches.

## What's fully working
- List view with batch cards
- Create / delete batches
- Recipe tab: edit meta fields, add/remove/edit ingredients and steps
- Process log tab: timestamped freeform entries
- Gravity tab: log OG/FG/readings, auto-calculates estimated ABV
- Tasting notes tab: text + attribute tags
- Full backup export/import (JSON)
- Single batch export (JSON)
- Shareable link (base64 encodes recipe into URL hash)
- Brew mode toggle: converts steps to a checkable list, hides editing UI

## What needs to be built next
1. **Brew mode polish** — when in brew mode the topbar should show a progress indicator (X of Y steps done). Steps should animate when checked off (subtle fade + strikethrough). Currently functional but bare.

2. **Shareable link import** — `batchFromShareUrl()` is wired in `data.js` and called in `main.js` on boot, but the result (`shared` variable) isn't handled yet. When a share link is detected, show a banner: "You're viewing a shared recipe — [Add to my batches]". Clicking the button pushes the batch (with a fresh ID) into localStorage.

3. **Gravity chart** — the gravity tab has a table but no chart. Add a simple SVG line chart (no libraries needed) that plots gravity readings over time. Show OG as a labeled starting point, FG as a dashed target line if present.

4. **Batch duplication** — add a "Duplicate" button in the batch view topbar that clones the current batch (new ID, name gets " (copy)", steps reset to uncompleted, gravity/tasting/process logs cleared).

5. **Sort/filter on list view** — small controls above the batch grid: sort by date or name, filter by status (All / Active / Complete). Client-side only, no persistence needed.

6. **Mobile brew mode** — on small screens, brew mode should be full-bleed with large tap targets for the step checkboxes (min 44px). The topbar should collapse to just "← Exit brew mode" + progress.

## Style notes
- Font: Georgia serif + Courier New mono. Do not change fonts or introduce new dependencies.
- Color accent: `#2d6a4f` (forest green). Status badges each have their own muted color (see CSS).
- No gradients, no shadows, no animations except subtle step check-off.
- Keep everything in the existing 3 files unless a new feature genuinely needs a new module.

## How to run
Just open `index.html` in a browser. No npm, no build step.
