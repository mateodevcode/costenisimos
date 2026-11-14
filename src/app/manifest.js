/** Manifiesto web: nombre, colores e ícono al guardar el sitio en el celular. */
export default function manifest() {
  return {
    name: "Costeñísimos · Restaurante de comida costeña en Envigado",
    short_name: "Costeñísimos",
    description: "Comida costeña en Envigado, Medellín. Carta, domicilios y reservas.",
    start_url: "/",
    display: "standalone",
    lang: "es-CO",
    background_color: "#FBF4E8",
    theme_color: "#5c6b45",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
