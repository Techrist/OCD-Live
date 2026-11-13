export type TemplateName =
  | "otp"
  | "booking_confirmed"
  | "reminder_d1"
  | "reminder_h1"
  | "team_new_booking"
  | "subscription_confirmed"
  | "subscription_expiring"
  | "live_validated"
  | "live_rejected"
  | "waitlist_slot_free"
  | "booking_rescheduled";

export interface MessagingProvider {
  sendTemplate(input: {
    to: string;
    template: TemplateName;
    params: Record<string, string>;
    channel: "whatsapp" | "sms";
  }): Promise<{ id: string }>;
}
