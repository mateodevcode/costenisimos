import { ImageResponse } from "next/og";

// Ícono al guardar la web en la pantalla de inicio del iPhone (PNG 180×180, sin esquinas:
// iOS las redondea solo). Mismo diseño que app/icon.svg.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="180" height="180"><rect width="64" height="64" fill="#5c6b45"/><path d="M45.5 20.5A16 16 0 1 0 45.5 43.5" fill="none" stroke="#1b2a5c" stroke-width="10" stroke-linecap="round" transform="translate(2.5 2.5)"/><path d="M45.5 20.5A16 16 0 1 0 45.5 43.5" fill="none" stroke="#f2c230" stroke-width="10" stroke-linecap="round"/></svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element -- ImageResponse solo admite <img>
      <img src={`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`} width={180} height={180} alt="" />
    ),
    size
  );
}
