import { Suspense } from "react";
import { connection } from "next/server";
import { getSite } from "@/lib/config";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Política de privacidad",
  description: "Política de tratamiento de datos personales.",
};

// REVISAR CON ASESOR LEGAL
// Plantilla base de tratamiento de datos personales (Colombia, Ley 1581 de 2012 y Decreto 1377 de 2013).
// Los datos variables salen de site.politicas y site; el texto puede ajustarse aquí por restaurante.

function Seccion({ titulo, children }) {
  return (
    <section className="grid gap-3">
      <h2 className="font-display text-xl font-semibold text-foreground">{titulo}</h2>
      {children}
    </section>
  );
}

async function Contenido() {
  await connection();
  const site = await getSite();
  const p = site.politicas || {};
  const responsable = p.razonSocial || site.nombre;
  const correo = p.correoContacto || site.email;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-14 md:py-20">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Política de privacidad y tratamiento de datos personales</h1>
      <div className="mt-8 grid gap-8 leading-relaxed text-muted-foreground">
        <Seccion titulo="1. Responsable del tratamiento">
          <p>
            <strong className="text-foreground">{responsable}</strong>
            {p.nit && <> , identificado con NIT {p.nit}</>}
            {site.direccion && <>, con domicilio en {site.direccion}</>}, es responsable del tratamiento de los datos personales que se recolectan a
            través de este sitio web.
          </p>
          {(correo || site.telefono) && (
            <p>
              Canales de contacto: {correo && <a href={`mailto:${correo}`} className="text-foreground underline underline-offset-4">{correo}</a>}
              {correo && site.telefono && " · "}
              {site.telefono}
            </p>
          )}
        </Seccion>

        <Seccion titulo="2. Datos que recolectamos">
          <p>Cuando creas una cuenta o actualizas tu perfil recolectamos únicamente:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Nombre.</li>
            <li>Correo electrónico.</li>
            <li>Teléfono (opcional).</li>
            <li>Dirección y foto de perfil, solo si decides agregarlas.</li>
          </ul>
          <p>Si ingresas con Google, recibimos tu nombre, correo verificado y foto de perfil pública. No recibimos tu contraseña de Google.</p>
        </Seccion>

        <Seccion titulo="3. Finalidad">
          <ul className="list-disc space-y-1 pl-6">
            <li>Crear y administrar tu cuenta e identificarte al iniciar sesión.</li>
            <li>Enviarte códigos de verificación para recuperar tu contraseña.</li>
            <li>Atender tus solicitudes, consultas y reclamos.</li>
            <li>Cumplir obligaciones legales y mantener la seguridad del sitio.</li>
          </ul>
          <p>No vendemos ni cedemos tus datos a terceros con fines comerciales.</p>
        </Seccion>

        <Seccion titulo="4. Derechos del titular">
          <p>Como titular de los datos tienes derecho a:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Conocer, actualizar y rectificar tus datos personales.</li>
            <li>Solicitar prueba de la autorización otorgada.</li>
            <li>Ser informado sobre el uso que se ha dado a tus datos.</li>
            <li>Revocar la autorización y solicitar la supresión de tus datos.</li>
            <li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
          </ul>
          <p>
            Puedes actualizar tu perfil o eliminar tu cuenta en cualquier momento desde el menú de usuario. Para otras solicitudes escríbenos
            {correo ? (
              <>
                {" "}a <a href={`mailto:${correo}`} className="text-foreground underline underline-offset-4">{correo}</a>
              </>
            ) : (
              " por nuestros canales de contacto"
            )}
            . Responderemos consultas en un máximo de diez (10) días hábiles y reclamos en un máximo de quince (15) días hábiles.
          </p>
        </Seccion>

        <Seccion titulo="5. Cookies">
          <p>
            Usamos únicamente cookies técnicas de sesión, necesarias para mantenerte conectado de forma segura (son httpOnly y no se usan para
            publicidad ni seguimiento). Si ingresas con Google, Google puede usar sus propias cookies según su política.
          </p>
        </Seccion>

        <Seccion titulo="6. Seguridad y conservación">
          <p>
            Las contraseñas se almacenan cifradas con algoritmos de un solo sentido y el acceso a la información está restringido al personal
            autorizado. Conservamos tus datos mientras tu cuenta esté activa o mientras sea necesario para cumplir obligaciones legales.
          </p>
        </Seccion>

        {p.textoExtra && (
          <Seccion titulo="7. Información adicional">
            <p className="whitespace-pre-line">{p.textoExtra}</p>
          </Seccion>
        )}
      </div>
    </main>
  );
}

export default function PoliticasPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto my-14 h-[70dvh] w-[calc(100%-2rem)] max-w-3xl rounded-3xl" />}>
      <Contenido />
    </Suspense>
  );
}
