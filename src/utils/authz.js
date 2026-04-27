const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
};

const extractName = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    return String(value.name || value.slug || value.code || value.id || "");
  }
  return String(value || "");
};

const normalizePermissionEntries = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  if (Array.isArray(value.data)) return value.data;
  if (Array.isArray(value.permissions)) return value.permissions;

  const entries = Object.entries(value);
  const isBooleanMap =
    entries.length > 0 && entries.every(([, v]) => typeof v === "boolean");

  if (isBooleanMap) {
    return entries.filter(([, v]) => v).map(([key]) => key);
  }

  return [value];
};

export const extractUserRoles = (user) => {
  if (!user) return [];

  const payload = user?.data && typeof user.data === "object" ? user.data : user;
  const nestedUser =
    payload?.user && typeof payload.user === "object" ? payload.user : null;

  const candidates = [
    ...toArray(payload.roles),
    ...toArray(payload.domain_role),
    ...toArray(payload.domain_roles),
    payload.role,
    payload.role?.name,
    payload.role_name,
    payload.user_role,
    ...toArray(nestedUser?.roles),
    ...toArray(nestedUser?.domain_role),
    ...toArray(nestedUser?.domain_roles),
    nestedUser?.role,
    nestedUser?.role?.name,
    nestedUser?.role_name,
    nestedUser?.user_role,
  ];

  const normalized = candidates
    .map((role) => extractName(role).trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(normalized));
};

export const extractUserPrimaryRole = (user) => {
  const roles = extractUserRoles(user);

  // Keep legacy behavior resilient: if role shape is unexpected, default to admin
  // instead of hiding all sidebar items.
  return roles[0] || "admin";
};

export const extractUserPermissions = (user) => {
  if (!user) return [];

  const payload = user?.data && typeof user.data === "object" ? user.data : user;
  const nestedUser =
    payload?.user && typeof payload.user === "object" ? payload.user : null;

  const directPermissions = [
    ...normalizePermissionEntries(payload.permissions),
    ...normalizePermissionEntries(payload.all_permissions),
    ...normalizePermissionEntries(payload.permission_names),
    ...normalizePermissionEntries(payload.domain_access),
    ...normalizePermissionEntries(payload.domain_role),
    ...normalizePermissionEntries(nestedUser?.permissions),
    ...normalizePermissionEntries(nestedUser?.all_permissions),
    ...normalizePermissionEntries(nestedUser?.permission_names),
    ...normalizePermissionEntries(nestedUser?.domain_access),
    ...normalizePermissionEntries(nestedUser?.domain_role),
  ];

  const rolePermissions = [
    ...toArray(payload.roles),
    ...toArray(payload.domain_role),
    ...toArray(nestedUser?.roles),
    ...toArray(nestedUser?.domain_role),
  ].flatMap((role) =>
    normalizePermissionEntries(role?.permissions),
  );

  const normalized = [...directPermissions, ...rolePermissions]
    .map((permission) => extractName(permission).trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(normalized));
};

export const hasPermissionClaims = (user) => {
  if (!user) return false;

  return extractUserPermissions(user).length > 0;
};

export const isSuperAdmin = (user) => {
  const roles = extractUserRoles(user);
  return roles.includes("superadmin") || roles.includes("super_admin");
};

export const hasRequiredPermissions = (
  user,
  requiredPermissions,
  mode = "all",
) => {
  const required = toArray(requiredPermissions)
    .map((p) => String(p || "").trim().toLowerCase())
    .filter(Boolean);

  if (required.length === 0) return true;

  if (isSuperAdmin(user)) return true;

  // Backend now sends explicit permission claims; missing claims should deny.
  if (!hasPermissionClaims(user)) return false;

  const available = extractUserPermissions(user);
  if (mode === "any") {
    return required.some((permission) => available.includes(permission));
  }

  return required.every((permission) => available.includes(permission));
};

export const hasRequiredRoles = (user, requiredRoles) => {
  const required = toArray(requiredRoles)
    .map((role) => String(role || "").trim().toLowerCase())
    .filter(Boolean);

  if (required.length === 0) return true;

  if (isSuperAdmin(user)) return true;

  const userRoles = extractUserRoles(user);
  return required.some((role) => userRoles.includes(role));
};
