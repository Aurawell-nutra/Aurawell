"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { adminButton } from "@/components/admin/ui";
import { inputClass } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";

function PasswordInput({ label, name, autoComplete, required, minLength, error, showAll }) {
  const [show, setShow] = useState(false);
  const isVisible = showAll || show;
  const id = `field-${name}`;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={isVisible ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(inputClass, "pr-11")}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition-colors hover:bg-sage hover:text-ink focus:outline-none"
        >
          {isVisible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-crimson">
          {error}
        </p>
      )}
    </div>
  );
}

export default function PasswordForm() {
  const { adminFetch } = useAdmin();
  const [showAll, setShowAll] = useState(false);
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
      <PasswordInput
        label="Current password"
        name="currentPassword"
        required
        autoComplete="current-password"
        error={state.fields.currentPassword}
        showAll={showAll}
      />
      <PasswordInput
        label="New password"
        name="newPassword"
        required
        minLength={12}
        autoComplete="new-password"
        error={state.fields.newPassword}
        showAll={showAll}
      />
      <PasswordInput
        label="Confirm new password"
        name="confirmPassword"
        required
        autoComplete="new-password"
        error={state.fields.confirmPassword}
        showAll={showAll}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">At least 12 characters with uppercase, lowercase and a number.</p>
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-forest hover:underline focus:outline-none"
        >
          {showAll ? <EyeOff className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
          {showAll ? "Hide all passwords" : "Make passwords visible"}
        </button>
      </div>
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

