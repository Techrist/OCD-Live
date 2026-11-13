import { NextResponse } from "next/server";
import { getStorage } from "@/server/adapters/storage";
import { SAFE_KEY } from "@/server/adapters/storage/mock";

// GET /api/files/products/abc.webp : sert les photos depuis le stockage (dossier local ou bucket privé), jamais d'autre chemin.
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const key = (await params).key.join("/");
  if (!SAFE_KEY.test(key)) return new NextResponse(null, { status: 404 });
  const file = await getStorage().get(key).catch(() => null);
  if (!file) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(file.body), {
    headers: { "Content-Type": file.contentType, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
  });
}
