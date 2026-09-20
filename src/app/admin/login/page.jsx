import { redirect } from "next/navigation";
import { LogoMark } from "@/components/ui/Logo";
import Botanical from "@/components/ui/Botanical";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getCurrentAdmin } from "@/lib/server/auth";
import { getAdminBase } from "@/lib/server/admin-base";

export const metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  const base = await getAdminBase();
  if (await getCurrentAdmin().catch(() => null)) redirect(base || "/");

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-cream via-ivory to-sage/60 px-4 py-12">
      <Botanical name="corner" className="top-0 right-0 w-40 -scale-y-100 opacity-70 sm:w-56" />
      <Botanical name="fern" className="bottom-0 left-0 w-24 opacity-50 sm:w-32" />
      <div className="w-full max-w-sm rounded-[2rem] border border-line bg-white p-8 shadow-soft">
        <LogoMark className="mx-auto h-14 w-auto" />
        <h1 className="mt-6 text-center text-3xl">Admin Sign In</h1>
        <p className="mt-1 text-center text-sm text-muted">Authorised staff only.</p>
        <AdminLoginForm base={base} />
      </div>
    </main>
  );
}
