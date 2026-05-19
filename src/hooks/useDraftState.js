import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Phase 7-B — Generic localStorage-backed draft state hook.
 *
 * Per the §7-B.8 Q5 decision: in-progress checklist tick states (and
 * any other partial-task state) live in the browser's localStorage so
 * a closed tab or refreshed page doesn't lose work. On successful
 * submit, the caller calls `clear()` to drop the draft.
 *
 * Usage:
 *
 *   const [draft, setDraft, clearDraft] = useDraftState(
 *     `qa-packer:${orderStageId}:${userId}`,
 *     { qaChecklist: {}, packingChecklist: {} },
 *   );
 *
 * Behaviour:
 *   - Hydrates from localStorage on mount (or falls back to initialValue
 *     if there's no stored draft).
 *   - Writes to localStorage on every state change (debounced 200ms to
 *     keep tap-heavy interactions fast).
 *   - `clear()` removes the stored draft and resets local state to
 *     initialValue.
 *   - If localStorage is unavailable (private window, quota exceeded,
 *     etc.) the hook degrades to in-memory state — no errors thrown.
 *
 * Note: this is intentionally local — no cross-tab BroadcastChannel,
 * no sync across devices. Same packer, same shift, same device is the
 * design assumption.
 */
export default function useDraftState(key, initialValue) {
  // Read once, lazily, on first render. Memoised by useState's lazy init.
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initialValue;
      const parsed = JSON.parse(raw);
      // If the stored shape is an object and initialValue is also an
      // object, merge so newly added fields in initialValue aren't lost.
      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        initialValue &&
        typeof initialValue === "object" &&
        !Array.isArray(initialValue)
      ) {
        return { ...initialValue, ...parsed };
      }
      return parsed;
    } catch {
      return initialValue;
    }
  });

  // Debounced write to localStorage. 200ms is fast enough that a packer
  // ticking through 7 checkboxes never notices, and slow enough that
  // we're not churning the storage layer.
  const writeTimer = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Storage full or unavailable — fail silently. The user's work
        // is still in React state for this session.
      }
    }, 200);

    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [key, value]);

  const clear = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, setValue, clear];
}
