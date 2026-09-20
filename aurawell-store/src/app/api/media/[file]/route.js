import { readFile } from "node:fs/promises";
import path from "node:path";
import { MEDIA_FILENAME_REGEX } from "@/lib/server/upload-validation";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "products");
const TYPES = { webp: "image/webp", png: "image/png", jpg: "image/jpeg" };

// Serves admin-uploaded images from outside /public. The strict filename pattern
// (32 hex chars + known extension) makes path traversal impossible.
export async function GET(_request, { params }) {
  const { file } = await params;
  if (!MEDIA_FILENAME_REGEX.test(file)) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(path.join(UPLOAD_DIR, file));
    return new Response(data, {
      headers: {
        "Content-Type": TYPES[file.split(".").pop()],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
