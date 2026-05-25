import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
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

// Map the EmployeeResource response shape into the flat form state.
const mapAccountToForm = (account) => {
  const details = account.employee_details ?? {};
  const current = account.addresses?.find((a) => a.type === "current") ?? {};
  const permanent =
    account.addresses?.find((a) => a.type === "permanent") ?? {};
  const roles = Array.isArray(account.domain_role)
    ? account.domain_role
    : account.domain_role
      ? [account.domain_role]
      : [];

  return {
    ...AccountInitialState,
    first_name: details.first_name ?? "",
    middle_name: details.middle_name ?? "",
    last_name: details.last_name ?? "",
    username: account.username ?? "",
    password: "", // always blank on load; blank = unchanged
    contact_number: details.contact_number ?? "",
    email: account.email ?? "",
    gender: details.gender ?? "",
    civil_status: details.civil_status ?? "",
    birthdate: details.birthdate ?? "",
    profile: "", // existing avatar kept unless a new file is chosen

    currentStreet: current.street ?? "",
    currentProvince: current.province ?? "",
    currentBarangay: current.brangay ?? "",
    currentCity: current.city ?? "",
    currentPostalCode: current.postal ?? "",

    permanentStreet: permanent.street ?? "",
    permanentProvince: permanent.province ?? "",
    permanentBarangay: permanent.brangay ?? "",
    permanentCity: permanent.city ?? "",
    permanentPostalCode: permanent.postal ?? "",

    position: details.position ?? "",
    department: details.department ?? "",

    pagibig: details.pagibig ?? "",
    sss: details.sss ?? "",
    philhealth: details.philhealth ?? "",
    livesOnSite: false,
    additionalFiles: [],
    roles,
  };
};

