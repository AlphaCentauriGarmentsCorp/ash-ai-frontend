import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Textarea from "../../../components/form/Textarea";
import FormActions from "../../../components/form/FormActions";
import Input from "../../../components/form/Input";
import { quotationTypeInitialState } from "../../../constants/formInitialState/quotationTypeInitialState";
import { quotationTypeSchema } from "../../../validations/quotationTypeSchema";
import { validateForm, hasErrors } from "../../../utils/validation";
import { tshirtNecklineApi } from "../../../api/tshirtNecklineApi";
import AlertMessage from "../../../components/common/AlertMessage";

const EditTshirtNeckline = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(quotationTypeInitialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetchTshirtNeckline();
  }, [id]);

  const fetchTshirtNeckline = async () => {
    setIsLoading(true);
    try {
      const response = await tshirtNecklineApi.show(id);
      const tshirtNecklineData = response.data || response;
      setFormData({
        name: tshirtNecklineData.name || "",
        base_price: tshirtNecklineData.base_price || "",
        description: tshirtNecklineData.description || "",
      });
    } catch (error) {
      console.error("Error fetching tshirt neckline:", error);
      setServerError("Failed to load tshirt neckline data.");
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
      await tshirtNecklineApi.update(id, formData);
      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        navigate(`/quotation/settings/tshirt-neckline`);
      }, 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message || "Failed to update tshirt neckline.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    fetchTshirtNeckline();
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  if (isLoading) {
    return (
      <AdminLayout
        pageTitle="Edit Tshirt Neckline"
        path="/quotation/settings/tshirt-neckline/edit"
        links={[
          { label: "Home", href: "/" },
          { label: "Quotation Settings", href: "#" },
          {
            label: "Tshirt Neckline",
            href: "/quotation/settings/tshirt-neckline",
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
      pageTitle="Edit Tshirt Neckline"
      path="/quotation/settings/tshirt-neckline/edit"
      links={[
        { label: "Home", href: "/" },
        { label: "Quotation Settings", href: "#" },
        {
          label: "Tshirt Neckline",
          href: "/quotation/settings/tshirt-neckline",
        },
        { label: "Edit", href: "#" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <AlertMessage
            type="success"
            title="Tshirt Neckline updated successfully!"
            message="The tshirt neckline has been updated in the system."
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
          Edit Tshirt Neckline
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
        submitText="Update"
        resetText="Reset"
        submittingText="Updating..."
      />
    </AdminLayout>
  );
};

export default EditTshirtNeckline;
