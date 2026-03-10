import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import { useParams, useNavigate } from "react-router-dom";
import FormActions from "../../components/form/FormActions";
import Input from "../../components/form/Input";
import { screeenInitialState } from "../../constants/formInitialState/screeenInitialState";
import { screenSchema } from "../../validations/screenSchema";
import { validateForm, hasErrors } from "../../utils/validation";
import { ScreenTypeApi } from "../../api/ScreenTypeApi";

const EditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(screeenInitialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    updateField(name, fieldValue);
  };

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (serverError) {
      setServerError("");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await ScreenTypeApi.show(id);
      const responseData = response.data || response;
      setFormData(responseData);
    } catch (error) {
      setFormData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setServerError("");

    const validationErrors = validateForm(formData, screenSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await ScreenTypeApi.update(id, formData);
      setSubmitSuccess(true);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        navigate(`/screen-inventory`);
      }, 1500);
    } catch {
      setServerError("Failed to create screen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(screeenInitialState);
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Add Screen"
      path="/screen-inventory"
      links={[
        { label: "Home", href: "/" },
        { label: "Screen Inventory", href: "/screen-inventory" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <i className="fa-solid fa-check-circle text-green-500 mr-3"></i>
              <div>
                <p className="text-green-800 font-medium">
                  Screen updated successfully!
                </p>
                <p className="text-green-600 text-sm mt-1">
                  The screen has been updated in inventory.
                </p>
              </div>
            </div>
          </div>
        )}

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <i className="fa-solid fa-exclamation-circle text-red-500 mr-3"></i>
              <div>
                <p className="text-red-800 font-medium">{serverError}</p>
                <p className="text-red-600 text-sm mt-1">
                  Please check the form and try again.
                </p>
              </div>
            </div>
          </div>
        )}

        <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-2 mb-4">
          Screen Details
        </h1>

        <Input
          label="Screen Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          type="text"
          placeholder="Enter screen name"
          required
        />

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          type="text"
          placeholder="Enter screen address"
          required
        />

        <Input
          label="Mesh Count"
          name="mesh_count"
          value={formData.mesh_count}
          onChange={handleChange}
          error={errors.mesh_count}
          type="number"
          placeholder="Enter screen mesh count"
          required
        />

        <Input
          label="Screen Size"
          name="size"
          value={formData.size}
          onChange={handleChange}
          error={errors.size}
          type="text"
          placeholder="Enter screen size"
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

export default EditScreen;
