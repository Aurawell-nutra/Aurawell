"use client";

import { createContext, useCallback, useContext } from "react";
import { apiFetch } from "@/lib/api-client";

const AdminContext = createContext(null);

/** Provides the signed-in admin and a fetch helper that attaches the session's CSRF token. */
export default function AdminProvider({ admin, csrfToken, children }) {
  const adminFetch = useCallback((url, options = {}) => apiFetch(url, { ...options, csrfToken }), [csrfToken]);
  return <AdminContext.Provider value={{ admin, adminFetch }}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
}
