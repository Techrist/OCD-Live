import { ImageResponse } from "next/og";
import { AFRICA_PATH, AFRICA_VIEWBOX, LOGO_LIVE_PATH, LOGO_OCD_PATH, LOGO_VIEWBOX } from "@/components/brand/brand-paths";

export const alt = "OCD Live";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const svg = (viewBox: string, body: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`)}`;

// Image de partage (WhatsApp, TikTok, Google) : la carte lumineuse et le logo OCD Live.
export default function OgImage() {
  const map = svg(AFRICA_VIEWBOX, `<path d="${AFRICA_PATH}" fill="#F4F1EC" stroke="#F6B24A" stroke-width="7" stroke-linejoin="round"/>`);
  const logo = svg(
    LOGO_VIEWBOX,
    `<path fill="#C76524" fill-rule="evenodd" d="${LOGO_OCD_PATH}"/><path fill="#0A0A10" fill-rule="evenodd" d="${LOGO_LIVE_PATH}"/>`,
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg,#F8F4EF,#E7DFD6)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={map} width={560} height={567} alt="" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={300} height={160} alt="" style={{ position: "absolute", left: 470, top: 250 }} />
      </div>
    ),
    size,
  );
}
