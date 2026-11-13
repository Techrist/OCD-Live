import { cn } from "@/lib/utils";

type Props = { current: number; total: number; label: string };

/** Progression visible « Étape 2/5 » : texte + barre (l'info ne repose pas sur la couleur seule). */
export function StepProgress({ current, total, label }: Props) {
  return (
    <div role="group" aria-label={label} className="soft flex w-full items-center gap-3 rounded-full px-4 py-2.5">
      <p className="shrink-0 text-sm font-bold text-copper-800">{label}</p>
      <ol className="flex flex-1 gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <li key={i} className={cn("h-2 flex-1 rounded-full", i < current ? "grad-btn !shadow-none" : "bg-ink/10")} />
        ))}
      </ol>
    </div>
  );
}
