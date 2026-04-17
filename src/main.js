// main.js — entry point, router, top-level state
import {
  loadAll, saveAll, saveBatch, deleteBatch, newId,
  exportAll, importAll, exportBatch,
  batchToShareUrl, batchFromShareUrl,
  saveImage, loadAllImages, deleteImage,
  saveSyncHandle, loadSyncHandle, pushToSyncFile, pullFromSyncFile,
  loadCloudConfig, saveCloudConfig, clearCloudConfig,
  cloudPush, cloudPull, backupLocal, loadLocalBackup,
  EMPTY_BATCH, STATUS
} from "./data.js";
import TEMPLATES, { TEMPLATE_GROUPS, ALL_TYPES } from "./templates.js";

// ─── App state ────────────────────────────────────────────────────────────────
let state = {
  batches:       loadAll(),
  activeBatchId: null,
  activeTab:     "recipe",
  brewMode:      false,
};

// localBatch: working copy of the active batch; unsaved edits live here only.
// dirty: true when localBatch has changes not yet written to localStorage.
// imageCache: batchId → dataUrl, populated from IndexedDB on boot.
let localBatch           = null;
let dirty                = false;
let imageCache           = new Map();
let ingredientsCollapsed = false;
let dragIngId            = null; // ingredient ID being dragged
let modalCategory        = "Blank";
let modalSelected        = "blank";
let syncFolderName        = null;
let cloudConfig           = loadCloudConfig(); // { vault } or null
let cloudSettingsExpanded = false;
let showAllBatches        = false;

// ─── Sync feature flag ────────────────────────────────────────────────────────
// Visit with ?sync=1 once per device to permanently enable sync UI via localStorage.
if (new URLSearchParams(location.search).get("sync") === "1") {
  localStorage.setItem("brewlog_sync_ff", "1");
}
const SYNC_ENABLED = localStorage.getItem("brewlog_sync_ff") === "1";

// ─── Boot ─────────────────────────────────────────────────────────────────────
Promise.all([
  loadAllImages().then(map => { imageCache = map; }).catch(() => {}),
  loadSyncHandle().then(h => { syncFolderName = h?.name ?? null; }).catch(() => {}),
]).finally(() => render());

// ─── Share link on load ───────────────────────────────────────────────────────
const shared = batchFromShareUrl();
if (shared) {
  // TODO: show a banner "You're viewing a shared recipe — [Add to my batches]"
  // batchFromShareUrl() returns the decoded batch; push it with a fresh ID on confirm.
  console.log("Shared batch detected:", shared);
}

// ─── Unsaved-changes guard ────────────────────────────────────────────────────
window.addEventListener("beforeunload", e => {
  if (dirty) { e.preventDefault(); e.returnValue = ""; }
});

// ─── State helpers ────────────────────────────────────────────────────────────
function setState(partial) {
  const prev = state;
  state = { ...state, ...partial };
  // Reset localBatch when navigating to/from a batch view
  if ("activeBatchId" in partial && partial.activeBatchId !== prev.activeBatchId) {
    localBatch = state.activeBatchId
      ? { ...(state.batches.find(b => b.id === state.activeBatchId) ?? {}) }
      : null;
    dirty = false;
  }
  render();
}

// Update the Save button label in-place without a full re-render (called during typing).
function setDirty(val) {
  dirty = val;
  const btn = document.getElementById("btn-save");
  if (btn) {
    btn.textContent = dirty ? "Save *" : "Saved";
    btn.classList.toggle("btn-primary", dirty);
  }
}

function currentBatch() {
  return localBatch ?? state.batches.find(b => b.id === state.activeBatchId) ?? null;
}

// Flush current DOM form values into localBatch before any re-render that
// would destroy the form (tab switch, add/remove row, brew mode toggle).
function syncFormToLocalBatch() {
  if (!localBatch) return;

  document.querySelectorAll("[data-field]").forEach(el => {
    localBatch = { ...localBatch, [el.dataset.field]: el.value };
  });

  const ingRows = [...document.querySelectorAll("[data-ing-id]")];
  if (ingRows.length > 0) {
    localBatch = {
      ...localBatch,
      ingredients: ingRows.map(row => {
        const id       = row.dataset.ingId;
        const existing = localBatch.ingredients.find(i => i.id === id) ?? { id };
        return {
          ...existing,
          name:   row.querySelector("[data-ing-field='name']")?.value   ?? "",
          amount: row.querySelector("[data-ing-field='amount']")?.value ?? "",
          unit:   row.querySelector("[data-ing-field='unit']")?.value   ?? "",
          note:   row.querySelector("[data-ing-field='note']")?.value   ?? "",
        };
      }),
    };
  }

  const stepRows = [...document.querySelectorAll("[data-step-id]")];
  if (stepRows.length > 0) {
    localBatch = {
      ...localBatch,
      steps: stepRows.map(row => {
        const id       = row.dataset.stepId;
        const existing = localBatch.steps.find(s => s.id === id) ?? { id, completed: false, completedAt: null };
        return {
          ...existing,
          name:        row.querySelector("[data-step-field='name']")?.value        ?? "",
          description: row.querySelector("[data-step-field='description']")?.value ?? "",
        };
      }),
    };
  }
}

// ─── Render ───────────────────────────────────────────────────────────────────
function render() {
  const app = document.getElementById("app");
  if (!state.activeBatchId) {
    app.innerHTML = renderListView();
  } else {
    const batch = currentBatch();
    app.innerHTML = batch ? renderBatchView(batch) : renderListView();
  }
  bindEvents();
}

// ─── Markdown (title field is plain text; description supports basic markdown) ─
function renderMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g,     "<em>$1</em>")
    .replace(/`(.+?)`/g,       "<code>$1</code>")
    .replace(/\n/g, "<br>");
}

// ─── Image helpers ────────────────────────────────────────────────────────────
function resizeImage(dataUrl, maxDim = 900) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale  = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.src = dataUrl;
  });
}

// ─── New-batch modal ──────────────────────────────────────────────────────────
function renderNewBatchModal() {
  const customTemplates = state.batches.filter(b => b.isTemplate);
  const ungrouped = customTemplates.filter(b => getCustomTemplateGroup(b) === null);
  const cats = ["Blank", ...TEMPLATE_GROUPS.map(g => g.group), ...(ungrouped.length ? ["My Templates"] : [])];
  return `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal modal-browser">
        <h2 class="modal-title">New batch</h2>
        <div class="tmpl-tabs">
          ${cats.map(c => `<button class="tmpl-tab${c === modalCategory ? " tmpl-tab-active" : ""}" data-cat="${c}">${c}</button>`).join("")}
        </div>
        <div class="tmpl-cards" id="tmpl-cards">
          ${renderModalCards(modalCategory)}
        </div>
        <div class="modal-actions">
          <button class="btn" id="btn-modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="btn-modal-create">Create batch</button>
        </div>
      </div>
    </div>
  `;
}

function getCustomTemplateGroup(batch) {
  for (const g of TEMPLATE_GROUPS) {
    if (g.types.includes(batch.style)) return g.group;
  }
  return null;
}

