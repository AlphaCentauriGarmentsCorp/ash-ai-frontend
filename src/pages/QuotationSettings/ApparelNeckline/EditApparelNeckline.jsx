import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import FormActions from "../../../components/form/FormActions";
import Input from "../../../components/form/Input";
import AlertMessage from "../../../components/common/AlertMessage";
import { apparelNecklineInitialState } from "../../../constants/formInitialState/apparelNecklineInitialState";
import { apparelNecklineSchema } from "../../../validations/apparelNecklineSchema";
import { validateForm, hasErrors } from "../../../utils/validation";
import { apparelNecklineApi } from "../../../api/apparelNecklineApi";

const EditApparelNeckline = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(apparelNecklineInitialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetchApparelNeckline();
  }, []);

  const fetchApparelNeckline = async () => {
    try {
      const response = await apparelNecklineApi.show(id);
      const necklineData = response.data || response;
      setFormData({
        name: necklineData.name || "",
        price: necklineData.price || "",
      });
    } catch (error) {
      setServerError("Failed to load apparel neckline.");
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

    const validationErrors = validateForm(formData, apparelNecklineSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await apparelNecklineApi.update(id, formData);
      setSubmitSuccess(true);

      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        navigate("/quotation/settings/apparel-neckline");
      }, 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message || "Failed to update apparel neckline.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    fetchApparelNeckline();
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Edit Apparel Neckline">
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
      pageTitle="Edit Apparel Neckline"
      path={`/quotation/settings/apparel-neckline/edit/${id}`}
      links={[
        { label: "Home", href: "/" },
        { label: "Quotation Settings", href: "#" },
        { label: "Apparel Neckline", href: "/quotation/settings/apparel-neckline" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <AlertMessage
            type="success"
            title="Apparel Neckline updated successfully!"
            message="The apparel neckline has been updated in the system."
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
          Apparel Neckline Details
        </h1>

        <Input
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          type="text"
          placeholder="Enter apparel neckline name"
          required
        />

        <Input
          label="Price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          error={errors.price}
          type="number"
          placeholder="Enter price"
          min="0"
          step="0.01"
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

export default EditApparelNeckline;
