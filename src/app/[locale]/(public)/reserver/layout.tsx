import { ReserveExtras } from "@/components/booking/reserve-extras";

export default function ReserverLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 pt-2">{children}</div>
      <ReserveExtras />
    </>
  );
}
