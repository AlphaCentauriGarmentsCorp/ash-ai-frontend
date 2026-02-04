import React, { useState } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Input from "../../components/form/Input";
import ImageUpload from "../../components/form/ImageUpload";
import Textarea from "../../components/form/Textarea";
import { clientInitialState } from "../../constants/formInitialState/clientInitialState";
import { clientSchema } from "../../validations/clientSchema";
import { validateForm, hasErrors } from "../../utils/validation";
import { clientService } from "../../services/clientService";

export default function AddNewClient() {
  const [formData, setFormData] = useState({
    ...clientInitialState,
    brands: [{ name: "", logo: null }],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [previewUrls, setPreviewUrls] = useState([""]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    updateField(name, fieldValue);
  };

  const handleBrandChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedBrands = [...prev.brands];
      updatedBrands[index] = {
        ...updatedBrands[index],
        [field]: value,
      };
      return { ...prev, brands: updatedBrands };
    });

    // Clear brand errors if any
    if (errors[`brands.${index}.${field}`]) {
      setErrors((prev) => ({ ...prev, [`brands.${index}.${field}`]: "" }));
    }
  };

  const handleBrandLogoUpload = (index, file) => {
    setFormData((prev) => {
      const updatedBrands = [...prev.brands];
      updatedBrands[index] = {
        ...updatedBrands[index],
        logo: file,
      };
      return { ...prev, brands: updatedBrands };
    });
  };

  const addBrand = () => {
    setFormData((prev) => ({
      ...prev,
      brands: [...prev.brands, { name: "", logo: null }],
    }));
    setPreviewUrls((prev) => [...prev, ""]);
  };

  const removeBrand = (index) => {
    if (formData.brands.length === 1) {
      // Don't remove the last one, just clear it
      handleBrandChange(index, "name", "");
      handleBrandLogoUpload(index, null);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      brands: prev.brands.filter((_, i) => i !== index),
    }));

    const updatedPreviews = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(updatedPreviews);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setServerError("");
    setSubmitSuccess(false);

    const validationErrors = validateForm(formData, clientSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const filteredBrands = formData.brands.filter(
        (brand) => brand.name.trim() !== "",
      );
      const submitData = {
        ...formData,
        brands: filteredBrands.length > 0 ? filteredBrands : [],
      };

      await clientService.createClient(submitData);

      setSubmitSuccess(true);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Data:", err.response.data);
      } else {
        console.log("Error message:", err.message);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      ...AccountInitialState,
      brands: [{ name: "", logo: null }],
    });
    setErrors({});
    setServerError("");
    setSubmitSuccess(false);
    setPreviewUrls([""]);
  };

  return (
    <AdminLayout
      icon="fa-user"
      pageTitle="Add Clients"
      path="/"
      links={[
        { label: "Home", href: "/" },
        { label: "Clients", href: "/clients" },
      ]}
    >
      <form onSubmit={handleSubmit}>
        <div className="bg-light text-red p-3 lg:p-7 rounded-lg border border-gray-300">
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <i className="fa-solid fa-check-circle text-green-500 mr-3"></i>
                <div>
                  <p className="text-green-800 font-medium">
                    Client created successfully!
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    The new client has been added to the system.
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
              type="number"
            />
          </div>

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1 mb-4">
            Clothing/Company
          </h1>
          {formData.brands.map((brand, index) => (
            <div key={index} className="px-4  ">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
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
                    <h1 className="text-gray-500 text-xs pb-3">
                      Additional Brands
                    </h1>
                  )}
                </div>

                <div className="lg:col-span-1">
                  <div className="flex ">
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
                          className="px-3 py-1 text-sm  transition-colors"
                        >
                          <i className="fa-solid fa-circle-minus text-red-600"></i>
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
              <i className="fa-solid fa-plus text-sm mr-2"></i>
              Add Another Brand
            </button>
            <p className="text-xs text-gray-500 mt-2">
              You can add multiple brands for this client. Only the first brand
              is required.
            </p>
          </div>

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1 mb-4">
            Address
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-7 px-4">
            <Input
              label="Street Address"
              name="street_address"
              placeholder="Enter Street Address"
              value={formData.street_address}
              onChange={handleChange}
              required
              error={errors.street_address}
              type="text"
            />

            <Input
              label="City"
              name="city"
              placeholder="Enter city"
              value={formData.city}
              onChange={handleChange}
              required
              error={errors.city}
              type="text"
            />

            <Input
              label="Province"
              name="province"
              placeholder="Enter province"
              value={formData.province}
              onChange={handleChange}
              required
              error={errors.province}
              type="text"
            />

            <Input
              label="Postal Code"
              name="postal_code"
              placeholder="Enter postal code"
              value={formData.postal_code}
              onChange={handleChange}
              required
              error={errors.postal_code}
              type="text"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-x-7 px-4">
            <Textarea
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={6}
              resizable={true}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-300">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Creating Client...
                </>
              ) : (
                "Create Client"
              )}
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
