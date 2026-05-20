/**
 * Inline SVG placeholder for missing/failed images.
 *
 * Replaces the dead `via.placeholder.com` service that the codebase
 * previously relied on. Returns a data URL — no network round trip,
 * no infinite onError retry loops.
 */

const buildPlaceholderSvg = (label = "No Image", size = 150) => {
  const fontSize = Math.max(10, Math.round(size / 12));
  // Keep this XML compact — it's URL-encoded inline.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <rect x="1" y="1" width="${size - 2}" height="${size - 2}" fill="none" stroke="#d1d5db" stroke-width="1" stroke-dasharray="4 3"/>
    <g fill="#9ca3af" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
      <text x="50%" y="50%" font-size="${fontSize}" dy="0.35em">${label}</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Default placeholder, ~150x150 px, "No Image" text.
 */
export const PLACEHOLDER_IMAGE = buildPlaceholderSvg("No Image", 150);

/**
 * Smaller placeholder, ~80x80, useful for thumbnails.
 */
export const PLACEHOLDER_IMAGE_SM = buildPlaceholderSvg("No Image", 80);

/**
 * Custom-sized / custom-text placeholder.
 *
 * @param {string} label
 * @param {number} size
 */
export const placeholderImage = (label = "No Image", size = 150) =>
  buildPlaceholderSvg(label, size);

/**
 * Drop-in `onError` handler for <img> tags. Use as:
 *
 *   <img src={...} onError={onImageError} />
 *
 * Sets the placeholder ONCE (won't loop if the placeholder itself errors).
 */
export const onImageError = (event) => {
  const el = event?.currentTarget || event?.target;
  if (!el) return;
  // Bail if we've already swapped to the placeholder, prevents
  // any chance of an infinite retry loop.
  if (el.dataset.placeholderApplied === "1") return;
  el.dataset.placeholderApplied = "1";
  el.src = PLACEHOLDER_IMAGE;
};

export default PLACEHOLDER_IMAGE;