export default function EditAccount() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(AccountInitialState);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [existingAvatar, setExistingAvatar] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoading(true);
      try {
        const account = await accountService.getAccount(id);
        if (!active) return;
        setFormData(mapAccountToForm(account));
        setExistingAvatar(account.avatar ?? "");
      } catch (err) {
        if (active) {
          setLoadError(
            err.response?.status === 404
              ? "Account not found."
              : "Failed to load account.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateField(name, type === "checkbox" ? checked : value);
  };

  const handleImageUpload = (file) => {
    updateField("profile", file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
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
    setFormData((prev) => ({ ...prev, roles: updatedRoles }));
    if (errors.roles) setErrors((prev) => ({ ...prev, roles: "" }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setServerError("");
    setSubmitSuccess(false);

    // Password optional on edit: skip its rule when left blank.
    const schema = { ...accountSchema };
    if (!formData.password) delete schema.password;

    const validationErrors = validateForm(formData, schema);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await accountService.updateAccount(id, formData);
      setSubmitSuccess(true);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => navigate("/account/employee"), 800);
    } catch (err) {
      if (err.type === "validation") {
        setErrors(err.errors);
      } else if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        setServerError(err.response.data.message || "Validation failed.");
      } else {
        setServerError("Failed to update account. Please try again.");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Edit Account" path="/account/employee" links={[]}>
        <div className="flex items-center justify-center py-20 text-gray-400">
          <i className="fa-solid fa-spinner fa-spin mr-2"></i>
          Loading account...
        </div>
      </AdminLayout>
    );
  }

  if (loadError) {
    return (
      <AdminLayout pageTitle="Edit Account" path="/account/employee" links={[]}>
        <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
          <i className="fa-solid fa-exclamation-circle text-red-500 mr-3"></i>
          <p className="text-red-800 font-medium">{loadError}</p>
        </div>
      </AdminLayout>
    );
  }

  const shownImage = previewUrl || existingAvatar;

  return (
    <AdminLayout
      pageTitle="Edit Account"
      path="/account/employee"
      links={[
        { label: "Home", href: "/" },
        { label: "Accounts", href: "/account/employee" },
        { label: "Edit", href: "#" },
      ]}
    >
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="bg-light text-red p-3 lg:p-7 rounded-lg border border-gray-300">
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center">
              <i className="fa-solid fa-check-circle text-green-500 mr-3"></i>
              <p className="text-green-800 font-medium">
                Account updated successfully!
              </p>
            </div>
          )}

          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
              <i className="fa-solid fa-exclamation-circle text-red-500 mr-3"></i>
              <p className="text-red-800 font-medium">{serverError}</p>
            </div>
          )}

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
            Edit Account
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 p-4">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-3">
                <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required error={errors.first_name} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Middle Name" name="middle_name" value={formData.middle_name} onChange={handleChange} error={errors.middle_name} />
                  <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required error={errors.last_name} />
                </div>
                <Input label="Username" name="username" value={formData.username} onChange={handleChange} required error={errors.username} />
                <Input label="Password" name="password" type="password" placeholder="Leave blank to keep current password" value={formData.password} onChange={handleChange} error={errors.password} />
                <Input label="Contact Number" name="contact_number" value={formData.contact_number} onChange={handleChange} required error={errors.contact_number} />
                <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required error={errors.email} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select label="Gender" name="gender" options={genderOptions} value={formData.gender} onChange={handleChange} placeholder="Select gender" required error={errors.gender} />
                  <Select label="Civil Status" name="civil_status" options={civilStatusOptions} value={formData.civil_status} onChange={handleChange} placeholder="Select civil status" required error={errors.civil_status} />
                </div>
                <Input label="Birthdate" name="birthdate" type="date" value={formData.birthdate} onChange={handleChange} required error={errors.birthdate} />
                <ImageUpload label="Profile Image" name="profile" accept="image/jpeg,image/png" maxSize={2 * 1024 * 1024} onChange={handleImageUpload} />
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-200 bg-white rounded-lg min-h-50 w-full overflow-hidden">
              {shownImage ? (
                <img src={shownImage} alt="Preview" className="w-full h-full min-h-50 object-cover" />
              ) : (
                <div className="w-full h-full min-h-50 flex flex-col items-center justify-center">
                  <i className="fa-solid fa-cloud-arrow-up text-3xl text-gray-300 mb-3"></i>
                  <p className="text-gray-400 text-sm">No image selected</p>
                </div>
              )}
            </div>
          </div>

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
            Current Address
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 p-4">
            <Input label="Street" name="currentStreet" value={formData.currentStreet} onChange={handleChange} error={errors.currentStreet} className="md:col-span-2 lg:col-span-4" />
            <Input label="Province" name="currentProvince" value={formData.currentProvince} onChange={handleChange} error={errors.currentProvince} />
            <Input label="Barangay" name="currentBarangay" value={formData.currentBarangay} onChange={handleChange} error={errors.currentBarangay} />
            <Input label="City" name="currentCity" value={formData.currentCity} onChange={handleChange} error={errors.currentCity} />
            <Input label="Postal Code" name="currentPostalCode" value={formData.currentPostalCode} onChange={handleChange} error={errors.currentPostalCode} />
          </div>

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
            Permanent Address
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 p-4">
            <Input label="Street" name="permanentStreet" value={formData.permanentStreet} onChange={handleChange} error={errors.permanentStreet} className="md:col-span-2 lg:col-span-4" />
            <Input label="Province" name="permanentProvince" value={formData.permanentProvince} onChange={handleChange} error={errors.permanentProvince} />
            <Input label="Barangay" name="permanentBarangay" value={formData.permanentBarangay} onChange={handleChange} error={errors.permanentBarangay} />
            <Input label="City" name="permanentCity" value={formData.permanentCity} onChange={handleChange} error={errors.permanentCity} />
            <Input label="Postal Code" name="permanentPostalCode" value={formData.permanentPostalCode} onChange={handleChange} error={errors.permanentPostalCode} />
          </div>

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
            Job Position and Roles
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4">
            <Input label="Job Position" name="position" value={formData.position} onChange={handleChange} required error={errors.position} />
            <Input label="Department" name="department" value={formData.department} onChange={handleChange} required error={errors.department} />
          </div>
          <div className="mx-4 mb-5">
            <h1 className="text-primary text-sm font-semibold flex items-center mb-3">
              Role Access<span className="text-red-500 ml-1">*</span>
            </h1>
            {errors.roles && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md flex items-center">
                <i className="fa-solid fa-exclamation-circle text-red-500 mr-2"></i>
                <p className="text-red-700 text-sm">{errors.roles}</p>
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
            <Input label="Pag-ibig No." name="pagibig" value={formData.pagibig} onChange={handleChange} error={errors.pagibig} />
            <Input label="SSS No." name="sss" value={formData.sss} onChange={handleChange} error={errors.sss} />
            <Input label="Philhealth No." name="philhealth" value={formData.philhealth} onChange={handleChange} error={errors.philhealth} />
          </div>
        </div>

        <FormActions
          onSubmit={handleSubmit}
          onCancel={() => navigate("/account/employee")}
          showReset={false}
          showCancel={true}
          isSubmitting={isSubmitting}
          submitText="Save Changes"
          submittingText="Saving..."
        />
      </form>
    </AdminLayout>
  );
}
