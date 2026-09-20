"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Star, Trash2, X } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { adminButton } from "@/components/admin/ui";

export default function ReviewActions({ reviewId, status, isFeatured }) {
  const router = useRouter();
  const { adminFetch } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async (request) => {
    setBusy(true);
    setError("");
    try {
      await request();
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const patch = (body) => run(() => adminFetch(`/api/admin/reviews/${reviewId}`, { method: "PATCH", body }));

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="flex flex-wrap gap-2">
        {status !== "APPROVED" && (
          <button type="button" disabled={busy} onClick={() => patch({ status: "APPROVED" })} className={adminButton.primary}>
            <Check className="size-4" aria-hidden /> Approve
          </button>
        )}
        {status !== "REJECTED" && (
          <button type="button" disabled={busy} onClick={() => patch({ status: "REJECTED" })} className={adminButton.outline}>
            <X className="size-4" aria-hidden /> Reject
          </button>
        )}
        {status === "APPROVED" && (
          <button type="button" disabled={busy} onClick={() => patch({ isFeatured: !isFeatured })} className={adminButton.outline}>
            <Star className="size-4" aria-hidden /> {isFeatured ? "Remove from featured" : "Feature on homepage"}
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => window.confirm("Delete this review permanently?") && run(() => adminFetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" }))}
          className={adminButton.danger}
        >
          <Trash2 className="size-4" aria-hidden /> Delete
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-crimson">{error}</p>}
    </div>
  );
}
