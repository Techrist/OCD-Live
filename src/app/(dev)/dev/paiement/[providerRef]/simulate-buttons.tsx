"use client";

import { useEffect, useRef } from "react";

export function SimulateButtons({ providerRef, returnUrl, autoFail }: { providerRef: string; returnUrl: string; autoFail: boolean }) {
  async function simulate(status: "SUCCEEDED" | "FAILED") {
    await fetch("/api/dev/simulate-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerRef, status }),
    });
    window.location.href = returnUrl;
  }
  const done = useRef(false);
  useEffect(() => {
    // Numéro finissant par 0000 : échec automatique.
    if (autoFail && !done.current) {
      done.current = true;
      void simulate("FAILED");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cls = "min-h-16 w-full rounded-2xl px-5 text-xl font-extrabold text-white";
  return (
    <div className="flex flex-col gap-3">
      <button type="button" className={`${cls} bg-green-700`} onClick={() => simulate("SUCCEEDED")}>
        Simuler la réussite
      </button>
      <button type="button" className={`${cls} bg-red-700`} onClick={() => simulate("FAILED")}>
        Simuler l&apos;échec
      </button>
    </div>
  );
}
