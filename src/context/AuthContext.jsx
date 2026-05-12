// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/authApi";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  }, []);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    // If we have a cached user object from a previous session, use it
    // immediately so UI (menus, buttons) keep their state while we
    // refresh the profile from the server.
    const cached = localStorage.getItem("user");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setUser(parsed);
      } catch (err) {
        // ignore parse errors and continue to fetch
      }
    }

    try {
      const res = await authApi.meApi();
      setUser(res.data);
      try {
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (err) {
        // ignore storage errors
      }

      // no debug logging here
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch user:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      console.log("Unauthorized event received - logging out");
      logout();
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, [logout]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token" && !e.newValue) {
        logout();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
