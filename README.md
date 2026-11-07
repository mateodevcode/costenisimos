# Costeñisimos — Carta digital (Next.js)

Carta digital del restaurante Costeñisimos, con panel de administración. El proyecto es reutilizable para otros
restaurantes (ver "Checklist por restaurante"). El cliente ve el catálogo; el staff lo administra.
No hay pedidos de ningún tipo.

- **Next.js 16** (App Router, Cache Components, `proxy.js`), React 19, JavaScript ESM con alias `@/` → `src/`.
- **Tailwind CSS 4** + shadcn/ui (Radix), lucide-react, sonner, motion.
- **MongoDB + Mongoose** (conexión cacheada en `globalThis`).
- Auth propia: `jose` (JWT), `bcryptjs` (12 rondas), `google-auth-library`.
- Imágenes: **AWS S3** (`@aws-sdk/client-s3`) + `sharp` (WebP, máx. 1280/800 px).
- Correo: `nodemailer` con SMTP de Brevo.
- Validación en servidor: `zod`. Tablas: `@tanstack/react-table` v9. Drag & drop: `@dnd-kit`.

## Requisitos

- Node.js **22 o superior** (probado con 24).
- Una base MongoDB (Atlas o propia).
- Bucket S3 con lectura pública de objetos (o CloudFront delante).
- Cuenta Brevo con SMTP habilitado.
- (Opcional) Cliente OAuth de Google para "Continuar con Google".

## Instalación

```bash
npm install
cp .env.example .env.local   # y completa los valores
npm run seed                 # superadmin + configuración inicial + índices (idempotente)
npm run dev                  # http://localhost:3000
```

Producción:

```bash
npm run build
npm start
```

`npm run build` **no necesita la base de datos**: todas las lecturas de datos ocurren en tiempo de petición
(con caché en memoria invalidada por tags), así el build funciona en CI sin secretos.

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `MONGODB_URI` | sí | Cadena de conexión de MongoDB. |
| `APP_URL` | sí | URL pública sin barra final (ej. `https://carta.midominio.com`). Se usa para la protección CSRF (Origin) y los enlaces del correo. En local: `http://localhost:3000`. |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | sí | Mínimo 32 caracteres y distintos entre sí. Genera con `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. |
| `GOOGLE_CLIENT_ID` / `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | para Google | El mismo Client ID en ambas. Sin ellas el botón de Google no aparece. |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | para imágenes | Credenciales de un usuario IAM con `s3:PutObject` y `s3:DeleteObject` sobre el bucket. |
| `AWS_S3_BUCKET` | para imágenes | Nombre del bucket. |
| `AWS_S3_FOLDER` | no | Prefijo dentro del bucket, uno por restaurante (default `carta`). |
| `AWS_S3_PUBLIC_URL` | para imágenes | URL pública base sin barra final: `https://<bucket>.s3.<region>.amazonaws.com` o tu dominio de CloudFront. También se lee en el build para autorizar el host en `next/image`. |
| `BREVO_SMTP_EMAIL`, `BREVO_SMTP_PASS` | para correo | Login y clave SMTP de Brevo. |
| `MAIL_FROM_NAME`, `MAIL_FROM_ADDRESS` | para correo | Remitente (la dirección debe estar verificada en Brevo). |
| `SEED_SUPERADMIN_EMAIL`, `SEED_SUPERADMIN_PASSWORD` | para el seed | Cuenta superadmin inicial; la contraseña debe cumplir la política. |

`src/lib/env.js` valida las variables al usarse y falla con un mensaje claro si falta alguna.

> **Nunca** pongas valores reales en `.env.example` (se sube al repositorio). Van en `.env.local` o en el panel del hosting.

