// SEO local de Costeñísimos: datos del negocio, URLs absolutas y datos estructurados (schema.org).
// Lo que cambia poco (ubicación exacta, horario, tipo de cocina) vive aquí; nombre, teléfono,
// dirección y redes salen de la configuración del panel.

/** URL pública del sitio (sin "/" final). En producción viene de APP_URL. */
export function urlBase() {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");
}

export const absoluta = (ruta = "/") => `${urlBase()}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;

export const SEO = {
  // Ficha de Google Maps del local (Place ID ChIJOyQx6OyDRo4RvCEsfJ6L9bg).
  geo: { lat: 6.1659934, lng: -75.5897317 },
  direccion: {
    calle: "Calle 40 DD Sur #41A-17",
    barrio: "El Dorado",
    ciudad: "Envigado",
    region: "Antioquia",
    codigoRegion: "CO-ANT",
    codigoPostal: "055421",
    pais: "CO",
  },
  mapsUrl: "https://www.google.com/maps/place/?q=place_id:ChIJOyQx6OyDRo4RvCEsfJ6L9bg",
  // Horario de cocina (Configuración → Horarios). Si cambia allá, actualizarlo aquí.
  horario: { dias: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], abre: "07:00", cierra: "22:00" },
  rangoPrecios: "$20.000 - $40.000 COP",
  cocina: ["Comida costeña", "Comida colombiana", "Comida caribeña", "Fritos", "Empanadas", "Salchipapas"],
  zonas: ["Envigado", "Medellín", "Sabaneta", "Itagüí", "Valle de Aburrá", "Antioquia"],
  imagen: "/marca/nuestra-identidad.jpeg",
  titulo: "Restaurante de comida costeña en Envigado, Medellín",
  descripcion:
    "Comida costeña en Envigado, cerca de Medellín: empanadas, fritos, salchipapas, almuerzos y sabores del Caribe colombiano. Ven a El Dorado, pide a domicilio o reserva por WhatsApp.",
  palabrasClave: [
    "restaurante costeño Envigado",
    "comida costeña Medellín",
    "comida costeña Envigado",
    "restaurante en El Dorado Envigado",
    "empanadas costeñas Medellín",
    "fritos costeños",
    "salchipapas Envigado",
    "almuerzos Envigado",
    "comida caribeña Medellín",
    "comida típica colombiana Antioquia",
    "restaurante con domicilio Envigado",
  ],
};

/**
 * Imagen para compartir (app/opengraph-image.jsx). Se declara explícita porque cada página que
 * define su propio `openGraph` reemplaza el del layout y perdería la imagen.
 */
export const OG_IMAGEN = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Costeñísimos, restaurante de comida costeña en Envigado, Medellín",
};

/** Teléfono en formato internacional (+57…) a partir de WhatsApp o teléfono del sitio. */
function telefonoE164(site) {
  const crudo = site?.whatsapp?.find((w) => w?.numero)?.numero || site?.telefono || "";
  const d = String(crudo).replace(/\D/g, "");
  if (!d) return undefined;
  return `+${d.length === 10 ? `57${d}` : d}`;
}

const redesDe = (site) => Object.values(site?.redes || {}).filter((u) => typeof u === "string" && /^https?:\/\//.test(u));

/** JSON-LD del restaurante (LocalBusiness → Restaurant). */
export function jsonLdRestaurante(site) {
  const url = absoluta("/");
  const telefono = telefonoE164(site);
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${url}#restaurante`,
    name: site.nombre,
    alternateName: ["Costeñísimos", "Costeñisimos Restaurante", "Costeñísimos Envigado"],
    slogan: "Full sabor a pueblo",
    description: SEO.descripcion,
    url,
    image: [absoluta(SEO.imagen), absoluta("/opengraph-image")],
    logo: site.logoUrl || absoluta("/opengraph-image"),
    ...(telefono ? { telephone: telefono } : {}),
    ...(site.email ? { email: site.email } : {}),
    priceRange: SEO.rangoPrecios,
    currenciesAccepted: "COP",
    servesCuisine: SEO.cocina,
    acceptsReservations: true,
    hasMenu: absoluta("/menu"),
    address: {
      "@type": "PostalAddress",
      streetAddress: `${SEO.direccion.calle}, ${SEO.direccion.barrio}`,
      addressLocality: SEO.direccion.ciudad,
      addressRegion: SEO.direccion.region,
      postalCode: SEO.direccion.codigoPostal,
      addressCountry: SEO.direccion.pais,
    },
    geo: { "@type": "GeoCoordinates", latitude: SEO.geo.lat, longitude: SEO.geo.lng },
    hasMap: SEO.mapsUrl,
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: SEO.horario.dias, opens: SEO.horario.abre, closes: SEO.horario.cierra },
    ],
    areaServed: SEO.zonas.map((name) => ({ "@type": "City", name })),
    ...(redesDe(site).length ? { sameAs: redesDe(site) } : {}),
  };
}

/** JSON-LD de la carta (Menu → MenuSection → MenuItem con precio en COP). */
export function jsonLdMenu(site, { categorias, productos }) {
  const porCategoria = new Map(categorias.map((c) => [c.id, []]));
  for (const p of productos) porCategoria.get(p.categoria)?.push(p);
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${absoluta("/menu")}#carta`,
    name: `Carta de ${site.nombre}`,
    url: absoluta("/menu"),
    inLanguage: "es-CO",
    isPartOf: { "@id": `${absoluta("/")}#restaurante` },
    hasMenuSection: categorias
      .filter((c) => porCategoria.get(c.id)?.length)
      .map((c) => ({
        "@type": "MenuSection",
        name: c.nombre,
        hasMenuItem: porCategoria.get(c.id).map((p) => ({
          "@type": "MenuItem",
          name: p.nombre,
          ...(p.descripcion ? { description: p.descripcion } : {}),
          ...(p.image ? { image: p.image } : {}),
          offers: {
            "@type": "Offer",
            price: p.precio,
            priceCurrency: site.moneda || "COP",
            availability: p.disponibilidad ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          },
        })),
      })),
  };
}

/** Script JSON-LD seguro (escapa "<" para evitar inyección de HTML). */
export function JsonLd({ datos }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\\u003c") }} />
  );
}
