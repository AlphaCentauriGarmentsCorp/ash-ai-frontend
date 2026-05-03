import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import AlertMessage from "../../components/common/AlertMessage";
import { roleApi } from "../../api/roleApi";
import { permissionApi } from "../../api/permissionApi";

const normalizeRows = (response) => {
  const data = response?.data || response || [];
  return Array.isArray(data) ? data : [];
};

const normalizeRole = (response) => response?.data || response || {};

const getRolePermissions = (role) => {
  const permissions = Array.isArray(role?.permissions) ? role.permissions : [];
  const permissionIds = Array.isArray(role?.permission_ids)
    ? role.permission_ids
    : [];

  return [...permissions, ...permissionIds]
    .map((permission) =>
      Number(typeof permission === "object" ? permission?.id : permission),
    )
    .filter((id) => Number.isFinite(id));
};

const getPermissionLabel = (permission) =>
  String(permission?.name || "").trim() || "Permission";

const RolePermissionMatrix = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [savingKey, setSavingKey] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [openRoleId, setOpenRoleId] = useState(null);
  const [searchPermission, setSearchPermission] = useState("");
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setServerError("");

    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        roleApi.index({ per_page: "all" }),
        permissionApi.index({ per_page: "all" }),
      ]);

      const roleRows = normalizeRows(rolesRes);
      const permissionRows = normalizeRows(permissionsRes);

      // Some role list responses omit relations; hydrate each role to keep matrix assignments accurate.
      let hydratedRoles = roleRows;
      try {
        hydratedRoles = await Promise.all(
          roleRows.map(async (role) => {
            if (!role?.id) return role;

            const roleDetails = await roleApi.show(role.id);
            const normalizedRole = normalizeRole(roleDetails);

            return {
              ...role,
              ...normalizedRole,
            };
          }),
        );
      } catch (error) {
        console.warn("Failed to hydrate role permissions from detail endpoint:", error);
      }

      setRoles(hydratedRoles);
      setPermissions(permissionRows);
    } catch (error) {
      console.error("Failed to load matrix data:", error);
      setServerError("Failed to load roles and permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPermissions = useMemo(() => {
    const query = searchPermission.trim().toLowerCase();
    if (!query) return permissions;

    return permissions.filter((permission) => {
      const name = String(permission?.name || "").toLowerCase();
      const description = String(permission?.description || "").toLowerCase();
      return name.includes(query) || description.includes(query);
    });
  }, [permissions, searchPermission]);

  const filteredRoles = useMemo(() => {
    const query = searchRole.trim().toLowerCase();
    if (!query) return roles;

    return roles.filter((role) => {
      const name = String(role?.name || "").toLowerCase();
      const description = String(role?.description || "").toLowerCase();
      return name.includes(query) || description.includes(query);
    });
  }, [roles, searchRole]);

  const getAvailablePermissions = (role) => {
    const assignedIds = new Set(getRolePermissions(role));
    return permissions.filter((permission) => !assignedIds.has(Number(permission.id)));
  };

  const togglePermission = async (roleId, permissionId) => {
    const normalizedPermissionId = Number(permissionId);
    if (!Number.isFinite(normalizedPermissionId)) return;

    const role = roles.find((item) => Number(item.id) === Number(roleId));
    if (!role) return;

    const currentPermissions = getRolePermissions(role);
    const nextPermissionIds = currentPermissions.includes(normalizedPermissionId)
      ? currentPermissions.filter((id) => id !== normalizedPermissionId)
      : [...currentPermissions, normalizedPermissionId];

    const key = `${roleId}-${normalizedPermissionId}`;
    setSavingKey(key);

    setRoles((prev) =>
      prev.map((item) => {
        if (Number(item.id) !== Number(roleId)) return item;

        return {
          ...item,
          permissions: permissions.filter((permission) =>
            nextPermissionIds.includes(Number(permission.id)),
          ),
        };
      }),
    );

    try {
      let roleForUpdate = role;
      try {
        const roleDetails = await roleApi.show(roleId);
        roleForUpdate = {
          ...role,
          ...normalizeRole(roleDetails),
        };
      } catch (error) {
        console.warn("Failed to load latest role details before update:", error);
      }

      await roleApi.update(roleId, {
        name: String(roleForUpdate?.name || "").trim(),
        guard_name: String(roleForUpdate?.guard_name || "web").trim(),
        description: String(roleForUpdate?.description || "").trim(),
        permission_ids: nextPermissionIds,
      });

      const roleDetails = await roleApi.show(roleId);
      const updatedRole = normalizeRole(roleDetails);

      setRoles((prev) =>
        prev.map((item) =>
          Number(item.id) === Number(roleId)
            ? {
                ...item,
                ...updatedRole,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to update role permissions:",
        error,
        error?.response?.data,
      );

      const responseMessage = error?.response?.data?.message;
      const fieldErrors = error?.response?.data?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        const firstError = Object.values(fieldErrors)
          .flat()
          .find((message) => typeof message === "string");
        setServerError(firstError || responseMessage || "Failed to update role permission assignment.");
      } else {
        setServerError(responseMessage || "Failed to update role permission assignment.");
      }

      // Re-sync the matrix with backend source of truth when an update fails.
      await fetchData();
    } finally {
      setSavingKey("");
    }
  };

  const handleRemovePermission = async (roleId, permissionId) => {
    await togglePermission(roleId, permissionId);
  };

  const handleAddPermission = async (roleId, permissionId) => {
    await togglePermission(roleId, permissionId);
    setSearchPermission("");
    setOpenRoleId(roleId);
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Role Permission Matrix">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-gray-600 text-sm font-medium">Loading matrix...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      icon="fa-table"
      pageTitle="Role Permission Matrix"
      path="/admin/rbac/matrix"
      links={[
        { label: "Home", href: "/" },
        { label: "Roles & Permissions", href: "#" },
        { label: "Matrix", href: "#" },
      ]}
    >
      {serverError && (
        <AlertMessage
          type="error"
          title={serverError}
          message="Please try again or refresh the page."
        />
      )}

      <div className="bg-light p-3 lg:p-5 rounded-lg border border-gray-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-primary text-sm font-semibold">Search Roles</label>
            <input
              type="text"
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
              placeholder="Search role..."
              className="text-sm mt-2 border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredRoles.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
              No roles found.
            </div>
          )}

          {filteredRoles.map((role) => {
            const assignedIds = getRolePermissions(role);
            const assignedPermissions = permissions.filter((permission) =>
              assignedIds.includes(Number(permission.id)),
            );
            const availablePermissions = getAvailablePermissions(role).filter(
              (permission) => {
                const query = searchPermission.trim().toLowerCase();
                if (!query) return true;

                const name = String(permission?.name || "").toLowerCase();
                const description = String(permission?.description || "").toLowerCase();
                return name.includes(query) || description.includes(query);
              },
            );
            const isOpen = openRoleId === role.id;

            return (
              <div
                key={role.id}
                className="rounded-xl border border-gray-300 bg-white p-4 lg:p-5 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {role.name || "-"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {role.guard_name || "web"}
                      {role.description ? ` • ${role.description}` : ""}
                    </div>
                  </div>

                  <div className="relative self-start">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
                      onClick={() => {
                        setOpenRoleId(isOpen ? null : role.id);
                        setSearchPermission("");
                      }}
                    >
                      <i className="fa-solid fa-plus text-xs"></i>
                      Add Permission
                    </button>

                    {isOpen && (
                      <div className="absolute right-0 top-full z-20 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
                        <div className="mb-3">
                          <input
                            type="text"
                            value={searchPermission}
                            onChange={(e) => setSearchPermission(e.target.value)}
                            placeholder="Search permissions..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                          />
                        </div>

                        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                          {availablePermissions.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-sm text-gray-500">
                              No permissions available.
                            </div>
                          ) : (
                            availablePermissions.map((permission) => {
                              const permissionId = Number(permission.id);
                              const key = `${role.id}-${permissionId}`;
                              const isSaving = savingKey === key;

                              return (
                                <button
                                  key={permission.id}
                                  type="button"
                                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left transition hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
                                  disabled={isSaving}
                                  onClick={() => handleAddPermission(role.id, permissionId)}
                                >
                                  <div className="text-sm font-medium text-gray-900">
                                    {getPermissionLabel(permission)}
                                  </div>
                                  {permission.description && (
                                    <div className="mt-0.5 text-xs text-gray-500">
                                      {permission.description}
                                    </div>
                                  )}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {assignedPermissions.length === 0 ? (
                    <span className="text-sm text-gray-500">
                      No permissions assigned yet.
                    </span>
                  ) : (
                    assignedPermissions.map((permission) => {
                      const permissionId = Number(permission.id);
                      const key = `${role.id}-${permissionId}`;
                      const isSaving = savingKey === key;

                      return (
                        <span
                          key={permission.id}
                          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary"
                        >
                          <span>{getPermissionLabel(permission)}</span>
                          <button
                            type="button"
                            className="rounded-full p-1 text-primary transition hover:bg-primary hover:text-white disabled:opacity-50"
                            disabled={isSaving}
                            onClick={() => handleRemovePermission(role.id, permissionId)}
                            aria-label={`Remove ${permission.name} from ${role.name}`}
                          >
                            <i className="fa-solid fa-xmark text-[10px]"></i>
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default RolePermissionMatrix;
