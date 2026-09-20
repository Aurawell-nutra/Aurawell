import { readFile } from "node:fs/promises";
import path from "node:path";
import { get } from "@vercel/blob";
import { MEDIA_FILENAME_REGEX } from "@/lib/server/upload-validation";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "products");
const TYPES = { webp: "image/webp", png: "image/png", jpg: "image/jpeg" };

// Serves admin-uploaded images from Vercel Blob (in production) or local disk (in dev).
// The strict filename pattern (32 hex chars + known extension) makes path traversal impossible.
export async function GET(_request, { params }) {
  const { file } = await params;
  if (!MEDIA_FILENAME_REGEX.test(file)) return new Response("Not found", { status: 404 });

  const ext = file.split(".").pop();
  const contentType = TYPES[ext] || "application/octet-stream";

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const access = process.env.BLOB_ACCESS || "private";
      const result = await get(`products/${file}`, { access });
      if (result && result.stream) {
        return new Response(result.stream, {
          headers: {
            "Content-Type": result.blob?.contentType || contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'; sandbox",
          },
        });
      }
    } catch (err) {
      console.error(`[media] Failed to fetch ${file} from Vercel Blob:`, err);
    }
  }

  // Fallback to local filesystem
  try {
    const data = await readFile(path.join(UPLOAD_DIR, file));
    return new Response(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

