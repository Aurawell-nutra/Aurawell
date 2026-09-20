import "server-only";
import Razorpay from "razorpay";
import { env } from "./env.js";

let client;

export function getRazorpay() {
  if (!client) client = new Razorpay({ key_id: env.razorpayKeyId, key_secret: env.razorpayKeySecret });
  return client;
}
