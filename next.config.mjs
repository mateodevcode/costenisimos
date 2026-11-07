/** Hosts de imágenes permitidos para next/image: el bucket/CDN configurado + S3/CloudFront genéricos. */
function patronesImagenes() {
  const patrones = [
    { protocol: "https", hostname: "**.amazonaws.com" },
    { protocol: "https", hostname: "**.cloudfront.net" },
  ];
  try {
    if (process.env.AWS_S3_PUBLIC_URL) {
      const { protocol, hostname } = new URL(process.env.AWS_S3_PUBLIC_URL);
      patrones.unshift({ protocol: protocol.replace(":", ""), hostname });
    }
  } catch {
    // URL inválida: se usan los patrones genéricos.
  }
  return patrones;
}

const prod = process.env.NODE_ENV === "production";

/**
 * CSP: permite Google Identity Services (login con Google), Google Maps (iframe) e imágenes https
 * (bucket S3/CloudFront, logo configurable y fotos de perfil de Google).
 * 'unsafe-inline' en scripts es necesario para los scripts de hidratación de Next sin nonces.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${prod ? "" : " 'unsafe-eval'"} https://accounts.google.com/gsi/client`,
  "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://accounts.google.com/gsi/${prod ? "" : " ws: wss:"}`,
  "frame-src https://accounts.google.com/gsi/ https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(prod ? ["upgrade-insecure-requests"] : []),
].join("; ");

const cabecerasSeguridad = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Necesario para que el popup de Google Sign-In pueda comunicarse con la ventana.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  ...(prod ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: cabecerasSeguridad }];
  },
  images: {
    remotePatterns: patronesImagenes(),
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
