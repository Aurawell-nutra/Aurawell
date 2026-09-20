"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, Check, Lock, ShieldCheck } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import OrderSummary from "@/components/cart/OrderSummary";
import FormField from "@/components/ui/FormField";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/lib/api-client";
import { INDIAN_STATES } from "@/lib/constants";
import { formatPaise } from "@/lib/pricing-rules";
import { cn } from "@/lib/utils";

const steps = ["Details", "Review", "Payment"];
const DRAFT_KEY = "aurawell-checkout-details";
const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

const emptyCustomer = {
  name: "", email: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "India",
};

// Mirrors the server rules for instant feedback. The server validates again and is authoritative.
function validateCustomer(c) {
  const e = {};
  if (c.name.trim().length < 2) e.name = "Please enter your full name";
  if (!/^\S+@\S+\.\S+$/.test(c.email.trim())) e.email = "Please enter a valid email";
  if (!/^(?:\+?91|0)?[6-9]\d{9}$/.test(c.phone.replace(/[\s()-]/g, ""))) e.phone = "Enter a valid 10-digit mobile number";
  if (c.addressLine1.trim().length < 5) e.addressLine1 = "Please enter your full address";
  if (c.city.trim().length < 2) e.city = "Please enter your city";
  if (!c.state) e.state = "Please select your state";
  if (!/^[1-9]\d{5}$/.test(c.postalCode.trim())) e.postalCode = "Enter a valid 6-digit PIN code";
  return e;
}

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${RAZORPAY_SRC}"]`);
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve(true));
    script.addEventListener("error", () => resolve(false));
    if (!existing) {
      script.src = RAZORPAY_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  });
}

const cartLines = (items) => items.map((i) => ({ productId: i.productId, quantity: i.quantity }));

