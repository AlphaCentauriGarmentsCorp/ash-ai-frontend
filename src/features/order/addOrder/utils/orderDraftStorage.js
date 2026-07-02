/**
 * orderDraftStorage
 *
 * sessionStorage-backed single draft slot for the "New Order (from Quotation)"
 * flow. location.state prefill dies on refresh / session-expiry re-login, and
 * confirmAndConvert has ALREADY marked the quotation Converted by then (409 on
 * retry) — so the payload + everything the user typed must survive in the tab.
 *
 * Slot shape (v1):
 *   { v, savedAt, quotationCode, prefill, snapshot }
 *   snapshot: { formData (File objects stripped), samples, selectedOptions,
 *               strippedFiles } | null   (null = pristine prefill, nothing typed)
 *
 * sessionStorage on purpose: per-tab, survives refresh AND logout→login in the
 * same tab (AuthContext only touches localStorage), gone when the tab closes —
 * so no stale drafts leak across users on a shared machine.
 */

const KEY = "ash:add-order-draft";
const VERSION = 1;

// formData keys that hold arrays of File objects from <input type="file">.
const FILE_ARRAY_KEYS = ["design_files", "design_mockup", "freebies_files", "payments"];

const isFile = (v) => typeof File !== "undefined" && v instanceof File;

/**
 * Strip non-serialisable File objects from a formData snapshot.
 * Returns { data, strippedFiles } — strippedFiles drives the banner note
 * telling the user to re-attach uploads after resuming.
 */
export const sanitizeFormDataForDraft = (formData) => {
    if (!formData) return { data: null, strippedFiles: false };
    let strippedFiles = false;
    const data = { ...formData };

    FILE_ARRAY_KEYS.forEach((key) => {
        const arr = Array.isArray(data[key]) ? data[key] : [];
        const kept = arr.filter((item) => !isFile(item));
        if (kept.length !== arr.length) strippedFiles = true;
        data[key] = kept;
    });

    // Label design may carry a single File under labelDesign.file.
    if (data.labelDesign && isFile(data.labelDesign.file)) {
        strippedFiles = true;
        data.labelDesign = { ...data.labelDesign, file: null };
    }

    return { data, strippedFiles };
};

/** Load the draft, or null. Malformed / wrong-version slots self-clear. */
export const loadOrderDraft = () => {
    try {
        const raw = sessionStorage.getItem(KEY);
        if (!raw) return null;
        const draft = JSON.parse(raw);
        if (!draft || draft.v !== VERSION || !draft.prefill) {
            sessionStorage.removeItem(KEY);
            return null;
        }
        return draft;
    } catch {
        try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
        return null;
    }
};

/** Overwrite the slot. Best-effort — quota/serialisation errors never throw. */
export const saveOrderDraft = ({ prefill, snapshot }) => {
    if (!prefill) return;
    try {
        const draft = {
            v: VERSION,
            savedAt: new Date().toISOString(),
            quotationCode:
                prefill.quotation_code ||
                (prefill.quotation_id ? `#${prefill.quotation_id}` : ""),
            prefill,
            snapshot: snapshot ?? null,
        };
        sessionStorage.setItem(KEY, JSON.stringify(draft));
    } catch {
        /* best-effort only */
    }
};

export const clearOrderDraft = () => {
    try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
};
