const HEX = /^#[0-9a-f]{6}$/i;

function luminancia(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Color de texto legible (blanco o casi negro) sobre un fondo hex. */
export function textoSobre(hex) {
  if (!HEX.test(hex || "")) return "#ffffff";
  return luminancia(hex) > 0.45 ? "#1c1917" : "#ffffff";
}

/** Variables CSS de marca a partir de site.colorPrimario/colorSecundario. */
export function variablesMarca(site) {
  const primario = HEX.test(site?.colorPrimario || "") ? site.colorPrimario : "#c2410c";
  const secundario = HEX.test(site?.colorSecundario || "") ? site.colorSecundario : "#14532d";
  return {
    "--brand": primario,
    "--brand-foreground": textoSobre(primario),
    "--brand-2": secundario,
    "--brand-2-foreground": textoSobre(secundario),
  };
}