export default function CheckoutFlow() {
  const { items, ready, clearCart, syncWithServer, removeItem, updateQuantity } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [errors, setErrors] = useState({});
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState(null);
  const [completed, setCompleted] = useState(false);
  const checkoutKey = useRef(null);

  // Restore contact details (not payment data) for convenience within this browser session.
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
      if (saved) setCustomer({ ...emptyCustomer, ...saved, country: "India" });
    } catch {}
  }, []);

  if (!ready) return <div className="h-64 animate-pulse rounded-[2rem] bg-cream" aria-busy="true" />;

  if (items.length === 0 && !completed) {
    return (
      <div className="mx-auto max-w-md rounded-[2rem] border border-line bg-white p-12 text-center shadow-card">
        <h2 className="text-3xl">Your cart is empty</h2>
        <p className="mt-2 text-sm text-muted">Add some gummies before checking out.</p>
        <Button href="/shop" className="mt-6">Shop Our Gummies</Button>
      </div>
    );
  }

  const update = (e) => setCustomer((c) => ({ ...c, [e.target.name]: e.target.value }));
  const field = (name) => ({ name, value: customer[name], onChange: update, error: errors[name] });

  const goTo = (next) => {
    setStep(next);
    setAlert(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProblems = (err) => {
    const problems = err.data?.problems ?? [];
    for (const p of problems) {
      if (p.reason === "insufficient_stock" && p.available > 0) updateQuantity(p.productId, p.available);
      else removeItem(p.productId);
    }
    setAlert({
      tone: "error",
      text: problems.length ? "Some items were unavailable and your cart has been updated. Please review it again." : err.message,
    });
    if (problems.length) {
      setQuote(null);
      setStep(1);
    }
  };

  // Step 1 → 2: validate details, then ask the server to price the cart.
  const submitDetails = async (e) => {
    e.preventDefault();
    const found = validateCustomer(customer);
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...customer }));
    } catch {}
    await fetchQuote(1);
  };

  const fetchQuote = async (nextStep) => {
    setBusy(true);
    setAlert(null);
    try {
      const data = await apiFetch("/api/checkout/validate", { method: "POST", body: { items: cartLines(items) } });
      setQuote(data);
      syncWithServer(data.lines);
      checkoutKey.current = crypto.randomUUID(); // new idempotency key for this priced cart
      goTo(nextStep);
    } catch (err) {
      if (err.status === 409) handleProblems(err);
      else setAlert({ tone: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  };

  // Step 3: create the order on the server, open Razorpay, then verify on the server.
  const pay = async () => {
    setBusy(true);
    setAlert(null);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("We couldn't load the payment window. Please check your connection and try again.");

      const order = await apiFetch("/api/orders/create", {
        method: "POST",
        body: {
          customer: { ...customer, addressLine2: customer.addressLine2 || undefined },
          items: cartLines(items),
          checkoutKey: checkoutKey.current,
        },
      });

      let failed = false;
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpayOrderId,
        name: "Aaurawell Nutra",
        description: `Order ${order.orderNumber}`,
        prefill: order.customer,
        theme: { color: "#0f4a2e" },
        handler: async (response) => {
          setBusy(true);
          try {
            const result = await apiFetch("/api/payment/verify", {
              method: "POST",
              body: { orderNumber: order.orderNumber, ...response },
            });
            try {
              sessionStorage.setItem("aurawell-last-order", JSON.stringify(result.order));
              sessionStorage.removeItem(DRAFT_KEY);
            } catch {}
            setCompleted(true);
            clearCart();
            router.push(`/order-confirmed?order=${encodeURIComponent(order.orderNumber)}`);
          } catch (err) {
            setBusy(false);
            setAlert({
              tone: "error",
              text: `${err.message} If money was deducted, it will be confirmed automatically or refunded. Please contact support with order ${order.orderNumber}.`,
            });
          }
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
            if (failed) {
              apiFetch("/api/payment/failed", {
                method: "POST",
                body: { orderNumber: order.orderNumber, razorpay_order_id: order.razorpayOrderId },
              }).catch(() => {});
              setAlert({ tone: "error", text: "Your payment was not completed. No money has been taken — you can try again." });
            } else {
              setAlert({ tone: "info", text: "Payment cancelled. You can try again whenever you're ready." });
            }
          },
        },
      });
      rzp.on("payment.failed", () => {
        failed = true; // Razorpay lets the customer retry inside the window; we record it on close.
      });
      rzp.open();
    } catch (err) {
      setBusy(false);
      if (err.status === 409 && err.data?.problems) handleProblems(err);
      else setAlert({ tone: "error", text: err.message });
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-[2rem] border border-line bg-white p-6 shadow-card sm:p-10">
        <ol className="mb-10 flex items-center">
          {steps.map((label, i) => (
            <li key={label} className={cn("flex items-center", i < steps.length - 1 && "flex-1")}>
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-sm font-medium",
                    i < step ? "bg-leaf text-white" : i === step ? "bg-forest text-white" : "bg-cream text-muted"
                  )}
                >
                  {i < step ? <Check className="size-4" /> : i + 1}
                </span>
                <span className={cn("hidden text-sm sm:inline", i === step ? "font-medium text-forest" : "text-muted")}>{label}</span>
              </span>
              {i < steps.length - 1 && <span className={cn("mx-3 h-px flex-1", i < step ? "bg-leaf" : "bg-line")} />}
            </li>
          ))}
        </ol>

        {alert && (
          <p
            role="alert"
            className={cn(
              "mb-6 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm",
              alert.tone === "error" ? "bg-rose text-crimson" : "bg-sage/60 text-forest"
            )}
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {alert.text}
          </p>
        )}

        {step === 0 && (
          <form onSubmit={submitDetails} noValidate className="space-y-8">
            <fieldset>
              <legend className="font-serif text-2xl text-forest">Contact Information</legend>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FormField label="Full Name" autoComplete="name" maxLength={80} className="sm:col-span-2" {...field("name")} />
                <FormField label="Email Address" type="email" autoComplete="email" maxLength={254} {...field("email")} />
                <FormField label="Mobile Number" type="tel" autoComplete="tel" maxLength={16} placeholder="10-digit mobile" {...field("phone")} />
              </div>
            </fieldset>
            <fieldset>
              <legend className="font-serif text-2xl text-forest">Delivery Address</legend>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FormField label="House / Flat / Building, Street" autoComplete="address-line1" maxLength={160} className="sm:col-span-2" {...field("addressLine1")} />
                <FormField label="Area / Landmark (optional)" autoComplete="address-line2" maxLength={160} className="sm:col-span-2" {...field("addressLine2")} />
                <FormField label="City" autoComplete="address-level2" maxLength={60} {...field("city")} />
                <FormField label="State" as="select" autoComplete="address-level1" {...field("state")}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </FormField>
                <FormField label="PIN Code" inputMode="numeric" maxLength={6} autoComplete="postal-code" {...field("postalCode")} />
                <FormField label="Country" as="select" autoComplete="country-name" {...field("country")}>
                  <option>India</option>
                </FormField>
              </div>
            </fieldset>
            <div className="flex justify-end">
              <SubmitButton busy={busy}>Review Order</SubmitButton>
            </div>
          </form>
        )}

        {step === 1 && quote && (
          <div>
            <h2 className="font-serif text-2xl text-forest">Review Your Order</h2>
            <ul className="mt-5 divide-y divide-line rounded-2xl border border-line">
              {quote.lines.map((l) => (
                <li key={l.productId} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                  <span>
                    {l.productName} <span className="text-muted">× {l.quantity}</span>
                  </span>
                  <span className="font-medium">{formatPaise(l.totalPrice)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl bg-cream p-4 text-sm text-muted">
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink">Delivering to</p>
                <button type="button" onClick={() => goTo(0)} className="text-xs text-forest underline">
                  Edit
                </button>
              </div>
              <p className="mt-1">
                {customer.name} · {customer.phone} · {customer.email}
              </p>
              <p>
                {[customer.addressLine1, customer.addressLine2, customer.city, `${customer.state} ${customer.postalCode}`, customer.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
            <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <BackButton onClick={() => goTo(0)} />
              <button
                type="button"
                onClick={() => goTo(2)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-forest-dark"
              >
                Continue to Payment <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        )}

        {step === 2 && quote && (
          <div>
            <h2 className="font-serif text-2xl text-forest">Payment</h2>
            {/* Coming Soon notice — Razorpay integration is ready, just temporarily disabled */}
            <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-center">
              <p className="text-lg font-semibold text-amber-800">🚀 Online Payment — Coming Soon!</p>
              <p className="mt-2 text-sm text-amber-700">
                We&apos;re setting up secure online payments with Razorpay. This feature will be available shortly.
              </p>
              <p className="mt-3 text-xs text-amber-600">
                UPI, credit &amp; debit cards, net banking and wallets — all coming your way!
              </p>
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs text-muted">
              <Lock className="size-3.5" aria-hidden /> Payments will be processed securely by Razorpay.
            </p>
            <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <BackButton onClick={() => goTo(1)} disabled={busy} />
              {/* TODO: Re-enable this button when Razorpay is ready
              <button
                type="button"
                onClick={pay}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-forest-dark disabled:opacity-60"
              >
                {busy ? "Processing…" : `Pay ${formatPaise(quote.totalAmount)}`}
                {!busy && <ArrowRight className="size-4" aria-hidden />}
              </button>
              */}
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-300 px-8 py-3.5 text-sm font-medium text-gray-500 cursor-not-allowed"
              >
                Pay {formatPaise(quote.totalAmount)} — Coming Soon
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="lg:sticky lg:top-28 lg:h-fit">
        <OrderSummary showItems quote={step > 0 ? quote : null} />
      </div>
    </div>
  );
}

function SubmitButton({ busy, children }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-forest-dark disabled:opacity-60"
    >
      {busy ? "Checking…" : children}
      {!busy && <ArrowRight className="size-4" aria-hidden />}
    </button>
  );
}

function BackButton({ onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="inline-flex items-center justify-center gap-2 text-sm text-forest hover:underline disabled:opacity-50">
      <ArrowLeft className="size-4" aria-hidden /> Back
    </button>
  );
}
