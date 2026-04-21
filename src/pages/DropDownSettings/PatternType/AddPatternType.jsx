import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Textarea from "../../../components/form/Textarea";
import FormActions from "../../../components/form/FormActions";
import Input from "../../../components/form/Input";
import FileUpload from "../../../components/form/FileUpload";
import { patternTypeInitialState } from "../../../constants/formInitialState/patternTypeInitialState";
import { patternTypeSchema } from "../../../validations/patternTypeSchema";
import { validateForm, hasErrors } from "../../../utils/validation";
import { patternTypeService } from "../../../services/patternTypeService";
import AlertMessage from "../../../components/common/AlertMessage";

const AddPatternType = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(patternTypeInitialState);
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

  const handleSubmit = async (e) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setServerError("");

    const validationErrors = validateForm(formData, patternTypeSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      
      formData.pattern_images.forEach((file, index) => {
        formDataToSend.append(`pattern_images[${index}]`, file);
      });

      await patternTypeService.create(formDataToSend);
      setSubmitSuccess(true);

      setFormData(patternTypeInitialState);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        navigate(`/admin/settings/pattern-type`);
      }, 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message || "Failed to create pattern type.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(patternTypeInitialState);
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  return (
    <AdminLayout
      pageTitle="Add Pattern Type"
      path="/admin/settings/pattern-type/new"
      links={[
        { label: "Home", href: "/" },
        { label: "Drop Down Settings", href: "#" },
        { label: "Pattern Type", href: "/admin/settings/pattern-type" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <AlertMessage
            type="success"
            title="Pattern Type created successfully!"
            message="The new pattern has been added to the system."
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
          Pattern Type Details
        </h1>

        <Input
          label="Pattern Type Title"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          type="text"
          placeholder="Enter pattern name"
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
          placeholder="Enter pattern description"
        />

        <FileUpload
          label="Pattern Images"
          name="pattern_images"
          value={formData.pattern_images}
          onChange={handleChange}
          acceptedTypes="image/*"
          multiple={true}
          error={errors.pattern_images}
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

export default AddPatternType;
