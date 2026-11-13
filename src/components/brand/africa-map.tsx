import { AFRICA_PATH, AFRICA_VIEWBOX } from "./brand-paths";
import { cn } from "@/lib/utils";

type Props = { className?: string; glow?: boolean; fill?: string; stroke?: string };

/** Motif OCD : la carte de l'Afrique rétro-éclairée du studio. Décoratif. */
export function AfricaMap({ className, glow = true, fill = "var(--ocd-wall)", stroke = "var(--ocd-amber)" }: Props) {
  return (
    <svg viewBox={AFRICA_VIEWBOX} aria-hidden="true" className={cn(glow && "africa-glow", className)}>
      <path d={AFRICA_PATH} fill={fill} stroke={stroke} strokeWidth={5} strokeLinejoin="round" fillRule="evenodd" />
    </svg>
  );
}
