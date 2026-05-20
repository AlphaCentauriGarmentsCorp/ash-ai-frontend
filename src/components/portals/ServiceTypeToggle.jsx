import React, { useState } from "react";
import { orderStagesApi } from "../../api/orderStagesApi";
import { useAuth } from "../../hooks/useAuth";
import { hasRequiredPermissions } from "../../utils/authz";

/**
 * Phase 5-D — Service Type Toggle.
 *
 * Compact UI for switching a stage between in-house and subcontract.
 * Hidden entirely unless the current user has action.switch-service-type.
 *
 * Props:
 *   stage       - { id, stage, status, service_type }
 *   onChanged   - callback after successful switch
 *   size        - 'sm' (default) | 'md' for in-portal vs in-page contexts
 *
 * Behavior:
 *   - Shows current value as a badge
 *   - Click → opens an inline confirm with optional reason field
 *   - Saving disables the switch until response returns
 *   - On error, shows the server message inline
 *
 * Flippable check is enforced server-side; we still hide the toggle
 * for non-flippable stages so the UI doesn't suggest false control.
 */

const FLIPPABLE_STAGES = [
  "sample_creation",
  "mass_production",
  "screen_making",
  "quality_control",
  "packing",
];

const ServiceTypeToggle = ({ stage, onChanged, size = "sm" }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Permission gate
  if (!hasRequiredPermissions(user, ["action.switch-service-type"])) {
    return null;
  }

  // Stage flippability gate
  if (!FLIPPABLE_STAGES.includes(stage?.stage)) {
    return null;
  }

  // Completed stage can't be flipped
  if (stage?.status === "completed") {
    return null;
  }

  const current = stage?.service_type ?? "in_house";
  const target = current === "in_house" ? "subcontract" : "in_house";
  const targetLabel = target === "in_house" ? "In-House" : "Subcontract";
  const currentLabel = current === "in_house" ? "In-House" : "Subcontract";

  const handleSwitch = async () => {
    setSaving(true);
    setError(null);

    try {
      await orderStagesApi.switchServiceType(stage.id, target, reason || null);
      setOpen(false);
      setReason("");
      onChanged?.();
    } catch (err) {
      const msg =
        err?.response?.data?.errors?.permission?.[0] ||
        err?.response?.data?.errors?.stage?.[0] ||
        err?.response?.data?.errors?.status?.[0] ||
        err?.response?.data?.message ||
        "Hindi nakapag-switch. Subukan ulit.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const badgeClass =
    current === "in_house"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-purple-50 text-purple-700 border-purple-200";

  const containerPadding = size === "md" ? "p-4" : "p-3";

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${containerPadding}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
            Service Type
          </span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded border ${badgeClass}`}
          >
            <i
              className={`fa-solid ${
                current === "in_house" ? "fa-house" : "fa-truck"
              } mr-1`}
            />
            {currentLabel}
          </span>
        </div>

        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
          >
            Switch to {targetLabel}
          </button>
        )}
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-600 mb-2">
            Switch this stage to <strong>{targetLabel}</strong>?
            {target === "subcontract" && (
              <span className="block text-[11px] text-amber-700 mt-1">
                <i className="fa-solid fa-triangle-exclamation mr-1" />
                Any current in-house assignment will be cleared.
              </span>
            )}
            {target === "in_house" && (
              <span className="block text-[11px] text-amber-700 mt-1">
                <i className="fa-solid fa-triangle-exclamation mr-1" />
                Any active subcontract assignment will be cancelled.
              </span>
            )}
          </p>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Reason (optional, audit trail) — e.g. 'In-house printer down for maintenance'"
            disabled={saving}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 mb-2"
          />

          {error && (
            <p className="text-[11px] text-red-700 mb-2">
              <i className="fa-solid fa-triangle-exclamation mr-1" />
              {error}
            </p>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setReason("");
                setError(null);
              }}
              disabled={saving}
              className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSwitch}
              disabled={saving}
              className="text-xs px-3 py-1.5 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Switching…" : `Switch to ${targetLabel}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceTypeToggle;
