import React, { useState } from "react";
import { qaPackerPortalApi } from "../../../../api/qaPackerPortalApi";
import PhotoUpload from "../../../../components/portals/PhotoUpload";

/**
 * Phase 7-B Bundle 4a — Final photos section.
 *
 * Three required photo slots (per the spec doc):
 *   - completed_product : the finished garments
 *   - packed_boxes      : the boxes ready to ship
 *   - shipping_photo    : last shot before pickup / handover
 *
 * Each slot uploads on its own to the backend immediately (separate
 * `final-photos` endpoint per slot). The stored paths are kept in
 * client state here AND lifted up via `onPhotosChanged` so the parent
 * page can hand them to the SUBMIT call.
 *
 * Why upload-on-pick rather than upload-on-submit:
 *   - 3 large image uploads in one submit click = slow + error-prone
 *   - User gets immediate feedback that the photo was accepted
 *   - If submit fails for some other reason, the photos are already
 *     stored and the user doesn't have to re-take them on retry
 *
 * Props:
 *   orderId
 *   orderStageId
 *   finalPhotos     - parent-held map of {kind: path}, used to hydrate on mount
 *   onPhotosChanged(map) - called with the updated {kind: path} map
 *   sectionNumber   - usually 7
 */
const SLOTS = [
  {
    kind: "completed_product",
    label: "Completed Product",
    hint: "Picture of the finished garments laid out.",
  },
  {
    kind: "packed_boxes",
    label: "Packed Boxes",
    hint: "All boxes ready for pickup.",
  },
  {
    kind: "shipping_photo",
    label: "Shipping Photo",
    hint: "Final shot before handoff (with QR labels visible).",
  },
];

const FinalPhotosSection = ({
  orderId,
  orderStageId,
  finalPhotos = {},
  onPhotosChanged,
  sectionNumber = 7,
}) => {
  // Local state mirrors finalPhotos plus pending File objects
  // (which aren't lifted to parent — only saved paths are).
  const [pending, setPending] = useState({}); // { kind: File } during upload
  const [uploading, setUploading] = useState({}); // { kind: bool }
  const [errors, setErrors] = useState({}); // { kind: msg }
  const [previews, setPreviews] = useState({}); // { kind: blobUrl } for newly picked
  const [removing, setRemoving] = useState({}); // { kind: bool }

  const handlePick = async (kind, file) => {
    setPending((p) => ({ ...p, [kind]: file }));
    setErrors((e) => ({ ...e, [kind]: undefined }));

    if (!file) {
      // Clearing the photo locally — also clear the parent's path entry.
      setPreviews((p) => {
        const next = { ...p };
        if (next[kind]) URL.revokeObjectURL(next[kind]);
        delete next[kind];
        return next;
      });
      setRemoving((r) => ({ ...r, [kind]: true }));
      try {
        const nextPhotos = { ...finalPhotos };
        delete nextPhotos[kind];
        onPhotosChanged?.(nextPhotos);
      } finally {
        setRemoving((r) => ({ ...r, [kind]: false }));
        setPending((p) => {
          const n = { ...p };
          delete n[kind];
          return n;
        });
      }
      return;
    }

    // Preview the picked file immediately while we upload.
    const blob = URL.createObjectURL(file);
    setPreviews((p) => {
      if (p[kind]) URL.revokeObjectURL(p[kind]);
      return { ...p, [kind]: blob };
    });

    setUploading((u) => ({ ...u, [kind]: true }));
    try {
      const result = await qaPackerPortalApi.uploadFinalPhoto(
        { order_id: orderId, order_stage_id: orderStageId, kind },
        file,
      );
      const path = result.data.path;
      const nextPhotos = { ...finalPhotos, [kind]: path };
      onPhotosChanged?.(nextPhotos);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Hindi na-upload. Subukan ulit o i-check ang internet.";
      setErrors((e) => ({ ...e, [kind]: msg }));
      // Clear the preview since the upload didn't stick.
      setPreviews((p) => {
        const next = { ...p };
        if (next[kind]) URL.revokeObjectURL(next[kind]);
        delete next[kind];
        return next;
      });
      setPending((p) => {
        const n = { ...p };
        delete n[kind];
        return n;
      });
    } finally {
      setUploading((u) => ({ ...u, [kind]: false }));
    }
  };

  const uploadedCount = SLOTS.filter((s) => finalPhotos[s.kind]).length;

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center"><i className="fa-solid fa-camera text-[11px]" /></span>
          Final Photos
        </h2>
        <span
          className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
            uploadedCount === SLOTS.length
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-gray-50 text-gray-600 border border-gray-200"
          }`}
        >
          {uploadedCount} / {SLOTS.length} uploaded
        </span>
      </div>

      <p className="text-[11px] text-gray-500 mb-3">
        Mag-upload ng tatlong photos bago i-submit. Auto-save kapag nag-pick ka
        ng file.
      </p>

      <div className="grid sm:grid-cols-3 gap-3">
        {SLOTS.map((slot) => {
          const isUploaded = !!finalPhotos[slot.kind];
          const isUploading = !!uploading[slot.kind];
          const previewUrl = previews[slot.kind];
          const savedPath = finalPhotos[slot.kind];
          const error = errors[slot.kind];

          return (
            <div key={slot.kind} className="flex flex-col">
              <p className="text-xs font-medium text-gray-800 mb-0.5">
                {slot.label}
                {isUploaded && (
                  <i className="fa-solid fa-circle-check text-emerald-500 ml-1.5 text-[10px]" />
                )}
              </p>
              <p className="text-[10px] text-gray-500 mb-2">{slot.hint}</p>

              {/* If we have a saved path, show a small preview tile.
                  Otherwise show the PhotoUpload picker. */}
              {isUploaded && !pending[slot.kind] ? (
                <div className="relative inline-block">
                  <img
                    src={previewUrl || savedPath}
                    alt={slot.label}
                    className="h-28 w-full object-cover rounded-md border border-emerald-200"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handlePick(slot.kind, null)}
                    disabled={removing[slot.kind] || isUploading}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-gray-300 rounded-full text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 disabled:opacity-50 flex items-center justify-center shadow-sm"
                    aria-label="Remove photo"
                  >
                    <i className="fa-solid fa-xmark text-xs" />
                  </button>
                </div>
              ) : (
                <PhotoUpload
                  value={pending[slot.kind] || null}
                  onChange={(file) => handlePick(slot.kind, file)}
                  label=""
                  disabled={isUploading}
                  onError={(msg) =>
                    setErrors((e) => ({ ...e, [slot.kind]: msg }))
                  }
                />
              )}

              {isUploading && (
                <p className="text-[10px] text-gray-500 mt-1 inline-flex items-center gap-1">
                  <i className="fa-solid fa-spinner fa-spin" />
                  Uploading…
                </p>
              )}

              {error && (
                <p className="text-[10px] text-red-600 mt-1">
                  <i className="fa-solid fa-triangle-exclamation mr-1" />
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FinalPhotosSection;
