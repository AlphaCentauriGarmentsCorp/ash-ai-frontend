/**
 * ashEvents — the app-wide "server state changed" signal.
 *
 * Why this exists
 * ---------------
 * Before this, every badge owned its own `setInterval`: the bell polled every
 * 30s, the sidebar every 45s, the Dashboard widget every 45s. Nothing told
 * anyone else when data actually changed, so approving a payment or tapping
 * "Tapos na" left every other badge stale until its next tick — or until the
 * page was refreshed. That's the bug this fixes.
 *
 * Two channels, one handler:
 *   - same tab  → a CustomEvent on `window`
 *   - other tabs → a `storage` write, which browsers deliver ONLY to the
 *     other tabs of the same origin (never back to the writer, so no loop).
 *
 * Emitting is automatic: see the response interceptor in `api/axios.js`,
 * which fires on every successful mutating (non-GET) request. Components
 * almost never need to call `emitDataChanged` by hand.
 *
 * Mirrors the `cartUpdated` pattern already used on the REEFER frontend.
 */

export const ASH_DATA_CHANGED = "ash:data-changed";

/** localStorage key used purely as a cross-tab ping. Value is never read. */
const CROSS_TAB_KEY = "ash:data-changed-at";

/**
 * Announce that server state changed and any cached counts are stale.
 *
 * @param {object}  detail            free-form context (method, url, status…)
 * @param {boolean} detail.crossTab   set false to keep the signal in this tab
 */
export function emitDataChanged(detail = {}) {
    if (typeof window === "undefined") return;

    window.dispatchEvent(new CustomEvent(ASH_DATA_CHANGED, { detail }));

    if (detail.crossTab === false) return;

    try {
        // The value must change every time or the `storage` event won't fire.
        window.localStorage.setItem(CROSS_TAB_KEY, `${Date.now()}.${Math.random()}`);
    } catch {
        // Private mode / quota — cross-tab sync degrades, same-tab still works.
    }
}

/**
 * Subscribe to the signal from BOTH channels.
 *
 * @param  {(detail: object) => void} handler
 * @return {() => void} unsubscribe — call it from your effect cleanup.
 */
export function onDataChanged(handler) {
    if (typeof window === "undefined") return () => { };

    const onLocal = (e) => handler(e.detail || {});
    const onCrossTab = (e) => {
        if (e.key === CROSS_TAB_KEY && e.newValue) handler({ crossTab: true });
    };

    window.addEventListener(ASH_DATA_CHANGED, onLocal);
    window.addEventListener("storage", onCrossTab);

    return () => {
        window.removeEventListener(ASH_DATA_CHANGED, onLocal);
        window.removeEventListener("storage", onCrossTab);
    };
}

export default { ASH_DATA_CHANGED, emitDataChanged, onDataChanged };
