import React, { useEffect, useRef, useState } from "react";

/**
 * Phase 7-B Bundle 3 — Reusable photo-upload input with preview.
 *
 * Designed for warehouse-floor use: large tap target, opens the
 * device's rear camera directly on mobile via `capture="environment"`,
 * shows a thumbnail preview with a clear button, falls back to file
 * picker on desktop without any special handling.
 *
 * Reused in Bundle 4 by the Final Photos section.
 *
 * Props:
 *   value         - the File object (controlled). Set to null to clear.
 *   onChange(File|null)
 *   label         - input label (e.g., "Photo (optional)")
 *   required      - if true, shows the red asterisk
 *   disabled      - disable interaction (e.g., during submit)
 *   accept        - comma-separated MIME types (default: image/*)
 *   maxBytes      - reject files larger than this (default 8MB per backend)
 *   onError(msg)  - called when the user picks an invalid file
 */
const DEFAULT_MAX_BYTES = 8 * 1024 * 1024; // 8 MB matches StoreReject's photo.max

const PhotoUpload = ({
  value = null,
  onChange,
  label = "Photo",
  required = false,
  disabled = false,
  accept = "image/jpeg,image/png,image/webp",
  maxBytes = DEFAULT_MAX_BYTES,
  onError,
}) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Build a preview URL whenever value changes. Revoke the previous one
  // to avoid memory leaks (browser holds onto blob URLs until released).
  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const pickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxBytes) {
      onError?.(
        `Photo is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). ` +
          `Maximum is ${Math.round(maxBytes / 1024 / 1024)} MB.`,
      );
      // Reset so the user can pick a different file even if they pick the same one again.
      e.target.value = "";
      return;
    }

    onChange?.(file);
  };

  const clearFile = () => {
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {!value ? (
        <label
          className={`block border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${
            disabled
              ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
              : "border-gray-300 hover:border-primary hover:bg-primary/5"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            capture="environment"
            disabled={disabled}
            onChange={pickFile}
            className="sr-only"
          />
          <i className="fa-solid fa-camera text-2xl text-gray-400 block mb-1" />
          <p className="text-xs text-gray-600 font-medium">
            Tap to take photo
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            JPG, PNG, or WebP · max {Math.round(maxBytes / 1024 / 1024)} MB
          </p>
        </label>
      ) : (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="h-32 w-32 object-cover rounded-md border border-gray-200"
          />
          <button
            type="button"
            onClick={clearFile}
            disabled={disabled}
            className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-gray-300 rounded-full text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
            aria-label="Remove photo"
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
          <p className="text-[10px] text-gray-500 mt-1 max-w-[8rem] truncate">
            {value.name}
          </p>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
