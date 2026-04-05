import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Textarea from "../../../components/form/Textarea";
import FormActions from "../../../components/form/FormActions";
import Input from "../../../components/form/Input";
import { typesInitialState } from "../../../constants/formInitialState/typesInitialState";
import { typesSchema } from "../../../validations/typesSchema";
import { validateForm, hasErrors } from "../../../utils/validation";
import { addonCategoriesApi } from "../../../api/addonCategoriesApi";
import AlertMessage from "../../../components/common/AlertMessage";

const EditAddonCategories = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(typesInitialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetchAddonCategories();
  }, []);

  const fetchAddonCategories = async () => {
    try {
      const response = await addonCategoriesApi.show(id);
      setFormData(response.data);
    } catch (error) {
      setServerError("Failed to load addon categories.");
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
      await addonCategoriesApi.update(id, formData);
      setSubmitSuccess(true);

      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        navigate("/quotation/settings/addon-categories");
      }, 1500);
    } catch (error) {
      setServerError("Failed to update addon categories.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    fetchAddonCategories();
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Edit Addon Categories">
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
      pageTitle="Edit Addon Categories"
      path={`/quotation/settings/addon-categories/edit/${id}`}
      links={[
        { label: "Home", href: "/" },
        { label: "Quotation Settings", href: "#" },
        {
          label: "Addon Categories",
          href: "/quotation/settings/addon-categories",
        },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <AlertMessage
            type="success"
            title="Addon Categories updated successfully!"
            message="The addon category has been updated in the system."
          />
        )}

        {serverError && (
          <AlertMessage
            type="error"
            title={serverError}
            message="Please check the form and try again."
          />
        )}

        <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-2 mb-4">
          Addon Categories Details
        </h1>

        <Input
          label="Addon Categories Title"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          type="text"
          placeholder="Enter addon categories name"
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
          required
          placeholder="Enter addon categories description"
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

export default EditAddonCategories;
