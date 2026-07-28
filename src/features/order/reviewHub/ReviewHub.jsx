import React, { useCallback, useEffect, useMemo, useState } from "react";
import { OrderStages, isPaymentGate, stageOrdinal, getStatusMeta, findStage, getParallelTiers } from "../../../constants/formOptions/orderStages";
import { getRoleDisplayName } from "../../../config/roleConfig";
import { stageReviewApi } from "../../../api/stageReviewApi";
import { orderRoleNotesApi } from "../../../api/orderRoleNotesApi";
import MaterialRequirementSummaryTable from "../../../pages/Portals/MaterialPrep/MaterialRequirementSummaryTable";

/**
 * CSR Review Hub
 * ------------------------------------------------------------------------
 * Read-only review-and-history surface for the order's Production tab.
 * CSR / Super Admin / Admin can APPROVE or REJECT each stage's output and
 * browse the full review history. The reject/resubmit loop is advisory: it
 * never moves the workflow pointer (see StageReviewService for the rationale).
 *
 * Data:
 *   - order.orderStages           → the 16-stage spine (id, stage, sequence,
 *                                    status, assigned_role)
 *   - stageReviewApi.forOrder()   → { history (by stage id), states (by stage id) }
 *
 * Reviewer actions are gated client-side by the access.production-review
 * permission (the backend enforces it too). Non-reviewers see a read-only hub.
 */

// Notes-only hub (owner decision): the Approve/Reject buttons and the
// review-state badge were removed — staff leave freeform notes instead.
// Legacy approve/reject/resubmit rows recorded before the change still
// render in the thread with their original labels.
const DECISION_META = {
  approve: { label: "Approved", icon: "fa-circle-check", cls: "text-green-600" },
  reject: { label: "Rejected", icon: "fa-circle-xmark", cls: "text-red-600" },
  resubmit: { label: "Resubmitted", icon: "fa-rotate-left", cls: "text-amber-600" },
  note: { label: "Note", icon: "fa-note-sticky", cls: "text-gray-400" },
};

// Payment-gate details (Fix: verified payments must stay viewable after the
// Dashboard queue drops them — the Review Hub is their permanent home).
const PAYMENT_TYPE_LABELS = {
  sample: "Sample",
  down_payment: "Downpayment (60%)",
  balance: "Balance (40%)",
  full: "Full Payment",
};

