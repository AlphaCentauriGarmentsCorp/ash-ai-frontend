// Central translator for API / axios errors into a small, predictable shape
// the UI can branch on. Pairs with the backend's structured error envelope:
//   business   -> { type:'business', code, message, errors }
//   server     -> { type:'server',   code, message, reference }
//   validation -> 422 with { message, errors:{ field:[msg, ...] } }
//
// Returns: { type, code, message, fields, reference }
//   type:      'validation' | 'business' | 'server' | 'network' | 'auth' | 'error'
//   fields:    { field: message } map (validation / business field hints)
//   reference: server-error trace id (server type only; otherwise null)

const firstString = (val) => {
  if (Array.isArray(val)) return val.find((v) => typeof v === "string") || "";
  return typeof val === "string" ? val : "";
};

// Normalise Laravel's { field: [msg, ...] } into a flat { field: msg } map.
const flattenFieldErrors = (errors) => {
  if (!errors || typeof errors !== "object") return {};
  return Object.fromEntries(
    Object.entries(errors).map(([key, val]) => [
      key,
      firstString(val) || "Invalid value.",
    ])
  );
};

export function parseApiError(err) {
  // No HTTP response at all -> the request never reached the server.
  if (!err || !err.response) {
    return {
      type: "network",
      code: "NETWORK",
      message:
        "Can't reach the server right now. Please check your connection and try again.",
      fields: {},
      reference: null,
    };
  }

  const { status, data } = err.response;

  // Backend-tagged business rule (e.g. 403/422 with type:'business').
  if (data && data.type === "business") {
    return {
      type: "business",
      code: data.code || "BUSINESS_RULE",
      message: data.message || "That action isn't allowed right now.",
      fields: flattenFieldErrors(data.errors),
      reference: null,
    };
  }

  // Backend-tagged server fault, or any 5xx.
  if ((data && data.type === "server") || status >= 500) {
    const reference = data && data.reference ? data.reference : null;
    const base =
      (data && data.message) ||
      "Something went wrong on our end. Please try again in a moment.";
    return {
      type: "server",
      code: (data && data.code) || "SERVER_ERROR",
      message: reference ? `${base} (Reference: ${reference})` : base,
      fields: {},
      reference,
    };
  }

  // Standard Laravel validation failure.
  if (status === 422 && data && data.errors) {
    return {
      type: "validation",
      code: "VALIDATION",
      message: data.message || "Please review the highlighted fields.",
      fields: flattenFieldErrors(data.errors),
      reference: null,
    };
  }

  // Auth / session.
  if (status === 401) {
    return {
      type: "auth",
      code: "UNAUTHENTICATED",
      message: "Your session has expired. Please log in again.",
      fields: {},
      reference: null,
    };
  }

  if (status === 403) {
    return {
      type: "business",
      code: (data && data.code) || "FORBIDDEN",
      message: (data && data.message) || "You don't have permission to do that.",
      fields: {},
      reference: null,
    };
  }

  // Anything else: surface the server message if present, else a status hint.
  return {
    type: "error",
    code: "ERROR",
    message:
      (data && data.message) || `Request failed (${status}). Please try again.`,
    fields: {},
    reference: null,
  };
}

export default parseApiError;
