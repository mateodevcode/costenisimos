// "Piel" del sitio público: el header, el footer y el fondo siguen al tema de portada activo,
// así todas las páginas (menú, nosotros, políticas…) se ven coherentes con la portada.

export const PIEL_POR_TEMA = { a: "tropical", b: "kraft", c: "autentico" };

export function pielDe(homeTheme) {
  return PIEL_POR_TEMA[homeTheme] ?? "tropical";
}

export const PIELES = {
  tropical: {
    fondo: "bg-paper text-navy",
    header: "bg-navy text-cream border-b border-cream/15",
    enlace: "text-cream/85 hover:text-cream decoration-sun",
    enlaceActivo: "text-cream underline decoration-sun decoration-2 underline-offset-8",
    cta: "bg-sun text-navy hover:bg-sun-hi",
    footer: "bg-navy text-cream puntos-navy",
    footerSuave: "text-cream-soft",
    footerBorde: "border-cream/15",
    redes: "bg-cream/10 text-cream hover:bg-cream/20",
    logo: "text-cream",
  },
  kraft: {
    fondo: "grano-kraft text-navy",
    header: "bg-paper/95 text-navy border-b border-navy/20 backdrop-blur",
    enlace: "text-navy/80 hover:text-navy decoration-hibiscus",
    enlaceActivo: "text-navy underline decoration-hibiscus decoration-2 underline-offset-8",
    cta: "bg-navy text-cream hover:bg-navy-deep",
    footer: "bg-navy text-cream",
    footerSuave: "text-cream-soft",
    footerBorde: "border-cream/15",
    redes: "bg-cream/10 text-cream hover:bg-cream/20",
    logo: "text-navy",
  },
  autentico: {
    fondo: "bg-cream text-olive-deep",
    header: "muro-olivo text-cream border-b border-black/15",
    enlace: "text-cream/85 hover:text-cream decoration-mango",
    enlaceActivo: "text-cream underline decoration-mango decoration-2 underline-offset-8",
    cta: "bg-mango text-white hover:bg-[#e07a14]",
    footer: "bg-olive-deep text-cream",
    footerSuave: "text-cream/70",
    footerBorde: "border-cream/15",
    redes: "bg-cream/10 text-cream hover:bg-cream/20",
    logo: "text-sun",
  },
};
