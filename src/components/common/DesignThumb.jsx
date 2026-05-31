import React, { useState } from "react";

/**
 * Design thumbnail with graceful link handling (Issue 8 / Issue 11).
 *
 * - Stored image files and direct image URLs render as a thumbnail that opens
 *   full-size in a new tab on click.
 * - Non-image links (e.g. a Canva / Google Drive / Figma share or view link —
 *   a web page, not an image) make the <img> fail to load; we fall back to a
 *   clickable chip that opens the link in a new tab.
 * - No URL → a neutral, non-clickable dashed placeholder.
 *
 * `size` is a Tailwind height/width pair (e.g. "h-10 w-10").
 */
const DesignThumb = ({ url, alt = "Design", size = "h-10 w-10" }) => {
  const [errored, setErrored] = useState(false);

  if (!url) {
    return (
      <div
        className={`${size} rounded border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300`}
      >
        <i className="fas fa-image text-xs" aria-hidden="true"></i>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={errored ? "Open design link" : "Open design"}
      onClick={(e) => e.stopPropagation()}
      className={
        errored
          ? `${size} rounded border border-gray-200 bg-gray-50 flex items-center justify-center text-primary hover:bg-gray-100`
          : `${size} block rounded border border-gray-200 bg-white overflow-hidden hover:opacity-90`
      }
    >
      {errored ? (
        <i className="fas fa-link text-xs" aria-hidden="true"></i>
      ) : (
        <img
          src={url}
          alt={alt}
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      )}
    </a>
  );
};

export default DesignThumb;
