import React from "react";

/**
 * Change 14 — read-only "Source / Reference Files".
 *
 * Surfaces everything uploaded for the order EARLIER in the flow (quotation
 * references, per-placement artwork from print_parts_json, and generic
 * stage_uploads) so the artist can pull the originals to work from.
 *
 * This is deliberately separate from the versioned design-file vault
 * (DesignFilesSection) — these files are view / download only, never edited
 * or deleted here.
 *
 * Data comes from context.source_files; each row is:
 *   { source, label, original_name, file_type, is_link, url,
 *     uploaded_by, size_bytes, created_at }
 */

const SOURCE_TAG = {
  quotation:   { label: "Quotation", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  print_part:  { label: "Artwork", cls: "bg-teal-50 text-teal-700 border-teal-200" },
  stage_upload:{ label: "Attachment", cls: "bg-gray-100 text-gray-600 border-gray-200" },
};

const humanSize = (bytes) => {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const SourceTag = ({ source }) => {
  const meta = SOURCE_TAG[source] || SOURCE_TAG.stage_upload;
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${meta.cls}`}>
      {meta.label}
    </span>
  );
};

const Row = ({ file }) => {
  const isLink = file.is_link;
  // For links the basename is often meaningless (e.g. a Canva ".../edit" URL),
  // so show the human label as the title; for stored files show the filename.
  const title = isLink
    ? file.label || file.original_name || "Reference link"
    : file.original_name || file.label || "Reference file";
  const meta = [
    isLink ? null : file.label, // label already shown as the title for links
    file.file_type ? file.file_type.toUpperCase() : null,
    humanSize(file.size_bytes),
    formatDate(file.created_at),
  ].filter(Boolean);

  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 first:border-t-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
          <i className={`fa-solid ${isLink ? "fa-link" : "fa-file"}`} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-semibold text-gray-900 truncate">{title}</p>
            <SourceTag source={file.source} />
          </div>
          <p className="text-[10px] text-gray-500 truncate">{meta.join(" · ")}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {file.url ? (
          file.is_link ? (
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
              title="Open link"
            >
              <i className="fa-solid fa-arrow-up-right-from-square" />
              Open link
            </a>
          ) : (
            <>
              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-primary hover:underline"
                title="Preview"
              >
                <i className="fa-solid fa-eye" />
              </a>
              <a
                href={file.url}
                download={file.original_name || true}
                className="text-[11px] text-primary hover:underline"
                title="Download"
              >
                <i className="fa-solid fa-download" />
              </a>
            </>
          )
        ) : (
          <span className="text-[10px] text-gray-400">No file</span>
        )}
      </div>
    </div>
  );
};

const SourceReferenceFilesSection = ({ files = [] }) => {
  const count = files.length;

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <i className="fa-solid fa-folder-open text-gray-400" />
        Source / Reference Files
        {count > 0 && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {count}
          </span>
        )}
      </h2>
      <p className="text-[11px] text-gray-500 mb-3">
        Mga file na na-upload nang mas maaga sa order — quotation references,
        print artwork, at iba pang attachments. View / download lang (read-only).
      </p>

      {count === 0 ? (
        <div className="rounded-md border border-dashed border-gray-200 px-4 py-6 text-center">
          <i className="fa-solid fa-folder-open text-gray-300 text-xl mb-2" />
          <p className="text-xs text-gray-500">
            Walang naka-attach na source o reference file para sa order na ito.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-gray-100">
          {files.map((f, i) => (
            <Row key={`${f.source}-${i}`} file={f} />
          ))}
        </div>
      )}
    </section>
  );
};

export default SourceReferenceFilesSection;
