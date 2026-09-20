import "server-only";

// Reads required configuration lazily so pages that don't need a secret still work
// when it isn't configured. Error messages name the variable, never its value.
function required(name) {
  const value = process.env[name];
  if (!value) throw new ConfigError(`Missing environment variable: ${name}`);
  return value;
}

export class ConfigError extends Error {}

export const env = {
  get appUrl() {
    return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  },
  /** Public URL of the admin site, e.g. https://admin.aaurawell.com */
  get adminUrl() {
    return (process.env.ADMIN_APP_URL || "http://localhost:3001").replace(/\/$/, "");
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
  get sessionSecret() {
    const secret = required("ADMIN_SESSION_SECRET");
    if (secret.length < 32) throw new ConfigError("ADMIN_SESSION_SECRET must be at least 32 characters");
    return secret;
  },
  get razorpayKeyId() {
    return required("RAZORPAY_KEY_ID");
  },
  get razorpayKeySecret() {
    return required("RAZORPAY_KEY_SECRET");
  },
  get razorpayWebhookSecret() {
    return required("RAZORPAY_WEBHOOK_SECRET");
  },
  get smtp() {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
      from: process.env.SMTP_FROM_EMAIL,
      adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL,
    };
  },
};

/** Which integrations are configured — booleans only, safe to show in the admin settings page. */
export function configStatus() {
  const has = (n) => Boolean(process.env[n]);
  return {
    database: has("DATABASE_URL"),
    sessionSecret: (process.env.ADMIN_SESSION_SECRET || "").length >= 32,
    razorpay: has("RAZORPAY_KEY_ID") && has("RAZORPAY_KEY_SECRET"),
    razorpayWebhook: has("RAZORPAY_WEBHOOK_SECRET"),
    smtp: has("SMTP_HOST") && has("SMTP_FROM_EMAIL"),
    adminNotificationEmail: has("ADMIN_NOTIFICATION_EMAIL"),
  };
}