function renderModalCards(category) {
  const customTemplates = state.batches.filter(b => b.isTemplate);

  if (category === "Blank") {
    return `
      <div class="tmpl-card ${modalSelected === "blank" ? "tmpl-card-active" : ""}" data-tval="blank">
        <div class="tmpl-card-name">Start from scratch</div>
        <div class="tmpl-card-meta">No ingredients or steps pre-loaded</div>
      </div>
    `;
  }

  if (category === "My Templates") {
    const ungrouped = customTemplates.filter(b => getCustomTemplateGroup(b) === null);
    if (!ungrouped.length) return `<p class="empty-hint">No saved templates yet.</p>`;
    return ungrouped.map(b => {
      const tval = `custom:${b.id}`;
      return `
        <div class="tmpl-card ${modalSelected === tval ? "tmpl-card-active" : ""}" data-tval="${tval}">
          <div class="tmpl-card-name">${b.name}</div>
          <div class="tmpl-card-meta">${b.style}${b.batchSize ? ` · ${b.batchSize}` : ""}</div>
        </div>
      `;
    }).join("");
  }

  const group = TEMPLATE_GROUPS.find(g => g.group === category);
  if (!group) return "";

  const builtins = group.types.map(t => {
    const tmpl = TEMPLATES[t];
    const meta = [
      tmpl?.batchSize,
      tmpl?.targetABV,
      tmpl?.ingredients?.length ? `${tmpl.ingredients.length} ingr.` : null,
    ].filter(Boolean).join(" · ");
    return `
      <div class="tmpl-card ${modalSelected === t ? "tmpl-card-active" : ""}" data-tval="${t}">
        <div class="tmpl-card-name">${t}</div>
        ${meta ? `<div class="tmpl-card-meta">${meta}</div>` : ""}
      </div>
    `;
  }).join("");

  const mine = customTemplates.filter(b => getCustomTemplateGroup(b) === category).map(b => {
    const tval = `custom:${b.id}`;
    return `
      <div class="tmpl-card tmpl-card-saved ${modalSelected === tval ? "tmpl-card-active" : ""}" data-tval="${tval}">
        <div class="tmpl-card-name">${b.name}</div>
        <div class="tmpl-card-meta">My template${b.batchSize ? ` · ${b.batchSize}` : ""}</div>
      </div>
    `;
  }).join("");

  return builtins + mine;
}

function bindModalCardEvents() {
  document.querySelectorAll(".tmpl-card").forEach(card => {
    card.addEventListener("click", () => {
      modalSelected = card.dataset.tval;
      document.querySelectorAll(".tmpl-card").forEach(c => c.classList.remove("tmpl-card-active"));
      card.classList.add("tmpl-card-active");
    });
  });
}

// ─── List view ────────────────────────────────────────────────────────────────
function renderListView() {
  const regular   = state.batches.filter(b => !b.isTemplate);
  const templates = state.batches.filter(b => b.isTemplate);
  const BATCH_CAP = 4;
  const visibleBatches = showAllBatches ? regular : regular.slice(0, BATCH_CAP);
  const hiddenCount    = regular.length - BATCH_CAP;

  return `
    <div class="layout">
      <header class="topbar">
        <span class="wordmark"><span class="wordmark-brew">BREW</span><span class="wordmark-dot">.</span><span class="wordmark-log">log</span></span>
        <div class="topbar-actions">
          <button class="btn btn-primary" id="btn-new">+ New batch</button>
        </div>
      </header>

      <main class="list-main">
        <p class="list-description">A brewing journal that lives in your browser. Track batches from pitch to glass — ingredients, steps, gravity readings, and tasting notes. Data is stored in local browser storage; use data sync options correctly to avoid losing data!</p>

        <h3 class="section-heading">Recipes</h3>

        ${regular.length === 0 ? `
          <div class="empty-state">
            <p>No batches yet.</p>
            <button class="btn btn-primary" id="btn-new-empty">Add your first batch</button>
          </div>
        ` : `
          <div class="batch-grid">
            ${visibleBatches.map(renderBatchCard).join("")}
          </div>
          ${!showAllBatches && hiddenCount > 0 ? `
            <button class="btn btn-show-all" id="btn-show-all-batches">Show all (${hiddenCount} more)</button>
          ` : hiddenCount > 0 ? `
            <button class="btn btn-show-all" id="btn-show-all-batches">Show fewer</button>
          ` : ""}
        `}

        ${templates.length ? `
          <div class="templates-section">
            <span class="section-label">My Templates</span>
            <div class="batch-grid">
              ${templates.map(renderBatchCard).join("")}
            </div>
          </div>
        ` : ""}

        <h1 class="sync-data-heading">Sync Data</h1>

        ${SYNC_ENABLED ? `
        <h2 class="sync-sub-heading">Cloudflare &lt;&gt; Syncer</h2>

        <div class="sync-section">
          <p class="sync-desc">Keep your brews in sync across all your devices — phone, tablet, desktop. Choose a vault passphrase once and use it on every device. Your data is end-to-end safe: the passphrase is hashed before leaving your device and never stored.</p>
          <div class="sync-strip">
            ${cloudConfig
              ? `<span class="sync-status">Vault connected</span>
                 <div class="sync-strip-actions">
                   <button class="btn" id="btn-cloud-pull">↓ Pull</button>
                   <button class="btn" id="btn-cloud-push">↑ Push</button>
                   <button class="btn btn-ghost" id="btn-cloud-settings">${cloudSettingsExpanded ? "Settings ▲" : "Settings ▾"}</button>
                 </div>`
              : `<input id="cloud-vault-input" type="password" autocomplete="new-password" placeholder="Choose a vault passphrase" style="font-size:13px;padding:4px 8px;border:1px solid var(--border);border-radius:3px;flex:1;min-width:0" />
                 <button class="btn btn-primary" id="btn-cloud-connect">Connect</button>`
            }
          </div>
          ${cloudConfig && cloudSettingsExpanded ? `
            <div class="sync-settings-panel">
              <div class="sync-settings-row">
                <input id="cloud-vault-update-input" type="password" autocomplete="new-password" placeholder="New passphrase" style="font-size:13px;padding:4px 8px;border:1px solid var(--border);border-radius:3px;flex:1;min-width:0" />
                <button class="btn" id="btn-cloud-update">Update passphrase</button>
              </div>
              <button class="btn btn-danger-outline" id="btn-cloud-disconnect">Disconnect</button>
            </div>
          ` : ""}
        </div>
        ` : ""}

        ${SYNC_ENABLED && window.showDirectoryPicker ? `
          <h2 class="sync-sub-heading">Desktop folder sync</h2>
          <div class="sync-section">
            <p class="sync-desc">Sync between desktops via a shared folder (OneDrive, Dropbox, etc.). Not available on mobile.</p>
            <div class="sync-strip">
              ${syncFolderName
                ? `<span class="sync-status">Folder: <strong>${syncFolderName}</strong></span>
                   <div class="sync-strip-actions">
                     <button class="btn" id="btn-sync-pull">↓ Pull</button>
                     <button class="btn" id="btn-sync-push">↑ Push</button>
                     <button class="btn" id="btn-sync-connect">Change</button>
                   </div>`
                : `<span class="muted" style="font-size:13px">No folder connected</span>
                   <button class="btn" id="btn-sync-connect">Connect folder…</button>`
              }
            </div>
          </div>
        ` : ""}

        <h2 class="sync-sub-heading">Manual sync</h2>
        <div class="sync-section">
          <p class="sync-desc">Export a full JSON backup to your device, or import one to restore. Useful for one-off transfers or keeping an offline backup.</p>
          <div class="sync-strip">
            <button class="btn" id="btn-export-full">Export JSON</button>
            <button class="btn" id="btn-import-full">Import backup</button>
          </div>
        </div>

      </main>
    </div>
    <input type="file" id="file-import" accept=".json" style="display:none" />
  `;
}

