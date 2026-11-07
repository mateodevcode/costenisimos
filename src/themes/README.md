# Sistema de diseños (temas)

La página principal (`/`) y el menú (`/menu`) se dibujan con un **tema intercambiable** que el administrador elige en
`/master/configuracion`. Hay dos *slots* independientes, con tres temas cada uno:

| id | Portada (`home_theme`) | Menú (`menu_theme`) |
|---|---|---|
| `a` | **Tropical** — azul de la caja de domicilios, hojas de colores, fotos en arco, sello girado y olas | **Tropical** — pestañas por categoría con indicador animado y tarjetas en arco |
| `b` | **Papel kraft** — papel con grano, polaroids con cinta, follaje a línea y frases a mano | **Papel kraft** — una hoja de papel por categoría, puntos guía y polaroid al pasar el cursor |
| `c` | **Lo auténtico** — la pared verde oliva del local, letrero que se escribe, lámpara de mimbre y sello naranja | **Carta impresa** — como las cartas físicas: banda ondulada naranja, plato oscuro y precio en rosado |

Las portadas `a` y `b` son la plantilla `costenisimos-web` (opciones 1 y 2) pasada a JSX + Tailwind; los menús y la
línea `c` se diseñaron a partir de las fotos del restaurante. Si el id guardado no existe, se usa el primero.

El **header, el footer y el fondo** de todo el sitio público siguen al tema de portada activo (`src/components/public/pieles.js`).

## Contrato de props

Todos los temas de un mismo slot reciben **exactamente** las mismas props, ya cargadas y serializadas a JSON plano
(ids como `string`). Un tema **nunca** hace `fetch` ni lee contexto global.

### Portada

```js
{ site, menuInfo, destacados }
```

- `site`: datos del restaurante (`nombre`, `slogan`, `descripcion`, `telefono`, `email`, `direccion`, `mapsQuery`,
  `whatsapp[{numero,mensaje}]`, `redes{instagram,facebook,tiktok}`, `logoUrl`, `colorPrimario`, `colorSecundario`,
  `zonaHoraria`, `moneda`, `nosotros`, `politicas`).
- `menuInfo`: `{ horarioCocina, menuDesayuno, menuDia, menuNoche, alergenos }`.
- `destacados`: hasta 6 productos para "Favoritos de la casa" (uno por categoría en el orden de la carta, disponibles
  y con foto), con la misma forma que en el menú más `categoriaNombre`. Puede venir vacío: cada portada tiene un respaldo.

### Menú

```js
{ categorias, productos, ingredientes, site, menuInfo }
```

- `categorias`: `[{ id, nombre, slug, imagen, position }]`, **ordenadas por `position`**.
- `productos`: `[{ id, nombre, precio, image, categoria /* id */, descripcion, ingredientes /* ids */, disponibilidad, menus }]`.
- `ingredientes`: `[{ id, nombre, cantidad, imagen }]`.

## Piezas reutilizables

| Archivo | Qué trae |
|---|---|
| `marca/Logo.jsx` | Logotipo en SVG (hereda el color) con subtítulo "Restaurante" opcional |
| `marca/Follaje.jsx` | `Ramo` (hojas, palmas, flores y sandía con vaivén) y `RamoTinta` (follaje a línea que se dibuja) |
| `marca/formas.jsx` | `Ola`, `SelloOndulado`, `BannerOndulado` y `Arco` |
| `marca/anim.jsx` | `Revelar`, `Escalonado` + `EscalonadoItem`, `Parallax`, `GiroScroll`, `TrazoDibujado` |
| `marca/autentico.jsx` | `LamparaMimbre`, `Letrero` (palabra por palabra) y `Franja` (texto continuo) |
| `marca/contacto.jsx` | `CopiarNumero` y `ReservaWhatsApp` (formulario que abre WhatsApp; no crea reservas en el sistema) |
| `marca/datos.js` | WhatsApp principal, horarios, mapa, imágenes de marca (`public/marca/`) y galería |
| `menu/comun.jsx` | `useFiltrosMenu` (tipo de menú por hora, categoría y búsqueda), `DetalleProducto`, `Precio`… |
| `fuentes.js` | Fraunces, Nunito, Young Serif, Figtree, Caveat, Anton y Yellowtail (`font-fraunces`, `font-anton`…) |

**Colores:** paleta de marca como utilidades de Tailwind (`bg-navy`, `text-sun`, `bg-mango`, `text-hibiscus`, `bg-leaf`,
`bg-paper`, `bg-kraft`, `bg-olive`…) y texturas `grano-kraft`, `puntos-navy` y `muro-olivo` (en `globals.css`).

**Animaciones:** Motion (`motion/react`). Todas respetan `prefers-reduced-motion`: con "reducir movimiento" activado
el contenido aparece sin desplazamientos.

## Añadir un diseño nuevo en 3 pasos

1. **Crear el componente** en `src/themes/home/MiPortada.jsx` (o `src/themes/menu/MiMenu.jsx`) con `export default`
   y el contrato de props de su slot. Si es interactivo, `"use client"`.
2. **Registrarlo**: añade `{ id, nombre, descripcion }` en `src/themes/ids.js` y la entrada con
   `Componente: dynamic(() => import("./home/MiPortada"))` en `src/themes/registry.js`. Para una portada, añade
   también su piel en `src/components/public/pieles.js` (si no, usa la tropical).
3. **Listo**: aparece en `/master/configuracion` con su botón "Activar". La API valida el id contra `ids.js`.
