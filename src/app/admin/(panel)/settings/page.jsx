import { requireAdminPage } from "@/lib/server/auth";
import PasswordForm from "@/components/admin/PasswordForm";
import { AdminPageHeader, Card, dateTime } from "@/components/admin/ui";
import { prisma } from "@/lib/server/db";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const { admin } = await requireAdminPage();
  const record = await prisma.adminUser.findUnique({ where: { id: admin.id }, select: { lastLoginAt: true, createdAt: true } });

  return (
    <>
      <AdminPageHeader title="Settings" />
      <div className="max-w-xl">
        <Card>
          <h2 className="text-xl">Your account</h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Name</dt><dd>{admin.name}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Email</dt><dd>{admin.email}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Role</dt><dd>{admin.role}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Last sign-in</dt><dd>{record?.lastLoginAt ? dateTime.format(record.lastLoginAt) : "—"}</dd></div>
          </dl>
          <h3 className="mt-6 font-sans text-sm font-semibold">Change password</h3>
          <PasswordForm />
        </Card>

      </div>
    </>
  );
}
