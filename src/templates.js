// templates.js — starter templates for each brew subtype
// Each template provides ingredients and steps as a starting point.
// Steps follow Bryan's 8-phase mead structure, adapted per style.
// All amounts/notes are guidelines — user should edit after applying.

export const TEMPLATE_GROUPS = [
  {
    group: "Mead",
    types: ["Traditional Mead", "Melomel", "Metheglin", "Cyser", "Braggot", "Bochet"],
  },
  {
    group: "Beer",
    types: ["Ale", "IPA", "Stout", "Porter", "Wheat", "Lager"],
  },
  {
    group: "Cider & Wine",
    types: ["Cider", "Wine"],
  },
  {
    group: "Other",
    types: ["Kombucha", "Other"],
  },
];

// Flat list of all types for the dropdown
export const ALL_TYPES = TEMPLATE_GROUPS.flatMap(g => g.types);

// ─── Shared building blocks ───────────────────────────────────────────────────

const MEAD_BASE_INGREDIENTS = [
  { name: "Honey",                   amount: "2.5–3.5", unit: "lbs",    note: "Adjust for target sweetness. ~2.5 lbs = drier, ~3.5 lbs = sweeter." },
  { name: "Water (spring or filtered)", amount: "to 1",  unit: "gal",   note: "Avoid chlorinated tap water — kills yeast." },
  { name: "Yeast (Lalvin 71B)",      amount: "1",       unit: "packet", note: "71B works well for fruit/floral meads. D47 for traditional/cool ferments." },
  { name: "Yeast nutrient (Fermaid-O or similar)", amount: "1", unit: "tsp", note: "Divide into 2 doses over first 2 days." },
  { name: "Yeast energizer",         amount: "0.5",     unit: "tsp",    note: "Divide into 2 doses over first 2 days." },
  { name: "Wine tannins (Vinter's Best)", amount: "0.25", unit: "tsp",  note: "Adds structure and mouthfeel. Adjust to taste." },
  { name: "Potassium sorbate",       amount: "0.5",     unit: "tsp",    note: "For stabilizing before back-sweetening. Use ~0.5 tsp per gallon." },
  { name: "Potassium metabisulfite", amount: "0.0625",  unit: "tsp",    note: "Just a little — 1/16 tsp per gallon. Add before sorbate, wait 24h." },
  { name: "Pectic enzyme",           amount: "0.75",    unit: "tsp",    note: "Helps with clarity. Can add again (~1 tsp) post-fermentation." },
  { name: "Unflavored gelatin",      amount: "0.2",     unit: "tsp",    note: "For fining/clarifying. 1/5 tsp per gallon. Bloom in hot water first." },
];

const MEAD_BASE_STEPS = [
  {
    phase: "Sanitize",
    text: "Sanitize all equipment",
    note: "Use Star San or similar. Sanitize: carboy, airlock, bung, hydrometer, graduated cylinder, turkey baster, funnel, auto-siphon, any mixing tools. Do this first — you don't want time passing between prep and pitch.",
  },
  {
    phase: "Prepare ingredients",
    text: "Prepare honey must",
    note: "Dissolve honey in a small amount of warm water in a sanitized bowl or pot. Use as little water as possible — just enough to make it pourable. Then add to carboy.",
  },
  {
    phase: "Pitch & must",
    text: "Combine must and pitch yeast",
    note: "Add honey solution to carboy. Top up with water to ~1 gallon, leaving some headspace. Add tannins and first dose of nutrient + energizer. Rehydrate yeast in ~104°F water for 15 min, then pitch. Take OG hydrometer reading. Seal with airlock (add vodka or sanitizer to airlock). Store in cool, dark place.",
  },
  {
    phase: "Fermentation",
    text: "Primary fermentation",
    note: "Monitor daily. Swirl gently (don't shake) to help yeast. Add second dose of nutrient + energizer after 24-48h. Fermentation typically takes 2–4 weeks — use your hydrometer, not the calendar. Take readings every ~1 week, then every 3 days near the end. Stable SG across 2 readings = done. Taste each time.",
  },
  {
    phase: "Stabilize",
    text: "Stabilize before back-sweetening",
    note: "Optional but recommended if you plan to sweeten. Add potassium metabisulfite first, wait 24h, then add sorbate. Gently stir each time. Don't skip the 24h wait between them.",
  },
  {
    phase: "Back-sweeten",
    text: "Back-sweeten and adjust",
    note: "Taste and add honey to desired sweetness. Dissolve honey in a tiny amount of warm water first. Add slowly and taste as you go — easier to add more than to take out. Top up headspace with water if needed.",
  },
  {
    phase: "Clarify",
    text: "Clarify and prepare for bottling",
    note: "Add pectic enzyme (1 tsp — works less efficiently post-fermentation, so use more). Cold crash in fridge for ~3 days. Then bloom gelatin (1/5 tsp per gallon in hot water) and gently add to cold mead. Leave another 3–7 days for maximum clarity.",
  },
  {
    phase: "Bottle",
    text: "Bottle and age",
    note: "Final taste test — last chance to adjust sweetness. Take FG reading and calculate ABV. Sanitize bottles, siphon, corks, and corking tool (2–3 min soak, no longer). Use auto-siphon to rack into bottles without disturbing sediment. Cork, label, and store away from light and vibration. Age at least 2–3 months — longer is better.",
  },
];

// ─── Template definitions ─────────────────────────────────────────────────────

