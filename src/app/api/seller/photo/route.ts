import { NextResponse } from "next/server";
import { assertRole, ForbiddenError } from "@/server/auth/roles";
import { readSession } from "@/server/auth/session";
import { MAX_PROFILE_PHOTO_BYTES, removeProfilePhoto, setProfilePhoto } from "@/server/services/profile-photo";

// Photo du compte du vendeur connecté (route d'API : la photo dépasse la limite de taille des actions serveur).
export async function POST(req: Request) {
  try {
    const s = assertRole(await readSession(), ["SELLER"]);
    const file = (await req.formData().catch(() => null))?.get("photo");
    if (!(file instanceof File) || file.size === 0) return NextResponse.json({ ok: false, reason: "INVALID_IMAGE" }, { status: 400 });
    if (file.size > MAX_PROFILE_PHOTO_BYTES) return NextResponse.json({ ok: false, reason: "TOO_BIG" }, { status: 400 });
    const res = await setProfilePhoto(s.sub, Buffer.from(await file.arrayBuffer()));
    return NextResponse.json(res, { status: res.ok ? 200 : 400 });
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ ok: false, reason: "FORBIDDEN" }, { status: 403 });
    throw e;
  }
}

export async function DELETE() {
  try {
    const s = assertRole(await readSession(), ["SELLER"]);
    return NextResponse.json(await removeProfilePhoto(s.sub));
  } catch (e) {
    if (e instanceof ForbiddenError) return NextResponse.json({ ok: false, reason: "FORBIDDEN" }, { status: 403 });
    throw e;
  }
}
