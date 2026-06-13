import { parseApiError } from "./parseApiError";

/**
 * Change 13 — apply a structured API error to a form's error state.
 *
 * Centralises the parse-then-route logic so every form handles errors the same
 * way (the order/quotation forms already do this inline; this lets the rest
 * share it instead of falling back to a single generic banner):
 *
 *   - validation (422): set per-field inline errors + a short, plain-language
 *     summary banner ("Please review the highlighted fields below.").
 *   - business / server / network / auth: show the banner only, merging any
 *     field hints inline.
 *
 * @param {*} err  the caught axios error
 * @param {object} handlers
 * @param {function} handlers.setErrors      form field-error state setter
 * @param {function} handlers.setServerError banner message setter
 * @param {object}   [handlers.fieldMap]     optional { backendKey: formKey } remap
 *                                            for forms whose field names differ
 *                                            from the backend validation keys
 * @returns {object} the parsed error { type, code, message, fields, reference }
 */
export function applyApiError(err, { setErrors, setServerError, fieldMap } = {}) {
  const parsed = parseApiError(err);
  const fields = remapFields(parsed.fields, fieldMap);
  const hasFields = Object.keys(fields).length > 0;

  if (parsed.type === "validation") {
    if (setErrors) setErrors(fields);
    if (setServerError) {
      setServerError(
        hasFields ? "Please review the highlighted fields below." : parsed.message
      );
    }
  } else {
    if (setErrors && hasFields) {
      setErrors((prev) => ({ ...prev, ...fields }));
    }
    if (setServerError) setServerError(parsed.message);
  }

  return parsed;
}

function remapFields(fields, fieldMap) {
  if (!fields) return {};
  if (!fieldMap) return fields;
  return Object.fromEntries(
    Object.entries(fields).map(([key, val]) => [fieldMap[key] || key, val])
  );
}

export default applyApiError;
