import React, { useState } from "react";
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

const AddLocation = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(locationInitialState);
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

    const validationErrors = validateForm(formData, equipmentLocationSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await equipmentLocationApi.create(formData);
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate("/equipment-inventory");
      }, 1500);

      setFormData(locationInitialState);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setServerError("Failed to create equipment location.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(locationInitialState);
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  return (
    <AdminLayout
      icon="fa-map-marker"
      pageTitle="Add Equipment Location"
      path="/equipment-inventory/new"
      links={[
        { label: "Home", href: "/" },
        { label: "Equipment Inventory", href: "/equipment-inventory" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium">
              Location created successfully!
            </p>
          </div>
        )}

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-medium">{serverError}</p>
          </div>
        )}

        <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-2 mb-4">
          Equipment Location Details
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
        submitText="Save"
        resetText="Reset"
        submittingText="Saving..."
      />
    </AdminLayout>
  );
};

export default AddLocation;
