import React, { useEffect, useMemo, useState } from "react";
import { screenMakerPortalApi } from "../../../../api/screenMakerPortalApi";

/**
 * SM Rework CP3 — "Screens Used" input.
 *
 * Replaces the old read-only "Designs to Make Screen" section with an
 * actual write path: one dropdown per (placement, colour) slot, sourced
 * from Screen Inventory (context.available_screens). Picking a screen
 * auto-saves immediately — no separate submit button, matching the
 * big-button / minimal-typing production-floor UI rule.
 *
 * Writes go through ScreenAssignmentService (CP2 backend), which is what
 * actually populates screen_assignments — the table the Printer Portal
 * and CSR Review Hub read from. Before CP2/CP3 that table was only ever
 * written by the legacy POST /screen-making endpoint (SM Rework CP5 —
 * that endpoint, its controller/service/request/resource, have since
 * been removed entirely).
 *
 * Behaviour surfaced here (all decided with Josh, 2026-07-28):
 *   - picking a screen already 'in_use' on a DIFFERENT order is allowed,
 *     but shows an amber warning naming that order
 *   - picking a 'damaged' or 'for_reclaim' screen is rejected by the
 *     backend (422) — shown as a field error, selection reverts
 *   - clearing a slot back to blank un-assigns it
 */

/** Merge the slot's CURRENT screen into the picker options, even if its
 *  status means it no longer appears in availableScreens (e.g. it just
 *  became 'in_use' from this very pick) — otherwise the dropdown would
 *  appear to "lose" the choice the screen maker just made. */
function useSlotOptions(availableScreens, currentScreen) {
  return useMemo(() => {
    const list = [...availableScreens];
    if (currentScreen && !list.some((s) => s.id === currentScreen.id)) {
      list.unshift(currentScreen);
    }
    return list;
  }, [availableScreens, currentScreen]);
}

const screenLabel = (s) => {
  const bits = [s.name || `Screen #${s.id}`];
  if (s.size) bits.push(s.size);
  if (s.mesh_count) bits.push(`mesh ${s.mesh_count}`);
  return bits.join(" — ");
};

const ScreenSlotRow = ({ slot, availableScreens, orderStageId, onSaved }) => {
  const [screenId, setScreenId] = useState(slot.screen?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [conflict, setConflict] = useState(null);

  // Resync local selection whenever the parent re-fetches context
  // (e.g. after this row's own save, or another row's).
  useEffect(() => {
    setScreenId(slot.screen?.id ?? "");
    setConflict(null);
    setError(null);
  }, [slot.assignment_id, slot.screen?.id]);

  const options = useSlotOptions(availableScreens, slot.screen);

  const handleChange = async (e) => {
    const value = e.target.value;
    setScreenId(value);
    setError(null);
    setConflict(null);

    if (!value) {
      if (!slot.assignment_id) return; // was already blank
      setSaving(true);
      try {
        await screenMakerPortalApi.deleteScreenAssignment(slot.assignment_id);
        onSaved?.();
      } catch (err) {
        setError(err?.response?.data?.message || "Hindi na-clear. Subukan ulit.");
        setScreenId(slot.screen?.id ?? "");
      } finally {
        setSaving(false);
      }
      return;
    }

    setSaving(true);
    try {
      const result = await screenMakerPortalApi.assignScreen({
        order_stage_id: orderStageId,
        placement_id: slot.placement_id,
        color_index: slot.color_index,
        screen_id: Number(value),
      });
      if (result.conflict) setConflict(result.conflict);
      onSaved?.();
    } catch (err) {
      const data = err?.response?.data;
      setError(
        data?.errors?.screen_id?.[0] ||
        data?.errors?.color_index?.[0] ||
        data?.message ||
        "Hindi na-save. Subukan ulit.",
      );
      setScreenId(slot.screen?.id ?? ""); // revert the dropdown
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
      <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-[11px] flex items-center justify-center font-semibold shrink-0 mt-0.5">
        {slot.color_index}
      </div>

      <div className="flex-1 min-w-0">
        {slot.pantone ? (
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="inline-block w-3.5 h-3.5 rounded-sm border border-gray-300 shrink-0"
              style={{ background: slot.pantone.hexcolor || "#e5e7eb" }}
              title={slot.pantone.hexcolor || ""}
            />
            <span className="text-[11px] text-gray-600 truncate">
              {slot.pantone.pantone_code || slot.pantone.name || `Color ${slot.color_index}`}
            </span>
          </div>
        ) : (
          <p className="text-[11px] text-gray-400 mb-1">Color {slot.color_index}</p>
        )}

        <div className="relative">
          <select
            value={screenId}
            onChange={handleChange}
            disabled={saving}
            className={`w-full text-sm border rounded px-2 py-1.5 bg-white disabled:opacity-50 ${
              error ? "border-red-300" : "border-gray-300"
            }`}
          >
            <option value="">— Pumili ng Screen —</option>
            {options.map((s) => (
              <option key={s.id} value={s.id}>
                {screenLabel(s)}
              </option>
            ))}
          </select>
          {saving && (
            <i className="fa-solid fa-spinner fa-spin text-gray-400 text-xs absolute right-2 top-1/2 -translate-y-1/2" />
          )}
        </div>

        {error && <p className="text-[10px] text-red-600 mt-1">{error}</p>}

        {conflict && (
          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-1">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            Ginagamit pa ito sa order {conflict.po_code || `#${conflict.order_id}`}
            {conflict.client_name ? ` (${conflict.client_name})` : ""}. Sigurado ka bang
            gagamitin din dito?
          </p>
        )}
      </div>
    </div>
  );
};

const ScreensUsedSection = ({
  screenSlots = [],
  availableScreens = [],
  orderStageId,
  onChanged,
}) => {
  // The context ships a flat list of (placement, colour) slots — group
  // them back into placement cards for display, same visual language as
  // Design Details' PlacementCard, in first-seen order.
  const groups = useMemo(() => {
    const map = new Map();
    screenSlots.forEach((slot) => {
      if (!map.has(slot.placement_id)) {
        map.set(slot.placement_id, {
          placement_id: slot.placement_id,
          placement_type: slot.placement_type,
          mockup_url: slot.mockup_url,
          slots: [],
        });
      }
      map.get(slot.placement_id).slots.push(slot);
    });
    return Array.from(map.values());
  }, [screenSlots]);

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          <i className="fa-solid fa-layer-group text-[11px]" />
        </span>
        Screens Used
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Piliin ang physical screen para sa bawat kulay. Awtomatikong nase-save
        pagkapili — walang kailangang i-submit.
      </p>

      {groups.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic">
          Wala pang placement mula sa Graphic Artist.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((g) => (
            <div key={g.placement_id} className="grid sm:grid-cols-[40px_1fr] gap-3">
              <div className="shrink-0 w-10 h-10 rounded border border-gray-200 bg-gray-50 overflow-hidden">
                {g.mockup_url ? (
                  <img
                    src={g.mockup_url}
                    alt={g.placement_type}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-gray-300 text-[9px]">
                    n/a
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 capitalize mb-1">
                  {g.placement_type || "—"}
                </p>
                <div className="flex flex-col">
                  {g.slots.map((slot) => (
                    <ScreenSlotRow
                      key={`${slot.placement_id}-${slot.color_index}`}
                      slot={slot}
                      availableScreens={availableScreens}
                      orderStageId={orderStageId}
                      onSaved={onChanged}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ScreensUsedSection;
