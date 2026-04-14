# Claude Code prompt — templates feature

## Context
Read `HANDOFF.md` and `src/templates.js` before starting. The templates file contains
starter recipes for 15 brew styles organized into 4 groups. Your job is to wire it into
the app so users can pick a template when creating a new batch.

---

## What to build

### 1. Grouped dropdown on "New batch"

Currently `createNewBatch()` in `main.js` creates a blank batch immediately. Change this:

When the user clicks "+ New batch", show a simple modal or inline panel (your call on approach — keep it minimal) with:
- A grouped `<select>` dropdown using `<optgroup>` for each group from `TEMPLATE_GROUPS`
- A "Start from scratch" option at the top (value = "blank")
- A "Create batch" button that dismisses and creates the batch

Import `TEMPLATE_GROUPS`, `ALL_TYPES`, and the default export `TEMPLATES` from `./templates.js`.

The grouped select should look like:
```
-- Start from scratch --
─── Mead ───────────────
  Traditional Mead
  Melomel
  Metheglin
  Cyser
  Braggot
  Bochet
─── Beer ───────────────
  Ale
  IPA
  ...etc
```

### 2. Apply template to new batch

When a template is selected and "Create batch" is clicked:

```js
const template = TEMPLATES[selectedType]; // e.g. TEMPLATES["Melomel"]

const batch = {
  ...EMPTY_BATCH,
  id:          newId(),
  name:        `New ${selectedType}`,       // e.g. "New Melomel"
  style:       template.style,
  status:      STATUS.FERMENTING,
  startDate:   new Date().toISOString().slice(0, 10),
  batchSize:   template.batchSize,
  targetABV:   template.targetABV,
  notes:       template.notes,

  ingredients: template.ingredients.map(ing => ({
    id:     newId(),
    name:   ing.name,
    amount: ing.amount,
    unit:   ing.unit || "",
    note:   ing.note || "",   // ingredients have a note field — make sure it's stored
  })),

  steps: template.steps.map((step, i) => ({
    id:          newId(),
    order:       i,
    text:        step.text,
    note:        step.note || "",
    completed:   false,
    completedAt: null,
  })),

  gravityLog:   [],
  tastingNotes: [],
  processLog:   [],
};
```

"Start from scratch" = blank batch as before (existing behavior).

### 3. Ingredient note field

The ingredient data model has a `note` field (e.g. "Divide into 2 doses over 2 days") but the
current `renderIngredientRow()` doesn't display it. Add it:

- **Read mode / brew mode**: show below the ingredient name as small muted text, same as `step-note` style
- **Edit mode**: add a fourth input field for the note, full-width below the name/amount/unit row

Also update the ingredient change handler to persist the `note` field alongside name/amount/unit.

### 4. Style field update

Currently the `style` field in the meta form is a plain `<select>` with a flat list. Replace it
with a grouped select using `<optgroup>` from `TEMPLATE_GROUPS` (same structure as the
new batch modal). Import from `templates.js`.

---

## What NOT to change

- Don't touch the tab rendering, brew mode, export/import, share link, or gravity/tasting/process tabs
- Don't change the visual design or CSS variables
- Don't add any new dependencies
- Keep everything in the existing files (templates.js is already created — don't recreate it)

---

## Files to touch
- `src/main.js` — all the changes above
- `src/style.css` — add styles for the modal/panel and ingredient note field only

## File NOT to touch
- `src/templates.js` — already complete, do not modify
- `src/data.js` — no changes needed
- `index.html` — no changes needed
