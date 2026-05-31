/**
 * Shared design-image helpers (Issue 8 / Issue 11).
 *
 * Single source of truth for turning a stored part-image reference into a
 * displayable URL, used by the quotation/orders lists, the View page, and the
 * GA review panel. Storage paths are served from `${VITE_API_URL origin}/storage/...`;
 * absolute http(s)/data URLs and links pass through unchanged.
 */

// Raw stored path (or link) → displayable URL.
export const resolveImageUrl = (raw) => {
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

// A print-part object → its displayable image URL (checks every shape: a link,
// a resolved url, a stored path, or the legacy `image` field).
export const partImage = (part) =>
  resolveImageUrl(
    part?.image_link || part?.image_url || part?.image_path || part?.image || "",
  );

// A quotation/order row → the first available part image (for list thumbnails).
// Quotations expose parts as `print_parts`; orders carry `print_parts_json`.
export const firstPartThumbnail = (item) => {
  const parts = Array.isArray(item?.print_parts_json)
    ? item.print_parts_json
    : Array.isArray(item?.print_parts)
      ? item.print_parts
      : [];
  for (const p of parts) {
    const url = partImage(p);
    if (url) return url;
  }
  return "";
};
