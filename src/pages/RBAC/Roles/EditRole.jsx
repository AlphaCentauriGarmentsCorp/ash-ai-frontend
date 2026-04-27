import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Input from "../../../components/form/Input";
import Textarea from "../../../components/form/Textarea";
import FormActions from "../../../components/form/FormActions";
import AlertMessage from "../../../components/common/AlertMessage";
import { roleApi } from "../../../api/roleApi";
import { permissionApi } from "../../../api/permissionApi";

const initialState = {
  name: "",
  guard_name: "web",
  description: "",
};

const mapRoleData = (responseData) => {
  const row = responseData?.data || responseData || {};

  return {
    name: row.name || "",
    guard_name: row.guard_name || "web",
    description: row.description || "",
  };
};

const EditRole = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [permissionSearch, setPermissionSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetchPermissions();
    fetchRole();
  }, []);

  const fetchPermissions = async () => {
    setIsLoadingPermissions(true);
    try {
      const response = await permissionApi.index({ per_page: "all" });
      const rows = response?.data || response || [];
      setPermissions(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error("Failed to load permissions:", error);
      setPermissions([]);
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const filteredPermissions = useMemo(() => {
    const query = permissionSearch.trim().toLowerCase();
    if (!query) return permissions;

    return permissions.filter((permission) => {
      const name = String(permission?.name || "").toLowerCase();
      const description = String(permission?.description || "").toLowerCase();
      return name.includes(query) || description.includes(query);
    });
  }, [permissions, permissionSearch]);

  const fetchRole = async () => {
    setIsLoading(true);
    try {
      const response = await roleApi.show(id);
      const row = response?.data || response || {};
      setFormData(mapRoleData(response));

      const rolePermissions = Array.isArray(row.permissions) ? row.permissions : [];
      const nextPermissionIds = rolePermissions
        .map((permission) => Number(permission?.id))
        .filter((permissionId) => Number.isFinite(permissionId));
      setSelectedPermissionIds(nextPermissionIds);
    } catch (error) {
      setServerError("Failed to load role.");
    } finally {
      setIsLoading(false);
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Role name is required.";
    }

    if (!formData.guard_name.trim()) {
      nextErrors.guard_name = "Guard name is required.";
    }

    return nextErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleTogglePermission = (permissionId) => {
    const parsedId = Number(permissionId);

    setSelectedPermissionIds((prev) =>
      prev.includes(parsedId)
        ? prev.filter((id) => id !== parsedId)
        : [...prev, parsedId],
    );
  };

  const handleSelectAllPermissions = () => {
    setSelectedPermissionIds(
      filteredPermissions
        .map((permission) => Number(permission.id))
        .filter((permissionId) => Number.isFinite(permissionId)),
    );
  };

  const handleClearPermissions = () => {
    setSelectedPermissionIds([]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setServerError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await roleApi.update(id, {
        name: formData.name.trim(),
        guard_name: formData.guard_name.trim(),
        description: formData.description.trim(),
        permission_ids: selectedPermissionIds,
      });

      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        navigate("/admin/rbac/roles");
      }, 1200);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(err.response?.data?.message || "Failed to update role.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    fetchRole();
    setPermissionSearch("");
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Edit Role">
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
      icon="fa-user-shield"
      pageTitle="Edit Role"
      path={`/admin/rbac/roles/edit/${id}`}
      links={[
        { label: "Home", href: "/" },
        { label: "Roles & Permissions", href: "#" },
        { label: "Roles", href: "/admin/rbac/roles" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <AlertMessage
            type="success"
            title="Role updated successfully!"
            message="The role has been updated in the system."
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
          Role Details
        </h1>

        <Input
          label="Role Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          type="text"
          placeholder="Enter role name"
          required
        />

        <Input
          label="Guard Name"
          name="guard_name"
          value={formData.guard_name}
          onChange={handleChange}
          error={errors.guard_name}
          type="text"
          placeholder="web"
          required
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          rows={8}
          resizable
          placeholder="Enter role description"
        />

        <div className="mt-5 border border-gray-300 rounded-lg p-4 bg-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div>
              <h2 className="text-primary text-sm font-semibold">Permissions</h2>
              <p className="text-xs text-gray-500 mt-1">
                Update permission assignments for this role.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllPermissions}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                Select Visible
              </button>
              <button
                type="button"
                onClick={handleClearPermissions}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>

          <input
            type="text"
            value={permissionSearch}
            onChange={(e) => setPermissionSearch(e.target.value)}
            placeholder="Search permissions..."
            className="text-sm border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
          />

          {isLoadingPermissions ? (
            <p className="text-sm text-gray-500 mt-3">Loading permissions...</p>
          ) : (
            <div className="mt-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {filteredPermissions.length === 0 && (
                <p className="text-sm text-gray-500">No permissions found.</p>
              )}

              {filteredPermissions.map((permission) => {
                const permissionId = Number(permission.id);

                return (
                  <label
                    key={permission.id}
                    className="flex items-start gap-2 py-1.5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={selectedPermissionIds.includes(permissionId)}
                      onChange={() => handleTogglePermission(permissionId)}
                    />
                    <span>
                      <span className="text-sm font-medium text-gray-800">
                        {permission.name}
                      </span>
                      {permission.description && (
                        <span className="text-xs text-gray-500 block">
                          {permission.description}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
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

export default EditRole;
