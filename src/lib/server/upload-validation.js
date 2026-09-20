// Image upload validation. The file type is decided by the file's magic bytes —
// never by the client-provided filename or MIME type.
import crypto from "node:crypto";

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB
export const ALLOWED_MIME = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export const MEDIA_FILENAME_REGEX = /^[a-f0-9]{32}\.(?:webp|png|jpg)$/;

/** @param {Uint8Array} bytes */
export function detectImageType(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  )
    return "png";
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  )
    return "webp";
  return null;
}

/**
 * Validates an uploaded file and returns a safe generated filename.
 * @returns {{ ok: true, filename: string, ext: string } | { ok: false, error: string }}
 */
export function validateImageUpload({ bytes, declaredType, originalName }) {
  if (!bytes || bytes.length === 0) return { ok: false, error: "The file is empty" };
  if (bytes.length > MAX_UPLOAD_BYTES) return { ok: false, error: "Images must be 2 MB or smaller" };
  if (!Object.hasOwn(ALLOWED_MIME, declaredType)) return { ok: false, error: "Only JPG, PNG and WebP images are allowed" };

  const ext = (originalName || "").toLowerCase().split(".").pop();
  const allowedExt = { jpg: "jpg", jpeg: "jpg", png: "png", webp: "webp" }[ext];
  const detected = detectImageType(bytes);
  if (!detected || !allowedExt || detected !== allowedExt || ALLOWED_MIME[declaredType] !== detected) {
    return { ok: false, error: "The file is not a valid JPG, PNG or WebP image" };
  }

  return { ok: true, ext: detected, filename: `${crypto.randomBytes(16).toString("hex")}.${detected}` };
}
