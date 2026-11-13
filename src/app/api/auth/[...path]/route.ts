import { neonAuth } from "@/lib/auth/neon-server";

// Relais vers Neon Auth (connexion Google). Les routes /api/auth/otp/* restent celles de notre code par e-mail.
export const { GET, POST, PUT, DELETE, PATCH } = neonAuth.handler();