### Política del bucket S3 (lectura pública)

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::NOMBRE-DEL-BUCKET/*"
  }]
}
```

(Desactiva "Block all public access" para esa política, o sirve el bucket privado mediante CloudFront con OAC y usa su
dominio en `AWS_S3_PUBLIC_URL`.)

## Rutas

**Públicas:** `/` (tema de inicio) · `/menu` (tema de menú) · `/nosotros` · `/politicas-de-privacidad` ·
`/olvidaste-tu-contrasena` · `/restablecer-contrasena`. `/?login=1` abre el modal de login.

**Panel** (`/master`, roles `empleado`, `admin`, `superadmin`):

| Vista | Ruta | Roles |
|---|---|---|
| Disponibilidad | `/master/disponibilidad` | empleado, admin, superadmin |
| Catálogo | `/master/catalogo` | admin, superadmin |
| Ordenar categorías | `/master/ordenar-categorias` | admin, superadmin |
| Inventario | `/master/buscar` | empleado, admin, superadmin |
| Usuarios | `/master/usuarios` | admin (lectura), superadmin (bloqueo y rol) |
| Registros | `/master/registros` | admin, superadmin |
| Configuración | `/master/configuracion` | admin, superadmin |

**API** (respuestas `{ success, message, data }`):

| Endpoint | Métodos | Acceso |
|---|---|---|
| `/api/auth/login` · `logout` · `refresh` · `google` | POST | público |
| `/api/auth/me` | GET | sesión |
| `/api/auth/password/generar-codigo` · `validar-codigo` · `restablecer` | POST | público |
| `/api/usuarios` | GET (staff) · POST (registro público) | — |
| `/api/usuarios/[id]` | GET · PUT · DELETE | dueño o admin |
| `/api/usuarios/cambiar-password` | POST | sesión |
| `/api/admin/usuarios/[id]` | PATCH `{bloqueado?, role?}` | superadmin |
| `/api/categorias` | GET público · POST/PUT (multipart) · DELETE `?id=` | admin |
| `/api/categorias/ordenar` | PUT `{orden:[ids]}` | admin |
| `/api/productos` | GET público · POST/PUT (multipart) · DELETE `?id=` | admin |
| `/api/productos/[id]/disponibilidad` | PATCH `{disponibilidad}` | empleado+ |
| `/api/ingredientes` | GET público · POST/PUT (multipart) · DELETE `?id=` | admin |
| `/api/configuracion` | GET público · PATCH `{updates:[{key,value}]}` | admin |
| `/api/configuracion/imagen` | POST multipart `{tipo: logo|nosotros, file}` | admin |
| `/api/registros` | GET `?entidad&accion&desde&hasta&limite` | admin |

## Seguridad (resumen)

- Cookies httpOnly `access_token` (15 min, `/`) y `refresh_token` (7 días, solo `/api/auth`), `sameSite=lax`, `secure` en producción.
- Rotación de refresh con detección de reutilización (revoca todas las sesiones del usuario).
- 5 fallos de login seguidos bloquean la cuenta; se desbloquea restableciendo la contraseña o por un superadmin.
- Rate limit en Mongo: login, registro, OTP y mutaciones del panel (60/min por usuario).
- Toda mutación exige `Origin` igual a `APP_URL` (además de `sameSite=lax`).
- Todo body/query pasa por zod; los errores 500 nunca exponen detalles internos.
- Cabeceras: CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS en producción.
- El proxy (`src/proxy.js`) solo valida el JWT para `/master`; `app/master/layout.jsx` verifica rol y bloqueo contra la BD.

## Cómo añadir un tema

Ver [`src/themes/README.md`](src/themes/README.md): crear el componente, registrarlo en `ids.js` + `registry.js`, listo.

## Despliegue (Vercel u otro host Node)

1. Configura todas las variables de entorno en el hosting (`APP_URL` con el dominio final).
2. Build: `npm run build`; arranque: `npm start` (o el preset de Next.js en Vercel).
3. Ejecuta `npm run seed` una vez apuntando a la base de producción (desde tu equipo con `.env.local` de producción, o un job).
4. En Google Cloud Console agrega el dominio a "Orígenes autorizados de JavaScript" del Client ID.
5. Verifica el dominio/remitente en Brevo.

> En Vercel el cuerpo de una petición está limitado a ~4,5 MB. El panel reduce las imágenes en el navegador
> (máx. 2000 px) antes de subirlas, por lo que el límite de 10 MB rara vez se alcanza; el servidor vuelve a optimizarlas con sharp.

## Checklist por restaurante

- [ ] **Dominio** y `APP_URL` con ese dominio (sin barra final).
- [ ] **Base de datos** propia (`MONGODB_URI`) y `npm run seed` con el correo del superadmin del cliente.
- [ ] **Secretos JWT** nuevos (no reutilizar entre restaurantes).
- [ ] **Google OAuth**: Client ID nuevo o el dominio añadido como origen autorizado.
- [ ] **S3**: `AWS_S3_FOLDER` con el nombre del restaurante (o bucket propio) y `AWS_S3_PUBLIC_URL`.
- [ ] **Brevo**: remitente verificado, `MAIL_FROM_NAME` y `MAIL_FROM_ADDRESS` del restaurante.
- [ ] **Configuración** en `/master/configuracion`: nombre, logo, colores, WhatsApp, redes, horarios, moneda, zona horaria, textos de Nosotros.
- [ ] **Textos legales**: razón social, NIT y correo en Configuración; revisar `src/app/(public)/politicas-de-privacidad/page.jsx` con asesor legal.
- [ ] **Tipos de menú** (`MENU_TIPOS` en `src/lib/constants.js`) si el restaurante usa otros horarios o nombres.
- [ ] Diseños de inicio y menú elegidos.

## Dependencias añadidas fuera de la lista original

- `server-only`: impide importar por error módulos de servidor (BD, secretos) en componentes cliente.
- `@aws-sdk/client-s3`: reemplaza ImageKit por decisión del proyecto (imágenes en S3).
- `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `input-otp`: requeridas por los componentes de shadcn/ui.
