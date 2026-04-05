import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const EditSizePrices = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
    const fetchData = async () => {
      try {
        const [dropdownData, sizePriceData] = await Promise.all([
          sizePriceService.getAllDropdownOptions(),
          sizePricesApi.show(id),
        ]);

        setDropdowns(dropdownData);

        const data = sizePriceData.data || sizePriceData;
        setFormData({
          shirt_id: data.shirt_id || "",
          size_id: data.size_id || "",
          price: data.price || "",
        });
      } catch (err) {
        console.error(err);
        setServerError("Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
      await sizePricesApi.update(id, formData);
      setSubmitSuccess(true);

      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        navigate(`/quotation/settings/size-prices`);
      }, 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message || "Failed to update size prices.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    const fetchOriginalData = async () => {
      try {
        const response = await sizePricesApi.show(id);
        const data = response.data || response;
        setFormData({
          shirt_id: data.shirt_id || "",
          size_id: data.size_id || "",
          price: data.price || "",
        });
        setErrors({});
        setSubmitSuccess(false);
        setServerError("");
      } catch (err) {
        setServerError("Failed to reset form data.");
      }
    };
    fetchOriginalData();
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Edit Size Prices">
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
      pageTitle="Edit Size Prices"
      path={`/quotation/settings/size-prices/edit/${id}`}
      links={[
        { label: "Home", href: "/" },
        { label: "Quotation Settings", href: "#" },
        { label: "Size Prices", href: "/quotation/settings/size-prices" },
        { label: "Edit", href: "#" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <AlertMessage
            type="success"
            title="Size Prices updated successfully!"
            message="The size prices has been updated in the system."
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
          Edit Size Prices
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
        submitText="Update"
        resetText="Reset"
        submittingText="Updating..."
      />
    </AdminLayout>
  );
};

export default EditSizePrices;
