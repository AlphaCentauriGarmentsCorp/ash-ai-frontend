import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Input from "../../components/form/Input";
import ImageUpload from "../../components/form/ImageUpload";
import Textarea from "../../components/form/Textarea";
import FormActions from "../../components/form/FormActions";
import Select from "../../components/form/Select";
import { clientApi } from "../../api/clientApi";
import { useParams, useNavigate } from "react-router-dom";
import {
  courierList,
  shippingMethodList,
} from "../../constants/formOptions/orderOptions";
import { clientInitialState } from "../../constants/formInitialState/clientInitialState";
import { clientSchema } from "../../validations/clientSchema";
import { validateForm, hasErrors } from "../../utils/validation";

export default function EditClient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [formData, setFormData] = useState({
    ...clientInitialState,
    brands: [{ name: "", logo: null, existingLogo: null }],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const parseAddress = (addressString) => {
    if (!addressString)
      return { street: "", barangay: "", city: "", province: "", postal: "" };
    const parts = addressString.split(",").map((part) => part.trim());
    return {
      street: parts[0] || "",
      barangay: parts[1] || "",
      city: parts[2] || "",
      province: parts[3] || "",
      postal: parts[4] || "",
    };
  };

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const response = await clientApi.show(id);
      const client = response.data;

      const nameParts = client.name ? client.name.split(" ") : ["", ""];
      const address = parseAddress(client.address);

      setFormData({
        first_name: nameParts[0] || "",
        last_name: nameParts.slice(1).join(" ") || "",
        email: client.email || "",
        contact_number: client.contact_number || "",
        courier: client.courier || "",
        method: client.method || "",
        street_address: address.street,
        barangay: address.barangay,
        city: address.city,
        province: address.province,
        postal_code: address.postal,
        notes: client.notes || "",
        brands: client.brands?.map((brand) => ({
          id: brand.id,
          name: brand.name,
          logo: null, // Don't set logo as string
          existingLogo: brand.logo, // Store URL separately
        })) || [{ name: "", logo: null, existingLogo: null }],
      });
    } catch (err) {
      setFetchError("Failed to load client data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const handleBrandChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedBrands = [...prev.brands];
      updatedBrands[index] = { ...updatedBrands[index], [field]: value };
      return { ...prev, brands: updatedBrands };
    });
    if (errors[`brands.${index}.${field}`]) {
      setErrors((prev) => ({ ...prev, [`brands.${index}.${field}`]: "" }));
    }
  };

  const handleBrandLogoUpload = (index, file) => {
    setFormData((prev) => {
      const updatedBrands = [...prev.brands];
      updatedBrands[index] = {
        ...updatedBrands[index],
        logo: file, // Will be File object or null
        // Keep existingLogo for reference
      };
      return { ...prev, brands: updatedBrands };
    });
  };

  const addBrand = () => {
    setFormData((prev) => ({
      ...prev,
      brands: [...prev.brands, { name: "", logo: null, existingLogo: null }],
    }));
  };

  const removeBrand = (index) => {
    if (formData.brands.length === 1) {
      handleBrandChange(index, "name", "");
      handleBrandLogoUpload(index, null);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      brands: prev.brands.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setServerError("");

    const validationErrors = validateForm(formData, clientSchema);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const filteredBrands = formData.brands.filter(
        (brand) => brand.name?.trim() !== "",
      );

      const submitData = {
        ...formData,
        brands: filteredBrands,
      };

      await clientApi.update(id, submitData);

      setSubmitSuccess(true);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => navigate(`/clients/view/${id}`), 1500);
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Failed to update client",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => fetchClientData();

  if (loading) {
    return (
      <AdminLayout
        icon="fa-user"
        pageTitle="Edit Client"
        path="/"
        links={[
          { label: "Home", href: "/" },
          { label: "Clients", href: "/clients" },
          { label: "Edit", href: "#" },
        ]}
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-secondary mb-4"></i>
            <p className="text-gray-600">Loading client data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (fetchError) {
    return (
      <AdminLayout
        icon="fa-user"
        pageTitle="Edit Client"
        path="/"
        links={[
          { label: "Home", href: "/" },
          { label: "Clients", href: "/clients" },
          { label: "Edit", href: "#" },
        ]}
      >
        <div className="bg-light p-7 rounded-lg border border-gray-300">
          <div className="text-center py-8">
            <i className="fa-solid fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
            <p className="text-gray-700 mb-4">{fetchError}</p>
            <button
              onClick={() => navigate("/clients")}
              className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors inline-flex items-center"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i> Back to Clients
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      icon="fa-user"
      pageTitle="Edit Client"
      path="/"
      links={[
        { label: "Home", href: "/" },
        { label: "Clients", href: "/clients" },
        { label: formData.first_name || "Edit", href: "#" },
      ]}
    >
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <i className="fa-solid fa-check-circle text-green-500 mr-3"></i>
                <div>
                  <p className="text-green-800 font-medium">
                    Client updated successfully!
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Redirecting to client details...
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

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
            Client Information
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-7 p-4">
            <Input
              label="First Name"
              name="first_name"
              placeholder="Enter first name"
              value={formData.first_name}
              onChange={handleChange}
              required
              error={errors.first_name}
              type="text"
            />
            <Input
              label="Last Name"
              name="last_name"
              placeholder="Enter last name"
              value={formData.last_name}
              onChange={handleChange}
              required
              error={errors.last_name}
              type="text"
            />
            <Input
              label="Email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
              error={errors.email}
              type="email"
            />
            <Input
              label="Contact Number"
              name="contact_number"
              placeholder="Enter contact number"
              value={formData.contact_number}
              onChange={handleChange}
              required
              error={errors.contact_number}
              type="text"
            />
          </div>

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1 mb-4">
            Clothing/Company Brands
          </h1>

          {errors.brands && (
            <div className="px-4 mb-4">
              <p className="text-sm text-red-600">{errors.brands}</p>
            </div>
          )}

          {formData.brands.map((brand, index) => (
            <div key={brand.id || index} className="px-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Input
                    label={`Brand Name ${index + 1}`}
                    name={`brandName_${index}`}
                    placeholder="Enter brand name"
                    value={brand.name}
                    onChange={(e) =>
                      handleBrandChange(index, "name", e.target.value)
                    }
                    required={index === 0}
                    error={errors[`brands.${index}.name`]}
                    type="text"
                  />
                  {index === 0 && formData.brands.length > 1 && (
                    <p className="text-gray-500 text-xs pb-3">
                      Additional Brands
                    </p>
                  )}
                </div>

                <div className="lg:col-span-1">
                  <div className="flex">
                    <div className="w-full">
                      <ImageUpload
                        label="Logo (Optional)"
                        name={`logo_${index}`}
                        accept="image/jpeg,image/png"
                        maxSize={2 * 1024 * 1024}
                        onChange={(file) => handleBrandLogoUpload(index, file)}
                      />
                    </div>
                    {index > 0 && (
                      <div className="mt-4 flex justify-end flex-1">
                        <button
                          type="button"
                          onClick={() => removeBrand(index)}
                          className="px-3 py-1 text-sm transition-colors"
                          title="Remove brand"
                        >
                          <i className="fa-solid fa-circle-minus text-red-600 text-xl"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="p-4">
            <button
              type="button"
              onClick={addBrand}
              className="px-4 py-2 flex items-center justify-center text-white rounded-lg border bg-secondary border-gray-300 hover:bg-secondary/90 transition-colors"
            >
              <i className="fa-solid fa-plus text-sm mr-2"></i> Add Another
              Brand
            </button>
            <p className="text-xs text-gray-500 mt-2">
              You can add multiple brands for this client. Only the first brand
              is required.
            </p>
          </div>

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1 mb-4">
            Address
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-7 px-2 sm:px-3 md:px-4">
            <div className="col-span-1 sm:col-span-1 lg:col-span-2">
              <Select
                label="Preferred Courier"
                name="courier"
                options={courierList}
                value={formData.courier}
                onChange={handleChange}
                placeholder="Select courier"
                searchable
                error={errors.courier}
              />
            </div>
            <div className="col-span-1 sm:col-span-1 lg:col-span-2">
              <Select
                label="Shipping Method"
                name="method"
                options={shippingMethodList}
                value={formData.method}
                onChange={handleChange}
                placeholder="Select shipping method"
                searchable
                error={errors.method}
              />
            </div>
            <div className="col-span-1 sm:col-span-2 lg:col-span-4">
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

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-x-7 px-4 mt-4">
            <Textarea
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={6}
              resizable={true}
            />
          </div>
        </div>

        <FormActions
          onSubmit={handleSubmit}
          onReset={handleReset}
          isSubmitting={isSubmitting}
          submitText="Update Client"
          resetText="Reset Changes"
          submittingText="Updating Client..."
        />
      </form>
    </AdminLayout>
  );
}
