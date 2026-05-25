/**
 * Build a multipart FormData payload from the account form state.
 *
 * Handles the shapes the backend expects:
 *  - roles[]            → repeated `roles[]` entries (array of strings)
 *  - additionalFiles[]  → repeated `additionalFiles[]` entries (File objects)
 *  - profile            → single File (skipped if it's an existing URL string)
 *  - booleans           → "1"/"0"
 *  - empty/null values  → omitted (so partial edits don't blank out fields)
 *
 * Used by both create and edit so the serialization stays consistent.
 */
export const buildAccountFormData = (formData) => {
  const fd = new FormData();

  Object.entries(formData).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    // Roles: send as roles[] array.
    if (key === "roles" && Array.isArray(value)) {
      value.forEach((role) => fd.append("roles[]", role));
      return;
    }

    // Additional files: only append actual File objects (skip already-saved URLs).
    if (key === "additionalFiles" && Array.isArray(value)) {
      value.forEach((file) => {
        if (file instanceof File) {
          fd.append("additionalFiles[]", file);
        }
      });
      return;
    }

    // Profile image: only send a freshly selected File. An existing avatar URL
    // (string) is left out so the backend keeps the current image.
    if (key === "profile") {
      if (value instanceof File) {
        fd.append("profile", value);
      }
      return;
    }

    if (typeof value === "boolean") {
      fd.append(key, value ? "1" : "0");
      return;
    }

    fd.append(key, value);
  });

  return fd;
};