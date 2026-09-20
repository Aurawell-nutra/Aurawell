import "server-only";
import nodemailer from "nodemailer";
import { env } from "./env.js";
import { logger } from "./logger.js";
import { formatPaise } from "../pricing-rules.js";

let transporter;

export function getTransporter() {
  const smtp = env.smtp;
  if (!smtp.host || !smtp.from) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: smtp.user ? { user: smtp.user, pass: smtp.password } : undefined,
    });
  }
  return transporter;
}

export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const SUPPORT = { phone: "+91 87993 69547", email: "support@aaurawell.com" };

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(date);
}

function addressLines(order) {
  return [order.addressLine1, order.addressLine2, `${order.city}, ${order.state} ${order.postalCode}`, order.country].filter(Boolean);
}

function itemsTable(order) {
  const rows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #e9e1d4">${escapeHtml(i.productName)}</td>
        <td style="padding:8px;border-bottom:1px solid #e9e1d4;text-align:center">${i.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #e9e1d4;text-align:right">${formatPaise(i.unitPrice)}</td>
        <td style="padding:8px 0;border-bottom:1px solid #e9e1d4;text-align:right">${formatPaise(i.totalPrice)}</td>
      </tr>`
    )
    .join("");
  const total = (label, value, bold) =>
    `<tr><td colspan="3" style="padding:6px 0;text-align:right;${bold ? "font-weight:600" : "color:#5f6b62"}">${label}</td><td style="padding:6px 0;text-align:right;${bold ? "font-weight:600" : ""}">${value}</td></tr>`;
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">
    <thead><tr style="color:#5f6b62;text-align:left"><th style="padding:8px 0">Product</th><th style="padding:8px;text-align:center">Qty</th><th style="padding:8px;text-align:right">Price</th><th style="padding:8px 0;text-align:right">Total</th></tr></thead>
    <tbody>${rows}
    ${total("Subtotal", formatPaise(order.subtotal))}
    ${order.discountAmount ? total("Discount", `−${formatPaise(order.discountAmount)}`) : ""}
    ${total("Shipping", order.shippingAmount ? formatPaise(order.shippingAmount) : "Free")}
    ${order.taxAmount ? total("Tax", formatPaise(order.taxAmount)) : ""}
    ${total("Total", formatPaise(order.totalAmount), true)}
    </tbody></table>`;
}

export function layout(title, body) {
  return `<!doctype html><html><body style="margin:0;background:#fbf7f1;font-family:Arial,Helvetica,sans-serif;color:#1d2b22">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px">
    <p style="margin:0;font-family:Georgia,serif;font-size:26px;color:#0e4a34">Aaura<span style="color:#b8913a">well</span> <span style="font-size:12px;letter-spacing:3px">NUTRA</span></p>
    <div style="background:#fff;border:1px solid #e9e1d4;border-radius:16px;padding:28px;margin-top:20px">
      <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:24px;color:#0e4a34">${title}</h1>
      ${body}
    </div>
    <p style="font-size:12px;color:#5f6b62;text-align:center;margin-top:20px">Aaurawell Nutra · Ahmedabad, Gujarat, India<br>Nutraceutical — not for medicinal use.</p>
  </div></body></html>`;
}

function customerEmail(order) {
  const html = layout(
    "Thank you for your order!",
    `<p style="font-size:14px;line-height:1.6">Hi ${escapeHtml(order.customerName)}, your payment was successful and your order has been confirmed.</p>
     <p style="font-size:14px"><strong>Order number:</strong> ${escapeHtml(order.orderNumber)}<br>
     <strong>Order date:</strong> ${formatDate(order.createdAt)}<br>
     <strong>Payment status:</strong> Paid</p>
     ${itemsTable(order)}
     <h2 style="font-size:16px;margin:24px 0 8px">Delivery address</h2>
     <p style="font-size:14px;line-height:1.6;margin:0">${addressLines(order).map(escapeHtml).join("<br>")}</p>
     <p style="font-size:14px;line-height:1.6;margin-top:24px">Questions? Contact us at ${SUPPORT.email} or ${SUPPORT.phone}.</p>`
  );
  const text = [
    `Hi ${order.customerName}, your order ${order.orderNumber} is confirmed.`,
    ...order.items.map((i) => `${i.productName} x${i.quantity} — ${formatPaise(i.totalPrice)}`),
    `Total: ${formatPaise(order.totalAmount)} (Paid)`,
    `Deliver to: ${addressLines(order).join(", ")}`,
    `Support: ${SUPPORT.email} / ${SUPPORT.phone}`,
  ].join("\n");
  return { subject: `Your Aaurawell order ${order.orderNumber} is confirmed`, html, text };
}

function adminEmail(order) {
  const html = layout(
    `New order ${escapeHtml(order.orderNumber)}`,
    `<p style="font-size:14px;line-height:1.7">
      <strong>Customer:</strong> ${escapeHtml(order.customerName)}<br>
      <strong>Email:</strong> ${escapeHtml(order.customerEmail)}<br>
      <strong>Phone:</strong> ${escapeHtml(order.customerPhone)}<br>
      <strong>Payment status:</strong> Paid<br>
      <strong>Order date:</strong> ${formatDate(order.createdAt)}</p>
     ${itemsTable(order)}
     <h2 style="font-size:16px;margin:24px 0 8px">Delivery address</h2>
     <p style="font-size:14px;line-height:1.6;margin:0">${addressLines(order).map(escapeHtml).join("<br>")}</p>
     <p style="margin-top:24px"><a href="${env.adminUrl}/orders/${order.id}" style="color:#0e4a34">View in admin panel</a></p>`
  );
  return { subject: `New order ${order.orderNumber} — ${formatPaise(order.totalAmount)}`, html, text: `New paid order ${order.orderNumber} for ${formatPaise(order.totalAmount)}.` };
}

/** Sends customer + admin emails. Returns "SENT", "FAILED" or "NOT_SENT" (SMTP not configured). */
export async function sendOrderEmails(order) {
  const transport = getTransporter();
  if (!transport) {
    logger.warn("SMTP not configured — order emails skipped", { orderNumber: order.orderNumber });
    return "NOT_SENT";
  }
  const { from, adminEmail: adminTo } = env.smtp;
  const jobs = [transport.sendMail({ from, to: order.customerEmail, ...customerEmail(order) })];
  if (adminTo) jobs.push(transport.sendMail({ from, to: adminTo, replyTo: order.customerEmail, ...adminEmail(order) }));

  const results = await Promise.allSettled(jobs);
  const failed = results.filter((r) => r.status === "rejected");
  failed.forEach((r) => logger.error("Email delivery failed", { orderNumber: order.orderNumber, error: r.reason }));
  return failed.length ? "FAILED" : "SENT";
}
