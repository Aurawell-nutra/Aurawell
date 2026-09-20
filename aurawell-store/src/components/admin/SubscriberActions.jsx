"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";

export default function SubscriberActions({ id, email }) {
  const router = useRouter();
  const { adminFetch } = useAdmin();
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    if (!window.confirm(`Permanently delete ${email} from the subscriber list?`)) return;
    setBusy(true);
    try {
      await adminFetch(`/api/admin/subscribers/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (err) {
      window.alert(err.message);
      setBusy(false);
    }
  };

  return (
    <button type="button" onClick={remove} disabled={busy} aria-label={`Delete ${email}`} className="text-muted hover:text-crimson disabled:opacity-50">
      <Trash2 className="size-4" />
    </button>
  );
}