function showNewBatchModal() {
  modalCategory = "Blank";
  modalSelected = "blank";

  const el = document.createElement("div");
  el.innerHTML = renderNewBatchModal();
  document.body.appendChild(el.firstElementChild);

  bindModalCardEvents();

  document.getElementById("btn-modal-cancel")?.addEventListener("click", closeNewBatchModal);
  document.getElementById("modal-backdrop")?.addEventListener("click", (e) => {
    if (e.target.id === "modal-backdrop") closeNewBatchModal();
  });
  document.getElementById("btn-modal-create")?.addEventListener("click", () => {
    closeNewBatchModal();
    createNewBatch(modalSelected);
  });

  document.querySelectorAll(".tmpl-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      modalCategory = tab.dataset.cat;
      if (modalCategory === "Blank") {
        modalSelected = "blank";
      } else if (modalCategory === "My Templates") {
        const first = state.batches.filter(b => b.isTemplate).find(b => getCustomTemplateGroup(b) === null);
        modalSelected = first ? `custom:${first.id}` : "blank";
      } else {
        const group = TEMPLATE_GROUPS.find(g => g.group === modalCategory);
        const firstMine = state.batches.filter(b => b.isTemplate).find(b => getCustomTemplateGroup(b) === modalCategory);
        modalSelected = group?.types[0] ?? (firstMine ? `custom:${firstMine.id}` : "blank");
      }
      document.querySelectorAll(".tmpl-tab").forEach(t => t.classList.remove("tmpl-tab-active"));
      tab.classList.add("tmpl-tab-active");
      document.getElementById("tmpl-cards").innerHTML = renderModalCards(modalCategory);
      bindModalCardEvents();
    });
  });
}

function closeNewBatchModal() {
  document.getElementById("modal-backdrop")?.remove();
}

function renderBatchCard(batch) {
  const img = imageCache.get(batch.id);
  return `
    <div class="batch-card${batch.isTemplate ? " batch-card-template" : ""}" data-id="${batch.id}">
      ${img ? `<img class="card-img" src="${img}" alt="" />` : ""}
      <div class="card-body">
        <div class="card-top">
          <span class="card-name">${batch.name || "Untitled batch"}</span>
          ${batch.isTemplate
            ? `<span class="template-badge">Template</span>`
            : `<span class="status-badge status-${batch.status.toLowerCase().replace(/ /g, "-")}">${batch.status}</span>`
          }
        </div>
        <div class="card-meta">
          <span>${batch.style}</span>
          ${batch.batchSize ? `<span>${batch.batchSize}</span>` : ""}
          ${batch.startDate ? `<span>${batch.startDate}</span>` : ""}
        </div>
      </div>
    </div>
  `;
}

// ─── Batch view ───────────────────────────────────────────────────────────────
function renderBatchView(batch) {
  return `
    <div class="layout">
      <header class="topbar">
        <button class="btn btn-back" id="btn-back">← Back</button>
        <span class="wordmark batch-wordmark">${batch.name || "Untitled batch"}</span>
        <div class="topbar-actions">
          <button class="btn ${dirty ? "btn-primary" : ""}" id="btn-save">${dirty ? "Save *" : "Saved"}</button>
          <button class="btn ${state.brewMode ? "btn-primary" : ""}" id="btn-brew-mode">
            ${state.brewMode ? "Exit brew mode" : "Brew mode"}
          </button>
          <div class="topbar-menu-wrap">
            <button class="btn" id="btn-batch-menu" aria-label="More options">☰</button>
            <div class="topbar-menu" id="batch-menu-pop">
              <button class="menu-item" id="btn-export-batch">Export JSON</button>
              <button class="menu-item" id="btn-share-batch">Copy share link</button>
              <button class="menu-item" id="btn-save-template">Save as template</button>
              <button class="menu-item menu-item-danger" id="btn-delete-batch">Delete</button>
            </div>
          </div>
        </div>
      </header>

      <div class="tabs">
        ${["recipe", "process", "gravity", "tasting"].map(tab => `
          <button class="tab ${state.activeTab === tab ? "tab-active" : ""}" data-tab="${tab}">
            ${{ recipe: "Recipe", process: "Process log", gravity: "Gravity", tasting: "Tasting notes" }[tab]}
          </button>
        `).join("")}
      </div>

      <main class="batch-main">
        ${batch.isTemplate ? `
          <div class="template-banner">
            This is a template — if you're trying to log a brew, go back and create a new batch from this template instead.
          </div>
        ` : ""}
        ${renderTab(batch)}
      </main>
    </div>
  `;
}

function renderTab(batch) {
  switch (state.activeTab) {
    case "recipe":  return renderRecipeTab(batch);
    case "process": return renderProcessTab(batch);
    case "gravity": return renderGravityTab(batch);
    case "tasting": return renderTastingTab(batch);
    default:        return "";
  }
}

// ─── Recipe tab ───────────────────────────────────────────────────────────────
function renderRecipeTab(batch) {
  const editing  = !state.brewMode;
  const img      = imageCache.get(batch.id);
  const allDone  = state.brewMode && batch.steps.length > 0 && batch.steps.every(s => s.completed);
  const showDone = allDone && batch.status !== STATUS.COMPLETE;

  return `
    <div class="tab-content">
      ${editing ? renderBatchMeta(batch) : renderBatchMetaReadOnly(batch)}

      <section class="section">
        <div class="section-header">
          <span class="section-label">Photo</span>
          ${img ? `<button class="btn-add" id="btn-remove-image">Remove</button>` : ""}
        </div>
        ${img
          ? `<img class="batch-img" src="${img}" alt="Batch photo" />`
          : `<button class="btn" id="btn-add-image" style="align-self:flex-start">Upload photo</button>`
        }
        <input type="file" id="file-image" accept="image/*" style="display:none" />
      </section>

      <section class="section">
        <div class="section-header">
          <button class="btn btn-collapse" id="btn-toggle-ingredients">
            ${ingredientsCollapsed ? "▸" : "▾"}&nbsp;&nbsp;Ingredients
            ${ingredientsCollapsed && batch.ingredients.length > 0
              ? `<span class="collapse-count">${batch.ingredients.length}</span>` : ""}
          </button>
          ${editing && !ingredientsCollapsed ? `<button class="btn-add" id="btn-add-ingredient">+ Add</button>` : ""}
        </div>
        ${!ingredientsCollapsed ? (
          batch.ingredients.length === 0
            ? `<p class="empty-hint">No ingredients yet.</p>`
            : batch.ingredients.map(ing => renderIngredientRow(ing, editing)).join("")
        ) : ""}
      </section>

      <section class="section">
        <div class="section-header">
          <span class="section-label">Steps</span>
          ${editing ? `<button class="btn-add" id="btn-add-step">+ Add</button>` : ""}
        </div>
        ${editing ? `<p class="section-hint">Add steps below. Markdown is supported in descriptions.</p>` : ""}
        ${batch.steps.length === 0
          ? `<p class="empty-hint">No steps yet.</p>`
          : batch.steps.map((step, i) => renderStepRow(step, i, editing, state.brewMode, batch.ingredients)).join("")
        }
        ${showDone ? `
          <div class="brew-done-banner">
            <span>All steps complete!</span>
            <button class="btn btn-primary" id="btn-brew-done">It's done! Mark as complete</button>
          </div>
        ` : ""}
      </section>
    </div>
  `;
}

