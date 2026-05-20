import React, { useState } from "react";
import { graphicArtistPortalApi } from "../../../../api/graphicArtistPortalApi";

/**
 * Phase 5-H — Sample Uploads.
 *
 * Front + back photos of the finished sample once the graphic artwork
 * task is complete. Same shape as Cutter / Sewer sample sections.
 */
const SampleUploadsSection = ({ samples = [], orderId, orderStageId, onChanged }) => {
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState("for_approval");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!front && !back) {
      setError("Pumili ng kahit isang larawan.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await graphicArtistPortalApi.uploadSample({
        order_id: orderId,
        order_stage_id: orderStageId,
        photo_front: front,
        photo_back: back,
        remarks: remarks || undefined,
        sample_status: status,
      });
      setFront(null);
      setBack(null);
      setRemarks("");
      ["sample-front-input", "sample-back-input"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      onChanged?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Hindi na-upload ang sample.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("I-delete ang sample upload na ito?")) return;
    try {
      await graphicArtistPortalApi.deleteSample(id);
      onChanged?.();
    } catch (err) {
      alert(err?.response?.data?.message || "Hindi na-delete.");
    }
  };

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          8
        </span>
        Sample Uploads
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        I-upload ang larawan ng tapos na sample (front + back). Kailangan
        i-mark for_approval para makita ng manager para sa approval.
      </p>

      {/* Existing uploads */}
      {samples.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {samples.map((s) => (
            <div key={s.id} className="border border-gray-200 rounded p-3 bg-gray-50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-2">
                  {s.photo_front_url && (
                    <a href={s.photo_front_url} target="_blank" rel="noreferrer">
                      <img src={s.photo_front_url} alt="front" className="w-20 h-20 object-cover rounded border border-gray-200" />
                    </a>
                  )}
                  {s.photo_back_url && (
                    <a href={s.photo_back_url} target="_blank" rel="noreferrer">
                      <img src={s.photo_back_url} alt="back" className="w-20 h-20 object-cover rounded border border-gray-200" />
                    </a>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">
                    Status
                  </p>
                  <p className="text-xs font-semibold text-gray-900 capitalize">
                    {s.sample_status?.replace("_", " ") || "—"}
                  </p>
                  {s.remarks && (
                    <p className="text-[11px] text-gray-600 mt-1 whitespace-pre-wrap">
                      {s.remarks}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">
                    {s.created_at || ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  className="text-[10px] text-red-600 hover:underline shrink-0"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload form */}
      <div className="bg-gray-50 border border-gray-200 rounded p-3">
        <div className="grid sm:grid-cols-2 gap-3 mb-2">
          <div>
            <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">
              Front Photo
            </label>
            <input
              id="sample-front-input"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => setFront(e.target.files?.[0] || null)}
              className="w-full text-[11px]"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">
              Back Photo
            </label>
            <input
              id="sample-back-input"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => setBack(e.target.files?.[0] || null)}
              className="w-full text-[11px]"
            />
          </div>
        </div>
        <textarea
          rows={2}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Remarks (optional)"
          className="w-full text-[11px] border border-gray-300 rounded px-2 py-1 mb-2"
        />
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-[11px] border border-gray-300 rounded px-2 py-1"
          >
            <option value="pending">Pending</option>
            <option value="for_approval">For Approval</option>
          </select>
          <button
            type="button"
            onClick={handleUpload}
            disabled={saving}
            className="bg-primary text-white text-xs px-3 py-1.5 rounded hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Uploading…" : "Upload Sample"}
          </button>
        </div>
        {error && <p className="text-[11px] text-red-600 mt-2">{error}</p>}
      </div>
    </section>
  );
};

export default SampleUploadsSection;
