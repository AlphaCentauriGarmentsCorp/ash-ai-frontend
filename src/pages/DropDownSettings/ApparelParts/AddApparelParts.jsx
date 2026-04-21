import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Textarea from "../../../components/form/Textarea";
import FormActions from "../../../components/form/FormActions";
import Input from "../../../components/form/Input";
import AlertMessage from "../../../components/common/AlertMessage";
import { apparelPartsInitialState } from "../../../constants/formInitialState/apparelPartsInitialState";
import { typesSchema } from "../../../validations/typesSchema";
import { validateForm, hasErrors } from "../../../utils/validation";
import { apparelPartsApi } from "../../../api/apparelPartsApi";

const AddApparelParts = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(apparelPartsInitialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

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
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("description", formData.description);

      await apparelPartsApi.create(payload);
      setSubmitSuccess(true);

      setFormData(apparelPartsInitialState);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        navigate("/admin/settings/apparel-parts");
      }, 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message || "Failed to create apparel parts.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(apparelPartsInitialState);
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Add Apparel Parts"
      path="/admin/settings/apparel-parts/new"
      links={[
        { label: "Home", href: "/" },
        { label: "Drop Down Settings", href: "#" },
        { label: "Apparel Parts", href: "/admin/settings/apparel-parts" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <AlertMessage
            type="success"
            title="Apparel Parts created successfully!"
            message="The new apparel parts record has been added to the system."
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
          Apparel Parts Details
        </h1>

        <Input
          label="Apparel Parts Title"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          type="text"
          placeholder="Enter apparel parts name"
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
          placeholder="Enter apparel parts description"
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

export default AddApparelParts;