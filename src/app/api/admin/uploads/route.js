import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { handler, json, assertSameOrigin, HttpError, enforceRateLimit } from "@/lib/server/http";
import { requireAdminApi } from "@/lib/server/auth";
import { LIMITS } from "@/lib/server/rate-limit";
import { MAX_UPLOAD_BYTES, validateImageUpload } from "@/lib/server/upload-validation";

export const dynamic = "force-dynamic";

// Uploads live outside /public and are served by /api/media with nosniff + sandbox CSP.
// In production on Vercel, files are stored in Vercel Blob (BLOB_READ_WRITE_TOKEN).
// In local development, files fall back to /uploads/products.
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "products");

export const POST = handler("POST /api/admin/uploads", async (request) => {
  assertSameOrigin(request);
  const { admin } = await requireAdminApi(request);
  enforceRateLimit(`upload:${admin.id}`, LIMITS.uploadPerAdmin);

  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_UPLOAD_BYTES + 64 * 1024) throw new HttpError(413, "Images must be 2 MB or smaller");

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") throw new HttpError(400, "Please choose an image to upload");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const result = validateImageUpload({ bytes, declaredType: file.type, originalName: file.name });
  if (!result.ok) throw new HttpError(400, result.error);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const access = process.env.BLOB_ACCESS || "private";
    await put(`products/${result.filename}`, Buffer.from(bytes), {
      access,
      contentType: file.type || `image/${result.ext}`,
      addRandomSuffix: false,
    });
  } else {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, result.filename), bytes, { flag: "wx" });
  }

  return json({ path: `/api/media/${result.filename}` }, { status: 201 });
});

