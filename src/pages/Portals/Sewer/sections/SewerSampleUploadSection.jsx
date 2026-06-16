import React, { useState } from "react";
import { sewerPortalApi } from "../../../../api/sewerPortalApi";

const SAMPLE_STATUS_STYLES = {
  pending:      "bg-gray-100 text-gray-700",
  for_approval: "bg-amber-100 text-amber-700",
  approved:     "bg-emerald-100 text-emerald-700",
  rejected:     "bg-red-100 text-red-700",
};

const SewerSampleUploadSection = ({
  sampleUploads = [],
  orderId,
  orderStageId,
  onChanged,
}) => {
  const [photoFront, setPhotoFront] = useState(null);
  const [photoBack, setPhotoBack] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (markDone) => {
    if (!photoFront && !photoBack && !remarks) {
      setError("Mag-upload ng kahit isang larawan o magsulat ng remarks.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      await sewerPortalApi.createSampleUpload(
        {
          order_id: orderId,
          order_stage_id: orderStageId,
          remarks: remarks || undefined,
          sample_status: markDone ? "for_approval" : "pending",
        },
        photoFront,
        photoBack,
      );
      setPhotoFront(null);
      setPhotoBack(null);
      setRemarks("");
      onChanged?.();
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 422 && data?.errors) {
        const flat = {};
        Object.entries(data.errors).forEach(([k, v]) => {
          flat[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setFieldErrors(flat);
      } else {
        setError(data?.message || "Hindi na-save. Subukan ulit.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          <i className="fa-solid fa-cloud-arrow-up text-[11px]" />
        </span>
        Sample Output &amp; Upload
      </h2>

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
          <i className="fa-solid fa-triangle-exclamation mr-1" />
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[11px] text-gray-600 mb-1 block">
            Sample Photo (Front)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => setPhotoFront(e.target.files?.[0] ?? null)}
            disabled={submitting}
            className="w-full text-xs file:mr-2 file:rounded file:border-0 file:bg-gray-100 file:px-2 file:py-1 file:text-xs hover:file:bg-gray-200"
          />
          {fieldErrors.photo_front && (
            <p className="text-[10px] text-red-600 mt-0.5">{fieldErrors.photo_front}</p>
          )}
        </div>

        <div>
          <label className="text-[11px] text-gray-600 mb-1 block">
            Sample Photo (Back)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => setPhotoBack(e.target.files?.[0] ?? null)}
            disabled={submitting}
            className="w-full text-xs file:mr-2 file:rounded file:border-0 file:bg-gray-100 file:px-2 file:py-1 file:text-xs hover:file:bg-gray-200"
          />
          {fieldErrors.photo_back && (
            <p className="text-[10px] text-red-600 mt-0.5">{fieldErrors.photo_back}</p>
          )}
        </div>
      </div>

      <div className="mb-3">
        <label className="text-[11px] text-gray-600 mb-1 block">Remarks</label>
        <textarea
          rows={2}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Hal. Okay ang fitting at tahi."
          disabled={submitting}
          className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={submitting}
          className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 rounded font-medium hover:bg-gray-200 disabled:opacity-50"
        >
          {submitting ? "Sini-save…" : "Save Draft"}
        </button>
        <button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={submitting}
          className="flex-1 bg-primary text-white text-sm py-2 rounded font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? "Sini-save…" : (
            <>
              <i className="fa-solid fa-check mr-1" />
              Mark as Done
            </>
          )}
        </button>
      </div>

      {sampleUploads.length > 0 ? (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">
            Previous Uploads
          </p>
          <div className="flex flex-col gap-2">
            {sampleUploads.map((u) => (
              <div
                key={u.id}
                className="flex items-start gap-3 p-2 bg-gray-50 border border-gray-200 rounded"
              >
                <div className="flex gap-1">
                  {u.photo_front_url ? (
                    <a href={u.photo_front_url} target="_blank" rel="noreferrer">
                      <img
                        src={u.photo_front_url}
                        alt="front"
                        className="w-14 h-14 object-cover rounded border border-gray-200"
                      />
                    </a>
                  ) : (
                    <div className="w-14 h-14 rounded border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs">F</div>
                  )}
                  {u.photo_back_url ? (
                    <a href={u.photo_back_url} target="_blank" rel="noreferrer">
                      <img
                        src={u.photo_back_url}
                        alt="back"
                        className="w-14 h-14 object-cover rounded border border-gray-200"
                      />
                    </a>
                  ) : (
                    <div className="w-14 h-14 rounded border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs">B</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] capitalize px-2 py-0.5 rounded ${
                        SAMPLE_STATUS_STYLES[u.sample_status] || SAMPLE_STATUS_STYLES.pending
                      }`}
                    >
                      {String(u.sample_status).replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {u.created_at ? new Date(u.created_at).toLocaleString() : ""}
                    </span>
                  </div>
                  {u.remarks && (
                    <p className="text-[11px] text-gray-600 italic mt-1">"{u.remarks}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-gray-400 italic">Wala pang uploaded na sample.</p>
      )}
    </section>
  );
};

export default SewerSampleUploadSection;
