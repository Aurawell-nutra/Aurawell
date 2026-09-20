"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/ui/FormField";
import { apiFetch } from "@/lib/api-client";

export default function AdminLoginForm() {
  const router = useRouter();
  const [state, setState] = useState({ busy: false, error: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState({ busy: true, error: "" });
    try {
      await apiFetch("/api/admin/login", { method: "POST", body: { email: form.get("email"), password: form.get("password") } });
      router.replace("/");
      router.refresh();
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
      <FormField label="Email" name="email" type="email" required autoComplete="username" maxLength={254} />
      <FormField label="Password" name="password" type="password" required autoComplete="current-password" maxLength={200} />
      {state.error && (
        <p role="alert" className="text-sm text-crimson">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={state.busy}
        className="mt-2 rounded-full bg-forest py-3.5 text-sm font-medium text-white transition-colors hover:bg-forest-dark disabled:opacity-60"
      >
        {state.busy ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
