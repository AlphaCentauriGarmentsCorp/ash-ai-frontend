import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Textarea from "../../../components/form/Textarea";
import FormActions from "../../../components/form/FormActions";
import Input from "../../../components/form/Input";
import { quotationTypeInitialState } from "../../../constants/formInitialState/quotationTypeInitialState";
import { quotationTypeSchema } from "../../../validations/quotationTypeSchema";
import { validateForm, hasErrors } from "../../../utils/validation";
import { printTypesApi } from "../../../api/printTypesApi";
import AlertMessage from "../../../components/common/AlertMessage";

const EditPrintTypes = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(quotationTypeInitialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetchPrintTypes();
  }, [id]);

  const fetchPrintTypes = async () => {
    setIsLoading(true);
    try {
      const response = await printTypesApi.show(id);
      const printTypesData = response.data || response;
      setFormData({
        name: printTypesData.name || "",
        base_price: printTypesData.base_price || "",
        description: printTypesData.description || "",
      });
    } catch (error) {
      console.error("Error fetching print types:", error);
      setServerError("Failed to load print types data.");
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

    const validationErrors = validateForm(formData, quotationTypeSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await printTypesApi.update(id, formData);
      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        navigate(`/quotation/settings/print-types`);
      }, 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message || "Failed to update print types.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    fetchPrintTypes();
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  if (isLoading) {
    return (
      <AdminLayout
        pageTitle="Edit Print Types"
        path="/quotation/settings/print-types/edit"
        links={[
          { label: "Home", href: "/" },
          { label: "Quotation Settings", href: "#" },
          {
            label: "Print Types",
            href: "/quotation/settings/print-types",
          },
          { label: "Edit", href: "#" },
        ]}
      >
        <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
          <div className="text-center py-8">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle="Edit Print Types"
      path="/quotation/settings/print-types/edit"
      links={[
        { label: "Home", href: "/" },
        { label: "Quotation Settings", href: "#" },
        {
          label: "Print Types",
          href: "/quotation/settings/print-types",
        },
        { label: "Edit", href: "#" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <AlertMessage
            type="success"
            title="Print Types updated successfully!"
            message="The print types has been updated in the system."
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
          Edit Print Types
        </h1>

        <Input
          label="Print Types Title"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          type="text"
          placeholder="Enter print types name"
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
          placeholder="Enter print types description"
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

export default EditPrintTypes;
