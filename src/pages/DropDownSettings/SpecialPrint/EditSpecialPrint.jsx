import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Textarea from "../../../components/form/Textarea";
import FormActions from "../../../components/form/FormActions";
import Input from "../../../components/form/Input";
import { typesInitialState } from "../../../constants/formInitialState/typesInitialState";
import { typesSchema } from "../../../validations/typesSchema";
import { validateForm, hasErrors } from "../../../utils/validation";
import { specialPrintApi } from "../../../api/specialPrintApi";

const EditSpecialPrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(typesInitialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetchSpecialPrint();
  }, []);

  const fetchSpecialPrint = async () => {
    try {
      const response = await specialPrintApi.show(id);
      setFormData(response.data || response);
    } catch (error) {
      setServerError("Failed to load special print.");
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

    const validationErrors = validateForm(formData, typesSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await specialPrintApi.update(id, formData);
      setSubmitSuccess(true);

      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        navigate("/admin/settings/special-print");
      }, 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message || "Failed to edit special print.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    fetchSpecialPrint();
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Edit Special Print">
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
      pageTitle="Edit Special Print"
      path={`/admin/settings/special-print/edit/${id}`}
      links={[
        { label: "Home", href: "/" },
        { label: "Drop Down Settings", href: "#" },
        { label: "Special Print", href: "/admin/settings/special-print" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium">
              Special Print updated successfully!
            </p>
          </div>
        )}

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-medium">{serverError}</p>
          </div>
        )}

        <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-2 mb-4">
          Special Print Details
        </h1>

        <Input
          label="Special Print Title"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          type="text"
          placeholder="Enter special print name (e.g. High Density, Puff)"
          required
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          error={errors.description}
          onChange={handleChange}
          rows={15}
          resizable
          placeholder="Enter special print description"
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

export default EditSpecialPrint;
