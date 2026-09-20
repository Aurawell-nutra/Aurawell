"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { MailX } from "lucide-react";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/lib/api-client";

export default function UnsubscribeForm() {
  const token = useSearchParams().get("token");
  const [state, setState] = useState({ status: "idle", error: "" });

  const confirm = async () => {
    setState({ status: "sending", error: "" });
    try {
      await apiFetch("/api/newsletter/unsubscribe", { method: "POST", body: { token } });
      setState({ status: "done", error: "" });
    } catch (err) {
      setState({ status: "error", error: err.message });
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-[2rem] border border-line bg-white p-10 text-center shadow-soft">
      <MailX className="mx-auto size-14 text-forest" strokeWidth={1.5} aria-hidden />
      {state.status === "done" ? (
        <>
          <h1 className="mt-5 text-3xl font-semibold">You&apos;ve been unsubscribed</h1>
          <p className="mt-3 text-sm text-muted">You won&apos;t receive any more newsletter emails from us. Order emails are not affected.</p>
          <Button href="/" className="mt-8">Back to Home</Button>
        </>
      ) : (
        <>
          <h1 className="mt-5 text-3xl font-semibold">Unsubscribe?</h1>
          <p className="mt-3 text-sm text-muted">You&apos;ll stop receiving new launches, wellness tips and offers from Aaurawell Nutra.</p>
          {state.status === "error" && <p role="alert" className="mt-4 text-sm text-crimson">{state.error}</p>}
          <button
            type="button"
            onClick={confirm}
            disabled={!token || state.status === "sending"}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-forest px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-forest-dark disabled:opacity-50"
          >
            {state.status === "sending" ? "Unsubscribing…" : "Yes, unsubscribe me"}
          </button>
          {!token && <p className="mt-3 text-xs text-crimson">This unsubscribe link is incomplete.</p>}
        </>
      )}
    </div>
  );
}
