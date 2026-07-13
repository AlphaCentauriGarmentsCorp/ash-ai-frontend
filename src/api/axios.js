import axios from "axios";
import { emitDataChanged } from "../utils/ashEvents";

/**
 * Requests that mutate but must NOT trigger a badge refresh.
 *
 * - auth endpoints: no badge state, and firing during logout races the
 *   provider teardown.
 * - /notifications/*: useNotifications already updates itself optimistically;
 *   re-broadcasting would refetch the whole app on every bell click.
 * - /pick: fire-and-forget popularity counters (swatches, pantones).
 */
const NON_BADGE_PATHS = [
  /\/login$/,
  /\/logout$/,
  /\/register$/,
  /\/notifications(\/|$)/,
  /\/pick$/,
];

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    // A successful mutation means every cached count in the app is now
    // stale. Announce it once, here, instead of asking ~40 call sites to
    // remember. BadgeContext debounces and refreshes; GETs never emit, so
    // the refresh it triggers cannot feed back into this interceptor.
    try {
      const method = (response.config?.method || "get").toLowerCase();
      const url = response.config?.url || "";
      const isMutation = MUTATING_METHODS.has(method);
      const isMuted = NON_BADGE_PATHS.some((re) => re.test(url));

      if (isMutation && !isMuted && localStorage.getItem("token")) {
        emitDataChanged({ method, url, status: response.status });
      }
    } catch {
      // A badge hint must never break the response it is riding on.
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("unauthorized"));
    }
    return Promise.reject(error);
  },
);

export default api;
