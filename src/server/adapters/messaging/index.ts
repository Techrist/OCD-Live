import "server-only";
import { db } from "@/server/db";
import { createMockMessaging } from "./mock";
import type { MessagingProvider } from "./types";

/** MESSAGING_PROVIDER=mock (défaut). Un connecteur réel WhatsApp/SMS se branche ici plus tard. */
export function getMessaging(): MessagingProvider {
  if ((process.env.MESSAGING_PROVIDER ?? "mock") !== "mock") {
    throw new Error("Aucun connecteur de messagerie réel n'est encore branché.");
  }
  return createMockMessaging(async (n) => {
    await db.notification.create({
      data: { channel: n.channel, to: n.to, template: n.template, payload: n.payload, status: "SENT", sentAt: new Date() },
    });
  });
}
