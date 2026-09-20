"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { adminButton } from "@/components/admin/ui";
import FormField from "@/components/ui/FormField";
import { cn } from "@/lib/utils";

export default function PasswordForm() {
  const { adminFetch } = useAdmin();
  const [state, setState] = useState({ busy: false, fields: {}, message: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    if (form.get("newPassword") !== form.get("confirmPassword")) {
      setState({ busy: false, fields: { confirmPassword: "Passwords do not match" }, message: null });
      return;
    }
    setState({ busy: true, fields: {}, message: null });
    try {
      await adminFetch("/api/admin/password", {
        method: "POST",
        body: { currentPassword: form.get("currentPassword"), newPassword: form.get("newPassword") },
      });
      formEl.reset();
      setState({ busy: false, fields: {}, message: { tone: "success", text: "Password updated. Other sessions were signed out." } });
    } catch (err) {
      setState({ busy: false, fields: err.fields, message: { tone: "error", text: err.message } });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 grid gap-3">
      <FormField label="Current password" name="currentPassword" type="password" required autoComplete="current-password" error={state.fields.currentPassword} />
      <FormField label="New password" name="newPassword" type="password" required minLength={12} autoComplete="new-password" error={state.fields.newPassword} />
      <FormField label="Confirm new password" name="confirmPassword" type="password" required autoComplete="new-password" error={state.fields.confirmPassword} />
      <p className="text-xs text-muted">At least 12 characters with uppercase, lowercase and a number.</p>
      {state.message && (
        <p role={state.message.tone === "error" ? "alert" : "status"} className={cn("rounded-2xl px-4 py-2.5 text-sm", state.message.tone === "error" ? "bg-rose text-crimson" : "bg-sage text-forest")}>
          {state.message.text}
        </p>
      )}
      <button type="submit" disabled={state.busy} className={cn(adminButton.primary, "w-fit")}>
        {state.busy ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
