import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Textarea from "../../../components/form/Textarea";
import FormActions from "../../../components/form/FormActions";
import Input from "../../../components/form/Input";
import { sewingSubcontractorInitialState } from "../../../constants/formInitialState/sewingSubcontractorInitialState";
import { sewingSubcontractorSchema } from "../../../validations/sewingSubcontractorSchema";
import { validateForm, hasErrors } from "../../../utils/validation";
import { sewingSubcontractorApi } from "../../../api/sewingSubcontractorApi";

const EditSewingSubcontractor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(sewingSubcontractorInitialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetchSewingSubcontractor();
  }, []);

  const fetchSewingSubcontractor = async () => {
    try {
      const response = await sewingSubcontractorApi.show(id);
      setFormData(response.data);
    } catch (error) {
      setServerError("Failed to load sewing subcontractor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
     if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setServerError("");

    const validationErrors = validateForm(formData, sewingSubcontractorSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await sewingSubcontractorApi.update(id, formData);
      setSubmitSuccess(true);

      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        navigate("/admin/settings/sewing-subcontractor");
      }, 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message || "Failed to edit sewing subcontractor.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    fetchSewingSubcontractor();
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Edit Sewing Subcontractor">
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
      pageTitle="Edit Sewing Subcontractor"
      path="/admin/settings/sewing-subcontractor/edit/:id"
      links={[
        { label: "Home", href: "/" },
        { label: "Drop Down Settings", href: "#" },
        { label: "Sewing Subcontractor", href: "/admin/settings/sewing-subcontractor" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium">
              Sewing Subcontractor Updated successfully!
            </p>
          </div>
        )}

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-medium">{serverError}</p>
          </div>
        )}

        <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-2 mb-4">
          Sewing Subcontractor Details
        </h1>

        <Input
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          type="text"
          placeholder="Enter subcontractor name"
          required
        />

        <Textarea
          label="Address"
          name="address"
          value={formData.address}
          error={errors.address}
          onChange={handleChange}
          rows={4}
          resizable
          required
          placeholder="Enter subcontractor address"
        />

        <Input
          label="Rate per piece"
          name="rate_per_piece"
          value={formData.rate_per_piece}
          onChange={handleChange}
          error={errors.rate_per_piece}
          type="number"
          step="0.01"
          placeholder="Enter rate per piece"
          required
        />

        <Input
          label="Contact Number"
          name="contact_number"
          value={formData.contact_number}
          onChange={handleChange}
          error={errors.contact_number}
          type="text"
          placeholder="Enter contact number (optional)"
        />

        <Input
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          type="email"
          placeholder="Enter email (optional)"
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

export default EditSewingSubcontractor;