const PAYMENT_STATUS_BADGE = {
  waiting: { label: "Waiting", cls: "bg-gray-100 text-gray-600" },
  for_verification: { label: "For Verification", cls: "bg-amber-100 text-amber-700" },
  verified: { label: "Verified", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-700" },
};

// SM Rework CP3 — the Hub → role instruction channels, keyed by stage slug.
// A stage listed here gets the order-level instruction composer on its card,
// posting to `role` (the order_role_notes audience_role); the matching
// portal surfaces the thread in its "Notes / Instructions" section. Adding
// a new both-ways channel = one entry here + the portal-side thread.
const INSTRUCTION_AUDIENCES = {
  graphic_artwork: {
    role: "graphic_artist",
    label: "Graphic Artist",
    short: "GA",
    portalName: "GA Portal",
    placeholder: "Halimbawa: Gamitin ang bagong logo sa likod, dalawang kulay lang.",
  },
  screen_making: {
    role: "screen_maker",
    label: "Screen Maker",
    short: "Screen Maker",
    portalName: "Screen Maker Portal",
    placeholder: "Halimbawa: Unahin ang Front screen — kailangan bago ang sample.",
  },
  // Cutter Rework CP3 — the cutter owns TWO stages; both post to the one
  // order-level 'cutter' instruction thread (audience_role = 'cutter'), so
  // an instruction from either card reaches the Cutter Portal.
  sample_cutting: {
    role: "cutter",
    label: "Cutter",
    short: "Cutter",
    portalName: "Cutter Portal",
    placeholder: "Halimbawa: I-double check ang grain line bago mag-cut.",
  },
  mass_cutting: {
    role: "cutter",
    label: "Cutter",
    short: "Cutter",
    portalName: "Cutter Portal",
    placeholder: "Halimbawa: Sundin ang sample cutting layout para pantay ang yield.",
  },
};

const fmtWhen = (iso) => {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString();
};

const fmtPeso = (v) =>
  `\u20B1${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const labelFor = (slug) =>
  OrderStages.find((d) => d.value === slug)?.label || slug;
const iconFor = (slug) =>
  OrderStages.find((d) => d.value === slug)?.icon || "fa-circle";

// Tiers shared by >1 stage (the sample-phase fork). Used to badge parallel
// stages, mirroring the Workflow Timeline.
const PARALLEL_TIERS = new Set(getParallelTiers());

// Per-card note composer — any staff who can open the hub can post.
const NoteComposer = ({ stage, onSubmit, busy }) => {
  const [text, setText] = useState("");
  const [err, setErr] = useState(null);

  const submit = async () => {
    const comment = text.trim();
    if (!comment) {
      setErr("Type a note first.");
      return;
    }
    const ok = await onSubmit(stage, comment);
    if (ok) {
      setText("");
      setErr(null);
    }
  };

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-400">
        Add a note
      </label>
      <textarea
        rows={2}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setErr(null);
        }}
        disabled={busy}
        placeholder="Anything worth recording about this stage…"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
      <div className="mt-1.5 flex justify-end">
        <button
          onClick={submit}
          disabled={busy}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Add Note"}
        </button>
      </div>
    </div>
  );
};

// GA Portal CP4 — rich Graphic Artwork detail block.
// Renders the artist's saved output (placements + Pantones + labels +
// design notes) from the hub payload's stage_details map. Only rendered
// when there is actual saved content; otherwise the card falls through
// to the usual "No artifact uploaded" state. Soft completion warnings
// ride along so the reviewer sees what's still missing at a glance.
const gaDetailsHasContent = (d) => {
  if (!d || d.kind !== "graphic_artwork") return false;
  // GA-AUTHORED output only — label specs / the label design can be set
  // at order creation, so they must not make an untouched stage look
  // "worked". They render as context once the block is shown.
  return (
    (Array.isArray(d.placements) && d.placements.length > 0) ||
    (Array.isArray(d.pantones_used) && d.pantones_used.length > 0) ||
    Boolean(d.stage_notes)
  );
};

// SM Rework CP3 — Screen Making detail block gate. SM-AUTHORED output
// only: the design/placements on the payload are GA context (already on
// the Graphic Artwork card above), so only the physical screen mapping
// and the maker's own Save Notes count as "worked".
const smDetailsHasContent = (d) => {
  if (!d || d.kind !== "screen_making") return false;
  return (
    (Array.isArray(d.screens) && d.screens.length > 0) ||
    Boolean(d.stage_notes)
  );
};

// Cutter Rework CP3 — Cutting detail block gate. CUTTER-AUTHORED output
// only: the per-roll/batch fabric entries the cutter logged and the
// cutter's own Save Notes. Aggregate totals live in the auto-computed
// Waste block, so they must not make an untouched stage look worked.
const cuttingDetailsHasContent = (d) => {
  if (!d || d.kind !== "cutting") return false;
  return (
    (Array.isArray(d.fabric_logs) && d.fabric_logs.length > 0) ||
    Boolean(d.stage_notes)
  );
};

// Owner decision (2026-07-28) — Material Prep detail block gate. Only
// shows once a requirement has actually been saved (materials picked +
// quantities confirmed, possibly with a resulting Purchase Request) or the
// role left a stage note — an untouched stage still falls through to the
// generic "No artifact uploaded" card, same convention as the blocks above.
const materialPrepDetailsHasContent = (d) => {
  if (!d || d.kind !== "material_prep") return false;
  return Boolean(d.requirement) || Boolean(d.stage_notes);
};

// CP8 — one read-only label spec line for the hub card.
const HubLabelSpec = ({ title, spec }) => {
  if (!spec || !spec.enabled) return null;
  const bits = [spec.material, spec.method, spec.placement, spec.measurement]
    .filter((v) => v && String(v).trim() !== "")
    .join(" · ");
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-[11px]">
      <p className="font-semibold text-gray-700">{title}</p>
      <p className="text-gray-500">{bits || "—"}</p>
      {spec.notes && <p className="italic text-gray-400">{spec.notes}</p>}
    </div>
  );
};

const GaDetailsBlock = ({ details }) => {
  const placements = Array.isArray(details.placements) ? details.placements : [];
  const pantones = Array.isArray(details.pantones_used) ? details.pantones_used : [];
  const labels = details.labels || {};
  const hasLabelSpecs = Boolean(
    labels.brand_label?.enabled || labels.care_label?.enabled,
  );
  const warnings = Array.isArray(details.completion_warnings)
    ? details.completion_warnings
    : [];

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
        Graphic Artwork Output
      </p>

      {/* Placements — artwork + Color# + Pantone chips per location */}
      {placements.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {placements.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-2.5"
            >
              <div className="flex gap-2.5">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded border border-gray-200 bg-white">
                  {p.mockup_url ? (
                    <a href={p.mockup_url} target="_blank" rel="noreferrer">
                      <img
                        src={p.mockup_url}
                        alt={p.type}
                        className="h-full w-full object-contain"
                      />
                    </a>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[9px] text-gray-300">
                      no artwork
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold capitalize text-gray-800">
                    {p.type}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Color#: {p.color_count ?? (p.pantones?.length || 0)}
                    {" · "}
                    {p.pantones?.length || 0} Pantone
                    {(p.pantones?.length || 0) === 1 ? "" : "s"} set
                  </p>
                  {Array.isArray(p.pantones) && p.pantones.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {p.pantones.map((pc, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-700"
                          title={pc.pantone_code || pc.name}
                        >
                          {pc.hexcolor && (
                            <span
                              className="inline-block h-2 w-2 rounded-sm border border-gray-300"
                              style={{ background: pc.hexcolor }}
                            />
                          )}
                          {pc.pantone_code || pc.name || "\u2014"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aggregated Pantone palette */}
      {pantones.length > 0 && (
        <div className="mt-2">
          <p className="mb-1 text-[10px] uppercase tracking-wide text-gray-400">
            Pantone Palette ({pantones.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {pantones.map((pc, i) => (
              <span
                key={pc.id ?? `inline-${i}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-700"
              >
                <span
                  className="inline-block h-3 w-3 rounded-full border border-gray-300"
                  style={{ background: pc.hexcolor || "#e5e7eb" }}
                />
                {pc.pantone_code || pc.name || "\u2014"}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Labels — aligned with the order structure (CP8): Brand +
          Care/Size specs and the ONE shared Label Design */}
      {(hasLabelSpecs || labels.label_design_url) && (
        <div className="mt-2">
          {hasLabelSpecs && (
            <div className="grid gap-2 sm:grid-cols-2">
              <HubLabelSpec title="Brand Label" spec={labels.brand_label} />
              <HubLabelSpec
                title="Care / Size Label"
                spec={labels.care_label}
              />
            </div>
          )}
          {labels.label_design_url && (
            <a
              href={labels.label_design_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2"
              title="Open label design"
            >
              <img
                src={labels.label_design_url}
                alt="Label design"
                className="h-10 w-10 rounded border border-gray-200 bg-white object-contain"
              />
              <span className="text-[11px] text-gray-600">Label Design</span>
            </a>
          )}
        </div>
      )}

      {/* GA stage notes (CP8) — the artist's own "Save Notes" blob from the
          GA Portal, promoted from a one-liner to a labeled block (CP2
          role-notes) so the reviewer can't miss it. */}
      {details.stage_notes && (
        <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-400">
            <i className="fa-solid fa-comment-dots mr-1" />
            Notes mula sa Graphic Artist
          </p>
          <p className="whitespace-pre-wrap text-xs text-gray-700">
            {details.stage_notes}
          </p>
        </div>
      )}

      {/* Soft completion warnings — review context, never blocking */}
      {warnings.length > 0 && (
        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2">
          {warnings.map((w, i) => (
            <p key={w.code + i} className="text-[11px] text-amber-700">
              <i className="fa-solid fa-triangle-exclamation mr-1" />
              {w.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

// SM Rework CP3 — rich Screen Making detail block.
// Renders the screen maker's output from the hub payload's stage_details
// map: the physical screen mapping (screen_assignments → screens) and the
// maker's own "Save Notes" blob. The design/placements are NOT repeated
// here — they live on the Graphic Artwork card above; placement ids are
// resolved to their type names for readability.
const SmDetailsBlock = ({ details }) => {
  const screens = Array.isArray(details.screens) ? details.screens : [];

  // placement_id → type (e.g. 8 → "Front") for the table's first column.
  const placementNames = {};
  (Array.isArray(details.placements) ? details.placements : []).forEach((p) => {
    placementNames[p.id] = p.type;
  });

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
        Screen Making Output
      </p>

      {/* Physical screens mapped to the order's placements */}
      {screens.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left text-[10px] uppercase tracking-wide text-gray-500">
                <th className="py-1.5 pr-3">Placement</th>
                <th className="py-1.5 pr-3">Color #</th>
                <th className="py-1.5 pr-3">Screen</th>
                <th className="py-1.5 pr-3">Size</th>
                <th className="py-1.5 pr-3">Mesh</th>
                <th className="py-1.5">Location</th>
              </tr>
            </thead>
            <tbody>
              {screens.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-1.5 pr-3 capitalize text-gray-700">
                    {placementNames[s.placement_id] || `#${s.placement_id}`}
                  </td>
                  <td className="py-1.5 pr-3 text-gray-700">{s.color_index}</td>
                  <td className="py-1.5 pr-3 font-medium text-gray-900">
                    {s.screen?.name || "\u2014"}
                  </td>
                  <td className="py-1.5 pr-3 text-gray-700">{s.screen?.size || "\u2014"}</td>
                  <td className="py-1.5 pr-3 text-gray-700">{s.screen?.mesh_count || "\u2014"}</td>
                  <td className="py-1.5 text-gray-500">{s.screen?.address || "\u2014"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SM stage notes — the maker's own "Save Notes" blob from the
          Screen Maker Portal (the reason this block exists: the notes
          must reflect here in the hub). */}
      {details.stage_notes && (
        <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-400">
            <i className="fa-solid fa-comment-dots mr-1" />
            Notes mula sa Screen Maker
          </p>
          <p className="whitespace-pre-wrap text-xs text-gray-700">
            {details.stage_notes}
          </p>
        </div>
      )}
    </div>
  );
};

// Cutter Rework CP3 — Cutting detail block. Renders the cutter's
// per-entry fabric usage (each roll/batch the cutter logged) and the
// cutter's own "Save Notes" blob. The aggregate fabric used/waste totals
// are NOT repeated here — the auto-computed Waste & material usage block
// already shows them; this block adds the per-roll/batch breakdown the
// reviewer can't see there. The cutter owns two stages, so each cutting
// card renders its own stage's logs + notes (keyed by stage id upstream).
const CutterDetailsBlock = ({ details }) => {
  const logs = Array.isArray(details.fabric_logs) ? details.fabric_logs : [];

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
        Cutting Output
      </p>

      {/* Per-roll / per-batch fabric usage the cutter logged. Aggregate
          totals live in the Waste & material usage block above. */}
      {logs.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left text-[10px] uppercase tracking-wide text-gray-500">
                <th className="py-1.5 pr-3">Roll / Batch</th>
                <th className="py-1.5 pr-3">Used</th>
                <th className="py-1.5 pr-3">Waste</th>
                <th className="py-1.5 pr-3">Remaining</th>
                <th className="py-1.5">Logged by</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-gray-100 last:border-0"
                  title={l.notes || ""}
                >
                  <td className="py-1.5 pr-3 font-medium text-gray-900">
                    {l.fabric_roll_id || "\u2014"}
                  </td>
                  <td className="py-1.5 pr-3 text-gray-700">{fmtKg(l.fabric_used_kg)}</td>
                  <td className="py-1.5 pr-3 text-gray-700">{fmtKg(l.waste_kg)}</td>
                  <td className="py-1.5 pr-3 text-gray-700">{fmtKg(l.usable_remaining_kg)}</td>
                  <td className="py-1.5 text-gray-500">{l.logged_by?.name || "\u2014"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cutter stage notes — the cutter's own "Save Notes" blob from the
          Cutter Portal (the reason this block exists: the notes must
          reflect here in the hub). */}
      {details.stage_notes && (
        <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-400">
            <i className="fa-solid fa-comment-dots mr-1" />
            Notes mula sa Cutter
          </p>
          <p className="whitespace-pre-wrap text-xs text-gray-700">
            {details.stage_notes}
          </p>
        </div>
      )}
    </div>
  );
};

// Owner decision (2026-07-28) — Material Prep detail block. Shows exactly
// what was picked for THIS Material Prep stage (sample or mass): the
// catalog items + quantities + resulting Purchase Request, reusing the
// same read-only table Material Prep's own portal and every downstream
// portal (Cutter/Printer/Sewer/QA-Packer) already show as "Material
// Details" — one visual language for "what was picked" everywhere it
// appears.
const MaterialPrepDetailsBlock = ({ details }) => {
  const req = details.requirement;
  const phaseLabel =
    details.phase === "sample" ? "Sample" : details.phase === "mass" ? "Mass production" : null;

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
        Material Prep{phaseLabel ? ` — ${phaseLabel}` : ""}
      </p>

      {req ? (
        <MaterialRequirementSummaryTable
          mr={req.mr}
          purchase_needed={req.purchase_needed}
          pr={req.pr}
        />
      ) : (
        <p className="text-xs italic text-gray-400">
          No materials picked yet for this stage.
        </p>
      )}

      {details.stage_notes && (
        <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-400">
            <i className="fa-solid fa-comment-dots mr-1" />
            Notes mula sa Material Prep
          </p>
          <p className="whitespace-pre-wrap text-xs text-gray-700">
            {details.stage_notes}
          </p>
        </div>
      )}
    </div>
  );
};

// CP2 — Role-directed instructions (Hub → role). An ORDER-level thread
// aimed at one production role: entries posted here land in that role's
// portal "Notes / Instructions" section. Separate channel from the
// per-stage notes thread below (which stays on this card's own record).
// SM Rework CP3 — parameterized by `audience` (see INSTRUCTION_AUDIENCES)
// so the Graphic Artwork and Screen Making cards each address their own
// role with the same component.
const InstructionsBlock = ({ audience, entries, onPost, busy }) => {
  const [text, setText] = useState("");
  const [err, setErr] = useState(null);
  const list = Array.isArray(entries) ? entries : [];

  const submit = async () => {
    const body = text.trim();
    if (!body) {
      setErr("Type an instruction first.");
      return;
    }
    const ok = await onPost(audience.role, body);
    if (ok) {
      setText("");
      setErr(null);
    }
  };

  return (
    <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50/60 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-indigo-700">
        <i className="fa-solid fa-paper-plane mr-1" />
        Instructions para sa {audience.label}
      </p>
      <p className="mb-2 mt-0.5 text-[11px] text-indigo-900/70">
        Order-level ito at lalabas sa {audience.portalName} — hiwalay sa stage
        notes sa ibaba.
      </p>

      {list.length > 0 ? (
        <ul className="mb-2 space-y-2">
          {list.map((n) => (
            <li
              key={n.id}
              className="rounded-lg border border-indigo-100 bg-white p-2"
            >
              <p className="text-[10px] text-gray-400">
                {n.author?.name || "\u2014"} · {n.created_at}
              </p>
              <p className="whitespace-pre-wrap text-sm text-gray-700">
                {n.body}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-2 text-xs italic text-indigo-900/50">
          Wala pang instructions para sa {audience.short}.
        </p>
      )}

      <textarea
        rows={2}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setErr(null);
        }}
        disabled={busy}
        placeholder={audience.placeholder}
        className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
      <div className="mt-1.5 flex justify-end">
        <button
          onClick={submit}
          disabled={busy}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Ipinapadala…" : `Ipadala sa ${audience.short}`}
        </button>
      </div>
    </div>
  );
};

// Read-only per-stage waste / material usage. Auto-computed on the backend
// from what the production portals already log (fabric / ink / reject) — the
// Review Hub only displays it; nobody types waste here. Rendered only when the
// stage actually has data (the `waste` map omits empty stages).
const wasteHasContent = (w) =>
  !!w && (w.fabric || w.ink || w.rejects || w.other);

const fmtKg = (n) => `${Number(n ?? 0)} kg`;

const WasteBlock = ({ waste }) => {
  if (!wasteHasContent(waste)) return null;

  const rows = [];
  if (waste.fabric) {
    rows.push({
      key: "fabric",
      icon: "fa-scissors",
      label: "Fabric",
      value: `used ${fmtKg(waste.fabric.used_kg)} · waste ${fmtKg(waste.fabric.waste_kg)}`,
      entries: waste.fabric.entries,
    });
  }
  if (waste.ink) {
    rows.push({
      key: "ink",
      icon: "fa-fill-drip",
      label: "Ink",
      value: `used ${fmtKg(waste.ink.used_kg)} · waste ${fmtKg(waste.ink.waste_kg)}`,
      entries: waste.ink.entries,
    });
  }
  if (waste.rejects) {
    rows.push({
      key: "rejects",
      icon: "fa-ban",
      label: "Rejects",
      value: `${waste.rejects.reject_pcs} pcs rejected · ${waste.rejects.repair_pcs} pcs for repair`,
      entries: waste.rejects.entries,
    });
  }
  if (waste.other) {
    rows.push({
      key: "other",
      icon: "fa-trash-can",
      label: "Other waste",
      value: `${waste.other.pcs} pcs`,
      entries: waste.other.entries,
    });
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Waste &amp; material usage
        </p>
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
          <i className="fa-solid fa-wand-magic-sparkles" /> Auto-computed
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <div
            key={r.key}
            className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-1.5 text-xs"
          >
            <span className="inline-flex items-center gap-2 text-gray-600">
              <i className={`fa-solid ${r.icon} w-4 text-center text-gray-400`} />
              <span className="font-medium text-gray-700">{r.label}</span>
            </span>
            <span className="text-right text-gray-700">
              {r.value}
              {r.entries != null && (
                <span className="ml-2 text-[10px] text-gray-400">
                  ({r.entries} {r.entries === 1 ? "log" : "logs"})
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-[10px] italic text-gray-400">
        Recorded by the production portals — not editable here.
      </p>
    </div>
  );
};

const StageCard = ({ stage, history, uploads, payment, details, waste, onAddNote, busyId, roleNotes, instructionAudience, onPostInstruction, instructionBusy }) => {
  const busy = busyId === stage.id;
  const paymentGate = isPaymentGate(stage.stage);
  const hasGaDetails = gaDetailsHasContent(details);
  const hasSmDetails = smDetailsHasContent(details);
  const hasCuttingDetails = cuttingDetailsHasContent(details);
  const hasMaterialPrepDetails = materialPrepDetailsHasContent(details);
  const statusMeta = getStatusMeta(stage.status);
  const isParallel = PARALLEL_TIERS.has(stage.sequence);

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <i className={`fa-solid ${iconFor(stage.stage)} mt-1 text-gray-400`} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-xs text-gray-600">
                #{stageOrdinal(stage.stage) ?? stage.sequence}
              </span>
              <p className="font-semibold text-gray-800">{labelFor(stage.stage)}</p>
              {isParallel && (
                <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-indigo-700">
                  <i className="fa-solid fa-code-branch" /> Parallel
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
              <span className="inline-flex items-center gap-1">
                <i className="fa-solid fa-user-tag text-gray-400" />
                {getRoleDisplayName(stage.assigned_role || findStage(stage.stage)?.role)}
              </span>
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                {statusMeta.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment gates — the full record of the gate's payment. Stays here
          permanently, so a verified payment is still viewable after it
          leaves the Dashboard "Pending Approvals" queue. */}
      {paymentGate && payment && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Payment Details
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                (PAYMENT_STATUS_BADGE[payment.status] || PAYMENT_STATUS_BADGE.waiting).cls
              }`}
            >
              {(PAYMENT_STATUS_BADGE[payment.status] || PAYMENT_STATUS_BADGE.waiting).label}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
            <div>
              <p className="text-gray-400">Payment Type</p>
              <p className="font-medium text-gray-700">
                {PAYMENT_TYPE_LABELS[payment.payment_type] || payment.payment_type}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Amount</p>
              <p className="font-semibold text-gray-800">{fmtPeso(payment.amount)}</p>
            </div>
            <div>
              <p className="text-gray-400">Method</p>
              <p className="font-medium text-gray-700">{payment.method_name || "\u2014"}</p>
            </div>
            <div>
              <p className="text-gray-400">Payer</p>
              <p className="font-medium text-gray-700">{payment.payer_name || "\u2014"}</p>
            </div>
            <div>
              <p className="text-gray-400">Reference No.</p>
              <p className="font-medium text-gray-700">{payment.reference_number || "\u2014"}</p>
            </div>
            <div>
              <p className="text-gray-400">Paid At</p>
              <p className="font-medium text-gray-700">{fmtWhen(payment.paid_at)}</p>
            </div>
            <div>
              <p className="text-gray-400">Recorded By</p>
              <p className="font-medium text-gray-700">
                {payment.uploaded_by_name || "\u2014"}
                <span className="block text-[10px] text-gray-400">{fmtWhen(payment.uploaded_at)}</span>
              </p>
            </div>
            <div>
              <p className="text-gray-400">Verified By</p>
              <p className="font-medium text-gray-700">
                {payment.verified_by_name || "\u2014"}
                <span className="block text-[10px] text-gray-400">{fmtWhen(payment.verified_at)}</span>
              </p>
            </div>
          </div>
          {payment.rejection_reason && (
            <p className="mt-2 text-xs text-red-600">
              <i className="fa-solid fa-circle-xmark mr-1" />
              {payment.rejection_reason}
            </p>
          )}
          {payment.notes && (
            <p className="mt-2 text-xs italic text-gray-500">{payment.notes}</p>
          )}
          {payment.proof_url && (
            <a
              href={payment.proof_url}
              target="_blank"
              rel="noreferrer"
              title="Open proof of payment"
              className="mt-2 block w-fit overflow-hidden rounded-lg border border-gray-200"
            >
              <img
                src={payment.proof_url}
                alt="Proof of payment"
                className="h-24 object-cover"
              />
              <p className="px-1 py-0.5 text-[10px] text-gray-500">Proof of payment</p>
            </a>
          )}
        </div>
      )}

      {/* GA Portal CP4 — the Graphic Artist's saved output in full. */}
      {hasGaDetails && <GaDetailsBlock details={details} />}

      {/* SM Rework CP3 — the Screen Maker's output (screens + notes). */}
      {hasSmDetails && <SmDetailsBlock details={details} />}

      {/* Cutter Rework CP3 — the Cutter's output (fabric entries + notes). */}
      {hasCuttingDetails && <CutterDetailsBlock details={details} />}

      {/* Owner decision (2026-07-28) — the materials Material Prep picked
          for this stage (sample or mass), + resulting Purchase Request. */}
      {hasMaterialPrepDetails && <MaterialPrepDetailsBlock details={details} />}

      {/* Auto-computed waste / material usage for this stage (read-only). */}
      <WasteBlock waste={waste} />

      {/* Artifacts — proof-of-work uploads for this stage (Phase 3). Lets the
          reviewer see what they're approving. */}
      {Array.isArray(uploads) && uploads.length > 0 ? (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
            Attachments ({uploads.length})
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
            {uploads.map((u) => (
              <a
                key={u.id}
                href={u.url}
                target="_blank"
                rel="noreferrer"
                title={u.label || u.original_name || "attachment"}
                className="block overflow-hidden rounded-lg border border-gray-200"
              >
                {u.is_image ? (
                  <img
                    src={u.url}
                    alt={u.original_name || "attachment"}
                    className="h-16 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-full items-center justify-center bg-gray-50 text-gray-400">
                    <i className="fa-solid fa-file-pdf text-xl" />
                  </div>
                )}
                <p className="truncate px-1 py-0.5 text-[10px] text-gray-500">
                  {u.label || u.original_name || u.source}
                </p>
              </a>
            ))}
          </div>
        </div>
      ) : paymentGate && payment ? null : hasGaDetails || hasSmDetails || hasCuttingDetails || hasMaterialPrepDetails ? null : (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-xs italic text-gray-400">
            No artifact uploaded for this stage yet.
          </p>
        </div>
      )}

      {/* CP2 — Hub → role instruction thread + composer. Rendered only on
          cards whose stage has an entry in INSTRUCTION_AUDIENCES (GA +
          Screen Making). ORDER-level and role-directed — a different
          channel from the per-stage notes thread below. */}
      {instructionAudience && Array.isArray(roleNotes) && (
        <InstructionsBlock
          audience={instructionAudience}
          entries={roleNotes}
          onPost={onPostInstruction}
          busy={instructionBusy}
        />
      )}

      {/* Notes thread — chronological. Legacy approve/reject/resubmit rows
          from before the notes-only change render with their old labels. */}
      {Array.isArray(history) && history.length > 0 && (
        <ul className="mt-3 space-y-2 border-t border-gray-100 pt-3">
          {history.map((r) => {
            const dm = DECISION_META[r.decision] || {};
            return (
              <li key={r.id} className="flex gap-2 text-sm">
                <i className={`fa-solid ${dm.icon} mt-0.5 ${dm.cls}`} />
                <div className="flex-1">
                  <span className="font-medium text-gray-700">{dm.label}</span>
                  <span className="text-gray-400">
                    {" "}
                    by {r.actor?.name || "—"} · {r.created_at}
                  </span>
                  {r.comment && (
                    <p className="text-gray-600">{r.comment}</p>
                  )}
                  {r.image_url && (
                    <a
                      href={r.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 underline"
                    >
                      View attached image
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Notes composer — replaces the old Approve/Reject actions. */}
      <NoteComposer stage={stage} onSubmit={onAddNote} busy={busy} />
    </div>
  );
};

const ReviewHub = ({ order }) => {
  const [data, setData] = useState({ history: {}, uploads: {}, payments: {}, stage_details: {}, waste: {}, role_notes: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [instructionBusy, setInstructionBusy] = useState(false);

  // Only stages that have actually started are worth reviewing — pending
  // stages have no output yet. Sorted by sequence (already is, defensively).
  const stages = useMemo(() => {
    const list = Array.isArray(order?.orderStages) ? order.orderStages : [];
    // Order by the human ordinal (1..N) so on-screen order matches the "#N"
    // badges — not the raw dependency tier, which reuses a number at the fork.
    const ord = (s) => stageOrdinal(s.stage) ?? s.sequence ?? 0;
    return [...list]
      .filter((s) => s.status && s.status !== "pending")
      .sort((a, b) => ord(a) - ord(b));
  }, [order]);

  const load = useCallback(async () => {
    if (!order?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await stageReviewApi.forOrder(order.id);
      setData({
        history: res.history || {},
        uploads: res.uploads || {},
        payments: res.payments || {},
        stage_details: res.stage_details || {},
        waste: res.waste || {},
        role_notes: res.role_notes || {},
      });
    } catch (e) {
      setError(
        e?.response?.data?.message || "Could not load review history."
      );
    } finally {
      setLoading(false);
    }
  }, [order?.id]);

  useEffect(() => {
    load();
  }, [load]);

  // Append a note. Returns true on success so the composer can clear.
  const addNote = async (stage, comment) => {
    setBusyId(stage.id);
    try {
      await stageReviewApi.note(stage.id, comment);
      await load();
      return true;
    } catch (e) {
      setError(e?.response?.data?.message || "Could not save the note.");
      return false;
    } finally {
      setBusyId(null);
    }
  };

  // CP2 — post a role-directed instruction (ORDER-level) and reload so the
  // hub thread and the target portal's payload stay in sync.
  const postInstruction = async (audienceRole, body) => {
    setInstructionBusy(true);
    try {
      await orderRoleNotesApi.post(order.id, audienceRole, body);
      await load();
      return true;
    } catch (e) {
      setError(
        e?.response?.data?.message || "Could not send the instruction."
      );
      return false;
    } finally {
      setInstructionBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Review Hub</h2>
        <p className="text-sm text-gray-500">
          Each stage keeps a running record — payment details on the gates,
          uploads, and staff notes. Type a note on any card to add to it.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-sm text-gray-500">Loading review history…</div>
      )}

      {!loading && stages.length === 0 && (
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
          No started stages yet — nothing to show.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {stages.map((stage) => {
          // SM Rework CP3 — instruction channel for this card (if any).
          const audience = INSTRUCTION_AUDIENCES[stage.stage];
          return (
            <StageCard
              key={stage.id}
              stage={stage}
              history={data.history?.[stage.id]}
              uploads={data.uploads?.[stage.id]}
              payment={data.payments?.[stage.id]}
              details={data.stage_details?.[stage.id]}
              waste={data.waste?.[stage.id]}
              onAddNote={addNote}
              busyId={busyId}
              roleNotes={
                audience ? data.role_notes?.[audience.role] || [] : undefined
              }
              instructionAudience={audience}
              onPostInstruction={postInstruction}
              instructionBusy={instructionBusy}
            />
          );
        })}
      </div>

    </div>
  );
};

export default ReviewHub;
