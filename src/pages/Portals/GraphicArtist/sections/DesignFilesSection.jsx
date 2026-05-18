import React, { useMemo, useState } from "react";
import { graphicArtistPortalApi } from "../../../../api/graphicArtistPortalApi";

/**
 * Phase 5-H — Versioned design file vault.
 *
 * Shows latest file per kind by default with a "Show older versions"
 * disclosure per kind. Upload form supports a kind picker + file input.
 * Delete is hard — physical file removed, row removed.
 */

const KIND_LABELS = {
  front_design: "Front Design",
  back_design: "Back Design",
  front_mockup: "Front Mockup",
  back_mockup: "Back Mockup",
  color_separation: "Color Separation",
  other: "Other",
};

const KIND_ORDER = [
  "front_design",
  "back_design",
  "front_mockup",
  "back_mockup",
  "color_separation",
  "other",
];

const ALLOWED_EXTS = "png,jpg,jpeg,pdf,psd,svg,webp,ai";

const humanSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const DesignFilesSection = ({ files = [], orderId, orderStageId, onChanged }) => {
  const [uploadKind, setUploadKind] = useState("front_design");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [openHistory, setOpenHistory] = useState({});

  // Group files by kind
  const grouped = useMemo(() => {
    const byKind = {};
    for (const k of KIND_ORDER) byKind[k] = [];
    for (const f of files) {
      const k = byKind[f.kind] ? f.kind : "other";
      byKind[k].push(f);
    }
    // Sort newest first within each kind
    for (const k of Object.keys(byKind)) {
      byKind[k].sort((a, b) => b.version - a.version);
    }
    return byKind;
  }, [files]);

  const handleUpload = async () => {
    if (!uploadFile) {
      setError("Pumili muna ng file.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await graphicArtistPortalApi.uploadDesignFile({
        order_id: orderId,
        order_stage_id: orderStageId,
        kind: uploadKind,
        file: uploadFile,
        notes: uploadNotes || undefined,
      });
      setUploadFile(null);
      setUploadNotes("");
      // Clear the file input by re-keying it
      const input = document.getElementById("ga-design-file-input");
      if (input) input.value = "";
      onChanged?.();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.errors?.file?.[0] ||
        "Hindi na-upload ang file.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file) => {
    if (!confirm(`I-delete ang ${KIND_LABELS[file.kind]} v${file.version}? Permanent ito.`)) return;
    try {
      await graphicArtistPortalApi.deleteDesignFile(file.id, orderStageId);
      onChanged?.();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
        "Hindi na-delete ang file.",
      );
    }
  };

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          2
        </span>
        Design Files
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Versioned uploads. Bawat upload ay magdadagdag ng v2, v3, etc.
        Tinatanggap ang AI, PSD, PDF, PNG, JPG, SVG, at WebP files.
      </p>

      {/* Upload form */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
        <div className="grid gap-3 sm:grid-cols-[160px_1fr_140px]">
          <div>
            <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">
              File Kind
            </label>
            <select
              value={uploadKind}
              onChange={(e) => setUploadKind(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
            >
              {KIND_ORDER.map((k) => (
                <option key={k} value={k}>{KIND_LABELS[k]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">
              File (max 25 MB)
            </label>
            <input
              id="ga-design-file-input"
              type="file"
              accept={ALLOWED_EXTS.split(",").map((x) => `.${x}`).join(",")}
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full text-xs"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !uploadFile}
              className="w-full bg-primary text-white text-xs py-1.5 rounded hover:opacity-90 disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </div>
        <div className="mt-2">
          <input
            type="text"
            value={uploadNotes}
            onChange={(e) => setUploadNotes(e.target.value)}
            placeholder="Optional notes (e.g. 'Updated logo size per CSR')"
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
          />
        </div>
        {error && (
          <p className="text-[11px] text-red-600 mt-2">{error}</p>
        )}
      </div>

      {/* Grouped file list */}
      <div className="flex flex-col gap-3">
        {KIND_ORDER.map((kind) => {
          const list = grouped[kind] || [];
          if (list.length === 0) {
            return (
              <div key={kind} className="border border-dashed border-gray-200 rounded p-2 text-[11px] text-gray-400 italic">
                {KIND_LABELS[kind]} — wala pang upload
              </div>
            );
          }
          const latest = list[0];
          const older = list.slice(1);
          const isOpen = !!openHistory[kind];

          return (
            <div key={kind} className="border border-gray-200 rounded">
              <div className="bg-gray-50 px-3 py-2 flex items-center justify-between border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-700">{KIND_LABELS[kind]}</p>
                {older.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setOpenHistory((m) => ({ ...m, [kind]: !isOpen }))}
                    className="text-[11px] text-primary hover:underline"
                  >
                    {isOpen ? "Itago" : `Ipakita ang ${older.length} mas lumang version${older.length === 1 ? "" : "s"}`}
                  </button>
                )}
              </div>
              <FileRow file={latest} onDelete={handleDelete} isLatest />
              {isOpen && older.map((f) => (
                <FileRow key={f.id} file={f} onDelete={handleDelete} />
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
};

const FileRow = ({ file, onDelete, isLatest = false }) => (
  <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 first:border-t-0">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-500">
        <i className="fa-solid fa-file" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-gray-900 truncate">
            {file.original_name}
          </p>
          <span className={
            "text-[10px] px-1.5 py-0.5 rounded " +
            (isLatest
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500")
          }>
            v{file.version}{isLatest ? " (Latest)" : ""}
          </span>
        </div>
        <p className="text-[10px] text-gray-500">
          {file.mime_type} · {humanSize(file.size_bytes)}
          {file.notes ? ` · ${file.notes}` : ""}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      {file.file_url && (
        <>
          <a
            href={file.file_url}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-primary hover:underline"
            title="Preview"
          >
            <i className="fa-solid fa-eye" />
          </a>
          <a
            href={file.file_url}
            download={file.original_name}
            className="text-[11px] text-primary hover:underline"
            title="Download"
          >
            <i className="fa-solid fa-download" />
          </a>
        </>
      )}
      <button
        type="button"
        onClick={() => onDelete(file)}
        className="text-[11px] text-red-600 hover:underline"
        title="Delete"
      >
        <i className="fa-solid fa-trash" />
      </button>
    </div>
  </div>
);

export default DesignFilesSection;