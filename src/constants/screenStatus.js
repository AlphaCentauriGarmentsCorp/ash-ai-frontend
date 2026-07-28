/**
 * SM Rework CP4 — Screen status vocabulary + display metadata.
 *
 * The lifecycle (see ScreenAssignmentService, SM Rework CP2):
 *
 *   available  --[picked in Screen Maker Portal]-->  in_use
 *   in_use     --[mass_printing stage completes]-->  for_reclaim
 *   for_reclaim --[manual, here, after physical wash]--> available
 *   damaged    (manual; blocks picking, same as for_reclaim)
 *
 * 'in_use' is deliberately excluded from SCREEN_STATUS_OPTIONS — it's
 * system-derived from an active screen_assignments row and should never
 * be hand-picked from this screen (the backend's Screens/Update request
 * rejects it too). It still needs a badge for display, so it's covered
 * in SCREEN_STATUS_META alongside the three manually-settable statuses.
 *
 * A null/empty status means "created before the status lifecycle
 * existed" — the backend's availableScreens() query already treats that
 * the same as 'available', so the display layer does too.
 */

export const SCREEN_STATUS_META = {
  available: {
    label: "Available",
    description: "Malinis, handa nang gamitin.",
    icon: "fa-check-circle",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700",
  },
  in_use: {
    label: "In Use",
    description: "Kasalukuyang ginagamit ng isang order.",
    icon: "fa-stamp",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    buttonClass: "bg-blue-600 hover:bg-blue-700",
  },
  for_reclaim: {
    label: "Needs Washing",
    description: "Nagamit na — hugasan bago i-assign ulit.",
    icon: "fa-droplet",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    buttonClass: "bg-amber-600 hover:bg-amber-700",
  },
  damaged: {
    label: "Damaged",
    description: "Sira — hindi na dapat i-assign.",
    icon: "fa-triangle-exclamation",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
    buttonClass: "bg-red-600 hover:bg-red-700",
  },
};

const UNKNOWN_STATUS_META = {
  label: "Available",
  description: "Malinis, handa nang gamitin.",
  icon: "fa-check-circle",
  badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  buttonClass: "bg-emerald-600 hover:bg-emerald-700",
};

/** Looks up display metadata for a screen's status, treating null/empty
 *  the same as 'available' (matches the backend's availableScreens()
 *  query). Falls back gracefully for any unrecognized value instead of
 *  crashing the table/form render. */
export function screenStatusMeta(status) {
  const key = status || "available";
  return SCREEN_STATUS_META[key] || UNKNOWN_STATUS_META;
}

/** The three statuses a person can manually set from Screen Inventory.
 *  'in_use' is intentionally excluded — see file header. */
export const SCREEN_STATUS_OPTIONS = ["available", "for_reclaim", "damaged"].map(
  (value) => ({ value, ...SCREEN_STATUS_META[value] }),
);
