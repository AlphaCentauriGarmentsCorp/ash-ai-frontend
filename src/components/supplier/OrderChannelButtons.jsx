import React from "react";

/**
 * Issue 20 — Order-channel quick-buttons.
 *
 * Renders a supplier's `order_channels` as one-click buttons that open the
 * channel (new tab). The primary channel is highlighted. Purely presentational
 * and reused on the Material Prep portal and the Supplier view/edit screens.
 *
 * Each channel: { type, label, url, is_primary }
 *   type ∈ viber | messenger | facebook | shopee | lazada | tiktok | website | phone | other
 */

const CHANNEL_META = {
  viber:     { icon: "fa-brands fa-viber",              label: "Viber",     color: "#7360f2" },
  messenger: { icon: "fa-brands fa-facebook-messenger", label: "Messenger", color: "#0084ff" },
  facebook:  { icon: "fa-brands fa-facebook",           label: "Facebook",  color: "#1877f2" },
  shopee:    { icon: "fa-solid fa-bag-shopping",        label: "Shopee",    color: "#ee4d2d" },
  lazada:    { icon: "fa-solid fa-cart-shopping",       label: "Lazada",    color: "#0f146d" },
  tiktok:    { icon: "fa-brands fa-tiktok",             label: "TikTok",    color: "#111111" },
  website:   { icon: "fa-solid fa-globe",               label: "Website",   color: "#0ea5e9" },
  phone:     { icon: "fa-solid fa-phone",               label: "Tawag",     color: "#16a34a" },
  other:     { icon: "fa-solid fa-link",                label: "Link",      color: "#6b7280" },
};

const metaFor = (type) => CHANNEL_META[type] || CHANNEL_META.other;

/** Turn a stored channel value into an openable href. */
const toHref = (type, url) => {
  const raw = (url || "").trim();
  if (!raw) return null;
  // Already has a scheme (https:, viber:, tel:, fb-messenger:, ...)
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return raw;
  if (type === "phone") return `tel:${raw.replace(/[^\d+]/g, "")}`;
  return `https://${raw.replace(/^@/, "")}`;
};

const OrderChannelButtons = ({ channels = [], className = "" }) => {
  const list = Array.isArray(channels) ? channels.filter((c) => c && c.url) : [];
  if (list.length === 0) return null;

  // Primary first so the highlighted button leads.
  const ordered = [...list].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {ordered.map((c, i) => {
        const meta = metaFor(c.type);
        const href = toHref(c.type, c.url);
        const text = (c.label && c.label.trim()) || meta.label;
        const primary = !!c.is_primary;

        const base =
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors";
        const cls = primary
          ? "border-2 border-amber-400 bg-amber-50 text-gray-900 hover:bg-amber-100"
          : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50";

        return (
          <a
            key={`${c.type}-${i}`}
            href={href || undefined}
            target="_blank"
            rel="noreferrer"
            title={primary ? `${text} (primary)` : text}
            className={`${base} ${cls}`}
          >
            <i className={meta.icon} style={{ color: meta.color }} />
            {text}
            {primary && <i className="fa-solid fa-star text-amber-500 text-[10px]" />}
          </a>
        );
      })}
    </div>
  );
};

export { CHANNEL_META };
export default OrderChannelButtons;
