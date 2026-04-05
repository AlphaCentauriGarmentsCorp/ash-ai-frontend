import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Select from "../../../components/form/Select";
import Textarea from "../../../components/form/Textarea";
import FormActions from "../../../components/form/FormActions";
import Input from "../../../components/form/Input";
import { addonsInitialState } from "../../../constants/formInitialState/addonsInitialState";
import { addonsSchema } from "../../../validations/addonsSchema";
import { validateForm, hasErrors } from "../../../utils/validation";
import { addonsApi } from "../../../api/addonsApi";
import AlertMessage from "../../../components/common/AlertMessage";
import { addonCategoriesApi } from "../../../api/addonCategoriesApi";

const EditAddons = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(addonsInitialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [addonCategories, setAddonCategories] = useState([]);

  const priceType = [
    {
      id: 1,
      value: "Paid",
      label: "Paid",
      title: "User will be charged for this item",
    },
    {
      id: 2,
      value: "Free",
      label: "Free",
      title: "This item is provided at no cost",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "price_type" && value === "Free") {
        updated.price = 0;
      }

      return updated;
    });
  };

  const isFree = formData.price_type === "Free";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, addonResponse] = await Promise.all([
          addonCategoriesApi.index(),
          addonsApi.show(id),
        ]);

        // Format categories
        const formattedCategories = (categoriesResponse.data || []).map(
          (item) => ({
            value: item.id,
            label: item.name,
            title: item.description,
          }),
        );
        setAddonCategories(formattedCategories);

        // Set form data
        const addonData = addonResponse.data || addonResponse;
        setFormData({
          category_id: addonData.category_id || "",
          name: addonData.name || "",
          price_type: addonData.price_type || "Paid",
          price: addonData.price || "",
          description: addonData.description || "",
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

    const validationErrors = validateForm(formData, addonsSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await addonsApi.update(id, formData);
      setSubmitSuccess(true);

      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        navigate(`/quotation/settings/addons`);
      }, 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message || "Failed to update addons.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    // Reset to original fetched data
    const fetchOriginalData = async () => {
      try {
        const response = await addonsApi.show(id);
        const addonData = response.data || response;
        setFormData({
          category_id: addonData.category_id || "",
          name: addonData.name || "",
          price_type: addonData.price_type || "Paid",
          price: addonData.price || "",
          description: addonData.description || "",
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
      <AdminLayout pageTitle="Edit Addons">
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
      pageTitle="Edit Addons"
      path={`/quotation/settings/addons/edit/${id}`}
      links={[
        { label: "Home", href: "/" },
        { label: "Quotation Settings", href: "#" },
        { label: "Addons", href: "/quotation/settings/addons" },
        { label: "Edit", href: "#" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <AlertMessage
            type="success"
            title="Addons updated successfully!"
            message="The addons has been updated in the system."
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
          Edit Addons Details
        </h1>

        <Select
          label="Addon Category"
          name="category_id"
          options={addonCategories}
          onChange={handleChange}
          value={formData.category_id}
          searchable
          error={errors.category_id}
          icon={<i className="fas fa-tag text-gray"></i>}
          disabled={isSubmitting}
        />

        <Input
          label="Addon Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          type="text"
          placeholder="Enter addon name"
          required
        />

        <Select
          label="Price type"
          name="price_type"
          options={priceType}
          onChange={handleChange}
          value={formData.price_type}
          searchable
          error={errors.price_type}
          icon={<i className="fas fa-tag text-gray"></i>}
          disabled={isSubmitting}
        />

        {!isFree && (
          <Input
            label="Addon Price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            error={errors.price}
            type="number"
            placeholder="Enter addon price"
            required
          />
        )}

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          error={errors.description}
          onChange={handleChange}
          rows={15}
          resizable
          required
          placeholder="Enter addon description"
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

export default EditAddons;
