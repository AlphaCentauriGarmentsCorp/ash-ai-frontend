import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import { pricingSettingApi } from "../../../api/pricingSettingApi";
import AlertMessage from "../../../components/common/AlertMessage";

// Friendly titles for the row `group` values seeded on the backend.
const GROUP_TITLES = {
  apparel: "Base / Apparel",
  silkscreen: "Silkscreen",
  dtf: "DTF (Direct-to-Film)",
  embroidery: "Embroidery",
  sublimation: "Sublimation",
  payment: "Payment",
  custom: "Custom Pattern",
};

const GROUP_ORDER = [
  "apparel",
  "silkscreen",
  "dtf",
  "embroidery",
  "sublimation",
  "custom",
  "payment",
];

const PricingSettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [edited, setEdited] = useState({}); // id -> string value
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchSettings = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await pricingSettingApi.index();
      const rows = res?.data || res || [];
      setSettings(rows);
      setEdited(
        rows.reduce((acc, r) => {
          acc[r.id] = String(r.value ?? "");
          return acc;
        }, {}),
      );
    } catch (err) {
      setError("Failed to load pricing settings.");
      setSettings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Group rows, ordered by GROUP_ORDER then anything else.
  const grouped = useMemo(() => {
    const map = {};
    for (const s of settings) {
      const g = s.group || "other";
      (map[g] = map[g] || []).push(s);
    }
    const keys = [
      ...GROUP_ORDER.filter((g) => map[g]),
      ...Object.keys(map).filter((g) => !GROUP_ORDER.includes(g)),
    ];
    return keys.map((g) => ({ group: g, title: GROUP_TITLES[g] || g, rows: map[g] }));
  }, [settings]);

  const changedRows = useMemo(
    () =>
      settings.filter(
        (s) =>
          edited[s.id] !== undefined &&
          String(edited[s.id]) !== String(s.value ?? ""),
      ),
    [settings, edited],
  );

  const handleChange = (id, value) => {
    setSuccess("");
    setError("");
    setEdited((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    // Validate: every changed value must be a number >= 0.
    const invalid = changedRows.find((s) => {
      const v = parseFloat(edited[s.id]);
      return !Number.isFinite(v) || v < 0;
    });
    if (invalid) {
      setError(`"${invalid.label}" must be a number of 0 or more.`);
      return;
    }

    setIsSaving(true);
    try {
      const results = await Promise.allSettled(
        changedRows.map((s) =>
          pricingSettingApi.update(s.id, { value: parseFloat(edited[s.id]) }),
        ),
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) {
        setError(`${failed} rate(s) failed to save. Please try again.`);
      } else {
        setSuccess(
          `Saved ${changedRows.length} rate${changedRows.length === 1 ? "" : "s"}.`,
        );
      }
      await fetchSettings();
    } catch (err) {
      setError("Failed to save pricing settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setEdited(
      settings.reduce((acc, r) => {
        acc[r.id] = String(r.value ?? "");
        return acc;
      }, {}),
    );
    setSuccess("");
    setError("");
  };

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Pricing Settings"
      path="/quotation/settings/pricing"
      links={[
        { label: "Home", href: "/" },
        { label: "Quotation Settings", href: "#" },
        { label: "Pricing Settings", href: "#" },
      ]}
    >
      {success && (
        <AlertMessage type="success" title={success} message="Pricing rates updated." />
      )}
      {error && (
        <AlertMessage type="error" title={error} message="Please review and try again." />
      )}

      <div className="bg-light p-3 lg:p-6 rounded-lg border border-gray-300">
        <div className="flex items-start justify-between gap-3 border-b border-gray-300 pb-3 mb-4">
          <div>
            <h1 className="font-semibold text-xl text-primary">Pricing Rates</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              These rates drive every quotation and order price. Changes apply to
              new computations only.
            </p>
          </div>
          {changedRows.length > 0 && (
            <span className="shrink-0 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              {changedRows.length} unsaved
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-gray-600 text-sm font-medium">Loading rates...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ group, title, rows }) => (
              <div key={group}>
                <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-700 mb-2">
                  {title}
                </h2>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {rows.map((s) => {
                    const dirty = String(edited[s.id]) !== String(s.value ?? "");
                    return (
                      <div
                        key={s.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">
                            {s.label}
                            {dirty && (
                              <span className="ml-2 text-[10px] text-amber-600">• edited</span>
                            )}
                          </p>
                          {s.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={edited[s.id] ?? ""}
                            onChange={(e) => handleChange(s.id, e.target.value)}
                            className={`w-32 rounded-lg border px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                              dirty ? "border-amber-400 bg-amber-50" : "border-gray-300"
                            }`}
                          />
                          <span className="text-xs text-gray-500 w-20">{s.unit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving || changedRows.length === 0}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || changedRows.length === 0}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PricingSettingsPage;
