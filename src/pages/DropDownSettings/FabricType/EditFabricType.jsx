import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Textarea from "../../../components/form/Textarea";
import FormActions from "../../../components/form/FormActions";
import Input from "../../../components/form/Input";
import { fabricTypeApi } from "../../../api/fabricTypeApi";
import AlertMessage from "../../../components/common/AlertMessage";

const EditFabricType = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetchFabricType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFabricType = async () => {
    try {
      const response = await fabricTypeApi.show(id);
      const ft = response.data || response;
      setFormData({ name: ft.name || "", description: ft.description || "" });
    } catch (error) {
      setServerError("Failed to load fabric type.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setServerError("");

    if (!formData.name || !formData.name.trim()) {
      setErrors({ name: "Fabric type name is required." });
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await fabricTypeApi.update(id, formData);
      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => navigate("/admin/settings/fabric-type"), 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message || "Failed to edit fabric type.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    fetchFabricType();
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Edit Fabric Type">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-gray-600 text-sm font-medium">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Edit Fabric Type"
      path={`/admin/settings/fabric-type/edit/${id}`}
      links={[
        { label: "Home", href: "/" },
        { label: "Drop Down Settings", href: "#" },
        { label: "Fabric Type", href: "/admin/settings/fabric-type" },
      ]}
    >
      {submitSuccess && (
        <AlertMessage
          type="success"
          title="Fabric Type updated successfully!"
          message="The fabric type has been updated."
        />
      )}

      {serverError && (
        <AlertMessage
          type="error"
          title={serverError}
          message="Please check the form and try again."
        />
      )}

      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-2 mb-4">
          Fabric Type Details
        </h1>

        <Input
          label="Fabric Type Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          type="text"
          placeholder="e.g. 100% Cotton, CVC, Dri-Fit"
          required
        />

        <Textarea
          label="Description (optional)"
          name="description"
          value={formData.description}
          error={errors.description}
          onChange={handleChange}
          rows={6}
          resizable
          placeholder="Optional notes about this fabric type"
        />
      </div>

      <FormActions
        onSubmit={handleSubmit}
        onReset={handleReset}
        isSubmitting={isSubmitting}
        submitText="Update"
        resetText="Reset"
        submittingText="Updating..."
      />
    </AdminLayout>
  );
};

export default EditFabricType;
