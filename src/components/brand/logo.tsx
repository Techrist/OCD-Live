import { LOGO_LIVE_PATH, LOGO_OCD_PATH, LOGO_VIEWBOX } from "./brand-paths";

type Props = { className?: string; tone?: "color" | "white"; title?: string };

/** Logo OCD Live en SVG inline (cuivre + « Live » noir), vectorisé depuis le mur du studio. */
export function Logo({ className, tone = "color", title = "OCD Live" }: Props) {
  const ocd = tone === "white" ? "#fff" : "var(--ocd-copper)";
  const live = tone === "white" ? "#fff" : "var(--ocd-ink)";
  return (
    <svg viewBox={LOGO_VIEWBOX} role="img" aria-label={title} className={className}>
      <path fill={ocd} fillRule="evenodd" d={LOGO_OCD_PATH} />
      <path fill={live} fillRule="evenodd" d={LOGO_LIVE_PATH} />
    </svg>
  );
}
