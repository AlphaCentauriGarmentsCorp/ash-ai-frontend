import React, { useEffect, useMemo, useState } from "react";
import { graphicArtistPortalApi } from "../../../../api/graphicArtistPortalApi";
import useConfirm from "../../../../hooks/useConfirm";
import PantonePickerModal from "./PantonePickerModal";

/**
 * GA Portal CP6 — Print Locations & Pantone editor, picker edition.
 *
 * CP2 shipped this editor with free-typed Pantone codes; CP6 replaces the
 * text inputs with a searchable picker over the existing pantones catalog
 * (context.pantone_options). Picking stores the catalog ID, so the swatch
 * hex travels everywhere — this portal, the admin Graphic Design page,
 * and the Review Hub card — with zero re-typing.
 *
 * Slot semantics unchanged: slot count defaults to the quotation Color#,
 * artist adds/removes freely, unfilled slots are warn-only on Tapos na.
 *
 * Legacy entries (free-typed codes saved before CP6, no catalog id) still
 * display with their code; saving passes them through untouched. To
 * change one, clear it and pick from the catalog.
 *
 * The catalog carries duplicate rows (same code+name+hex under different
 * ids) — options are deduped client-side by (code|name|hex).
 */

const MAX_SLOTS = 20;
const MAX_SUGGESTIONS = 40;

const clampSlots = (n) => Math.max(0, Math.min(MAX_SLOTS, n));

/** Build editor slot state from a saved placement's hydrated pantones. */
const slotsFromPlacement = (p) => {
  const entries = Array.isArray(p.pantones) ? p.pantones : [];
  const filled = entries.map((e) => ({
    id: e.id ?? null,
    pantone_code: e.pantone_code || null,
    name: e.name || null,
    hexcolor: e.hexcolor || null,
  }));
  const target = clampSlots(Math.max(p.color_count ?? 0, filled.length));
  while (filled.length < target) {
    filled.push({ id: null, pantone_code: null, name: null, hexcolor: null });
  }
  return filled;
};

const slotIsEmpty = (s) => !s.id && !s.pantone_code && !s.name;

/** Serialise editor slots into the API pantones payload. */
const slotsToPayload = (slots) =>
  slots
    .map((s) => {
      if (slotIsEmpty(s)) return null;
      // Catalog pick → ID reference (swatch hex hydrates everywhere).
      if (s.id) return { id: s.id };
      // Legacy free-typed entry → pass through untouched.
      return {
        pantone_code: s.pantone_code,
        name: s.name,
        hexcolor: s.hexcolor,
      };
    })
    .filter((e) => e !== null);

// ── Pantone slot (CP8: chip + palette button; picking happens in
// the PantonePickerModal, mirroring Add Order's swatch-picker UX) ──

