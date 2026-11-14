import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Imagen que aparece al compartir el sitio en WhatsApp, Facebook, X, etc.
export const alt = "Costeñísimos, restaurante de comida costeña en Envigado, Medellín";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const foto = await readFile(join(process.cwd(), "public/marca/nuestra-identidad.jpeg"));
  const src = `data:image/jpeg;base64,${foto.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#da9100" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 700, padding: "0 64px", color: "#1B2A5C" }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 8, textTransform: "uppercase" }}>Envigado · Medellín</div>
          <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 1, marginTop: 20, color: "#FBF4E8", textShadow: "4px 4px 0 #1B2A5C" }}>
            Costeñísimos
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.15, marginTop: 24 }}>El sabor de la costa más cerca de ti</div>
          <div style={{ fontSize: 26, marginTop: 28 }}>Empanadas · Fritos · Salchipapas · Almuerzos</div>
        </div>
        <div style={{ display: "flex", flex: 1, padding: 36 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse solo admite <img> */}
          <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 28, border: "10px solid #FBF4E8" }} />
        </div>
      </div>
    ),
    size
  );
}
