"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import FormField, { inputClass } from "@/components/ui/FormField";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function AdminLoginForm({ base = "" }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState({ busy: false, error: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState({ busy: true, error: "" });
    try {
      await apiFetch("/api/admin/login", { method: "POST", body: { email: form.get("email"), password: form.get("password") } });
      router.replace(base || "/");
      router.refresh();
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
      <FormField label="Email" name="email" type="email" required autoComplete="username" maxLength={254} />
      <div>
        <label htmlFor="field-password" className="mb-1.5 block text-sm font-medium text-ink">
          Password
        </label>
        <div className="relative">
          <input
            id="field-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            maxLength={200}
            className={cn(inputClass, "pr-11")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition-colors hover:bg-sage hover:text-ink focus:outline-none"
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
          </button>
        </div>
      </div>
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

