import React, { useMemo, useState } from "react";

/**
 * Issue 8 (Sec. 5) — Design review panel.
 *
 * Two modes from one component:
 *   - editable=false → CSR/Superadmin read-only view on the quotation page,
 *     with an optional "Send to GA" action (onRequestReview).
 *   - editable=true  → GA/Superadmin review surface: set the verdict, the
 *     verified colour count, and a note to the CSR.
 *
 * Soft-block: the panel never prevents the quotation from proceeding; it only
 * reflects/sets the design-review state.
 */

const STATUS_STYLES = {
  "Pending GA": "bg-yellow-100 text-yellow-700",
  "GA Approved": "bg-green-100 text-green-700",
  "Needs New File": "bg-red-100 text-red-700",
};

const resolveImageUrl = (raw) => {
  const path = String(raw || "").trim();
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "";
  let origin = "";
  try {
    origin = new URL(apiUrl).origin;
  } catch {
    origin = "";
  }
  if (path.startsWith("/storage/")) return origin ? `${origin}${path}` : path;
  if (path.startsWith("storage/")) return origin ? `${origin}/${path}` : `/${path}`;
  const cleaned = path.replace(/^\/+/, "");
  return origin ? `${origin}/storage/${cleaned}` : `/storage/${cleaned}`;
};

const partImage = (part) =>
  resolveImageUrl(part?.image_link || part?.image_url || part?.image_path || part?.image || "");

const DesignReviewPanel = ({
  review = {},
  printParts = [],
  editable = false,
  allowedVerdicts = ["GA Approved", "Needs New File"],
  onSave,
  onRequestReview,
}) => {
  const status = review.design_review_status || null;
  // One verified colour count per placement (front/back/...). When the
  // quotation has no placements we fall back to a single pooled count.
  const initialCounts = useMemo(
    () =>
      (printParts || []).map((p) =>
        p?.num_colors ?? p?.color_count ?? p?.colorCount ?? p?.unit_count ?? "",
      ),
    [printParts],
  );
  const [counts, setCounts] = useState(initialCounts);
  const [colorCount, setColorCount] = useState(review.design_color_count ?? "");
  const [note, setNote] = useState(review.design_review_note ?? "");
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const thumbs = useMemo(
    () => (printParts || []).map(partImage).filter(Boolean),
    [printParts],
  );

  const statusBadge = (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        STATUS_STYLES[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status || "Not submitted"}
    </span>
  );

  const handleVerdict = async (verdict) => {
    if (!onSave) return;
    setSaving(true);
    try {
      const hasPlacements = Array.isArray(printParts) && printParts.length > 0;
      const perSide = hasPlacements
        ? printParts.map((p, i) => ({
            index: i,
            num_colors:
              counts[i] === "" || counts[i] == null ? 0 : Number(counts[i]),
          }))
        : null;
      const pooled = hasPlacements
        ? perSide.reduce((sum, e) => sum + (Number(e.num_colors) || 0), 0)
        : colorCount === ""
          ? null
          : Number(colorCount);
      await onSave({
        design_review_status: verdict,
        design_color_count: pooled,
        ...(perSide ? { design_color_counts: perSide } : {}),
        design_review_note: note?.trim() || null,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRequest = async () => {
    if (!onRequestReview) return;
    setRequesting(true);
    try {
      await onRequestReview();
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <i className="fas fa-pen-ruler text-primary" aria-hidden="true"></i>
        <h3 className="text-sm font-semibold text-primary">Graphic Artist review</h3>
        <span className="ml-auto">{statusBadge}</span>
      </div>

      {/* Design thumbnails */}
      {thumbs.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-3">
          {thumbs.map((src, i) => (
            <a key={i} href={src} target="_blank" rel="noreferrer">
              <img
                src={src}
                alt={`Design ${i + 1}`}
                className="h-20 w-20 rounded border border-gray-200 object-cover bg-white"
              />
            </a>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 mb-3">No design uploaded yet.</p>
      )}

      {editable ? (
        <>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Verified colour count per placement — feeds pricing
          </label>
          {Array.isArray(printParts) && printParts.length > 0 ? (
            <div className="space-y-2">
              {printParts.map((p, i) => (
                <div
                  key={p.id ?? p.part_id ?? i}
                  className="flex items-center gap-2"
                >
                  <span className="w-28 truncate text-xs text-gray-700">
                    {p.part || p.name || `Placement ${i + 1}`}
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={counts[i] ?? ""}
                    onChange={(e) =>
                      setCounts((prev) => {
                        const next = [...prev];
                        next[i] = e.target.value;
                        return next;
                      })
                    }
                    className="w-24 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-[11px] text-gray-400">colors</span>
                </div>
              ))}
              <p className="text-[11px] text-gray-400">
                Each side is priced on its own — your counts replace the
                CSR’s.
              </p>
            </div>
          ) : (
            <input
              type="number"
              min="0"
              max="99"
              value={colorCount}
              onChange={(e) => setColorCount(e.target.value)}
              className="w-28 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
            />
          )}

          <label className="block text-xs font-medium text-gray-600 mb-1 mt-3">
            Note to CSR
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder='e.g. "Clean file — 3 spot colors" or "back logo blurry"'
            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
          />

          <div className="flex flex-wrap gap-2 mt-4">
            {allowedVerdicts.includes("GA Approved") && (
              <button
                type="button"
                disabled={saving}
                onClick={() => handleVerdict("GA Approved")}
                className="px-3 py-1.5 text-xs rounded-lg border border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-50"
              >
                <i className="fas fa-check mr-1.5" aria-hidden="true"></i>
                Approve
              </button>
            )}
            {allowedVerdicts.includes("Needs New File") && (
              <button
                type="button"
                disabled={saving}
                onClick={() => handleVerdict("Needs New File")}
                className="px-3 py-1.5 text-xs rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <i className="fas fa-rotate mr-1.5" aria-hidden="true"></i>
                Needs new file
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-1.5 text-xs text-gray-600">
          {review.design_color_count != null && (
            <p>
              <span className="font-medium text-gray-700">Color count:</span>{" "}
              {review.design_color_count}
            </p>
          )}
          {review.design_review_note && (
            <p>
              <span className="font-medium text-gray-700">GA note:</span>{" "}
              {review.design_review_note}
            </p>
          )}
          {review.design_reviewer && (
            <p className="text-gray-400">
              Reviewed by {review.design_reviewer}
              {review.design_reviewed_at
                ? ` · ${new Date(review.design_reviewed_at).toLocaleDateString()}`
                : ""}
            </p>
          )}

          {onRequestReview && (
            <button
              type="button"
              disabled={requesting}
              onClick={handleRequest}
              className="mt-2 px-3 py-1.5 text-xs rounded-lg border border-primary/40 text-primary hover:bg-primary/5 disabled:opacity-50"
            >
              <i className="fas fa-paper-plane mr-1.5" aria-hidden="true"></i>
              {status === "Needs New File" ? "Re-send to GA" : "Send to GA"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DesignReviewPanel;
