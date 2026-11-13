import { setRequestLocale } from "next-intl/server";
import { ResumeRedirect } from "@/components/booking/resume-redirect";

export default async function ReserverIndex({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <ResumeRedirect />;
}
