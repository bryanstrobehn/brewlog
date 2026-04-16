/**
 * sync-client.js — drop-in personal sync for any vanilla JS app.
 *
 * Usage:
 *   const sync = new SyncClient({ endpoint: "https://syncer.you.workers.dev", vault: "my-passphrase", app: "brewlog" });
 *   await sync.push(myData);
 *   const data = await sync.pull();
 */
export class SyncClient {
  constructor({ endpoint, vault, app }) {
    if (!endpoint || !vault || !app) throw new Error("SyncClient: endpoint, vault, and app are required");
    this._endpoint = endpoint.replace(/\/$/, "");
    this._vault = vault;
    this._app = app;
  }

  async push(data) {
    const res = await fetch(`${this._endpoint}/v1/${encodeURIComponent(this._app)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Vault": this._vault },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`sync push failed: ${res.status}`);
    return res.json();
  }

  async pull() {
    const res = await fetch(`${this._endpoint}/v1/${encodeURIComponent(this._app)}`, {
      headers: { "X-Vault": this._vault },
    });
    if (!res.ok) throw new Error(`sync pull failed: ${res.status}`);
    const { data } = await res.json();
    return data;
  }
}

/**
 * UMD shim so this also works as a plain <script> tag (no bundler).
 * When loaded as a module the export above is used instead.
 */
if (typeof window !== "undefined" && typeof module === "undefined") {
  window.SyncClient = SyncClient;
}
