import { NextResponse } from "next/server";
import { z } from "zod";
import { assertRole, ForbiddenError } from "@/server/auth/roles";
import { readSession } from "@/server/auth/session";
import { createProduct, deleteProduct, MAX_PHOTO_BYTES, productInput, updateProduct } from "@/server/services/shop";

// Catalogue du vendeur connecté (SHP-01). Route d'API plutôt qu'action serveur : la photo (jusqu'à 3 Mo) dépasse la limite des actions.
async function seller() {
  return assertRole(await readSession(), ["SELLER"]);
}

function forbidden(e: unknown) {
  if (e instanceof ForbiddenError) return NextResponse.json({ ok: false, reason: "FORBIDDEN" }, { status: 403 });
  throw e;
}

export async function POST(req: Request) {
  try {
    const s = await seller();
    const form = await req.formData().catch(() => null);
    if (!form) return NextResponse.json({ ok: false, reason: "INVALID_INPUT" }, { status: 400 });
    const parsed = productInput.safeParse({
      name: form.get("name"),
      price: form.get("price"),
      stock: form.get("stock") ?? undefined,
      categoryId: form.get("categoryId") || undefined,
    });
    if (!parsed.success) return NextResponse.json({ ok: false, reason: "INVALID_INPUT" }, { status: 400 });
    const file = form.get("photo");
    let photo: Buffer | undefined;
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_PHOTO_BYTES) return NextResponse.json({ ok: false, reason: "TOO_BIG" }, { status: 400 });
      photo = Buffer.from(await file.arrayBuffer());
    }
    const res = await createProduct(s.sub, parsed.data, photo);
    return NextResponse.json(res, { status: res.ok ? 200 : 400 });
  } catch (e) {
    return forbidden(e);
  }
}

const patch = z.object({
  id: z.string().min(1),
  price: z.coerce.number().int().min(0).max(100_000_000).optional(),
  stock: z.number().int().min(0).max(100_000).nullable().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  try {
    const s = await seller();
    const parsed = patch.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ ok: false, reason: "INVALID_INPUT" }, { status: 400 });
    const { id, ...data } = parsed.data;
    return NextResponse.json(await updateProduct(s.sub, id, data));
  } catch (e) {
    return forbidden(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const s = await seller();
    const id = new URL(req.url).searchParams.get("id") ?? "";
    return NextResponse.json(await deleteProduct(s.sub, id));
  } catch (e) {
    return forbidden(e);
  }
}
