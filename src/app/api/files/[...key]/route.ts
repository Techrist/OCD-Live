import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { filePath, SAFE_KEY } from "@/server/adapters/storage/mock";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

// GET /api/files/products/abc.webp : sert les fichiers du stockage local (mode simulation uniquement).
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  if ((process.env.STORAGE_PROVIDER ?? "mock") !== "mock") return new NextResponse(null, { status: 404 });
  const key = (await params).key.join("/");
  if (!SAFE_KEY.test(key)) return new NextResponse(null, { status: 404 });
  try {
    const body = await readFile(filePath(key));
    return new NextResponse(new Uint8Array(body), {
      headers: { "Content-Type": TYPES[key.split(".").pop()!], "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
