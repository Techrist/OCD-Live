import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Variant = "copper" | "ink" | "light";

type Props = {
  href: string;
  icon: ReactNode;
  label: string;
  hint?: string;
  variant?: Variant;
  className?: string;
};

const variants: Record<Variant, string> = {
  copper: "grad-btn",
  ink: "bg-ink text-white shadow-[0_14px_28px_-12px_rgba(10,10,16,0.7)]",
  light: "soft text-ink",
};

export const bigButtonClass = (variant: Variant = "copper", className?: string) =>
  cn(
    "flex min-h-20 w-full items-center gap-4 rounded-[2rem] px-4 py-3 text-left transition active:scale-[0.99]",
    variants[variant],
    className,
  );

function Inner({ icon, label, hint, variant }: Pick<Props, "icon" | "label" | "hint" | "variant">) {
  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "grid size-14 shrink-0 place-items-center rounded-full [&>svg]:size-7",
          variant === "light" ? "bg-wall-2 text-copper-800" : "bg-white text-copper-800 shadow-md",
        )}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="text-xl leading-tight font-bold">{label}</span>
        {hint && <span className="pill">{hint}</span>}
      </span>
      <ChevronRight aria-hidden="true" className="size-6 shrink-0 opacity-80" />
    </>
  );
}

/** Gros bouton plein écran : icône + 2 à 4 mots (≥ 48 px de haut, cf. section 3). */
export function BigActionButton({ href, variant, className, ...rest }: Props) {
  return (
    <Link href={href} className={bigButtonClass(variant, className)}>
      <Inner variant={variant} {...rest} />
    </Link>
  );
}

/** Même bouton quand l'action n'est pas un lien (enregistrer un choix puis avancer). */
export function BigChoiceButton({
  onClick,
  variant,
  className,
  ...rest
}: Omit<Props, "href"> & { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={bigButtonClass(variant, className)}>
      <Inner variant={variant} {...rest} />
    </button>
  );
}
