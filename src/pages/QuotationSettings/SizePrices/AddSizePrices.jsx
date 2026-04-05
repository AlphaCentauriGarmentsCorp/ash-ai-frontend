import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Select from "../../../components/form/Select";
import FormActions from "../../../components/form/FormActions";
import Input from "../../../components/form/Input";
import { sizePricesInitialState } from "../../../constants/formInitialState/sizePricesInitialState";
import { sizePricesSchema } from "../../../validations/sizePricesSchema";
import { validateForm, hasErrors } from "../../../utils/validation";
import { sizePricesApi } from "../../../api/sizePricesApi";
import AlertMessage from "../../../components/common/AlertMessage";
import { sizePriceService } from "../../../services/sizePriceService";

const AddSizePrices = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(sizePricesInitialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [dropdowns, setDropdowns] = useState({
    tshirtTypes: [],
    tshirtSizes: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const data = await sizePriceService.getAllDropdownOptions();
        setDropdowns(data);
      } catch (err) {
        console.error(err);
        setServerError("Failed to load dropdown data.");
      }
    };

    fetchDropdowns();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setServerError("");

    const validationErrors = validateForm(formData, sizePricesSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await sizePricesApi.create(formData);
      setSubmitSuccess(true);

      setFormData(sizePricesInitialState);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        navigate(`/quotation/settings/size-prices`);
      }, 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message || "Failed to create size prices.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(sizePricesInitialState);
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  return (
    <AdminLayout
      pageTitle="Add Size Prices"
      path="/quotation/settings/size-prices/new"
      links={[
        { label: "Home", href: "/" },
        { label: "Quotation Settings", href: "#" },
        { label: "Size Prices", href: "/quotation/settings/size-prices" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <AlertMessage
            type="success"
            title="Size Prices created successfully!"
            message="The new size prices has been added to the system."
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
          Size Prices Details
        </h1>

        <Select
          label="T-Shirt Type"
          name="shirt_id"
          options={dropdowns.tshirtTypes}
          onChange={handleChange}
          value={formData.shirt_id}
          searchable
          error={errors.shirt_id}
          icon={<i className="fas fa-shirt text-gray"></i>}
          disabled={isSubmitting}
        />

        <Select
          label="T-Shirt Size"
          name="size_id"
          options={dropdowns.tshirtSizes}
          value={formData.size_id}
          onChange={handleChange}
          searchable
          error={errors.size_id}
          icon={<i className="fas fa-ruler text-gray"></i>}
          disabled={isSubmitting}
        />

        <Input
          label="T-shirt Price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          error={errors.price}
          type="number"
          placeholder="Enter t-shirt price"
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

export default AddSizePrices;