function renderBatchMeta(batch) {
  return `
    <section class="section meta-section">
      <div class="meta-grid">
        <label>Name<input class="input" type="text" data-field="name" value="${batch.name}" placeholder="e.g. Blackberry Melomel #2" /></label>
        <label>Style
          <select class="input" data-field="style">
            ${TEMPLATE_GROUPS.map(g => `
              <optgroup label="${g.group}">
                ${g.types.map(t => `<option ${batch.style === t ? "selected" : ""}>${t}</option>`).join("")}
              </optgroup>
            `).join("")}
          </select>
        </label>
        <label>Status
          <select class="input" data-field="status">
            ${["Planning", "Fermenting", "Conditioning", "Aging", "Complete"]
              .map(s => `<option ${batch.status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </label>
        <label>Batch size<input class="input" type="text" data-field="batchSize" value="${batch.batchSize}" placeholder="e.g. 1 gal" /></label>
        <label>Start date<input class="input" type="date" data-field="startDate" value="${batch.startDate}" /></label>
        <label>Target ABV<input class="input" type="text" data-field="targetABV" value="${batch.targetABV}" placeholder="e.g. 13%" /></label>
      </div>
      <label style="display:block;margin-top:12px">Notes
        <textarea class="input textarea" data-field="notes" placeholder="General description, goals, inspirations...">${batch.notes}</textarea>
      </label>
    </section>
  `;
}

function renderBatchMetaReadOnly(batch) {
  return `
    <section class="section meta-readonly">
      <div class="meta-pills">
        <span class="pill">${batch.style}</span>
        ${batch.batchSize ? `<span class="pill">${batch.batchSize}</span>` : ""}
        ${batch.targetABV ? `<span class="pill">${batch.targetABV} ABV</span>` : ""}
        ${batch.startDate ? `<span class="pill">${batch.startDate}</span>` : ""}
        <span class="status-badge status-${batch.status.toLowerCase().replace(/ /g, "-")}">${batch.status}</span>
      </div>
      ${batch.notes ? `<p class="meta-notes">${batch.notes}</p>` : ""}
    </section>
  `;
}

function renderIngredientRow(ing, editing) {
  if (!editing) return `
    <div class="row-read">
      <div>
        <span>${ing.name}</span>
        ${ing.note ? `<div class="ing-note">${ing.note}</div>` : ""}
      </div>
      <span class="muted">${ing.amount}${ing.unit ? " " + ing.unit : ""}</span>
    </div>
  `;
  return `
    <div class="ingredient-row" data-ing-id="${ing.id}" draggable="true">
      <div class="ing-main-row">
        <span class="drag-handle" title="Drag to reorder">⠿</span>
        <input class="input input-sm" type="text" data-ing-field="name"   value="${ing.name}"   placeholder="Ingredient" />
        <input class="input input-sm input-amount" type="text" data-ing-field="amount" value="${ing.amount}" placeholder="Amount" />
        <input class="input input-sm input-unit"   type="text" data-ing-field="unit"   value="${ing.unit}"   placeholder="Unit" />
        <button class="btn-remove" data-remove-ing="${ing.id}">×</button>
      </div>
      <input class="input input-sm ing-note-input" type="text" data-ing-field="note"
             value="${ing.note || ""}" placeholder="Note (optional)" />
    </div>
  `;
}

function renderStepRow(step, idx, editing, brewMode, ingredients = []) {
  const refs = step.ingredientRefs ?? [];

  // Pills shown in read and brew modes for any linked ingredients
  const refPills = refs.length
    ? `<div class="step-ing-pills">
        ${refs.map(r => {
          const ing = ingredients.find(i => i.id === r.ingId);
          return ing
            ? `<span class="step-ing-pill">${ing.name}${r.note ? `<span class="step-ing-pill-note"> — ${r.note}</span>` : ""}</span>`
            : "";
        }).join("")}
       </div>`
    : "";

  if (brewMode) return `
    <div class="step-row ${step.completed ? "step-done" : ""}">
      <button class="step-check ${step.completed ? "checked" : ""}" data-toggle-step="${step.id}">
        ${step.completed ? "✓" : idx + 1}
      </button>
      <div class="step-body">
        <div class="step-name">${step.name || "(untitled step)"}</div>
        ${step.description ? `<div class="step-desc">${renderMarkdown(step.description)}</div>` : ""}
        ${refPills}
        ${step.completedAt ? `<div class="step-time muted">Done ${step.completedAt}</div>` : ""}
      </div>
    </div>
  `;

  if (!editing) return `
    <div class="step-row">
      <span class="step-num">${idx + 1}</span>
      <div class="step-body">
        <div class="step-name">${step.name || "(untitled step)"}</div>
        ${step.description ? `<div class="step-desc">${renderMarkdown(step.description)}</div>` : ""}
        ${refPills}
      </div>
    </div>
  `;

  // Edit mode — linked ingredient rows + link picker
  const unlinkedIngs = ingredients.filter(ing => !refs.some(r => r.ingId === ing.id));
  const refRows = refs.map(r => {
    const ing = ingredients.find(i => i.id === r.ingId);
    if (!ing) return "";
    return `
      <div class="step-ing-ref-row">
        <span class="step-ing-ref-name">${ing.name || "Unnamed"}</span>
        <input class="input input-sm step-ing-ref-note" type="text"
               data-ref-note-step="${step.id}" data-ref-note-ing="${r.ingId}"
               value="${r.note}" placeholder="Amount / note (optional)" />
        <button class="btn-remove" data-unlink-step="${step.id}" data-unlink-ing="${r.ingId}">×</button>
      </div>
    `;
  }).join("");

  const linkSelect = unlinkedIngs.length
    ? `<select class="input input-sm step-ing-link-select" data-link-step="${step.id}">
        <option value="">+ Link ingredient…</option>
        ${unlinkedIngs.map(ing => `<option value="${ing.id}">${ing.name || "Unnamed"}</option>`).join("")}
       </select>`
    : "";

  return `
    <div class="step-row" data-step-id="${step.id}">
      <span class="step-num">${idx + 1}</span>
      <div class="step-body" style="flex:1">
        <input class="input input-sm" type="text" data-step-field="name"
               value="${step.name || ""}" placeholder="Step name" style="width:100%" />
        <textarea class="input input-sm textarea" data-step-field="description"
                  placeholder="Description (markdown supported)"
                  style="width:100%;margin-top:4px;min-height:56px">${step.description || ""}</textarea>
        ${refRows || linkSelect ? `
          <div class="step-ing-refs">
            ${refRows}
            ${linkSelect}
          </div>
        ` : ""}
      </div>
      <button class="btn-remove" data-remove-step="${step.id}">×</button>
    </div>
  `;
}

// ─── Process log tab ──────────────────────────────────────────────────────────
// TODO: Process log captures freeform timestamped notes during the (often multi-week)
// brew lifecycle — pitch day, nutrient additions, observations, etc.
// Planned: "It's done!" in brew mode already auto-appends a completion entry here.
// Future idea: other milestone events (dry hop, racking, bottling) could auto-log too.
function renderProcessTab(batch) {
  return `
    <div class="tab-content">
      <section class="section">
        <div class="section-header">
          <span class="section-label">Process log</span>
        </div>
        <div class="add-entry-row">
          <input class="input" type="text" id="new-process-entry" placeholder="Add a log entry…" />
          <button class="btn btn-primary" id="btn-add-process">Add</button>
        </div>
        ${batch.processLog.length === 0
          ? `<p class="empty-hint">No entries yet. Log observations, additions, changes as you go.</p>`
          : [...batch.processLog].reverse().map(entry => `
            <div class="log-entry">
              <span class="log-date muted">${entry.date}</span>
              <span class="log-text">${entry.text}</span>
              <button class="btn-remove" data-remove-log="${entry.id}">×</button>
            </div>
          `).join("")
        }
      </section>
    </div>
  `;
}

// ─── Gravity tab ──────────────────────────────────────────────────────────────
function renderGravityTab(batch) {
  return `
    <div class="tab-content">
      <section class="section">
        <div class="section-header">
          <span class="section-label">Gravity readings</span>
        </div>
        <div class="add-entry-row">
          <select class="input input-sm" id="gravity-type" style="width:120px">
            <option value="OG">OG</option>
            <option value="reading">Reading</option>
            <option value="FG">FG</option>
          </select>
          <input class="input input-sm" type="number" step="0.001" id="gravity-value" placeholder="1.090" style="width:120px" />
          <input class="input input-sm" type="date" id="gravity-date" value="${new Date().toISOString().slice(0, 10)}" />
          <button class="btn btn-primary" id="btn-add-gravity">Add</button>
        </div>
        ${batch.gravityLog.length === 0
          ? `<p class="empty-hint">No readings yet.</p>`
          : `
            <table class="gravity-table">
              <thead><tr><th>Date</th><th>Type</th><th>Value</th><th>Est. ABV</th><th></th></tr></thead>
              <tbody>
                ${batch.gravityLog.map(r => {
                  const og  = batch.gravityLog.find(x => x.type === "OG")?.value;
                  const abv = og && r.type !== "OG"
                    ? ((parseFloat(og) - parseFloat(r.value)) * 131.25).toFixed(1) + "%"
                    : "—";
                  return `<tr>
                    <td>${r.date}</td>
                    <td><span class="pill pill-sm">${r.type}</span></td>
                    <td>${r.value}</td>
                    <td>${abv}</td>
                    <td><button class="btn-remove" data-remove-gravity="${r.id}">×</button></td>
                  </tr>`;
                }).join("")}
              </tbody>
            </table>
          `
        }
      </section>
    </div>
  `;
}

// ─── Tasting notes tab ────────────────────────────────────────────────────────
function renderTastingTab(batch) {
  const attrs = ["Dry", "Semi-sweet", "Sweet", "Floral", "Fruity", "Earthy", "Spicy", "Tart", "Smooth", "Astringent", "Funky", "Clean"];
  return `
    <div class="tab-content">
      <section class="section">
        <div class="section-header">
          <span class="section-label">Tasting notes</span>
        </div>
        <div class="tasting-add">
          <textarea class="input textarea" id="new-tasting-text" placeholder="Describe the aroma, flavor, finish…"></textarea>
          <div class="attr-picker">
            ${attrs.map(a => `<button class="attr-btn" data-attr="${a}">${a}</button>`).join("")}
          </div>
          <div style="display:flex;gap:8px;align-items:center;margin-top:8px">
            <input class="input input-sm" type="date" id="tasting-date" value="${new Date().toISOString().slice(0, 10)}" />
            <button class="btn btn-primary" id="btn-add-tasting">Add note</button>
          </div>
        </div>
        ${batch.tastingNotes.length === 0
          ? `<p class="empty-hint">No tasting notes yet.</p>`
          : [...batch.tastingNotes].reverse().map(note => `
            <div class="tasting-card">
              <div class="log-date muted">${note.date}</div>
              <p class="tasting-text">${note.text}</p>
              ${note.attributes?.length ? `
                <div class="attr-row">
                  ${note.attributes.map(a => `<span class="attr-pill">${a}</span>`).join("")}
                </div>
              ` : ""}
              <button class="btn-remove" data-remove-tasting="${note.id}">×</button>
            </div>
          `).join("")
        }
      </section>
    </div>
  `;
}

// ─── Event binding ────────────────────────────────────────────────────────────
let selectedAttrs = [];

function bindEvents() {
  // ── List view ──
  on("btn-new",              () => showNewBatchModal());
  on("btn-new-empty",        () => showNewBatchModal());
  on("btn-export-full",      () => exportAll(state.batches));
  on("btn-import-full",      () => document.getElementById("file-import")?.click());
  on("file-import",          (e) => handleFileImport(e), "change");
  on("btn-show-all-batches", () => { showAllBatches = !showAllBatches; render(); });

  // ── Sync folder ──
  on("btn-sync-connect", async () => {
    if (!window.showDirectoryPicker) { alert("File system sync requires Chrome or Edge."); return; }
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      await saveSyncHandle(handle);
      syncFolderName = handle.name;
      render();
    } catch (e) {
      if (e.name !== "AbortError") alert("Could not connect folder: " + e.message);
    }
  });

  on("btn-sync-push", async () => {
    const btn = document.getElementById("btn-sync-push");
    try {
      await pushToSyncFile(state.batches);
      if (btn) { const orig = btn.textContent; btn.textContent = "↑ Pushed!"; setTimeout(() => { btn.textContent = orig; }, 2000); }
    } catch (e) {
      alert("Push failed: " + e.message);
    }
  });

  on("btn-sync-pull", async () => {
    const btn = document.getElementById("btn-sync-pull");
    try {
      const imported = await pullFromSyncFile();
      if (!imported) { alert("No sync file found yet. Push from another device first."); return; }
      const merged = [...state.batches];
      imported.forEach(b => {
        const idx = merged.findIndex(x => x.id === b.id);
        if (idx >= 0) merged[idx] = b; else merged.push(b);
      });
      saveAll(merged);
      setState({ batches: merged });
      if (btn) { const orig = btn.textContent; btn.textContent = "↓ Pulled!"; setTimeout(() => { btn.textContent = orig; }, 2000); }
    } catch (e) {
      alert("Pull failed: " + e.message);
    }
  });

  // ── Cloud sync ──
  on("btn-cloud-connect", () => {
    const input = document.getElementById("cloud-vault-input");
    const vault = input?.value.trim();
    if (!vault || vault.length < 4) { alert("Enter a passphrase (at least 4 characters)."); return; }
    cloudConfig = { vault };
    saveCloudConfig(cloudConfig);
    cloudSettingsExpanded = false;
    render();
  });

  on("btn-cloud-settings", () => {
    cloudSettingsExpanded = !cloudSettingsExpanded;
    render();
  });

  on("btn-cloud-update", () => {
    const input = document.getElementById("cloud-vault-update-input");
    const vault = input?.value.trim();
    if (!vault || vault.length < 4) { alert("Enter a new passphrase (at least 4 characters)."); return; }
    cloudConfig = { vault };
    saveCloudConfig(cloudConfig);
    cloudSettingsExpanded = false;
    render();
  });

  on("btn-cloud-disconnect", () => {
    if (!confirm("Disconnect cloud sync? Your local data is untouched.")) return;
    cloudConfig = null;
    cloudSettingsExpanded = false;
    clearCloudConfig();
    render();
  });

  on("btn-cloud-push", async () => {
    const btn = document.getElementById("btn-cloud-push");
    try {
      if (btn) btn.textContent = "Pushing…";
      const pushedAt = new Date().toISOString();
      await cloudPush(state.batches, cloudConfig.vault);
      localStorage.setItem("brewlog_cloud_last_push", JSON.stringify(pushedAt));
      if (btn) { btn.textContent = "↑ Pushed!"; setTimeout(() => { btn.textContent = "↑ Push"; }, 2000); }
    } catch (e) {
      if (btn) btn.textContent = "↑ Push";
      alert("Push failed: " + e.message);
    }
  });

  on("btn-cloud-pull", async () => {
    const btn = document.getElementById("btn-cloud-pull");
    try {
      if (btn) btn.textContent = "Pulling…";
      const envelope = await cloudPull(cloudConfig.vault);
      if (!envelope) { alert("Nothing in the cloud yet — push from another device first."); if (btn) btn.textContent = "↓ Pull"; return; }
      const localUpdatedAt = (() => { try { return JSON.parse(localStorage.getItem("brewlog_cloud_last_push") ?? "null"); } catch { return null; } })();
      if (localUpdatedAt && envelope.updatedAt <= localUpdatedAt) {
        alert("Local data is already up to date (remote is not newer).");
        if (btn) btn.textContent = "↓ Pull";
        return;
      }
      backupLocal();
      saveAll(envelope.data);
      localStorage.setItem("brewlog_cloud_last_push", JSON.stringify(envelope.updatedAt));
      setState({ batches: envelope.data });
      if (btn) { btn.textContent = "↓ Pulled!"; setTimeout(() => { btn.textContent = "↓ Pull"; }, 2000); }
    } catch (e) {
      if (btn) btn.textContent = "↓ Pull";
      alert("Pull failed: " + e.message);
    }
  });

  document.querySelectorAll(".batch-card[data-id]").forEach(el => {
    el.addEventListener("click", () => setState({ activeBatchId: el.dataset.id, activeTab: "recipe" }));
  });

  // ── Batch topbar ──
  on("btn-back", () => {
    if (dirty && !confirm("You have unsaved changes. Discard and go back?")) return;
    localBatch = null;
    dirty = false;
    setState({ activeBatchId: null, brewMode: false, activeTab: "recipe" });
  });

  on("btn-save", () => {
    if (!localBatch) return;
    syncFormToLocalBatch();
    const batches = saveBatch(localBatch, state.batches);
    state = { ...state, batches };
    setDirty(false);
    render();
  });

  on("btn-brew-mode", () => {
    syncFormToLocalBatch();
    setState({ brewMode: !state.brewMode });
  });

  // ── Hamburger menu ──
  const menuBtn = document.getElementById("btn-batch-menu");
  const menuPop = document.getElementById("batch-menu-pop");
  if (menuBtn && menuPop) {
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = menuPop.classList.toggle("open");
      menuBtn.classList.toggle("open", open);
    });
    document.addEventListener("click", () => {
      menuPop.classList.remove("open");
      menuBtn.classList.remove("open");
    });
    menuPop.addEventListener("click", (e) => e.stopPropagation());
  }

  on("btn-export-batch", () => { const b = currentBatch(); if (b) exportBatch(b); });

  on("btn-share-batch", () => {
    const b = currentBatch();
    if (!b) return;
    navigator.clipboard.writeText(batchToShareUrl(b));
    alert("Share link copied to clipboard!");
  });

  on("btn-save-template", () => {
    if (!localBatch) return;
    syncFormToLocalBatch();
    const template = {
      ...localBatch,
      id:          newId(),
      name:        localBatch.name,
      isTemplate:  true,
      status:      STATUS.PLANNING,
      startDate:   "",
      gravityLog:  [],
      tastingNotes:[],
      processLog:  [],
      steps:       localBatch.steps.map(s => ({ ...s, id: newId(), completed: false, completedAt: null })),
      ingredients: localBatch.ingredients.map(i => ({ ...i, id: newId() })),
    };
    const batches = saveBatch(template, state.batches);
    state = { ...state, batches };
    document.getElementById("batch-menu-pop")?.classList.remove("open");
    document.getElementById("btn-batch-menu")?.classList.remove("open");
    alert(`"${template.name}" saved as a template. Find it under "My Templates" when creating a new batch.`);
    render();
  });

  on("btn-delete-batch", () => {
    const b = currentBatch();
    if (!b) return;
    const templateLine = b.isTemplate
      ? "\n\nThis is a template — deleting it will remove it from the options when creating a new batch."
      : "";
    if (!confirm(`Are you sure you want to delete "${b.name}"? This cannot be undone.${templateLine}`)) return;
    deleteImage(b.id).catch(() => {});
    imageCache.delete(b.id);
    dirty = false;
    localBatch = null;
    setState({ batches: deleteBatch(b.id, state.batches), activeBatchId: null });
  });

  // ── Image ──
  on("btn-add-image",    () => document.getElementById("file-image")?.click());
  on("btn-remove-image", () => {
    const b = currentBatch();
    if (!b) return;
    deleteImage(b.id).catch(() => {});
    imageCache.delete(b.id);
    render();
  });
  on("file-image", (e) => handleImageUpload(e), "change");

  // ── Tabs ──
  document.querySelectorAll("[data-tab]").forEach(el => {
    el.addEventListener("click", () => {
      syncFormToLocalBatch(); // preserve in-progress edits across tab switches
      setState({ activeTab: el.dataset.tab });
    });
  });

  // ── Meta fields — update localBatch in memory, no re-render ──
  document.querySelectorAll("[data-field]").forEach(el => {
    el.addEventListener("input", () => {
      if (!localBatch) return;
      localBatch = { ...localBatch, [el.dataset.field]: el.value };
      setDirty(true);
    });
  });

  // ── Ingredient fields — update localBatch in memory, no re-render ──
  document.querySelectorAll("[data-ing-field]").forEach(el => {
    el.addEventListener("input", () => {
      if (!localBatch) return;
      const id = el.closest("[data-ing-id]")?.dataset.ingId;
      localBatch = {
        ...localBatch,
        ingredients: localBatch.ingredients.map(ing =>
          ing.id === id ? { ...ing, [el.dataset.ingField]: el.value } : ing
        ),
      };
      setDirty(true);
    });
  });

  // ── Ingredients collapse toggle ──
  on("btn-toggle-ingredients", () => {
    if (dirty) syncFormToLocalBatch();
    ingredientsCollapsed = !ingredientsCollapsed;
    render();
  });

  on("btn-add-ingredient", () => {
    if (!localBatch) return;
    syncFormToLocalBatch();
    const ing = { id: newId(), name: "", amount: "", unit: "", note: "" };
    localBatch = { ...localBatch, ingredients: [...localBatch.ingredients, ing] };
    setDirty(true);
    render();
  });

  document.querySelectorAll("[data-remove-ing]").forEach(el => {
    el.addEventListener("click", () => {
      if (!localBatch) return;
      syncFormToLocalBatch();
      localBatch = { ...localBatch, ingredients: localBatch.ingredients.filter(i => i.id !== el.dataset.removeIng) };
      setDirty(true);
      render();
    });
  });

  // ── Ingredient drag-and-drop reorder ──
  document.querySelectorAll("[data-ing-id][draggable]").forEach(row => {
    row.addEventListener("dragstart", (e) => {
      dragIngId = row.dataset.ingId;
      e.dataTransfer.effectAllowed = "move";
      row.classList.add("dragging");
    });
    row.addEventListener("dragend", () => {
      dragIngId = null;
      document.querySelectorAll(".ingredient-row").forEach(r => r.classList.remove("drag-over", "dragging"));
    });
    row.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (row.dataset.ingId !== dragIngId) row.classList.add("drag-over");
    });
    row.addEventListener("dragleave", () => row.classList.remove("drag-over"));
    row.addEventListener("drop", (e) => {
      e.preventDefault();
      row.classList.remove("drag-over");
      if (!localBatch || !dragIngId || dragIngId === row.dataset.ingId) return;
      syncFormToLocalBatch();
      const ings   = [...localBatch.ingredients];
      const fromIdx = ings.findIndex(i => i.id === dragIngId);
      const toIdx   = ings.findIndex(i => i.id === row.dataset.ingId);
      if (fromIdx < 0 || toIdx < 0) return;
      const [moved] = ings.splice(fromIdx, 1);
      ings.splice(toIdx, 0, moved);
      localBatch = { ...localBatch, ingredients: ings };
      setDirty(true);
      render();
    });
  });

  // ── Step fields — update localBatch in memory, no re-render ──
  document.querySelectorAll("[data-step-field]").forEach(el => {
    el.addEventListener("input", () => {
      if (!localBatch) return;
      const id = el.closest("[data-step-id]")?.dataset.stepId;
      localBatch = {
        ...localBatch,
        steps: localBatch.steps.map(s =>
          s.id === id ? { ...s, [el.dataset.stepField]: el.value } : s
        ),
      };
      setDirty(true);
    });
  });

  on("btn-add-step", () => {
    if (!localBatch) return;
    syncFormToLocalBatch();
    const step = { id: newId(), order: localBatch.steps.length, name: "", description: "", ingredientRefs: [], completed: false, completedAt: null };
    localBatch = { ...localBatch, steps: [...localBatch.steps, step] };
    setDirty(true);
    render();
  });

  document.querySelectorAll("[data-remove-step]").forEach(el => {
    el.addEventListener("click", () => {
      if (!localBatch) return;
      syncFormToLocalBatch();
      localBatch = { ...localBatch, steps: localBatch.steps.filter(s => s.id !== el.dataset.removeStep) };
      setDirty(true);
      render();
    });
  });

  // ── Ingredient refs: link select ──
  document.querySelectorAll(".step-ing-link-select").forEach(el => {
    el.addEventListener("change", () => {
      if (!localBatch) return;
      const stepId = el.dataset.linkStep;
      const ingId  = el.value;
      if (!ingId) return;
      el.value = ""; // reset select
      localBatch = {
        ...localBatch,
        steps: localBatch.steps.map(s =>
          s.id === stepId
            ? { ...s, ingredientRefs: [...(s.ingredientRefs ?? []), { ingId, note: "" }] }
            : s
        ),
      };
      setDirty(true);
      render();
    });
  });

  // ── Ingredient refs: unlink button ──
  document.querySelectorAll("[data-unlink-step]").forEach(el => {
    el.addEventListener("click", () => {
      if (!localBatch) return;
      const stepId = el.dataset.unlinkStep;
      const ingId  = el.dataset.unlinkIng;
      localBatch = {
        ...localBatch,
        steps: localBatch.steps.map(s =>
          s.id === stepId
            ? { ...s, ingredientRefs: (s.ingredientRefs ?? []).filter(r => r.ingId !== ingId) }
            : s
        ),
      };
      setDirty(true);
      render();
    });
  });

  // ── Ingredient refs: note input (no re-render) ──
  document.querySelectorAll("[data-ref-note-step]").forEach(el => {
    el.addEventListener("input", () => {
      if (!localBatch) return;
      const stepId = el.dataset.refNoteStep;
      const ingId  = el.dataset.refNoteIng;
      localBatch = {
        ...localBatch,
        steps: localBatch.steps.map(s =>
          s.id === stepId
            ? { ...s, ingredientRefs: (s.ingredientRefs ?? []).map(r => r.ingId === ingId ? { ...r, note: el.value } : r) }
            : s
        ),
      };
      setDirty(true);
    });
  });

  // ── Brew mode: step toggle (auto-saves immediately) ──
  document.querySelectorAll("[data-toggle-step]").forEach(el => {
    el.addEventListener("click", () => {
      if (!localBatch) return;
      const id = el.dataset.toggleStep;
      localBatch = {
        ...localBatch,
        steps: localBatch.steps.map(s =>
          s.id === id
            ? { ...s, completed: !s.completed, completedAt: !s.completed ? new Date().toLocaleTimeString() : null }
            : s
        ),
      };
      const batches = saveBatch(localBatch, state.batches);
      state = { ...state, batches };
      dirty = false;
      render();
    });
  });

  // ── "It's done!" — auto-saves, logs to process log, marks Complete ──
  on("btn-brew-done", () => {
    if (!localBatch) return;
    const entry = { id: newId(), date: new Date().toLocaleString(), text: "Brew complete — all steps finished." };
    localBatch = {
      ...localBatch,
      status:     STATUS.COMPLETE,
      processLog: [...localBatch.processLog, entry],
    };
    const batches = saveBatch(localBatch, state.batches);
    state = { ...state, batches };
    dirty = false;
    render();
  });

  // ── Process log (auto-saves) ──
  on("btn-add-process", () => {
    if (!localBatch) return;
    const input = document.getElementById("new-process-entry");
    if (!input?.value.trim()) return;
    const entry = { id: newId(), date: new Date().toLocaleString(), text: input.value.trim() };
    localBatch = { ...localBatch, processLog: [...localBatch.processLog, entry] };
    const batches = saveBatch(localBatch, state.batches);
    state = { ...state, batches };
    dirty = false;
    render();
  });

  document.querySelectorAll("[data-remove-log]").forEach(el => {
    el.addEventListener("click", () => {
      if (!localBatch) return;
      localBatch = { ...localBatch, processLog: localBatch.processLog.filter(e => e.id !== el.dataset.removeLog) };
      const batches = saveBatch(localBatch, state.batches);
      state = { ...state, batches };
      dirty = false;
      render();
    });
  });

  // ── Gravity (auto-saves) ──
  on("btn-add-gravity", () => {
    if (!localBatch) return;
    const type  = document.getElementById("gravity-type")?.value;
    const value = document.getElementById("gravity-value")?.value;
    const date  = document.getElementById("gravity-date")?.value;
    if (!value) return;
    const reading = { id: newId(), date, type, value: parseFloat(value) };
    localBatch = { ...localBatch, gravityLog: [...localBatch.gravityLog, reading] };
    const batches = saveBatch(localBatch, state.batches);
    state = { ...state, batches };
    dirty = false;
    render();
  });

  document.querySelectorAll("[data-remove-gravity]").forEach(el => {
    el.addEventListener("click", () => {
      if (!localBatch) return;
      localBatch = { ...localBatch, gravityLog: localBatch.gravityLog.filter(r => r.id !== el.dataset.removeGravity) };
      const batches = saveBatch(localBatch, state.batches);
      state = { ...state, batches };
      dirty = false;
      render();
    });
  });

  // ── Tasting attribute picker ──
  document.querySelectorAll(".attr-btn").forEach(el => {
    el.addEventListener("click", () => {
      const attr = el.dataset.attr;
      if (selectedAttrs.includes(attr)) {
        selectedAttrs = selectedAttrs.filter(a => a !== attr);
        el.classList.remove("attr-selected");
      } else {
        selectedAttrs.push(attr);
        el.classList.add("attr-selected");
      }
    });
  });

  // ── Tasting notes (auto-saves) ──
  on("btn-add-tasting", () => {
    if (!localBatch) return;
    const text = document.getElementById("new-tasting-text")?.value.trim();
    const date = document.getElementById("tasting-date")?.value;
    if (!text) return;
    const note = { id: newId(), date, text, attributes: [...selectedAttrs] };
    selectedAttrs = [];
    localBatch = { ...localBatch, tastingNotes: [...localBatch.tastingNotes, note] };
    const batches = saveBatch(localBatch, state.batches);
    state = { ...state, batches };
    dirty = false;
    render();
  });

  document.querySelectorAll("[data-remove-tasting]").forEach(el => {
    el.addEventListener("click", () => {
      if (!localBatch) return;
      localBatch = { ...localBatch, tastingNotes: localBatch.tastingNotes.filter(n => n.id !== el.dataset.removeTasting) };
      const batches = saveBatch(localBatch, state.batches);
      state = { ...state, batches };
      dirty = false;
      render();
    });
  });
}

function on(id, handler, event = "click") {
  document.getElementById(id)?.addEventListener(event, handler);
}

// ─── Actions ──────────────────────────────────────────────────────────────────
function createNewBatch(type = "blank") {
  let batch;

  if (type.startsWith("custom:")) {
    // User-created template stored as a batch with isTemplate: true
    const sourceId = type.slice(7);
    const source   = state.batches.find(b => b.id === sourceId);
    batch = source ? {
      ...source,
      id:          newId(),
      name:        source.name,
      isTemplate:  false,
      status:      STATUS.FERMENTING,
      startDate:   new Date().toISOString().slice(0, 10),
      gravityLog:  [],
      tastingNotes:[],
      processLog:  [],
      ingredients: source.ingredients.map(i => ({ ...i, id: newId() })),
      steps:       source.steps.map((s, i) => ({ ...s, id: newId(), order: i, completed: false, completedAt: null })),
    } : { ...EMPTY_BATCH, id: newId(), name: "New batch", style: "Mead", status: STATUS.FERMENTING, startDate: new Date().toISOString().slice(0, 10) };
  } else {
    const template = type !== "blank" ? TEMPLATES[type] : null;
    batch = template ? {
      ...EMPTY_BATCH,
      id:        newId(),
      name:      `New ${type}`,
      style:     template.style,
      status:    STATUS.FERMENTING,
      startDate: new Date().toISOString().slice(0, 10),
      batchSize: template.batchSize,
      targetABV: template.targetABV,
      notes:     template.notes,
      ingredients: template.ingredients.map(ing => ({
        id:     newId(),
        name:   ing.name,
        amount: ing.amount,
        unit:   ing.unit   || "",
        note:   ing.note   || "",
      })),
      steps: template.steps.map((step, i) => ({
        id:             newId(),
        order:          i,
        name:           step.text,
        description:    step.note || "",
        ingredientRefs: [],
        completed:      false,
        completedAt:    null,
      })),
      gravityLog:   [],
      tastingNotes: [],
      processLog:   [],
    } : {
      ...EMPTY_BATCH,
      id:        newId(),
      name:      "New batch",
      style:     "Mead",
      status:    STATUS.FERMENTING,
      startDate: new Date().toISOString().slice(0, 10),
    };
  }

  const batches = saveBatch(batch, state.batches);
  setState({ batches, activeBatchId: batch.id, activeTab: "recipe" });
}

async function handleImageUpload(e) {
  const file = e.target.files?.[0];
  if (!file || !localBatch) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    try {
      const resized = await resizeImage(ev.target.result);
      await saveImage(localBatch.id, resized);
      imageCache.set(localBatch.id, resized);
      render();
    } catch {
      alert("Failed to save image.");
    }
  };
  reader.readAsDataURL(file);
  e.target.value = "";
}

function handleFileImport(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const parsed = JSON.parse(ev.target.result);
      // Support both full backup { batches: [...] } and single-batch { batch: {...} }
      let imported;
      if (Array.isArray(parsed)) {
        imported = parsed;
      } else if (parsed.batches) {
        imported = parsed.batches;
      } else if (parsed.batch) {
        imported = [parsed.batch];
      } else {
        imported = [];
      }
      const merged = [...state.batches];
      imported.forEach(b => { if (!merged.find(x => x.id === b.id)) merged.push(b); });
      saveAll(merged);
      setState({ batches: merged });
      alert(`Imported ${imported.length} batch(es).`);
    } catch {
      alert("Invalid backup file.");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}
