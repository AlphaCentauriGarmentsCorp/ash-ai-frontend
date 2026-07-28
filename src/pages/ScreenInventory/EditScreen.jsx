import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import { useParams, useNavigate } from "react-router-dom";
import FormActions from "../../components/form/FormActions";
import Input from "../../components/form/Input";
import { screeenInitialState } from "../../constants/formInitialState/screeenInitialState";
import { screenSchema } from "../../validations/screenSchema";
import { validateForm, hasErrors } from "../../utils/validation";
import { ScreenTypeApi } from "../../api/ScreenTypeApi";
import { SCREEN_STATUS_OPTIONS, screenStatusMeta } from "../../constants/screenStatus";

const EditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(screeenInitialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // SM Rework CP4 — status is its own instant-save control, separate
  // from the main form's Save button (same "tap = saved immediately"
  // pattern as the Screen Maker Portal's Screens Used picker), so a
  // status correction can't be lost by navigating away without hitting
  // the big Save button below.
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    updateField(name, fieldValue);
  };

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (serverError) {
      setServerError("");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await ScreenTypeApi.show(id);
      const responseData = response.data || response;
      setFormData(responseData);
    } catch (error) {
      setFormData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setServerError("");

    const validationErrors = validateForm(formData, screenSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await ScreenTypeApi.update(id, formData);
      setSubmitSuccess(true);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        navigate(`/screen-inventory`);
      }, 1500);
    } catch {
      setServerError("Failed to create screen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(screeenInitialState);
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  // SM Rework CP4 — instant status save. Doesn't touch the other fields
  // or the main form's dirty/error state.
  const handleStatusChange = async (value) => {
    if (value === (formData.status || "available") || statusSaving) return;

    setStatusSaving(true);
    setStatusError(null);
    try {
      const response = await ScreenTypeApi.update(id, { status: value });
      const updated = response.data || response;
      setFormData((prev) => ({ ...prev, status: updated.status ?? value }));
    } catch (err) {
      setStatusError(
        err?.response?.data?.errors?.status?.[0] ||
        err?.response?.data?.message ||
        "Hindi na-save ang status. Subukan ulit.",
      );
    } finally {
      setStatusSaving(false);
    }
  };

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Add Screen"
      path="/screen-inventory"
      links={[
        { label: "Home", href: "/" },
        { label: "Screen Inventory", href: "/screen-inventory" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <i className="fa-solid fa-check-circle text-green-500 mr-3"></i>
              <div>
                <p className="text-green-800 font-medium">
                  Screen updated successfully!
                </p>
                <p className="text-green-600 text-sm mt-1">
                  The screen has been updated in inventory.
                </p>
              </div>
            </div>
          </div>
        )}

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <i className="fa-solid fa-exclamation-circle text-red-500 mr-3"></i>
              <div>
                <p className="text-red-800 font-medium">{serverError}</p>
                <p className="text-red-600 text-sm mt-1">
                  Please check the form and try again.
                </p>
              </div>
            </div>
          </div>
        )}

        <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-2 mb-4">
          Screen Details
        </h1>

        {/* SM Rework CP4 — Status. Instant-save, independent of the form
            below. 'in_use' is shown as an info badge only (never a
            tappable target) — it's system-derived by the Screen Maker
            Portal (SM Rework CP2) and would desync from reality if
            hand-picked while a screen_assignments row still holds it. */}
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mb-2">
            Status
          </p>

          <div className="flex items-center gap-2 mb-3">
            {(() => {
              const meta = screenStatusMeta(formData.status);
              return (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border ${meta.badgeClass}`}
                >
                  <i className={`fa-solid ${meta.icon}`} />
                  {meta.label}
                </span>
              );
            })()}
            {statusSaving && (
              <i className="fa-solid fa-spinner fa-spin text-gray-400 text-xs" />
            )}
          </div>

          {formData.status === "in_use" && (
            <p className="text-[11px] text-blue-700 bg-blue-50 border border-blue-200 rounded px-2.5 py-1.5 mb-3">
              <i className="fa-solid fa-circle-info mr-1" />
              Kasalukuyang ginagamit ng isang order. Awtomatikong magiging
              "Needs Washing" ito pagkatapos matapos ang Mass Printing stage
              nito.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {SCREEN_STATUS_OPTIONS.map((opt) => {
              const isActive = (formData.status || "available") === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  title={opt.description}
                  onClick={() => handleStatusChange(opt.value)}
                  disabled={statusSaving || isActive}
                  className={`text-xs px-3 py-1.5 rounded font-medium disabled:cursor-default ${
                    isActive
                      ? `${opt.buttonClass} text-white opacity-90`
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                  } disabled:opacity-60`}
                >
                  <i className={`fa-solid ${opt.icon} mr-1.5`} />
                  {opt.label}
                </button>
              );
            })}
          </div>

          {statusError && (
            <p className="text-[11px] text-red-600 mt-2">
              <i className="fa-solid fa-triangle-exclamation mr-1" />
              {statusError}
            </p>
          )}
        </div>

        <Input
          label="Screen Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          type="text"
          placeholder="Enter screen name"
          required
        />

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          type="text"
          placeholder="Enter screen address"
          required
        />

        <Input
          label="Mesh Count"
          name="mesh_count"
          value={formData.mesh_count}
          onChange={handleChange}
          error={errors.mesh_count}
          type="number"
          placeholder="Enter screen mesh count"
          required
        />

        <Input
          label="Screen Size"
          name="size"
          value={formData.size}
          onChange={handleChange}
          error={errors.size}
          type="text"
          placeholder="Enter screen size"
          required
        />
      </div>

      <FormActions
        onSubmit={handleSubmit}
        onReset={handleReset}
        isSubmitting={isSubmitting}
        submitText="Save"
        resetText="Reset"
        submittingText="Saving..."
      />
    </AdminLayout>
  );
};

export default EditScreen;
