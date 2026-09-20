"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/components/admin/AdminProvider";
import { Card, adminButton } from "@/components/admin/ui";
import { inputClass } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";

const LABELS = { CONFIRMED: "Mark confirmed", PROCESSING: "Mark processing", SHIPPED: "Mark shipped", DELIVERED: "Mark delivered", CANCELLED: "Cancel order" };

export default function OrderActions({ orderId, orderStatus, paymentStatus, allowedStatuses, notes: initialNotes }) {
  const router = useRouter();
  const { adminFetch } = useAdmin();
  const [notes, setNotes] = useState(initialNotes);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const patch = async (body, success) => {
    setBusy(true);
    setMessage(null);
    try {
      await adminFetch(`/api/admin/orders/${orderId}`, { method: "PATCH", body });
      setMessage({ tone: "success", text: success });
      router.refresh();
    } catch (err) {
      setMessage({ tone: "error", text: err.fields?.notes ?? err.message });
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = (status) => {
    if (status === "CANCELLED" && !window.confirm("Cancel this order? Paid items will be returned to stock. Refunds must be issued separately in Razorpay.")) return;
    patch({ orderStatus: status }, `Order marked ${status.toLowerCase()}.`);
  };

  const markRefunded = () => {
    if (!window.confirm("Mark this order as refunded? Issue the refund in your Razorpay dashboard first.")) return;
    patch({ paymentStatus: "REFUNDED" }, "Payment marked as refunded.");
  };

  return (
    <Card>
      <h2 className="text-xl">Manage order</h2>
      {message && (
        <p role={message.tone === "error" ? "alert" : "status"} className={cn("mt-3 rounded-2xl px-4 py-2.5 text-sm", message.tone === "error" ? "bg-rose text-crimson" : "bg-sage text-forest")}>
          {message.text}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {allowedStatuses.length === 0 && <p className="text-sm text-muted">No further status changes for a {orderStatus.toLowerCase()} order.</p>}
        {allowedStatuses.map((s) => (
          <button key={s} type="button" disabled={busy} onClick={() => changeStatus(s)} className={s === "CANCELLED" ? adminButton.danger : adminButton.primary}>
            {LABELS[s]}
          </button>
        ))}
        {paymentStatus === "PAID" && (
          <button type="button" disabled={busy} onClick={markRefunded} className={adminButton.outline}>
            Mark refunded
          </button>
        )}
      </div>

      <label htmlFor="order-notes" className="mt-6 block text-sm font-medium text-ink">
        Internal notes <span className="font-normal text-muted">(never shown to customers)</span>
      </label>
      <textarea id="order-notes" value={notes} maxLength={2000} onChange={(e) => setNotes(e.target.value)} className={cn(inputClass, "mt-1.5 min-h-28")} />
      <button type="button" disabled={busy || notes === initialNotes} onClick={() => patch({ notes: notes.trim() || null }, "Notes saved.")} className={cn(adminButton.outline, "mt-3")}>
        Save notes
      </button>
    </Card>
  );
}
