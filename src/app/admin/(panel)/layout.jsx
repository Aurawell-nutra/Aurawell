import AdminProvider from "@/components/admin/AdminProvider";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/server/auth";
import { getAdminBase } from "@/lib/server/admin-base";

// Every page inside (panel) requires a valid admin session. API routes check the session again.
export default async function AdminPanelLayout({ children }) {
  const { admin, session } = await requireAdminPage();
  const base = await getAdminBase();

  return (
    <AdminProvider admin={{ name: admin.name, email: admin.email, role: admin.role }} csrfToken={session.csrfToken} base={base}>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