const TEMPLATES = {

  // ── Mead family ─────────────────────────────────────────────────────────────

  "Traditional Mead": {
    style: "Traditional Mead",
    batchSize: "1 gal",
    targetABV: "~12–14%",
    notes: "Classic honey mead. Just honey, water, and yeast — let the honey speak for itself. Wildflower or clover honey are great starting points.",
    ingredients: MEAD_BASE_INGREDIENTS,
    steps: MEAD_BASE_STEPS,
  },

  "Melomel": {
    style: "Melomel",
    batchSize: "1 gal",
    targetABV: "~12–15%",
    notes: "Mead with fruit. Fruit can go in primary (bolder, more fermented flavor), secondary (fresher, brighter), or split between both. Frozen then thawed fruit works well — freezing breaks cell walls for better juice extraction.",
    ingredients: [
      { name: "Honey",                  amount: "2.5–3.5", unit: "lbs",    note: "2.75 lbs for primary, remainder for back-sweetening." },
      { name: "Fruit (frozen, thawed)", amount: "2–4",     unit: "lbs",    note: "Your choice. ~4 lbs for a bold fruit-forward mead. Can split between primary and secondary." },
      { name: "Water (spring)",         amount: "to 1",    unit: "gal",    note: "Less if fruit contributes significant liquid." },
      { name: "Yeast (Lalvin 71B)",     amount: "1",       unit: "packet", note: "71B is great for preserving fruit esters." },
      { name: "Yeast nutrient",         amount: "1",       unit: "tsp",    note: "Split into 2 doses over first 2 days." },
      { name: "Yeast energizer",        amount: "0.5",     unit: "tsp",    note: "Split into 2 doses over first 2 days." },
      { name: "Pectic enzyme",          amount: "0.75",    unit: "tsp",    note: "Helps extract juice and aids clarity." },
      { name: "Wine tannins",           amount: "0.25",    unit: "tsp",    note: "Optional, adds structure." },
      { name: "Potassium sorbate",      amount: "0.5",     unit: "tsp",    note: "For stabilizing before back-sweetening." },
      { name: "Potassium metabisulfite",amount: "0.0625",  unit: "tsp",    note: "1/16 tsp per gallon. Add 24h before sorbate." },
      { name: "Unflavored gelatin",     amount: "0.2",     unit: "tsp",    note: "For fining. Bloom in hot water first." },
    ],
    steps: [
      {
        phase: "Sanitize",
        text: "Sanitize all equipment",
        note: "Include juicer/blender/food processor, mesh bags, any fruit prep equipment. Do this before touching the fruit so no time passes between prep and pitch.",
      },
      {
        phase: "Prepare ingredients",
        text: "Prepare fruit for pitching",
        note: "Options: (a) juice the fruit — press/blend, strain through mesh bag, pasteurize at ~160°F for 10 min, then cool before adding to carboy. (b) add whole/crushed fruit directly to primary. Juicing = cleaner flavor, whole fruit = more body and tannin. If using frozen fruit, thaw fully first. Freeze → thaw → re-freeze → thaw once more for best cell wall breakdown.",
      },
      {
        phase: "Prepare ingredients",
        text: "Add pectic enzyme to fruit juice, wait 1 hour",
        note: "Pectic enzyme helps with juice extraction and clarity. Add to the juice and let sit at least 1 hour before combining with honey must. You can sanitize other equipment during this wait.",
      },
      {
        phase: "Pitch & must",
        text: "Combine fruit, honey, and pitch yeast",
        note: "⚠️ Let pasteurized juice cool to 100–120°F before adding to carboy — hot liquid can shatter glass. Add honey dissolved in warm water, then fruit. Top to 1 gal leaving headspace. Add tannins, first dose of nutrient + energizer. Rehydrate yeast at ~104°F for 15 min, pitch. Take OG reading. Seal with airlock.",
      },
      {
        phase: "Fermentation",
        text: "Primary fermentation",
        note: "Monitor daily. Swirl gently. Second dose of nutrient + energizer at 24–48h. Watch for fruit cap (whole fruit floats) — push it down or stir daily to prevent mold. 2–4 weeks typically. Use hydrometer to confirm done (stable SG across 2 readings).",
      },
      {
        phase: "Stabilize",
        text: "Stabilize before back-sweetening",
        note: "Siphon off fruit cap/sediment into clean carboy if needed. Add potassium metabisulfite, wait 24h, then add sorbate.",
      },
      {
        phase: "Back-sweeten",
        text: "Back-sweeten — fruit juice and/or honey",
        note: "Can back-sweeten with honey alone, or add more pasteurized fruit juice for a fresher fruit punch. Taste as you go. Adding more juice here brightens the fruit flavor; honey alone is richer and deeper.",
      },
      {
        phase: "Clarify",
        text: "Clarify and prepare for bottling",
        note: "Add pectic enzyme (1 tsp). Cold crash 3 days. Bloom and add gelatin. Wait another 3–7 days.",
      },
      {
        phase: "Bottle",
        text: "Bottle and age",
        note: "Final taste test. FG reading. Sanitize everything. Rack carefully with auto-siphon. Cork, label, store. Age minimum 2–3 months.",
      },
    ],
  },

  "Metheglin": {
    style: "Metheglin",
    batchSize: "1 gal",
    targetABV: "~12–14%",
    notes: "Mead with herbs and/or spices. Herbs/spices can be added during primary (more integrated, can lose delicate notes) or as a secondary infusion (fresher, more pronounced, easier to control). Secondary is usually the safer approach.",
    ingredients: [
      { name: "Honey",                  amount: "2.5–3.5", unit: "lbs",    note: "" },
      { name: "Water (spring)",         amount: "to 1",    unit: "gal",    note: "" },
      { name: "Herbs/spices of choice", amount: "",        unit: "",       note: "E.g. lavender (1–2 tbsp), chamomile (1–2 tbsp), vanilla bean (½–1 pod), cinnamon stick (1), ginger, rose hips, etc. Start conservative — you can always add more." },
      { name: "Yeast (Lalvin 71B or D47)", amount: "1",   unit: "packet", note: "D47 preserves delicate floral notes but needs cooler ferment temps (60–65°F)." },
      { name: "Yeast nutrient",         amount: "1",       unit: "tsp",    note: "Split into 2 doses." },
      { name: "Yeast energizer",        amount: "0.5",     unit: "tsp",    note: "Split into 2 doses." },
      { name: "Potassium sorbate",      amount: "0.5",     unit: "tsp",    note: "" },
      { name: "Potassium metabisulfite",amount: "0.0625",  unit: "tsp",    note: "" },
      { name: "Unflavored gelatin",     amount: "0.2",     unit: "tsp",    note: "" },
    ],
    steps: [
      MEAD_BASE_STEPS[0],
      {
        phase: "Prepare ingredients",
        text: "Prepare herb/spice infusion (if using for primary)",
        note: "Optional: make a tea by simmering herbs in 1–2 cups water for 10 min, then strain and cool. This sanitizes the botanicals and lets you control the flavor concentration. Alternatively, sanitize whole spices with vodka (works for vanilla beans, cinnamon sticks).",
      },
      MEAD_BASE_STEPS[2],
      MEAD_BASE_STEPS[3],
      MEAD_BASE_STEPS[4],
      MEAD_BASE_STEPS[5],
      {
        phase: "Back-sweeten",
        text: "Back-sweeten and add secondary herb infusion",
        note: "This is often the better time to add herbs — you have more control. Sanitize herbs in vodka or make a fresh tea. Taste every day or two and remove when intensity is right. Delicate herbs (lavender, chamomile) 2–5 days; bold spices (vanilla, cinnamon) 3–10 days.",
      },
      MEAD_BASE_STEPS[6],
      MEAD_BASE_STEPS[7],
    ],
  },

  "Cyser": {
    style: "Cyser",
    batchSize: "1 gal",
    targetABV: "~12–14%",
    notes: "Apple mead. Replaces most of the water with apple cider and often includes whole diced apples in primary. Can also add cinnamon/spices in secondary. Use unpasteurized cider from a farmer's market if possible.",
    ingredients: [
      { name: "Honey",                  amount: "2–2.75",  unit: "lbs",    note: "Less honey than traditional since cider adds fermentable sugars. ~2 lbs for drier, more cider-forward; 2.75 lbs for richer." },
      { name: "Apple cider (fresh)",    amount: "0.5",     unit: "gal",    note: "Unpasteurized if possible. Fills half the volume." },
      { name: "Apples, diced small",    amount: "3–4",     unit: "large",  note: "Discard core and seeds. Dice small for surface area. Sanitize with Star San." },
      { name: "Water (spring)",         amount: "to 1",    unit: "gal",    note: "Top up to 1 gal — you'll need much less since cider fills most of it." },
      { name: "Cinnamon sticks",        amount: "1–2",     unit: "",       note: "Add in secondary, not primary. Sanitize by boiling in water for 10 min. Taste every 2–3 days; remove when strong enough." },
      { name: "Yeast (Lalvin 71B)",     amount: "1",       unit: "packet", note: "" },
      { name: "Yeast nutrient",         amount: "1",       unit: "tsp",    note: "Split 2 doses." },
      { name: "Yeast energizer",        amount: "0.5",     unit: "tsp",    note: "Split 2 doses." },
      { name: "Pectic enzyme",          amount: "1",       unit: "tsp",    note: "Helps with apple clarity. Can add another tsp ~1 week before bottling." },
      { name: "Wine tannins",           amount: "0.25",    unit: "tsp",    note: "" },
      { name: "Potassium sorbate",      amount: "0.5",     unit: "tsp",    note: "" },
      { name: "Potassium metabisulfite",amount: "0.0625",  unit: "tsp",    note: "" },
      { name: "Unflavored gelatin",     amount: "0.2",     unit: "tsp",    note: "" },
    ],
    steps: [
      { phase: "Sanitize", text: "Sanitize all equipment including apple prep tools", note: "Don't forget to sanitize the apples themselves. You don't need to sanitize the cinnamon now — that comes later." },
      { phase: "Prepare ingredients", text: "Dice apples and add pectic enzyme, wait 1 hour", note: "Discard core and seeds. Dice small. Add to carboy with pectic enzyme, let sit 1 hour before adding honey/cider. This maximizes juice extraction." },
      { phase: "Pitch & must", text: "Combine cider, honey, apples, and pitch yeast", note: "Dissolve honey in warm water, add to carboy. Pour in cider. Top up to 1 gal with water if needed — leave headspace, this ferments vigorously. Add tannins, half of nutrient + energizer. Rehydrate yeast, pitch. Take OG reading. Airlock." },
      { phase: "Fermentation", text: "Primary fermentation", note: "Monitor daily. The apple pieces will form a fruit cap — push it down or stir daily to prevent mold. Vigorous fermentation expected. Swirl gently. Add second nutrient dose at 24–48h. 2–4 weeks, check with hydrometer." },
      { phase: "Fermentation", text: "Rack to secondary, add cinnamon", note: "Once primary fermentation slows and fruit cap looks mushy, rack to a clean carboy using auto-siphon, leaving apples and sediment behind. Sanitize cinnamon sticks (boil in water 10 min, cool). Add to secondary. Optional: add more honey here for sweetness. Monitor over next few days in case fermentation restarts." },
      { phase: "Fermentation", text: "Remove cinnamon, taste and adjust", note: "Taste every 2–3 days starting from when cinnamon was added. Remove when the flavor is right (usually 3–7 days). Less is more — it intensifies as it ages. Rack to new carboy if needed to leave lees behind." },
      { phase: "Stabilize", text: "Stabilize before back-sweetening", note: "Potassium metabisulfite, wait 24h, then sorbate." },
      { phase: "Back-sweeten", text: "Back-sweeten with honey", note: "Taste and add honey to desired sweetness. Remember the cinnamon flavor will also evolve — don't over-sweeten." },
      { phase: "Clarify", text: "Clarify: pectic enzyme, cold crash, gelatin", note: "Add 1 tsp pectic enzyme. Cold crash 3 days. Bloom gelatin, add gently. Wait 3–7 more days." },
      { phase: "Bottle", text: "Bottle and age", note: "Final taste + FG reading. Sanitize everything. Rack with auto-siphon. Cork, label, store. Age 3–6 months minimum — the apple and cinnamon round out a lot over time." },
    ],
  },

  "Braggot": {
    style: "Braggot",
    batchSize: "1 gal",
    targetABV: "~8–12%",
    notes: "Half mead, half beer. Honey + malted grain. Treat it like a beer brew day but replace some or all of the fermentable sugars with honey. Can be hopped or unhopped.",
    ingredients: [
      { name: "Honey",                  amount: "1–1.5",   unit: "lbs",    note: "Less than a traditional mead — grain provides the other fermentables." },
      { name: "Pale malt (or DME)",     amount: "1",       unit: "lb",     note: "Can use dry malt extract (DME) for simplicity — no mash needed. Or steep specialty grains." },
      { name: "Specialty grain (optional)", amount: "0.25", unit: "lb",    note: "Crystal malt for sweetness/body, roasted barley for stout character, etc." },
      { name: "Hops (optional)",        amount: "0.5",     unit: "oz",     note: "Add during a short boil. Bittering hops balance the sweetness." },
      { name: "Water",                  amount: "to 1",    unit: "gal",    note: "" },
      { name: "Yeast (Safale US-05 or Lalvin 71B)", amount: "1", unit: "packet", note: "Beer yeast for more traditional braggot, wine/mead yeast for higher ABV or wine-like character." },
      { name: "Yeast nutrient",         amount: "0.5",     unit: "tsp",    note: "" },
    ],
    steps: [
      { phase: "Sanitize", text: "Sanitize all equipment", note: "" },
      { phase: "Prepare ingredients", text: "Steep grains or prepare DME", note: "If using specialty grains: steep in ~155°F water for 30 min in a mesh bag, then remove. If using DME: dissolve in warm water. Bring wort to a gentle boil." },
      { phase: "Prepare ingredients", text: "Short boil + hop addition (optional)", note: "Boil for 15–30 min. Add hops with ~15 min remaining for bittering. Longer boil = more bitterness. Skip hops entirely for a sweeter braggot." },
      { phase: "Pitch & must", text: "Cool wort, add honey, pitch yeast", note: "Cool wort to below 80°F before adding honey (heat destroys honey aromatics). Add honey off the heat. Top to 1 gal. Check OG. Pitch rehydrated yeast. Airlock." },
      { phase: "Fermentation", text: "Primary fermentation", note: "1–2 weeks typically. Beer yeasts ferment faster than mead yeasts. Check with hydrometer." },
      { phase: "Stabilize", text: "Stabilize if back-sweetening", note: "Optional — braggots are often left dry or naturally sweet." },
      { phase: "Back-sweeten", text: "Back-sweeten with honey if desired", note: "A touch of honey in secondary adds fresh aroma that fermented honey loses." },
      { phase: "Bottle", text: "Bottle and condition", note: "Can bottle condition (add small amount of priming sugar for carbonation) or go still. Age 4–8 weeks minimum." },
    ],
  },

  "Bochet": {
    style: "Bochet",
    batchSize: "1 gal",
    targetABV: "~13–16%",
    notes: "Burnt honey mead. The honey is caramelized/scorched before fermentation, producing deep toffee, chocolate, and smoky flavors. The burning process is irreversible — go slowly and taste as you go. Dark and rich.",
    ingredients: [
      { name: "Honey",                  amount: "3–4",     unit: "lbs",    note: "Use more than a traditional mead — some sweetness is lost during the burn. Cheap clover honey works fine here since you're transforming the flavor." },
      { name: "Water",                  amount: "to 1",    unit: "gal",    note: "" },
      { name: "Yeast (Lalvin EC-1118 or 71B)", amount: "1", unit: "packet", note: "EC-1118 handles the challenging must better. 71B if you want more esters." },
      { name: "Yeast nutrient",         amount: "1",       unit: "tsp",    note: "Split 2 doses — burnt honey is harder for yeast." },
      { name: "Yeast energizer",        amount: "0.5",     unit: "tsp",    note: "" },
      { name: "Potassium sorbate",      amount: "0.5",     unit: "tsp",    note: "" },
      { name: "Potassium metabisulfite",amount: "0.0625",  unit: "tsp",    note: "" },
    ],
    steps: [
      { phase: "Sanitize", text: "Sanitize all equipment", note: "Also gather a large heavy-bottomed pot and a long-handled spoon for the burn step." },
      { phase: "Prepare ingredients", text: "Burn the honey", note: "⚠️ DO THIS OUTSIDE or with excellent ventilation — it produces a lot of smoke. Add honey to a large pot over medium heat. Stir frequently. The honey will bubble aggressively, then calm, then start to darken. Light burn (~15–20 min): caramel/toffee. Medium burn (~25–35 min): dark toffee, chocolate notes. Heavy burn (40+ min): deep dark chocolate, coffee, slightly bitter. Pull at the darkness you want — it's permanent. The honey will foam up dramatically when you add water, so use a pot at least 4x the volume of your honey." },
      { phase: "Prepare ingredients", text: "Add water to burnt honey carefully", note: "Very slowly add ~2 cups of hot water to the burnt honey while stirring. It will foam violently — go slow. This forms your bochet base. Let it cool before adding to carboy." },
      { phase: "Pitch & must", text: "Combine must and pitch yeast", note: "Add cooled bochet base to carboy. Top to 1 gal. Add nutrients and energizer. Rehydrate yeast, pitch. Take OG reading — bochet musts can be high gravity, so expect slower fermentation." },
      { phase: "Fermentation", text: "Primary fermentation", note: "Burnt honey is harder on yeast — fermentation may be slower than usual. Be patient. Keep extra nutrients on hand. 3–6 weeks is normal." },
      { phase: "Stabilize", text: "Stabilize", note: "Same as traditional — metabisulfite then sorbate if back-sweetening." },
      { phase: "Back-sweeten", text: "Back-sweeten — consider unburnt honey", note: "Consider using regular unburnt honey for back-sweetening — it adds fresh honey aromatics that contrast nicely with the burnt character." },
      { phase: "Clarify", text: "Clarify", note: "Bochets can be quite dark and opaque — some cloudiness is natural and expected. Cold crash + gelatin helps." },
      { phase: "Bottle", text: "Bottle and age", note: "Bochets often need 6–12 months to really come together. The harsh edges smooth out significantly with time." },
    ],
  },

  // ── Beer family ──────────────────────────────────────────────────────────────

  "Ale": {
    style: "Ale",
    batchSize: "1 gal",
    targetABV: "~4–6%",
    notes: "Top-fermented beer. Faster fermentation than lager, more tolerant of room temps. Can be brewed with a simple steep + boil process (extract brewing) without all-grain setup.",
    ingredients: [
      { name: "Light dry malt extract (DME)", amount: "1",  unit: "lb",   note: "Or use liquid malt extract (LME). ~1 lb DME per gallon for ~1.040 OG." },
      { name: "Specialty grain (optional)", amount: "4",    unit: "oz",   note: "Crystal 40L for sweetness/color, Victory for biscuity notes, etc. Steep in mesh bag." },
      { name: "Hops (bittering)",        amount: "0.25",    unit: "oz",   note: "Add at 60 min. Adjust to IBU target. ~0.25 oz at 60 min for moderate bitterness on a 1 gal batch." },
      { name: "Hops (flavor, optional)", amount: "0.1",     unit: "oz",   note: "Add at 10–15 min remaining." },
      { name: "Hops (aroma, optional)",  amount: "0.1",     unit: "oz",   note: "Add at flameout or dry hop post-fermentation." },
      { name: "Water",                   amount: "to 1",    unit: "gal",  note: "Start with more (~1.25 gal) to account for boil-off." },
      { name: "Yeast (Safale US-05)",    amount: "~6",      unit: "g",    note: "US-05 is a versatile, clean American ale yeast. Or use S-04 for English character." },
      { name: "Irish moss (optional)",   amount: "0.25",    unit: "tsp",  note: "Kettle fining — add at 15 min remaining to improve clarity." },
      { name: "Priming sugar (for bottling)", amount: "0.75", unit: "oz", note: "~¾ oz corn sugar per gallon for bottle conditioning. Dissolve in boiled water, add at bottling." },
    ],
    steps: [
      { phase: "Sanitize", text: "Sanitize all equipment", note: "Fermentor, airlock, spoon, hydrometer, auto-siphon, bottles. Use Star San." },
      { phase: "Prepare ingredients", text: "Steep specialty grains (if using)", note: "Add grain (in mesh bag) to ~2 cups water at 155°F. Steep 30 min. Remove bag without squeezing. Add water to bring to ~1.25 gal for boil." },
      { phase: "Pitch & must", text: "Bring to boil, add DME", note: "Bring water to a boil, then remove from heat to stir in DME (stirring off-heat prevents scorching). Return to boil." },
      { phase: "Pitch & must", text: "60-minute boil with hop additions", note: "Start timer when rolling boil begins. Add bittering hops at 60 min. Add flavor hops at 10–15 min. Add aroma hops/Irish moss at flameout. Keep a lid nearby for boilovers — especially at the start." },
      { phase: "Pitch & must", text: "Cool wort and pitch yeast", note: "Cool to below 75°F as fast as possible (ice bath works for 1 gal). Top up to 1 gal in fermentor. Take OG reading. Sprinkle dry yeast directly or rehydrate. Seal with airlock." },
      { phase: "Fermentation", text: "Primary fermentation", note: "Keep at 60–72°F. Vigorous activity in 12–24h. Slows after 1 week. Let it go 2 weeks total minimum — don't rush. Check FG after 2 weeks." },
      { phase: "Back-sweeten", text: "Dry hop (optional)", note: "For hoppy ales: add dry hops (pellets) directly to fermentor for 3–5 days before packaging. No boiling needed." },
      { phase: "Bottle", text: "Bottle condition", note: "Dissolve priming sugar (~¾ oz corn sugar per gallon) in ¼ cup boiled water, cool, add to bottling bucket. Rack beer onto sugar, stir gently. Bottle. Condition at room temp 2 weeks before refrigerating. Carb check after 1 week." },
    ],
  },

  "IPA": {
    style: "IPA",
    batchSize: "1 gal",
    targetABV: "~5.5–7.5%",
    notes: "Hop-forward ale. More hops, more bitterness, often higher ABV. Dry hopping is essential for aroma. Drink fresher than most styles — hop aroma fades after a few months.",
    ingredients: [
      { name: "Light dry malt extract", amount: "1.25",    unit: "lbs",   note: "More fermentables than a standard ale for higher ABV." },
      { name: "Hops (bittering, high alpha)", amount: "0.4", unit: "oz", note: "Citra, Centennial, Chinook, Columbus — your call. Add at 60 min." },
      { name: "Hops (flavor)",          amount: "0.25",    unit: "oz",   note: "Same or different variety. Add at 10–15 min." },
      { name: "Hops (dry hop)",         amount: "0.5",     unit: "oz",   note: "Added post-fermentation for aroma. Citra, Mosaic, Galaxy work great." },
      { name: "Water",                  amount: "to 1",    unit: "gal",  note: "" },
      { name: "Yeast (Safale US-05)",   amount: "~6",      unit: "g",    note: "Clean yeast lets hops shine." },
      { name: "Priming sugar",          amount: "0.75",    unit: "oz",   note: "For bottle conditioning." },
    ],
    steps: [
      { phase: "Sanitize", text: "Sanitize all equipment", note: "" },
      { phase: "Prepare ingredients", text: "Bring water to boil, add DME", note: "Remove from heat to add DME, stir, return to boil." },
      { phase: "Pitch & must", text: "60-minute boil with hop schedule", note: "60 min: bittering hops. 15 min: flavor hops. Flameout: whirlpool hops optional. Keep notes on what you add when." },
      { phase: "Pitch & must", text: "Cool and pitch yeast", note: "Cool fast to under 70°F. Top to 1 gal. OG reading. Pitch yeast. Airlock." },
      { phase: "Fermentation", text: "Primary fermentation", note: "2 weeks at 65–70°F. Let it fully ferment — don't rush to dry hop." },
      { phase: "Back-sweeten", text: "Dry hop", note: "Add dry hops directly to fermentor. 3–5 days. Don't go much longer — can start to impart grassy/vegetal notes. Cold-side dry hopping (fridge temp) is gentler." },
      { phase: "Bottle", text: "Bottle condition and drink fresh", note: "Priming sugar → bottle → 2 weeks at room temp → refrigerate. Drink within 2–3 months for best hop aroma." },
    ],
  },

  "Stout": {
    style: "Stout",
    batchSize: "1 gal",
    targetABV: "~4–6%",
    notes: "Dark, roasty ale. Roasted barley gives coffee/chocolate notes. Can be dry (Irish style) or sweet (add lactose). Steeping roasted grain is essential.",
    ingredients: [
      { name: "Light dry malt extract", amount: "0.75",    unit: "lbs",  note: "" },
      { name: "Roasted barley",         amount: "4",       unit: "oz",   note: "Steep in mesh bag. This is the key ingredient — gives coffee/chocolate flavor and near-black color." },
      { name: "Flaked oats (optional)", amount: "2",       unit: "oz",   note: "Adds creaminess and body. Steep with roasted barley." },
      { name: "Lactose (sweet stout)",  amount: "2",       unit: "oz",   note: "Optional — for sweet/milk stout. Unfermentable, adds residual sweetness. Add with 15 min left in boil." },
      { name: "Hops (low bitterness)", amount: "0.2",      unit: "oz",   note: "Just enough to balance. ~0.2 oz at 60 min. East Kent Goldings, Fuggles." },
      { name: "Water",                  amount: "to 1",    unit: "gal",  note: "" },
      { name: "Yeast (Safale S-04 or US-05)", amount: "~6", unit: "g",  note: "S-04 for English character; US-05 for cleaner." },
      { name: "Priming sugar",          amount: "0.75",    unit: "oz",   note: "" },
    ],
    steps: [
      { phase: "Sanitize", text: "Sanitize all equipment", note: "" },
      { phase: "Prepare ingredients", text: "Steep roasted grains", note: "Add roasted barley (and oats if using) in a mesh bag to ~2 cups water at 155°F. Steep 30 min. Squeeze the bag gently — roasted barley is okay to squeeze. The wort will be nearly black." },
      { phase: "Pitch & must", text: "Boil: add DME and hops", note: "Top to ~1.25 gal, boil. Add DME off-heat, stir, return to boil. Add hops at 60 min. Add lactose at 15 min if making sweet stout." },
      { phase: "Pitch & must", text: "Cool and pitch yeast", note: "Cool to under 72°F. Top to 1 gal. OG reading. Pitch yeast. Airlock." },
      { phase: "Fermentation", text: "Primary fermentation", note: "2 weeks at room temp. Stouts are forgiving — small temp swings are fine." },
      { phase: "Bottle", text: "Bottle condition", note: "Priming sugar → bottle → 2 weeks room temp. Stouts are great at 4+ weeks in bottle." },
    ],
  },

  "Porter": {
    style: "Porter",
    batchSize: "1 gal",
    targetABV: "~4.5–6%",
    notes: "Dark ale, lighter than stout. Chocolate malt and crystal malt give it a roasty-sweet character without the harsh bitterness of a dry stout. Very approachable.",
    ingredients: [
      { name: "Light dry malt extract", amount: "0.875",   unit: "lbs",  note: "" },
      { name: "Chocolate malt",         amount: "2",       unit: "oz",   note: "Steep in mesh bag. Gives chocolate/coffee flavor without the harshness of roasted barley." },
      { name: "Crystal 60L malt",       amount: "2",       unit: "oz",   note: "Adds caramel sweetness and body." },
      { name: "Hops (bittering)",       amount: "0.25",    unit: "oz",   note: "Fuggles or East Kent Goldings at 60 min." },
      { name: "Water",                  amount: "to 1",    unit: "gal",  note: "" },
      { name: "Yeast (Safale S-04)",    amount: "~6",      unit: "g",    note: "S-04 gives a slightly fruity English character that complements the malt." },
      { name: "Priming sugar",          amount: "0.75",    unit: "oz",   note: "" },
    ],
    steps: [
      { phase: "Sanitize", text: "Sanitize all equipment", note: "" },
      { phase: "Prepare ingredients", text: "Steep specialty grains", note: "Crystal 60L + chocolate malt in mesh bag, 155°F water, 30 min." },
      { phase: "Pitch & must", text: "60-min boil with DME and hops", note: "Add DME off-heat, return to boil. Bittering hops at 60 min." },
      { phase: "Pitch & must", text: "Cool and pitch yeast", note: "Cool under 72°F, top to 1 gal, OG reading, pitch, airlock." },
      { phase: "Fermentation", text: "Primary fermentation", note: "2 weeks. Porters are very straightforward fermentations." },
      { phase: "Bottle", text: "Bottle condition", note: "2 weeks room temp, then refrigerate. Better at 4+ weeks." },
    ],
  },

  "Wheat": {
    style: "Wheat",
    batchSize: "1 gal",
    targetABV: "~4–5%",
    notes: "Light, hazy ale with wheat character. Can be American (clean, light citrus) or German hefeweizen (banana/clove from the yeast). The yeast choice drives the flavor profile more than any other ingredient.",
    ingredients: [
      { name: "Wheat dry malt extract", amount: "0.875",   unit: "lbs",  note: "Or use 50/50 wheat DME + pale DME." },
      { name: "Hops (low IBU)",         amount: "0.15",    unit: "oz",   note: "Hallertau or Tettnang. Just enough for balance — ~15 IBU target. Add at 60 min." },
      { name: "Water",                  amount: "to 1",    unit: "gal",  note: "" },
      { name: "Yeast (WB-06 for hefeweizen, US-05 for American)", amount: "~6", unit: "g", note: "WB-06: classic banana/clove hefeweizen character. US-05: clean American wheat. This choice defines the beer." },
      { name: "Priming sugar",          amount: "0.85",    unit: "oz",   note: "Slightly more than other styles — wheat beers are best with more carbonation." },
    ],
    steps: [
      { phase: "Sanitize", text: "Sanitize all equipment", note: "" },
      { phase: "Pitch & must", text: "Simple boil — no grain steep needed", note: "DME dissolves directly. Add off-heat to avoid scorching. 30–60 min boil. Hops at start." },
      { phase: "Pitch & must", text: "Cool and pitch yeast", note: "Cool under 70°F. For hefeweizen, ferment on the lower end (~62–65°F) to emphasize clove; higher (~68°F) for banana." },
      { phase: "Fermentation", text: "Primary fermentation", note: "1–2 weeks. Wheat beers are meant to be drunk fresh — don't overthink it." },
      { phase: "Bottle", text: "Bottle condition — drink fresh", note: "Traditional hefeweizen is bottle-conditioned and served with the yeast roused. Drink within 1–2 months." },
    ],
  },

  "Lager": {
    style: "Lager",
    batchSize: "1 gal",
    targetABV: "~4–5%",
    notes: "Cold-fermented, clean, crisp. Requires a fridge-controlled fermentation (~50°F) and extended cold conditioning (lagering). More patience than ale, but rewarding. Easy-drinking result.",
    ingredients: [
      { name: "Pilsner dry malt extract", amount: "0.875",  unit: "lbs", note: "Pilsner DME gives the classic light, clean base." },
      { name: "Hops (noble hops)",       amount: "0.25",    unit: "oz",  note: "Saaz, Hallertau, Tettnang. Add at 60 min. Keep IBUs moderate (~20–25)." },
      { name: "Water",                   amount: "to 1",    unit: "gal", note: "" },
      { name: "Lager yeast (Saflager W-34/70 or S-23)", amount: "~6", unit: "g", note: "W-34/70 is the gold standard. Ferments at 48–54°F." },
      { name: "Priming sugar",           amount: "0.75",    unit: "oz",  note: "" },
    ],
    steps: [
      { phase: "Sanitize", text: "Sanitize all equipment", note: "" },
      { phase: "Pitch & must", text: "Boil and add hops", note: "Simple extract boil — 60 min, hops at start. Cool aggressively to 50–55°F before pitching." },
      { phase: "Pitch & must", text: "Pitch yeast cold", note: "Pitch lager yeast at fermentation temperature (~50–54°F). Rehydrate first. This is crucial — don't pitch warm." },
      { phase: "Fermentation", text: "Ferment cold (48–54°F) for 2–3 weeks", note: "Keep in fridge or cold space. Activity will be slow and steady. Don't rush. A diacetyl rest (raise to 65°F for 2 days) near the end of fermentation is recommended." },
      { phase: "Fermentation", text: "Lager (cold condition)", note: "After primary: drop temp to near freezing (34–38°F) for 4–6 weeks minimum. This is the 'lagering' step — smooths out flavors dramatically. Longer = better." },
      { phase: "Bottle", text: "Bottle condition at room temp, then refrigerate", note: "2 weeks at room temp for carbonation, then cold store. Drink within 3–4 months for best quality." },
    ],
  },

  // ── Cider & Wine ────────────────────────────────────────────────────────────

  "Cider": {
    style: "Cider",
    batchSize: "1 gal",
    targetABV: "~5–7%",
    notes: "Fermented apple juice. Simplest fermentation on this list. The quality of your cider/juice matters a lot — get the best you can. Avoid juice with preservatives (sorbate, benzoate) — they'll prevent fermentation.",
    ingredients: [
      { name: "Fresh apple cider or juice", amount: "1",  unit: "gal",  note: "Check the label — no preservatives, no sorbate. Farmers market unpasteurized cider is ideal. Grocery store apple juice works too." },
      { name: "Yeast (Lalvin 71B or EC-1118)", amount: "1", unit: "packet", note: "71B for more body and fruit character; EC-1118 for very dry, clean cider." },
      { name: "Yeast nutrient (optional)", amount: "0.25", unit: "tsp", note: "Cider is lower in nutrients than honey must — a small addition helps." },
      { name: "Potassium sorbate",       amount: "0.5",    unit: "tsp",  note: "For stabilizing before back-sweetening." },
      { name: "Potassium metabisulfite", amount: "0.0625", unit: "tsp",  note: "" },
    ],
    steps: [
      { phase: "Sanitize", text: "Sanitize all equipment", note: "Cider fermentations can be vulnerable to wild yeast — be thorough." },
      { phase: "Pitch & must", text: "Add juice to fermentor and pitch yeast", note: "No boiling, no prep — just pour juice into sanitized fermentor. Take OG reading. Rehydrate yeast if directed, pitch. Airlock. Done." },
      { phase: "Fermentation", text: "Primary fermentation", note: "Fast — often done in 1–2 weeks. Monitor with hydrometer. Cider ferments very dry by default." },
      { phase: "Stabilize", text: "Stabilize if back-sweetening", note: "Metabisulfite, wait 24h, then sorbate. Cider will re-ferment if you add sugar without stabilizing." },
      { phase: "Back-sweeten", text: "Back-sweeten if desired", note: "Honey, apple juice concentrate, or sugar. Taste as you go — dry cider is also great and intentional." },
      { phase: "Clarify", text: "Cold crash for clarity", note: "Cider usually clears on its own. Cold crash 2–3 days helps." },
      { phase: "Bottle", text: "Bottle still or sparkling", note: "For still: just bottle. For sparkling: skip stabilizing and bottle when close to target FG, or add priming sugar (~¾ oz/gal). Carbonate carefully — cider can over-carb." },
    ],
  },

  "Wine": {
    style: "Wine",
    batchSize: "1 gal",
    targetABV: "~11–13%",
    notes: "Country wine (fruit wine) or grape wine. Juice, sugar, yeast. Process is similar to mead — sanitize aggressively, manage nutrients, backsweeten if desired. The base fruit drives everything.",
    ingredients: [
      { name: "Fruit juice or crushed fruit", amount: "1", unit: "gal", note: "Fresh-pressed, quality store-bought, or wine kit concentrate. Grape, peach, cherry, raspberry, etc." },
      { name: "Sugar (if needed to hit target OG)", amount: "varies", unit: "lbs", note: "Check OG first. Add sugar to boost to ~1.090–1.100 for ~12–13% ABV." },
      { name: "Yeast (Lalvin EC-1118 or 71B)", amount: "1", unit: "packet", note: "EC-1118 for high ABV or difficult ferments; 71B for fruit-forward wines." },
      { name: "Pectic enzyme",          amount: "0.5",     unit: "tsp",  note: "Helps with clarity. Add 12–24h before yeast." },
      { name: "Yeast nutrient",         amount: "1",       unit: "tsp",  note: "" },
      { name: "Wine tannins (optional)",amount: "0.25",    unit: "tsp",  note: "If juice is low in tannin (like white grape or peach)." },
      { name: "Acid blend (optional)",  amount: "0.5",     unit: "tsp",  note: "If must tastes flat. Add incrementally, taste." },
      { name: "Potassium sorbate",      amount: "0.5",     unit: "tsp",  note: "" },
      { name: "Potassium metabisulfite",amount: "0.0625",  unit: "tsp",  note: "" },
      { name: "Unflavored gelatin",     amount: "0.2",     unit: "tsp",  note: "" },
    ],
    steps: [
      { phase: "Sanitize", text: "Sanitize all equipment", note: "" },
      { phase: "Prepare ingredients", text: "Add pectic enzyme to juice, wait 12–24h", note: "Add enzyme before yeast — yeast activity will reduce its effectiveness." },
      { phase: "Pitch & must", text: "Check and adjust OG, pitch yeast", note: "Take OG reading. If below ~1.090, dissolve sugar in warm water and add. Add nutrients and tannins/acid. Pitch yeast. Airlock." },
      { phase: "Fermentation", text: "Primary fermentation", note: "2–4 weeks. White wines ferment cleaner; red/fruit wines may have a cap to manage. Stable SG across 2 readings = done." },
      { phase: "Fermentation", text: "Rack to secondary, age", note: "Rack off sediment after primary. Age in carboy 1–3 months before bottling — wine improves dramatically with time." },
      { phase: "Stabilize", text: "Stabilize before back-sweetening", note: "Metabisulfite then sorbate." },
      { phase: "Back-sweeten", text: "Back-sweeten to taste", note: "" },
      { phase: "Clarify", text: "Cold crash and fine", note: "Cold crash, gelatin or bentonite, wait for clarity." },
      { phase: "Bottle", text: "Bottle and age", note: "Still wine into bottles. Age 3–12 months. Most fruit wines are best at 6–12 months." },
    ],
  },

  // ── Other ────────────────────────────────────────────────────────────────────

  "Kombucha": {
    style: "Kombucha",
    batchSize: "1 gal",
    targetABV: "~0.5–2% (can go higher)",
    notes: "Fermented sweet tea with a SCOBY (symbiotic culture of bacteria and yeast). Very different from mead/beer — it's fermented with a live culture, not pitched yeast. Two fermentation stages: F1 (plain, in a jar) and F2 (flavored, bottled, builds carbonation).",
    ingredients: [
      { name: "Water",                  amount: "1",       unit: "gal",  note: "" },
      { name: "Black or green tea bags", amount: "6–8",    unit: "",     note: "Plain, unflavored. Black tea = more robust; green = lighter. Can mix." },
      { name: "White cane sugar",       amount: "1",       unit: "cup",  note: "~1 cup per gallon. The SCOBY eats most of it." },
      { name: "SCOBY + starter liquid", amount: "1–2",     unit: "cups", note: "The starter liquid (finished kombucha) lowers pH to prevent mold. Don't skip this — it's essential. Get from a previous batch or a trusted source." },
      { name: "Fruit juice or flavoring (F2)", amount: "10", unit: "%",  note: "For second fermentation: ~10% of bottle volume. Mango, ginger, berry, etc." },
    ],
    steps: [
      { phase: "Sanitize", text: "Clean all equipment with hot water and soap — no Star San", note: "Soap + hot water only. Star San and harsh sanitizers can harm the SCOBY. Make sure everything is very clean but well-rinsed." },
      { phase: "Prepare ingredients", text: "Brew sweet tea", note: "Boil 1 gal water, steep tea bags for 5–10 min. Remove bags (don't squeeze — bitterness). Dissolve sugar while still hot. Cool completely to room temp before adding SCOBY." },
      { phase: "Pitch & must", text: "Add SCOBY and starter liquid, cover", note: "Pour cooled sweet tea into clean jar/vessel. Add SCOBY and starter liquid. Do NOT use a sealed airlock — kombucha needs air. Cover with a breathable cloth (coffee filter, cheesecloth, paper towel) secured with a rubber band." },
      { phase: "Fermentation", text: "First fermentation (F1) — 7–14 days", note: "Store at room temp (70–78°F), away from direct light. Taste starting at day 7. Should taste tart and slightly sweet — not too sweet (underfermented) or too sour (overfermented). A new SCOBY layer will form on top. Don't disturb it." },
      { phase: "Fermentation", text: "Taste and decide when F1 is done", note: "pH 2.5–3.5 is ideal (pH strips help). Taste is your best guide: balanced tart/sweet, slightly vinegary, no longer tea-sweet. Reserve 1–2 cups as starter for your next batch. Remove SCOBY and store in starter liquid." },
      { phase: "Back-sweeten", text: "Second fermentation (F2) — add flavor, bottle", note: "Add fruit juice, ginger, or other flavoring to clean bottles (10–20% of volume). Fill with kombucha, leaving 1 inch headspace. Seal tightly. F2 is where carbonation builds." },
      { phase: "Bottle", text: "Carbonate at room temp, then refrigerate", note: "Leave sealed bottles at room temp 1–3 days. Burp (briefly open) once daily to check pressure and prevent over-carbonation. Once carbonated to your liking, refrigerate. Stays good for weeks in the fridge. ⚠️ Over-carbonation is a real risk — especially with high-sugar fruits. Check pressure daily." },
    ],
  },

  "Other": {
    style: "Other",
    batchSize: "1 gal",
    targetABV: "",
    notes: "Custom fermentation. No template steps pre-loaded — build your own from scratch.",
    ingredients: [],
    steps: [],
  },

};

export default TEMPLATES;
