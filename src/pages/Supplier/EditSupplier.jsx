import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Textarea from "../../components/form/Textarea";
import FormActions from "../../components/form/FormActions";
import Input from "../../components/form/Input";
import { supplierInitialState } from "../../constants/formInitialState/supplierInitialState";
import { supplierSchema } from "../../validations/supplierSchema";
import { validateForm, hasErrors } from "../../utils/validation";
import { supplierApi } from "../../api/supplierApi";
import Loader from "../../components/common/Loader";

const EditSupplier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(supplierInitialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchSupplier();
  }, []);

  const fetchSupplier = async () => {
    try {
      const response = await supplierApi.show(id);
      setFormData(response.data);
    } catch (error) {
      setServerError("Failed to load supplier.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setServerError("");

    const validationErrors = validateForm(formData, supplierSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await supplierApi.update(id, formData);
      setSubmitSuccess(true);

      setFormData(supplierInitialState);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        navigate(`/supplier`);
      }, 1500);
    } catch {
      setServerError("Failed to create supplier.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(supplierInitialState);
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  if (isLoading) {
    return (
      <Loader
        pageTitle="Edit Supplier"
        links={[
          { label: "Home", href: "/" },
          { label: "Suppliers", href: "/supplier" },
        ]}
      />
    );
  }

  return (
    <AdminLayout
      pageTitle="Edit Supplier"
      links={[
        { label: "Home", href: "/" },
        { label: "Suppliers", href: "/supplier" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <i className="fa-solid fa-check-circle text-green-500 mr-3"></i>
              <div>
                <p className="text-green-800 font-medium">
                  Supplier updated successfully!
                </p>
                <p className="text-green-600 text-sm mt-1">
                  The Supplier has been updated in system.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Server Error Message */}
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
          Supplier Details
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-15 px-7">
          <Input
            label="Code Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            type="text"
            placeholder="Enter supplier code name"
            required
          />

          <Input
            label="Contact Person"
            name="contact_person"
            value={formData.contact_person}
            onChange={handleChange}
            error={errors.contact_person}
            type="text"
            placeholder="Enter contact person"
            required
          />

          <Input
            label="Contact Number"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            error={errors.contact_number}
            type="text"
            placeholder="Enter contact number"
            required
          />

          <Input
            label="Email Address"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            type="email"
            placeholder="Enter email address"
          />
        </div>

        <h1 className="font-semibold text-xl border-b text-primary border-gray-300 mt-7 pb-2 mb-4">
          Supplier Address
        </h1>

        <div className="px-7">
          <Input
            label="Street Address"
            name="street_address"
            placeholder="Enter Street Address"
            value={formData.street_address}
            onChange={handleChange}
            error={errors.street_address}
            type="text"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-5 px-7">
          <Input
            label="Barangay"
            name="barangay"
            placeholder="Enter barangay"
            value={formData.barangay}
            onChange={handleChange}
            error={errors.barangay}
            type="text"
          />

          <Input
            label="City"
            name="city"
            placeholder="Enter city"
            value={formData.city}
            onChange={handleChange}
            error={errors.city}
            type="text"
          />

          <Input
            label="Province"
            name="province"
            placeholder="Enter province"
            value={formData.province}
            onChange={handleChange}
            error={errors.province}
            type="text"
          />

          <Input
            label="Postal Code"
            name="postal_code"
            placeholder="Enter postal code"
            value={formData.postal_code}
            onChange={handleChange}
            error={errors.postal_code}
            type="text"
          />
        </div>

        <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-2 mb-4 mt-7">
          Notes
        </h1>

        <div className="px-7">
          <Textarea
            label="Notes"
            name="notes"
            value={formData.notes}
            error={errors.notes}
            onChange={handleChange}
            rows={10}
            resizable
            required
            placeholder="Enter supplier notes"
          />
        </div>
      </div>

      <FormActions
        onSubmit={handleSubmit}
        onReset={handleReset}
        isSubmitting={isSubmitting}
        submitText="Save"
        resetText="Reset"
        submittingText="Updating..."
      />
    </AdminLayout>
  );
};

export default EditSupplier;
