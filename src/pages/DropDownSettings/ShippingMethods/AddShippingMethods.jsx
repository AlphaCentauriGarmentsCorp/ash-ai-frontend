import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Textarea from "../../../components/form/Textarea";
import FormActions from "../../../components/form/FormActions";
import Input from "../../../components/form/Input";
import Select from "../../../components/form/Select";
import { shippingMethodsInitialState } from "../../../constants/formInitialState/shippingMethodsInitialState";
import { shippingMethodsSchema } from "../../../validations/shippingMethodsSchema";
import { validateForm, hasErrors } from "../../../utils/validation";
import { shippingMethodsApi } from "../../../api/shippingMethodsApi";
import { courierApi } from "../../../api/courierApi";
import AlertMessage from "../../../components/common/AlertMessage";

const AddShippingMethods = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(shippingMethodsInitialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [courierOptions, setCourierOptions] = useState([]);

  useEffect(() => {
    fetchCouriers();
  }, []);

  const fetchCouriers = async () => {
    try {
      const response = await courierApi.index();
      const couriers = response.data || response;
      const options = couriers.map((courier) => ({
        value: courier.id,
        label: courier.name,
        title: courier.description || courier.name,
      }));
      setCourierOptions(options);
    } catch (error) {
      console.error("Error fetching couriers:", error);
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

    const validationErrors = validateForm(formData, shippingMethodsSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await shippingMethodsApi.create(formData);
      setSubmitSuccess(true);

      setFormData(shippingMethodsInitialState);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
        navigate(`/admin/settings/shipping-methods`);
      }, 1500);
   } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message || "Failed to create shipping method.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(shippingMethodsInitialState);
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Add Shipping Method"
      path="/admin/settings/shipping-methods/new"
      links={[
        { label: "Home", href: "/" },
        { label: "Drop Down Settings", href: "#" },
        { label: "Shipping Methods", href: "/admin/settings/shipping-methods" },
      ]}
    >
      {submitSuccess && (
          <AlertMessage
            type="success"
            title="Shipping Method created successfully!"
            message="The shipping method has been added to the system."
          />
        )}

        {serverError && (
          <AlertMessage
            type="error"
            title={serverError}
            message="Please check the form and try again."
          />
        )}
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium">
              Shipping Method created successfully!
            </p>
          </div>
        )}

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-medium">{serverError}</p>
          </div>
        )}

        <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-2 mb-4">
          Shipping Method Details
        </h1>

        <Select
          label="Courier"
          name="courier_id"
          options={courierOptions}
          value={formData.courier_id || ""}
          onChange={handleChange}
          placeholder="Select courier"
          searchable
          error={errors.courier_id}
          required
        />

        <Input
          label="Shipping Method Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          type="text"
          placeholder="Enter shipping method name"
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
          placeholder="Enter shipping method description"
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

export default AddShippingMethods;
