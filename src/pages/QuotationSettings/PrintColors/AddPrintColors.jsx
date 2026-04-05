import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Select from "../../../components/form/Select";
import FormActions from "../../../components/form/FormActions";
import Input from "../../../components/form/Input";
import { printColorsInitialState } from "../../../constants/formInitialState/printColorsInitialState";
import { printColorsSchema } from "../../../validations/printColorsSchema";
import { validateForm, hasErrors } from "../../../utils/validation";
import { printColorsApi } from "../../../api/printColorsApi";
import AlertMessage from "../../../components/common/AlertMessage";
import { printTypesApi } from "../../../api/printTypesApi";

const AddPrintColors = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(printColorsInitialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [printType, setDropdowns] = useState([]);

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
        const response = await printTypesApi.index();

        const formatted = (response.data || []).map((item) => ({
          value: item.id,
          label: item.name,
          title: item.description,
        }));

        setDropdowns(formatted);
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

    const validationErrors = validateForm(formData, printColorsSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await printColorsApi.create(formData);
      setSubmitSuccess(true);

      setFormData(printColorsInitialState);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        navigate(`/quotation/settings/print-colors`);
      }, 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message || "Failed to create print colors.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(printColorsInitialState);
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  return (
    <AdminLayout
      pageTitle="Add Print Colors"
      path="/quotation/settings/print-colors/new"
      links={[
        { label: "Home", href: "/" },
        { label: "Quotation Settings", href: "#" },
        { label: "Print Colors", href: "/quotation/settings/print-colors" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <AlertMessage
            type="success"
            title="Print Colors created successfully!"
            message="The new print colors has been added to the system."
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
          Print Colors Details
        </h1>

        <Select
          label="Print Type"
          name="type_id"
          options={printType}
          onChange={handleChange}
          value={formData.type_id}
          searchable
          error={errors.type_id}
          icon={<i className="fas fa-shirt text-gray"></i>}
          disabled={isSubmitting}
        />

        <Input
          label="Color count"
          name="color_count"
          value={formData.color_count}
          onChange={handleChange}
          error={errors.color_count}
          type="number"
          placeholder="Enter color count"
          required
        />

        <Input
          label="Print Color Price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          error={errors.price}
          type="number"
          placeholder="Enter print color price"
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

export default AddPrintColors;
