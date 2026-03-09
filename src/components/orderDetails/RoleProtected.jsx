import React from "react";

const RoleProtected = ({
  children,
  userRoles = [],
  requiredRoles = [],
  fallback = null,
}) => {
  if (!userRoles || !Array.isArray(userRoles)) return fallback;

  const hasAccess =
    userRoles.includes("admin") ||
    requiredRoles.some((role) => userRoles.includes(role));

  return hasAccess ? children : fallback;
};

export default RoleProtected;
