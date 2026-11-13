import type { ReactNode } from "react";

// Drapeaux simplifiés en SVG (pas d'emoji : Windows n'affiche pas les drapeaux emoji).
const H = (colors: string[]): ReactNode =>
  colors.map((c, i) => <rect key={i} x="0" y={(i * 24) / colors.length} width="36" height={24 / colors.length + 0.1} fill={c} />);
const V = (colors: string[]): ReactNode =>
  colors.map((c, i) => <rect key={i} x={(i * 36) / colors.length} y="0" width={36 / colors.length + 0.1} height="24" fill={c} />);
const star = (x: number, y: number, fill: string, r = 4.5): ReactNode => (
  <polygon
    fill={fill}
    points={Array.from({ length: 10 }, (_, i) => {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const rad = i % 2 === 0 ? r : r * 0.4;
      return `${(x + rad * Math.cos(a)).toFixed(2)},${(y + rad * Math.sin(a)).toFixed(2)}`;
    }).join(" ")}
  />
);

const FLAGS: Record<string, ReactNode> = {
  TG: <>{H(["#006A4E", "#FFCE00", "#006A4E", "#FFCE00", "#006A4E"])}<rect width="14.4" height="14.4" fill="#D21034" />{star(7.2, 7.2, "#fff", 4)}</>,
  CM: <>{V(["#007A5E", "#CE1126", "#FCD116"])}{star(18, 12, "#FCD116")}</>,
  BJ: <><rect width="36" height="24" fill="#E8112D" /><rect width="36" height="12" fill="#FCD116" /><rect width="14" height="24" fill="#008751" /></>,
  CI: V(["#F77F00", "#FFFFFF", "#009E60"]),
  SN: <>{V(["#00853F", "#FDEF42", "#E31B23"])}{star(18, 12, "#00853F")}</>,
  BF: <>{H(["#EF2B2D", "#009E49"])}{star(18, 12, "#FCD116", 5)}</>,
  GA: H(["#009E60", "#FCD116", "#3A75C4"]),
  CD: <><rect width="36" height="24" fill="#007FFF" /><polygon points="0,24 36,0 36,5 5,24" fill="#F7D618" /><polygon points="0,24 36,0 36,3 3,24" fill="#CE1021" />{star(7, 6, "#F7D618", 4)}</>,
  CG: <><rect width="36" height="24" fill="#FBDE4A" /><polygon points="0,0 24,0 0,24" fill="#009543" /><polygon points="36,24 12,24 36,0" fill="#DC241F" /></>,
  TD: V(["#002664", "#FECB00", "#C60C30"]),
  CF: <>{H(["#003082", "#FFFFFF", "#289728", "#FFCE00"])}<rect x="15" y="0" width="6" height="24" fill="#D21034" />{star(6, 3, "#FFCE00", 2.5)}</>,
  ML: V(["#14B53A", "#FCD116", "#CE1126"]),
  NE: <>{H(["#E05206", "#FFFFFF", "#0DB02B"])}<circle cx="18" cy="12" r="3" fill="#E05206" /></>,
  GN: V(["#CE1126", "#FCD116", "#009460"]),
};

export function Flag({ code, className }: { code: string; className?: string }) {
  return (
    <svg viewBox="0 0 36 24" aria-hidden="true" className={className ?? "h-6 w-9 rounded-sm ring-1 ring-ink/30"}>
      {FLAGS[code] ?? <rect width="36" height="24" fill="#ccc" />}
    </svg>
  );
}
