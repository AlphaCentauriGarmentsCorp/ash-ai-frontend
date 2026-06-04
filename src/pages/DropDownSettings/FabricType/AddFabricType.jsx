import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Textarea from "../../../components/form/Textarea";
import FormActions from "../../../components/form/FormActions";
import Input from "../../../components/form/Input";
import { fabricTypeApi } from "../../../api/fabricTypeApi";
import AlertMessage from "../../../components/common/AlertMessage";

const INITIAL = { name: "", description: "" };

const AddFabricType = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(INITIAL);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setServerError("");

    // Name is required; description is optional for a fabric type.
    if (!formData.name || !formData.name.trim()) {
      setErrors({ name: "Fabric type name is required." });
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await fabricTypeApi.create(formData);
      setSubmitSuccess(true);
      setFormData(INITIAL);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => navigate("/admin/settings/fabric-type"), 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message || "Failed to create fabric type.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL);
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Add Fabric Type"
      path="/admin/settings/fabric-type/new"
      links={[
        { label: "Home", href: "/" },
        { label: "Drop Down Settings", href: "#" },
        { label: "Fabric Type", href: "/admin/settings/fabric-type" },
      ]}
    >
      {submitSuccess && (
        <AlertMessage
          type="success"
          title="Fabric Type created successfully!"
          message="The fabric type has been added to the system."
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
        submitText="Save"
        resetText="Reset"
        submittingText="Saving..."
      />
    </AdminLayout>
  );
};

export default AddFabricType;
