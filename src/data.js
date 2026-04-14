// ─── Data model ───────────────────────────────────────────────────────────────

export const STYLES = [
  "Mead", "Melomel", "Metheglin", "Cyser", "Braggot",
  "Ale", "Stout", "Porter", "IPA", "Lager", "Wheat",
  "Cider", "Wine", "Kombucha", "Other"
];

export const STATUS = {
  PLANNING:    "Planning",
  FERMENTING:  "Fermenting",
  CONDITIONING:"Conditioning",
  AGING:       "Aging",
  COMPLETE:    "Complete",
};

// Shape of a single batch
export const EMPTY_BATCH = {
  id:          "",          // uuid
  name:        "",          // "Blackberry Melomel #2"
  style:       "Mead",
  status:      STATUS.FERMENTING,
  batchSize:   "",          // "1 gal" / "5 L" — freeform string
  startDate:   "",          // ISO date string
  targetABV:   "",          // freeform, e.g. "13%"
  notes:       "",          // general notes / description

  ingredients: [
    // { id, name, amount, unit }
  ],

  steps: [
    // { id, order, name, description, completed, completedAt }
  ],

  gravityLog: [
    // { id, date, value, type: "OG"|"FG"|"reading" }
  ],

  tastingNotes: [
    // { id, date, text, attributes: string[] }
  ],

  processLog: [
    // { id, date, text }   — freeform timestamped entries added during the brew
  ],
};

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "brewlog_v1";

export function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAll(batches) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
}

export function saveBatch(batch, batches) {
  const idx = batches.findIndex(b => b.id === batch.id);
  const next = idx >= 0
    ? batches.map(b => b.id === batch.id ? batch : b)
    : [...batches, batch];
  saveAll(next);
  return next;
}

export function deleteBatch(id, batches) {
  const next = batches.filter(b => b.id !== id);
  saveAll(next);
  return next;
}

export function newId() {
  return crypto.randomUUID();
}

// ─── Import / Export ──────────────────────────────────────────────────────────

// Full backup
export function exportAll(batches) {
  const blob = new Blob(
    [JSON.stringify({ version: 1, exported: new Date().toISOString(), batches }, null, 2)],
    { type: "application/json" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `brewlog-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importAll(jsonStr) {
  const parsed = JSON.parse(jsonStr);
  // accept bare array or wrapped object
  return Array.isArray(parsed) ? parsed : parsed.batches ?? [];
}

// Single batch export
export function exportBatch(batch) {
  const blob = new Blob(
    [JSON.stringify({ version: 1, exported: new Date().toISOString(), batch }, null, 2)],
    { type: "application/json" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${batch.name.replace(/\s+/g,"-").toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBatch(jsonStr) {
  const parsed = JSON.parse(jsonStr);
  return parsed.batch ?? parsed; // accept bare batch object too
}

// Shareable link — encodes single batch as base64 in URL hash
export function batchToShareUrl(batch) {
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(batch))));
  return `${location.origin}${location.pathname}#share=${encoded}`;
}

export function batchFromShareUrl() {
  const hash = location.hash;
  if (!hash.startsWith("#share=")) return null;
  try {
    const encoded = hash.slice(7);
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch {
    return null;
  }
}

// ─── Image storage (IndexedDB) ────────────────────────────────────────────────

const IMAGE_DB_NAME    = "brewlog_images";
const IMAGE_DB_VERSION = 1;
const IMAGE_STORE      = "images";

function openImageDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IMAGE_DB_NAME, IMAGE_DB_VERSION);
    req.onupgradeneeded = e => e.target.result.createObjectStore(IMAGE_STORE, { keyPath: "batchId" });
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

export async function saveImage(batchId, dataUrl) {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_STORE, "readwrite");
    tx.objectStore(IMAGE_STORE).put({ batchId, dataUrl });
    tx.oncomplete = resolve;
    tx.onerror    = e => reject(e.target.error);
  });
}

export async function loadAllImages() {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(IMAGE_STORE, "readonly");
    const req = tx.objectStore(IMAGE_STORE).getAll();
    req.onsuccess = e => {
      const map = new Map();
      e.target.result.forEach(r => map.set(r.batchId, r.dataUrl));
      resolve(map);
    };
    req.onerror = e => reject(e.target.error);
  });
}

export async function deleteImage(batchId) {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_STORE, "readwrite");
    tx.objectStore(IMAGE_STORE).delete(batchId);
    tx.oncomplete = resolve;
    tx.onerror    = e => reject(e.target.error);
  });
}
