import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Textarea from "../../../components/form/Textarea";
import FormActions from "../../../components/form/FormActions";
import Input from "../../../components/form/Input";
import { quotationTypeInitialState } from "../../../constants/formInitialState/quotationTypeInitialState";
import { quotationTypeSchema } from "../../../validations/quotationTypeSchema";
import { validateForm, hasErrors } from "../../../utils/validation";
import { tshirtNecklineApi } from "../../../api/tshirtNecklineApi";
import AlertMessage from "../../../components/common/AlertMessage";

const AddTshirtNeckline = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(quotationTypeInitialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

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

    const validationErrors = validateForm(formData, quotationTypeSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await tshirtNecklineApi.create(formData);
      setSubmitSuccess(true);

      setFormData(quotationTypeInitialState);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        navigate(`/quotation/settings/tshirt-neckline`);
      }, 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message || "Failed to create tshirt neckline.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(quotationTypeInitialState);
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  return (
    <AdminLayout
      pageTitle="Add Tshirt Neckline"
      path="/quotation/settings/tshirt-neckline/new"
      links={[
        { label: "Home", href: "/" },
        { label: "Quotation Settings", href: "#" },
        {
          label: "Tshirt Neckline",
          href: "/quotation/settings/tshirt-neckline",
        },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <AlertMessage
            type="success"
            title="Tshirt Neckline created successfully!"
            message="The new tshirt neckline has been added to the system."
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
          Tshirt Neckline Details
        </h1>

        <Input
          label="Tshirt Neckline Title"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          type="text"
          placeholder="Enter tshirt neckline name"
          required
        />

        <Input
          label="Base Price"
          name="base_price"
          value={formData.base_price}
          onChange={handleChange}
          error={errors.base_price}
          type="text"
          placeholder="Enter base price"
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
          placeholder="Enter tshirt neckline description"
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

export default AddTshirtNeckline;
