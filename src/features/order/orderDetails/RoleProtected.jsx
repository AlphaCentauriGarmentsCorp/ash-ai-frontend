import React from "react";
import { isSuperAdmin } from "../../../utils/authz";

const RoleProtected = ({
  children,
  userRoles = [],
  requiredRoles = [],
  fallback = null,
}) => {
  if (!userRoles || !Array.isArray(userRoles)) return fallback;

  const normalizedRoles = userRoles.map((role) =>
    String(role || "").trim().toLowerCase(),
  );

  const hasAccess =
    isSuperAdmin({ roles: normalizedRoles }) ||
    requiredRoles.some((role) => normalizedRoles.includes(role));

  return hasAccess ? children : fallback;
};

export default RoleProtected;
