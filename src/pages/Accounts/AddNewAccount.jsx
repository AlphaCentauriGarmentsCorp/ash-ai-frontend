import React, { useState } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import FileUpload from "../../components/form/FileUpload";
import ImageUpload from "../../components/form/ImageUpload";
import FormActions from "../../components/form/FormActions";

import { AccountInitialState } from "../../constants/formInitialState/accountInitialState";
import {
  genderOptions,
  civilStatusOptions,
  RoleAccess,
} from "../../constants/formOptions/accountOptions";
import { accountSchema } from "../../validations/accountSchema";
import { validateForm, hasErrors } from "../../utils/validation";
import { accountService } from "../../services/accountService";

export default function AddNewAccount() {
  const [formData, setFormData] = useState(AccountInitialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleFileChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special handling for livesOnSite checkbox
    if (name === "livesOnSite") {
      handleLivesOnSiteChange(checked);
    } else {
      const fieldValue = type === "checkbox" ? checked : value;
      updateField(name, fieldValue);
    }
  };

  const handleLivesOnSiteChange = (checked) => {
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        livesOnSite: checked,
      };

      if (checked) {
        updatedData.currentStreet = "Mother Ignacia Ave";
        updatedData.currentProvince = "Metro Manila";
        updatedData.currentBarangay = "Diliman";
        updatedData.currentCity = "Quezon City";
        updatedData.currentPostalCode = "1101";

        // Clear any errors for current address fields
        Object.keys(errors).forEach((key) => {
          if (key.startsWith("current")) {
            setErrors((prevErrors) => ({ ...prevErrors, [key]: "" }));
          }
        });
      }

      return updatedData;
    });
  };

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear server error when any field changes
    if (serverError) {
      setServerError("");
    }
  };

  const handleSubmit = async (e) => {
    setIsSubmitting(true);
    setServerError("");
    setSubmitSuccess(false);
    const validationErrors = validateForm(formData, accountSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);

      // Scroll to top when validation errors exist
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await accountService.createAccount(formData);
      setSubmitSuccess(true);
      setErrors({});

      window.scrollTo({ top: 0, behavior: "smooth" });
      window.location.href = "/account/employee";
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

  // Handle form reset
  const handleReset = () => {
    setFormData(AccountInitialState);
    setErrors({});
    setServerError("");
    setSubmitSuccess(false);
  };

  const handleImageUpload = (file) => {
    setSelectedImage(file);

    updateField("profile", file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl("");
    }
  };

  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    const currentRoles = Array.isArray(formData.roles) ? formData.roles : [];

    const updatedRoles = checked
      ? [...currentRoles, value]
      : currentRoles.filter((role) => role !== value);

    setFormData((prev) => ({
      ...prev,
      roles: updatedRoles,
    }));

    if (errors.roles) {
      setErrors((prev) => ({ ...prev, roles: "" }));
    }
  };

  return (
    <AdminLayout
      pageTitle="Add Accounts"
      path="/account/employee"
      links={[
        { label: "Home", href: "/" },
        { label: "Accounts", href: "/admin/accounts" },
      ]}
    >
      <form onSubmit={handleSubmit}>
        <div className="bg-light text-red p-3 lg:p-7 rounded-lg border border-gray-300">
          {/* Success Message */}

          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <i className="fa-solid fa-check-circle text-green-500 mr-3"></i>
                <div>
                  <p className="text-green-800 font-medium">
                    Account created successfully!
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    The new account has been added to the system.
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

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
            Add New Account
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 p-4">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-3">
                <Input
                  label="First Name"
                  name="first_name"
                  placeholder="Enter your first name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  error={errors.first_name}
                  type="text"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Middle Name"
                    name="middle_name"
                    placeholder="Enter middle name"
                    value={formData.middle_name}
                    onChange={handleChange}
                    error={errors.middle_name}
                  />

                  <Input
                    label="Last Name"
                    name="last_name"
                    placeholder="Enter your last name"
                    value={formData.last_name}
                    onChange={handleChange}
                    error={errors.last_name}
                    required
                  />
                </div>

                <Input
                  label="Username"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  required
                />

                <Input
                  label="Password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  type="password"
                  error={errors.password}
                />

                <Input
                  label="Contact Number"
                  name="contact_number"
                  placeholder="Enter contact number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  required
                  error={errors.contact_number}
                />

                <Input
                  label="Email Address"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  type="email"
                  error={errors.email}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Gender"
                    name="gender"
                    options={genderOptions}
                    value={formData.gender}
                    onChange={handleChange}
                    placeholder="Select gender"
                    required
                    error={errors.gender}
                  />
                  <Select
                    label="Civil Status"
                    name="civil_status"
                    options={civilStatusOptions}
                    value={formData.civil_status}
                    onChange={handleChange}
                    placeholder="Select civil status"
                    required
                    error={errors.civil_status}
                  />
                </div>

                <Input
                  label="Birthdate"
                  name="birthdate"
                  placeholder="Select birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  required
                  type="date"
                  error={errors.birthdate}
                />

                <ImageUpload
                  label="Profile Image"
                  name="profile"
                  accept="image/jpeg,image/png"
                  maxSize={2 * 1024 * 1024}
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-200 bg-white rounded-lg min-h-50 w-full overflow-hidden">
              {previewUrl ? (
                <div className="w-full h-full min-h-50 relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* File info overlay */}
                  {selectedImage && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 text-xs">
                      <p className="font-medium truncate">
                        {selectedImage.name}
                      </p>
                      <p className="text-gray-300">
                        {(selectedImage.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full min-h-50 flex flex-col items-center justify-center">
                  <i className="fa-solid fa-cloud-arrow-up text-3xl text-gray-300 mb-3"></i>
                  <p className="text-gray-400 text-sm">No image selected</p>
                  <p className="text-gray-300 text-xs mt-1">
                    Upload an image to see preview
                  </p>
                </div>
              )}
            </div>
          </div>

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
            Address
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 p-4">
            <div className="md:col-span-2 lg:col-span-4">
              <div className="flex justify-between">
                <h2 className="text-primary/55 text-xs mb-3">
                  Current Address
                </h2>
                <div className="flex justify-center items-center gap-3">
                  <input
                    type="checkbox"
                    name="livesOnSite"
                    id="livesOnSite"
                    checked={formData.livesOnSite}
                    onChange={handleChange}
                  />
                  <label
                    htmlFor="livesOnSite"
                    className="text-primary/55 text-xs"
                  >
                    Lives On-Site
                  </label>
                </div>
              </div>
              <Input
                label="Street"
                name="currentStreet"
                placeholder="Enter street address"
                value={formData.currentStreet}
                onChange={handleChange}
                required={!formData.livesOnSite}
                error={errors.currentStreet}
                disabled={formData.livesOnSite}
              />
            </div>

            <Input
              label="Province"
              name="currentProvince"
              placeholder="Enter province"
              value={formData.currentProvince}
              onChange={handleChange}
              required={!formData.livesOnSite}
              error={errors.currentProvince}
              disabled={formData.livesOnSite}
            />

            <Input
              label="Barangay"
              name="currentBarangay"
              placeholder="Enter barangay"
              value={formData.currentBarangay}
              onChange={handleChange}
              required={!formData.livesOnSite}
              error={errors.currentBarangay}
              disabled={formData.livesOnSite}
            />

            <Input
              label="City"
              name="currentCity"
              placeholder="Enter city"
              value={formData.currentCity}
              onChange={handleChange}
              required={!formData.livesOnSite}
              error={errors.currentCity}
              disabled={formData.livesOnSite}
            />

            <Input
              label="Postal Code"
              name="currentPostalCode"
              placeholder="Enter postal code"
              value={formData.currentPostalCode}
              onChange={handleChange}
              required={!formData.livesOnSite}
              error={errors.currentPostalCode}
              disabled={formData.livesOnSite}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 p-4">
            <div className="md:col-span-2 lg:col-span-4">
              <h2 className="text-primary/55 text-xs mb-3">
                Permanent Address
              </h2>
              <Input
                label="Street"
                name="permanentStreet"
                placeholder="Enter street address"
                value={formData.permanentStreet}
                onChange={handleChange}
                required
                error={errors.permanentStreet}
              />
            </div>

            <Input
              label="Province"
              name="permanentProvince"
              placeholder="Enter province"
              value={formData.permanentProvince}
              onChange={handleChange}
              required
              error={errors.permanentProvince}
            />

            <Input
              label="Barangay"
              name="permanentBarangay"
              placeholder="Enter barangay"
              value={formData.permanentBarangay}
              onChange={handleChange}
              required
              error={errors.permanentBarangay}
            />

            <Input
              label="City"
              name="permanentCity"
              placeholder="Enter city"
              value={formData.permanentCity}
              onChange={handleChange}
              required
              error={errors.permanentCity}
            />

            <Input
              label="Postal Code"
              name="permanentPostalCode"
              placeholder="Enter postal code"
              value={formData.permanentPostalCode}
              onChange={handleChange}
              required
              error={errors.permanentPostalCode}
            />
          </div>

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
            Job Position and Roles
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4">
            <Input
              label="Job Position"
              name="position"
              placeholder="Enter job position"
              value={formData.position}
              onChange={handleChange}
              required
              error={errors.position}
            />
            <Input
              label="Department"
              name="department"
              placeholder="Enter department"
              value={formData.department}
              onChange={handleChange}
              required
              error={errors.department}
            />
          </div>
          <div className="mx-4 mb-5">
            <h1 className="text-primary text-sm font-semibold flex items-center mb-3">
              Role Access<span className="text-red-500 ml-1">*</span>
            </h1>

            {errors.roles && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <i className="fa-solid fa-exclamation-circle text-red-500 mr-2"></i>
                  <p className="text-red-700 text-sm">{errors.roles}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-7 px-4 sm:px-6 md:px-8 lg:px-20 bg-white border border-gray-300 rounded">
              {RoleAccess.map((role) => (
                <div key={role.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="roles"
                    id={role.value}
                    value={role.value}
                    onChange={handleRoleChange}
                    checked={formData.roles?.includes(role.value) || false}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor={role.value} className="text-sm text-gray-700">
                    {role.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
            Documents
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-4">
            <Input
              label="Pag-ibig No."
              name="pagibig"
              placeholder="Enter Pag-ibig number"
              value={formData.pagibig}
              onChange={handleChange}
              required
              error={errors.pagibig}
            />

            <Input
              label="SSS No."
              name="sss"
              placeholder="Enter SSS number"
              value={formData.sss}
              onChange={handleChange}
              required
              error={errors.sss}
            />

            <Input
              label="Philhealth No."
              name="philhealth"
              placeholder="Enter Philhealth number"
              value={formData.philhealth}
              onChange={handleChange}
              required
              error={errors.philhealth}
            />
          </div>

          <div className="px-4 lg:px-25">
            <FileUpload
              label="Additional Files"
              name="additionalFiles"
              value={formData.additionalFiles}
              onChange={handleFileChange}
              acceptedTypes="image/*,.ai,.psd,.pdf,.png,.jpg,.jpeg"
              maxSize={25 * 1024 * 1024}
              multiple={true}
              error={errors.additionalFiles}
            />
          </div>
        </div>
        {/* Submit Button */}
        <FormActions
          onSubmit={handleSubmit}
          onReset={handleReset}
          isSubmitting={isSubmitting}
          submitText="Save"
          resetText="Reset"
          submittingText="Creating Account..."
        />
      </form>
    </AdminLayout>
  );
}
