import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Phase 7-B — Shared localStorage-backed draft state hook.
 *
 * Per the §7-B.8 Q5 decision: in-progress checklist tick states (and
 * any other partial-task state) live in the browser's localStorage so
 * a closed tab or refreshed page doesn't lose work.
 *
 * Bundle 4a hotfix: turned into a SHARED store keyed on the
 * localStorage key, so multiple components reading the same draft
 * stay in sync. The previous implementation gave each component its
 * own React state copy that desynced from localStorage after mount,
 * which surfaced in Bundle 4a when SubmitCompletedSection read stale
 * tick state from PackingChecklistSection.
 *
 * Usage (unchanged from the original):
 *
 *   const [draft, setDraft, clearDraft] = useDraftState(
 *     `qa-packer:${orderStageId}:${userId}`,
 *     { qa: {}, packing: {} },
 *   );
 *
 * Behaviour:
 *   - Hydrates from localStorage on first subscription (lazy).
 *   - Multiple components with the same key share the same in-memory
 *     state; setValue from any one updates all of them on the same
 *     render tick.
 *   - Writes to localStorage are debounced 200ms per key.
 *   - clear() removes the stored draft and resets to initialValue.
 *   - Degrades gracefully when localStorage is unavailable.
 */

// Module-level shared registry. One entry per key.
//   value:       the live in-memory state
//   listeners:   Set of (re-render) callbacks
//   writeTimer:  the debounced write handle
const stores = new Map();

function ensureStore(key, initialValue) {
  if (stores.has(key)) return stores.get(key);

  // Hydrate from localStorage if possible.
  let initial = initialValue;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        // Merge stored object onto initialValue so newly added fields
        // in initialValue aren't lost on schema evolution.
        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed) &&
          initialValue &&
          typeof initialValue === "object" &&
          !Array.isArray(initialValue)
        ) {
          initial = { ...initialValue, ...parsed };
        } else {
          initial = parsed;
        }
      }
    } catch {
      // Fallback to initialValue on any read failure.
    }
  }

  const entry = {
    value: initial,
    listeners: new Set(),
    writeTimer: null,
  };
  stores.set(key, entry);
  return entry;
}

function persistDebounced(key, entry) {
  if (typeof window === "undefined") return;
  if (entry.writeTimer) clearTimeout(entry.writeTimer);
  entry.writeTimer = setTimeout(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(entry.value));
    } catch {
      // Storage full / unavailable — fail silently.
      // In-memory state is still consistent for this session.
    }
  }, 200);
}

function setValueAt(key, updater, initialValue) {
  const entry = ensureStore(key, initialValue);
  const next =
    typeof updater === "function" ? updater(entry.value) : updater;
  entry.value = next;
  persistDebounced(key, entry);
  // Notify every subscribed component synchronously.
  entry.listeners.forEach((cb) => cb());
}

function clearValueAt(key, initialValue) {
  const entry = ensureStore(key, initialValue);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
  if (entry.writeTimer) {
    clearTimeout(entry.writeTimer);
    entry.writeTimer = null;
  }
  entry.value = initialValue;
  entry.listeners.forEach((cb) => cb());
}

export default function useDraftState(key, initialValue) {
  // Capture initialValue in a ref so subscribe()/getSnapshot() always
  // see the same reference. Changing initialValue between renders is
  // treated as a no-op (matches the original hook's contract).
  const initialRef = useRef(initialValue);

  // Make sure the store exists synchronously on first render so
  // getSnapshot has something stable to return.
  ensureStore(key, initialRef.current);

  const subscribe = useCallback(
    (cb) => {
      const entry = ensureStore(key, initialRef.current);
      entry.listeners.add(cb);
      return () => {
        entry.listeners.delete(cb);
      };
    },
    [key],
  );

  const getSnapshot = useCallback(() => {
    return ensureStore(key, initialRef.current).value;
  }, [key]);

  // useSyncExternalStore is the React 18+ official way to subscribe
  // to an external store with full concurrent-mode safety.
  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setValue = useCallback(
    (updater) => {
      setValueAt(key, updater, initialRef.current);
    },
    [key],
  );

  const clear = useCallback(() => {
    clearValueAt(key, initialRef.current);
  }, [key]);

  return [value, setValue, clear];
}
