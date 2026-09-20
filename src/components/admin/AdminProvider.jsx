"use client";

import { createContext, useCallback, useContext } from "react";
import { apiFetch } from "@/lib/api-client";

const AdminContext = createContext(null);

/** Provides the signed-in admin and a fetch helper that attaches the session's CSRF token. */
export default function AdminProvider({ admin, csrfToken, base = "", children }) {
  const adminFetch = useCallback((url, options = {}) => apiFetch(url, { ...options, csrfToken }), [csrfToken]);
  // `base` is "" on the admin host and "/admin" when served from the store host.
  const adminUrl = useCallback((path) => `${base}${path}`, [base]);
  return <AdminContext.Provider value={{ admin, adminFetch, base, adminUrl }}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
}
