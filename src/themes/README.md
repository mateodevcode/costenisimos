# Sistema de diseños (temas)

La página principal (`/`) y el menú (`/menu`) se dibujan con un **tema intercambiable** que el administrador elige en
`/master/configuracion`. Hay dos *slots* independientes:

| Slot | Clave en `Configuracion` | Temas incluidos |
|---|---|---|
| Página principal | `home_theme` | `a` (Home A), `b` (Home B) |
| Menú | `menu_theme` | `a` (cuadrícula con filtros), `b` (lista tipo carta), `c` (editorial por categorías) |

Si el id guardado no existe, se usa el primero de la lista.

## Contrato de props

Todos los temas de un mismo slot reciben **exactamente** las mismas props, ya cargadas y serializadas a JSON plano
(ids como `string`). Un tema **nunca** hace `fetch` ni lee contexto global.

### Home

```js
{ site, menuInfo }
```

- `site`: datos del restaurante (`nombre`, `slogan`, `descripcion`, `telefono`, `email`, `direccion`, `mapsQuery`,
  `whatsapp[{numero,mensaje}]`, `redes{instagram,facebook,tiktok}`, `logoUrl`, `colorPrimario`, `colorSecundario`,
  `zonaHoraria`, `moneda`, `nosotros`, `politicas`).
- `menuInfo`: `{ horarioCocina, menuDesayuno, menuDia, menuNoche, alergenos }`.

### Menú

```js
{ categorias, productos, ingredientes, site, menuInfo }
```

- `categorias`: `[{ id, nombre, slug, imagen, position }]`, **ordenadas por `position`**.
- `productos`: `[{ id, nombre, precio, image, categoria /* id */, descripcion, ingredientes /* ids */, disponibilidad, menus }]`.
- `ingredientes`: `[{ id, nombre, cantidad, imagen }]`.
- Helpers útiles: `agruparPorCategoria` (`src/lib/catalogo.js`, servidor), `useFiltrosMenu`, `DetalleProducto`, `Precio`
  (`src/themes/menu/comun.jsx`), `menuPorHora` y `perteneceAMenu` (`src/lib/constants.js`), `formatearPrecio` (`src/lib/utils.js`).

### Colores

Los colores de marca llegan como variables CSS inyectadas por el layout público y están disponibles como utilidades de
Tailwind: `bg-brand`, `text-brand-foreground`, `bg-brand-2`, `text-brand-2-foreground`, `border-brand`, etc.
Fuentes: `font-display` (títulos) y `font-sans` (texto).

### Server o client

Los temas pueden ser Server Components (Home A/B) o llevar `"use client"` si necesitan interactividad (Menú A/B/C).
Como las props son serializables, ambos funcionan con `next/dynamic`.

## Añadir un diseño nuevo en 3 pasos

1. **Crear el componente** en `src/themes/home/HomeC.jsx` (o `src/themes/menu/MenuD.jsx`) con `export default` y el
   contrato de props de su slot.
2. **Registrarlo**: añade `{ id, nombre, descripcion }` en `src/themes/ids.js` y la entrada con
   `Componente: dynamic(() => import("./home/HomeC"))` en `src/themes/registry.js`.
3. **Listo**: aparece en `/master/configuracion` con su botón "Activar". La API valida el id contra `ids.js`.
