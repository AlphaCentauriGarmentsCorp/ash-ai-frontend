import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Textarea from "../../components/form/Textarea";
import FormActions from "../../components/form/FormActions";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import { locationInitialState } from "../../constants/formInitialState/locationInitialState";
import { equipmentLocationSchema } from "../../validations/equipmentLocationSchema";
import { validateForm, hasErrors } from "../../utils/validation";
import { equipmentLocationApi } from "../../api/equipmentLocationApi";
import { LocationIconOptions } from "../../constants/formOptions/equipmentInventoryOptions";

const EditLocation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(locationInitialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    try {
      const response = await equipmentLocationApi.show(id);
      setFormData(response.data);
    } catch (error) {
      setServerError("Failed to load location.");
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

    const validationErrors = validateForm(formData, equipmentLocationSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await equipmentLocationApi.update(id, formData);
      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        navigate("/equipment-inventory");
      }, 1500);
    } catch (error) {
      setServerError("Failed to update location.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    fetchLocation();
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Edit Location">
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
      icon="fa-map-marker"
      pageTitle="Edit Location"
      path={`/equipment-inventory/edit/${id}`}
      links={[
        { label: "Home", href: "/" },
        { label: "Equipment Inventory", href: "/equipment-inventory" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium">
              Location updated successfully!
            </p>
          </div>
        )}

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-medium">{serverError}</p>
          </div>
        )}

        <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-2 mb-4">
          Location Details
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Location Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            type="text"
            placeholder="Enter location name"
            required
          />

          <Select
            label="Icon"
            name="icon"
            options={LocationIconOptions}
            value={formData.icon}
            onChange={handleChange}
            error={errors.icon}
            placeholder="Select an icon"
            searchable
            required
          />
        </div>

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          error={errors.description}
          onChange={handleChange}
          rows={15}
          resizable
          required
          placeholder="Enter location description"
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

export default EditLocation;