const PantoneSlotField = ({ slot, onOpenPicker, onClear }) => {
  if (!slotIsEmpty(slot)) {
    return (
      <div className="flex-1 min-w-0 flex items-center gap-2 border border-gray-300 rounded px-2 py-1.5 bg-white">
        <span
          className="inline-block w-4 h-4 rounded-sm border border-gray-300 shrink-0"
          style={{ background: slot.hexcolor || "#e5e7eb" }}
          title={slot.hexcolor || ""}
        />
        <span className="text-sm text-gray-800 truncate">
          {slot.pantone_code || "—"}
          {slot.name ? (
            <span className="text-gray-400"> — {slot.name}</span>
          ) : null}
          {!slot.id && (
            <span className="ml-1 text-[9px] uppercase tracking-wide text-amber-500">
              typed
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={onClear}
          className="ml-auto text-gray-400 hover:text-red-600 shrink-0"
          title="I-clear ang color na ito"
        >
          <i className="fa-solid fa-eraser text-xs" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 flex items-center gap-2">
      <span className="flex-1 min-w-0 border border-dashed border-gray-300 rounded px-2 py-1.5 text-sm text-gray-400 italic truncate bg-white">
        Wala pang napipiling Pantone
      </span>
      <button
        type="button"
        onClick={onOpenPicker}
        title="Pumili mula sa Pantone catalog"
        className="h-[34px] w-[42px] flex items-center justify-center text-sm rounded-lg bg-light/60 text-primary border border-gray-300 hover:bg-primary/10 shrink-0"
      >
        <i className="fas fa-palette"></i>
      </button>
    </div>
  );
};

// ── Single placement editor card ─────────────────────────────────

const PlacementEditorCard = ({
  placement,
  pantoneOptions,
  usedPantones,
  orderId,
  orderStageId,
  onChanged,
  onDeleteRequested,
}) => {
  const [slots, setSlots] = useState(() => slotsFromPlacement(placement));
  const [artworkFile, setArtworkFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [dirty, setDirty] = useState(false);
  // Which slot the Pantone picker modal is open for (null = closed).
  const [pickerSlot, setPickerSlot] = useState(null);

  // Re-sync when the parent refetches (e.g. after save elsewhere).
  useEffect(() => {
    setSlots(slotsFromPlacement(placement));
    setArtworkFile(null);
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placement.id, placement.color_count, JSON.stringify(placement.pantones)]);

  const pickSlot = (i, option) => {
    setSlots((prev) =>
      prev.map((s, idx) =>
        idx === i
          ? {
              id: option.id,
              pantone_code: option.pantone_code,
              name: option.name,
              hexcolor: option.hexcolor,
            }
          : s,
      ),
    );
    setDirty(true);
  };

  const clearSlot = (i) => {
    setSlots((prev) =>
      prev.map((s, idx) =>
        idx === i
          ? { id: null, pantone_code: null, name: null, hexcolor: null }
          : s,
      ),
    );
    setDirty(true);
  };

  const addSlot = () => {
    if (slots.length >= MAX_SLOTS) return;
    setSlots((prev) => [
      ...prev,
      { id: null, pantone_code: null, name: null, hexcolor: null },
    ]);
    setDirty(true);
  };

  const removeSlot = (i) => {
    setSlots((prev) => prev.filter((_, idx) => idx !== i));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await graphicArtistPortalApi.upsertPlacement({
        order_id: orderId,
        order_stage_id: orderStageId,
        id: placement.id,
        type: placement.type,
        color_count: slots.length,
        pantones: slotsToPayload(slots),
        artwork: artworkFile || undefined,
      });
      setArtworkFile(null);
      setDirty(false);
      onChanged?.();
    } catch (err) {
      setError(
        err?.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(" ")
          : err?.response?.data?.message || "Hindi na-save. Subukan ulit.",
      );
    } finally {
      setSaving(false);
    }
  };

  const filledCount = slots.filter((s) => !slotIsEmpty(s)).length;

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-sm font-bold text-red-800 capitalize">
          {placement.type}
        </p>
        <button
          type="button"
          onClick={() => onDeleteRequested(placement)}
          className="text-xs text-red-500 hover:text-red-700 inline-flex items-center gap-1 shrink-0"
        >
          <i className="fa-solid fa-trash-can" /> Tanggalin
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Artwork upload box */}
        <div className="shrink-0 w-full sm:w-40">
          <label className="block w-full aspect-square rounded border-2 border-dashed border-gray-300 bg-white overflow-hidden cursor-pointer hover:border-primary relative">
            {artworkFile ? (
              <img
                src={URL.createObjectURL(artworkFile)}
                alt="preview"
                className="w-full h-full object-contain"
              />
            ) : placement.mockup_url ? (
              <img
                src={placement.mockup_url}
                alt={placement.type}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 text-xs font-semibold">
                <i className="fa-solid fa-plus text-2xl mb-1 text-green-300" />
                UPLOAD IMAGE
              </span>
            )}
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setArtworkFile(f);
                  setDirty(true);
                }
                e.target.value = "";
              }}
            />
          </label>
          <p className="text-[10px] text-gray-400 mt-1 text-center">
            Artwork ng placement na ito (PNG/JPG/WebP/PDF, max 10 MB)
          </p>
        </div>

        {/* Color# + Pantone picker slots */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-xs font-semibold text-gray-700">
              Color#:
            </label>
            <span className="text-sm font-bold text-gray-900">
              {slots.length}
            </span>
            <button
              type="button"
              onClick={addSlot}
              disabled={slots.length >= MAX_SLOTS}
              className="ml-auto text-xs bg-white border border-gray-300 rounded px-2 py-1 hover:border-primary disabled:opacity-40 inline-flex items-center gap-1"
            >
              <i className="fa-solid fa-plus" /> Dagdag color
            </button>
          </div>

          {slots.length === 0 ? (
            <p className="text-[11px] text-gray-400 italic">
              Walang color slot. Pindutin ang "Dagdag color" para magsimula.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {slots.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-gray-600 w-32 shrink-0 uppercase">
                    Pantone/Color {i + 1}:
                  </span>
                  <PantoneSlotField
                    slot={s}
                    onOpenPicker={() => setPickerSlot(i)}
                    onClear={() => clearSlot(i)}
                  />
                  <button
                    type="button"
                    onClick={() => removeSlot(i)}
                    className="text-gray-400 hover:text-red-600 shrink-0"
                    title="Tanggalin ang slot"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-[10px] text-gray-400 mt-2">
            {filledCount}/{slots.length} na Pantone ang nakalagay. Pwedeng
            i-save kahit kulang pa — babalaan ka lang bago ang Tapos na.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 mt-2">
          <i className="fa-solid fa-triangle-exclamation mr-1" />
          {error}
        </p>
      )}

      <PantonePickerModal
        open={pickerSlot !== null}
        options={pantoneOptions}
        usedPantones={usedPantones}
        currentValue={pickerSlot !== null ? slots[pickerSlot] : null}
        onClose={() => setPickerSlot(null)}
        onSelect={(o) => {
          if (pickerSlot !== null) pickSlot(pickerSlot, o);
          setPickerSlot(null);
        }}
      />

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 inline-flex items-center gap-2"
        >
          {saving ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" /> Sine-save…
            </>
          ) : (
            <>
              <i className="fa-solid fa-floppy-disk" /> I-save
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Suggestion card (quotation-seeded) ───────────────────────────

const SuggestionCard = ({ suggestion, orderId, orderStageId, onChanged }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleAccept = async () => {
    setSaving(true);
    setError(null);
    try {
      await graphicArtistPortalApi.upsertPlacement({
        order_id: orderId,
        order_stage_id: orderStageId,
        type: suggestion.type,
        color_count: suggestion.color_count ?? undefined,
        pantones: [],
      });
      onChanged?.();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Hindi na-save. Subukan ulit.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/60">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 border border-amber-200 rounded px-1.5 py-0.5 mb-1">
            <i className="fa-solid fa-file-invoice" /> Galing sa quotation
          </span>
          <p className="text-sm font-bold text-gray-900 capitalize">
            {suggestion.type}
          </p>
          <p className="text-[11px] text-gray-600 mt-0.5">
            {suggestion.color_count
              ? `${suggestion.color_count} color${suggestion.color_count > 1 ? "s" : ""} ayon sa quotation`
              : "Walang color count sa quotation"}
            {suggestion.print_type ? ` · ${suggestion.print_type}` : ""}
          </p>
          {suggestion.artwork_url && (
            <a
              href={suggestion.artwork_url}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-primary underline inline-flex items-center gap-1 mt-1"
            >
              <i className={`fa-solid ${suggestion.is_link ? "fa-link" : "fa-image"}`} />
              Tingnan ang artwork reference
            </a>
          )}
        </div>
        <button
          type="button"
          onClick={handleAccept}
          disabled={saving}
          className="shrink-0 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-2"
        >
          {saving ? (
            <i className="fa-solid fa-spinner fa-spin" />
          ) : (
            <i className="fa-solid fa-plus" />
          )}
          I-save ang placement
        </button>
      </div>
      <p className="text-[10px] text-gray-500 mt-2">
        Reference lang ang artwork galing sa quotation — i-upload ang final
        artwork pagkatapos i-save.
      </p>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};

// ── Section ──────────────────────────────────────────────────────

const PrintLocationsSection = ({
  placements = [],
  suggestedPlacements = [],
  placementOptions = [],
  pantoneOptions = [],
  orderId,
  orderStageId,
  onChanged,
}) => {
  const { confirm, dialog } = useConfirm();
  const [addSelect, setAddSelect] = useState("");
  const [customType, setCustomType] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(null);

  // The catalog carries duplicate rows — dedupe by (code|name|hex),
  // keeping the first id, then sort by code for stable browsing.
  const dedupedPantones = useMemo(() => {
    const seen = new Map();
    for (const o of pantoneOptions) {
      const key = `${(o.pantone_code || "").toLowerCase()}|${(o.name || "").toLowerCase()}|${(o.hexcolor || "").toLowerCase()}`;
      if (!seen.has(key)) seen.set(key, o);
    }
    return Array.from(seen.values()).sort((a, b) =>
      String(a.pantone_code || "").localeCompare(String(b.pantone_code || "")),
    );
  }, [pantoneOptions]);

  const existingTypes = new Set(
    placements.map((p) => (p.type || "").toLowerCase()),
  );

  // CP9 — pantones already used on THIS order's placements feed the
  // picker's "Ginamit sa order na ito" shelf (dedupe by code|hex).
  const usedPantones = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const p of placements) {
      for (const e of Array.isArray(p.pantones) ? p.pantones : []) {
        const key = `${(e.pantone_code || "").toLowerCase()}|${(e.hexcolor || "").toLowerCase()}`;
        if (key === "|" || seen.has(key)) continue;
        seen.add(key);
        out.push(e);
      }
    }
    return out;
  }, [placements]);

  const handleAdd = async () => {
    const type =
      addSelect === "__custom__" ? customType.trim() : addSelect.trim();
    if (!type) return;
    if (existingTypes.has(type.toLowerCase())) {
      setAddError(`May placement na na '${type}' sa order na ito.`);
      return;
    }
    setAdding(true);
    setAddError(null);
    try {
      await graphicArtistPortalApi.upsertPlacement({
        order_id: orderId,
        order_stage_id: orderStageId,
        type,
        pantones: [],
      });
      setAddSelect("");
      setCustomType("");
      onChanged?.();
    } catch (err) {
      setAddError(
        err?.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(" ")
          : err?.response?.data?.message || "Hindi na-add. Subukan ulit.",
      );
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (placement) => {
    const ok = await confirm({
      title: "Tanggalin ang placement?",
      message: `Buburahin ang '${placement.type}' pati ang artwork at Pantones nito. Hindi ito maibabalik.`,
      confirmLabel: "Oo, tanggalin",
      cancelLabel: "Huwag",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await graphicArtistPortalApi.deletePlacement(placement.id, orderStageId);
      onChanged?.();
    } catch {
      // Refetch shows the true state either way.
      onChanged?.();
    }
  };

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          <i className="fa-solid fa-location-dot text-[11px]" />
        </span>
        Print Locations &amp; Pantones
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Mga placement, artwork, at Pantone ng print. Pindutin ang palette button para pumili mula
        sa catalog — lalabas ang kulay pagkapili.
      </p>

      {/* Quotation-seeded suggestions (first load only) */}
      {suggestedPlacements.length > 0 && (
        <div className="flex flex-col gap-3 mb-4">
          {suggestedPlacements.map((s, i) => (
            <SuggestionCard
              key={`${s.type}-${i}`}
              suggestion={s}
              orderId={orderId}
              orderStageId={orderStageId}
              onChanged={onChanged}
            />
          ))}
        </div>
      )}

      {/* Saved placements — editable cards */}
      {placements.length === 0 && suggestedPlacements.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic mb-3">
          Wala pang placement. Mag-add sa baba para magsimula.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {placements.map((p) => (
            <PlacementEditorCard
              key={p.id}
              placement={p}
              pantoneOptions={dedupedPantones}
              usedPantones={usedPantones}
              orderId={orderId}
              orderStageId={orderStageId}
              onChanged={onChanged}
              onDeleteRequested={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Print Location */}
      <div className="mt-4 border-t border-gray-100 pt-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={addSelect}
            onChange={(e) => {
              setAddSelect(e.target.value);
              setAddError(null);
            }}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary sm:w-64"
          >
            <option value="">-- Add Print Location --</option>
            {placementOptions.map((o) => (
              <option
                key={o.id}
                value={o.name}
                disabled={existingTypes.has(o.name.toLowerCase())}
              >
                {o.name}
              </option>
            ))}
            <option value="__custom__">Iba pa (i-type)…</option>
          </select>

          {addSelect === "__custom__" && (
            <input
              type="text"
              value={customType}
              onChange={(e) => {
                setCustomType(e.target.value);
                setAddError(null);
              }}
              placeholder="Pangalan ng placement"
              maxLength={64}
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-1 focus:outline-none focus:border-primary"
            />
          )}

          <button
            type="button"
            onClick={handleAdd}
            disabled={
              adding ||
              !addSelect ||
              (addSelect === "__custom__" && !customType.trim())
            }
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 inline-flex items-center justify-center gap-2"
          >
            {adding ? (
              <i className="fa-solid fa-spinner fa-spin" />
            ) : (
              <i className="fa-solid fa-plus" />
            )}
            I-add
          </button>
        </div>
        {addError && <p className="text-xs text-red-600 mt-1">{addError}</p>}
      </div>

      {dialog}
    </section>
  );
};

export default PrintLocationsSection;
