import type { MessagingProvider } from "./types";

type Record_ = (n: { channel: string; to: string; template: string; payload: Record<string, string> }) => Promise<void>;

/** Mode simulation : écrit le message dans Notification (via `record`) et dans la console. */
export function createMockMessaging(record: Record_): MessagingProvider {
  return {
    async sendTemplate({ to, template, params, channel }) {
      console.info(`[messagerie simulée] ${channel} → ${to} : ${template}`, params);
      await record({ channel, to, template, payload: params });
      return { id: `mock_${Date.now()}` };
    },
  };
}
