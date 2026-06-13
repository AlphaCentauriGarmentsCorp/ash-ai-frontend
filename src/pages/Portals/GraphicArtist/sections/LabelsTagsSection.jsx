import React, { useState } from "react";
import { graphicArtistPortalApi } from "../../../../api/graphicArtistPortalApi";
import useConfirm from "../../../../hooks/useConfirm";

/**
 * Phase 5-H — Labels & Tags.
 *
 * Three label kinds in three cards: main_label, size_label, hangtag.
 * Each card supports file upload + metadata fields + delete.
 *
 * Backed by /portal/graphic-artist/label-assets (PUT upsert, DELETE).
 */

const KINDS = [
  { key: "main_label", label: "Main Label / Neck Label", icon: "fa-tag" },
  { key: "size_label", label: "Size Label", icon: "fa-ruler-vertical" },
  { key: "hangtag", label: "Hangtag / Etiketa", icon: "fa-receipt" },
];

const PROCESSES = [
  { value: "", label: "—" },
  { value: "silkscreen", label: "Silkscreen" },
  { value: "digital", label: "Digital" },
  { value: "embroidery", label: "Embroidery" },
  { value: "dtf", label: "DTF" },
  { value: "other", label: "Other" },
];

const LabelsTagsSection = ({ labelAssets = {}, orderId, orderStageId, onChanged }) => {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          6
        </span>
        Labels & Tags
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Client-provided design para sa main label, size label, at hangtag.
      </p>

      <div className="grid lg:grid-cols-3 gap-3">
        {KINDS.map(({ key, label, icon }) => (
          <LabelCard
            key={key}
            kind={key}
            label={label}
            icon={icon}
            asset={labelAssets[key] || null}
            orderId={orderId}
            orderStageId={orderStageId}
            onChanged={onChanged}
          />
        ))}
      </div>
    </section>
  );
};

const LabelCard = ({ kind, label, icon, asset, orderId, orderStageId, onChanged }) => {
  const { confirm, alert, dialog } = useConfirm();
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    width_in: asset?.width_in ?? "",
    height_in: asset?.height_in ?? "",
    printing_process: asset?.printing_process ?? "",
    color_count: asset?.color_count ?? "",
    background_color: asset?.background_color ?? "",
    material: asset?.material ?? "",
    notes: asset?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        order_id: orderId,
        order_stage_id: orderStageId,
        kind,
      };
      if (file) payload.file = file;
      if (form.width_in !== "") payload.width_in = Number(form.width_in);
      if (form.height_in !== "") payload.height_in = Number(form.height_in);
      if (form.printing_process !== "") payload.printing_process = form.printing_process;
      if (form.color_count !== "") payload.color_count = Number(form.color_count);
      if (form.background_color !== "") payload.background_color = form.background_color;
      if (form.material !== "") payload.material = form.material;
      if (form.notes !== "") payload.notes = form.notes;

      await graphicArtistPortalApi.upsertLabelAsset(payload);
      setFile(null);
      const input = document.getElementById(`label-file-${kind}`);
      if (input) input.value = "";
      onChanged?.();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Hindi na-save ang label asset.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!asset) return;
    const ok = await confirm({
      title: "I-clear?",
      message: `I-clear ang ${label}? Permanent ito.`,
      confirmLabel: "I-clear",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await graphicArtistPortalApi.deleteLabelAsset(asset.id, orderStageId);
      onChanged?.();
    } catch (err) {
      await alert({
        title: "Hindi na-delete",
        message: err?.response?.data?.message || "Pakisubukan muli.",
        tone: "danger",
      });
    }
  };

  return (
    <div className="border border-gray-200 rounded p-3 bg-gray-50">
      {dialog}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-900 inline-flex items-center gap-1.5">
          <i className={`fa-solid ${icon} text-gray-500`} />
          {label}
        </h3>
        {asset && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-[10px] text-red-600 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Existing file preview */}
      {asset?.file_url ? (
        <div className="bg-white border border-gray-200 rounded mb-2 p-2 flex items-center justify-between gap-2">
          <a
            href={asset.file_url}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-primary hover:underline truncate"
          >
            <i className="fa-solid fa-paperclip mr-1" />
            {asset.original_name || "View file"}
          </a>
          <span className="text-[10px] text-gray-500 shrink-0">
            {asset.mime_type}
          </span>
        </div>
      ) : (
        <p className="text-[10px] text-gray-400 italic mb-2">Walang naka-upload na file.</p>
      )}

      {/* New file picker */}
      <input
        id={`label-file-${kind}`}
        type="file"
        accept=".png,.jpg,.jpeg,.pdf,.psd,.svg,.webp,.ai"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full text-[11px] mb-2"
      />

      {/* Metadata fields */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <Field label="Width (in)">
          <input
            type="number" step="0.1" min="0"
            value={form.width_in}
            onChange={(e) => setField("width_in", e.target.value)}
            className="w-full text-[11px] border border-gray-300 rounded px-2 py-1"
          />
        </Field>
        <Field label="Height (in)">
          <input
            type="number" step="0.1" min="0"
            value={form.height_in}
            onChange={(e) => setField("height_in", e.target.value)}
            className="w-full text-[11px] border border-gray-300 rounded px-2 py-1"
          />
        </Field>
        <Field label="Process">
          <select
            value={form.printing_process}
            onChange={(e) => setField("printing_process", e.target.value)}
            className="w-full text-[11px] border border-gray-300 rounded px-1 py-1"
          >
            {PROCESSES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </Field>
        <Field label="# Colors">
          <input
            type="number" min="0" max="64"
            value={form.color_count}
            onChange={(e) => setField("color_count", e.target.value)}
            className="w-full text-[11px] border border-gray-300 rounded px-2 py-1"
          />
        </Field>
        <Field label="Background">
          <input
            type="text" maxLength={32}
            value={form.background_color}
            onChange={(e) => setField("background_color", e.target.value)}
            className="w-full text-[11px] border border-gray-300 rounded px-2 py-1"
          />
        </Field>
        <Field label="Material">
          <input
            type="text" maxLength={64}
            value={form.material}
            onChange={(e) => setField("material", e.target.value)}
            className="w-full text-[11px] border border-gray-300 rounded px-2 py-1"
          />
        </Field>
      </div>
      <textarea
        rows={2}
        value={form.notes}
        onChange={(e) => setField("notes", e.target.value)}
        placeholder="Notes (optional)"
        className="w-full text-[11px] border border-gray-300 rounded px-2 py-1 mb-2"
      />
      {error && (
        <p className="text-[11px] text-red-600 mb-2">{error}</p>
      )}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-primary text-white text-xs py-1.5 rounded hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving…" : asset ? "Update" : "Save"}
      </button>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-0.5">
      {label}
    </label>
    {children}
  </div>
);

export default LabelsTagsSection;